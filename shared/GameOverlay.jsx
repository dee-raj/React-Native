import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Typography, Shadows, BorderRadius } from '../theme/Theme';
import ActionButton from './ActionButton';

const GameOverlay = ({
    visible,
    type = 'win',
    title,
    subtitle,
    stats,
    primaryLabel = 'Continue',
    secondaryLabel,
    onPrimary,
    onSecondary,
    children,
}) => {
    const { colors, gradients } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
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
            scaleAnim.setValue(0.8);
        }
    }, [visible]);

    const getGradientColors = () => {
        switch (type) {
            case 'win':
                return gradients.success;
            case 'lose':
                return [colors.error, '#991B1B'];
            case 'complete':
                return gradients.primary;
            default:
                return gradients.surface;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'win':
                return 'trophy';
            case 'lose':
                return 'close-circle';
            case 'complete':
                return 'checkmark-circle';
            default:
                return 'information-circle';
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View 
                style={[
                    styles.overlay,
                    { opacity: fadeAnim }
                ]}
            >
                <Pressable 
                    style={styles.backdrop} 
                    onPress={onSecondary}
                />
                <Animated.View 
                    style={[
                        styles.container,
                        { 
                            backgroundColor: colors.surface,
                            transform: [{ scale: scaleAnim }],
                        }
                    ]}
                >
                    <LinearGradient
                        colors={getGradientColors()}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons 
                                name={getIcon()} 
                                size={48} 
                                color="#FFFFFF" 
                            />
                        </View>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle && (
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        )}
                    </LinearGradient>

                    {stats && (
                        <View style={styles.statsContainer}>
                            {stats.map((stat, index) => (
                                <View 
                                    key={index} 
                                    style={[
                                        styles.statItem,
                                        index < stats.length - 1 && styles.statDivider
                                    ]}
                                >
                                    <Text style={[styles.statValue, { color: colors.text }]}>
                                        {stat.value}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                        {stat.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {children}

                    <View style={styles.buttonsContainer}>
                        <ActionButton
                            label={primaryLabel}
                            onPress={onPrimary}
                            variant={type === 'win' ? 'success' : 'primary'}
                            size="large"
                            style={styles.primaryButton}
                        />
                        {secondaryLabel && onSecondary && (
                            <ActionButton
                                label={secondaryLabel}
                                onPress={onSecondary}
                                variant="outline"
                                size="medium"
                                style={styles.secondaryButton}
                            />
                        )}
                    </View>
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
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    container: {
        width: '85%',
        maxWidth: 360,
        borderRadius: BorderRadius.xxl,
        overflow: 'hidden',
        ...Shadows.lg,
    },
    headerGradient: {
        padding: Spacing.xxl,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    title: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.black,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.sizes.md,
        color: 'rgba(255,255,255,0.9)',
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginTop: -Spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    statDivider: {
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.2)',
    },
    statValue: {
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.black,
    },
    statLabel: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium,
        marginTop: 2,
    },
    buttonsContainer: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    primaryButton: {
        width: '100%',
    },
    secondaryButton: {
        width: '100%',
    },
});

export default GameOverlay;