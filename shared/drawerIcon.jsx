import React from 'react';
import { MaterialIcons } from '@expo/vector-icons'
import { Image, Text, View } from 'react-native';
import { MyImages } from '../style/GlobalStyle';
import { StyleSheet } from 'react-native';

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
})