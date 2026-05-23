import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    FlatList,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../theme/Theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 3;

const GAMES = [
    {
        name: 'Tic Tac Toe',
        route: 'TicTacToe',
        image: require('../assets/games/tic-tac-toe.png'),
        category: 'Puzzles',
    },
    {
        name: 'Memory Match',
        route: 'MemoryLevelSelection',
        image: require('../assets/games/memory.png'),
        category: 'Puzzles',
    },
    {
        name: '2048',
        route: 'Game2048',
        image: require('../assets/games/2048.png'),
        category: 'Puzzles',
    },
    {
        name: 'Onet Master',
        route: 'OnetLevelSelection',
        icon: 'images',
        image: require('../assets/games/onet-master.png'),
        family: 'FontAwesome6',
        category: 'Puzzles',
    },
    {
        name: 'Sliding Puzzle',
        route: 'SlidingPuzzleLevelSelection',
        image: require('../assets/games/sliding-puzzle.png'),
        category: 'Puzzles',
    },
    {
        name: 'Flow Pipes',
        route: 'FlowLevelSelection',
        image: require('../assets/games/flow-pipes.png'),
        category: 'Puzzles',
    },
    {
        name: 'Abacus Math',
        route: 'AbacusCategory',
        image: require('../assets/games/maths-game.png'),
        icon: 'calculator',
        family: 'FontAwesome6',
        category: 'Puzzles',
    },
    {
        name: 'Speak & Learn',
        route: 'SpeakAndLearn',
        image: require('../assets/games/speak-and-learn.png'),
        icon: 'volume-high',
        family: 'Ionicons',
        category: 'Learning',
    },
    {
        name: 'Shape Tap',
        route: 'ShapeTap',
        image: require('../assets/games/shape-tap.png'),
        category: 'Learning',
    },
    {
        name: 'Sudoku',
        route: 'SudokuLevelSelection',
        image: require('../assets/games/sudoku.png'),
        category: 'Puzzles',
    },
    {
        name: 'Cryptogram',
        route: 'CryptogramLevelSelection',
        image: require('../assets/games/cryptogram.png'),
        category: 'Puzzles',
    },
    {
        name: 'Wordle',
        route: 'Wordle',
        image: require('../assets/games/wordle.png'),
        category: 'Puzzles',
    },
];

const GamesHome = ({ navigation }) => {
    const { colors, gradients } = useTheme();
    const animatedValues = useRef(GAMES.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.stagger(80,
            animatedValues.map((anim) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                })
            )
        ).start();
    }, []);

    const renderGameItem = ({ item, index }) => {
        const animStyle = {
            opacity: animatedValues[index] || 1,
            transform: [
                {
                    scale: animatedValues[index] ? animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                    }) : 1,
                },
            ],
        };

        return (
            <Animated.View style={[styles.cardContainer, animStyle]}>
                <Pressable
                    onPress={() => navigation.navigate(item.route)}
                    style={({ pressed }) => [
                        styles.gameCard,
                        pressed && styles.cardPressed
                    ]}
                >
                    {item.image ? (
                        <Animated.Image
                            source={item.image}
                            style={styles.gameImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.iconContainer}>
                            {item.family === 'FontAwesome6' ? (
                                <FontAwesome6 name={item.icon} size={32} color="#FFF" />
                            ) : (
                                <Ionicons name={item.icon} size={32} color="#FFF" />
                            )}
                        </View>
                    )}
                </Pressable>
                <Text style={[styles.gameLabel, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <FlatList
                data={GAMES}
                renderItem={renderGameItem}
                keyExtractor={(item) => item.route}
                numColumns={3}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Pressable
                        onPress={() => navigation.navigate('DailyChallenge')}
                        style={({ pressed }) => [
                            styles.dailyChallengeBanner,
                            pressed && styles.bannerPressed,
                        ]}
                    >
                        <LinearGradient
                            colors={gradients.accent}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.bannerGradient}
                        >
                            <View style={styles.bannerContent}>
                                <Ionicons name="calendar" size={28} color="#FFF" />
                                <View style={styles.bannerTextContainer}>
                                    <Text style={styles.bannerTitle}>Daily Challenge</Text>
                                    <Text style={styles.bannerSubtitle}>New challenge every day!</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={24} color="#FFF" />
                            </View>
                        </LinearGradient>
                    </Pressable>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#8181b1ff',
        marginTop: -32,
    },
    gridContent: {
        padding: 16,
        paddingBottom: 100,
    },
    dailyChallengeBanner: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    bannerPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    bannerGradient: {
        padding: 16,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bannerTextContainer: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    bannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
    },
    cardContainer: {
        width: COLUMN_WIDTH,
        marginHorizontal: 4,
        marginBottom: 16,
        alignItems: 'center',

        elevation: 5,
        shadowColor: '#f0ceceff',
        shadowOffset: {
            width: 2,
            height: 4,
        },
        paddingBottom: 16,
        borderRadius: 12,
    },
    gameCard: {
        width: COLUMN_WIDTH - 8,
        height: COLUMN_WIDTH - 8,
        backgroundColor: '#1C1C1E',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#f3b4b4ff',
    },
    cardPressed: {
        transform: [{ scale: 0.95 }],
        backgroundColor: '#2C2C2E',
    },
    gameImage: {
        width: '100%',
        height: '100%',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameLabel: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '500',
        color: "white",
        textAlign: 'center',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#1C1C1E',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#2C2C2E',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    navItemActive: {
        backgroundColor: 'rgba(163, 253, 80, 0.1)',
        borderRadius: 15,
    },
});

export default GamesHome;
