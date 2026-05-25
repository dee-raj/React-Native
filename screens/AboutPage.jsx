import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Typography, BorderRadius, Shadows } from '../theme/Theme';
import ActionButton from '../shared/ActionButton';
import { shareApp } from '../shared/SharingManager';

const APP_VERSION = '1.2.0';
const BUILD_NUMBER = '4';

const games = [
    'Tic Tac Toe', 'Memory Match', '2048', 'Onet Master',
    'Sliding Puzzle', 'Flow Pipes', 'Abacus Math', 'Sudoku', 'Wordle',
    'Speak & Learn', 'Shape Tap', 'Cryptogram'
];

const libraries = [
    { name: 'React Native', description: 'Mobile framework' },
    { name: 'Expo', description: 'Development platform' },
    { name: 'React Navigation', description: 'Navigation' },
    { name: 'expo-linear-gradient', description: 'Gradients' },
    { name: 'expo-audio', description: 'Sound effects' },
    { name: 'expo-speech', description: 'Text-to-speech' },
    { name: 'AsyncStorage', description: 'Data persistence' },
    { name: 'Confetti Cannon', description: 'Celebrations' },
];

const AboutPage = ({ navigation }) => {
    const { colors, gradients } = useTheme();

    const handleEmail = () => {
        Linking.openURL('mailto:dhurbaraj343sky@gmail.com?subject=GameGroup Feedback');
    };

    const handleGitHub = () => {
        Linking.openURL('https://github.com/dee-raj');
    };

    const handleShare = async () => {
        await shareApp();
    };

    return (
        <LinearGradient
            colors={gradients.background}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.headerSection}>
                    <View style={styles.appIconContainer}>
                        <Ionicons name="game-controller" size={48} color="#FFF" />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>GameGroup</Text>
                    <Text style={[styles.version, { color: colors.textSecondary }]}>
                        Version {APP_VERSION} (Build {BUILD_NUMBER})
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Fun. Smart. Addictive.
                    </Text>
                </View>

                {/* Developer Section */}
                {/* <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>👨‍💻 Developer</Text>

                    <View style={styles.developerInfo}>
                        <View style={styles.developerAvatar}>
                            <Ionicons name="person" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.developerDetails}>
                            <Text style={[styles.developerName, { color: colors.text }]}>
                                Dhurbaraj N. Joshi
                            </Text>
                            <Text style={[styles.developerRole, { color: colors.textSecondary }]}>
                                Full Stack Developer
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.developerBio, { color: colors.textSecondary }]}>
                        Passionate about creating engaging mobile experiences and brain-training games.
                        Building apps that make learning fun!
                    </Text>

                    <View style={styles.socialLinks}>
                        <Pressable
                            style={[styles.socialButton, { backgroundColor: colors.surfaceHigh }]}
                            onPress={handleGitHub}
                        >
                            <Ionicons name="logo-github" size={20} color={colors.text} />
                            <Text style={[styles.socialText, { color: colors.text }]}>@dee-raj</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.socialButton, { backgroundColor: colors.surfaceHigh }]}
                            onPress={handleEmail}
                        >
                            <Ionicons name="mail" size={20} color={colors.text} />
                            <Text style={[styles.socialText, { color: colors.text }]}>Email</Text>
                        </Pressable>
                    </View>
                </View> */}

                {/* Games Section */}
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>🎮 Games ({games.length})</Text>
                    <View style={styles.gamesGrid}>
                        {games.map((game, index) => (
                            <View
                                key={index}
                                style={[styles.gameChip, { backgroundColor: colors.surfaceHigh }]}
                            >
                                <Text style={[styles.gameText, { color: colors.text }]}>{game}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* References Section */}
                {/* <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📚 References</Text>
                    <Text style={[styles.refDescription, { color: colors.textSecondary }]}>
                        Built with these amazing libraries:
                    </Text>
                    {libraries.map((lib, index) => (
                        <View
                            key={index}
                            style={[styles.libItem, { borderBottomColor: colors.border }]}
                        >
                            <Text style={[styles.libName, { color: colors.text }]}>{lib.name}</Text>
                            <Text style={[styles.libDesc, { color: colors.textSecondary }]}>{lib.description}</Text>
                        </View>
                    ))}
                </View> */}

                {/* Share Section */}
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📤 Share App</Text>
                    <Text style={[styles.shareDescription, { color: colors.textSecondary }]}>
                        Share GameGroup with your friends and family!
                    </Text>
                    <ActionButton
                        label="Share GameGroup"
                        onPress={handleShare}
                        variant="primary"
                        icon="share-social"
                        iconPosition="left"
                    />
                </View>

                {/* Footer */}
                <Text style={[styles.footer, { color: colors.textTertiary }]}>
                    Made with ❤️ using React Native + Expo
                </Text>
                <Text style={[styles.copyright, { color: colors.textTertiary }]}>
                    © 2024 Dhurbaraj N. Joshi. All rights reserved.
                </Text>

                {/* Back Button */}
                <View style={styles.buttonContainer}>
                    <ActionButton
                        label="Back to Home"
                        onPress={() => navigation.goBack()}
                        variant="secondary"
                        icon="chevron-back"
                        iconPosition="left"
                    />
                </View>

            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: -32,
    },
    content: {
        padding: Spacing.lg,
        paddingTop: Spacing.huge,
        paddingBottom: Spacing.huge,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    appIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(102, 126, 234, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.sizes.hero,
        fontWeight: Typography.weights.black,
    },
    version: {
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.sizes.md,
        marginTop: Spacing.xs,
    },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.md,
    },
    developerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    developerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    developerDetails: {
        flex: 1,
    },
    developerName: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    developerRole: {
        fontSize: Typography.sizes.sm,
        marginTop: 2,
    },
    developerBio: {
        fontSize: Typography.sizes.md,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    socialLinks: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    socialText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    gamesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    gameChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
    },
    gameText: {
        fontSize: Typography.sizes.sm,
    },
    refDescription: {
        fontSize: Typography.sizes.sm,
        marginBottom: Spacing.md,
    },
    libItem: {
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    libName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    libDesc: {
        fontSize: Typography.sizes.sm,
        marginTop: 2,
    },
    shareDescription: {
        fontSize: Typography.sizes.md,
        marginBottom: Spacing.md,
    },
    footer: {
        textAlign: 'center',
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.lg,
    },
    copyright: {
        textAlign: 'center',
        fontSize: Typography.sizes.xs,
        marginTop: Spacing.xs,
    },
    buttonContainer: {
        marginTop: Spacing.xl,
    },
});

export default AboutPage;