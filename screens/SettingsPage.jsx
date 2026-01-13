import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, StyleSheet, ScrollView } from 'react-native';

const SettingsPage = ({ navigation }) => {
  return (
    <LinearGradient colors={['#67F349', '#3BBF6B', '#2A9D8F']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>
            Manage your app settings below. Customize your experience and make Game Hub truly yours!
          </Text>

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
        </View>
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
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    borderRadius: 20,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  description: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 25,
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

export default SettingsPage;
