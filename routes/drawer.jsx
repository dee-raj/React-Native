import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import AboutPage from '../screens/AboutPage';
import SettingsPage from '../screens/SettingsPage';
import DailyChallengeScreen from '../screens/DailyChallengeScreen';
import GameStack from './gameStack';
import { getFocusedRouteNameFromRoute, NavigationContainer } from '@react-navigation/native';
import { Text, View, StyleSheet } from 'react-native';
import { LogoImage } from '../shared/drawerIcon';
import DrawerIcon from '../shared/drawerIcon';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Typography, BorderRadius } from '../theme/Theme';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
    const { colors, gradients } = useTheme();

    return (
        <LinearGradient
            colors={gradients.background}
            style={styles.drawerContent}
        >
            <View style={styles.drawerHeaderContainer}>
                <Text style={[styles.drawerHeader, { color: colors.text }]}>Games Hub</Text>
                <Text style={[styles.drawerSubheader, { color: colors.textSecondary }]}>
                    Your daily entertainment
                </Text>
            </View>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.drawerScrollContent}
            >
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.drawerFooterText, { color: colors.textTertiary }]}>
                    v1.2.0
                </Text>
            </View>
        </LinearGradient>
    );
}

function RootDrawerNavigation() {
    const { colors, gradients } = useTheme();

    return (
        <NavigationContainer>
            <Drawer.Navigator
                drawerContent={props => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.surface,
                    },
                    headerTintColor: colors.text,
                    headerTitleStyle: {
                        fontWeight: Typography.weights.bold,
                    },
                    drawerStyle: {
                        backgroundColor: colors.surface,
                        width: 280,
                    },
                    drawerLabelStyle: {
                        fontSize: Typography.sizes.md,
                        color: colors.textSecondary,
                        fontWeight: Typography.weights.medium,
                    },
                    drawerActiveTintColor: colors.primary,
                    drawerInactiveTintColor: colors.textSecondary,
                    headerTitleAlign: 'center',
                    drawerActiveBackgroundColor: `${colors.primary}15`,
                }}
            >
                <Drawer.Screen
                    name="Games"
                    component={GameStack}
                    options={({ route }) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? 'GamesHome';

                        return {
                            drawerIcon: ({ focused }) => (
                                <DrawerIcon
                                    name={focused ? 'videogame-asset' : 'videogame-asset-off'}
                                    focused={focused}
                                />
                            ),
                            headerShown: true,
                            headerTitle: () => (
                                <LogoImage title_two={'Hub'} title_one={'Games'} />
                            ),
                        };
                    }}
                />
                <Drawer.Screen
                    name="About"
                    component={AboutPage}
                    options={{
                        drawerIcon: ({ focused }) =>
                            <DrawerIcon name={focused ? 'query-builder' : 'info-outline'} focused={focused} />,
                        headerTitle: () => <LogoImage title_one={'About'} title_two={'Games'} />,
                    }}
                />
                <Drawer.Screen
                    name="Settings"
                    component={SettingsPage}
                    options={{
                        drawerIcon: ({ focused }) =>
                            <DrawerIcon name={focused ? 'settings-suggest' : 'settings-applications'} focused={focused} />,
                        headerTitle: () => <LogoImage title_two={'Settings'} title_one={'Games'} />,
                    }}
                />
                <Drawer.Screen
                    name="DailyChallenge"
                    component={DailyChallengeScreen}
                    options={{
                        drawerIcon: ({ focused }) =>
                            <DrawerIcon name={focused ? 'calendar-today' : 'calendar-month'} focused={focused} />,
                        headerTitle: () => <LogoImage title_two={'Challenge'} title_one={'Daily'} />,
                        headerShown: false,
                    }}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
        paddingTop: Spacing.xxxl,
    },
    drawerScrollContent: {
        paddingTop: Spacing.md,
    },
    drawerHeaderContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    drawerHeader: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.black,
    },
    drawerSubheader: {
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.xs,
    },
    drawerFooter: {
        padding: Spacing.lg,
        borderTopWidth: 1,
    },
    drawerFooterText: {
        fontSize: Typography.sizes.xs,
        textAlign: 'center',
    },
});

export default RootDrawerNavigation;
