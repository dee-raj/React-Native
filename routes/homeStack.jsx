import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../screens/HomePage';
import ReviewDetails from '../screens/ReviewDetails';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#546A98',
                },
                headerTintColor: '#FABFAB',
                headerTitleStyle: {
                    fontWeight: '700',
                    fontFamily: 'nunito-Bold',
                },
                headerTitleAlign: 'center',
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomePage}
                options={{ title: 'Review Group', headerShown: false }}
            />
            <Stack.Screen
                name="Review"
                component={ReviewDetails}
                options={{ title: 'Review Details' }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
