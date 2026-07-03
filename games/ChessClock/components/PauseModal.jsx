/**
 * PauseModal — In-game pause menu overlay
 *
 * Shows Resume / Restart / Swap Players / Settings / Exit options.
 * Settings sub-view allows toggling sound, vibration, screen-awake,
 * move counter, large timer, and theme selection.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    Switch,
    StyleSheet,
    Animated,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import {
    Spacing,
    Typography,
    Shadows,
    BorderRadius,
} from '../../../theme/Theme';
import { CLOCK_THEMES } from '../utils/chessClockUtils';

const PauseModal = ({
    visible,
    onResume,
    onRestart,
    onSwapPlayers,
    onExit,
    settings,
    onSettingsChange,
}) => {
    const { colors } = useTheme();
    const [showSettings, setShowSettings] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        if (visible) {
            setShowSettings(false);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.85);
        }
    }, [visible]);

    const toggleSetting = (key) => {
        onSettingsChange({ ...settings, [key]: !settings[key] });
    };

    const setTheme = (themeKey) => {
        onSettingsChange({ ...settings, theme: themeKey });
    };

    if (!visible) return null;

    // ─── Settings Sub-View ───────────────────────────────────────────────────

    const renderSettings = () => (
        <ScrollView style={styles.settingsScroll} showsVerticalScrollIndicator={false}>
            {/* Back to menu */}
            <Pressable
                style={styles.settingsBack}
                onPress={() => setShowSettings(false)}
            >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
                <Text style={[styles.settingsBackText, { color: colors.text }]}>
                    Back to Menu
                </Text>
            </Pressable>

            <Text style={[styles.settingsTitle, { color: colors.text }]}>Settings</Text>

            {/* Toggle rows */}
            {[
                { key: 'sound', label: 'Sound', icon: 'volume-high' },
                { key: 'vibration', label: 'Vibration', icon: 'phone-portrait' },
                { key: 'keepScreenAwake', label: 'Keep Screen Awake', icon: 'sunny' },
                { key: 'showMoveCounter', label: 'Show Move Counter', icon: 'swap-horizontal' },
                { key: 'largeTimer', label: 'Large Timer', icon: 'resize' },
            ].map(({ key, label, icon }) => (
                <View
                    key={key}
                    style={[styles.settingRow, { borderBottomColor: colors.border }]}
                >
                    <View style={styles.settingLabelRow}>
                        <Ionicons name={icon} size={20} color={colors.textSecondary} />
                        <Text style={[styles.settingLabel, { color: colors.text }]}>
                            {label}
                        </Text>
                    </View>
                    <Switch
                        value={!!settings[key]}
                        onValueChange={() => toggleSetting(key)}
                        trackColor={{
                            false: colors.switchTrack,
                            true: colors.primary,
                        }}
                        thumbColor={colors.switchThumb}
                    />
                </View>
            ))}

            {/* Theme selector */}
            <Text style={[styles.themeSectionTitle, { color: colors.textSecondary }]}>
                Clock Theme
            </Text>
            <View style={styles.themeGrid}>
                {Object.values(CLOCK_THEMES).map((t) => {
                    const isSelected = settings.theme === t.key;
                    return (
                        <Pressable
                            key={t.key}
                            onPress={() => setTheme(t.key)}
                            style={[
                                styles.themeChip,
                                {
                                    backgroundColor: t.activePlayer,
                                    borderColor: isSelected
                                        ? t.activeBorder
                                        : 'transparent',
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.themeColorDot,
                                    { backgroundColor: t.activeBorder },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.themeLabel,
                                    {
                                        color: isSelected ? t.activeBorder : '#999',
                                        fontWeight: isSelected ? '700' : '400',
                                    },
                                ]}
                            >
                                {t.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );

    // ─── Menu Items ──────────────────────────────────────────────────────────

    const menuItems = [
        {
            label: 'Resume',
            icon: 'play',
            gradient: ['#10B981', '#059669'],
            onPress: onResume,
        },
        {
            label: 'Restart',
            icon: 'refresh',
            gradient: ['#667eea', '#764ba2'],
            onPress: onRestart,
        },
        {
            label: 'Swap Players',
            icon: 'swap-vertical',
            gradient: ['#F59E0B', '#D97706'],
            onPress: onSwapPlayers,
        },
        {
            label: 'Settings',
            icon: 'settings',
            gradient: ['#6366f1', '#8b5cf6'],
            onPress: () => setShowSettings(true),
        },
        {
            label: 'Exit',
            icon: 'exit',
            gradient: ['#EF4444', '#DC2626'],
            onPress: onExit,
        },
    ];

    const renderMenu = () => (
        <View style={styles.menuContainer}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Game Paused</Text>

            {menuItems.map((item) => (
                <Pressable
                    key={item.label}
                    onPress={item.onPress}
                    style={({ pressed }) => [
                        styles.menuItem,
                        pressed && styles.menuItemPressed,
                    ]}
                >
                    <LinearGradient
                        colors={item.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.menuIconBg}
                    >
                        <Ionicons name={item.icon} size={20} color="#FFF" />
                    </LinearGradient>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>
                        {item.label}
                    </Text>
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textTertiary}
                    />
                </Pressable>
            ))}
        </View>
    );

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Pressable style={styles.backdrop} onPress={onResume} />
                <Animated.View
                    style={[
                        styles.container,
                        {
                            backgroundColor: colors.surface,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {showSettings ? renderSettings() : renderMenu()}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.75)',
    },
    container: {
        width: '85%',
        maxWidth: 380,
        maxHeight: '80%',
        borderRadius: BorderRadius.xxl,
        overflow: 'hidden',
        ...Shadows.lg,
    },
    // Menu
    menuContainer: {
        padding: Spacing.xl,
    },
    menuTitle: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.black,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    menuItemPressed: {
        opacity: 0.7,
    },
    menuIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuLabel: {
        flex: 1,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    // Settings
    settingsScroll: {
        padding: Spacing.xl,
    },
    settingsBack: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: 12,
    },
    settingsBackText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    settingsTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.black,
        marginBottom: Spacing.lg,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    settingLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    settingLabel: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
    },
    themeSectionTitle: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: Spacing.xl,
        marginBottom: Spacing.md,
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: Spacing.xl,
    },
    themeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        gap: 8,
    },
    themeColorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    themeLabel: {
        fontSize: 13,
    },
});

export default PauseModal;
