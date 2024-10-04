import { StyleSheet, View } from 'react-native'
import React from 'react'

const Card = (props) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardContainer}>
                {props.children}
            </View>
        </View>
    )
}

export default Card

const styles = StyleSheet.create({
    card: {
        borderRadius: 6,
        elevation: 3,
        backgroundColor: '#FAB647',
        shadowColor: "#567657",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        width: "99%",
    },
    cardContainer: {
        marginHorizontal: 20,
        marginVertical: 10,
        paddingVertical: 8
    },
})