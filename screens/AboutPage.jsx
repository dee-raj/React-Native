import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, StyleSheet, ScrollView } from 'react-native';

const AboutPage = ({ navigation }) => {
    return (
        <LinearGradient colors={['#6C63FF', '#8360c3', '#a29bfe']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>🎮 Welcome to Game Hub!</Text>

                <View style={styles.card}>
                    <Text style={styles.description}>
                        Dive into a world of fun and learning! Our app brings you exciting, kid-friendly games:
                    </Text>
                    <View style={styles.gamesList}>
                        {[
                            'Tic Tac Toe',
                            'Memory Game',
                            '2048',
                            'Onet Master',
                            'Sliding Puzzle',
                            'Flow Pipes',
                            'Abacus Math',
                            'Speak & Learn',
                            'Shape Tap',
                            'Sudoku',
                        ].map((game, index) => (
                            <Text key={index} style={styles.gameItem}>• {game}</Text>
                        ))}
                    </View>
                    <Text style={styles.description}>
                        Sharpen your mind, challenge your friends, and enjoy hours of safe, educational fun!
                    </Text>
                </View>

                <Pressable
                    onPress={() => navigation.goBack()}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    accessibilityLabel="Go back to the home screen"
                >
                    <Text style={styles.buttonText}>🏠 Go Back Home</Text>
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
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: 25,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 6,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 30,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    description: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 10,
    },
    gamesList: {
        marginVertical: 10,
    },
    gameItem: {
        fontSize: 17,
        color: '#FFD700',
        marginVertical: 2,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    button: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 16,
        paddingHorizontal: 50,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonPressed: {
        backgroundColor: '#FF5252',
        transform: [{ scale: 0.97 }],
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default AboutPage;
