import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Pressable, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import { globalstyles } from '../../style/GlobalStyle';
import Card from '../../shared/Card';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_SIZE = 4;
const PADDING = 10;
const CONTAINER_SIZE = SCREEN_WIDTH - 40;
const CELL_MARGIN = 5;
const CELL_SIZE = (CONTAINER_SIZE - (GRID_SIZE + 1) * CELL_MARGIN) / GRID_SIZE;

const TILE_COLORS = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
};

const HIGH_SCORE_KEY = '@game_2048_high_score';

const Tile = ({ val }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (val) {
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
            ]).start();
        }
    }, [val, scaleAnim]);

    if (!val) return <View style={styles.cell} />;

    return (
        <Animated.View style={[
            styles.cell,
            { backgroundColor: TILE_COLORS[val] || '#3c3a32', transform: [{ scale: scaleAnim }] }
        ]}>
            <Text style={[
                styles.cellText,
                { color: val <= 4 ? '#776e65' : '#fff', fontSize: val > 100 ? 20 : 28 }
            ]}>
                {val}
            </Text>
        </Animated.View>
    );
};

const Game2048Screen = ({ navigation }) => {
    const [grid, setGrid] = useState(Array(16).fill(null));
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const hasWonRef = useRef(false);

    const loadHighScore = async () => {
        try {
            const saved = await AsyncStorage.getItem(HIGH_SCORE_KEY);
            if (saved !== null) setHighScore(parseInt(saved));
        } catch (e) {
            console.error('Failed to load high score', e);
        }
    };

    const saveHighScore = async (newScore) => {
        try {
            await AsyncStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
        } catch (e) {
            console.error('Failed to save high score', e);
        }
    };

    const addRandomTile = useCallback((currentGrid) => {
        const emptyIndices = currentGrid.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null);
        if (emptyIndices.length === 0) return currentGrid;
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const newGrid = [...currentGrid];
        newGrid[randomIndex] = Math.random() < 0.9 ? 2 : 4;
        return newGrid;
    }, []);

    const initGame = useCallback(() => {
        let newGrid = Array(16).fill(null);
        newGrid = addRandomTile(newGrid);
        newGrid = addRandomTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
        setShowConfetti(false);
        hasWonRef.current = false;
        loadHighScore();
    }, [addRandomTile]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (gameOver) {
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [gameOver]);


    const move = (direction) => {
        if (gameOver) return;

        let newGrid = [...grid];
        let moved = false;
        let newScore = score;

        const getIndex = (r, c) => r * GRID_SIZE + c;

        const moveLine = (line) => {
            let newLine = line.filter(v => v !== null);
            for (let i = 0; i < newLine.length - 1; i++) {
                if (newLine[i] === newLine[i + 1]) {
                    newLine[i] *= 2;
                    newScore += newLine[i];
                    newLine.splice(i + 1, 1);
                    moved = true;
                }
            }
            while (newLine.length < GRID_SIZE) {
                newLine.push(null);
            }
            return newLine;
        };

        if (direction === 'LEFT' || direction === 'RIGHT') {
            for (let r = 0; r < GRID_SIZE; r++) {
                let line = [];
                for (let c = 0; c < GRID_SIZE; c++) line.push(newGrid[getIndex(r, c)]);
                if (direction === 'RIGHT') line.reverse();
                let movedLine = moveLine(line);
                if (direction === 'RIGHT') movedLine.reverse();
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (newGrid[getIndex(r, c)] !== movedLine[c]) moved = true;
                    newGrid[getIndex(r, c)] = movedLine[c];
                }
            }
        } else if (direction === 'UP' || direction === 'DOWN') {
            for (let c = 0; c < GRID_SIZE; c++) {
                let line = [];
                for (let r = 0; r < GRID_SIZE; r++) line.push(newGrid[getIndex(r, c)]);
                if (direction === 'DOWN') line.reverse();
                let movedLine = moveLine(line);
                if (direction === 'DOWN') movedLine.reverse();
                for (let r = 0; r < GRID_SIZE; r++) {
                    if (newGrid[getIndex(r, c)] !== movedLine[r]) moved = true;
                    newGrid[getIndex(r, c)] = movedLine[r];
                }
            }
        }

        if (moved) {
            newGrid = addRandomTile(newGrid);
            setGrid(newGrid);
            setScore(newScore);

            if (newScore > highScore) {
                setHighScore(newScore);
                saveHighScore(newScore);
            }

            if (!hasWonRef.current && newGrid.includes(2048)) {
                setShowConfetti(true);
                hasWonRef.current = true;
            }

            checkGameOver(newGrid);
        }
    };

    const checkGameOver = (currentGrid) => {
        if (currentGrid.includes(null)) return;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const val = currentGrid[r * GRID_SIZE + c];
                if (c < GRID_SIZE - 1 && val === currentGrid[r * GRID_SIZE + (c + 1)]) return;
                if (r < GRID_SIZE - 1 && val === currentGrid[(r + 1) * GRID_SIZE + c]) return;
            }
        }
        setGameOver(true);
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderRelease: (evt, gestureState) => {
            const { dx, dy } = gestureState;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
            } else {
                if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
            }
        },
    });

    return (
        <View
            style={globalstyles.container}
            {...(!gameOver ? panResponder.panHandlers : {})}
        >
            <View style={styles.header}>
                <View style={styles.topRow}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>← Back</Text>
                    </Pressable>
                    <Text style={styles.title}>2048</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <View style={styles.scoreBox}>
                        <Text style={styles.scoreLabel}>SCORE</Text>
                        <Text style={styles.scoreValue}>{score}</Text>
                    </View>
                    <View style={styles.scoreBox}>
                        <Text style={styles.scoreLabel}>BEST</Text>
                        <Text style={styles.scoreValue}>{highScore}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.gridContainer}>
                {grid.map((val, idx) => (
                    <Tile key={idx} val={val} />
                ))}
            </View>

            {gameOver && (
                <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                    <View style={styles.gameOverCard}>
                        <Text style={styles.gameOverText}>Game Over</Text>

                        <Text style={styles.summaryText}>Score: {score}</Text>
                        <Text style={styles.summaryText}>Best: {highScore}</Text>
                        <Text style={styles.hintText}>Try again and beat your record!</Text>

                        <Pressable
                            onPress={initGame}
                            style={({ pressed }) => [
                                styles.resetBtn,
                                { transform: [{ scale: pressed ? 0.95 : 1 }] }
                            ]}
                        >
                            <Text style={styles.resetText}>New Game 🔄</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            )}

            {showConfetti && (
                <ConfettiCannon
                    count={200}
                    origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
                    fadeOut={true}
                    onAnimationEnd={() => setShowConfetti(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        fontSize: 16,
        fontWeight: '700',
        color: '#784575',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: '#f3e5f5',
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#776e65',
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    scoreBox: {
        backgroundColor: '#bbada0',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 80,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
    },
    scoreLabel: {
        color: '#f5f5f5',
        fontSize: 11,
        fontWeight: '700',
    },
    scoreValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
    },

    gridContainer: {
        width: CONTAINER_SIZE + 4,
        height: CONTAINER_SIZE + 4,
        backgroundColor: '#bbada0',
        borderRadius: 16,
        padding: CELL_MARGIN / 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 10,
    },

    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        margin: CELL_MARGIN / 2,
        borderRadius: 12,
        backgroundColor: '#cdc1b4',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    cellText: {
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    gameOverCard: {
        backgroundColor: '#faf8ef',
        paddingVertical: 30,
        paddingHorizontal: 40,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10,
    },
    gameOverText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#6b2424ff',
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1d731dff',
        marginTop: 6,
    },
    hintText: {
        marginTop: 10,
        color: '#888',
        fontSize: 14,
    },

    resetBtn: {
        marginTop: 30,
        alignSelf: 'center',
        backgroundColor: '#4dd0e1',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 8,
    },
    resetText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },

});

export default Game2048Screen;
