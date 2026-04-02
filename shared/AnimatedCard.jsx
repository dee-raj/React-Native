import React, { useEffect, useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Typography, Shadows, BorderRadius } from '../theme/Theme';

const AnimatedCard = ({
    children,
    onPress,
    style,
    delay = 0,
    gradient,
    gradientColors,
    title,
    subtitle,
    icon,
    iconFamily = 'Ionicons',
    badge,
    showPressAnimation = true,
}) => {
    const { colors, gradients } = useTheme();
    const scaleAnim = useRef(new Animated.Value(showPressAnimation ? 0.8 : 1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
        }).start();

        if (showPressAnimation) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                delay,
                useNativeDriver: true,
            }).start();
        }
    }, [delay]);

    const handlePressIn = () => {
        if (onPress) {
            Animated.spring(pressAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            Animated.spring(pressAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
        }
    };

    const cardStyle = [
        styles.container,
        {
            backgroundColor: gradient ? undefined : colors.card,
            borderColor: colors.cardBorder,
            transform: [
                { scale: Animated.multiply(scaleAnim, pressAnim) },
            ],
            opacity: fadeAnim,
        },
        style,
    ];

    const content = (
        <>
            {(gradient || gradientColors) && (
                <LinearGradient
                    colors={gradientColors || gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {(title || subtitle || icon) && (
                <View style={styles.header}>
                    {icon && (
                        <View style={styles.iconContainer}>
                            <Text>{icon}</Text>
                        </View>
                    )}
                    {title && (
                        <Text style={[
                            styles.title,
                            gradient && { color: '#FFFFFF' }
                        ]}>
                            {title}
                        </Text>
                    )}
                    {subtitle && (
                        <Text style={[
                            styles.subtitle,
                            gradient && { color: 'rgba(255,255,255,0.8)' }
                        ]}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            )}
            {children}
            {badge && (
                <View style={[
                    styles.badge,
                    { backgroundColor: badge.color || colors.success }
                ]}>
                    <Text style={styles.badgeText}>{badge.text}</Text>
                </View>
            )}
        </>
    );

    if (onPress) {
        return (
            <Animated.View style={cardStyle}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.pressable}
                >
                    {content}
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={cardStyle}>
            {content}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        ...Shadows.md,
    },
    pressable: {
        flex: 1,
    },
    header: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: '#1F2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.sizes.sm,
        color: 'rgba(31,41,55,0.7)',
        textAlign: 'center',
        marginTop: 2,
    },
    badge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    badgeText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
        color: '#FFFFFF',
    },
});

export default AnimatedCard;