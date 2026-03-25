import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalstyles } from "../../style/GlobalStyle";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const LOG_KEY = "@sliding_puzzle_levels";
const TOTAL_LEVELS = 20;

const COLORS = {
    bgTop: "#6E8E2E",
    bgBottom: "#9DBE3B",

    tileUnlocked: "#FFF7C2",
    tileUnlockedBorder: "#E5C94A",

    tileLocked: "#CFCFCF",
    tileLockedBorder: "#A9A9A9",

    number: "#2E2E2E",

    star: "#FFD21E",
    starShadow: "#C9A000",

    lock: "#6F6F6F",
};

const SlidingPuzzleLevelSelectionScreen = ({ navigation }) => {
    const [completedLevels, setCompletedLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(1);

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
                console.error("Failed to load Sliding Puzzle progress", e);
            }
        };

        const unsubscribe = navigation.addListener("focus", loadProgress);
        return unsubscribe;
    }, [navigation]);

    const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

    const renderItem = ({ item }) => {
        const isCompleted = completedLevels.includes(item);
        const isCurrent = item === currentLevel;
        const isUnlocked = isCompleted || isCurrent;

        const stars = isCompleted ? 3 : isCurrent ? 1 : 0;

        return (
            <TouchableOpacity
                disabled={!isUnlocked}
                onPress={() => navigation.navigate("SlidingPuzzle", { level: item })}
                activeOpacity={0.8}
            >
                <View
                    style={[
                        styles.tile,
                        isUnlocked ? styles.unlockedTile : styles.lockedTile,
                    ]}
                >
                    {isUnlocked ? (
                        <>
                            <Text style={styles.levelText}>{item}</Text>
                            {stars > 0 && (
                                <View style={styles.stars}>
                                    {[1, 2, 3].map((s) => (
                                        <Text
                                            key={s}
                                            style={[
                                                styles.star,
                                                s <= stars ? styles.starActive : styles.starInactive,
                                            ]}
                                        >
                                            ★
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </>
                    ) : (
                        <Text style={styles.lock}>🔒</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[globalstyles.container, styles.container]}>
            {/* Background pseudo-gradient */}
            <View style={styles.bgTop} />
            <View style={styles.bgBottom} />

            <View style={styles.backBtnContainer}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
                <Text style={styles.backBtn}> Back</Text>
            </View>

            <View style={styles.header}>
                {/* Header */}
                <Text style={styles.headerTitle}>Sliding Puzzle Levels</Text>
                <Text style={styles.headerInfo}>Highest: {currentLevel}</Text>
            </View>

            <FlatList
                data={levels}
                numColumns={4}
                keyExtractor={(item) => item.toString()}
                contentContainerStyle={styles.grid}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },

    bgTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "50%",
        backgroundColor: COLORS.bgTop,
    },

    bgBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "50%",
        backgroundColor: COLORS.bgBottom,
    },

    backBtnContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 40,
        marginHorizontal: 16,
        marginBottom: 16,
    },

    backBtn: {
        fontSize: 16,
        color: "white",
    },

    header: {
        marginHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: COLORS.tileUnlockedBorder,
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.number,
    },

    headerInfo: {
        fontSize: 16,
        color: COLORS.number,
        marginTop: 4,
    },

    grid: {
        alignItems: "center",
        paddingVertical: 30,
        paddingBottom: 40,
    },

    tile: {
        width: 64,
        height: 64,
        borderRadius: 12,
        margin: 10,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
    },

    unlockedTile: {
        backgroundColor: COLORS.tileUnlocked,
        borderWidth: 3,
        borderColor: COLORS.tileUnlockedBorder,
    },

    lockedTile: {
        backgroundColor: COLORS.tileLocked,
        borderWidth: 3,
        borderColor: COLORS.tileLockedBorder,
    },

    levelText: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.number,
    },

    stars: {
        flexDirection: "row",
        position: "absolute",
        bottom: -10,
    },

    star: {
        fontSize: 26,
        marginHorizontal: 1,
        textShadowColor: COLORS.starShadow,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },

    starActive: {
        color: COLORS.star,
    },

    starInactive: {
        color: "#E5E5E5",
    },

    lock: {
        fontSize: 24,
        color: COLORS.lock,
    },
});

export default SlidingPuzzleLevelSelectionScreen;
