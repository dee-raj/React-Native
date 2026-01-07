import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalstyles } from "../../style/GlobalStyle";

const STORAGE_KEY = "@onet_master_levels";
const TOTAL_LEVELS = 21;

const COLORS = {
    backgroundTop: "#3FC1DA",
    backgroundBottom: "#1E86A6",

    header: "#1A6F8F",
    headerText: "#FFFFFF",

    bubbleOuter: "#7EDCF1",
    bubbleInner: "#3AAFC9",
    bubbleBorder: "#FFFFFF",

    levelText: "#FFFFFF",

    starActive: "#4fff1eff",
    starInactive: "#edfaffff",

    lockBubble: "#2C8FB0",
};

const OnetLevelSelectionScreen = ({ navigation }) => {
    const [completedLevels, setCompletedLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(1);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const { currentLevel, completed } = JSON.parse(saved);
                    setCurrentLevel(currentLevel || 1);
                    setCompletedLevels(completed || []);
                }
            } catch (e) {
                console.log(e);
            }
        };

        const unsub = navigation.addListener("focus", loadProgress);
        return unsub;
    }, [navigation]);

    const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

    const renderItem = ({ item }) => {
        const isCompleted = completedLevels.includes(item);
        const isCurrent = item === currentLevel;
        const isLocked = item > currentLevel && !isCompleted;

        const stars = isCompleted ? 3 : isCurrent ? 1 : 0;

        return (
            <TouchableOpacity
                disabled={isLocked}
                activeOpacity={0.8}
                onPress={() =>
                    navigation.navigate("OnetMaster", { level: item })
                }
            >
                <View
                    style={[
                        styles.bubble,
                        isLocked && styles.lockedBubble,
                    ]}
                >
                    {!isLocked ? (
                        <>
                            <Text style={styles.levelText}>{item}</Text>

                            <View style={styles.stars}>
                                {[1, 2, 3].map((s) => (
                                    <Text
                                        key={s}
                                        style={[
                                            styles.star,
                                            s <= stars
                                                ? styles.starActive
                                                : styles.starInactive,
                                        ]}
                                    >
                                        ★
                                    </Text>
                                ))}
                            </View>
                        </>
                    ) : (
                        <Text style={styles.lockIcon}>🔒</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[globalstyles.container, styles.container]}>
            {/* Fake Gradient */}
            <View style={styles.backgroundBottom} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerArrow}>⭐</Text>
                <Text style={styles.headerTitle}>Onet Master</Text>
                <Text style={styles.headerArrow}>⭐</Text>
            </View>

            <FlatList
                data={levels}
                numColumns={3}
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
        backgroundColor: COLORS.backgroundTop,
        paddingVertical: 0,
    },

    backgroundBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "55%",
        backgroundColor: COLORS.backgroundBottom,
    },

    header: {
        marginHorizontal: 16,
        marginTop: 40,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: COLORS.header,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },

    headerTitle: {
        color: COLORS.headerText,
        fontSize: 20,
        fontWeight: "900",
    },

    headerArrow: {
        color: "#BDEEFF",
        fontSize: 22,
    },

    grid: {
        paddingTop: 30,
        alignItems: "center",
        paddingBottom: 40,
    },

    bubble: {
        width: 74,
        height: 74,
        borderRadius: 37,
        margin: 14,
        backgroundColor: COLORS.bubbleInner,
        borderWidth: 3,
        borderColor: COLORS.bubbleBorder,
        justifyContent: "center",
        alignItems: "center",
    },

    lockedBubble: {
        backgroundColor: COLORS.lockBubble,
    },

    levelText: {
        fontSize: 26,
        fontWeight: "900",
        color: COLORS.levelText,
    },

    stars: {
        flexDirection: "row",
        position: "absolute",
        bottom: -10,
    },

    star: {
        fontSize: 28,
        marginHorizontal: 1,
    },

    starActive: {
        color: COLORS.starActive,
    },

    starInactive: {
        color: COLORS.starInactive,
    },

    lockIcon: {
        fontSize: 24,
        color: "#FFFFFF",
    },
});

export default OnetLevelSelectionScreen;
