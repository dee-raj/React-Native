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
        else if (rating <= 2) return MyImages.ratings[1];
        else if (rating <= 4) return MyImages.ratings[2];
        else if (rating <= 6) return MyImages.ratings[3];
        else if (rating <= 8) return MyImages.ratings[4];
        else return MyImages.ratings[5];
    };

    if (!title || !review) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Review details are not available.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.ratingBox}>
                        <Text style={styles.rating}>Rating: {rating ? `${rating}/10` : 'N/A'}</Text>
                        <Image
                            source={getImg(Math.round(rating))}
                            style={styles.ratingImage}
                            accessible={true}
                            accessibilityLabel={`Rating image for ${rating} out of 10`}
                        />
                    </View>
                    <Text style={styles.reviewer}>Reviewed by: {reviewer}</Text>
                    <Text style={styles.date}>Date: {date}</Text>
                </View>

                <View style={styles.reviewContainer}>
                    <Text style={styles.reviewLabel}>Review:</Text>
                    <Text style={styles.reviewText}>{review}</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for reading!</Text>
                </View>
            </Card>
        </ScrollView>
    );
};

export default ReviewDetails;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#BAAACA',
    },
    header: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    rating: {
        fontSize: 18,
        color: '#FFD700',
        marginRight: 8,
    },
    ratingImage: {
        width: 95,
        height: 35,
        resizeMode: 'contain',
    },
    reviewer: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#555',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginBottom: 12,
    },
    reviewContainer: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        marginBottom: 16,
    },
    reviewLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    reviewText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#333',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#FFF',
        borderRadius: 8,
        elevation: 1,
    },
    footerText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#555',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});
