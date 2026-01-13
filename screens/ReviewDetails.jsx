import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    Image,
} from 'react-native';
import React from 'react';
import Card from '../shared/Card';
import { MyImages } from '../style/GlobalStyle';

const ReviewDetails = ({ route }) => {
    const { review, title, rating, reviewer, date } = route.params || {};

    const getImg = (rating) => {
        if (rating < 1 || rating > 10) return MyImages.heart;
        if (rating <= 2) return MyImages.ratings[1];
        if (rating <= 4) return MyImages.ratings[2];
        if (rating <= 6) return MyImages.ratings[3];
        if (rating <= 8) return MyImages.ratings[4];
        return MyImages.ratings[5];
    };

    if (!title || !review) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Review details are not available.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* ---------- Header Card ---------- */}
            <View style={styles.headerCard}>
                <Text style={styles.title}>{title}</Text>

                <View style={styles.ratingRow}>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>
                            {rating ? `${rating}/10` : 'N/A'}
                        </Text>
                    </View>

                    <Image
                        source={getImg(Math.round(rating))}
                        style={styles.ratingImage}
                        accessibilityLabel={`Rating image for ${rating} out of 10`}
                    />
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>👤 {reviewer}</Text>
                    {date && <Text style={styles.metaText}>📅 {date}</Text>}
                </View>
            </View>

            {/* ---------- Review Card ---------- */}
            <View style={styles.reviewCard}>
                <Text style={styles.sectionTitle}>Review</Text>
                <Text style={styles.reviewText}>{review}</Text>
            </View>

            {/* ---------- Footer ---------- */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Thanks for reading ✨</Text>
            </View>
        </ScrollView>
    );
};

export default ReviewDetails;

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F1F5F9',
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Header */
    headerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    ratingBadge: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    ratingText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },

    ratingImage: {
        width: 90,
        height: 36,
        resizeMode: 'contain',
    },

    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },

    metaText: {
        fontSize: 13,
        color: '#475569',
    },

    /* Review */
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1E293B',
    },

    reviewText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#334155',
    },

    /* Footer */
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },

    footerText: {
        fontSize: 13,
        color: '#64748B',
        fontStyle: 'italic',
    },

    errorText: {
        fontSize: 16,
        color: '#DC2626',
    },
});
