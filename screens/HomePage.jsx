import { Pressable, Text, View } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { globalstyles } from '../style/GlobalStyle'



const HomePage = ({ navigation }) => {
    const pressHandler = () => {
        navigation?.navigate('Review');
        // navigation?.push('Review');

        console.log(`navigation to Review - details`)
    }
    return (
        <View style={globalstyles.container}>
            <StatusBar backgroundColor='#54FA98' style='inverted' />
            <Text style={globalstyles.textStyle}>Home Page</Text>
            <Pressable style={globalstyles.Btn} onPress={pressHandler}>
                <Text style={globalstyles.textStyle}>To Review Screen</Text>
            </Pressable>
        </View>
    )
}

export default HomePage;

