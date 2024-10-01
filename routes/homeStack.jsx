import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../screens/HomePage'; // Ensure correct import
import ReviewDetails from '../screens/ReviewDetails'; // Ensure correct spelling

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#546A98', // Header background color
                    },
                    headerTintColor: '#fff', // Header text color
                    headerTitleStyle: {
                        fontWeight: 'bold', // Header title style
                        fontFamily: 'nunito-Bold'
                    },
                    headerTitleAlign: 'center', // Center the title
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomePage}
                    options={{ title: 'Review Group' }} // Title for the Home screen
                />
                <Stack.Screen
                    name="Review"
                    component={ReviewDetails}
                    options={{ title: 'Review Details' }} // Title for the Review screen
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
