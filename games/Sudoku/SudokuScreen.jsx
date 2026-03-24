import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { getPuzzle, getDifficultyList } from './SudokuConfig';

const { width } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_SIZE = width - GRID_PADDING * 2;
const CELL_SIZE = GRID_SIZE / 9;

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

    const timerRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const diffConfig = getDifficultyList().find(d => d.id === difficulty) || { label: 'Easy', color: '#10B981' };

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
        }
    }, [difficulty, level]);

    useEffect(() => {
        if (!gameWon && board.length > 0) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameWon, board.length]);

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

    const checkWin = useCallback((brd) => {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (brd[r][c] === 0) return false;
            }
        }
        return true;
    }, []);

    const handleCellPress = (r, c) => {
        if (gameWon) return;
        if (initialBoard[r]?.[c] !== 0) {
            setSelectedCell({ r, c });
            setHighlightNumber(initialBoard[r][c]);
            return;
        }
        setSelectedCell({ r, c });
        setHighlightNumber(board[r][c] || null);
    };

    const handleNumberInput = (num) => {
        if (!selectedCell || gameWon) return;
        const { r, c } = selectedCell;
        if (initialBoard[r][c] !== 0) return;

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = num;
        setBoard(newBoard);
        setMoves(m => m + 1);
        setHighlightNumber(num || null);

        const newErrors = new Set();
        const allConflicts = new Set();

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (newBoard[row][col] !== 0 && solution[row] && newBoard[row][col] !== solution[row][col]) {
                    newErrors.add(`${row},${col}`);
                }
                if (newBoard[row][col] !== 0) {
                    const cellConflicts = findConflicts(newBoard, row, col, newBoard[row][col]);
                    cellConflicts.forEach(c => allConflicts.add(c));
                    if (cellConflicts.size > 0) allConflicts.add(`${row},${col}`);
                }
            }
        }
        setErrors(newErrors);
        setConflicts(allConflicts);

        if (checkWin(newBoard) && newErrors.size === 0 && allConflicts.size === 0) {
            setGameWon(true);
            setShowConfetti(true);
            clearInterval(timerRef.current);
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
    const totalCells = 81;
    const initialCount = initialBoard.flat().filter(v => v !== 0).length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color="#FFF" />
                    </Pressable>

                    <View style={[styles.diffBadge, { backgroundColor: diffConfig.color }]}>
                        <Text style={styles.diffBadgeText}>{diffConfig.label} {level + 1}</Text>
                    </View>

                    <Pressable onPress={() => {
                        setBoard(initialBoard.map(row => [...row]));
                        setSelectedCell(null);
                        setErrors(new Set());
                        setConflicts(new Set());
                        setMoves(0);
                        setTimer(0);
                        setGameWon(false);
                        setShowConfetti(false);
                        setHighlightNumber(null);
                    }} style={styles.backBtn}>
                        <Ionicons name="refresh" size={22} color="#FFF" />
                    </Pressable>
                </View>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.statText}>{formatTime(timer)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="finger-print-outline" size={18} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.statText}>{moves} moves</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle-outline" size={18} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.statText}>{filledCount - initialCount}/{totalCells - initialCount}</Text>
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
                                                hasError && styles.errorText,
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
                </View>

                {/* Number Pad */}
                <View style={styles.pad}>
                    <View style={styles.padRow}>
                        {[1, 2, 3, 4, 5].map(num => (
                            <Pressable
                                key={num}
                                style={[
                                    styles.padButton,
                                    highlightNumber === num && styles.padButtonActive,
                                ]}
                                onPress={() => handleNumberInput(num)}
                            >
                                <Text style={[
                                    styles.padText,
                                    highlightNumber === num && styles.padTextActive,
                                ]}>{num}</Text>
                            </Pressable>
                        ))}
                    </View>
                    <View style={styles.padRow}>
                        {[6, 7, 8, 9].map(num => (
                            <Pressable
                                key={num}
                                style={[
                                    styles.padButton,
                                    highlightNumber === num && styles.padButtonActive,
                                ]}
                                onPress={() => handleNumberInput(num)}
                            >
                                <Text style={[
                                    styles.padText,
                                    highlightNumber === num && styles.padTextActive,
                                ]}>{num}</Text>
                            </Pressable>
                        ))}
                        <Pressable
                            style={[styles.padButton, styles.eraseButton]}
                            onPress={() => handleNumberInput(0)}
                        >
                            <Ionicons name="backspace-outline" size={24} color="#FFF" />
                        </Pressable>
                    </View>
                </View>

                {/* Win Modal */}
                <Modal visible={gameWon} transparent animationType="fade">
                    <Animated.View style={[styles.winOverlay, { opacity: fadeAnim }]}>
                        <View style={styles.winCard}>
                            <Text style={styles.winEmoji}>🎉</Text>
                            <Text style={styles.winTitle}>Solved!</Text>
                            <Text style={styles.winSubtitle}>{diffConfig.label} Level {level + 1}</Text>

                            <View style={styles.winStats}>
                                <View style={styles.winStatItem}>
                                    <Text style={styles.winStatValue}>{formatTime(timer)}</Text>
                                    <Text style={styles.winStatLabel}>Time</Text>
                                </View>
                                <View style={styles.winStatDivider} />
                                <View style={styles.winStatItem}>
                                    <Text style={styles.winStatValue}>{moves}</Text>
                                    <Text style={styles.winStatLabel}>Moves</Text>
                                </View>
                            </View>

                            <Pressable style={styles.winButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.winButtonText}>Back to Levels</Text>
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
    safeArea: { flex: 1, marginTop: -32 },
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
    backBtn: {
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
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
    conflictText: {
        color: '#E53935',
        fontWeight: '800',
    },

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
        height: 52,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    padButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
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
        fontSize: 22,
        fontWeight: '800',
    },

    winOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    winCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: width * 0.85,
        elevation: 20,
    },
    winEmoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    winTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1a1a2e',
        marginBottom: 4,
    },
    winSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    winStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        width: '100%',
    },
    winStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    winStatValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1a1a2e',
    },
    winStatLabel: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    winStatDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#DDD',
    },
    winButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 24,
        width: '100%',
        alignItems: 'center',
    },
    winButtonText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 18,
    },
});

export default SudokuScreen;
