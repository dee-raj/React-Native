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
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const STORAGE_KEY = "@memory_game_progress";
const TOTAL_LEVELS = 21;

const LevelSelectionScreen = ({ navigation }) => {
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
                console.log("Failed to load progress", e);
            }
        };

        const unsubscribe = navigation.addListener("focus", loadProgress);
        return unsubscribe;
    }, [navigation]);

    // Create levels dynamically
    const LEVELS = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
        const id = i + 1;
        const unlocked = id <= currentLevel;
        const completed = completedLevels.includes(id);

        return {
            id,
            unlocked,
            stars: completed ? 3 : unlocked ? 1 : 0, // ⭐ easy to expand later
        };
    });

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                disabled={!item.unlocked}
                style={[
                    styles.levelBox,
                    !item.unlocked && styles.lockedBox,
                ]}
                onPress={() =>
                    navigation.navigate("MemoryGame", {
                        level: item.id,
                        fromSelection: true,
                    })
                }
                activeOpacity={0.85}
            >
                <Text style={styles.levelText}>{item.id}</Text>

                {/* Stars */}
                {item.unlocked && (
                    <View style={styles.starRow}>
                        {[1, 2, 3].map((star) => (
                            <Text
                                key={star}
                                style={[
                                    styles.star,
                                    star <= item.stars
                                        ? styles.starActive
                                        : styles.starInactive,
                                ]}
                            >
                                ★
                            </Text>
                        ))}
                    </View>
                )}

                {!item.unlocked && <Text style={styles.lockIcon}>🔒</Text>}
            </TouchableOpacity >
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.title}>Memory Game Levels</Text>
                <View style={{ width: 44 }} />
            </View>

            <Text style={styles.subtitle}>
                Highest Level: {currentLevel}
            </Text>

            <FlatList
                data={LEVELS}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                contentContainerStyle={styles.grid}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1b4db1",
        marginTop: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        marginBottom: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 12,
        letterSpacing: 1,
    },
    subtitle: {
        color: "#cfd8ff",
        textAlign: "center",
        marginBottom: 20,
        fontSize: 14,
    },
    grid: {
        alignItems: "center",
        paddingBottom: 40,
    },
    levelBox: {
        backgroundColor: "#ff6a00",
        width: SCREEN_WIDTH / 3.6,
        height: SCREEN_WIDTH / 3.6,
        margin: 12,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
    },
    lockedBox: {
        backgroundColor: "#999",
        opacity: 0.7,
    },
    levelText: {
        fontSize: 30,
        color: "#fff",
        fontWeight: "900",
    },
    starRow: {
        flexDirection: "row",
        marginTop: 6,
    },
    star: {
        fontSize: 16,
        marginHorizontal: 1,
    },
    starActive: {
        color: "#ffd700",
    },
    starInactive: {
        color: "#ccc",
    },
    lockIcon: {
        position: "absolute",
        bottom: 6,
        fontSize: 18,
    },
});


export default LevelSelectionScreen;
