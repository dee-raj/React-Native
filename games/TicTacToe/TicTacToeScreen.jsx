import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Reserve space for header, status bar, buttons
const SAFE_VERTICAL_SPACE = 260;

const BOARD_SIZE = Math.min(
    width - 40,
    height - SAFE_VERTICAL_SPACE
);

const TicTacToeScreen = ({ navigation }) => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [scaleAnims] = useState(Array(9).fill(null).map(() => new Animated.Value(1)));
    const [showConfetti, setShowConfetti] = useState(false);

    const confettiRef = useRef(null);

    const calculateWinner = useCallback((squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
        }
        return null;
    }, []);

    const winner = calculateWinner(board);
    const isDraw = !winner && board.every(square => square !== null);
    const status = winner ? `🎉 Winner: ${winner}` : isDraw ? "🤝 It's a Draw!" : `Next Turn: ${isXNext ? 'X' : 'O'}`;

    const handlePress = (index) => {
        if (board[index] || winner || isDraw) return;

        Animated.sequence([
            Animated.timing(scaleAnims[index], { toValue: 0.8, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnims[index], { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        setBoard(prev => {
            const newBoard = [...prev];
            newBoard[index] = isXNext ? 'X' : 'O';
            return newBoard;
        });
        setIsXNext(prev => !prev);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setShowConfetti(false);
    };

    useEffect(() => {
        if (winner && !showConfetti) setShowConfetti(true);
    }, [winner, showConfetti]);

    const SQUARE_SIZE = BOARD_SIZE / 3;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#2b0202ff" />
                </Pressable>
                <Text style={styles.title}>Tic Tac Toe</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.container}>
                {/* Status Banner */}
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{status}</Text>
                </View>

                {/* Board */}
                <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
                    {board.map((cell, i) => (
                        <Animated.View key={i} style={{ transform: [{ scale: scaleAnims[i] }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.square,
                                    { width: SQUARE_SIZE, height: SQUARE_SIZE },
                                    cell && {
                                        backgroundColor: cell === 'X' ? '#ffe3e3' : '#d0e7ff',
                                    },
                                ]}
                                onPress={() => handlePress(i)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.squareText,
                                        { color: cell === 'X' ? '#d32f2f' : '#1976d2' },
                                    ]}
                                >
                                    {cell}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Reset Button */}
                {(winner || isDraw) && (
                    <Pressable
                        onPress={resetGame}
                        style={({ pressed }) => [
                            styles.resetButton,
                            { transform: [{ scale: pressed ? 0.95 : 1 }] },
                        ]}
                    >
                        <Text style={styles.resetButtonText}>New Game 🔄 </Text>
                    </Pressable>
                )}
            </View>

            <View style={styles.rulesContainer}>
                <Text style={styles.rulesTitle}> Rules </Text>
                <Text style={styles.rulesText}> 1. The first player to get three of their marks in a row (horizontally, vertically, or diagonally) wins. </Text>
                <Text style={styles.rulesText}> 2. If all nine squares are filled and no player has three in a row, the game is a draw. </Text>
            </View>

            {/* Confetti */}
            {showConfetti && (
                <ConfettiCannon
                    count={120}
                    fadeOut
                    explosionSpeed={350}
                    fallSpeed={2800}
                    origin={{ x: width / 2, y: 0 }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        marginBottom: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1d0101ff',
        letterSpacing: 1,
    },
    statusContainer: {
        marginVertical: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        width: '70%',
        backgroundColor: '#c4eedcff',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    statusText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#784575',
        textAlign: 'center',
    },
    board: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        marginTop: 10,
    },
    square: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        elevation: 2,
    },
    squareText: {
        fontSize: 48,
        fontWeight: '900',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '70%',
        alignSelf: 'center',
        paddingVertical: 16,
        paddingHorizontal: 25,
        borderRadius: 35,
        backgroundColor: '#4dd0e1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
        marginTop: 10,
    },
    resetButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
    rulesContainer: {
        marginVertical: 20,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 12,
        width: '90%',
        backgroundColor: '#c4eedcff',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        gap: 10,
    },
    rulesTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#784575',
        textAlign: 'center',
    },
    rulesText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#784575',
        textAlign: 'center',
    },
});

export default TicTacToeScreen;
