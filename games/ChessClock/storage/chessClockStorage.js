/**
 * Chess Clock Storage
 *
 * Persists game settings and statistics to AsyncStorage.
 * All public methods are async and handle errors gracefully.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS } from '../utils/chessClockUtils';

const STATS_KEY = '@chess_clock_stats';
const SETTINGS_KEY = '@chess_clock_settings';

// ─── Settings ────────────────────────────────────────────────────────────────

/**
 * Load saved settings, merged with defaults for any missing keys.
 * @returns {Promise<Object>}
 */
export const getSettings = async () => {
    try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        }
    } catch (error) {
        console.log('ChessClockStorage getSettings error:', error.message);
    }
    return { ...DEFAULT_SETTINGS };
};

/**
 * Persist settings object.
 * @param {Object} settings
 */
export const saveSettings = async (settings) => {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.log('ChessClockStorage saveSettings error:', error.message);
    }
};

// ─── Game Results ────────────────────────────────────────────────────────────

/**
 * Append a game result to the stored history.
 *
 * @param {{ timeControl: string, durationMs: number, winner: string, movesWhite: number, movesBlack: number }} result
 */
export const saveGameResult = async (result) => {
    try {
        const history = await getGameHistory();
        history.push({
            ...result,
            timestamp: Date.now(),
        });

        // Keep the last 200 games to avoid unbounded growth
        const trimmed = history.slice(-200);
        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(trimmed));
    } catch (error) {
        console.log('ChessClockStorage saveGameResult error:', error.message);
    }
};

/**
 * Retrieve the full game history array.
 * @returns {Promise<Array>}
 */
export const getGameHistory = async () => {
    try {
        const raw = await AsyncStorage.getItem(STATS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (error) {
        console.log('ChessClockStorage getGameHistory error:', error.message);
    }
    return [];
};

// ─── Computed Statistics ─────────────────────────────────────────────────────

/**
 * Compute aggregate statistics from stored game history.
 *
 * @returns {Promise<{
 *   gamesPlayed: number,
 *   favoriteTimeControl: string,
 *   avgGameLengthMs: number,
 *   fastestWinMs: number,
 *   longestGameMs: number,
 * }>}
 */
export const getStatistics = async () => {
    const history = await getGameHistory();

    if (history.length === 0) {
        return {
            gamesPlayed: 0,
            favoriteTimeControl: '—',
            avgGameLengthMs: 0,
            fastestWinMs: 0,
            longestGameMs: 0,
        };
    }

    // Games played
    const gamesPlayed = history.length;

    // Favorite time control — most frequently played
    const controlCounts = {};
    history.forEach((g) => {
        controlCounts[g.timeControl] = (controlCounts[g.timeControl] || 0) + 1;
    });
    const favoriteTimeControl = Object.entries(controlCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

    // Duration-based stats
    const durations = history.map((g) => g.durationMs).filter(Boolean);
    const avgGameLengthMs = durations.length
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
    const fastestWinMs = durations.length ? Math.min(...durations) : 0;
    const longestGameMs = durations.length ? Math.max(...durations) : 0;

    return {
        gamesPlayed,
        favoriteTimeControl,
        avgGameLengthMs,
        fastestWinMs,
        longestGameMs,
    };
};

/**
 * Format milliseconds to a human-readable duration string (e.g. "5m 23s").
 * @param {number} ms
 * @returns {string}
 */
export const formatDuration = (ms) => {
    if (!ms) return '—';
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
};
