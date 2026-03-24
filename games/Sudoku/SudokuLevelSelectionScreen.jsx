import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getDifficultyList, getSudokuLevels } from './SudokuConfig';

const { width } = Dimensions.get('window');

const SudokuLevelSelectionScreen = ({ navigation }) => {
    const difficulties = getDifficultyList();

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

                <Text style={styles.subtitle}>Select Difficulty</Text>

                {difficulties.map((diff) => {
                    const levels = getSudokuLevels(diff.id);
                    return (
                        <View key={diff.id} style={styles.section}>
                            <View style={[styles.diffBadge, { backgroundColor: diff.color }]}>
                                <Text style={styles.diffText}>{diff.label}</Text>
                            </View>

                            <View style={styles.levelsRow}>
                                {levels.map((lvl) => (
                                    <Pressable
                                        key={lvl.level}
                                        style={styles.levelCard}
                                        onPress={() =>
                                            navigation.navigate('Sudoku', {
                                                difficulty: diff.id,
                                                level: lvl.level - 1,
                                            })
                                        }
                                    >
                                        <LinearGradient
                                            colors={[diff.color, adjustColor(diff.color, -30)]}
                                            style={styles.levelGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Text style={styles.levelNum}>{lvl.level}</Text>
                                        </LinearGradient>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    );
                })}
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
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    diffBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    diffText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    levelsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    levelCard: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    levelGradient: {
        width: (width - 80) / 4,
        height: (width - 80) / 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
        borderRadius: 16,
    },
    levelNum: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
});

export default SudokuLevelSelectionScreen;
