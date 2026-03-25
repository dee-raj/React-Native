import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDifficultyList, getSudokuLevels, STORAGE_KEY, getTotalLevels } from './SudokuConfig';

const { width } = Dimensions.get('window');

const SudokuLevelSelectionScreen = ({ navigation }) => {
    const [completedLevels, setCompletedLevels] = useState({ easy: [], medium: [], hard: [] });
    const [loaded, setLoaded] = useState(false);
    const animValues = useRef([]).current;

    const difficulties = getDifficultyList();

    useEffect(() => {
        const load = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    setCompletedLevels(data.completedLevels || { easy: [], medium: [], hard: [] });
                }
            } catch (e) {
                console.error('Failed to load sudoku progress', e);
            }
            setLoaded(true);
        };

        const unsubscribe = navigation.addListener('focus', load);
        load();
        return unsubscribe;
    }, [navigation]);

    // Stagger animation for level cards
    useEffect(() => {
        if (loaded && animValues.length > 0) {
            Animated.stagger(60,
                animValues.map(anim =>
                    Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true })
                )
            ).start();
        }
    }, [loaded]);

    const getUnlockedLevels = (difficulty) => {
        const diffCompleted = completedLevels[difficulty] || [];
        const total = getTotalLevels(difficulty);
        if (diffCompleted.length === total) return total;
        const unlocked = new Set();
        for (let i = 0; i < total; i++) {
            if (i === 0) {
                unlocked.add(i);
            } else if (diffCompleted.includes(i - 1)) {
                unlocked.add(i);
            } else {
                break;
            }
        }
        return unlocked;
    };

    const isSectionUnlocked = (difficultyId) => {
        if (difficultyId === 'easy') return true;
        if (difficultyId === 'medium') {
            return (completedLevels.easy || []).length >= getTotalLevels('easy');
        }
        if (difficultyId === 'hard') {
            return (completedLevels.medium || []).length >= getTotalLevels('medium');
        }
        return false;
    };

    const getSectionProgress = (difficultyId) => {
        const done = (completedLevels[difficultyId] || []).length;
        const total = getTotalLevels(difficultyId);
        return { done, total };
    };

    // Build flat list of all level items for animation
    let itemIndex = 0;
    const allItems = [];
    difficulties.forEach(diff => {
        const levels = getSudokuLevels(diff.id);
        levels.forEach(lvl => {
            if (!animValues[itemIndex]) animValues[itemIndex] = new Animated.Value(0);
            allItems.push({ ...lvl, diffConfig: diff, animIdx: itemIndex });
            itemIndex++;
        });
    });

    if (!loaded) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={[styles.container, styles.centered]}>
                    <Ionicons name="grid-outline" size={48} color="rgba(255,255,255,0.3)" />
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </Pressable>
                    <Text style={styles.title}>Sudoku</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Text style={styles.subtitle}>Select Level</Text>

                {difficulties.map((diff) => {
                    const sectionUnlocked = isSectionUnlocked(diff.id);
                    const progress = getSectionProgress(diff.id);
                    const unlocked = getUnlockedLevels(diff.id);

                    return (
                        <View key={diff.id} style={styles.section}>
                            {/* Difficulty badge + progress */}
                            <View style={styles.sectionHeader}>
                                <View style={[styles.diffBadge, { backgroundColor: sectionUnlocked ? diff.color : '#555' }]}>
                                    <Text style={styles.diffText}>
                                        {!sectionUnlocked ? '🔒 ' : ''}{diff.label}
                                    </Text>
                                </View>
                                {sectionUnlocked && (
                                    <Text style={styles.progressText}>
                                        {progress.done}/{progress.total}
                                    </Text>
                                )}
                                {!sectionUnlocked && (
                                    <Text style={styles.lockedHint}>
                                        {diff.id === 'medium' ? 'Complete all Easy levels' : 'Complete all Medium levels'}
                                    </Text>
                                )}
                            </View>

                            {/* Level cards */}
                            <View style={[styles.levelsRow, !sectionUnlocked && styles.sectionLocked]}>
                                {getSudokuLevels(diff.id).map((lvl) => {
                                    const isCompleted = (completedLevels[diff.id] || []).includes(lvl.index);
                                    const isUnlocked = sectionUnlocked && (typeof unlocked === 'number' ? lvl.index < unlocked : unlocked.has(lvl.index));
                                    const isLocked = !sectionUnlocked || !isUnlocked;
                                    const isCurrent = isUnlocked && !isCompleted;

                                    let gradientColors = [diff.color, adjustColor(diff.color, -30)];
                                    let borderColor = diff.color;

                                    if (isCompleted) {
                                        gradientColors = ['#10B981', '#059669'];
                                        borderColor = '#047857';
                                    } else if (isLocked) {
                                        gradientColors = ['#444', '#333'];
                                        borderColor = '#555';
                                    } else if (isCurrent) {
                                        borderColor = '#FFF';
                                    }

                                    return (
                                        <Pressable
                                            key={`${diff.id}-${lvl.index}`}
                                            disabled={isLocked}
                                            onPress={() => {
                                                if (!isLocked) {
                                                    navigation.navigate('Sudoku', {
                                                        difficulty: diff.id,
                                                        level: lvl.index,
                                                    });
                                                }
                                            }}
                                        >
                                            <LinearGradient
                                                colors={gradientColors}
                                                style={[
                                                    styles.levelGradient,
                                                    { borderColor },
                                                    isLocked && styles.levelLocked,
                                                    isCurrent && styles.levelCurrent,
                                                    isCompleted && styles.levelCompleted,
                                                ]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                {isCompleted ? (
                                                    <>
                                                        <Ionicons name="checkmark-circle" size={28} color="#FFF" />
                                                        <Text style={styles.levelNumSmall}>{lvl.level}</Text>
                                                    </>
                                                ) : isLocked ? (
                                                    <Ionicons name="lock-closed" size={24} color="rgba(255,255,255,0.4)" />
                                                ) : (
                                                    <Text style={styles.levelNum}>{lvl.level}</Text>
                                                )}
                                            </LinearGradient>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}

                <View style={styles.rulesContainer}>
                    <Text style={styles.rulesTitle}>🧩 Classic Sudoku</Text>

                    <Text style={styles.rulesDescription}>
                        Fill the 9x9 grid so every row, column, and 3x3 box contains numbers from 1 to 9.
                    </Text>

                    <View style={styles.ruleItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ruleText}>Each row must contain 1-9 exactly once</Text>
                    </View>

                    <View style={styles.ruleItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ruleText}>Each column must contain 1-9 exactly once</Text>
                    </View>

                    <View style={styles.ruleItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ruleText}>Each 3x3 box must contain 1-9 exactly once</Text>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const adjustColor = (hex, amount) => {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, marginTop: -32 },
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        marginBottom: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 12,
    },
    diffBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    diffText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    progressText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '600',
    },
    lockedHint: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontStyle: 'italic',
    },
    levelsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    sectionLocked: {
        opacity: 0.4,
    },
    levelGradient: {
        width: (width - 90) / 5,
        height: (width - 90) / 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 14,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    levelLocked: {
        elevation: 0,
        shadowOpacity: 0,
    },
    levelCurrent: {
        elevation: 8,
        shadowColor: '#FFF',
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    levelCompleted: {
        elevation: 6,
        shadowColor: '#10B981',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    levelNum: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    levelNumSmall: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
        marginTop: 2,
    },
    rulesContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },

    rulesTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 8,
    },

    rulesDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
        lineHeight: 20,
    },

    ruleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },

    bullet: {
        color: '#4ADE80',
        fontSize: 16,
        marginRight: 8,
    },

    ruleText: {
        flex: 1,
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 20,
    },
});

export default SudokuLevelSelectionScreen;
