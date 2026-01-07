import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from 'react-native';
import { globalstyles } from '../style/GlobalStyle';
import Card from '../shared/Card';

const GAMES = [
    {
        name: 'Tic Tac Toe',
        route: 'TicTacToe',
        color: '#00FFC6', // more saturated greenish
        emoji: '❌⭕'
    },
    {
        name: 'Memory Match',
        route: 'MemoryLevelSelection',
        color: '#FFAA00', // saturated orange
        emoji: '🧠'
    },
    {
        name: '2048',
        route: 'Game2048',
        color: '#FF66AA', // hot pink
        emoji: '🔢'
    },
    {
        name: 'Onet Master',
        route: 'OnetLevelSelection',
        color: '#00BFA6', // teal
        emoji: '🀄'
    },
    {
        name: 'Sliding Puzzle',
        route: 'SlidingPuzzleLevelSelection',
        color: '#FF77FF', // bright magenta
        emoji: '🧩'
    },
    {
        name: 'Flow Pipes',
        route: 'FlowLevelSelection',
        color: '#00E0FF', // cyan
        emoji: '💧'
    },
];

const GamesHome = ({ navigation }) => {
    const animatedValues = useRef(GAMES.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const animations = animatedValues.map((anim, idx) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: idx * 100,
                useNativeDriver: true,
            })
        );
        Animated.stagger(100, animations).start();
    }, []);

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>🎮 Games Hub</Text>

            <View style={styles.grid}>
                {GAMES.map((game, idx) => {
                    const animStyle = {
                        opacity: animatedValues[idx],
                        transform: [
                            {
                                translateY: animatedValues[idx].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0],
                                }),
                            },
                        ],
                    };
                    return (
                        <Animated.View key={idx} style={[styles.btn, animStyle]}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.pressable,
                                    {
                                        transform: pressed ? [{ scale: 0.96 }] : [{ scale: 1 }],
                                        shadowOpacity: pressed ? 0.35 : 0.5,
                                    },
                                ]}
                                onPress={() => navigation.navigate(game.route)}
                            >
                                <Card
                                    backgroundColor={game.color}
                                    style={styles.card}
                                >
                                    <Text style={styles.btnText}>
                                        {game.emoji} {game.name}
                                    </Text>
                                </Card>
                            </Pressable>
                        </Animated.View>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        paddingBottom: 40,
        backgroundColor: '#F0F8FF', // slightly richer background
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#FF3399', // saturated magenta for title
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    grid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    btn: {
        width: '48%',
        marginBottom: 20,
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
    },
    pressable: {
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
    },
    card: {
        paddingVertical: 25,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default GamesHome;
