import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width } = Dimensions.get("window");
const TOTAL_LEVELS = 21;

const AbacusLevelSelectionScreen = ({ route, navigation }) => {
    const { category } = route.params || {};
    if (!category) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: '#fff' }}>Missing category data.</Text>
            </SafeAreaView>
        );
    }
    const { id: categoryId, name: categoryName, colors } = category;

    const STORAGE_KEY = `@abacus_math_${categoryId}_progress`;

    const [currentLevel, setCurrentLevel] = useState(1);
    const [completedLevels, setCompletedLevels] = useState([]);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const { currentLevel: savedLvl, completed } = JSON.parse(saved);
                    setCurrentLevel(savedLvl || 1);
                    setCompletedLevels(completed || []);
                } else {
                    setCurrentLevel(1);
                    setCompletedLevels([]);
                }
            } catch (e) {
                console.log("Failed to load abacus progress", e);
            }
        };

        const unsubscribe = navigation.addListener("focus", loadProgress);
        return unsubscribe;
    }, [navigation, STORAGE_KEY]);

    const renderLevelItem = ({ item: lvl }) => {
        const isCompleted = completedLevels.includes(lvl);
        const isUnlocked = lvl <= currentLevel;
        const stars = isCompleted ? 3 : 0;

        return (
            <TouchableOpacity
                disabled={!isUnlocked}
                activeOpacity={0.85}
                onPress={() =>
                    navigation.navigate("AbacusGame", {
                        category,
                        level: lvl,
                    })
                }
            >
                <LinearGradient
                    colors={isUnlocked ? colors : ["#BDC3C7", "#95A5A6"]}
                    style={[styles.levelCard, !isUnlocked && styles.lockedCard]}
                >
                    <Text style={styles.levelText}>{lvl}</Text>

                    {isUnlocked ? (
                        <View style={styles.starRow}>
                            {[1, 2, 3].map((s) => (
                                <Ionicons
                                    key={s}
                                    name={s <= stars ? "star" : "star-outline"}
                                    size={14}
                                    color={s <= stars ? "#FFD700" : "rgba(255,255,255,0.4)"}
                                    style={{ marginHorizontal: 1 }}
                                />
                            ))}
                        </View>
                    ) : (
                        <Ionicons name="lock-closed" size={18} color="#FFF" />
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={category.colors} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <Text style={styles.title}>{categoryName.toUpperCase()}</Text>

                    <View style={styles.statsPanel}>
                        <Text style={styles.statsText}>
                            Progress: {currentLevel}/{TOTAL_LEVELS}
                        </Text>
                    </View>
                </View>

                <FlatList
                    key="abacus-levels-3-col" // ✅ avoids numColumns error
                    data={Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1)}
                    renderItem={renderLevelItem}
                    keyExtractor={(item) => item.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, marginTop: -30 },

    header: {
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 32,
    },

    backBtn: {
        position: "absolute",
        left: 10,
        top: 0,
        padding: 10,
    },


    title: {
        fontSize: 32,
        fontWeight: "900",
        color: "#FFF",
        letterSpacing: 2,
    },

    statsPanel: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 10,
    },

    statsText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
    },

    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 40,
        alignItems: "center",
    },

    levelCard: {
        width: width / 3.8,
        height: width / 3.8,
        margin: 10,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
    },

    lockedCard: {
        opacity: 0.7,
    },

    levelText: {
        fontSize: 32,
        fontWeight: "900",
        color: "#FFF",
    },

    starRow: {
        flexDirection: "row",
        marginTop: 6,
    },
});


export default AbacusLevelSelectionScreen;
