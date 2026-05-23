import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import { globalstyles } from '../../style/GlobalStyle';
import Card from '../../shared/Card';
import soundManager from '../../shared/SoundManager';
import dailyChallengeManager from '../../shared/DailyChallengeManager';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LOG_KEY = '@sliding_puzzle_levels';

const getLevelConfig = (lvl) => {
    if (lvl === 1) return { size: 3 };
    if (lvl <= 5) return { size: 4 };
    return { size: 5 };
};

const SlidingPuzzleScreen = ({ navigation, route }) => {
    const { level: startLevel } = route.params || { level: 1 };

    const [level, setLevel] = useState(startLevel);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [grid, setGrid] = useState([]);
    const [gridConfig, setGridConfig] = useState(getLevelConfig(startLevel));
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [timeTaken, setTimeTaken] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [isSolved, setIsSolved] = useState(false);

    const timerRef = useRef(null);

    const loadProgress = async () => {
        try {
            const saved = await AsyncStorage.getItem(LOG_KEY);
            if (saved !== null) {
                const { completed } = JSON.parse(saved);
                setCompletedLevels(completed || []);
            }
        } catch (e) {
            console.error('Failed to load Sliding Puzzle progress', e);
        }
    };

    const saveProgress = async (currentLvl, completed) => {
        try {
            await AsyncStorage.setItem(LOG_KEY, JSON.stringify({
                currentLevel: currentLvl,
                completed
            }));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    };

    const isSolvable = (arr, size) => {
        let inversions = 0;
        const flat = arr.filter(x => x !== null);
        for (let i = 0; i < flat.length; i++) {
            for (let j = i + 1; j < flat.length; j++) {
                if (flat[i] > flat[j]) inversions++;
            }
        }

        if (size % 2 !== 0) {
            return inversions % 2 === 0;
        } else {
            const emptyRowFromBottom = size - Math.floor(arr.indexOf(null) / size);
            if (emptyRowFromBottom % 2 === 0) {
                return inversions % 2 !== 0;
            } else {
                return inversions % 2 === 0;
            }
        }
    };

    const initGame = useCallback((lvl) => {
        const config = getLevelConfig(lvl);
        setGridConfig(config);

        let tiles = Array.from({ length: config.size * config.size - 1 }, (_, i) => i + 1);
        tiles.push(null); // Empty space

        // Shuffle until solvable
        let shuffleAttempts = 0;
        do {
            tiles.sort(() => Math.random() - 0.5);
            shuffleAttempts++;
            if (shuffleAttempts >= 1000) break;
        } while (!isSolvable(tiles, config.size) || isSorted(tiles));

        const newGrid = [];
        for (let i = 0; i < config.size; i++) {
            newGrid.push(tiles.slice(i * config.size, (i + 1) * config.size));
        }

        setGrid(newGrid);
        setMoves(0);
        setTimeTaken(0);
        setStartTime(Date.now());
        setIsSolved(false);
        setShowReview(false);
        setShowConfetti(false);
    }, []);

    const isSorted = (tiles) => {
        for (let i = 0; i < tiles.length - 1; i++) {
            if (tiles[i] !== i + 1) return false;
        }
        return tiles[tiles.length - 1] === null;
    };

    useEffect(() => {
        loadProgress();
        initGame(level);
        return () => clearInterval(timerRef.current);
    }, [level, initGame]);

    useEffect(() => {
        if (startTime && !isSolved) {
            timerRef.current = setInterval(() => {
                setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [startTime, isSolved]);

    const handlePress = (r, c) => {
        if (isSolved) return;

        const size = gridConfig.size;
        let emptyR, emptyC;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === null) {
                    emptyR = i;
                    emptyC = j;
                }
            }
        }

        const isAdjacent = (Math.abs(r - emptyR) === 1 && c === emptyC) ||
            (Math.abs(c - emptyC) === 1 && r === emptyR);

        if (isAdjacent) {
            soundManager.playSlide();
            const newGrid = grid.map(row => [...row]);
            newGrid[emptyR][emptyC] = grid[r][c];
            newGrid[r][c] = null;
            setGrid(newGrid);
            setMoves(prev => prev + 1);

            const flat = newGrid.flat();
            if (isSorted(flat)) {
                setIsSolved(true);
                const nextLvl = level + 1;
                const newCompleted = [...new Set([...completedLevels, level])].sort((a, b) => a - b);
                setCompletedLevels(newCompleted);
                saveProgress(nextLvl, newCompleted);
                soundManager.playWin();
                dailyChallengeManager.completeGame('sliding');

                // Paced celebration
                setTimeout(() => setShowConfetti(true), 300);
                setTimeout(() => setShowReview(true), 800);
            }
        }
    };

    const nextLevel = () => {
        const nextLvl = level + 1;
        setLevel(nextLvl);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={globalstyles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Back</Text>
                </Pressable>
                <View>
                    <Text style={styles.lvlTitle}>Level {level}</Text>
                    <Text style={styles.gridInfo}>{gridConfig.size}x{gridConfig.size}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>TIME</Text>
                    <Text style={styles.statValue}>{formatTime(timeTaken)}</Text>
                </View>
            </View>

            <View style={styles.gameArea}>
                <View style={[styles.grid, { width: SCREEN_WIDTH - 40, height: SCREEN_WIDTH - 40 }]}>
                    {grid.map((row, r) => (
                        <View key={r} style={styles.row}>
                            {row.map((cell, c) => (
                                <Pressable
                                    key={c}
                                    onPress={() => handlePress(r, c)}
                                    style={[
                                        styles.tile,
                                        {
                                            width: (SCREEN_WIDTH - 50) / gridConfig.size,
                                            height: (SCREEN_WIDTH - 50) / gridConfig.size,
                                            backgroundColor: cell === null ? 'transparent' : '#784575'
                                        }
                                    ]}
                                >
                                    {cell !== null && (
                                        <Text style={styles.tileText}>{cell}</Text>
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>MOVES</Text>
                    <Text style={styles.statValue}>{moves}</Text>
                </View>
                <Pressable onPress={() => initGame(level)} style={styles.restartBtn}>
                    <Card backgroundColor="#ACFEDB">
                        <Text style={globalstyles.textStyle}>Restart</Text>
                    </Card>
                </Pressable>
            </View>

            {showReview && (
                <View style={styles.overlay}>
                    <View style={styles.reviewBox}>
                        <Text style={styles.congratsText}>Congratulations!</Text>
                        <View style={styles.divider} />
                        <Text style={styles.levelSolvedText}>Level {level} Solved</Text>

                        <View style={styles.reviewStatsRow}>
                            <View style={styles.reviewStatItem}>
                                <Text style={styles.reviewLabel}>MOVES</Text>
                                <Text style={styles.reviewValue}>{moves}</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.reviewStatItem}>
                                <Text style={styles.reviewLabel}>TIME</Text>
                                <Text style={styles.reviewValue}>{formatTime(timeTaken)}</Text>
                            </View>
                        </View>

                        <Pressable onPress={nextLevel} style={styles.nextBtn}>
                            <Card backgroundColor="#4caf50">
                                <Text style={[globalstyles.textStyle, { color: '#fff', fontSize: 20 }]}>Next Level</Text>
                            </Card>
                        </Pressable>
                    </View>
                </View>
            )}

            {showConfetti && (
                <ConfettiCannon
                    count={150}
                    origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
                    fadeOut={true}
                    fallSpeed={3000}
                    explosionSpeed={350}
                    onAnimationEnd={() => setShowConfetti(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 20,
    },
    backBtn: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#784575',
    },
    lvlTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    gridInfo: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    statBox: {
        backgroundColor: '#784575',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
        minWidth: 70,
    },
    statLabel: {
        color: '#FACAF7',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        backgroundColor: '#bbada0',
        padding: 6,
        borderRadius: 12,
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    tile: {
        margin: 3,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    tileText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 25,
    },
    statItem: {
        alignItems: 'center',
        width: 100,
        backgroundColor: '#784575',
        padding: 5,
        borderRadius: 5,
    },
    restartBtn: {
        width: 150,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    reviewBox: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 24,
        width: '88%',
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
    },
    congratsText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#4caf50',
        marginBottom: 8,
    },
    divider: {
        height: 4,
        width: 60,
        backgroundColor: '#ACFEDB',
        borderRadius: 2,
        marginBottom: 15,
    },
    levelSolvedText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 25,
    },
    reviewStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f8f9fa',
        paddingVertical: 20,
        borderRadius: 16,
        marginBottom: 30,
    },
    reviewStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#ddd',
    },
    reviewLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    reviewValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#784575',
    },
    nextBtn: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
});

export default SlidingPuzzleScreen;
