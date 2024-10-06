import { Pressable, Text, View, StyleSheet } from 'react-native';
import React from 'react';
import { globalstyles } from '../style/GlobalStyle';

const AboutPage = ({ navigation }) => {
    return (
        <View style={[globalstyles.container, { backgroundColor: '#675A89' }]}>
            <View style={styles.content}>
                <Text style={styles.title}>About This App</Text>
                <Text style={styles.description}>
                    This app helps you manage your tasks efficiently and effectively.
                    Explore its features and get started on organizing your life!
                </Text>
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        color: '#ffffff',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default AboutPage;
