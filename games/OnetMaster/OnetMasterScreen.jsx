import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import { globalstyles } from '../../style/GlobalStyle';
import Card from '../../shared/Card';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SYMBOLS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉', '🍑', '🍋', '🍐', '🥭', '🍅', '🥥', '🍊', '🍍', '🍈', '🥦', '🌽', '🍕', '🍔', '🍟', '🍦', '🍩', '🍬', '🍭', '🍪', '🍫', '🎁', '🎂', '🎈', '🎉'];

const ONET_LEVELS_KEY = '@onet_master_levels';

const getLevelConfig = (lvl) => {
    if (lvl === 1) return { rows: 4, cols: 4 };
    if (lvl === 2) return { rows: 5, cols: 6 };
    if (lvl === 3) return { rows: 6, cols: 6 };
    if (lvl === 4) return { rows: 6, cols: 8 };
    if (lvl === 5) return { rows: 7, cols: 8 };
    return { rows: 8, cols: 8 };
};

const Tile = ({ symbol, isSelected, onPress, size }) => {
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!symbol) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 0.5, duration: 300, useNativeDriver: true }),
            ]).start();
        } else {
            opacity.setValue(1);
            scale.setValue(1);
        }
    }, [symbol, opacity, scale]);

    if (!symbol) return <View style={[styles.cell, styles.emptyCell, { width: size, height: size }]} />;

    return (
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
            <Pressable
                style={[
                    styles.cell,
                    { width: size, height: size },
                    isSelected && styles.selectedCell,
                ]}
                onPress={onPress}
            >
                <Text style={[styles.cellText, { fontSize: size * 0.6 }]}>{symbol}</Text>
            </Pressable>
        </Animated.View>
    );
};

const OnetMasterScreen = ({ navigation, route }) => {
    const { level: startLevel } = route.params || { level: 1 };

    const [level, setLevel] = useState(startLevel);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [grid, setGrid] = useState([]);
    const [gridConfig, setGridConfig] = useState(getLevelConfig(startLevel));
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [remainingPairs, setRemainingPairs] = useState(0);

    const [attempts, setAttempts] = useState(0);
    const [failures, setFailures] = useState(0);
    const [showReview, setShowReview] = useState(false);

    const loadProgress = async () => {
        try {
            const saved = await AsyncStorage.getItem(ONET_LEVELS_KEY);
            if (saved !== null) {
                const { completed } = JSON.parse(saved);
                setCompletedLevels(completed || []);
            }
        } catch (e) {
            console.error('Failed to load level progress', e);
        }
    };

    const saveProgress = async (currentLvl, completed) => {
        try {
            await AsyncStorage.setItem(ONET_LEVELS_KEY, JSON.stringify({
                currentLevel: currentLvl,
                completed
            }));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    };

    const initGame = useCallback((lvl) => {
        const config = getLevelConfig(lvl);
        setGridConfig(config);

        let cells = [];
        const totalPairs = (config.rows * config.cols) / 2;
        for (let i = 0; i < totalPairs; i++) {
            const sym = SYMBOLS[i % SYMBOLS.length];
            cells.push(sym);
            cells.push(sym);
        }
        cells.sort(() => Math.random() - 0.5);

        const finalGrid = [];
        for (let r = 0; r < config.rows; r++) {
            finalGrid[r] = [];
            for (let c = 0; c < config.cols; c++) {
                finalGrid[r][c] = cells[r * config.cols + c];
            }
        }
        setGrid(finalGrid);
        setSelected(null);
        setScore(0);
        setShowConfetti(false);
        setRemainingPairs(totalPairs);
        setAttempts(0);
        setFailures(0);
        setShowReview(false);
    }, []);

    useEffect(() => {
        loadProgress();
        initGame(level);
    }, [level, initGame]);

    const canConnect = useCallback((r1, c1, r2, c2, currentGrid, rows, cols) => {
        if (!currentGrid[r1][c1] || !currentGrid[r2][c2]) return false;
        if (currentGrid[r1][c1] !== currentGrid[r2][c2] || (r1 === r2 && c1 === c2)) return false;

        const queue = [{ r: r1, c: c1, dir: null, turns: -1 }];
        const visited = new Map();

        while (queue.length > 0) {
            const { r, c, dir, turns } = queue.shift();

            if (r === r2 && c === c2) return true;
            if (turns >= 2) continue;

            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (let [dr, dc] of directions) {
                let nr = r + dr;
                let nc = c + dc;
                let nDir = `${dr},${dc}`;
                let nTurns = dir === nDir ? turns : turns + 1;

                if (nr >= -1 && nr <= rows && nc >= -1 && nc <= cols) {
                    if ((nr === r2 && nc === c2) ||
                        nr < 0 || nr >= rows || nc < 0 || nc >= cols ||
                        currentGrid[nr][nc] === null) {

                        const key = `${nr},${nc},${nDir}`;
                        if (!visited.has(key) || visited.get(key) > nTurns) {
                            visited.set(key, nTurns);
                            queue.push({ r: nr, c: nc, dir: nDir, turns: nTurns });
                        }
                    }
                }
            }
        }
        return false;
    }, []);

    const findAvailableMoves = useCallback((currentGrid, rows, cols) => {
        const tiles = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (currentGrid[r][c]) tiles.push({ r, c, sym: currentGrid[r][c] });
            }
        }

        for (let i = 0; i < tiles.length; i++) {
            for (let j = i + 1; j < tiles.length; j++) {
                if (tiles[i].sym === tiles[j].sym) {
                    if (canConnect(tiles[i].r, tiles[i].c, tiles[j].r, tiles[j].c, currentGrid, rows, cols)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, [canConnect]);

    const shuffleGrid = useCallback(() => {
        const flatTiles = grid.flat().filter(t => t !== null);
        flatTiles.sort(() => Math.random() - 0.5);

        const newGrid = [];
        let index = 0;
        for (let r = 0; r < gridConfig.rows; r++) {
            newGrid[r] = [];
            for (let c = 0; c < gridConfig.cols; c++) {
                if (grid[r][c] !== null) {
                    newGrid[r][c] = flatTiles[index++];
                } else {
                    newGrid[r][c] = null;
                }
            }
        }
        setGrid(newGrid);
        setSelected(null);

        if (flatTiles.length > 0 && !findAvailableMoves(newGrid, gridConfig.rows, gridConfig.cols)) {
            setTimeout(shuffleGrid, 100);
        }
    }, [grid, gridConfig, findAvailableMoves]);

    const handlePress = (r, c) => {
        if (!grid[r][c]) return;

        if (!selected) {
            setSelected({ r, c });
        } else {
            setAttempts(prev => prev + 1);
            if (canConnect(selected.r, selected.c, r, c, grid, gridConfig.rows, gridConfig.cols)) {
                const newGrid = [...grid.map(row => [...row])];
                newGrid[selected.r][selected.c] = null;
                newGrid[r][c] = null;
                setGrid(newGrid);

                const newScore = score + 10;
                setScore(newScore);
                setRemainingPairs(prev => prev - 1);

                setSelected(null);

                if (newGrid.every(row => row.every(cell => cell === null))) {
                    const newCompleted = [...new Set([...completedLevels, level])].sort((a, b) => a - b);
                    setCompletedLevels(newCompleted);
                    saveProgress(level + 1, newCompleted);
                    setShowConfetti(true);
                    setTimeout(() => setShowReview(true), 500);
                } else {
                    if (!findAvailableMoves(newGrid, gridConfig.rows, gridConfig.cols)) {
                        Alert.alert("No more moves!", "Shuffling tiles...");
                        setTimeout(shuffleGrid, 1000);
                    }
                }
            } else {
                setFailures(prev => prev + 1);
                setSelected({ r, c });
            }
        }
    };

    const nextLevel = () => {
        const nextLvl = level + 1;
        setLevel(nextLvl);
        setShowReview(false);
    };

    const cellSize = (SCREEN_WIDTH - 60) / Math.max(gridConfig.cols, 6);

    return (
        <View style={globalstyles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Back</Text>
                </Pressable>
                <Text style={styles.title}>Level {level}</Text>
                <Text style={styles.statsText}>Pairs: {remainingPairs}</Text>
            </View>

            <View style={styles.gridWrapper}>
                <View style={[styles.gridContainer, { width: gridConfig.cols * (cellSize + 2) + 10 }]}>
                    {grid.map((row, r) => (
                        <View key={r} style={styles.row}>
                            {row.map((cell, c) => (
                                <Tile
                                    key={c}
                                    symbol={cell}
                                    size={cellSize}
                                    isSelected={selected?.r === r && selected?.c === c}
                                    onPress={() => handlePress(r, c)}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Pressable onPress={shuffleGrid} style={styles.footerBtn}>
                    <Card backgroundColor="#FACAF7">
                        <Text style={globalstyles.textStyle}>Shuffle</Text>
                    </Card>
                </Pressable>
                <Pressable onPress={() => initGame(level)} style={styles.footerBtn}>
                    <Card backgroundColor="#ACFEDB">
                        <Text style={globalstyles.textStyle}>Restart</Text>
                    </Card>
                </Pressable>
            </View>

            {showReview && (
                <View style={styles.overlay}>
                    <View style={styles.reviewBox}>
                        <Text style={styles.reviewTitle}>Congratulations!</Text>
                        <Text style={[styles.reviewStat, { marginBottom: 15 }]}>Level {level} Cleared</Text>
                        <Text style={styles.reviewStat}>Total Attempts: {attempts}</Text>
                        <Text style={styles.reviewStat}>Failed Attempts: {failures}</Text>

                        <Pressable onPress={nextLevel} style={styles.nextBtn}>
                            <Card backgroundColor="#4caf50">
                                <Text style={[globalstyles.textStyle, { color: '#fff' }]}>Next Level</Text>
                            </Card>
                        </Pressable>
                    </View>
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#784575',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statsText: {
        fontSize: 14,
        color: '#784575',
        fontWeight: '600',
    },
    gridWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        padding: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        elevation: 3,
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    cell: {
        margin: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedCell: {
        borderColor: '#784575',
        borderWidth: 2,
        backgroundColor: '#FACAF7',
    },
    emptyCell: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
    },
    cellText: {
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    footerBtn: {
        width: 140,
        marginHorizontal: 10,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    reviewBox: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 20,
        width: '85%',
        alignItems: 'center',
    },
    reviewTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#ff9800',
    },
    reviewStat: {
        fontSize: 18,
        marginVertical: 3,
        color: '#444',
        fontWeight: '600',
    },
    nextBtn: {
        marginTop: 25,
        width: '100%',
    }
});

export default OnetMasterScreen;
