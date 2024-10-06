import { Pressable, Text, View, StyleSheet } from 'react-native';
import React from 'react';
import { globalstyles } from '../style/GlobalStyle';

const SettingsPage = ({ navigation }) => {
  return (
    <View style={[globalstyles.container, { backgroundColor: '#67F349' }]}>
      <View style={styles.header}>
        <Text style={globalstyles.textStyle}>Settings</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>Manage your app settings below:</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={globalstyles.Btn}
          accessibilityLabel="Go back to the home screen"
        >
          <Text style={globalstyles.textStyle}>Go back home</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SettingsPage;
