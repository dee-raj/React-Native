import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, LightTheme } from './Theme';

const THEME_STORAGE_KEY = '@game_group_theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (saved !== null) {
                setIsDark(saved === 'dark');
            }
        } catch (error) {
            console.log('Failed to load theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = useCallback(async () => {
        try {
            const newTheme = !isDark;
            setIsDark(newTheme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
        } catch (error) {
            console.log('Failed to save theme:', error);
        }
    }, [isDark]);

    const setTheme = useCallback(async (dark) => {
        try {
            setIsDark(dark);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
        } catch (error) {
            console.log('Failed to save theme:', error);
        }
    }, []);

    const theme = isDark ? DarkTheme : LightTheme;

    const value = {
        isDark,
        isLoading,
        theme,
        toggleTheme,
        setTheme,
        colors: theme.colors,
        gradients: theme.gradients,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;