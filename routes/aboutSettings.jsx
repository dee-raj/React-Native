import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../screens/HomePage';
import AboutPage from '../screens/AboutPage';
import SettingsPage from '../screens/SettingsPage';

const Stack = createStackNavigator();

const AboutSettings = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#546A98',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontFamily: 'nunito-Bold'
                },
                headerTitleAlign: 'center',
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomePage}
                options={{ title: 'Review Group' }}
            />
            <Stack.Screen
                name="About"
                component={AboutPage}
                options={{ title: 'About Page' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsPage}
                options={{ title: 'Settings Page' }}
            />
        </Stack.Navigator>
    );
};

export default AboutSettings;
