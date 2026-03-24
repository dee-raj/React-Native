import { StyleSheet } from 'react-native';

const Colors = {
    primary: '#FACAF7',
    secondary: '#ACFEDB',
    textDark: '#333',
    error: '#fe0134',
    backgroundError: '#ffe6e6',
    shadowColor: '#789134',
};

export const globalstyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.primary,
    },
    textStyle: {
        color: Colors.textDark,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    Btn: {
        backgroundColor: Colors.secondary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 3 },
        shadowColor: Colors.shadowColor,
        shadowOpacity: 0.7,
        shadowRadius: 10,
        marginVertical: 5,
        elevation: 5,
        marginHorizontal: 10,
        paddingHorizontal: 10,
    },
    errorStyle: {
        textAlign: 'center',
        color: Colors.error,
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
        padding: 5,
        backgroundColor: Colors.backgroundError,
        borderRadius: 3,
    },
});
