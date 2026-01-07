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

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const LOG_KEY = "@flow_pipes_levels";
const TOTAL_LEVELS = 21;
const LEVELS_PER_PAGE = 12; // 3 per row, 4 rows per page

const COLORS = {
    background: "#EAF4FA",
    panelBlue: "#3FA9F5",
    panelBorder: "#1C75BC",
    ribbonRed: "#E53935",
    ribbonShadow: "#B71C1C",
    levelRed: "#E53935",
    levelRedDark: "#C62828",
    textWhite: "#FFFFFF",
    starActive: "#FFD21E",
    starInactive: "#CFCFCF",
    lock: "#FFFFFF",
    arrowRed: "#E53935",
    dotActive: "#E53935",
    dotInactive: "#BDBDBD",
};

const FlowLevelSelectionScreen = ({ navigation }) => {
    const [completedLevels, setCompletedLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [page, setPage] = useState(0);

    const slideAnim = useRef(new Animated.Value(0)).current;

    const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
    const totalPages = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedData = await AsyncStorage.getItem(LOG_KEY);
                if (savedData) {
                    const { currentLevel: savedLvl, completed } = JSON.parse(savedData);
                    setCurrentLevel(savedLvl || 1);
                    setCompletedLevels(completed || []);
                }
            } catch (e) {
                console.error("Failed to load Flow Pipes progress", e);
            }
        };

        const unsubscribe = navigation.addListener("focus", () => {
            loadProgress();
        });

        return unsubscribe;
    }, [navigation]);

    const changePage = (direction) => {
        let newPage = page + direction;
        if (newPage < 0 || newPage >= totalPages) return;

        setPage(newPage);
        Animated.spring(slideAnim, {
            toValue: -newPage * (SCREEN_WIDTH * 0.8),
            useNativeDriver: true,
        }).start();
    };

    const renderLevelBox = (lvl) => {
        const isCompleted = completedLevels.includes(lvl);
        const isCurrent = lvl === currentLevel;
        const isLocked = lvl > currentLevel && !isCompleted;

        return (
            <View key={lvl} style={styles.levelWrapper}>
                {/* Stars */}
                <View style={styles.stars}>
                    {[1, 2, 3].map((s) => (
                        <Text
                            key={s}
                            style={[
                                styles.star,
                                s <= (isCompleted ? 3 : 0)
                                    ? styles.starActive
                                    : styles.starInactive,
                            ]}
                        >
                            ★
                        </Text>
                    ))}
                </View>

                <TouchableOpacity
                    disabled={isLocked}
                    style={[
                        styles.levelBox,
                        isLocked ? styles.lockedBox : styles.unlockedBox,
                    ]}
                    onPress={() => navigation.navigate("FlowGame", { level: lvl })}
                >
                    {isLocked ? <Text style={styles.lock}>🔒</Text> : <Text style={styles.levelText}>{lvl}</Text>}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Ribbon */}
            <View style={styles.ribbon}>
                <Text style={styles.ribbonText}>FLOW PIPES LEVELS</Text>
            </View>

            {/* Panel */}
            <View style={styles.panel}>
                {/* Left Arrow */}
                <TouchableOpacity style={styles.arrow} onPress={() => changePage(-1)}>
                    <Text style={styles.arrowText}>◀</Text>
                </TouchableOpacity>

                {/* Animated Levels Grid */}
                <View style={styles.gridContainer}>
                    <Animated.View
                        style={[
                            styles.grid,
                            { transform: [{ translateX: slideAnim }] },
                        ]}
                    >
                        {levels.map((lvl) => renderLevelBox(lvl))}
                    </Animated.View>
                </View>

                {/* Right Arrow */}
                <TouchableOpacity style={styles.arrow} onPress={() => changePage(1)}>
                    <Text style={styles.arrowText}>▶</Text>
                </TouchableOpacity>
            </View>

            {/* Pagination Dots */}
            <View style={styles.dots}>
                {Array.from({ length: totalPages }).map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, i === page ? styles.dotActive : null]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
    },

    ribbon: {
        backgroundColor: COLORS.ribbonRed,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: -20,
        zIndex: 10,
        elevation: 6,
    },

    ribbonText: {
        color: COLORS.textWhite,
        fontSize: 18,
        fontWeight: "bold",
    },

    panel: {
        backgroundColor: COLORS.panelBlue,
        borderWidth: 4,
        borderColor: COLORS.panelBorder,
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        height: SCREEN_HEIGHT * 0.8, // 80% height
    },

    arrow: {
        backgroundColor: COLORS.arrowRed,
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    arrowText: {
        color: COLORS.textWhite,
        fontSize: 18,
        fontWeight: "bold",
    },

    gridContainer: {
        width: SCREEN_WIDTH * 0.8,
        overflow: "hidden",
        marginHorizontal: 10,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: SCREEN_WIDTH * 0.8 * Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE),
    },

    levelWrapper: {
        width: (SCREEN_WIDTH * 0.8) / 3 - 16, // 3 per row
        alignItems: "center",
        margin: 8,
    },

    stars: {
        flexDirection: "row",
        marginBottom: 4,
    },

    star: {
        fontSize: 26,
        marginHorizontal: 1,
    },

    starActive: {
        color: COLORS.starActive,
    },

    starInactive: {
        color: COLORS.starInactive,
    },

    levelBox: {
        width: 60, // larger button
        height: 60,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },

    unlockedBox: {
        backgroundColor: COLORS.levelRed,
    },

    lockedBox: {
        backgroundColor: COLORS.levelRedDark,
    },

    levelText: {
        color: COLORS.textWhite,
        fontSize: 20,
        fontWeight: "bold",
    },

    lock: {
        fontSize: 20,
        color: COLORS.lock,
    },

    dots: {
        flexDirection: "row",
        marginTop: 14,
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.dotInactive,
        marginHorizontal: 4,
    },

    dotActive: {
        backgroundColor: COLORS.dotActive,
    },
});

export default FlowLevelSelectionScreen;
