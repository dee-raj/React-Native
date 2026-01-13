import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    Dimensions,
    Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SHAPES = [
    { id: 'circle', name: 'Circle', icon: 'circle', color: '#FF6B6B' },
    { id: 'square', name: 'Square', icon: 'square', color: '#4D96FF' },
    { id: 'triangle', name: 'Triangle', icon: 'triangle', color: '#FFD93D' },
    { id: 'star', name: 'Star', icon: 'star', color: '#A66CFF' },
    { id: 'box', name: 'Box', icon: 'box', color: '#09583fff' },
    { id: 'heart', name: 'Heart', icon: 'heart', color: '#38c206ff' },
];

const SUCCESS_SPEECH = ["Yay!", "Woohoo!", "Hooray!", "Yes!", "Bravo!", "Awesome!", "Great!", "Wow!", 'Correct!'];
const TRY_AGAIN_SPEECH = ["Oops!", "Uh-oh!", "Hmm!", "Try again!", "Almost!", "Not yet!", "Whoops!", "Nooo!"];

const ShapeTapGameScreen = () => {
    const [targetShape, setTargetShape] = useState(null);
    const [shapesOrder, setShapesOrder] = useState([...SHAPES]);
    const [feedback, setFeedback] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const feedbackTimeout = useRef(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const speak = (text) => {
        Speech.stop();
        Speech.speak(text, {
            rate: 0.85,
            pitch: 0.9,
        });
    };

    const shuffleArray = (array) => {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const selectNewTarget = useCallback(() => {
        const next = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        setTargetShape(next);
        setShapesOrder(shuffleArray(SHAPES));
        setFeedback(`Tap the ${next.name}`);
        speak(`Tap the ${next.name}`);
    }, []);

    const showTemporaryFeedback = (text, duration = 2500) => {
        setFeedback(text);
        if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);

        feedbackTimeout.current = setTimeout(() => {
            setFeedback(`Tap the ${targetShape.name}`);
        }, duration);
    };

    useEffect(() => {
        selectNewTarget();
    }, []);

    const successAnimation = () => {
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
    };

    const handlePress = (shape) => {
        if (shape.id === targetShape.id) {
            const message = randomFrom(SUCCESS_SPEECH);
            setFeedback(`🎉 ${message}`);
            speak(message);
            setShowConfetti(true);
            successAnimation();

            setTimeout(() => {
                setShowConfetti(false);
                selectNewTarget();
            }, 1200);
        } else {
            const message = randomFrom(TRY_AGAIN_SPEECH);
            showTemporaryFeedback(`😊 ${message}`);
            speak(message);
        }
    };

    useEffect(() => {
        return () => {
            if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
        };
    }, []);

    return (
        <LinearGradient
            colors={['#E0F7FA', '#E1F5FE']}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                {/* Feedback / Prompt */}
                <Animated.View style={[styles.promptCard, { transform: [{ scale: scaleAnim }] }]}>
                    <Text style={[styles.promptText, { color: targetShape?.color }]}>{feedback}</Text>
                </Animated.View>

                {/* Shapes Grid */}
                <View style={styles.grid}>
                    {shapesOrder.map((shape) => (
                        <Pressable
                            key={shape.id}
                            onPress={() => handlePress(shape)}
                            style={({ pressed }) => [
                                styles.shape,
                                { backgroundColor: shape.color },
                                pressed && styles.pressed,
                            ]}
                        >
                            <Feather name={shape.icon} size={72} color="#FFF" />
                        </Pressable>
                    ))}
                </View>

                {/* Confetti */}
                {showConfetti && <ConfettiCannon count={180} origin={{ x: width / 2, y: 0 }} fadeOut />}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    promptCard: {
        alignSelf: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 24,
        paddingHorizontal: 40,
        borderRadius: 32,
        marginBottom: 40,
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    promptText: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
    },
    shape: {
        width: width * 0.38,
        height: width * 0.38,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    pressed: { transform: [{ scale: 0.92 }], opacity: 0.85 },
});

export default ShapeTapGameScreen;