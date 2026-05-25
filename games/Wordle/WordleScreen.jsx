import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    Animated,
    Modal,
    ScrollView,
    PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfettiCannon from 'react-native-confetti-cannon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/ThemeContext';
import soundManager from '../../shared/SoundManager';
import { getWordOfTheDay } from './utils';
import { scoreGuess } from './response';
import { five_char_words } from './words';
import dailyChallengeManager from '../../shared/DailyChallengeManager';
import { shareGameResult } from '../../shared/SharingManager';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min(54, (width - 70) / 5);
const STATS_KEY = '@wordle_game_stats';

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];
const WordleCell = React.memo(({
    rowIdx,
    cellIdx,
    char,
    isGuessedRow,
    isAlreadyRevealed,
    scaleY,
    colors,
    isDark,
    getCellColor,
    styles
}) => {
    const [isRevealed, setIsRevealed] = useState(isAlreadyRevealed);

    useEffect(() => {
        setIsRevealed(isAlreadyRevealed);
    }, [isAlreadyRevealed]);

    useEffect(() => {
        if (isAlreadyRevealed) return;

        const listenerId = scaleY.addListener(({ value }) => {
            if (value <= 0.05) {
                setIsRevealed(true);
            }
        });
        return () => {
            scaleY.removeListener(listenerId);
        };
    }, [scaleY, isAlreadyRevealed]);

    const { bg, border, text } = getCellColor(rowIdx, cellIdx, char, isRevealed);
    const cellStyleAnim = {
        transform: [
            { scaleY: scaleY }
        ]
    };

    return (
        <Animated.View
            style={[
                styles.cell,
                {
                    borderColor: char ? colors.text : border,
                    backgroundColor: bg,
                },
                char && !isGuessedRow && styles.cellFilled,
                cellStyleAnim
            ]}
        >
            <Text style={[styles.cellText, { color: text }]}>
                {char.toUpperCase()}
            </Text>
        </Animated.View>
    );
});

const WordleScreen = ({ navigation, route }) => {
    const isDailyChallengeFromRoute = route.params?.isDaily || false;
    const { colors, isDark } = useTheme();

    // Game state
    const [isDaily, setIsDaily] = useState(isDailyChallengeFromRoute);
    const [targetWord, setTargetWord] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
    const [revealedCells, setRevealedCells] = useState(
        Array(6).fill(null).map(() => Array(5).fill(false))
    );
    const [letterStatuses, setLetterStatuses] = useState({});

    // Stats state
    const [stats, setStats] = useState({
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0],
    });

    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorAnim] = useState(new Animated.Value(0));

    // Animation values
    const scaleYAnim = useRef(
        Array(6).fill(null).map(() => Array(5).fill(null).map(() => new Animated.Value(1)))
    ).current;

    const shakeAnims = useRef(
        Array(6).fill(null).map(() => new Animated.Value(0))
    ).current;

    const modalFadeAnim = useRef(new Animated.Value(0)).current;

    // Load stats
    useEffect(() => {
        loadStats();
    }, []);

    // Initialize game
    useEffect(() => {
        initGame();
    }, [isDaily]);

    const loadStats = async () => {
        try {
            const saved = await AsyncStorage.getItem(STATS_KEY);
            if (saved) {
                setStats(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load Wordle stats', e);
        }
    };

    const BUTTON_SIZE = 52;

    const MIN_X = 0;
    const MAX_X = SCREEN_WIDTH - BUTTON_SIZE;

    const MIN_Y = 0;
    const MAX_Y = SCREEN_HEIGHT - BUTTON_SIZE;

    const pan = useRef(
        new Animated.ValueXY({
            x: SCREEN_WIDTH - 80,
            y: 150,
        })
    ).current;

    const lastPosition = useRef({
        x: SCREEN_WIDTH - 80,
        y: 150,
    }).current;

    const panResponder = useRef(
        PanResponder.create({
            // Only activate drag after slight movement
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return (
                    Math.abs(gestureState.dx) > 5 ||
                    Math.abs(gestureState.dy) > 5
                );
            },

            onPanResponderGrant: () => {
                pan.setOffset({
                    x: lastPosition.x,
                    y: lastPosition.y,
                });

                pan.setValue({ x: 0, y: 0 });
            },

            onPanResponderMove: (_, gesture) => {
                let newX = lastPosition.x + gesture.dx;
                let newY = lastPosition.y + gesture.dy;

                newX = Math.max(MIN_X, Math.min(newX, MAX_X));
                newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

                pan.setValue({
                    x: newX - lastPosition.x,
                    y: newY - lastPosition.y,
                });
            },

            onPanResponderRelease: (_, gesture) => {
                let finalX = lastPosition.x + gesture.dx;
                let finalY = lastPosition.y + gesture.dy;

                finalX = Math.max(MIN_X, Math.min(finalX, MAX_X));
                finalY = Math.max(MIN_Y, Math.min(finalY, MAX_Y));

                lastPosition.x = finalX;
                lastPosition.y = finalY;

                pan.flattenOffset();
            },
        })
    ).current;

    const saveStats = async (newStats) => {
        try {
            await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
            setStats(newStats);
        } catch (e) {
            console.error('Failed to save Wordle stats', e);
        }
    };

    const getRandomWord = () => {
        const idx = Math.floor(Math.random() * five_char_words.length);
        return five_char_words[idx].toLowerCase();
    };

    const initGame = async () => {
        // Reset states
        setCurrentGuess('');
        setGuesses([]);
        setGameStatus('playing');
        setRevealedCells(Array(6).fill(null).map(() => Array(5).fill(false)));
        setLetterStatuses({});
        setShowConfetti(false);
        setIsAnimating(false);
        setErrorMessage('');

        // Reset all animation values
        scaleYAnim.forEach(row => row.forEach(val => val.setValue(1)));
        shakeAnims.forEach(val => val.setValue(0));
        modalFadeAnim.setValue(0);

        if (isDaily) {
            // Check if already completed today
            const status = await dailyChallengeManager.getGameStatus('wordle');
            if (status.completedToday) {
                // If completed today, load the daily word, show won/lost and modal
                const dailyWord = getWordOfTheDay().toLowerCase();
                setTargetWord(dailyWord);

                // Load existing daily guess progress if desired, or let them view stats
                // For simplicity, if they already completed, we auto-load the answer and show stats
                // Let's set gameStatus based on their history or let them play Practice mode
                setTargetWord(dailyWord);
                // Prompt user to play Practice Mode since Daily is completed
                setErrorMessage('Daily Challenge completed! Switching to Practice Mode.');
                showToastAnim();
                setTimeout(() => {
                    setIsDaily(false);
                }, 2000);
            } else {
                setTargetWord(getWordOfTheDay().toLowerCase());
            }
        } else {
            setTargetWord(getRandomWord());
        }
    };

    const showToastAnim = () => {
        Animated.sequence([
            Animated.timing(errorAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.delay(2000),
            Animated.timing(errorAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => setErrorMessage(''));
    };

    const triggerError = (msg) => {
        setErrorMessage(msg);
        showToastAnim();

        // Shake row animation
        const activeRow = guesses.length;
        if (activeRow < 6) {
            soundManager.playError();
            Animated.sequence([
                Animated.timing(shakeAnims[activeRow], { toValue: 10, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnims[activeRow], { toValue: -10, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnims[activeRow], { toValue: 8, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnims[activeRow], { toValue: -8, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnims[activeRow], { toValue: 5, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnims[activeRow], { toValue: -5, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnims[activeRow], { toValue: 0, duration: 60, useNativeDriver: true }),
            ]).start();
        }
    };

    const handleKeyPress = (key) => {
        if (gameStatus !== 'playing' || isAnimating) return;

        soundManager.playTap();

        if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (key === 'ENTER') {
            submitGuess();
        } else {
            if (currentGuess.length < 5) {
                setCurrentGuess(prev => (prev + key).toLowerCase());
            }
        }
    };

    const submitGuess = () => {
        if (currentGuess.length !== 5) {
            triggerError('Word is too short');
            return;
        }

        const cleanGuess = currentGuess?.toLowerCase();
        if (!five_char_words.includes(cleanGuess)) {
            triggerError('Not in word list');
            return;
        }

        // Add to guesses and begin reveal animation
        const newGuesses = [...guesses, cleanGuess];
        const rowIdx = guesses.length;
        setIsAnimating(true);

        // Sequence flip sounds staggered (no state updates here to prevent lag)
        for (let j = 0; j < 5; j++) {
            setTimeout(() => {
                soundManager.playClick();
            }, j * 150 + 150);
        }

        const scaleAnimations = Array(5).fill(null).map((_, cellIdx) => {
            return Animated.sequence([
                Animated.timing(scaleYAnim[rowIdx][cellIdx], {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.delay(10),
                Animated.timing(scaleYAnim[rowIdx][cellIdx], {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]);
        });

        Animated.stagger(150, scaleAnimations).start(async () => {
            // Update keyboard letter highlight styles
            updateKeyboardStatuses(cleanGuess, targetWord);

            // Update revealed cells in parent state once at the end
            setRevealedCells(prev => {
                const next = prev.map(r => [...r]);
                for (let j = 0; j < 5; j++) {
                    next[rowIdx][j] = true;
                }
                return next;
            });

            // Set guesses in state
            setGuesses(newGuesses);
            setCurrentGuess('');
            setIsAnimating(false);

            // Check match
            if (cleanGuess === targetWord) {
                setGameStatus('won');
                setShowConfetti(true);
                soundManager.playWin();

                // Track stats
                const newStats = {
                    ...stats,
                    gamesPlayed: stats.gamesPlayed + 1,
                    gamesWon: stats.gamesWon + 1,
                    currentStreak: stats.currentStreak + 1,
                    maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
                };
                newStats.guessDistribution[rowIdx] += 1;
                await saveStats(newStats);

                // Check Daily Challenge
                if (isDaily) {
                    await dailyChallengeManager.completeGame('wordle');
                }

                setTimeout(() => {
                    setShowStatsModal(true);
                    Animated.timing(modalFadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
                }, 1000);
            } else if (newGuesses.length === 6) {
                setGameStatus('lost');
                soundManager.playWrong();

                const newStats = {
                    ...stats,
                    gamesPlayed: stats.gamesPlayed + 1,
                    currentStreak: 0,
                };
                await saveStats(newStats);

                setTimeout(() => {
                    setShowStatsModal(true);
                    Animated.timing(modalFadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
                }, 1000);
            }
        });
    };

    const updateKeyboardStatuses = (guess, target) => {
        const scored = scoreGuess(guess, target);
        setLetterStatuses(prev => {
            const next = { ...prev };
            scored.forEach(cell => {
                const char = cell.char.toUpperCase();
                const currentStatus = next[char];
                if (cell.status === 'correct') {
                    next[char] = 'correct';
                } else if (cell.status === 'present') {
                    if (currentStatus !== 'correct') {
                        next[char] = 'present';
                    }
                } else if (cell.status === 'absent') {
                    if (currentStatus !== 'correct' && currentStatus !== 'present') {
                        next[char] = 'absent';
                    }
                }
            });
            return next;
        });
    };

    const generateShareText = () => {
        let gridStr = '';
        guesses.forEach(guess => {
            const scored = scoreGuess(guess, targetWord);
            scored.forEach(cell => {
                if (cell.status === 'correct') {
                    gridStr += '🟩';
                } else if (cell.status === 'present') {
                    gridStr += '🟨';
                } else {
                    gridStr += '⬛';
                }
            });
            gridStr += '\n';
        });
        return gridStr;
    };

    const handleShare = () => {
        const attempts = gameStatus === 'won' ? guesses.length : 'X';
        const grid = generateShareText();
        const modeName = isDaily ? 'Daily Challenge' : 'Practice Mode';
        const additional = `Wordle (${modeName}) ${attempts}/6\n\n${grid}`;
        shareGameResult('Wordle', gameStatus === 'won' ? `Won in ${attempts} attempts` : 'Lost', additional);
    };

    const getCellColor = (rowIdx, cellIdx, char, isRevealed) => {
        if (!isRevealed) {
            return {
                bg: 'transparent',
                border: colors.borderLight,
                text: colors.text,
            };
        }

        const guess = guesses[rowIdx] || currentGuess;
        if (!guess || guess.length !== 5) {
            return {
                bg: 'transparent',
                border: colors.borderLight,
                text: colors.text,
            };
        }

        const scored = scoreGuess(guess, targetWord);
        const cell = scored[cellIdx];

        if (cell.status === 'correct') {
            return { bg: '#10B981', border: '#10B981', text: '#FFFFFF' };
        } else if (cell.status === 'present') {
            return { bg: '#F59E0B', border: '#F59E0B', text: '#FFFFFF' };
        } else {
            return {
                bg: isDark ? '#3A3A3C' : '#787C7E',
                border: isDark ? '#3A3A3C' : '#787C7E',
                text: '#FFFFFF',
            };
        }
    };

    const getKeyboardKeyColor = (key) => {
        const status = letterStatuses[key];
        if (status === 'correct') {
            return { bg: '#10B981', text: '#FFFFFF' };
        } else if (status === 'present') {
            return { bg: '#F59E0B', text: '#FFFFFF' };
        } else if (status === 'absent') {
            return { bg: isDark ? '#22252A' : '#A4A6A8', text: '#888' };
        } else {
            return {
                bg: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
                text: colors.text,
            };
        }
    };

    const renderCell = (rowIdx, cellIdx) => {
        const isGuessedRow = rowIdx < guesses.length;
        const isActiveRow = rowIdx === guesses.length;
        let char = '';

        if (isGuessedRow) {
            char = guesses[rowIdx][cellIdx];
        } else if (isActiveRow) {
            char = currentGuess[cellIdx] || '';
        }

        return (
            <WordleCell
                key={`cell-${rowIdx}-${cellIdx}`}
                rowIdx={rowIdx}
                cellIdx={cellIdx}
                char={char}
                isGuessedRow={isGuessedRow}
                isAlreadyRevealed={revealedCells[rowIdx][cellIdx]}
                scaleY={scaleYAnim[rowIdx][cellIdx]}
                colors={colors}
                isDark={isDark}
                getCellColor={getCellColor}
                styles={styles}
            />
        );
    };

    const renderRow = (rowIdx) => {
        const shakeStyle = {
            transform: [
                { translateX: shakeAnims[rowIdx] }
            ]
        };

        return (
            <Animated.View key={`row-${rowIdx}`} style={[styles.row, shakeStyle]}>
                {Array(5).fill(null).map((_, cellIdx) => renderCell(rowIdx, cellIdx))}
            </Animated.View>
        );
    };

    const maxGuessCount = Math.max(...stats.guessDistribution, 1);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <LinearGradient colors={isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#F8F9FA', '#FFFFFF']} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </Pressable>

                    <Text style={[styles.title, { color: colors.text }]}>Wordle</Text>

                    <Pressable onPress={initGame} style={styles.headerBtn} disabled={isAnimating}>
                        <Ionicons name="refresh" size={22} color={colors.text} />
                    </Pressable>
                </View>

                {/* SubHeader / Switch Mode (only in normal game path, not if forced Daily from Challenge Screen) */}
                {!isDailyChallengeFromRoute && (
                    <View style={styles.modeContainer}>
                        <Pressable
                            style={[
                                styles.modeButton,
                                isDaily && [styles.modeButtonActive, { backgroundColor: colors.success }]
                            ]}
                            onPress={() => !isAnimating && setIsDaily(true)}
                        >
                            <Ionicons name="calendar-outline" size={14} color="#FFF" />
                            <Text style={styles.modeButtonText}>Daily Challenge</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.modeButton,
                                !isDaily && [styles.modeButtonActive, { backgroundColor: '#6366F1' }]
                            ]}
                            onPress={() => !isAnimating && setIsDaily(false)}
                        >
                            <Ionicons name="infinite-outline" size={14} color="#FFF" />
                            <Text style={styles.modeButtonText}>Practice Mode</Text>
                        </Pressable>
                    </View>
                )}

                {/* Error Banner */}
                {errorMessage ? (
                    <Animated.View style={[styles.toastContainer, { opacity: errorAnim }]}>
                        <Text style={styles.toastText}>{errorMessage}</Text>
                    </Animated.View>
                ) : null}

                {/* Grid */}
                <View style={styles.gridContainer}>
                    {Array(6).fill(null).map((_, rowIdx) => renderRow(rowIdx))}
                </View>

                {/* Keyboard */}
                <View style={styles.keyboardContainer}>
                    {KEYBOARD_ROWS.map((row, rowIdx) => (
                        <View key={`key-row-${rowIdx}`} style={styles.keyboardRow}>
                            {row.map(key => {
                                const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE';
                                const { bg, text } = getKeyboardKeyColor(key);

                                return (
                                    <Pressable
                                        key={`key-${key}`}
                                        onPress={() => handleKeyPress(key)}
                                        style={({ pressed }) => [
                                            styles.key,
                                            isSpecialKey && styles.keySpecial,
                                            { backgroundColor: bg },
                                            pressed && styles.keyPressed,
                                        ]}
                                    >
                                        {key === 'BACKSPACE' ? (
                                            <Ionicons name="backspace-outline" size={20} color={text} />
                                        ) : (
                                            <Text style={[
                                                styles.keyText,
                                                { color: text },
                                                isSpecialKey && styles.keySpecialText
                                            ]}>
                                                {key}
                                            </Text>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {/* Draggable Stats Screen Button */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.floatingStatsBtn,
                        {
                            left: 0,
                            top: 0,
                            transform: [
                                { translateX: pan.x },
                                { translateY: pan.y },
                            ],
                        },
                    ]}
                >
                    <Pressable
                        onPress={() => {
                            setShowStatsModal(true);

                            Animated.timing(modalFadeAnim, {
                                toValue: 1,
                                duration: 300,
                                useNativeDriver: true,
                            }).start();
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Ionicons name="bar-chart-outline" size={24} color="#FFF" />
                    </Pressable>
                </Animated.View>

                {/* Stats / Game Ended Modal */}
                <Modal visible={showStatsModal} transparent animationType="fade">
                    <Animated.View style={[styles.modalOverlay, { opacity: modalFadeAnim }]}>
                        <View style={styles.modalCard}>
                            <Pressable
                                style={styles.modalCloseBtn}
                                onPress={() => {
                                    Animated.timing(modalFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
                                        setShowStatsModal(false);
                                    });
                                }}
                            >
                                <Ionicons name="close" size={24} color="#1a1a2e" />
                            </Pressable>

                            {gameStatus === 'playing' ? (
                                <Text style={styles.modalTitle}>Statistics</Text>
                            ) : gameStatus === 'won' ? (
                                <>
                                    <Text style={styles.modalEmoji}>🎉</Text>
                                    <Text style={[styles.modalTitle, { color: '#10B981' }]}>Solved!</Text>
                                    <Text style={styles.targetRevealText}>
                                        The word was <Text style={styles.targetWordHighlight}>{targetWord.toUpperCase()}</Text>
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.modalEmoji}>😔</Text>
                                    <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Nice Try!</Text>
                                    <Text style={styles.targetRevealText}>
                                        The word was <Text style={styles.targetWordHighlight}>{targetWord.toUpperCase()}</Text>
                                    </Text>
                                </>
                            )}

                            {/* Stat Boxes */}
                            <View style={styles.statsBar}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{stats.gamesPlayed}</Text>
                                    <Text style={styles.statLbl}>Played</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>
                                        {stats.gamesPlayed > 0
                                            ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
                                            : 0}%
                                    </Text>
                                    <Text style={styles.statLbl}>Win %</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{stats.currentStreak}</Text>
                                    <Text style={styles.statLbl}>Current Streak</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{stats.maxStreak}</Text>
                                    <Text style={styles.statLbl}>Max Streak</Text>
                                </View>
                            </View>

                            {/* Guess Distribution Graph */}
                            <Text style={styles.graphTitle}>GUESS DISTRIBUTION</Text>
                            <View style={styles.graphContainer}>
                                {stats.guessDistribution.map((count, idx) => {
                                    const barWidth = `${Math.max(8, (count / maxGuessCount) * 90)}%`;
                                    const isActiveRow = gameStatus === 'won' && guesses.length === idx + 1;

                                    return (
                                        <View key={`graph-row-${idx}`} style={styles.graphRow}>
                                            <Text style={styles.graphLabel}>{idx + 1}</Text>
                                            <View style={styles.graphBarTrack}>
                                                <View style={[
                                                    styles.graphBarFill,
                                                    {
                                                        width: barWidth,
                                                        backgroundColor: isActiveRow ? '#10B981' : '#787C7E'
                                                    }
                                                ]}>
                                                    <Text style={styles.graphBarText}>{count}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.modalActions}>
                                {gameStatus !== 'playing' && (
                                    <Pressable style={styles.btnShare} onPress={handleShare}>
                                        <Ionicons name="share-social-outline" size={20} color="#FFF" />
                                        <Text style={styles.btnText}>Share</Text>
                                    </Pressable>
                                )}

                                {!isDaily && gameStatus !== 'playing' ? (
                                    <Pressable
                                        style={[styles.btnNewGame, { backgroundColor: '#6366F1' }]}
                                        onPress={() => {
                                            setShowStatsModal(false);
                                            initGame();
                                        }}
                                    >
                                        <Ionicons name="play" size={20} color="#FFF" />
                                        <Text style={styles.btnText}>Play Again</Text>
                                    </Pressable>
                                ) : (
                                    <Pressable
                                        style={[styles.btnNewGame, { backgroundColor: '#1a1a2e' }]}
                                        onPress={() => {
                                            setShowStatsModal(false);
                                            navigation.goBack();
                                        }}
                                    >
                                        <Ionicons name="arrow-back" size={20} color="#FFF" />
                                        <Text style={styles.btnText}>Back to Hub</Text>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </Animated.View>
                </Modal>

                {showConfetti && (
                    <ConfettiCannon count={180} origin={{ x: width / 2, y: -20 }} fadeOut />
                )}
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        marginTop: -31,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        marginBottom: 4,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(128,128,128,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 2,
    },
    modeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 6,
    },
    modeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(128,128,128,0.4)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    modeButtonActive: {
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    modeButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
    },
    toastContainer: {
        position: 'absolute',
        top: 110,
        left: '10%',
        right: '10%',
        backgroundColor: '#EF4444',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        zIndex: 99,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    toastText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    gridContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 12,
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: 2.5,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellFilled: {
        transform: [{ scale: 1.05 }],
    },
    cellText: {
        fontSize: CELL_SIZE * 0.45,
        fontWeight: '900',
    },
    keyboardContainer: {
        paddingHorizontal: 6,
        gap: 6,
        marginBottom: 8,
    },
    keyboardRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
    },
    key: {
        flex: 1,
        height: 48,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keySpecial: {
        flex: 1.5,
    },
    keyPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    keyText: {
        fontSize: 14,
        fontWeight: '800',
    },
    keySpecialText: {
        fontSize: 11,
    },
    floatingStatsBtn: {
        position: 'absolute',
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#A66CFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        width: width * 0.88,
        elevation: 16,
    },
    modalCloseBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalEmoji: {
        fontSize: 50,
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1a1a2e',
        marginBottom: 8,
    },
    targetRevealText: {
        fontSize: 15,
        color: '#666',
        marginBottom: 20,
    },
    targetWordHighlight: {
        fontWeight: '900',
        color: '#1a1a2e',
        textDecorationLine: 'underline',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingVertical: 14,
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
    },
    statVal: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1a1a2e',
    },
    statLbl: {
        fontSize: 10,
        color: '#777',
        marginTop: 2,
    },
    graphTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#777',
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    graphContainer: {
        width: '100%',
        marginBottom: 20,
        gap: 6,
    },
    graphRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    graphLabel: {
        width: 16,
        fontSize: 12,
        fontWeight: '700',
        color: '#444',
    },
    graphBarTrack: {
        flex: 1,
        marginLeft: 8,
    },
    graphBarFill: {
        height: 18,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 8,
    },
    graphBarText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    btnShare: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    btnNewGame: {
        flex: 1.2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    btnText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 14,
    },
});

export default WordleScreen;
