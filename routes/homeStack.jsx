import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../screens/HomePage'; // Ensure correct import
import ReviewDetails from '../screens/ReviewDetails'; // Ensure correct spelling

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomePage} />
                <Stack.Screen name="Review" component={ReviewDetails} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
