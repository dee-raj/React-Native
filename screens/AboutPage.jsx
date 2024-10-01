import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { globalstyles } from '../style/GlobalStyle'

const AboutPage = () => {
    return (
        <View style={[globalstyles.container, { backgroundColor: '#67FA89' }]}>
            <Text style={globalstyles.textStyle}>About Page</Text>
        </View>
    )
}

export default AboutPage
