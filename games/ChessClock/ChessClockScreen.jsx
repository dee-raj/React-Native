/**
 * ChessClockScreen — Setup / Home screen
 *
 * Shows time control presets (Bullet / Blitz / Rapid / Classical),
 * custom time configuration, optional player names, and game statistics.
 *
 * Tapping a preset navigates directly to ChessClockGame.
 * Custom mode shows input fields + a "Start Game" button.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import {
    Spacing,
    Typography,
    Shadows,
    BorderRadius,
} from '../../theme/Theme';
import GameHeader from '../../shared/GameHeader';
import PresetCard from './components/PresetCard';
import {
    PRESET_CATEGORIES,
    presetToMs,
    DEFAULT_SETTINGS,
} from './utils/chessClockUtils';
import {
    getStatistics,
    getSettings,
    formatDuration,
} from './storage/chessClockStorage';

const ChessClockScreen = ({ navigation }) => {
    const { colors, gradients } = useTheme();
    const { width } = useWindowDimensions();

    // Player names
    const [whiteName, setWhiteName] = useState('');
    const [blackName, setBlackName] = useState('');

    // Custom time inputs
    const [customMinutes, setCustomMinutes] = useState('5');
    const [customSeconds, setCustomSeconds] = useState('0');
    const [customIncrement, setCustomIncrement] = useState('0');
    const [customDelay, setCustomDelay] = useState('0');

    // Statistics
    const [stats, setStats] = useState(null);

    // Settings (for passing to game)
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    // Load stats & settings whenever screen is focused
    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const [s, sets] = await Promise.all([
                    getStatistics(),
                    getSettings(),
                ]);
                setStats(s);
                setSettings(sets);
            };
            load();
        }, []),
    );

    // ─── Navigation ──────────────────────────────────────────────────────────

    const navigateToGame = (preset) => {
        navigation.navigate('ChessClockGame', {
            initialTimeMs: presetToMs(preset),
            incrementMs: (preset.increment || 0) * 1000,
            delayMs: 0,
            timeControlLabel: preset.label,
            whiteName: whiteName.trim() || 'Player 1',
            blackName: blackName.trim() || 'Player 2',
        });
    };

    const startCustomGame = () => {
        const mins = parseInt(customMinutes, 10) || 0;
        const secs = parseInt(customSeconds, 10) || 0;
        const inc = parseInt(customIncrement, 10) || 0;
        const delay = parseInt(customDelay, 10) || 0;

        if (mins === 0 && secs === 0) return; // Can't start with 0 time

        const preset = {
            minutes: mins,
            seconds: secs,
            increment: inc,
            label: inc > 0 ? `${mins}+${inc}` : `${mins}:${secs.toString().padStart(2, '0')}`,
        };

        navigation.navigate('ChessClockGame', {
            initialTimeMs: presetToMs(preset),
            incrementMs: inc * 1000,
            delayMs: delay * 1000,
            timeControlLabel: preset.label,
            whiteName: whiteName.trim() || 'Player 1',
            blackName: blackName.trim() || 'Player 2',
        });
    };

    // ─── Render Helpers ──────────────────────────────────────────────────────

    const renderInput = (label, value, onChange, placeholder = '0') => (
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {label}
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        borderColor: colors.border,
                    },
                ]}
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                placeholder={placeholder}
                placeholderTextColor={colors.textTertiary}
                maxLength={3}
                selectTextOnFocus
            />
        </View>
    );

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <GameHeader
                title="Chess Clock"
                subtitle="Professional Offline Chess Timer"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Player Names ──────────────────────────────────── */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        <Ionicons name="people" size={18} color={colors.primary} />
                        {'  '}Players
                    </Text>
                    <View style={styles.playerRow}>
                        <View style={styles.playerInputWrap}>
                            <Text style={[styles.playerLabel, { color: colors.textSecondary }]}>
                                ♔ White
                            </Text>
                            <TextInput
                                style={[
                                    styles.playerInput,
                                    {
                                        backgroundColor: colors.inputBg,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={whiteName}
                                onChangeText={setWhiteName}
                                placeholder="Player 1"
                                placeholderTextColor={colors.textTertiary}
                                maxLength={20}
                            />
                        </View>
                        <View style={styles.playerInputWrap}>
                            <Text style={[styles.playerLabel, { color: colors.textSecondary }]}>
                                ♚ Black
                            </Text>
                            <TextInput
                                style={[
                                    styles.playerInput,
                                    {
                                        backgroundColor: colors.inputBg,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={blackName}
                                onChangeText={setBlackName}
                                placeholder="Player 2"
                                placeholderTextColor={colors.textTertiary}
                                maxLength={20}
                            />
                        </View>
                    </View>
                </View>

                {/* ── Preset Categories ─────────────────────────────── */}
                {PRESET_CATEGORIES.map((cat) => (
                    <View key={cat.label} style={styles.categorySection}>
                        <View style={styles.categoryHeader}>
                            <Ionicons name={cat.icon} size={20} color={cat.color} />
                            <Text style={[styles.categoryTitle, { color: colors.text }]}>
                                {cat.label}
                            </Text>
                        </View>
                        <View style={styles.presetRow}>
                            {cat.presets.map((preset) => (
                                <PresetCard
                                    key={preset.label}
                                    preset={preset}
                                    gradient={cat.gradient}
                                    onPress={navigateToGame}
                                />
                            ))}
                        </View>
                    </View>
                ))}

                {/* ── Custom Time ───────────────────────────────────── */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        <Ionicons name="options" size={18} color={colors.primary} />
                        {'  '}Custom Time
                    </Text>

                    <View style={styles.customInputRow}>
                        {renderInput('Minutes', customMinutes, setCustomMinutes, '5')}
                        {renderInput('Seconds', customSeconds, setCustomSeconds, '0')}
                        {renderInput('Increment', customIncrement, setCustomIncrement, '0')}
                        {renderInput('Delay', customDelay, setCustomDelay, '0')}
                    </View>

                    <Pressable
                        onPress={startCustomGame}
                        style={({ pressed }) => [
                            styles.startBtn,
                            pressed && styles.startBtnPressed,
                        ]}
                    >
                        <LinearGradient
                            colors={gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.startBtnGradient}
                        >
                            <Ionicons name="play" size={22} color="#FFF" />
                            <Text style={styles.startBtnText}>Start Game</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* ── Statistics ────────────────────────────────────── */}
                {stats && stats.gamesPlayed > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            <Ionicons name="stats-chart" size={18} color={colors.primary} />
                            {'  '}Statistics
                        </Text>
                        <View style={styles.statsGrid}>
                            {[
                                {
                                    label: 'Games Played',
                                    value: stats.gamesPlayed,
                                    icon: 'game-controller',
                                },
                                {
                                    label: 'Favorite',
                                    value: stats.favoriteTimeControl,
                                    icon: 'heart',
                                },
                                {
                                    label: 'Avg Length',
                                    value: formatDuration(stats.avgGameLengthMs),
                                    icon: 'time',
                                },
                                {
                                    label: 'Fastest Win',
                                    value: formatDuration(stats.fastestWinMs),
                                    icon: 'flash',
                                },
                                {
                                    label: 'Longest Game',
                                    value: formatDuration(stats.longestGameMs),
                                    icon: 'hourglass',
                                },
                            ].map((stat) => (
                                <View
                                    key={stat.label}
                                    style={[
                                        styles.statCard,
                                        { backgroundColor: colors.inputBg },
                                    ]}
                                >
                                    <Ionicons
                                        name={stat.icon}
                                        size={20}
                                        color={colors.primary}
                                    />
                                    <Text
                                        style={[
                                            styles.statValue,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {stat.value}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.statLabel,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        {stat.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },

    // Section card
    section: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
    },
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.md,
    },

    // Player names
    playerRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    playerInputWrap: {
        flex: 1,
    },
    playerLabel: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    playerInput: {
        height: 44,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.sizes.md,
    },

    // Category headers
    categorySection: {
        marginBottom: Spacing.lg,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    categoryTitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    presetRow: {
        flexDirection: 'row',
        gap: 8,
    },

    // Custom time
    customInputRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: Typography.weights.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    input: {
        height: 44,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.sm,
        fontSize: Typography.sizes.lg,
        textAlign: 'center',
        fontWeight: Typography.weights.bold,
    },

    // Start button
    startBtn: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    startBtnPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.9,
    },
    startBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    startBtnText: {
        color: '#FFF',
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.black,
    },

    // Statistics
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    statCard: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        minWidth: 100,
        flex: 1,
        gap: 4,
    },
    statValue: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.black,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: Typography.weights.medium,
    },
});

export default ChessClockScreen;
