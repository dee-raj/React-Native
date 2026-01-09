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

const { width, height } = Dimensions.get("window");

/* ---------- Background ---------- */
const BackgroundBeads = () => {
    const beads = [
        { top: 50, left: -20, size: 100, color: "#FF9F4333" },
        { top: 200, right: -40, size: 150, color: "#48DBFB33" },
        { bottom: 100, left: 40, size: 80, color: "#1DD1A133" },
        { top: height * 0.4, right: 30, size: 60, color: "#FF6B6B33" },
    ];
    return (
        <View style={StyleSheet.absoluteFill}>
            {beads.map((b, i) => (
                <View
                    key={i}
                    style={{
                        position: "absolute",
                        top: b.top,
                        left: b.left,
                        right: b.right,
                        bottom: b.bottom,
                        width: b.size,
                        height: b.size,
                        borderRadius: b.size / 2,
                        backgroundColor: b.color,
                    }}
                />
            ))}
        </View>
    );
};

/* ---------- Screen ---------- */
const AbacusGameScreen = ({ route, navigation }) => {
    const { level, category } = route.params;
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
            num1 = Math.floor(Math.random() * range) + range / 2;
            num2 = Math.floor(Math.random() * num1) + 1;
            ans = num1 - num2;
            q = `${num1} - ${num2}`;
        } else if (op === "/") {
            num1 = Math.floor(Math.random() * range) + range / 2;
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
            const opts = new Set([ans]);
            const isDivision = op === "/";

            while (opts.size < 4) {
                let fake;

                if (isDivision) {
                    // Generate realistic decimal distractors near the true answer
                    const variation = (Math.random() * 0.4 + 0.1) * (Math.random() < 0.5 ? -1 : 1);
                    fake = parseFloat((ans + variation).toFixed(2));
                } else {
                    // For integer operations: +/- small variation
                    const offset = Math.floor(Math.random() * (range / 2)) - range / 4;
                    fake = Math.max(1, ans + offset);
                }

                // Avoid duplicates or negatives
                if (fake > 0 && fake !== ans) opts.add(fake);
            }

            // Sort & randomize slightly
            setOptions([...opts].sort(() => Math.random() - 0.5));
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

        if (correct) setScore(finalScore);

        // 🔹 Feedback animation ONLY
        feedbackAnim.setValue(0);
        Animated.sequence([
            Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(600),
            Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();

        // 🔹 SINGLE progression point
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
                colors={isHardMode ? ["#0F2027", "#203A43", "#2C5364"] : ["#F8F9FA", "#CFD5DB"]}
                style={{ flex: 1 }}
            >
                {isHardMode ? (
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            { opacity: fadeAnim, backgroundColor: "rgba(106,90,224,0.08)" },
                        ]}
                    >
                        <BackgroundBeads />
                    </Animated.View>
                ) : (
                    <BackgroundBeads />
                )}
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>

                    <View style={[styles.levelBadge, { backgroundColor: isHardMode ? "#6A5AE0" : "#FF9F43" }]}>
                        <Text style={styles.levelBadgeText}>LEVEL {level}</Text>
                    </View>

                    <View style={styles.scoreBox}>
                        <Text style={styles.scoreText}>
                            {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}
                        </Text>
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.progressBarBg}>
                    <View
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
                            isHardMode && {
                                backgroundColor: "#1B1B2F",
                                borderWidth: 2,
                                borderColor: "#6A5AE0",
                                shadowColor: "#6A5AE0",
                                shadowOpacity: 0.4,
                                shadowRadius: 12,
                            },
                            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
                        ]}
                    >
                        <Text style={[styles.questionText, { color: isHardMode ? "#FFFFFF" : "#2D3436" }]}>{question}</Text>
                        <Text style={[styles.equalSign, { color: isHardMode ? "#A29BFE" : "#B2BEC3" }]}>= ?</Text>
                    </Animated.View>

                    <View style={styles.answerArea}>
                        {isMCQMode ? (
                            <View style={styles.mcqGrid}>
                                {options.map((opt, i) => {
                                    const isSelected = selectedOption === opt;
                                    const isCorrect = opt === answer;

                                    let bgColors = ["#48DBFB", "#2E86DE"];

                                    if (showAnswer) {
                                        if (isCorrect) bgColors = ["#1DD1A1", "#10AC84"];       // ✅ green
                                        else if (isSelected) bgColors = ["#FF6B6B", "#EE5253"]; // ❌ red
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            disabled={showAnswer}
                                            style={styles.optionBtn}
                                            onPress={() => handleAnswer(opt)}
                                        >
                                            <LinearGradient colors={bgColors} style={styles.optionGradient}>
                                                <Text style={styles.optionText}>{opt}</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    );
                                })}

                            </View>
                        ) : (
                            <View style={[
                                styles.inputContainer,
                                isHardMode && {
                                    backgroundColor: "#2C2C54",
                                    borderColor: "#6A5AE0",
                                    borderWidth: 1.5,
                                    shadowColor: "#6A5AE0",
                                    shadowOpacity: 0.4,
                                    shadowRadius: 8,
                                },
                            ]}>
                                <TextInput
                                    style={styles.inputField}
                                    value={inputAnswer}
                                    keyboardType="numeric"
                                    onChangeText={setInputAnswer}
                                    onSubmitEditing={() => inputAnswer && handleAnswer(inputAnswer)}
                                />
                                <TouchableOpacity onPress={() => inputAnswer && handleAnswer(inputAnswer)}>
                                    <LinearGradient
                                        colors={isHardMode ? ["#6A5AE0", "#8E78FF"] : ["#FF9F43", "#FF6B6B"]}
                                        style={styles.submitGradient}
                                    >
                                        <Text style={styles.submitText}>GO!</Text>
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
                            colors={score >= PASS_MARK ? ["#1DD1A1", "#10AC84"] : ["#FF6B6B", "#EE5253"]}
                            style={styles.modalCard}
                        >
                            {/* Status Icon */}
                            <View style={styles.resultIconWrap}>
                                <Text style={styles.resultIcon}>
                                    {score >= PASS_MARK ? "✓" : "✕"}
                                </Text>
                            </View>

                            {/* Title */}
                            <Text style={styles.resultTitle}>
                                {score >= PASS_MARK ? "Level Completed!" : "Try Again"}
                            </Text>

                            {/* Score */}
                            <Text style={styles.resultScore}>
                                {score} / {TOTAL_QUESTIONS}
                            </Text>

                            {/* Subtitle */}
                            <Text style={styles.resultSubText}>
                                {score >= PASS_MARK
                                    ? "Great job! You unlocked the next level."
                                    : "Practice makes perfect. Give it another shot."}
                            </Text>

                            {/* Buttons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.modalBtnOutline} onPress={restartLevel}>
                                    <Text style={styles.modalBtnOutlineText}>Replay</Text>
                                </TouchableOpacity>

                                {score >= PASS_MARK && (
                                    <TouchableOpacity style={styles.modalBtnPrimary} onPress={nextLevel}>
                                        <Text style={styles.modalBtnPrimaryText}>Next Level</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={styles.modalBtnGhost} onPress={() => navigation.goBack()}>
                                    <Text style={styles.modalBtnGhostText}>Back to Menu</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                </Modal>

                {showConfetti && (
                    <ConfettiCannon count={120} fadeOut origin={{ x: width / 2, y: 0 }} />
                )}
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        marginTop: -30
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 8,
    },
    backBtn: {
        width: 44,
        height: 44, borderRadius: 22,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4
    },
    backBtnText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333"
    },
    levelBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 4,
    },
    levelBadgeText: {
        color: "#FFF",
        fontWeight: "900",
        fontSize: 16
    },
    progressBarFill: {
        height: "100%",
    },
    scoreBox: {
        backgroundColor: "#FFF",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        elevation: 4
    },
    scoreText: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#6A5AE0"
    },
    progressBarBg: {
        height: 8,
        backgroundColor: "#DEE2E6",
        marginHorizontal: 20,
        borderRadius: 4,
        overflow: "hidden"
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#1DD1A1"
    },
    gameView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20
    },
    questionCard: {
        width: "100%",
        backgroundColor: "#FFF",
        borderRadius: 32,
        padding: 40,
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15
    },
    questionText: {
        fontSize: 48,
        fontWeight: "900",
    },
    equalSign: {
        fontSize: 32,
        fontWeight: "700",
        marginTop: 10,
    },

    answerArea: {
        marginTop: 40,
        width: "100%"
    },
    mcqGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },
    optionBtn: {
        width: "48%",
        height: 80,
        marginBottom: 15,
        borderRadius: 20,
        elevation: 4
    },
    optionGradient: {
        flex: 1,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    optionText: {
        color: "#FFF",
        fontSize: 28,
        fontWeight: "800"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 25,
        paddingLeft: 20,
        elevation: 4
    },
    inputField: {
        flex: 1,
        height: 70,
        fontSize: 32,
        fontWeight: "bold",
        color: "#333"
    },
    submitBtn: {
        width: 100,
        height: 70,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25
    },
    submitGradient: {
        flex: 1,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
        justifyContent: "center",
        alignItems: "center"
    },
    submitText: {
        color: "#FFF",
        fontWeight: "900",
        fontSize: 24
    },
    feedbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
        backgroundColor: "rgba(255,255,255,0.7)"
    },
    feedbackCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10
    },
    feedbackIcon: {
        fontSize: 60,
        color: "#FFF",
        fontWeight: "900"
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalCard: {
        width: width * 0.85,
        paddingVertical: 36,
        paddingHorizontal: 28,
        borderRadius: 32,
        alignItems: "center",
        elevation: 12,
    },

    resultIconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    resultIcon: {
        fontSize: 48,
        fontWeight: "900",
        color: "#FFF",
    },

    resultTitle: {
        fontSize: 30,
        fontWeight: "900",
        color: "#FFF",
        marginBottom: 6,
        textAlign: "center",
    },

    resultScore: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFF",
        marginBottom: 6,
    },

    resultSubText: {
        fontSize: 16,
        color: "rgba(255,255,255,0.9)",
        textAlign: "center",
        marginBottom: 28,
    },

    modalButtons: {
        width: "100%",
    },

    modalBtnPrimary: {
        backgroundColor: "#FFFFFF",
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },

    modalBtnPrimaryText: {
        color: "#10AC84",
        fontSize: 18,
        fontWeight: "900",
    },

    modalBtnOutline: {
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.7)",
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },

    modalBtnOutlineText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
    },

    modalBtnGhost: {
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },

    modalBtnGhostText: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 16,
        fontWeight: "600",
    },

});

export default AbacusGameScreen;
