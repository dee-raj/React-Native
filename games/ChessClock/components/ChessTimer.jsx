/**
 * ChessTimer — Large countdown display
 *
 * Renders the formatted time with colour coding based on urgency.
 * Supports a "large timer" mode for accessibility.
 */

import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { formatTime, getTimerColor, getTimerGlowColor } from '../utils/chessClockUtils';

const ChessTimer = ({ timeMs, isActive, isLarge = false, dimColor }) => {
    const display = formatTime(timeMs);
    const color = getTimerColor(timeMs, isActive, dimColor);
    const glowColor = isActive ? getTimerGlowColor(timeMs) : null;

    // Pulse animation when below 10 seconds
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isActive && timeMs > 0 && timeMs <= 10000) {
            // Create a repeating pulse
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.08,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isActive, timeMs <= 10000]);

    const fontSize = isLarge ? 80 : 64;

    return (
        <Animated.Text
            style={[
                styles.timer,
                {
                    color,
                    fontSize,
                    transform: [{ scale: pulseAnim }],
                },
                glowColor && {
                    textShadowColor: glowColor,
                    textShadowRadius: 20,
                    textShadowOffset: { width: 0, height: 0 },
                },
            ]}
            accessibilityLabel={`Timer: ${display}`}
            accessibilityRole="timer"
        >
            {display}
        </Animated.Text>
    );
};

const styles = StyleSheet.create({
    timer: {
        fontWeight: '800',
        fontVariant: ['tabular-nums'], // Monospaced digits to prevent layout jitter
        letterSpacing: 6,
        textAlign: 'center',
    },
});

export default React.memo(ChessTimer);
