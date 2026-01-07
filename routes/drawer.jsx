import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import AboutPage from '../screens/AboutPage';
import SettingsPage from '../screens/SettingsPage';
import AppNavigator from './homeStack';
import GameStack from './gameStack';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View, StyleSheet } from 'react-native';
import { LogoImage } from '../shared/drawerIcon';
import DrawerIcon from '../shared/drawerIcon';

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
                        backgroundColor: '#787878',
                        width: 240,
                        marginTop: 20,
                    },
                    drawerLabelStyle: {
                        fontSize: 16,
                        color: '#911',
                        fontWeight: '600',
                    },
                    drawerActiveTintColor: '#007bff',
                    drawerInactiveTintColor: '#FA7800',
                    headerTitleAlign: 'center',
                }}
            >
                <Drawer.Screen
                    name="Root Home"
                    component={AppNavigator}
                    options={{
                        drawerIcon: ({ focused }) =>
                            <DrawerIcon name={focused ? 'home' : 'maps-home-work'} focused={focused} />,
                        headerTitle: () => <LogoImage title_two={'Home'} title_one={'Root'} />,
                    }}
                />
                <Drawer.Screen
                    name="Games"
                    component={GameStack}
                    options={{
                        drawerIcon: ({ focused }) =>
                            <DrawerIcon name={focused ? 'videogame-asset' : 'videogame-asset-off'} focused={focused} />,
                        headerTitle: () => <LogoImage title_two={'Hub'} title_one={'Games'} />,
                    }}
                />
                <Drawer.Screen
                    name="About"
                    component={AboutPage}
                    options={{
                        drawerIcon: ({ focused }) =>
                            <DrawerIcon name={focused ? 'query-builder' : 'info-outline'} focused={focused} />,
                        headerTitle: () => <LogoImage title_one={'About'} title_two={'Review'} />,
                    }}
                />
                <Drawer.Screen
                    name="Settings"
                    component={SettingsPage}
                    options={{
                        drawerIcon: ({ focused }) =>
                            <DrawerIcon name={focused ? 'settings-suggest' : 'settings-applications'} focused={focused} />,
                        headerTitle: () => <LogoImage title_two={'Settings'} title_one={'Review'} />,
                    }}
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
        fontFamily: 'Roboto',
    },
});

export default RootDrawerNavigation;
