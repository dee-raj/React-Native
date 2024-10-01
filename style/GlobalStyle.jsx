import { StyleSheet } from 'react-native';

export const globalstyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 50,
        backgroundColor: '#56CAF7'
    },
    textStyle: {
        color: '#fff', // Text color
        fontSize: 16, // Text size
        textAlign: 'center', // Center text
        fontWeight: 'bold', // Bold text
    },
    Btn: {
        backgroundColor: '#54FA98', // Button background color
        borderRadius: 10, // Rounded corners
        padding: 15, // Padding inside the button
        marginVertical: 10, // Space between buttons
        elevation: 3, // Shadow effect on Android
        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowOpacity: 0.2, // Shadow opacity for iOS
        shadowRadius: 2, // Shadow radius for iOS
    },
});

