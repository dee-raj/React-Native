/**
 * TimerButton — Tappable player half-screen area
 *
 * Renders the player name, ChessTimer, and move count.
 * The top player is rotated 180° so both opponents can read their own timer.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChessTimer from './ChessTimer';
import { GAME_STATES } from '../hooks/useChessClock';

const TimerButton = ({
    playerName,
    timeMs,
    moves,
    isActive,
    isTop,
    onPress,
    gameState,
    showMoveCounter = true,
    largeTimer = false,
    clockTheme,
}) => {
    const isFinished = gameState === GAME_STATES.FINISHED;
    const isTimedOut = isFinished && timeMs <= 0;

    const bgColor = isActive
        ? clockTheme.activePlayer
        : clockTheme.inactivePlayer;

    const borderColor = isActive
        ? clockTheme.activeBorder
        : 'transparent';

    const containerStyle = [
        styles.container,
        {
            backgroundColor: bgColor,
            borderColor,
            borderWidth: isActive ? 8 : 0,
            borderRadius: 16,
            margin: 6
        },
        isTop && styles.rotated,
        // Glow effect for active player
        isActive && {
            shadowColor: clockTheme.activeBorder,
            shadowOpacity: 0.5,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
        },
    ];

    return (
        <Pressable
            onPress={onPress}
            disabled={!isActive || isFinished}
            style={({ pressed }) => [
                ...containerStyle,
                pressed && isActive && styles.pressed,
            ]}
            accessibilityLabel={`${playerName} timer. ${isActive ? 'Active' : 'Waiting'}. Tap to end turn.`}
            accessibilityRole="button"
        >
            {/* Player Name */}
            <Text
                style={[
                    styles.playerName,
                    { color: isActive ? clockTheme.text : clockTheme.dimText },
                ]}
                numberOfLines={1}
            >
                {playerName}
            </Text>

            {/* Timer */}
            <ChessTimer
                timeMs={timeMs}
                isActive={isActive}
                isLarge={largeTimer}
                dimColor={clockTheme.dimText}
            />

            {/* Move Counter */}
            {showMoveCounter && (
                <View style={styles.moveRow}>
                    <Ionicons
                        name="swap-horizontal"
                        size={16}
                        color={isActive ? clockTheme.text : clockTheme.dimText}
                        style={{ opacity: 0.6 }}
                    />
                    <Text
                        style={[
                            styles.moveCount,
                            { color: isActive ? clockTheme.text : clockTheme.dimText },
                        ]}
                    >
                        {moves} {moves === 1 ? 'move' : 'moves'}
                    </Text>
                </View>
            )}

            {/* Timed-out flag icon */}
            {isTimedOut && (
                <View style={styles.flagContainer}>
                    <Ionicons name="flag" size={28} color="#EF4444" />
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    rotated: {
        transform: [{ rotate: '180deg' }],
    },
    pressed: {
        opacity: 0.85,
    },
    playerName: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    moveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    moveCount: {
        fontSize: 14,
        fontWeight: '500',
    },
    flagContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
});

export default React.memo(TimerButton);
