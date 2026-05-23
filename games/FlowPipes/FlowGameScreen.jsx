import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, PanResponder, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import { globalstyles } from '../../style/GlobalStyle';
import Card from '../../shared/Card';
import soundManager from '../../shared/SoundManager';
import dailyChallengeManager from '../../shared/DailyChallengeManager';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LOG_KEY = '@flow_pipes_levels';
const MAX_LEVEL = 21;

const COLORS = ['#FF4136', '#2ECC40', '#0074D9', '#FFDC00', '#B10DC9', '#7FDBFF', '#FF851B', '#39CCCC', '#85144b', '#01FF70'];

/**
 * PATH-FIRST GENERATION:
 * Guarantees 100% solvability and 100% board fill capacity.
 */
const generatePathFirstLevel = (lvl) => {
    const size = lvl <= 5 ? 5 : lvl <= 12 ? 6 : lvl <= 18 ? 7 : 8;
    const targetPathCount = lvl <= 3 ? 3 : lvl <= 7 ? 4 : lvl <= 12 ? 5 : lvl <= 18 ? 6 : 7;

    let attempts = 0;
    while (attempts < 200) {
        attempts++;
        const grid = Array.from({ length: size }, () => Array(size).fill(null));
        const paths = [];
        let occupied = 0;
        let pIdCounter = 0;

        const getEmptyCells = () => {
            const empty = [];
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (grid[r][c] === null) empty.push({ r, c });
                }
            }
            return empty;
        };

        while (occupied < size * size) {
            const empty = getEmptyCells();
            if (empty.length === 0) break;

            let start = empty[Math.floor(Math.random() * empty.length)];
            let path = [start];
            grid[start.r][start.c] = pIdCounter;
            occupied++;

            while (true) {
                const last = path[path.length - 1];
                const neighbors = [];
                [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                    const nr = last.r + dr;
                    const nc = last.c + dc;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === null) {
                        neighbors.push({ r: nr, c: nc });
                    }
                });
                if (neighbors.length === 0) break;
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                path.push(next);
                grid[next.r][next.c] = pIdCounter;
                occupied++;
            }

            if (path.length < 2) {
                let merged = false;
                const pCell = path[0];
                const adjPathDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                for (const [dr, dc] of adjPathDirs) {
                    const nr = pCell.r + dr;
                    const nc = pCell.c + dc;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] !== null && grid[nr][nc] !== pIdCounter) {
                        const targetId = grid[nr][nc];
                        const targetPath = paths[targetId];
                        if (targetPath) {
                            if (targetPath.p1.r === nr && targetPath.p1.c === nc) {
                                targetPath.p1 = pCell;
                                grid[pCell.r][pCell.c] = targetId;
                                merged = true; break;
                            } else if (targetPath.p2.r === nr && targetPath.p2.c === nc) {
                                targetPath.p2 = pCell;
                                grid[pCell.r][pCell.c] = targetId;
                                merged = true; break;
                            }
                        }
                    }
                }
                if (!merged) { occupied = 1000; break; }
            } else {
                paths[pIdCounter] = {
                    id: pIdCounter,
                    color: COLORS[pIdCounter % COLORS.length],
                    p1: path[0],
                    p2: path[path.length - 1]
                };
                pIdCounter++;
            }
        }
        const finalPaths = Object.values(paths);
        if (occupied === size * size && finalPaths.length >= targetPathCount) return { size, dots: finalPaths };
    }
    // High-safety fallback
    return {
        size: 5, dots: [
            { id: 0, color: COLORS[0], p1: { r: 1, c: 1 }, p2: { r: 3, c: 1 } },
            { id: 1, color: COLORS[1], p1: { r: 1, c: 3 }, p2: { r: 3, c: 3 } },
            { id: 2, color: COLORS[2], p1: { r: 0, c: 0 }, p2: { r: 0, c: 4 } }
        ]
    };
};

const FlowGameScreen = ({ navigation, route }) => {
    const { level: startLevel } = route.params || { level: 1 };
    const [level, setLevel] = useState(startLevel);
    const [completedLevels, setCompletedLevels] = useState([]);

    // Core state
    const [config, setConfig] = useState(null);
    const [grid, setGrid] = useState([]);
    const [paths, setPaths] = useState({}); // { [id]: [{r,c}, ...] }
    const [activePathId, setActivePathId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [gameWon, setGameWon] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeTaken, setTimeTaken] = useState(0);
    const [filledCellsCount, setFilledCellsCount] = useState(0);

    const gridLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const isMountedRef = useRef(true);

    // Refs for synchronization in PanResponder
    const gridRef = useRef([]);
    const pathsRef = useRef({});
    const activePathIdRef = useRef(null);
    const configRef = useRef(null);
    const gameWonRef = useRef(false);
    const filledCountRef = useRef(0);
    const startTimeRef = useRef(Date.now());
    const levelRef = useRef(level);
    const [isSaving, setIsSaving] = useState(false);

    // Sync refs
    useEffect(() => { levelRef.current = level; }, [level]);
    useEffect(() => { gridRef.current = grid; }, [grid]);
    useEffect(() => { pathsRef.current = paths; }, [paths]);
    useEffect(() => { activePathIdRef.current = activePathId; }, [activePathId]);
    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { gameWonRef.current = gameWon; }, [gameWon]);
    useEffect(() => { filledCountRef.current = filledCellsCount; }, [filledCellsCount]);

    const initGame = useCallback((lvl) => {
        const now = Date.now();

        startTimeRef.current = now;   // ✅ THIS is what matters
        setStartTime(now);            // (optional, only for UI)
        setTimeTaken(0);

        setLoading(true);
        setGrid([]);
        setPaths({});
        setActivePathId(null);
        setGameWon(false);
        setShowConfetti(false);
        setFilledCellsCount(0);
        configRef.current = null;
        gameWonRef.current = false;
        filledCountRef.current = 0;

        setTimeout(() => {
            const levelData = generatePathFirstLevel(lvl);
            const newGrid = Array.from({ length: levelData.size }, () => Array(levelData.size).fill(null));
            let initialFilled = 0;
            levelData.dots.forEach(dot => {
                newGrid[dot.p1.r][dot.p1.c] = { id: dot.id, color: dot.color, isDot: true };
                newGrid[dot.p2.r][dot.p2.c] = { id: dot.id, color: dot.color, isDot: true };
                initialFilled += 2;
            });
            setConfig(levelData);
            setGrid(newGrid);
            setPaths({});
            setFilledCellsCount(initialFilled);
            filledCountRef.current = initialFilled;
            setLoading(false);
        }, 50);
    }, []);

    useEffect(() => {
        const load = async () => {
            const saved = await AsyncStorage.getItem(LOG_KEY);
            let completed = [];
            let currentLevel = 1;

            if (saved) {
                const parsed = JSON.parse(saved);
                completed = parsed.completed || [];
                currentLevel = parsed.currentLevel || 1;
            }

            // Ensure all levels before startLevel are marked as completed
            const preLevels = Array.from({ length: startLevel - 1 }, (_, i) => i + 1);
            completed = Array.from(new Set([...completed, ...preLevels])).sort((a, b) => a - b);

            setCompletedLevels(completed);
        };
        load();
        initGame(level);
    }, [level, initGame]);

    const calculateFilledCells = (currentPaths, currentConfig) => {
        if (!currentConfig) return 0;
        const filled = new Set();
        // Dots are permanent
        currentConfig.dots.forEach(d => {
            filled.add(`${d.p1.r},${d.p1.c}`);
            filled.add(`${d.p2.r},${d.p2.c}`);
        });
        // Add path cells
        Object.values(currentPaths).forEach(path => {
            path.forEach(cell => filled.add(`${cell.r},${cell.c}`));
        });
        return filled.size;
    };

    const checkWin = (currentPaths) => {
        const currentConfig = configRef.current;
        if (!currentConfig || !currentPaths) return false;

        // 1. All dots must be connected to their partners
        const allConnected = currentConfig.dots.every(dot => {
            const path = currentPaths[dot.id];
            if (!path || path.length < 2) return false;
            const start = path[0], end = path[path.length - 1];
            return (
                (start.r === dot.p1.r && start.c === dot.p1.c && end.r === dot.p2.r && end.c === dot.p2.c) ||
                (start.r === dot.p2.r && start.c === dot.p2.c && end.r === dot.p1.r && end.c === dot.p1.c)
            );
        });
        if (!allConnected) return false;

        // 2. O(1) Board Fill Check (using Ref count)
        const totalCells = currentConfig.size * currentConfig.size;
        return filledCountRef.current === totalCells;
    };

    const handleTouch = (pageX, pageY) => {
        const currentConfig = configRef.current;
        if (gameWonRef.current || !gridRef.current || gridRef.current.length === 0 || !currentConfig) return;

        const cellSize = (SCREEN_WIDTH - 40) / currentConfig.size;
        const x = pageX - gridLayout.current.x;
        const y = pageY - gridLayout.current.y;
        const c = Math.floor(x / cellSize);
        const r = Math.floor(y / cellSize);

        if (r < 0 || r >= currentConfig.size || c < 0 || c >= currentConfig.size) return;
        if (!gridRef.current[r]) return;

        const cell = gridRef.current[r][c];
        const currentActiveId = activePathIdRef.current;

        if (currentActiveId === null) {
            // Pick up a path or start at a dot
            if (cell && cell.isDot) {
                const dotId = cell.id;
                activePathIdRef.current = dotId;
                setActivePathId(dotId);
                const newPaths = { ...pathsRef.current, [dotId]: [{ r, c }] };
                pathsRef.current = newPaths;
                setPaths(newPaths);
                const newFilled = calculateFilledCells(newPaths, currentConfig);
                setFilledCellsCount(newFilled);
                filledCountRef.current = newFilled;
            } else {
                for (const pId in pathsRef.current) {
                    const idx = pathsRef.current[pId].findIndex(p => p.r === r && p.c === c);
                    if (idx !== -1) {
                        const numericId = parseInt(pId);
                        activePathIdRef.current = numericId;
                        setActivePathId(numericId);
                        const newPaths = { ...pathsRef.current, [pId]: pathsRef.current[pId].slice(0, idx + 1) };
                        pathsRef.current = newPaths;
                        setPaths(newPaths);
                        const newFilled = calculateFilledCells(newPaths, currentConfig);
                        setFilledCellsCount(newFilled);
                        filledCountRef.current = newFilled;
                        break;
                    }
                }
            }
        } else {
            // Drawing a path
            const currentPath = pathsRef.current[currentActiveId];
            if (!currentPath || currentPath.length === 0) return;
            const last = currentPath[currentPath.length - 1];
            if (last.r === r && last.c === c) return;
            if (Math.abs(last.r - r) + Math.abs(last.c - c) !== 1) return;

            // Cannot pass through a dot of a DIFFERENT color
            if (cell && cell.isDot && cell.id !== currentActiveId) return;

            // Cannot loop directly back to start dot
            if (cell && cell.isDot && cell.id === currentActiveId && currentPath[0].r === r && currentPath[0].c === c) return;

            const newPaths = { ...pathsRef.current };
            // Clear space in other paths (can't cross)
            for (const pId in newPaths) {
                if (parseInt(pId) !== currentActiveId) {
                    newPaths[pId] = newPaths[pId].filter(p => !(p.r === r && p.c === c));
                }
            }

            const existingIdx = currentPath.findIndex(p => p.r === r && p.c === c);
            if (existingIdx !== -1) {
                newPaths[currentActiveId] = currentPath.slice(0, existingIdx + 1);
            } else {
                newPaths[currentActiveId] = [...currentPath, { r, c }];
            }

            pathsRef.current = newPaths;
            setPaths(newPaths);
            const newFilled = calculateFilledCells(newPaths, currentConfig);
            setFilledCellsCount(newFilled);
            filledCountRef.current = newFilled;
            soundManager.playConnect();
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY),
            onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY),
            onPanResponderRelease: async () => {
                const frozenActiveId = activePathIdRef.current;
                setActivePathId(null);
                activePathIdRef.current = null;
                const finalPaths = pathsRef.current;
                if (checkWin(finalPaths)) {
                    const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    setTimeTaken(finalTime);
                    gameWonRef.current = true;
                    soundManager.playWin();
                    dailyChallengeManager.completeGame('flow');
                    setIsSaving(true);
                    await saveProgress(levelRef.current);
                    if (isMountedRef.current) {
                        setIsSaving(false);
                        setGameWon(true);
                        setShowConfetti(true);
                    }
                }
            },
        })
    ).current;

    const saveProgress = async (completedLevel) => {
        try {
            const saved = await AsyncStorage.getItem(LOG_KEY);
            let completed = [];
            let currentLvl = 1;

            if (saved) {
                const parsed = JSON.parse(saved);
                completed = parsed.completed || [];
                currentLvl = parsed.currentLevel || 1;
            }

            // Mark the completed level
            const newCompleted = Array.from(new Set([...completed, completedLevel])).sort((a, b) => a - b);

            // If the completed level is the current unlock-limit, increment it
            let nextUnlock = currentLvl;
            if (completedLevel >= currentLvl) {
                nextUnlock = Math.min(completedLevel + 1, MAX_LEVEL);
            }

            await AsyncStorage.setItem(
                LOG_KEY,
                JSON.stringify({ currentLevel: nextUnlock, completed: newCompleted })
            );

            setCompletedLevels(newCompleted);
        } catch (e) {
            console.error('Save Progress Error', e);
        }
    };

    const nextLevel = () => {
        if (level < MAX_LEVEL) {
            const nl = level + 1;
            setLevel(nl);
            initGame(nl);
        } else {
            navigation.goBack();
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60), s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading || !config) {
        return (
            <View style={[globalstyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#784575" />
                <Text style={{ marginTop: 20, fontSize: 18, color: '#784575', fontWeight: 'bold' }}>Weaving Pipes...</Text>
            </View>
        );
    }

    const cellSize = (SCREEN_WIDTH - 40) / config.size;

    return (
        <View style={globalstyles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}><Text style={styles.backBtn}>← Back</Text></Pressable>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.lvlTitle}>Level {level}</Text>
                    <Text style={styles.infoText}>{config.size}x{config.size} • Pipes: {config.dots.length} • Fill: {filledCellsCount}/{config.size * config.size}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>TIME</Text>
                    <Text style={styles.statValue}>{formatTime(gameWon ? timeTaken : Math.floor((Date.now() - startTimeRef.current) / 1000))}</Text>
                </View>
            </View>

            <View style={styles.gameContainer} {...panResponder.panHandlers}>
                <View
                    style={[styles.gridContainer, { width: SCREEN_WIDTH - 40, height: SCREEN_WIDTH - 40 }]}
                    onLayout={(e) => {
                        e.target.measure((x, y, w, h, px, py) => {
                            gridLayout.current = { x: px, y: py, width: w, height: h };
                        });
                    }}
                >
                    {grid.map((row, r) => (
                        <View key={r} style={styles.row}>
                            {row.map((cell, c) => {
                                let pColor = null, isP = false;
                                Object.entries(paths).forEach(([pId, path]) => {
                                    if (path.some(p => p.r === r && p.c === c)) {
                                        const dotConfig = config.dots.find(d => d.id === parseInt(pId));
                                        pColor = dotConfig?.color;
                                        isP = true;
                                    }
                                });
                                return (
                                    <View key={c} style={[styles.cell, { width: cellSize, height: cellSize }]}>
                                        {isP && <View style={[styles.pathNode, { backgroundColor: pColor }]} />}
                                        {cell?.isDot && <View style={[styles.dot, { backgroundColor: cell.color }]} />}
                                        {Object.entries(paths).map(([pId, path]) => {
                                            const dotConfig = config.dots.find(d => d.id === parseInt(pId));
                                            const col = dotConfig?.color;
                                            const idx = path.findIndex(p => p.r === r && p.c === c);
                                            if (idx === -1) return null;
                                            return (
                                                <React.Fragment key={pId}>
                                                    {idx > 0 && <View style={[styles.connector, { backgroundColor: col }, getConnectionStyle(path[idx - 1], { r, c }, cellSize)]} />}
                                                    {idx < path.length - 1 && <View style={[styles.connector, { backgroundColor: col }, getConnectionStyle(path[idx + 1], { r, c }, cellSize)]} />}
                                                </React.Fragment>
                                            );
                                        })}
                                    </View>
                                )
                            })}
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Pressable onPress={() => initGame(level)} style={styles.resetBtn}>
                    <Card backgroundColor="#ACFEDB"><Text style={globalstyles.textStyle}>Reset Level</Text></Card>
                </Pressable>
            </View>

            <Modal visible={gameWon} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.winTitle}>Congratulations!</Text>
                        <View style={styles.divider} />
                        <Text style={styles.winSub}>Level {level} Solved</Text>
                        <View style={styles.statBoxLarge}>
                            <Text style={styles.statLabelLarge}>SOLVED IN</Text>
                            <Text style={styles.statValueLarge}>{formatTime(timeTaken)}</Text>
                        </View>
                        <Pressable onPress={nextLevel} style={[styles.modalBtn, { opacity: isSaving ? 0.5 : 1 }]} disabled={isSaving}>
                            <Card backgroundColor="#4caf50"><Text style={[globalstyles.textStyle, { color: '#fff' }]}>
                                {level < MAX_LEVEL ? (isSaving ? "Saving..." : "Next Level") : "Finish"}
                            </Text></Card>
                        </Pressable>
                        <Pressable onPress={() => initGame(level)} style={[styles.modalBtn, { marginTop: 10, opacity: isSaving ? 0.5 : 1 }]} disabled={isSaving}>
                            <Card backgroundColor="#784575"><Text style={[globalstyles.textStyle, { color: '#fff' }]}>Replay</Text></Card>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                // If still saving, we wait? No, navigation.goBack() just needs to happen.
                                // We can just rely on the fact that if they are in the modal, saveProgress has likely finished.
                                navigation.goBack();
                            }}
                            style={[styles.modalBtn, { marginTop: 10, opacity: isSaving ? 0.5 : 1 }]}
                            disabled={isSaving}
                        >
                            <Text style={styles.menuText}>{isSaving ? "Saving..." : "Back to Menu"}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {showConfetti && <ConfettiCannon count={200} origin={{ x: SCREEN_WIDTH / 2, y: -20 }} fadeOut={true} />}
        </View>
    );
};

const getConnectionStyle = (other, self, size) => {
    const dr = other.r - self.r, dc = other.c - self.c;
    const thickness = size * 0.35, offset = (size - thickness) / 2;
    if (dr === -1) return { top: 0, left: offset, width: thickness, height: size / 2 + 1 };
    if (dr === 1) return { bottom: 0, left: offset, width: thickness, height: size / 2 + 1 };
    if (dc === -1) return { left: 0, top: offset, width: size / 2 + 1, height: thickness };
    if (dc === 1) return { right: 0, top: offset, width: size / 2 + 1, height: thickness };
    return {};
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10, marginTop: 20, marginBottom: 10 },
    backBtn: { fontSize: 18, color: '#784575', fontWeight: 'bold' },
    lvlTitle: { fontSize: 24, fontWeight: 'bold' },
    infoText: { fontSize: 12, color: '#666' },
    statBox: { backgroundColor: '#784575', padding: 8, borderRadius: 10, minWidth: 70, alignItems: 'center' },
    statLabel: { color: '#FACAF7', fontSize: 10, fontWeight: 'bold' },
    statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    gameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gridContainer: { backgroundColor: '#1a1a1a', borderRadius: 16, overflow: 'hidden', elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10 },
    row: { flexDirection: 'row' },
    cell: { borderWidth: 0.5, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
    dot: { width: '70%', height: '70%', borderRadius: 100, zIndex: 10 },
    pathNode: { width: '35%', height: '35%', borderRadius: 100, position: 'absolute' },
    connector: { position: 'absolute' },
    footer: { paddingBottom: 40, alignItems: 'center' },
    resetBtn: { width: 180 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#fff', padding: 30, borderRadius: 32, width: '85%', alignItems: 'center', elevation: 20 },
    winTitle: { fontSize: 32, fontWeight: '900', color: '#4caf50' },
    winSub: { fontSize: 18, color: '#666', marginBottom: 20 },
    divider: { height: 4, width: 60, backgroundColor: '#ACFEDB', marginVertical: 15, borderRadius: 2 },
    statBoxLarge: { alignItems: 'center', marginBottom: 30 },
    statLabelLarge: { fontSize: 12, color: '#999', fontWeight: 'bold' },
    statValueLarge: { fontSize: 44, fontWeight: '900', color: '#784575' },
    modalBtn: { width: '100%' },
    menuText: { color: '#784575', fontWeight: 'bold', marginTop: 10 },
});

export default FlowGameScreen;
