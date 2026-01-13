import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const LOG_KEY = "@flow_pipes_levels";
const TOTAL_LEVELS = 36;
const LEVELS_PER_PAGE = 12;

const COLORS = {
    // Rich saturated background gradient
    backgroundStart: "#0F2027",
    backgroundMid: "#203A43",
    backgroundEnd: "#2C5364",

    // Modern vibrant panel colors
    panelStart: "#667eea",
    panelEnd: "#764ba2",
    panelBorder: "#9333EA",

    // Vibrant ribbon
    ribbonStart: "#F857A6",
    ribbonEnd: "#FF5858",

    // Level boxes - vibrant gradient
    levelStart: "#FF6B6B",
    levelEnd: "#FF8E53",
    levelBorderActive: "#FFD93D",

    // Locked state - cool purple
    lockedStart: "#667eea",
    lockedEnd: "#764ba2",
    lockedBorder: "#4F46E5",

    // Completed state - emerald green
    completedStart: "#10B981",
    completedEnd: "#059669",
    completedBorder: "#047857",

    // Text and accents
    textWhite: "#FFFFFF",
    textGrey: "#94A3B8",
    starActive: "#FCD34D",
    starInactive: "#64748B",

    // Arrows
    arrowBg: "#F472B6",
    arrowDisabled: "#475569",

    // Dots
    dotActive: "#F472B6",
    dotInactive: "#475569",
};

const FlowLevelSelectionScreen = ({ navigation }) => {
    const [completedLevels, setCompletedLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [page, setPage] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
    const totalPages = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE);

    const pages = [];
    for (let i = 0; i < levels.length; i += LEVELS_PER_PAGE) {
        pages.push(levels.slice(i, i + LEVELS_PER_PAGE));
    }

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedData = await AsyncStorage.getItem(LOG_KEY);
                if (savedData) {
                    const { currentLevel: savedLvl, completed } = JSON.parse(savedData);
                    const lvl = savedLvl || 1;
                    setCurrentLevel(lvl);
                    setCompletedLevels(completed || []);
                    const initialPage = Math.floor((lvl - 1) / LEVELS_PER_PAGE);
                    setPage(initialPage);
                    slideAnim.setValue(-initialPage * (SCREEN_WIDTH * 0.8));
                }
            } catch (e) {
                console.error("Failed to load Flow Pipes progress", e);
            }
        };

        loadProgress();

        const unsubscribe = navigation.addListener("focus", () => {
            loadProgress();
        });

        return unsubscribe;
    }, [navigation, slideAnim]);

    const changePage = (direction) => {
        let newPage = page + direction;
        if (newPage < 0 || newPage >= totalPages) return;

        setPage(newPage);
        Animated.spring(slideAnim, {
            toValue: -newPage * (SCREEN_WIDTH * 0.8),
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    };

    const renderLevelBox = (lvl) => {
        const isCompleted = completedLevels.includes(lvl);
        const isUnlocked = isCompleted || lvl <= currentLevel;
        const isLocked = !isUnlocked;
        const isCurrent = !isCompleted && lvl === currentLevel;

        let gradientColors = [COLORS.levelStart, COLORS.levelEnd];
        let borderColor = COLORS.levelStart;

        if (isCompleted) {
            gradientColors = [COLORS.completedStart, COLORS.completedEnd];
            borderColor = COLORS.completedBorder;
        } else if (isCurrent) {
            gradientColors = [COLORS.levelStart, COLORS.levelEnd];
            borderColor = COLORS.levelBorderActive;
        } else if (isLocked) {
            gradientColors = [COLORS.lockedStart, COLORS.lockedEnd];
            borderColor = COLORS.lockedBorder;
        }

        return (
            <View key={lvl} style={styles.levelWrapper}>
                {!isLocked && (
                    <View style={styles.stars}>
                        {[1, 2, 3].map((s) => (
                            <Text
                                key={s}
                                style={[
                                    styles.star,
                                    isCompleted ? styles.starActive : styles.starInactive,
                                ]}
                            >
                                ★
                            </Text>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    disabled={isLocked}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("FlowGame", { level: lvl })}
                >
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.levelBox,
                            { borderColor: borderColor },
                            isLocked && styles.levelBoxLocked,
                            isCurrent && styles.levelBoxCurrent,
                        ]}
                    >
                        <Text
                            style={[
                                styles.levelText,
                                isLocked && styles.levelTextLocked,
                            ]}
                        >
                            {lvl}
                        </Text>

                        {isLocked && (
                            <View style={styles.lockBadge}>
                                <Text style={styles.lockIcon}>🔒</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <LinearGradient
            colors={[COLORS.backgroundStart, COLORS.backgroundMid, COLORS.backgroundEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <LinearGradient
                colors={[COLORS.ribbonStart, COLORS.ribbonEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ribbon}
            >
                <Text style={styles.ribbonText}>FLOW PIPES LEVELS</Text>
            </LinearGradient>

            <LinearGradient
                colors={[COLORS.panelStart, COLORS.panelEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.panel}
            >
                <TouchableOpacity
                    onPress={() => changePage(-1)}
                    disabled={page === 0}
                    style={[styles.arrow, page === 0 && styles.arrowDisabled]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.arrowText}>◀</Text>
                </TouchableOpacity>

                <View style={styles.gridContainer}>
                    <Animated.View
                        style={[
                            styles.pagesContainer,
                            { transform: [{ translateX: slideAnim }] },
                        ]}
                    >
                        {pages.map((pageLevels, pageIndex) => (
                            <View key={pageIndex} style={styles.page}>
                                {pageLevels.map((lvl) => renderLevelBox(lvl))}
                            </View>
                        ))}
                    </Animated.View>
                </View>

                <TouchableOpacity
                    onPress={() => changePage(1)}
                    disabled={page === totalPages - 1}
                    style={[
                        styles.arrow,
                        page === totalPages - 1 && styles.arrowDisabled,
                    ]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.arrowText}>▶</Text>
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.dots}>
                {Array.from({ length: totalPages }).map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, i === page && styles.dotActive]}
                    />
                ))}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    ribbon: {
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 24,
        marginBottom: -24,
        zIndex: 10,
        elevation: 8,
        shadowColor: "#C7365F",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    ribbonText: {
        color: COLORS.textWhite,
        fontSize: 20,
        fontWeight: "900",
        letterSpacing: 1.5,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    panel: {
        borderWidth: 2,
        borderColor: COLORS.panelBorder,
        borderRadius: 24,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        height: SCREEN_HEIGHT * 0.8,
        shadowColor: COLORS.panelBorder,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    arrow: {
        backgroundColor: COLORS.arrowBg,
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    arrowDisabled: {
        backgroundColor: COLORS.arrowDisabled,
        opacity: 0.5,
    },
    arrowText: {
        color: COLORS.textWhite,
        fontSize: 20,
        fontWeight: "bold",
    },
    gridContainer: {
        width: SCREEN_WIDTH * 0.8,
        overflow: "hidden",
        marginHorizontal: 12,
    },
    pagesContainer: {
        flexDirection: "row",
        width: SCREEN_WIDTH * 0.8 * Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE),
    },
    page: {
        width: SCREEN_WIDTH * 0.8,
        flexDirection: "row",
        paddingVertical: 16,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    levelWrapper: {
        width: (SCREEN_WIDTH * 0.8) / 3 - 16,
        alignItems: "center",
        margin: 8,
    },
    stars: {
        position: "absolute",
        top: 0,
        right: -8,
        flexDirection: "row",
        gap: 2,
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        transform: [{ rotate: "45deg" }],
        zIndex: 2,
    },
    star: {
        fontSize: 16,
        fontWeight: "700",
    },
    starActive: {
        color: COLORS.starActive,
        textShadowColor: "rgba(252, 211, 77, 0.8)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
    starInactive: {
        color: COLORS.starInactive,
    },
    levelBox: {
        width: 68,
        height: 68,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        borderWidth: 3,
    },
    levelBoxCurrent: {
        shadowColor: COLORS.levelBorderActive,
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
    },
    levelBoxLocked: {
        opacity: 0.7,
    },
    levelText: {
        color: COLORS.textWhite,
        fontSize: 24,
        fontWeight: "900",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
    },
    levelTextLocked: {
        color: COLORS.textGrey,
        opacity: 0.6,
    },
    lockBadge: {
        position: "absolute",
        bottom: -8,
        right: -8,
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 14,
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: COLORS.textWhite,
    },
    lockIcon: {
        fontSize: 12,
    },
    dots: {
        flexDirection: "row",
        marginTop: 20,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.dotInactive,
        marginHorizontal: 5,
    },
    dotActive: {
        backgroundColor: COLORS.dotActive,
        width: 32,
        shadowColor: COLORS.dotActive,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 4,
    },
});

export default FlowLevelSelectionScreen;
