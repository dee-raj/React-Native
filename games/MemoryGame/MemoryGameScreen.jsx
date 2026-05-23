import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Dimensions, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import Ionicons from '@expo/vector-icons/Ionicons';
import soundManager from '../../shared/SoundManager';
import dailyChallengeManager from '../../shared/DailyChallengeManager';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CARD_MARGIN = 8;

const SYMBOL_POOL = [
    '⭐', '🍎', '🚗', '🚀', '⚽', '🍦', '🎮', '💡',
    '🎨', '🎲', '🧩', '🎸', '🛹', '🛸', '🌈', '💎',
    '🐱', '🐶', '🦁', '🐼', '🐨', '🦊', '🐯', '🐰',
    '🍉', '🍓', '🍒', '🍍', '🥝', '🥑', '🥥', '🌽',
    '🎭', '🎪', '🏇', '🏌️', '🏄', '🚣', '🏊', '🚴',
    '🎹', '🎺', '🎻', '🎬', '🎯', '🎰', '🗼', '🗽'
];

const STORAGE_KEY = '@memory_game_progress';

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

    cardHiddenStart: "#0e8a75ff",
    cardHiddenEnd: "#e5b372ff",

    cardFlippedStart: "#FFFFFF",
    cardFlippedEnd: "#F9FAFB",

    // Neon colors
    neonPurple: "#9333EA",
    neonPink: "#F472B6",
    neonCyan: "#06B6D4",
    neonYellow: "#FCD34D",

    // Text
    textWhite: "#FFFFFF",
    textDark: "#1F2937",
};

/* ---------- Animated Background Orbs ---------- */
const BackgroundOrbs = () => {
    const orbs = [
        { top: 60, left: -40, size: 160, colors: [COLORS.primaryStart, COLORS.primaryEnd] },
        { top: 220, right: -60, size: 200, colors: [COLORS.secondaryStart, COLORS.secondaryEnd] },
        { bottom: 120, left: 20, size: 140, colors: [COLORS.successStart, COLORS.successEnd] },
        { top: SCREEN_HEIGHT * 0.45, right: 10, size: 130, colors: [COLORS.neonPink, "#EE5253"] },
        { bottom: 220, right: 70, size: 110, colors: [COLORS.neonCyan, "#0891B2"] },
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

/* ---------- Animated Card Component ---------- */
const MemoryCard = ({ card, index, isFlipped, onPress, cardSize }) => {
    const flipAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.spring(flipAnim, {
            toValue: isFlipped ? 1 : 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [isFlipped, flipAnim]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const frontRotate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const backRotate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={[styles.cardContainer, { width: cardSize, height: cardSize }]}
        >
            <Animated.View
                style={[
                    styles.cardInner,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                {/* Back of card (hidden) */}
                <Animated.View
                    style={[
                        styles.cardFace,
                        styles.cardBack,
                        { transform: [{ rotateY: frontRotate }] },
                    ]}
                >
                    <LinearGradient
                        colors={[COLORS.cardHiddenStart, COLORS.cardHiddenEnd]}
                        style={styles.cardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.cardInnerGlow} />
                        <Text style={[styles.cardQuestion, { fontSize: cardSize * 0.4 }]}>?</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Front of card (revealed) */}
                <Animated.View
                    style={[
                        styles.cardFace,
                        styles.cardFront,
                        { transform: [{ rotateY: backRotate }] },
                    ]}
                >
                    <LinearGradient
                        colors={[COLORS.cardFlippedStart, COLORS.cardFlippedEnd]}
                        style={styles.cardGradient}
                    >
                        <View style={[styles.cardInnerGlow, { backgroundColor: 'rgba(102, 126, 234, 0.1)' }]} />
                        <Text style={[styles.cardEmoji, { fontSize: cardSize * 0.5 }]}>
                            {card.content}
                        </Text>
                    </LinearGradient>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const MemoryGameScreen = ({ route, navigation }) => {
    const { level: initialLevel } = route.params || { level: 1 };
    const [level, setLevel] = useState(initialLevel);
    const [completedLevels, setCompletedLevels] = useState([]);

    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const [attempts, setAttempts] = useState(0);
    const [failures, setFailures] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedData = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedData) {
                    const { completed } = JSON.parse(savedData);
                    setCompletedLevels(completed || []);
                }
            } catch (e) {
                console.error('Failed to load progress', e);
            }
        };
        loadProgress();
    }, []);

    const saveProgress = async (currentLevel, completed) => {
        try {
            const savedData = await AsyncStorage.getItem(STORAGE_KEY);
            const parsed = savedData ? JSON.parse(savedData) : { currentLevel: 1, completed: [] };
            const newCurrentLevel = Math.max(parsed.currentLevel, currentLevel);

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                currentLevel: newCurrentLevel,
                completed: [...new Set([...parsed.completed, ...completed])].sort((a, b) => a - b)
            }));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    };

    const initGame = useCallback((lvl) => {
        const pairCount = lvl + 1;
        const selectedSymbols = SYMBOL_POOL.slice(0, Math.min(pairCount, SYMBOL_POOL.length));

        const deck = [...selectedSymbols, ...selectedSymbols]
            .sort(() => Math.random() - 0.5)
            .map((content, index) => ({ id: index, content }));

        setCards(deck);
        setFlippedIndices([]);
        setMatchedPairs([]);
        setIsProcessing(false);
        setAttempts(0);
        setFailures(0);
        setShowResults(false);
        setShowConfetti(false);
    }, []);

    useEffect(() => {
        if (level) initGame(level);
    }, [level, initGame]);

    const handleFlip = (index) => {
        if (isProcessing || flippedIndices.includes(index) || matchedPairs.includes(cards[index].content) || showResults) {
            return;
        }
        soundManager.playFlip();

        if (flippedIndices.length === 0) {
            setFlippedIndices([index]);
        } else if (flippedIndices.length === 1) {
            const firstIndex = flippedIndices[0];
            setFlippedIndices([firstIndex, index]);
            setIsProcessing(true);
            setAttempts(prev => prev + 1);

            if (cards[firstIndex].content === cards[index].content) {
                soundManager.playMatch();
                const newMatched = [...matchedPairs, cards[firstIndex].content];
                setMatchedPairs(newMatched);
                setFlippedIndices([]);
                setIsProcessing(false);

                if (newMatched.length === cards.length / 2) {
                    const updatedCompleted = [...new Set([...completedLevels, level])].sort((a, b) => a - b);
                    setCompletedLevels(updatedCompleted);
                    saveProgress(level + 1, updatedCompleted);
                    setShowConfetti(true);
                    soundManager.playWin();
                    dailyChallengeManager.completeGame('memory');
                    setTimeout(() => setShowResults(true), 500);
                }
            } else {
                soundManager.playMismatch();
                setFailures(prev => prev + 1);
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsProcessing(false);
                }, 1000);
            }
        }
    };

    const nextLevel = () => {
        const nextLvl = level + 1;
        setLevel(nextLvl);
    };

    const getColumns = () => {
        const count = cards.length;
        if (count <= 4) return 2;
        if (count <= 12) return 3;
        return 4;
    };

    const columns = getColumns();
    const cardSize = (SCREEN_WIDTH - 80) / columns;

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
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                            style={styles.backBtnGradient}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
                        </LinearGradient>
                    </TouchableOpacity>

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
                            <Ionicons name="flash" size={18} color={COLORS.neonYellow} />
                            <Text style={styles.statsText}>{attempts}</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Cards Grid */}
                <ScrollView
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {cards.map((card, index) => {
                        const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.content);
                        return (
                            <MemoryCard
                                key={index}
                                card={card}
                                index={index}
                                isFlipped={isFlipped}
                                onPress={() => handleFlip(index)}
                                cardSize={cardSize}
                            />
                        );
                    })}
                </ScrollView>

                {/* Results Modal */}
                {showResults && (
                    <View style={styles.resultsOverlay}>
                        <LinearGradient
                            colors={[COLORS.successStart, COLORS.successEnd]}
                            style={styles.resultsBox}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.resultsIconWrap}>
                                <Text style={styles.resultsIcon}>🎉</Text>
                            </View>

                            <Text style={styles.congratsText}>Level {level} Cleared!</Text>
                            <Text style={styles.congratsSubtext}>Amazing Memory!</Text>

                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{attempts}</Text>
                                    <Text style={styles.statLabel}>Total Moves</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{failures}</Text>
                                    <Text style={styles.statLabel}>Errors</Text>
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
                                    <Text style={styles.nextBtnText}>Continue to Level {level + 1}</Text>
                                    <Ionicons name="arrow-forward" size={24} color={COLORS.successStart} />
                                </LinearGradient>
                            </Pressable>

                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.exitBtn}
                            >
                                <View style={styles.exitBtnInner}>
                                    <Ionicons name="home-outline" size={20} color="rgba(255,255,255,0.9)" style={{ marginRight: 6 }} />
                                    <Text style={styles.exitBtnText}>Back to Menu</Text>
                                </View>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )}

                {showConfetti && (
                    <ConfettiCannon
                        count={200}
                        origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
                        fadeOut={true}
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
        marginTop: -31
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
        borderColor: COLORS.neonYellow,
        borderRadius: 16,
    },
    statsText: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.secondaryStart,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingBottom: 40,
    },
    cardContainer: {
        margin: CARD_MARGIN,
        perspective: 1000,
    },
    cardInner: {
        flex: 1,
        position: 'relative',
    },
    cardFace: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cardBack: {
        zIndex: 2,
    },
    cardFront: {
        zIndex: 1,
    },
    cardGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    cardInnerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    cardQuestion: {
        color: COLORS.textWhite,
        fontWeight: '900',
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        zIndex: 1,
    },
    cardEmoji: {
        textAlign: 'center',
        zIndex: 1,
    },
    resultsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 100,
    },
    resultsBox: {
        width: '100%',
        maxWidth: 400,
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        elevation: 20,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    resultsIconWrap: {
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
    resultsIcon: {
        fontSize: 56,
    },
    congratsText: {
        fontSize: 30,
        fontWeight: '900',
        color: COLORS.textWhite,
        marginBottom: 6,
        textAlign: 'center',
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    congratsSubtext: {
        fontSize: 18,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
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
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderRadius: 30,
    },
    nextBtnText: {
        color: COLORS.successStart,
        fontSize: 20,
        fontWeight: '900',
    },
    exitBtn: {
        paddingVertical: 12,
    },
    exitBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exitBtnText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default MemoryGameScreen;
