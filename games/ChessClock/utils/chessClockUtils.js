/**
 * Chess Clock Utilities
 *
 * Pure functions and constant definitions used across the Chess Clock feature.
 * No React dependencies — this module is safe to import anywhere.
 */

// ─── Time Control Presets ────────────────────────────────────────────────────

export const PRESET_CATEGORIES = [
    {
        label: 'Bullet',
        icon: 'flash',
        color: '#FF6B6B',
        gradient: ['#FF6B6B', '#FF8E53'],
        presets: [
            { minutes: 1, seconds: 0, increment: 0, label: '1+0' },
            { minutes: 2, seconds: 0, increment: 1, label: '2+1' },
            { minutes: 3, seconds: 0, increment: 0, label: '3+0' },
        ],
    },
    {
        label: 'Blitz',
        icon: 'thunderstorm',
        color: '#667eea',
        gradient: ['#667eea', '#764ba2'],
        presets: [
            { minutes: 3, seconds: 0, increment: 2, label: '3+2' },
            { minutes: 5, seconds: 0, increment: 0, label: '5+0' },
            { minutes: 5, seconds: 0, increment: 3, label: '5+3' },
        ],
    },
    {
        label: 'Rapid',
        icon: 'speedometer',
        color: '#10B981',
        gradient: ['#10B981', '#059669'],
        presets: [
            { minutes: 10, seconds: 0, increment: 0, label: '10+0' },
            { minutes: 10, seconds: 0, increment: 5, label: '10+5' },
            { minutes: 15, seconds: 0, increment: 10, label: '15+10' },
        ],
    },
    {
        label: 'Classical',
        icon: 'hourglass',
        color: '#F59E0B',
        gradient: ['#F59E0B', '#D97706'],
        presets: [
            { minutes: 30, seconds: 0, increment: 0, label: '30+0' },
            { minutes: 60, seconds: 0, increment: 30, label: '60+30' },
        ],
    },
];

// ─── Chess Clock Themes ──────────────────────────────────────────────────────

export const CLOCK_THEMES = {
    dark: {
        key: 'dark',
        label: 'Dark',
        activePlayer: '#1a1a2e',
        inactivePlayer: '#0f0f1a',
        activeBorder: '#667eea',
        activeGlow: 'rgba(102, 126, 234, 0.5)',
        text: '#FFFFFF',
        dimText: 'rgba(255,255,255,0.4)',
        centerStrip: '#16213e',
    },
    blue: {
        key: 'blue',
        label: 'Blue',
        activePlayer: '#0d1b2a',
        inactivePlayer: '#0a1628',
        activeBorder: '#48cae4',
        activeGlow: 'rgba(72, 202, 228, 0.5)',
        text: '#FFFFFF',
        dimText: 'rgba(255,255,255,0.4)',
        centerStrip: '#1b2838',
    },
    green: {
        key: 'green',
        label: 'Green',
        activePlayer: '#0b1e0b',
        inactivePlayer: '#071207',
        activeBorder: '#10B981',
        activeGlow: 'rgba(16, 185, 129, 0.5)',
        text: '#FFFFFF',
        dimText: 'rgba(255,255,255,0.4)',
        centerStrip: '#14291a',
    },
    tournament: {
        key: 'tournament',
        label: 'Tournament',
        activePlayer: '#1c1c1c',
        inactivePlayer: '#121212',
        activeBorder: '#FFD700',
        activeGlow: 'rgba(255, 215, 0, 0.4)',
        text: '#FFFFFF',
        dimText: 'rgba(255,255,255,0.4)',
        centerStrip: '#2a2a2a',
    },
};

// ─── Time Formatting ─────────────────────────────────────────────────────────

/**
 * Format milliseconds into a display string.
 *
 * - ≥ 60 s  → "M:SS"  or "MM:SS"
 * - < 60 s and ≥ 10 s → "0:SS"
 * - < 10 s → "S.d"  (shows tenths for urgency)
 *
 * @param {number} ms - remaining time in milliseconds
 * @returns {string} formatted time string
 */
export const formatTime = (ms) => {
    if (ms <= 0) return '0:00';

    const totalSeconds = Math.ceil(ms / 1000);

    if (totalSeconds < 10) {
        // Show tenths of a second for sub-10s urgency
        const secs = Math.floor(ms / 1000);
        const tenths = Math.floor((ms % 1000) / 100);
        return `${secs}.${tenths}`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Convert a preset config to milliseconds.
 *
 * @param {{ minutes: number, seconds: number }} preset
 * @returns {number} total time in milliseconds
 */
export const presetToMs = (preset) => {
    return (preset.minutes * 60 + (preset.seconds || 0)) * 1000;
};

// ─── Timer Color Thresholds ──────────────────────────────────────────────────

const WARNING_THRESHOLD = 30000;  // 30 seconds
const DANGER_THRESHOLD = 10000;  // 10 seconds

/**
 * Return the appropriate colour for the timer display based on remaining time.
 *
 * @param {number} remainingMs - remaining time in milliseconds
 * @param {boolean} isActive   - whether this is the currently active player
 * @param {string} dimColor    - the dim colour used when inactive
 * @returns {string} CSS/RN colour string
 */
export const getTimerColor = (remainingMs, isActive = true, dimColor = 'rgba(255,255,255,0.4)') => {
    if (!isActive) return dimColor;

    if (remainingMs <= DANGER_THRESHOLD) return '#EF4444';
    if (remainingMs <= WARNING_THRESHOLD) return '#F59E0B';
    return '#FFFFFF';
};

/**
 * Return a glow shadow colour matching the urgency level.
 */
export const getTimerGlowColor = (remainingMs) => {
    if (remainingMs <= DANGER_THRESHOLD) return 'rgba(239, 68, 68, 0.6)';
    if (remainingMs <= WARNING_THRESHOLD) return 'rgba(245, 158, 11, 0.4)';
    return null;
};

// ─── Default Settings ────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
    sound: true,
    vibration: true,
    keepScreenAwake: true,
    showMoveCounter: true,
    largeTimer: false,
    theme: 'dark',
};
