import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';

import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MODES = {
    LETTERS: 'Letters',
    NUMBERS: 'Numbers',
};

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const NUMBERS = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

const COLORS = {
    Letters: '#FF6B6B',
    Numbers: '#4D96FF',
    Background: '#F8F9FA',
    Text: '#2D3436',
    White: '#FFFFFF',
    Gray: '#636E72',
};

const SpeakAndLearnScreen = ({ navigation }) => {
    const [mode, setMode] = useState(MODES.LETTERS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const autoplayTimer = useRef(null);

    const items = mode === MODES.LETTERS ? LETTERS : NUMBERS;
    const currentItem = items[currentIndex];

    const speakItem = useCallback((text) => {
        Speech.stop();
        Speech.speak(text, {
            language: 'en',
            rate: 0.7, // Slow for kids
            pitch: 1.0,
        });
    }, []);

    useEffect(() => {
        // Stop speech when unmounting
        return () => {
            Speech.stop();
            if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
        };
    }, []);

    useEffect(() => {
        // Reset index when mode changes
        setCurrentIndex(0);
        if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    }, [mode]);

    useEffect(() => {
        // Trigger animation and speech when currentItem changes
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();

        speakItem(currentItem);

        // Handle autoplay
        if (isAutoplay) {
            autoplayTimer.current = setTimeout(() => {
                handleNext();
            }, 3000); // 3 seconds per item
        } else {
            if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
        }

        return () => {
            if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
        };
    }, [currentIndex, mode, isAutoplay]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const toggleMode = () => {
        setMode((prev) => (prev === MODES.LETTERS ? MODES.NUMBERS : MODES.LETTERS));
    };

    const toggleAutoplay = () => {
        setIsAutoplay((prev) => !prev);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={28} color={COLORS.Text} />
                </TouchableOpacity>
                <Text style={styles.title}>Speak & Learn</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Mode Switcher */}
            <View style={styles.modeContainer}>
                <TouchableOpacity
                    style={[
                        styles.modeTab,
                        mode === MODES.LETTERS && { backgroundColor: COLORS.Letters }
                    ]}
                    onPress={() => setMode(MODES.LETTERS)}
                >
                    <Text style={[
                        styles.modeText,
                        mode === MODES.LETTERS && styles.activeModeText
                    ]}>LETTERS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.modeTab,
                        mode === MODES.NUMBERS && { backgroundColor: COLORS.Numbers }
                    ]}
                    onPress={() => setMode(MODES.NUMBERS)}
                >
                    <Text style={[
                        styles.modeText,
                        mode === MODES.NUMBERS && styles.activeModeText
                    ]}>NUMBERS</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                <Animated.View style={[
                    styles.card,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                        borderColor: mode === MODES.LETTERS ? COLORS.Letters : COLORS.Numbers
                    }
                ]}>
                    <Text style={[
                        styles.bigText,
                        { color: mode === MODES.LETTERS ? COLORS.Letters : COLORS.Numbers }
                    ]}>
                        {currentItem}
                    </Text>
                </Animated.View>

                {/* Hear Again */}
                <TouchableOpacity
                    style={styles.hearAgainButton}
                    onPress={() => speakItem(currentItem)}
                >
                    <Ionicons name="volume-medium" size={32} color={COLORS.White} />
                    <Text style={styles.hearAgainText}>HEAR AGAIN</Text>
                </TouchableOpacity>
            </View>

            {/* Controls */}
            <View style={styles.footer}>
                <View style={styles.navigationControls}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={handlePrev}
                    >
                        <Ionicons name="chevron-back" size={40} color={COLORS.White} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.autoplayButton,
                            isAutoplay && styles.autoplayButtonActive
                        ]}
                        onPress={toggleAutoplay}
                    >
                        <Ionicons
                            name={isAutoplay ? "pause" : "play"}
                            size={28}
                            color={isAutoplay ? COLORS.White : COLORS.Gray}
                        />
                        <Text style={[
                            styles.autoplayText,
                            isAutoplay && { color: COLORS.White }
                        ]}>
                            {isAutoplay ? "STOP AUTO" : "AUTO PLAY"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={handleNext}
                    >
                        <Ionicons name="chevron-forward" size={40} color={COLORS.White} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.progress}>
                    {currentIndex + 1} / {items.length}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.Background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        height: 60,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.Text,
        letterSpacing: 0.5,
    },
    modeContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#E9ECEF',
        borderRadius: 15,
        padding: 4,
    },
    modeTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    modeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.Gray,
    },
    activeModeText: {
        color: COLORS.White,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    card: {
        width: width * 0.7,
        height: width * 0.7,
        backgroundColor: COLORS.White,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    bigText: {
        fontSize: width * 0.35,
        fontWeight: '900',
    },
    hearAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.Text,
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 30,
        marginTop: 40,
        elevation: 5,
    },
    hearAgainText: {
        color: COLORS.White,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    footer: {
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    navigationControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navButton: {
        backgroundColor: COLORS.Text,
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    autoplayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E9ECEF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    autoplayButtonActive: {
        backgroundColor: '#20C997',
        borderColor: '#12B886',
    },
    autoplayText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.Gray,
    },
    progress: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.Gray,
    },
});

export default SpeakAndLearnScreen;
