import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsPage = ({ navigation }) => {
  const [sound, setSound] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <Text style={styles.title}>Settings</Text>

        {/* Card */}
        <View style={styles.card}>

          {/* Section */}
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Setting Item */}
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingSubtitle}>Enable game sounds</Text>
            </View>
            <Switch value={sound} onValueChange={setSound} />
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingSubtitle}>Better for night use</Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Action */}
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingTitle}>Notifications</Text>
            <Text style={styles.arrow}>{'>'}</Text>
          </Pressable>

          <Pressable style={styles.settingRow}>
            <Text style={styles.settingTitle}>About</Text>
            <Text style={styles.arrow}>{'>'}</Text>
          </Pressable>

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
          <Text style={styles.buttonText}>Back</Text>
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
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },

  settingTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },

  settingSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },

  arrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 20,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },

  button: {
    flexDirection: 'row',
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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

export default SettingsPage;
