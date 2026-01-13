import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import React, { useContext } from 'react';
import { globalstyles } from '../style/GlobalStyle';
import Card from '../shared/Card';
import { ReviewsContext } from '../shared/ReviewsData';
import { FabToggleBtn, ToggleBtn } from '../shared/drawerIcon';
import ModelScreen from './ModelScreen';

const HomePage = ({ navigation }) => {
    const { reviews } = useContext(ReviewsContext);

    const renderItem = ({ item }) => (
        <Pressable
            style={({ pressed }) => [
                styles.cardWrapper,
                pressed && styles.pressed,
            ]}
            onPress={() =>
                navigation.navigate('Review', {
                    review: item.review,
                    title: item.title,
                    rating: item.rating,
                    reviewer: item.reviewer,
                    date: item.date,
                })
            }
            accessibilityLabel={`View details for ${item.title}`}
        >
            <View style={styles.reviewCard}>
                <View style={styles.row}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>

                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>{item.rating}/10</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>👤 {item.reviewer}</Text>
                    {item.date && <Text style={styles.metaText}>📅 {item.date}</Text>}
                </View>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        No reviews yet. Add your first one ✨
                    </Text>
                }
            />

            <ModelScreen />
            <FabToggleBtn />
        </View>
    );
};

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 24,
        paddingVertical: 12
    },

    listContent: {
        paddingTop: 12,
        paddingBottom: 12,
    },

    cardWrapper: {
        marginBottom: 12,
    },

    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },

    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
        flex: 1,
        marginRight: 8,
    },

    ratingBadge: {
        backgroundColor: '#4F46E5',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    ratingText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    metaText: {
        fontSize: 12,
        color: '#64748B',
    },

    pressed: {
        opacity: 0.6,
    },

    fabContainer: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 10,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 60,
        color: '#64748B',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        zIndex: 20,
    },

    fabPressed: {
        transform: [{ scale: 0.95 }],
    },

    fabIcon: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 34,
    },

});

export default HomePage;
