import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import soundManager from '../shared/SoundManager';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Typography, BorderRadius } from '../theme/Theme';

const SETTINGS_KEY = '@game_group_settings';

const SettingsPage = ({ navigation }) => {
  const { colors, gradients, toggleTheme, isDark } = useTheme();
  const [sound, setSound] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(SETTINGS_KEY);
        if (saved) {
          const settings = JSON.parse(saved);
          setSound(settings.sound ?? true);
        }
      } catch (e) {
        console.log('Failed to load settings', e);
      }
    };
    loadSettings();
  }, []);

  const saveSetting = async (key, value) => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = saved ? JSON.parse(saved) : {};
      settings[key] = value;
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.log('Failed to save setting', e);
    }
  };

  const handleSoundToggle = (value) => {
    setSound(value);
    soundManager.setEnabled(value);
    saveSetting('sound', value);
  };

  const handleDarkModeToggle = (value) => {
    toggleTheme();
    saveSetting('darkMode', value);
  };

  return (
    <LinearGradient
      colors={gradients.background}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>

          {/* Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>

          {/* Setting Item */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Sound Effects</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Enable game sounds</Text>
            </View>
            <Switch
              value={sound}
              onValueChange={handleSoundToggle}
              trackColor={{ false: colors.switchTrack, true: colors.primary }}
              thumbColor={colors.switchThumb}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {isDark ? 'Currently dark theme' : 'Currently light theme'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.switchTrack, true: colors.primary }}
              thumbColor={colors.switchThumb}
            />
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Action */}
          <Pressable style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.arrow, { color: colors.textSecondary }]}>{'>'}</Text>
          </Pressable>

          <Pressable style={[styles.settingRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('About')}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.arrow, { color: colors.textSecondary }]}>{'>'}</Text>
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
    marginTop: -32,
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
