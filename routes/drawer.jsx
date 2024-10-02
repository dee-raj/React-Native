import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList
} from '@react-navigation/drawer';
import AboutPage from '../screens/AboutPage';
import SettingsPage from '../screens/SettingsPage';
import AppNavigator from './homeStack';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View, StyleSheet } from 'react-native';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
    return (
        <View style={styles.drawerContent}>
            <Text style={styles.drawerHeader}>Review Game Group</Text>
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
        </View>
    );
}

function RootDrawerNavigation() {
    return (
        <NavigationContainer>
            <Drawer.Navigator
                drawerContent={props => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: true,
                    drawerStyle: {
                        backgroundColor: '#f6f6f6',
                        width: 240,
                    },
                    drawerLabelStyle: {
                        fontSize: 16,
                        color: '#911',
                        fontWeight: '600',
                        fontFamily: 'nanito-Black'
                    },
                    drawerActiveTintColor: '#007bff',
                    drawerInactiveTintColor: '#666',
                }}
            >
                <Drawer.Screen
                    name="Root Home"
                    component={AppNavigator}
                    options={{ headerShown: true }}
                />
                <Drawer.Screen
                    name="About"
                    component={AboutPage}
                    options={{ headerShown: false }}
                />
                <Drawer.Screen
                    name="Settings"
                    component={SettingsPage}
                    options={{ headerShown: true }}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
        padding: 16,
        backgroundColor: '#EFCDEF',
    },
    drawerHeader: {
        fontSize: 24,
        marginBottom: 20,
        color: '#333',
        fontFamily: 'nanito-Medium'
    },
});

export default RootDrawerNavigation;
