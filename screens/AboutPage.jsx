import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, StyleSheet, ScrollView } from 'react-native';

const games = [
    'Tic Tac Toe', 'Memory Game', '2048', 'Onet Master',
    'Sliding Puzzle', 'Flow Pipes', 'Abacus Math',
    'Speak & Learn', 'Shape Tap', 'Sudoku', 'Cryptogram'
];

const AboutPage = ({ navigation }) => {
    return (
        <LinearGradient
            colors={['#0f2027', '#203a43', '#2c5364']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <Text style={styles.title}>Game Hub</Text>
                <Text style={styles.subtitle}>
                    Fun. Smart. Addictive.
                </Text>

                {/* Glass Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🎮 About</Text>
                    <Text style={styles.description}>
                        Explore a collection of fun and brain-boosting games designed to challenge your skills and keep you entertained.
                    </Text>

                    <Text style={styles.sectionTitle}>✨ Games</Text>

                    {/* Games Grid */}
                    <View style={styles.gamesGrid}>
                        {games.map((game, index) => (
                            <View key={index} style={styles.gameChip}>
                                <Text style={styles.gameText}>{game}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.footerText}>
                        Play, learn, and enjoy a smarter way to have fun.
                    </Text>
                </View>

                {/* Button */}
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                    <Text style={styles.buttonText}>Back to Home</Text>
                </Pressable>

            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },

    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },

    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 25,
    },

    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 30,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 10,
        marginTop: 10,
    },

    description: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 20,
        marginBottom: 10,
    },

    gamesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },

    gameChip: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },

    gameText: {
        color: '#fff',
        fontSize: 13,
    },

    footerText: {
        marginTop: 10,
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
    },

    button: {
        backgroundColor: '#6C63FF',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },

    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.97 }],
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AboutPage;
