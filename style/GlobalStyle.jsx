import { StyleSheet } from 'react-native';

export const globalstyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FACAF7',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    },
    textStyle: {
        color: '#333',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    Btn: {
        backgroundColor: '#ACFEDB',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 3 },
        shadowColor: "#789134",
        shadowOpacity: 0.7,
        shadowRadius: 10,
        marginVertical: 5,
        elevation: 5,
        marginHorizontal: 10,
        paddingHorizontal: 10
    },
});


export const MyImages = {
    ratings: {
        '1': require('../assets/rate1.png'),
        '2': require('../assets/rate2.png'),
        '3': require('../assets/rate3.png'),
        '4': require('../assets/rate4.png'),
        '5': require('../assets/rate5.png')
    },
    heart: require('../assets/heart.png'),
};