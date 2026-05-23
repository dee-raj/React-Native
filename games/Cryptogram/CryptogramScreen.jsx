import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfettiCannon from 'react-native-confetti-cannon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLevelData, STORAGE_KEY, getDifficultyList } from './CryptogramConfig';
import soundManager from '../../shared/SoundManager';
import dailyChallengeManager from '../../shared/DailyChallengeManager';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min(24, (width - 60) / 10);
const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const CryptogramScreen = ({ navigation, route }) => {
    const { difficulty = 'easy', level = 0 } = route.params || {};

    const [levelData, setLevelData] = useState(null);
    const [guesses, setGuesses] = useState({});
    const [selectedCipher, setSelectedCipher] = useState(null);
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [timer, setTimer] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [revealedLetters, setRevealedLetters] = useState(new Set());

    const timerRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const diffConfig = getDifficultyList().find(d => d.id === difficulty) || { label: 'Easy', color: '#10B981', lives: 5, hints: 3 };
    const maxLives = diffConfig.lives;
    const maxHints = diffConfig.hints;

    const reverseCipher = useCallback(() => {
        if (!levelData) return {};
        const rev = {};
        for (const [plain, cipher] of Object.entries(levelData.cipherMap)) {
            rev[cipher] = plain;
        }
        return rev;
    }, [levelData]);

    useEffect(() => {
        const data = getLevelData(difficulty, level);
        if (data) {
            setLevelData(data);
            setGuesses({});
            setSelectedCipher(null);
            setWrongGuesses(0);
            setTimer(0);
            setGameWon(false);
            setShowConfetti(false);
            setHintsUsed(0);
            setRevealedLetters(new Set());
        }
    }, [difficulty, level]);

    useEffect(() => {
        if (!gameWon && levelData) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameWon, levelData]);

    useEffect(() => {
        if (gameWon) {
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }
    }, [gameWon]);

    const checkWin = useCallback((currentGuesses) => {
        if (!levelData) return false;
        const rev = reverseCipher();
        for (let i = 0; i < levelData.encoded.length; i++) {
            const ch = levelData.encoded[i];
            if (ch >= 'A' && ch <= 'Z') {
                if (!currentGuesses[ch] || currentGuesses[ch] !== rev[ch]) return false;
            }
        }
        return true;
    }, [levelData, reverseCipher]);

    const saveProgress = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            let data = { completedLevels: { easy: [], classic: [], hard: [] } };
            if (saved) {
                data = JSON.parse(saved);
                if (!data.completedLevels) data = { completedLevels: { easy: [], classic: [], hard: [] } };
            }
            const completed = data.completedLevels[difficulty] || [];
            if (!completed.includes(level)) {
                completed.push(level);
                data.completedLevels[difficulty] = completed;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }
        } catch (e) {
            console.error('Failed to save cryptogram progress', e);
        }
    };

    const handleCipherSelect = (cipherLetter) => {
        if (gameWon || wrongGuesses >= maxLives) return;
        soundManager.playTap();
        setSelectedCipher(prev => prev === cipherLetter ? null : cipherLetter);
    };

    const handlePlainSelect = (plainLetter) => {
        if (!selectedCipher || gameWon || wrongGuesses >= maxLives) return;
        soundManager.playTap();

        const rev = reverseCipher();
        const correctAnswer = rev[selectedCipher];

        if (revealedLetters.has(selectedCipher)) return;

        if (plainLetter !== correctAnswer) {
            const newWrong = wrongGuesses + 1;
            setWrongGuesses(newWrong);
            setSelectedCipher(null);
            soundManager.playWrong();
            return;
        }

        const newGuesses = { ...guesses, [selectedCipher]: plainLetter };
        setGuesses(newGuesses);
        soundManager.playCorrect();

        if (checkWin(newGuesses)) {
            setGameWon(true);
            setShowConfetti(true);
            soundManager.playWin();
            dailyChallengeManager.completeGame('cryptogram');
            clearInterval(timerRef.current);
            saveProgress();
        }

        setSelectedCipher(null);
    };

    const handleHint = () => {
        if (hintsUsed >= maxHints || gameWon || wrongGuesses >= maxLives || !levelData) return;

        soundManager.playHint();
        const rev = reverseCipher();
        const unguessed = levelData.uniqueLetters.filter(cipher => {
            return !guesses[cipher] && !revealedLetters.has(cipher);
        });

        if (unguessed.length === 0) return;

        const randomCipher = unguessed[Math.floor(Math.random() * unguessed.length)];
        const newRevealed = new Set(revealedLetters);
        newRevealed.add(randomCipher);
        setRevealedLetters(newRevealed);

        const newGuesses = { ...guesses, [randomCipher]: rev[randomCipher] };
        setGuesses(newGuesses);
        setHintsUsed(h => h + 1);

        if (checkWin(newGuesses)) {
            setGameWon(true);
            setShowConfetti(true);
            clearInterval(timerRef.current);
            saveProgress();
        }
    };

    const handleClear = () => {
        if (!selectedCipher || revealedLetters.has(selectedCipher)) return;
        const newGuesses = { ...guesses };
        delete newGuesses[selectedCipher];
        setGuesses(newGuesses);
    };

    const handleRestart = () => {
        setGuesses({});
        setSelectedCipher(null);
        setWrongGuesses(0);
        setTimer(0);
        setGameWon(false);
        setShowConfetti(false);
        setHintsUsed(0);
        setRevealedLetters(new Set());
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const getDecodedCount = () => {
        if (!levelData) return 0;
        return levelData.uniqueLetters.filter(c => guesses[c]).length;
    };

    if (!levelData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Level not found</Text>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const words = levelData.encoded.split(' ');
    const rev = reverseCipher();
    const isInputBlocked = gameWon || wrongGuesses >= maxLives;
    const remainingHints = maxHints - hintsUsed;

    const renderQuote = () => {
        const lines = [];
        let currentLine = [];
        let currentLineWidth = 0;
        const maxLineWidth = width - 40;

        words.forEach((word, wordIdx) => {
            const wordWidth = word.length * (CELL_SIZE + 3) + 8;
            if (currentLineWidth + wordWidth > maxLineWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = [];
                currentLineWidth = 0;
            }
            currentLine.push({ word, wordIdx });
            currentLineWidth += wordWidth;
        });
        if (currentLine.length > 0) lines.push(currentLine);

        return lines.map((line, lineIdx) => (
            <View key={`line-${lineIdx}`} style={styles.quoteLine}>
                {line.map(({ word, wordIdx }) => (
                    <View key={`word-${wordIdx}`} style={styles.wordContainer}>
                        {word.split('').map((ch, chIdx) => {
                            if (ch < 'A' || ch > 'Z') {
                                return (
                                    <View key={`char-${wordIdx}-${chIdx}`} style={styles.punctuationCell}>
                                        <Text style={styles.punctuationText}>{ch}</Text>
                                    </View>
                                );
                            }

                            const isSelected = selectedCipher === ch;
                            const hasGuess = guesses[ch];
                            const isRevealed = revealedLetters.has(ch);
                            const isCorrect = hasGuess && guesses[ch] === rev[ch];

                            return (
                                <Pressable
                                    key={`char-${wordIdx}-${chIdx}`}
                                    style={[
                                        styles.cipherCell,
                                        isSelected && styles.cipherCellSelected,
                                        isCorrect && styles.cipherCellCorrect,
                                        isRevealed && styles.cipherCellRevealed,
                                    ]}
                                    onPress={() => handleCipherSelect(ch)}
                                    disabled={isInputBlocked || isRevealed}
                                >

                                    <Text style={[
                                        styles.guessLetter,
                                        hasGuess && styles.guessLetterFilled,
                                        isRevealed && styles.guessLetterRevealed,
                                    ]}>
                                        {hasGuess || ''}
                                    </Text>

                                    <Text style={[
                                        styles.cipherLetter,
                                        isSelected && styles.cipherLetterSelected,
                                        isRevealed && styles.cipherLetterRevealed,
                                    ]}>
                                        {ch}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
            </View>
        ));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
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

                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.statText}>{formatTime(timer)}</Text>
                    </View>

                    <View style={styles.statItem}>
                        {Array.from({ length: maxLives }, (_, i) => (
                            <Ionicons
                                key={i}
                                name={i < maxLives - wrongGuesses ? 'heart' : 'heart-outline'}
                                size={18}
                                color={i < maxLives - wrongGuesses ? '#EF4444' : 'rgba(255,255,255,0.3)'}
                                style={{ marginHorizontal: 1 }}
                            />
                        ))}
                    </View>

                    <View style={styles.statItem}>
                        <Ionicons name="key-outline" size={16} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.statText}>{getDecodedCount()}/{levelData.uniqueLetters.length}</Text>
                    </View>

                </View>

                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.quoteContainer}>
                        {renderQuote()}
                    </View>

                    <Text style={styles.authorText}>— {levelData.author}</Text>

                    {selectedCipher && !isInputBlocked && (
                        <View style={styles.hintBar}>
                            <Text style={styles.hintText}>
                                Decoding: <Text style={styles.hintCipher}>{selectedCipher}</Text> → ?
                            </Text>
                            {!revealedLetters.has(selectedCipher) && guesses[selectedCipher] && (
                                <Pressable onPress={handleClear} style={styles.clearBtn}>
                                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                                    <Text style={styles.clearBtnText}>Clear</Text>
                                </Pressable>
                            )}
                        </View>
                    )}

                    <View style={styles.keyboard}>
                        {KEYBOARD_ROWS.map((row, rowIdx) => (
                            <View key={`kb-row-${rowIdx}`} style={styles.keyboardRow}>
                                {row.map(letter => {
                                    const isUsed = Object.values(guesses).includes(letter);
                                    const isCorrectGuess = isUsed && Object.entries(guesses).some(([c, p]) => p === letter && rev[c] === letter);

                                    return (
                                        <Pressable
                                            key={`kb-${letter}`}
                                            style={[
                                                styles.keyButton,
                                                isUsed && !isCorrectGuess && styles.keyButtonUsed,
                                                isCorrectGuess && styles.keyButtonCorrect,
                                                isInputBlocked && styles.keyButtonDisabled,
                                            ]}
                                            onPress={() => handlePlainSelect(letter)}
                                            disabled={isInputBlocked}
                                        >
                                            <Text style={[
                                                styles.keyText,
                                                isUsed && styles.keyTextUsed,
                                            ]}>
                                                {letter}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {!isInputBlocked && remainingHints > 0 && (
                    <Pressable
                        style={[styles.hintButton, remainingHints <= 0 && styles.hintButtonDisabled]}
                        onPress={handleHint}
                        disabled={remainingHints <= 0}
                    >
                        <Ionicons name="bulb-outline" size={18} color="#FFF" />
                        <Text style={styles.hintButtonText}>
                            Hint ({remainingHints})
                        </Text>
                    </Pressable>
                )}

                <Modal visible={gameWon} transparent animationType="fade">
                    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalEmoji}>🎉</Text>
                            <Text style={[styles.modalTitle, { color: '#10B981' }]}>Decoded!</Text>
                            <Text style={styles.modalSubtitle}>{diffConfig.label} Level {level + 1}</Text>

                            <View style={styles.quoteReveal}>
                                <Text style={styles.quoteRevealText}>"{levelData.original}"</Text>
                                <Text style={styles.quoteRevealAuthor}>— {levelData.author}</Text>
                            </View>

                            <View style={styles.modalStats}>
                                <View style={styles.modalStatItem}>
                                    <Text style={styles.modalStatValue}>{formatTime(timer)}</Text>
                                    <Text style={styles.modalStatLabel}>Time</Text>
                                </View>
                                <View style={styles.modalStatDivider} />
                                <View style={styles.modalStatItem}>
                                    <Text style={styles.modalStatValue}>{wrongGuesses}</Text>
                                    <Text style={styles.modalStatLabel}>Mistakes</Text>
                                </View>
                                <View style={styles.modalStatDivider} />
                                <View style={styles.modalStatItem}>
                                    <Text style={styles.modalStatValue}>{hintsUsed}</Text>
                                    <Text style={styles.modalStatLabel}>Hints</Text>
                                </View>
                            </View>

                            <Pressable style={styles.btnNewGame} onPress={() => navigation.goBack()}>
                                <Text style={styles.btnText}>Back to Levels</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </Modal>

                <Modal visible={wrongGuesses >= maxLives && !gameWon} transparent animationType="fade">
                    <Animated.View style={[styles.modalOverlay, { opacity: 1 }]}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalEmoji}>💔</Text>
                            <Text style={styles.modalTitle}>Out of Lives!</Text>
                            <Text style={styles.modalSubtitle}>Too many wrong guesses</Text>

                            <Pressable style={styles.btnRestart} onPress={handleRestart}>
                                <Ionicons name="reload" size={20} color="#FFF" />
                                <Text style={styles.btnText}>Try Again</Text>
                            </Pressable>

                            <Pressable style={styles.btnNewGame} onPress={() => navigation.goBack()}>
                                <Ionicons name="game-controller" size={20} color="#FFF" />
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
    container: { flex: 1, marginTop: 0 },
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
        marginBottom: 8,
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

    scrollContainer: {
        flex: 1,
        marginBottom: 20,
    },

    quoteContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        minHeight: 140,
        justifyContent: 'center',
    },
    quoteLine: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
        justifyContent: 'center',
    },
    wordContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    cipherCell: {
        width: CELL_SIZE,
        height: CELL_SIZE + 18,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
        borderRadius: 6,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginHorizontal: 0.5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 2,
    },
    cipherCellSelected: {
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245,158,11,0.2)',
        borderWidth: 2,
    },
    cipherCellCorrect: {
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.15)',
    },
    cipherCellRevealed: {
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139,92,246,0.15)',
    },
    cipherLetter: {
        fontSize: CELL_SIZE * 0.45,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        position: 'absolute',
        top: 2,
    },
    cipherLetterSelected: {
        color: '#F59E0B',
    },
    cipherLetterRevealed: {
        color: '#8B5CF6',
    },
    guessLetter: {
        fontSize: CELL_SIZE * 0.55,
        color: '#3B82F6',
        fontWeight: '800',
    },
    guessLetterFilled: {
        color: '#FFF',
    },
    guessLetterRevealed: {
        color: '#A78BFA',
    },
    punctuationCell: {
        width: CELL_SIZE * 0.5,
        height: CELL_SIZE + 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 0.5,
    },
    punctuationText: {
        fontSize: CELL_SIZE * 0.5,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    authorText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 8,
    },

    hintBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 6,
        gap: 12,
    },
    hintText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
    hintCipher: {
        color: '#F59E0B',
        fontWeight: '800',
        fontSize: 16,
    },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    clearBtnText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '700',
    },

    keyboard: {
        minHeight: 200,
        paddingHorizontal: 8,
        gap: 6,
    },
    keyboardRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    keyButton: {
        minWidth: (width - 60) / 10,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 4,
    },
    keyButtonUsed: {
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: 'rgba(59,130,246,0.4)',
    },
    keyButtonCorrect: {
        backgroundColor: 'rgba(16,185,129,0.25)',
        borderColor: '#10B981',
    },
    keyButtonDisabled: {
        opacity: 0.3,
    },
    keyText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    keyTextUsed: {
        color: 'rgba(255,255,255,0.5)',
    },

    hintButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(139,92,246,0.3)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.5)',
        gap: 6,
    },
    hintButtonDisabled: {
        opacity: 0.3,
    },
    hintButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },

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
        marginBottom: 16,
    },
    quoteReveal: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        width: '100%',
    },
    quoteRevealText: {
        fontSize: 14,
        color: '#1a1a2e',
        fontWeight: '600',
        fontStyle: 'italic',
        lineHeight: 22,
        textAlign: 'center',
    },
    quoteRevealAuthor: {
        fontSize: 13,
        color: '#666',
        textAlign: 'right',
        marginTop: 8,
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
});

export default CryptogramScreen;
