import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Typography, Shadows, BorderRadius } from '../theme/Theme';

const GameHeader = ({ 
    title, 
    onBack, 
    rightComponent, 
    showBack = true,
    subtitle,
    backgroundColor,
}) => {
    const { colors, gradients } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={styles.header}>
                {showBack ? (
                    <Pressable 
                        onPress={onBack} 
                        style={({ pressed }) => [
                            styles.backBtn,
                            pressed && styles.backBtnPressed,
                        ]}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                            style={styles.backBtnGradient}
                        >
                            <Ionicons name="arrow-back" size={22} color={colors.text} />
                        </LinearGradient>
                    </Pressable>
                ) : (
                    <View style={styles.placeholder} />
                )}

                <View style={styles.titleContainer}>
                    <Text 
                        style={[styles.title, { color: colors.text }]} 
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {rightComponent || <View style={styles.placeholder} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    backBtnPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
    backBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 22,
    },
    placeholder: {
        width: 44,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
    },
    title: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.black,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.sizes.xs,
        marginTop: 2,
    },
});

export default GameHeader;