/**
 * ChessClockGameScreen — Active chess timer gameplay
 *
 * Split-screen view with two TimerButtons (top rotated 180°, bottom normal).
 * A center control strip holds the pause button.
 * Uses the useChessClock hook for all game logic.
 * Supports landscape via useWindowDimensions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    StatusBar,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import TimerButton from './components/TimerButton';
import PauseModal from './components/PauseModal';
import useChessClock, { GAME_STATES } from './hooks/useChessClock';
import { CLOCK_THEMES, DEFAULT_SETTINGS } from './utils/chessClockUtils';
import { getSettings, saveSettings } from './storage/chessClockStorage';
import GameOverlay from '../../shared/GameOverlay';

const ChessClockGameScreen = ({ navigation, route }) => {
    const {
        initialTimeMs,
        incrementMs = 0,
        delayMs = 0,
        timeControlLabel = '',
        whiteName = 'Player 1',
        blackName = 'Player 2',
    } = route.params || {};

    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    // ─── Settings ────────────────────────────────────────────────────────────

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [showPause, setShowPause] = useState(false);

    useEffect(() => {
        (async () => {
            const saved = await getSettings();
            setSettings(saved);
        })();
    }, []);

    // Keep screen awake when enabled
    if (settings.keepScreenAwake) {
        useKeepAwake();
    }

    // Derive clock theme from settings
    const clockTheme = CLOCK_THEMES[settings.theme] || CLOCK_THEMES.dark;

    // ─── Game Logic Hook ─────────────────────────────────────────────────────

    const {
        timeWhite,
        timeBlack,
        activePlayer,
        gameState,
        movesWhite,
        movesBlack,
        winner,
        switchPlayer,
        pause,
        resume,
        reset,
        swapPlayers,
    } = useChessClock({
        initialTimeMs,
        incrementMs,
        delayMs,
        timeControlLabel,
        settings,
    });

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleTopPress = useCallback(() => {
        // Top player is Black (rotated). When Black taps, they switch to White.
        if (activePlayer === 'black') {
            switchPlayer();
        }
    }, [activePlayer, switchPlayer]);

    const handleBottomPress = useCallback(() => {
        // Bottom player is White. When White taps, they switch to Black.
        if (activePlayer === 'white') {
            switchPlayer();
        }
    }, [activePlayer, switchPlayer]);

    const handlePause = useCallback(() => {
        pause();
        setShowPause(true);
    }, [pause]);

    const handleResume = useCallback(() => {
        setShowPause(false);
        // Small delay so the modal animation finishes
        setTimeout(() => resume(), 200);
    }, [resume]);

    const handleRestart = useCallback(() => {
        setShowPause(false);
        reset();
    }, [reset]);

    const handleSwapPlayers = useCallback(() => {
        swapPlayers();
        // Stay in pause menu so user sees the swap
    }, [swapPlayers]);

    const handleSettingsChange = useCallback(async (newSettings) => {
        setSettings(newSettings);
        await saveSettings(newSettings);
    }, []);

    const handleExit = useCallback(() => {
        setShowPause(false);
        navigation.goBack();
    }, [navigation]);

    const handlePlayAgain = useCallback(() => {
        reset();
    }, [reset]);

    const handleBackToHome = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    // ─── Game Over Overlay ───────────────────────────────────────────────────

    const isFinished = gameState === GAME_STATES.FINISHED;
    const winnerName = winner === 'white' ? whiteName : blackName;

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: clockTheme.centerStrip },
                isLandscape && styles.containerLandscape,
            ]}
        >
            <StatusBar hidden />

            {/* Top Player — Black (rotated 180°) */}
            <TimerButton
                playerName={blackName}
                timeMs={timeBlack}
                moves={movesBlack}
                isActive={activePlayer === 'black'}
                isTop={true}
                onPress={handleTopPress}
                gameState={gameState}
                showMoveCounter={settings.showMoveCounter}
                largeTimer={settings.largeTimer}
                clockTheme={clockTheme}
            />

            {/* Center Control Strip */}
            <View
                style={[
                    styles.centerStrip,
                    { backgroundColor: clockTheme.centerStrip },
                    isLandscape && styles.centerStripLandscape,
                ]}
            >
                {/* Time control badge */}
                <View style={styles.badgeContainer}>
                    <Text style={styles.badge}>{timeControlLabel}</Text>
                </View>

                {/* Pause / Play button */}
                {gameState !== GAME_STATES.FINISHED && gameState !== GAME_STATES.IDLE && (
                    < Pressable
                        onPress={
                            gameState === GAME_STATES.RUNNING
                                ? handlePause
                                : gameState === GAME_STATES.PAUSED
                                    ? handleResume
                                    : undefined
                        }
                        style={({ pressed }) => [
                            styles.pauseBtn,
                            { borderColor: clockTheme.activeBorder },
                            pressed && styles.pauseBtnPressed,
                        ]}
                        accessibilityLabel={
                            gameState === GAME_STATES.RUNNING
                                ? 'Pause game'
                                : 'Resume game'
                        }
                    >
                        <Ionicons
                            name={
                                gameState === GAME_STATES.RUNNING
                                    ? 'pause'
                                    : 'play'
                            }
                            size={20}
                            color={clockTheme.activeBorder}
                        />
                    </Pressable>
                )}

                {/* Move totals */}
                <View style={styles.badgeContainer}>
                    <Text style={styles.badge}>
                        {movesWhite + movesBlack} moves
                    </Text>
                </View>
            </View>

            {/* Bottom Player — White */}
            <TimerButton
                playerName={whiteName}
                timeMs={timeWhite}
                moves={movesWhite}
                isActive={activePlayer === 'white'}
                isTop={false}
                onPress={handleBottomPress}
                gameState={gameState}
                showMoveCounter={settings.showMoveCounter}
                largeTimer={settings.largeTimer}
                clockTheme={clockTheme}
            />

            {/* Pause Modal */}
            <PauseModal
                visible={showPause}
                onResume={handleResume}
                onRestart={handleRestart}
                onSwapPlayers={handleSwapPlayers}
                onExit={handleExit}
                settings={settings}
                onSettingsChange={handleSettingsChange}
            />

            {/* Game Over Overlay */}
            <GameOverlay
                visible={isFinished}
                type="win"
                title="Time's Up!"
                subtitle={`Winner: ${winnerName}`}
                stats={[
                    { label: 'Moves', value: movesWhite + movesBlack },
                    { label: 'White', value: movesWhite },
                    { label: 'Black', value: movesBlack },
                ]}
                primaryLabel="Play Again"
                secondaryLabel="Back to Home"
                onPrimary={handlePlayAgain}
                onSecondary={handleBackToHome}
            />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLandscape: {
        flexDirection: 'row',
    },

    // Center control strip between the two player halves
    centerStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    centerStripLandscape: {
        flexDirection: 'column',
        paddingVertical: 20,
        paddingHorizontal: 8,
    },

    // Pause button
    pauseBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    pauseBtnPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.9 }],
    },

    // Info badges
    badgeContainer: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badge: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ChessClockGameScreen;
