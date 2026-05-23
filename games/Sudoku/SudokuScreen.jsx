import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfettiCannon from 'react-native-confetti-cannon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPuzzle, getDifficultyList, STORAGE_KEY, getTotalLevels } from './SudokuConfig';
import soundManager from '../../shared/SoundManager';
import dailyChallengeManager from '../../shared/DailyChallengeManager';

const { width } = Dimensions.get('window');
const GRID_PADDING = 20;
const CELL_SIZE = (width - GRID_PADDING * 2) / 9;
const COOLDOWN_SECONDS = 7;

const SudokuScreen = ({ navigation, route }) => {
    const { difficulty = 'easy', level = 0 } = route.params || {};

    const [board, setBoard] = useState([]);
    const [initialBoard, setInitialBoard] = useState([]);
    const [solution, setSolution] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [errors, setErrors] = useState(new Set());
    const [conflicts, setConflicts] = useState(new Set());
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [highlightNumber, setHighlightNumber] = useState(null);

    // Mistake / Game Over state
    const [mistakes, setMistakes] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [secondChanceUsed, setSecondChanceUsed] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [lastWrongCell, setLastWrongCell] = useState(null);

    const timerRef = useRef(null);
    const cooldownRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const gameOverAnim = useRef(new Animated.Value(0)).current;

    const diffConfig = getDifficultyList().find(d => d.id === difficulty) || { label: 'Easy', color: '#10B981', lives: 5 };
    const maxMistakes = diffConfig.lives || 5;
    const isInputBlocked = gameOver || cooldown > 0 || gameWon;

    // Initialize puzzle
    useEffect(() => {
        const puzzleData = getPuzzle(difficulty, level);
        if (puzzleData) {
            setBoard(puzzleData.puzzle.map(row => [...row]));
            setInitialBoard(puzzleData.puzzle.map(row => [...row]));
            setSolution(puzzleData.solution);
            setSelectedCell(null);
            setErrors(new Set());
            setConflicts(new Set());
            setMoves(0);
            setTimer(0);
            setGameWon(false);
            setShowConfetti(false);
            setHighlightNumber(null);
            setMistakes(0);
            setGameOver(false);
            setSecondChanceUsed(false);
            setCooldown(0);
            setLastWrongCell(null);
        }
    }, [difficulty, level]);

    // Timer — runs only when game is active
    useEffect(() => {
        if (!gameWon && !gameOver && cooldown === 0 && board.length > 0) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameWon, gameOver, cooldown, board.length]);

    // Cooldown countdown
    useEffect(() => {
        if (cooldown > 0) {
            cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
        }
        return () => clearTimeout(cooldownRef.current);
    }, [cooldown]);

    // Game Over animation
    useEffect(() => {
        if (gameOver) {
            Animated.timing(gameOverAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        } else {
            gameOverAnim.setValue(0);
        }
    }, [gameOver]);

    // Win animation
    useEffect(() => {
        if (gameWon) {
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }
    }, [gameWon]);

    const findConflicts = useCallback((brd, r, c, val) => {
        if (val === 0) return new Set();
        const newConflicts = new Set();
        for (let i = 0; i < 9; i++) {
            if (i !== c && brd[r][i] === val) newConflicts.add(`${r},${i}`);
            if (i !== r && brd[i][c] === val) newConflicts.add(`${i},${c}`);
        }
        const boxR = Math.floor(r / 3) * 3;
        const boxC = Math.floor(c / 3) * 3;
        for (let dr = 0; dr < 3; dr++) {
            for (let dc = 0; dc < 3; dc++) {
                const nr = boxR + dr;
                const nc = boxC + dc;
                if ((nr !== r || nc !== c) && brd[nr][nc] === val) {
                    newConflicts.add(`${nr},${nc}`);
                }
            }
        }
        return newConflicts;
    }, []);

    const revalidateBoard = useCallback((brd) => {
        const newErrors = new Set();
        const allConflicts = new Set();
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (brd[row][col] !== 0 && solution[row] && brd[row][col] !== solution[row][col]) {
                    newErrors.add(`${row},${col}`);
                }
                if (brd[row][col] !== 0) {
                    const cellConflicts = findConflicts(brd, row, col, brd[row][col]);
                    cellConflicts.forEach(c => allConflicts.add(c));
                    if (cellConflicts.size > 0) allConflicts.add(`${row},${col}`);
                }
            }
        }
        setErrors(newErrors);
        setConflicts(allConflicts);
    }, [solution, findConflicts]);

    const checkWin = (brd) => {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (brd[r][c] === 0) return false;
                if (solution[r] && brd[r][c] !== solution[r][c]) return false;
            }
        }
        return true;
    };

    const saveProgress = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            let data = { completedLevels: { easy: [], medium: [], hard: [] } };
            if (saved) {
                data = JSON.parse(saved);
                if (!data.completedLevels) data = { completedLevels: { easy: [], medium: [], hard: [] } };
            }

            const completed = data.completedLevels[difficulty] || [];
            if (!completed.includes(level)) {
                completed.push(level);
                data.completedLevels[difficulty] = completed;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }
        } catch (e) {
            console.error('Failed to save sudoku progress', e);
        }
    };

    const handleCellPress = (r, c) => {
        if (isInputBlocked) return;
        soundManager.playTap();
        if (initialBoard[r]?.[c] !== 0) {
            setSelectedCell({ r, c });
            setHighlightNumber(initialBoard[r][c]);
            return;
        }
        setSelectedCell({ r, c });
        setHighlightNumber(board[r][c] || null);
    };

    const handleNumberInput = (num) => {
        if (!selectedCell || isInputBlocked) return;
        const { r, c } = selectedCell;
        if (initialBoard[r][c] !== 0) return;

        const prevVal = board[r][c];
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = num;
        setBoard(newBoard);
        setMoves(m => m + 1);
        setHighlightNumber(num || null);

        revalidateBoard(newBoard);

        // Check if this was a wrong move
        if (num !== 0 && solution[r] && num !== solution[r][c]) {
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setLastWrongCell({ r, c, prevVal });
            soundManager.playError();

            if (newMistakes >= maxMistakes) {
                setGameOver(true);
                clearInterval(timerRef.current);
                return;
            }
        }

        // Check win
        if (checkWin(newBoard) && errors.size === 0) {
            setGameWon(true);
            setShowConfetti(true);
            soundManager.playWin();
            dailyChallengeManager.completeGame('sudoku');
            clearInterval(timerRef.current);
            saveProgress();
        }
    };

    // Second Chance: revert last wrong cell, set mistakes to max-1, start cooldown
    const handleSecondChance = () => {
        if (lastWrongCell) {
            const newBoard = board.map(row => [...row]);
            newBoard[lastWrongCell.r][lastWrongCell.c] = 0;
            setBoard(newBoard);
            revalidateBoard(newBoard);
        }
        setMistakes(maxMistakes - 1);
        setSecondChanceUsed(true);
        setGameOver(false);
        setLastWrongCell(null);
        setCooldown(COOLDOWN_SECONDS);
    };

    // Restart: full reset
    const handleRestart = () => {
        const puzzleData = getPuzzle(difficulty, level);
        if (puzzleData) {
            setBoard(puzzleData.puzzle.map(row => [...row]));
            setErrors(new Set());
            setConflicts(new Set());
            setSelectedCell(null);
            setHighlightNumber(null);
            setMoves(0);
            setTimer(0);
            setMistakes(0);
            setGameOver(false);
            setGameWon(false);
            setShowConfetti(false);
            setSecondChanceUsed(false);
            setCooldown(0);
            setLastWrongCell(null);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const isRelated = (r, c) => {
        if (!selectedCell) return false;
        const { r: sr, c: sc } = selectedCell;
        if (r === sr || c === sc) return true;
        if (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3)) return true;
        return false;
    };

    const numberCounts = React.useMemo(() => {
        const counts = Array(10).fill(0);
        if (solution && solution.length > 0 && board && board.length > 0) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    const val = board[r]?.[c];
                    if (val !== 0 && solution[r] && val === solution[r][c]) {
                        counts[val]++;
                    }
                }
            }
        }
        return counts;
    }, [board, solution]);

    if (board.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Puzzle not found</Text>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const filledCount = board.flat().filter(v => v !== 0).length;
    const initialCount = initialBoard.flat().filter(v => v !== 0).length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={22} color="#FFF" />
                    </Pressable>

                    <View style={[styles.diffBadge, { backgroundColor: diffConfig.color }]}>
                        <Text style={styles.diffBadgeText}>{diffConfig.label} {level + 1}</Text>
                    </View>

                    <Pressable onPress={handleRestart} style={styles.headerBtn}>
                        <Ionicons name="refresh" size={22} color="#FFF" />
                    </Pressable>
                </View>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.statText}>{formatTime(timer)}</Text>
                    </View>

                    {/* Hearts */}
                    <View style={styles.statItem}>
                        {Array.from({ length: maxMistakes }, (_, i) => (
                            <Ionicons
                                key={i}
                                name={i < maxMistakes - mistakes ? 'heart' : 'heart-outline'}
                                size={18}
                                color={i < maxMistakes - mistakes ? '#EF4444' : 'rgba(255,255,255,0.3)'}
                                style={{ marginHorizontal: 1 }}
                            />
                        ))}
                    </View>

                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.statText}>{filledCount - initialCount}/{81 - initialCount}</Text>
                    </View>
                </View>

                {/* Grid */}
                <View style={styles.gridContainer}>
                    <View style={styles.grid}>
                        {board.map((row, r) => (
                            <View key={`row-${r}`} style={styles.row}>
                                {row.map((val, c) => {
                                    const isInitial = initialBoard[r][c] !== 0;
                                    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                                    const isRightThick = (c + 1) % 3 === 0 && c !== 8;
                                    const isBottomThick = (r + 1) % 3 === 0 && r !== 8;
                                    const hasError = errors.has(`${r},${c}`);
                                    const hasConflict = conflicts.has(`${r},${c}`);
                                    const related = isRelated(r, c);
                                    const sameNumber = highlightNumber && val === highlightNumber && val !== 0;

                                    let bgColor = '#FFFFFF';
                                    if (isSelected) bgColor = '#BBDEFB';
                                    else if (hasConflict) bgColor = '#FFCDD2';
                                    else if (sameNumber) bgColor = '#92e68fff';
                                    else if (related) bgColor = '#F3F4F6';
                                    else if (isInitial) bgColor = '#E8E8E8';

                                    return (
                                        <Pressable
                                            key={`cell-${r}-${c}`}
                                            style={[
                                                styles.cell,
                                                { backgroundColor: bgColor },
                                                isRightThick && styles.borderRightThick,
                                                isBottomThick && styles.borderBottomThick,
                                            ]}
                                            onPress={() => handleCellPress(r, c)}
                                        >
                                            <Text style={[
                                                styles.cellText,
                                                isInitial && styles.initialText,
                                                hasError && styles.cellErrorText,
                                                hasConflict && styles.conflictText,
                                            ]}>
                                                {val !== 0 ? val : ''}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    {/* Cooldown Overlay */}
                    {cooldown > 0 && (
                        <View style={styles.cooldownOverlay}>
                            <View style={styles.cooldownCard}>
                                <Text style={styles.cooldownEmoji}>⏳</Text>
                                <Text style={styles.cooldownValue}>{cooldown}</Text>
                                <Text style={styles.cooldownLabel}>Resuming...</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Number Pad */}
                <View style={styles.pad}>
                    <View style={styles.padRow}>
                        {[1, 2, 3, 4, 5].map(num => {
                            const count = numberCounts[num] || 0;
                            const isCompleted = count >= 9;
                            const remaining = 9 - count;

                            return (
                                <Pressable
                                    key={num}
                                    style={[
                                        styles.padButton,
                                        highlightNumber === num && styles.padButtonActive,
                                        isInputBlocked && styles.padButtonDisabled,
                                        isCompleted && styles.padButtonHidden,
                                    ]}
                                    onPress={() => handleNumberInput(num)}
                                    disabled={isInputBlocked || isCompleted}
                                >
                                    <Text style={[
                                        styles.padText,
                                        highlightNumber === num && styles.padTextActive,
                                    ]}>{num}</Text>
                                    {!isCompleted && (
                                        <Text style={[
                                            styles.remainingText,
                                            highlightNumber === num && styles.remainingTextActive
                                        ]}>
                                            {remaining} left
                                        </Text>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                    <View style={styles.padRow}>
                        {[6, 7, 8, 9].map(num => {
                            const count = numberCounts[num] || 0;
                            const isCompleted = count >= 9;
                            const remaining = 9 - count;

                            return (
                                <Pressable
                                    key={num}
                                    style={[
                                        styles.padButton,
                                        highlightNumber === num && styles.padButtonActive,
                                        isInputBlocked && styles.padButtonDisabled,
                                        isCompleted && styles.padButtonHidden,
                                    ]}
                                    onPress={() => handleNumberInput(num)}
                                    disabled={isInputBlocked || isCompleted}
                                >
                                    <Text style={[
                                        styles.padText,
                                        highlightNumber === num && styles.padTextActive,
                                    ]}>{num}</Text>
                                    {!isCompleted && (
                                        <Text style={[
                                            styles.remainingText,
                                            highlightNumber === num && styles.remainingTextActive
                                        ]}>
                                            {remaining} left
                                        </Text>
                                    )}
                                </Pressable>
                            );
                        })}
                        <Pressable
                            style={[
                                styles.padButton,
                                styles.eraseButton,
                                isInputBlocked && styles.padButtonDisabled,
                            ]}
                            onPress={() => handleNumberInput(0)}
                            disabled={isInputBlocked}
                        >
                            <Ionicons name="backspace-outline" size={24} color="#FFF" />
                        </Pressable>
                    </View>
                </View>

                {/* Game Over Modal */}
                <Modal visible={gameOver} transparent animationType="fade">
                    <Animated.View style={[styles.modalOverlay, { opacity: gameOverAnim }]}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalEmoji}>💔</Text>
                            <Text style={styles.modalTitle}>Game Over</Text>
                            <Text style={styles.modalSubtitle}>You ran out of lives!</Text>

                            <View style={styles.modalStats}>
                                <View style={styles.modalStatItem}>
                                    <Text style={styles.modalStatValue}>{formatTime(timer)}</Text>
                                    <Text style={styles.modalStatLabel}>Time</Text>
                                </View>
                                <View style={styles.modalStatDivider} />
                                <View style={styles.modalStatItem}>
                                    <Text style={styles.modalStatValue}>{moves}</Text>
                                    <Text style={styles.modalStatLabel}>Moves</Text>
                                </View>
                            </View>

                            {/* Second Chance */}
                            {!secondChanceUsed && (
                                <Pressable style={styles.btnSecondChance} onPress={handleSecondChance}>
                                    <Ionicons name="play" size={22} color="#FFF" />
                                    <Text style={styles.btnText}>Second Chance</Text>
                                </Pressable>
                            )}

                            {/* Restart */}
                            <Pressable style={styles.btnRestart} onPress={handleRestart}>
                                <Ionicons name="reload" size={20} color="#FFF" />
                                <Text style={styles.btnText}>Restart</Text>
                            </Pressable>

                            {/* New Game */}
                            <Pressable style={styles.btnNewGame} onPress={() => navigation.goBack()}>
                                <Ionicons name="game-controller" size={20} color="#FFF" />
                                <Text style={styles.btnText}>New Game</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </Modal>

                {/* Win Modal */}
                <Modal visible={gameWon} transparent animationType="fade">
                    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalEmoji}>🎉</Text>
                            <Text style={[styles.modalTitle, { color: '#10B981' }]}>Solved!</Text>
                            <Text style={styles.modalSubtitle}>{diffConfig.label} Level {level + 1}</Text>

                            <View style={styles.modalStats}>
                                <View style={styles.modalStatItem}>
                                    <Text style={styles.modalStatValue}>{formatTime(timer)}</Text>
                                    <Text style={styles.modalStatLabel}>Time</Text>
                                </View>
                                <View style={styles.modalStatDivider} />
                                <View style={styles.modalStatItem}>
                                    <Text style={styles.modalStatValue}>{moves}</Text>
                                    <Text style={styles.modalStatLabel}>Moves</Text>
                                </View>
                            </View>

                            <Pressable style={styles.btnNewGame} onPress={() => navigation.goBack()}>
                                <Text style={styles.btnText}>Back to Levels</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </Modal>

                {showConfetti && (
                    <ConfettiCannon count={150} origin={{ x: width / 2, y: -20 }} fadeOut />
                )}
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, marginTop: -31 },
    container: { flex: 1 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#EF4444', fontSize: 16, fontWeight: '700', textAlign: 'center' },
    backButton: { marginTop: 16, backgroundColor: '#4A90E2', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
    backButtonText: { color: '#FFF', fontWeight: '700' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        marginBottom: 8,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    diffBadge: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    diffBadgeText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 0.5,
    },

    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 10,
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        fontWeight: '600',
    },

    gridContainer: {
        alignItems: 'center',
        paddingHorizontal: GRID_PADDING,
    },
    grid: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 2,
        borderColor: '#000000',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: 0.5,
        borderColor: '#BBBBBB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    borderRightThick: {
        borderRightWidth: 2,
        borderRightColor: '#000000',
    },
    borderBottomThick: {
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
    },
    cellText: {
        fontSize: CELL_SIZE * 0.5,
        color: '#1E88E5',
        fontWeight: '700',
    },
    initialText: {
        color: '#1A1A1A',
        fontWeight: '800',
    },
    cellErrorText: {
        color: '#E53935',
        fontWeight: '800',
    },
    conflictText: {
        color: '#E53935',
        fontWeight: '800',
    },

    // Cooldown overlay
    cooldownOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    cooldownCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cooldownEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    cooldownValue: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFF',
    },
    cooldownLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },

    // Number pad
    pad: {
        marginTop: 24,
        paddingHorizontal: 24,
        gap: 10,
    },
    padRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    padButton: {
        width: (width - 100) / 5,
        height: 56,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        position: 'relative',
    },
    padButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    padButtonDisabled: {
        opacity: 0.3,
    },
    padButtonHidden: {
        opacity: 0,
    },
    eraseButton: {
        backgroundColor: 'rgba(239,68,68,0.3)',
        borderColor: 'rgba(239,68,68,0.5)',
    },
    padText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
    },
    padTextActive: {
        color: '#FFFFFF',
    },
    remainingText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    remainingTextActive: {
        color: '#FFFFFF',
    },

    // Shared modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        width: width * 0.88,
        elevation: 20,
    },
    modalEmoji: {
        fontSize: 52,
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: '#1a1a2e',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#666',
        marginBottom: 20,
    },
    modalStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 18,
        marginBottom: 24,
        width: '100%',
    },
    modalStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    modalStatValue: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1a1a2e',
    },
    modalStatLabel: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    modalStatDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#DDD',
    },

    // Buttons
    btnSecondChance: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B',
        paddingVertical: 14,
        borderRadius: 16,
        width: '100%',
        marginBottom: 10,
        gap: 8,
    },
    btnRestart: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A90E2',
        paddingVertical: 14,
        borderRadius: 16,
        width: '100%',
        marginBottom: 10,
        gap: 8,
    },
    btnNewGame: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366F1',
        paddingVertical: 14,
        borderRadius: 16,
        width: '100%',
        gap: 8,
    },
    btnText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 17,
    },
    btnHint: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginLeft: 'auto',
    },
});

export default SudokuScreen;
