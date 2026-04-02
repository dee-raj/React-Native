import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import dailyChallengeManager from '../shared/DailyChallengeManager';
import { shareDailyChallenge } from '../shared/SharingManager';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

const DailyChallengeScreen = ({ navigation }) => {
    const [games, setGames] = useState([]);
    const [progress, setProgress] = useState({ completedCount: 0, totalCount: 10 });
    const [stats, setStats] = useState({ totalCompletions: 0, maxStreak: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const gamesWithStatus = await dailyChallengeManager.getAllGamesWithStatus();
        setGames(gamesWithStatus);

        const todayProgress = await dailyChallengeManager.getTodayProgress();
        setProgress(todayProgress);

        const overallStats = await dailyChallengeManager.getOverallStats();
        setStats(overallStats);
    };

    const handleGamePress = (game) => {
        // Navigate to the game through the Games stack
        navigation.navigate('Games', {
            screen: game.route,
        });
    };

    const renderGameCard = ({ item }) => {
        const isCompleted = item.completedToday;

        return (
            <Pressable
                onPress={() => handleGamePress(item)}
                style={({ pressed }) => [
                    styles.gameCard,
                    pressed && styles.cardPressed,
                    isCompleted && styles.completedCard,
                ]}
            >
                <LinearGradient
                    colors={isCompleted
                        ? ['#10B981', '#059669']
                        : [item.color, `${item.color}99`]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardHeader}>
                        {isCompleted && (
                            <View style={styles.completedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                            </View>
                        )}
                        <View style={styles.iconContainer}>
                            <Ionicons name={item?.icon} size={32} color="#FFF" />
                        </View>
                    </View>

                    <Text style={styles.gameName}>{item.name}</Text>
                    <Text style={styles.gameDescription}>{item.description}</Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.streakContainer}>
                            <Ionicons name="flame" size={16} color="#FFD93D" />
                            <Text style={styles.streakText}>{item.streak}</Text>
                        </View>
                        {isCompleted ? (
                            <Text style={styles.playText}>Done!</Text>
                        ) : (
                            <Text style={styles.playText}>Play</Text>
                        )}
                    </View>
                </LinearGradient>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Daily Challenge</Text>
                    <Pressable
                        onPress={() => shareDailyChallenge(stats.maxStreak, progress.completedCount, progress.totalCount)}
                        style={styles.backBtn}
                    >
                        <Ionicons name="share-social" size={24} color="#FFF" />
                    </Pressable>
                </View>

                {/* Progress Banner */}
                <View style={styles.progressBanner}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progressGradient}
                    >
                        <View style={styles.progressContent}>
                            <View style={styles.progressStats}>
                                <View style={styles.progressStatItem}>
                                    <Ionicons name="trophy" size={24} color="#FFD93D" />
                                    <Text style={styles.progressStatValue}>{stats.totalCompletions}</Text>
                                    <Text style={styles.progressStatLabel}>Total</Text>
                                </View>
                                <View style={styles.progressDivider} />
                                <View style={styles.progressStatItem}>
                                    <Ionicons name="flame" size={24} color="#FF6B6B" />
                                    <Text style={styles.progressStatValue}>{stats.maxStreak}</Text>
                                    <Text style={styles.progressStatLabel}>Best Streak</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarLabels}>
                        <Text style={styles.progressBarTitle}>Today's Progress</Text>
                        <Text style={styles.progressBarCount}>
                            {progress.completedCount}/{progress.totalCount}
                        </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${(progress.completedCount / progress.totalCount) * 100}%` }
                            ]}
                        />
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Games Section */}
                    <Text style={styles.sectionTitle}>Pick Your Challenge</Text>

                    <FlatList
                        data={games}
                        renderItem={renderGameCard}
                        keyExtractor={(item) => item.key}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        scrollEnabled={false}
                    />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        marginTop: -32,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        marginBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    progressBanner: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    progressGradient: {
        padding: 20,
    },
    progressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressStatItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    progressStatValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        marginTop: 4,
    },
    progressStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    progressDivider: {
        width: 1,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    progressBarContainer: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    progressBarLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressBarTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    progressBarCount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#667eea',
    },
    progressBarTrack: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#667eea',
        borderRadius: 6,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        marginHorizontal: 20,
        marginBottom: 16,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    gameCard: {
        width: CARD_WIDTH,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cardPressed: {
        transform: [{ scale: 0.96 }],
        opacity: 0.9,
    },
    completedCard: {
        borderWidth: 2,
        borderColor: '#10B981',
    },
    cardGradient: {
        padding: 16,
        minHeight: 160,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    completedBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 12,
        padding: 4,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    gameDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    streakText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    playText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default DailyChallengeScreen;
