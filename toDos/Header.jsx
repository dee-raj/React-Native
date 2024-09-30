import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Header = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.textStyle}>Hey;   There!</Text>
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    container: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#bba',
        paddingVertical: 10,
        borderRadius: 10
    },
    textStyle: {
        fontSize: 28,
        color: '#fff',
        fontWeight: '700',
    }
})