import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ABACUS_CATEGORIES } from './AbacusConfig';
import { FontAwesome6 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons/build/Icons';

const AbacusCategoryScreen = ({ navigation }) => {
    const renderCategory = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.cardWrapper}
            onPress={() =>
                navigation.navigate('AbacusLevelSelection', {
                    category: item, // pass full category object
                })
            }
        >
            <LinearGradient
                colors={item.colors}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <FontAwesome6
                    name={item.icon}
                    size={46}
                    color="#FFFFFF"
                    style={styles.icon}
                />
                <Text style={styles.name}>{item.name}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#F3F0FF', '#E5E0FF']} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color="#6A5AE0"
                        />
                    </TouchableOpacity>

                    <Text style={styles.title}>Pick a Challenge</Text>
                </View>

                <FlatList
                    key="abacus-category-1-col"
                    data={ABACUS_CATEGORIES}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCategory}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },

    container: {
        flex: 1,
        padding: 10,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 20,
        marginTop: -20
    },

    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        elevation: 4,
    },

    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#2D3436',
    },

    list: {
        paddingBottom: 40,
    },

    cardWrapper: {
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },

    card: {
        height: 120,
        borderRadius: 24,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 30,
    },

    icon: {
        marginRight: 20,
    },

    name: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFF',
    },
});

export default AbacusCategoryScreen;
