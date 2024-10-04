import React, { useContext } from 'react';
import { MaterialIcons } from '@expo/vector-icons'
import { Image, Pressable, Text, View } from 'react-native';
import { MyImages } from '../style/GlobalStyle';
import { StyleSheet } from 'react-native';
import { ModelContext } from '../shared/ReviewsData';

const DrawerIcon = ({ name, focused }) => {
    return (
        <MaterialIcons name={name} color={focused ? '#8970FF' : "#784575"} size={24} />
    )
}

export default DrawerIcon


export const LogoImage = ({ title_one, title_two }) => {
    return (
        <View style={styles.headerStyle}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>{title_one}</Text>
            <Image
                source={MyImages.heart}
                style={styles.imgStyle}
            />
            <Text style={{ fontSize: 18, fontWeight: '800' }}>{title_two}</Text>
        </View>
    )
}


export const ToggleBtn = ({ name, text }) => {
    const { modelOpen, setModelOpen } = useContext(ModelContext);
    return (
        <Pressable
            style={styles.openBtn}
            onPress={() => setModelOpen(!modelOpen)}
        >
            <Text style={styles.textStyle}>{text}</Text>
            <MaterialIcons name={name} size={24} color={'#898565'} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    headerStyle: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: "#FABAEA",
        borderRadius: 10,
        paddingHorizontal: 10,
        gap: 10
    },
    imgStyle: {
        opacity: 0.4,
        borderRadius: 20
    }
    ,
    openBtn: {
        backgroundColor: '#ACFEDB',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 3 },
        shadowColor: "#789134",
        shadowOpacity: 0.7,
        shadowRadius: 10,
        marginVertical: 5,
        elevation: 5,
        width: '100%'
    },
    textStyle: {
        fontWeight: '700',
        fontStyle: 'italic',
        fontSize: 24,
        color: '#967474',
    }
})