import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalstyles } from '../../style/GlobalStyle';
import Card from '../../shared/Card';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 5;

const SYMBOL_POOL = [
    '⭐', '🍎', '🚗', '🚀', '⚽', '🍦', '🎮', '💡',
    '🎨', '🎲', '🧩', '🎸', '🛹', '🛸', '🌈', '💎',
    '🐱', '🐶', '🦁', '🐼', '🐨', '🦊', '🐯', '🐰',
    '🍉', '🍓', '🍒', '🍍', '🥝', '🥑', '🥥', '🌽',
    '🎭', '🎪', '🏇', '🏌️', '🏄', '🚣', '🏊', '🚴',
    '🎹', '🎺', '🎻', '🎬', '🎯', '🎰', '🗼', '🗽'
];

const STORAGE_KEY = '@memory_game_progress';

const MemoryGameScreen = ({ route, navigation }) => {
    const { level: initialLevel } = route.params || { level: 1 };
    const [level, setLevel] = useState(initialLevel);
    const [completedLevels, setCompletedLevels] = useState([]);

    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Stats
    const [attempts, setAttempts] = useState(0);
    const [failures, setFailures] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // Load progress
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

    // Save progress
    const saveProgress = async (currentLevel, completed) => {
        try {
            const savedData = await AsyncStorage.getItem(STORAGE_KEY);
            const parsed = savedData ? JSON.parse(savedData) : { currentLevel: 1, completed: [] };

            // Only update currentLevel if the new one is higher
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
        // Scaling: Level 1 (2x2) = 2 pairs. Level 2 = 3 pairs. Level 3 (2x4) = 4 pairs...
        // Total cards = (lvl + 1) * 2
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
    }, []);

    useEffect(() => {
        if (level) initGame(level);
    }, [level, initGame]);

    const handleFlip = (index) => {
        if (isProcessing || flippedIndices.includes(index) || matchedPairs.includes(cards[index].content) || showResults) {
            return;
        }

        if (flippedIndices.length === 0) {
            setFlippedIndices([index]);
        } else if (flippedIndices.length === 1) {
            const firstIndex = flippedIndices[0];
            setFlippedIndices([firstIndex, index]);
            setIsProcessing(true);
            setAttempts(prev => prev + 1);

            if (cards[firstIndex].content === cards[index].content) {
                const newMatched = [...matchedPairs, cards[firstIndex].content];
                setMatchedPairs(newMatched);
                setFlippedIndices([]);
                setIsProcessing(false);

                if (newMatched.length === cards.length / 2) {
                    // Level Completed
                    const updatedCompleted = [...new Set([...completedLevels, level])].sort((a, b) => a - b);
                    setCompletedLevels(updatedCompleted);
                    saveProgress(level + 1, updatedCompleted);
                    setTimeout(() => setShowResults(true), 500);
                }
            } else {
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

    // Calculate dynamic columns based on card count
    const getColumns = () => {
        const count = cards.length;
        if (count <= 4) return 2;
        if (count <= 12) return 3;
        return 4;
    };

    const columns = getColumns();
    const cardSize = (SCREEN_WIDTH - 80) / columns;

    return (
        <View style={globalstyles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: '#784575', fontWeight: 'bold' }}>← Back</Text>
                </TouchableOpacity>
                <Text style={[globalstyles.textStyle, { fontSize: 22 }]}>Level {level}</Text>
                <Text style={{ fontWeight: 'bold' }}>Try: {attempts}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {cards.map((card, index) => {
                    const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.content);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.card,
                                { width: cardSize, height: cardSize },
                                isFlipped ? styles.cardFlipped : styles.cardHidden
                            ]}
                            onPress={() => handleFlip(index)}
                        >
                            <Text style={[styles.cardText, { fontSize: cardSize * 0.5 }]}>
                                {isFlipped ? card.content : '?'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {showResults && (
                <View style={styles.resultsOverlay}>
                    <Text style={styles.confetti}>🎉 ✨ 🎊 ✨ 🎉</Text>
                    <Text style={styles.congratsText}>Level {level} Cleared!</Text>

                    <View style={styles.statsBox}>
                        <Text style={styles.statsText}>Total Attempts: {attempts}</Text>
                        <Text style={styles.statsText}>Errors: {failures}</Text>
                    </View>

                    <Pressable
                        onPress={nextLevel}
                        style={({ pressed }) => [globalstyles.Btn, { width: '80%', opacity: pressed ? 0.7 : 1 }]}
                    >
                        <Card backgroundColor="#ACFEDB">
                            <Text style={globalstyles.textStyle}>Continue to Level {level + 1}</Text>
                        </Card>
                    </Pressable>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#911', fontWeight: 'bold' }}>Exit to Menu</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    card: {
        margin: CARD_MARGIN,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#789134',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cardHidden: {
        backgroundColor: '#784575',
    },
    cardFlipped: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ACFEDB',
    },
    cardText: {
        textAlign: 'center',
    },
    resultsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(250, 202, 247, 0.98)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    confetti: {
        fontSize: 40,
        marginBottom: 10,
    },
    congratsText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    statsBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        marginBottom: 30,
        alignItems: 'center',
        elevation: 5,
    },
    statsText: {
        fontSize: 16,
        marginVertical: 4,
    }
});

export default MemoryGameScreen;
