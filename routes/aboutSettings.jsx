import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have @expo/vector-icons installed
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
                    fontFamily: 'Roboto',
                },
                headerTitleAlign: 'center',
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomePage}
                options={({ navigation }) => ({
                    title: 'Review Group',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            style={{ marginRight: 15 }}
                        >
                            <Ionicons name="settings-outline" size={24} color="white" />
                        </TouchableOpacity>
                    ),
                })}
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
