/**
 * PresetCard — Time control preset selector
 *
 * Beautiful rounded card that shows a time control (e.g. "5+3")
 * with a gradient background matching its category colour.
 */

import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Shadows } from '../../../theme/Theme';

const PresetCard = ({ preset, gradient, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
            <Pressable
                onPress={() => onPress(preset)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.pressable}
                accessibilityLabel={`${preset.label} time control`}
                accessibilityRole="button"
            >
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <Text style={styles.label}>{preset.label}</Text>
                    {preset.increment > 0 ? (
                        <Text style={styles.detail}>
                            {preset.minutes}m + {preset.increment}s
                        </Text>
                    ) : (
                        <Text style={styles.detail}>
                            {preset.minutes > 0 ? `${preset.minutes} min` : `${preset.seconds}s`}
                        </Text>
                    )}
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        minWidth: 90,
        maxWidth: 120,
        marginHorizontal: 4,
        marginVertical: 4,
        ...Shadows.md,
    },
    pressable: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.lg,
    },
    label: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    detail: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
        textAlign: 'center',
    },
});

export default React.memo(PresetCard);
