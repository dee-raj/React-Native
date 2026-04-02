import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLevelConfig } from "./AbacusConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import soundManager from '../../shared/SoundManager';

const { width, height } = Dimensions.get("window");

/* ---------- Modern Color Palette ---------- */
const COLORS = {
    // Rich background gradients
    easyBgStart: "#667eea",
    easyBgMid: "#764ba2",
    easyBgEnd: "#f093fb",

    hardBgStart: "#0F2027",
    hardBgMid: "#203A43",
    hardBgEnd: "#2C5364",

    // Vibrant accents
    primaryStart: "#F857A6",
    primaryEnd: "#FF5858",

    secondaryStart: "#667eea",
    secondaryEnd: "#764ba2",

    successStart: "#10B981",
    successEnd: "#059669",

    errorStart: "#FF6B6B",
    errorEnd: "#EE5253",

    // Neon accents
    neonPurple: "#9333EA",
    neonPink: "#F472B6",
    neonCyan: "#06B6D4",
    neonGreen: "#10B981",

    // Text
    textWhite: "#FFFFFF",
    textDark: "#1F2937",
    textGrey: "#94A3B8",
};

/* ---------- Animated Background Orbs ---------- */
const BackgroundBeads = ({ isHardMode }) => {
    const beads = [
        { top: 50, left: -20, size: 140, colors: ["#F857A6", "#FF5858"] },
        { top: 200, right: -40, size: 180, colors: ["#667eea", "#764ba2"] },
        { bottom: 100, left: 40, size: 100, colors: ["#10B981", "#059669"] },
        { top: height * 0.4, right: 30, size: 120, colors: ["#F472B6", "#EE5253"] },
        { bottom: 200, right: 60, size: 90, colors: ["#06B6D4", "#0891B2"] },
    ];

    return (
        <View style={StyleSheet.absoluteFill}>
            {beads.map((b, i) => (
                <LinearGradient
                    key={i}
                    colors={b.colors}
                    style={{
                        position: "absolute",
                        top: b.top,
                        left: b.left,
                        right: b.right,
                        bottom: b.bottom,
                        width: b.size,
                        height: b.size,
                        borderRadius: b.size / 2,
                        opacity: isHardMode ? 0.15 : 0.25,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            ))}
        </View>
    );
};

const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

/* Subtraction: preserve decimal invariant (.0 / .5) */
const generateSubtractionOptions = (ans) => {
    const baseDecimal = ans % 1;
    const baseInt = Math.floor(ans);
    const OFFSETS = [-3, -2, -1, 1, 2, 3];

    const distractors = OFFSETS
        .slice(0, 3)
        .map(o => baseInt + o + baseDecimal);

    return shuffle([ans, ...distractors]);
};

/* Multiplication: small integer drift */
const generateMultiplicationOptions = (ans) => {
    const OFFSETS = [-3, -2, -1, 1, 2, 3];
    const distractors = OFFSETS
        .slice(0, 3)
        .map(o => Math.max(1, ans + o));

    return shuffle([ans, ...distractors]);
};

/* Division: wrong operands, not decimal noise */
const generateDivisionOptions = (num1, num2, ans) => {
    const candidates = [
        num1 / (num2 + 1),
        num1 / Math.max(1, num2 - 1),
        (num1 + 1) / num2,
        (num1 - 1) / num2,
        parseFloat(ans.toFixed(1)),
    ];

    const distractors = candidates
        .map(v => parseFloat(v.toFixed(2)))
        .filter(v => v > 0 && v !== ans)
        .slice(0, 3);

    return shuffle([ans, ...distractors]);
};

/* ---------- Screen ---------- */
const AbacusGameScreen = ({ route, navigation }) => {
    const { level = 1, category } = route.params || {};
    if (!category) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Missing category. Please go back and select a category.</Text>
            </SafeAreaView>
        );
    }
    const { id: categoryId } = category;
    const isHardMode = categoryId === "hard";

    const STORAGE_KEY = `@abacus_math_${categoryId}_progress`;

    const config = useMemo(
        () => getLevelConfig(categoryId, level),
        [categoryId, level]
    );

    /* ❌ Guard against invalid config */
    if (!config) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Invalid level configuration</Text>
            </SafeAreaView>
        );
    }

    const TOTAL_QUESTIONS = config.questions;
    const PASS_MARK = Math.ceil(TOTAL_QUESTIONS * 0.7);

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState(null);
    const [options, setOptions] = useState([]);
    const [inputAnswer, setInputAnswer] = useState("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(width)).current;
    const feedbackAnim = useRef(new Animated.Value(0)).current;

    const isMCQMode = useMemo(
        () => config.mode === "MCQ" || (config.mode === "MIXED" && currentQuestionIndex % 2 === 0),
        [config.mode, currentQuestionIndex]
    );

    /* ---------- Question Generator ---------- */
    const generateQuestion = useCallback(() => {
        const { range, operations } = config;
        const op = operations[Math.floor(Math.random() * operations.length)];

        let num1, num2, ans, q;

        if (op === "+") {
            num1 = Math.floor(Math.random() * range) + 1;
            num2 = Math.floor(Math.random() * range) + 1;
            ans = num1 + num2;
            q = `${num1} + ${num2}`;
        } else if (op === "-") {
            num1 = Math.floor(Math.random() * range) + range;
            num2 = Math.floor(Math.random() * num1) + 1;
            ans = num1 - num2;
            q = `${num1} - ${num2}`;
        } else if (op === "/") {
            num1 = Math.floor(Math.random() * range) + range;
            num2 = Math.floor(Math.random() * num1) + 1;
            ans = parseFloat((num1 / num2).toFixed(2));
            q = `${num1} / ${num2}`;
        } else {
            const mRange = Math.min(range, 12);
            num1 = Math.floor(Math.random() * mRange) + 1;
            num2 = Math.floor(Math.random() * mRange) + 1;
            ans = num1 * num2;
            q = `${num1} × ${num2}`;
        }

        setQuestion(q);
        setAnswer(ans);

        if (isMCQMode) {
            let opts = [];

            if (op === "-") {
                opts = generateSubtractionOptions(ans);
            } else if (op === "/") {
                opts = generateDivisionOptions(num1, num2, ans);
            } else if (op === "*") {
                opts = generateMultiplicationOptions(ans);
            } else {
                opts = shuffle([ans, ans + 1, ans - 1, ans + 2]);
            }

            setOptions(opts);
        }

        fadeAnim.setValue(0);
        slideAnim.setValue(width);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
        ]).start();
    }, [config.mode, config.questions, config.range, config.operations, isMCQMode]);

    useEffect(() => {
        if (!gameOver) {
            generateQuestion();
        }
    }, [generateQuestion, gameOver]);

    /* ---------- Answer ---------- */
    const handleAnswer = (value) => {
        if (showAnswer) return;

        const correct = Math.abs(parseFloat(value) - answer) < 0.01;
        const finalScore = correct ? score + 1 : score;

        setSelectedOption(value);
        setShowAnswer(true);
        setFeedback(correct ? "correct" : "wrong");

        if (correct) {
            setScore(finalScore);
            soundManager.playCorrect();
        } else {
            soundManager.playWrong();
        }

        feedbackAnim.setValue(0);
        Animated.sequence([
            Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(600),
            Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
            setSelectedOption(null);
            setShowAnswer(false);
            setFeedback(null);
            setInputAnswer("");

            if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
                setCurrentQuestionIndex((p) => p + 1);
                generateQuestion();
            } else {
                finishGame(finalScore);
            }
        }, 900);
    };

    /* ---------- Finish ---------- */
    const finishGame = async (finalScore) => {
        setGameOver(true);

        if (finalScore >= PASS_MARK) {
            setShowConfetti(true);
            soundManager.playWin();
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                const parsed = saved ? JSON.parse(saved) : { currentLevel: 1, completed: [] };

                const completed = [...new Set([...parsed.completed, level])];
                const nextLevel = Math.max(parsed.currentLevel, level + 1);

                await AsyncStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ currentLevel: nextLevel, completed })
                );
            } catch (e) {
                console.log("Save Progress Error", e);
            }
        }
    };

    const nextLevel = () => {
        if (getLevelConfig(categoryId, level + 1)) {
            navigation.replace("AbacusGame", { category, level: level + 1 });
        } else {
            navigation.goBack();
        }
    };

    const restartLevel = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setGameOver(false);
        setShowConfetti(false);
        generateQuestion();
    };

    /* ---------- UI ---------- */
    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={
                    isHardMode
                        ? [COLORS.hardBgStart, COLORS.hardBgMid, COLORS.hardBgEnd]
                        : [COLORS.easyBgStart, COLORS.easyBgMid, COLORS.easyBgEnd]
                }
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <BackgroundBeads isHardMode={isHardMode} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                            style={styles.backBtnGradient}
                        >
                            <Ionicons name="arrow-back" size={26} color={COLORS.textWhite} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <LinearGradient
                        colors={isHardMode ? [COLORS.neonPurple, "#A855F7"] : [COLORS.primaryStart, COLORS.primaryEnd]}
                        style={styles.levelBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.levelBadgeText}>LEVEL {level}</Text>
                    </LinearGradient>

                    <View style={styles.scoreBox}>
                        <LinearGradient
                            colors={['#FFFFFF', '#F3F4F6']}
                            style={styles.scoreBoxGradient}
                        >
                            <Text style={styles.scoreText}>
                                {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}
                            </Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                    <LinearGradient
                        colors={[COLORS.neonCyan, COLORS.neonGreen]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            styles.progressBarFill,
                            { width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100}%` },
                        ]}
                    />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.gameView}
                >
                    <Animated.View
                        style={[
                            styles.questionCard,
                            isHardMode && styles.questionCardHard,
                            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
                        ]}
                    >
                        <Text style={[styles.questionText, { color: isHardMode ? COLORS.textWhite : COLORS.textDark }]}>
                            {question}
                        </Text>
                        <Text style={[styles.equalSign, { color: isHardMode ? COLORS.neonPink : COLORS.textDark }]}>
                            = ?
                        </Text>
                    </Animated.View>

                    <View style={styles.answerArea}>
                        {isMCQMode ? (
                            <View style={styles.mcqGrid}>
                                {options.map((opt, i) => {
                                    const isSelected = selectedOption === opt;
                                    const isCorrect = opt === answer;

                                    let bgColors = [COLORS.secondaryStart, COLORS.secondaryEnd];

                                    if (showAnswer) {
                                        if (isCorrect) bgColors = [COLORS.successStart, COLORS.successEnd];
                                        else if (isSelected) bgColors = [COLORS.errorStart, COLORS.errorEnd];
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            disabled={showAnswer}
                                            style={styles.optionBtn}
                                            activeOpacity={0.85}
                                            onPress={() => handleAnswer(opt)}
                                        >
                                            <LinearGradient
                                                colors={bgColors}
                                                style={styles.optionGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                {/* Inner glow effect */}
                                                <View style={styles.optionInnerGlow} />

                                                <Text style={styles.optionText}>{opt}</Text>

                                                {/* Shine effect */}
                                                <View style={styles.optionShine} />
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={[styles.inputContainer, isHardMode && styles.inputContainerHard]}>
                                <TextInput
                                    style={[styles.inputField, { color: isHardMode ? COLORS.textWhite : COLORS.textDark }]}
                                    value={inputAnswer}
                                    keyboardType="numeric"
                                    placeholderTextColor={isHardMode ? COLORS.textGrey : "#9CA3AF"}
                                    placeholder="Type ans..."
                                    onChangeText={setInputAnswer}
                                    onSubmitEditing={() => inputAnswer.trim() && handleAnswer(inputAnswer.trim())}
                                />
                                <TouchableOpacity
                                    onPress={() => inputAnswer.trim() && handleAnswer(inputAnswer.trim())}
                                    activeOpacity={0.85}
                                    style={styles.submitBtnWrapper}
                                >
                                    <LinearGradient
                                        colors={isHardMode ? [COLORS.neonPurple, "#A855F7"] : [COLORS.primaryStart, COLORS.primaryEnd]}
                                        style={styles.submitGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <View style={styles.submitInnerGlow} />
                                        <Text style={styles.submitText}>GO!</Text>
                                        <View style={styles.submitShine} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>

                {/* Result Modal */}
                <Modal visible={gameOver} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <LinearGradient
                            colors={score >= PASS_MARK ? [COLORS.successStart, COLORS.successEnd] : [COLORS.errorStart, COLORS.errorEnd]}
                            style={styles.modalCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.resultIconWrap}>
                                <Text style={styles.resultIcon}>
                                    {score >= PASS_MARK ? "✓" : "✕"}
                                </Text>
                            </View>

                            <Text style={styles.resultTitle}>
                                {score >= PASS_MARK ? "Level Completed!" : "Try Again"}
                            </Text>

                            <Text style={styles.resultScore}>
                                {score} / {TOTAL_QUESTIONS}
                            </Text>

                            <Text style={styles.resultSubText}>
                                {score >= PASS_MARK
                                    ? "Great job! You unlocked the next level."
                                    : "Practice makes perfect. Give it another shot."}
                            </Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalBtnOutline}
                                    onPress={restartLevel}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.modalBtnOutlineInner}>
                                        <Ionicons name="refresh" size={24} color={COLORS.textWhite} style={{ marginRight: 8 }} />
                                        <Text style={styles.modalBtnOutlineText}>Replay</Text>
                                    </View>
                                </TouchableOpacity>

                                {score >= PASS_MARK && (
                                    <TouchableOpacity
                                        style={styles.modalBtnPrimaryWrapper}
                                        onPress={nextLevel}
                                        activeOpacity={0.85}
                                    >
                                        <LinearGradient
                                            colors={['#FFFFFF', '#F9FAFB']}
                                            style={styles.modalBtnPrimary}
                                        >
                                            <View style={styles.modalBtnPrimaryInner}>
                                                <Text style={styles.modalBtnPrimaryText}>Next Level</Text>
                                                <Ionicons name="arrow-forward" size={24} color={COLORS.successStart} style={{ marginLeft: 8 }} />
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={styles.modalBtnGhost}
                                    onPress={() => navigation.goBack()}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.modalBtnGhostInner}>
                                        <Ionicons name="home-outline" size={20} color="rgba(255,255,255,0.9)" style={{ marginRight: 6 }} />
                                        <Text style={styles.modalBtnGhostText}>Back to Menu</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                </Modal>

                {showConfetti && (
                    <ConfettiCannon count={150} fadeOut origin={{ x: width / 2, y: 0 }} />
                )}
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.hardBgStart,
        marginTop: -30,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
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
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 24,
        elevation: 8,
        shadowColor: COLORS.neonPurple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    levelBadgeText: {
        color: COLORS.textWhite,
        fontWeight: "900",
        fontSize: 18,
        letterSpacing: 1,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    scoreBox: {
        borderRadius: 16,
        elevation: 8,
        overflow: 'hidden',
        shadowColor: COLORS.neonCyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    scoreBoxGradient: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: COLORS.neonCyan,
        borderRadius: 16,
    },
    scoreText: {
        fontWeight: "900",
        fontSize: 18,
        color: COLORS.secondaryStart,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: "rgba(255,255,255,0.2)",
        marginHorizontal: 20,
        borderRadius: 5,
        overflow: "hidden",
        marginTop: 8,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 5,
    },
    gameView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    questionCard: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 32,
        padding: 40,
        alignItems: "center",
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.5)",
    },
    questionCardHard: {
        backgroundColor: "rgba(27,27,47,0.95)",
        borderColor: COLORS.neonPurple,
        borderWidth: 3,
        shadowColor: COLORS.neonPurple,
        shadowOpacity: 0.5,
    },
    questionText: {
        fontSize: 52,
        fontWeight: "900",
    },
    equalSign: {
        fontSize: 36,
        fontWeight: "800",
        marginTop: 12,
    },
    answerArea: {
        marginTop: 40,
        width: "100%",
    },
    mcqGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    optionBtn: {
        width: "48%",
        height: 90,
        marginBottom: 16,
        borderRadius: 28,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    optionGradient: {
        flex: 1,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.4)",
        overflow: 'hidden',
        position: 'relative',
    },
    optionInnerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    optionShine: {
        position: 'absolute',
        top: 5,
        left: 5,
        right: 5,
        height: '25%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
    },
    optionText: {
        color: COLORS.textWhite,
        fontSize: 36,
        fontWeight: "900",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        zIndex: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 28,
        paddingLeft: 24,
        elevation: 10,
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.5)",
        overflow: 'hidden',
    },
    inputContainerHard: {
        backgroundColor: "rgba(44,44,84,0.95)",
        borderColor: COLORS.neonPurple,
        borderWidth: 3,
    },
    inputField: {
        flex: 1,
        height: 80,
        fontSize: 36,
        fontWeight: "bold",
    },
    submitBtnWrapper: {
        borderRadius: 28,
    },
    submitGradient: {
        width: 120,
        height: 80,
        borderTopRightRadius: 28,
        borderBottomRightRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        overflow: 'hidden',
        position: 'relative',
    },
    submitInnerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '35%',
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    submitShine: {
        position: 'absolute',
        top: 5,
        left: 5,
        right: 5,
        height: '30%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
    },
    submitText: {
        color: COLORS.textWhite,
        fontWeight: "900",
        fontSize: 28,
        letterSpacing: 2,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        zIndex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCard: {
        width: width * 0.88,
        paddingVertical: 40,
        paddingHorizontal: 32,
        borderRadius: 36,
        alignItems: "center",
        elevation: 20,
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.3)",
    },
    resultIconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "rgba(255,255,255,0.25)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.4)",
    },
    resultIcon: {
        fontSize: 52,
        fontWeight: "900",
        color: COLORS.textWhite,
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: "900",
        color: COLORS.textWhite,
        marginBottom: 8,
        textAlign: "center",
    },
    resultScore: {
        fontSize: 24,
        fontWeight: "800",
        color: COLORS.textWhite,
        marginBottom: 8,
    },
    resultSubText: {
        fontSize: 17,
        color: "rgba(255,255,255,0.95)",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
    modalButtons: {
        width: "100%",
    },
    modalBtnPrimaryWrapper: {
        borderRadius: 32,
        marginBottom: 14,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalBtnPrimary: {
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "rgba(16, 185, 129, 0.3)",
    },
    modalBtnPrimaryInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnPrimaryText: {
        color: COLORS.successStart,
        fontSize: 22,
        fontWeight: "900",
    },
    modalBtnOutline: {
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.8)",
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    modalBtnOutlineInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnOutlineText: {
        color: COLORS.textWhite,
        fontSize: 22,
        fontWeight: "800",
    },
    modalBtnGhost: {
        height: 54,
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 27,
    },
    modalBtnGhostInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnGhostText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 17,
        fontWeight: "700",
    },
});

export default AbacusGameScreen;
