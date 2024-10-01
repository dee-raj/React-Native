import { Pressable, Text, View } from 'react-native';
import React from 'react';
import { globalstyles } from '../style/GlobalStyle';

const ReviewDetails = ({ navigation }) => {
    const pressHandler = () => {
        navigation?.navigate('Home');
        // navigation?.pop();
        // navigation.goBack();

        console.log(`navigation back to Home`)
    }
    return (
        <View style={[globalstyles.container, { backgroundColor: '#FA6890' }]}>
            <Text style={globalstyles.textStyle}>Review Details</Text>
            <Pressable style={globalstyles.Btn} onPress={pressHandler}>
                <Text style={globalstyles.textStyle}>Go Back</Text>
            </Pressable>
        </View>
    )
}

export default ReviewDetails
