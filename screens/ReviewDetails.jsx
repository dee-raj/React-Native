import { Text, View, StyleSheet, ScrollView } from 'react-native';
import React from 'react';

const ReviewDetails = ({ route }) => {
    const { review, title, rating, reviewer, date } = route.params || {};

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title || 'N/A'}</Text>
                <Text style={styles.rating}>Rating: {rating ? `${rating}/10` : 'N/A'}</Text>
                <Text style={styles.reviewer}>Reviewed by: {reviewer || 'N/A'}</Text>
                <Text style={styles.date}>Date: {date || 'N/A'}</Text>
            </View>

            <View style={styles.reviewContainer}>
                <Text style={styles.reviewLabel}>Review:</Text>
                <Text style={styles.reviewText}>{review || 'N/A'}</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Thank you for reading!</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#FA6890',
    },
    header: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2, // Shadow effect
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    rating: {
        fontSize: 18,
        color: '#FFD700', // Gold color for rating
    },
    reviewer: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#888', // Gray color for date
        marginBottom: 12,
    },
    reviewContainer: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        elevation: 2,
    },
    reviewLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    reviewText: {
        fontSize: 16,
        lineHeight: 22,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#555',
    },
});

export default ReviewDetails;
