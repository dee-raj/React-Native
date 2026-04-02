export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
};

export const Typography = {
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 28,
        display: 32,
        hero: 42,
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
    },
};

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    lg: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },
    glow: (color) => ({
        shadowColor: color,
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    }),
};

export const DarkTheme = {
    isDark: true,
    colors: {
        background: '#0f0f23',
        surface: '#1a1a2e',
        surfaceHigh: '#16213e',
        surfaceElevated: '#0f3460',
        primary: '#667eea',
        primaryLight: '#764ba2',
        secondary: '#764ba2',
        accent: '#FF6B6B',
        accentSecondary: '#FF8E53',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        text: '#FFFFFF',
        textSecondary: 'rgba(255,255,255,0.7)',
        textTertiary: 'rgba(255,255,255,0.5)',
        border: 'rgba(255,255,255,0.1)',
        borderLight: 'rgba(255,255,255,0.15)',
        card: '#1a1a2e',
        cardBorder: '#16213e',
        overlay: 'rgba(0,0,0,0.75)',
        inputBg: 'rgba(255,255,255,0.08)',
        switchTrack: 'rgba(255,255,255,0.3)',
        switchThumb: '#FFFFFF',
    },
    gradients: {
        background: ['#1a1a2e', '#16213e', '#0f3460'],
        primary: ['#667eea', '#764ba2'],
        accent: ['#FF6B6B', '#FF8E53'],
        success: ['#10B981', '#059669'],
        surface: ['#1a1a2e', '#16213e'],
    },
};

export const LightTheme = {
    isDark: false,
    colors: {
        background: '#F8F9FA',
        surface: '#FFFFFF',
        surfaceHigh: '#F0F0F5',
        surfaceElevated: '#E8E8F0',
        primary: '#667eea',
        primaryLight: '#764ba2',
        secondary: '#764ba2',
        accent: '#FF6B6B',
        accentSecondary: '#FF8E53',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        text: '#1F2937',
        textSecondary: 'rgba(31,41,55,0.7)',
        textTertiary: 'rgba(31,41,55,0.5)',
        border: 'rgba(0,0,0,0.08)',
        borderLight: 'rgba(0,0,0,0.12)',
        card: '#FFFFFF',
        cardBorder: '#E5E7EB',
        overlay: 'rgba(0,0,0,0.5)',
        inputBg: 'rgba(0,0,0,0.04)',
        switchTrack: 'rgba(0,0,0,0.3)',
        switchThumb: '#FFFFFF',
    },
    gradients: {
        background: ['#F8F9FA', '#FFFFFF'],
        primary: ['#667eea', '#764ba2'],
        accent: ['#FF6B6B', '#FF8E53'],
        success: ['#10B981', '#059669'],
        surface: ['#FFFFFF', '#F8F9FA'],
    },
};

export default {
    Spacing,
    BorderRadius,
    Typography,
    Shadows,
    DarkTheme,
    LightTheme,
};