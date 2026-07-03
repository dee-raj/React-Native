/**
 * useChessClock — Core game logic hook
 *
 * Manages both player timers, move counts, player switching,
 * Fischer increment, pause/resume, and game-over detection.
 *
 * Timer accuracy: uses Date.now() deltas rather than fixed-interval
 * subtraction so drift does not accumulate.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Vibration } from 'react-native';
import soundManager from '../../../shared/SoundManager';
import { saveGameResult } from '../storage/chessClockStorage';

// Game states
export const GAME_STATES = {
    IDLE: 'idle',         // Before first move
    RUNNING: 'running',
    PAUSED: 'paused',
    FINISHED: 'finished',
};

const TICK_INTERVAL = 50; // ms — update frequency for smooth countdown display

/**
 * @param {Object} config
 * @param {number} config.initialTimeMs   - starting time per player in ms
 * @param {number} config.incrementMs     - Fischer increment in ms (added after pressing)
 * @param {number} config.delayMs         - optional move delay in ms (not implemented yet)
 * @param {string} config.timeControlLabel - e.g. "5+3" for stats
 * @param {Object} config.settings        - user settings (sound, vibration, etc.)
 */
const useChessClock = ({
    initialTimeMs,
    incrementMs = 0,
    delayMs = 0,
    timeControlLabel = '',
    settings = {},
}) => {
    // ─── State ───────────────────────────────────────────────────────────────

    const [timeWhite, setTimeWhite] = useState(initialTimeMs);
    const [timeBlack, setTimeBlack] = useState(initialTimeMs);
    const [activePlayer, setActivePlayer] = useState('white'); // 'white' | 'black'
    const [gameState, setGameState] = useState(GAME_STATES.IDLE);
    const [movesWhite, setMovesWhite] = useState(0);
    const [movesBlack, setMovesBlack] = useState(0);
    const [winner, setWinner] = useState(null);

    // Refs for precise timing inside interval callbacks
    const intervalRef = useRef(null);
    const lastTickRef = useRef(null);
    const activePlayerRef = useRef('white');
    const timeWhiteRef = useRef(initialTimeMs);
    const timeBlackRef = useRef(initialTimeMs);
    const gameStartTimeRef = useRef(null);
    const gameStateRef = useRef(GAME_STATES.IDLE);

    // Keep refs in sync with state
    useEffect(() => { activePlayerRef.current = activePlayer; }, [activePlayer]);
    useEffect(() => { timeWhiteRef.current = timeWhite; }, [timeWhite]);
    useEffect(() => { timeBlackRef.current = timeBlack; }, [timeBlack]);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    // ─── Tick Logic ──────────────────────────────────────────────────────────

    const stopInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startInterval = useCallback(() => {
        stopInterval();
        lastTickRef.current = Date.now();

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const delta = now - lastTickRef.current;
            lastTickRef.current = now;

            const player = activePlayerRef.current;

            if (player === 'white') {
                const newTime = Math.max(0, timeWhiteRef.current - delta);
                timeWhiteRef.current = newTime;
                setTimeWhite(newTime);

                if (newTime <= 0) {
                    // Black wins — white's time ran out
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setGameState(GAME_STATES.FINISHED);
                    setWinner('black');
                    handleGameOver('black');
                }
            } else {
                const newTime = Math.max(0, timeBlackRef.current - delta);
                timeBlackRef.current = newTime;
                setTimeBlack(newTime);

                if (newTime <= 0) {
                    // White wins — black's time ran out
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setGameState(GAME_STATES.FINISHED);
                    setWinner('white');
                    handleGameOver('white');
                }
            }
        }, TICK_INTERVAL);
    }, [stopInterval]);

    // ─── Game Over ───────────────────────────────────────────────────────────

    const handleGameOver = useCallback(async (winnerPlayer) => {
        // Long vibration on timeout
        if (settings.vibration !== false) {
            Vibration.vibrate(500);
        }
        // Play error/timeout sound
        if (settings.sound !== false) {
            await soundManager.play('error');
        }

        // Save result
        const durationMs = gameStartTimeRef.current
            ? Date.now() - gameStartTimeRef.current
            : 0;

        await saveGameResult({
            timeControl: timeControlLabel,
            durationMs,
            winner: winnerPlayer,
            movesWhite: movesWhite,
            movesBlack: movesBlack,
        });
    }, [settings, timeControlLabel, movesWhite, movesBlack]);

    // ─── Player Actions ──────────────────────────────────────────────────────

    /**
     * Switch the active player's clock. Called when the active player
     * taps their button to end their turn.
     *
     * Fischer increment is added to the PRESSING player's time.
     */
    const switchPlayer = useCallback(() => {
        if (gameStateRef.current === GAME_STATES.FINISHED) return;

        const wasIdle = gameStateRef.current === GAME_STATES.IDLE;

        // First tap starts the game
        if (wasIdle) {
            gameStartTimeRef.current = Date.now();
            setGameState(GAME_STATES.RUNNING);
        }

        // Sound + haptic feedback
        if (settings.sound !== false) {
            soundManager.play('tap');
        }
        if (settings.vibration !== false) {
            Vibration.vibrate(30);
        }

        const current = activePlayerRef.current;

        // Add Fischer increment to the pressing player (except first move)
        if (!wasIdle && incrementMs > 0) {
            if (current === 'white') {
                const added = timeWhiteRef.current + incrementMs;
                timeWhiteRef.current = added;
                setTimeWhite(added);
                setMovesWhite((m) => m + 1);
            } else {
                const added = timeBlackRef.current + incrementMs;
                timeBlackRef.current = added;
                setTimeBlack(added);
                setMovesBlack((m) => m + 1);
            }
        } else if (!wasIdle) {
            // No increment, just count move
            if (current === 'white') {
                setMovesWhite((m) => m + 1);
            } else {
                setMovesBlack((m) => m + 1);
            }
        }

        // Switch active player
        const next = current === 'white' ? 'black' : 'white';
        activePlayerRef.current = next;
        setActivePlayer(next);

        // Restart interval so the new player's clock ticks
        startInterval();
    }, [incrementMs, settings, startInterval]);

    // ─── Pause / Resume ──────────────────────────────────────────────────────

    const pause = useCallback(() => {
        if (gameStateRef.current !== GAME_STATES.RUNNING) return;
        stopInterval();
        setGameState(GAME_STATES.PAUSED);
    }, [stopInterval]);

    const resume = useCallback(() => {
        if (gameStateRef.current !== GAME_STATES.PAUSED) return;
        setGameState(GAME_STATES.RUNNING);
        startInterval();
    }, [startInterval]);

    // ─── Reset ───────────────────────────────────────────────────────────────

    const reset = useCallback(() => {
        stopInterval();
        timeWhiteRef.current = initialTimeMs;
        timeBlackRef.current = initialTimeMs;
        setTimeWhite(initialTimeMs);
        setTimeBlack(initialTimeMs);
        activePlayerRef.current = 'white';
        setActivePlayer('white');
        setMovesWhite(0);
        setMovesBlack(0);
        setGameState(GAME_STATES.IDLE);
        setWinner(null);
        gameStartTimeRef.current = null;
    }, [initialTimeMs, stopInterval]);

    // ─── Swap Players ────────────────────────────────────────────────────────

    const swapPlayers = useCallback(() => {
        const wasPaused = gameStateRef.current === GAME_STATES.PAUSED;
        if (!wasPaused && gameStateRef.current !== GAME_STATES.IDLE) return;

        // Swap times
        const tmpTime = timeWhiteRef.current;
        timeWhiteRef.current = timeBlackRef.current;
        timeBlackRef.current = tmpTime;
        setTimeWhite(timeBlackRef.current);
        setTimeBlack(timeWhiteRef.current);

        // Swap move counts
        setMovesWhite((prev) => {
            setMovesBlack((prevBlack) => {
                // We need a temp, but in React state this is tricky.
                // Use refs instead below.
                return prev;
            });
            return movesBlack;
        });

        // Fix: just toggle active player
        const next = activePlayerRef.current === 'white' ? 'black' : 'white';
        activePlayerRef.current = next;
        setActivePlayer(next);
    }, [movesBlack]);

    // ─── Cleanup ─────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => stopInterval();
    }, [stopInterval]);

    // ─── Return ──────────────────────────────────────────────────────────────

    return {
        // State
        timeWhite,
        timeBlack,
        activePlayer,
        gameState,
        movesWhite,
        movesBlack,
        winner,

        // Actions
        switchPlayer,
        pause,
        resume,
        reset,
        swapPlayers,
    };
};

export default useChessClock;
