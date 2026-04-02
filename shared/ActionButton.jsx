import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ActionButton = ({
    onPress,
    label,
    variant = 'primary',
    size = 'medium',
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    style,
}) => {
    const primaryColors = ['#667eea', '#764ba2'];
    const accentColors = ['#FF6B6B', '#FF8E53'];
    const successColors = ['#10B981', '#059669'];

    const getVariantColors = () => {
        switch (variant) {
            case 'primary': return { gradient: primaryColors, textColor: '#FFFFFF', bgColor: null };
            case 'secondary': return { gradient: null, textColor: '#1F2937', bgColor: '#F0F0F5' };
            case 'accent': return { gradient: accentColors, textColor: '#FFFFFF', bgColor: null };
            case 'success': return { gradient: successColors, textColor: '#FFFFFF', bgColor: null };
            case 'danger': return { gradient: null, textColor: '#FFFFFF', bgColor: '#EF4444' };
            case 'outline': return { gradient: null, textColor: '#667eea', bgColor: 'transparent' };
            default: return { gradient: primaryColors, textColor: '#FFFFFF', bgColor: null };
        }
    };

    const getSizeProps = () => {
        switch (size) {
            case 'small': return { height: 36, padV: 8, padH: 12, fontSize: 14, iconSize: 16 };
            case 'large': return { height: 56, padV: 16, padH: 24, fontSize: 18, iconSize: 24 };
            default: return { height: 48, padV: 12, padH: 20, fontSize: 16, iconSize: 20 };
        }
    };

    const variantColor = getVariantColors();
    const sizeProps = getSizeProps();

    const buttonStyle = [
        styles.button,
        {
            height: sizeProps.height,
            paddingVertical: sizeProps.padV,
            paddingHorizontal: sizeProps.padH,
            borderRadius: 12,
            borderWidth: variant === 'outline' ? 2 : 0,
            opacity: disabled ? 0.5 : 1,
            backgroundColor: variantColor.bgColor,
            borderColor: variantColor.textColor,
        },
        style,
    ];

    const content = loading ? (
        <ActivityIndicator color={variantColor.textColor} size="small" />
    ) : (
        <>
            {icon && iconPosition === 'left' && (
                <Ionicons name={icon} size={sizeProps.iconSize} color={variantColor.textColor} style={{ marginRight: 8 }} />
            )}
            <Text style={{ fontSize: sizeProps.fontSize, fontWeight: 'bold', color: variantColor.textColor }}>
                {label}
            </Text>
            {icon && iconPosition === 'right' && (
                <Ionicons name={icon} size={sizeProps.iconSize} color={variantColor.textColor} style={{ marginLeft: 8 }} />
            )}
        </>
    );

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [buttonStyle, pressed && styles.pressed]}
        >
            {variantColor.gradient && (
                <LinearGradient
                    colors={variantColor.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
            <View style={styles.content}>{content}</View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    pressed: {
        transform: [{ scale: 0.96 }],
        opacity: 0.9,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ActionButton;