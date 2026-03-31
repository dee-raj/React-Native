import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SYMBOLS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉', '🍑', '🍋', '🍐', '🥭', '🍅', '🥥', '🍊', '🍈', '🥦', '🌽', '🍕', '🍔', '🍟', '🍦', '🍩', '🍬', '🍭', '🍪', '🍫', '🎁', '🎂', '🎈', '🎉', '🌟'];

const ONET_LEVELS_KEY = '@onet_master_levels';

/* ---------- Modern Color Palette ---------- */
const COLORS = {
    // Rich gradient backgrounds
    bgStart: "#667eea",
    bgMid: "#764ba2",
    bgEnd: "#f093fb",

    // Vibrant accents
    primaryStart: "#F857A6",
    primaryEnd: "#FF5858",

    secondaryStart: "#667eea",
    secondaryEnd: "#764ba2",

    successStart: "#10B981",
    successEnd: "#059669",

    accentStart: "#06B6D4",
    accentEnd: "#0891B2",

    // Neon colors
    neonPurple: "#9333EA",
    neonPink: "#F472B6",
    neonCyan: "#06B6D4",
    neonGreen: "#10B981",
    neonYellow: "#FCD34D",

    // Text
    textWhite: "#FFFFFF",
    textDark: "#1F2937",
    textGrey: "#94A3B8",
};

const getLevelConfig = (lvl) => {
    if (lvl === 1) return { rows: 4, cols: 4 };
    if (lvl === 2) return { rows: 5, cols: 6 };
    if (lvl === 3) return { rows: 6, cols: 6 };
    if (lvl === 4) return { rows: 6, cols: 8 };
    if (lvl === 5) return { rows: 7, cols: 8 };
    return { rows: 8, cols: 8 };
};

/* ---------- Animated Background Orbs ---------- */
const BackgroundOrbs = () => {
    const orbs = [
        { top: 80, left: -30, size: 150, colors: [COLORS.primaryStart, COLORS.primaryEnd] },
        { top: 250, right: -50, size: 200, colors: [COLORS.secondaryStart, COLORS.secondaryEnd] },
        { bottom: 150, left: 30, size: 120, colors: [COLORS.successStart, COLORS.successEnd] },
        { top: SCREEN_HEIGHT * 0.5, right: 20, size: 140, colors: [COLORS.accentStart, COLORS.accentEnd] },
        { bottom: 250, right: 80, size: 100, colors: [COLORS.neonPink, "#EE5253"] },
    ];

    return (
        <View style={StyleSheet.absoluteFill}>
            {orbs.map((orb, i) => (
                <LinearGradient
                    key={i}
                    colors={orb.colors}
                    style={{
                        position: "absolute",
                        top: orb.top,
                        left: orb.left,
                        right: orb.right,
                        bottom: orb.bottom,
                        width: orb.size,
                        height: orb.size,
                        borderRadius: orb.size / 2,
                        opacity: 0.2,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            ))}
        </View>
    );
};

const Tile = ({ symbol, isSelected, onPress, size }) => {
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!symbol) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.spring(scale, { toValue: 0, friction: 5, useNativeDriver: true }),
                Animated.timing(rotation, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
        } else {
            opacity.setValue(1);
            scale.setValue(1);
            rotation.setValue(0);
        }
    }, [symbol, opacity, scale, rotation]);

    if (!symbol) return <View style={[styles.cell, styles.emptyCell, { width: size, height: size }]} />;

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    return (
        <Animated.View style={{ opacity, transform: [{ scale }, { rotate: spin }] }}>
            <Pressable
                style={[
                    styles.cell,
                    { width: size, height: size },
                    isSelected && styles.selectedCell,
                ]}
                onPress={onPress}
            >
                <LinearGradient
                    colors={isSelected
                        ? [COLORS.neonPink, "#EE5253"]
                        : ["rgba(255,255,255,0.95)", "rgba(249,250,251,0.95)"]
                    }
                    style={styles.tileGradient}
                >
                    {/* Inner glow */}
                    <View style={[
                        styles.tileInnerGlow,
                        isSelected && { backgroundColor: 'rgba(255,255,255,0.35)' }
                    ]} />

                    <Text style={[styles.cellText, { fontSize: size * 0.55 }]}>{symbol}</Text>
                </LinearGradient>
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

    const shuffleGrid = useCallback((gridToShuffle) => {
        const sourceGrid = gridToShuffle || grid;
        const flatTiles = sourceGrid?.flat().filter(t => t !== null);
        flatTiles.sort(() => Math.random() - 0.5);

        const newGrid = [];
        let index = 0;
        for (let r = 0; r < gridConfig.rows; r++) {
            newGrid[r] = [];
            for (let c = 0; c < gridConfig.cols; c++) {
                if (sourceGrid[r][c] !== null) {
                    newGrid[r][c] = flatTiles[index++];
                } else {
                    newGrid[r][c] = null;
                }
            }
        }
        setGrid(newGrid);
        setSelected(null);

        if (flatTiles.length > 0 && !findAvailableMoves(newGrid, gridConfig.rows, gridConfig.cols)) {
            setTimeout(() => shuffleGrid(newGrid), 100);
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
                        setTimeout(() => shuffleGrid(newGrid), 1000);
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
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={[COLORS.bgStart, COLORS.bgMid, COLORS.bgEnd]}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <BackgroundOrbs />

                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                            style={styles.backBtnGradient}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
                        </LinearGradient>
                    </Pressable>

                    <LinearGradient
                        colors={[COLORS.primaryStart, COLORS.primaryEnd]}
                        style={styles.levelBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.levelText}>LEVEL {level}</Text>
                    </LinearGradient>

                    <View style={styles.statsBox}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.95)', 'rgba(249,250,251,0.95)']}
                            style={styles.statsBoxGradient}
                        >
                            <Ionicons name="grid-outline" size={18} color={COLORS.neonPurple} />
                            <Text style={styles.statsText}>{remainingPairs}</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Grid */}
                <View style={styles.gridWrapper}>
                    <View style={[styles.gridContainer, { width: gridConfig.cols * (cellSize + 2) + 20 }]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']}
                            style={styles.gridBackground}
                        >
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
                        </LinearGradient>
                    </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <Pressable
                        onPress={shuffleGrid}
                        style={styles.footerBtn}
                    >
                        <LinearGradient
                            colors={[COLORS.accentStart, COLORS.accentEnd]}
                            style={styles.footerBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.btnInnerGlow} />
                            <Ionicons name="shuffle-outline" size={24} color={COLORS.textWhite} />
                            <Text style={styles.footerBtnText}>Shuffle</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable
                        onPress={() => initGame(level)}
                        style={styles.footerBtn}
                    >
                        <LinearGradient
                            colors={[COLORS.successStart, COLORS.successEnd]}
                            style={styles.footerBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.btnInnerGlow} />
                            <Ionicons name="refresh-outline" size={24} color={COLORS.textWhite} />
                            <Text style={styles.footerBtnText}>Restart</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Review Modal */}
                {showReview && (
                    <View style={styles.overlay}>
                        <LinearGradient
                            colors={[COLORS.successStart, COLORS.successEnd]}
                            style={styles.reviewBox}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.reviewIconWrap}>
                                <Text style={styles.reviewIcon}>🎉</Text>
                            </View>

                            <Text style={styles.reviewTitle}>Congratulations!</Text>
                            <Text style={styles.reviewSubtitle}>Level {level} Cleared</Text>

                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{attempts}</Text>
                                    <Text style={styles.statLabel}>Total Moves</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{failures}</Text>
                                    <Text style={styles.statLabel}>Failures</Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={nextLevel}
                                style={styles.nextBtnWrapper}
                            >
                                <LinearGradient
                                    colors={['#FFFFFF', '#F9FAFB']}
                                    style={styles.nextBtn}
                                >
                                    <Text style={styles.nextBtnText}>Next Level</Text>
                                    <Ionicons name="arrow-forward" size={24} color={COLORS.successStart} />
                                </LinearGradient>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.goBack()}
                                style={styles.backToMenuBtn}
                            >
                                <Text style={styles.backToMenuText}>Back to Menu</Text>
                            </Pressable>
                        </LinearGradient>
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
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bgStart,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    backBtnGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 24,
    },
    levelBadge: {
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 24,
        elevation: 8,
        shadowColor: COLORS.primaryEnd,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    levelText: {
        color: COLORS.textWhite,
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    statsBox: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    statsBoxGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: COLORS.neonPurple,
        borderRadius: 16,
    },
    statsText: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.neonPurple,
    },
    gridWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    gridBackground: {
        padding: 10,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    cell: {
        margin: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 4,
    },
    tileGradient: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        overflow: 'hidden',
        position: 'relative',
    },
    tileInnerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    selectedCell: {
        elevation: 8,
        shadowColor: COLORS.neonPink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
    emptyCell: {
        backgroundColor: 'transparent',
        elevation: 0,
    },
    cellText: {
        textAlign: 'center',
        zIndex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 20,
    },
    footerBtn: {
        width: 160,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    footerBtnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },
    btnInnerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '35%',
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    footerBtnText: {
        color: COLORS.textWhite,
        fontSize: 18,
        fontWeight: '900',
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        zIndex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        paddingHorizontal: 20,
    },
    reviewBox: {
        width: '100%',
        maxWidth: 400,
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        elevation: 20,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    reviewIconWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    reviewIcon: {
        fontSize: 56,
    },
    reviewTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.textWhite,
        marginBottom: 8,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    reviewSubtitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 28,
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.textWhite,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
    },
    statDivider: {
        width: 2,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    nextBtnWrapper: {
        width: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 12,
        elevation: 8,
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 64,
        borderWidth: 2,
        borderColor: 'rgba(16,16,16,0.4)',
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },

    nextBtnText: {
        color: COLORS.successStart,
        fontSize: 22,
        fontWeight: '900',
    },
    backToMenuBtn: {
        paddingVertical: 12,
    },
    backToMenuText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default OnetMasterScreen;
