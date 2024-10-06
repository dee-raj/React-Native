import { StyleSheet, View } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types'; // Add this if you're using PropTypes

const Card = ({ children, backgroundColor = '#FAB647' }) => {
    return (
        <View style={[styles.card, { backgroundColor }]}>
            <View style={styles.cardContainer}>
                {children}
            </View>
        </View>
    );
};

// Add PropTypes for better type checking
Card.propTypes = {
    children: PropTypes.node.isRequired,
    backgroundColor: PropTypes.string,
};

export default Card;

const styles = StyleSheet.create({
    card: {
        borderRadius: 6,
        elevation: 3,
        shadowColor: "#567657",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        width: "99%",
    },
    cardContainer: {
        marginHorizontal: 20,
        marginVertical: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
});
