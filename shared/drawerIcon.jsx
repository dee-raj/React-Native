import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Image, Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const DrawerIcon = ({ name, focused }) => (
    <MaterialIcons name={name} color={focused ? '#8970FF' : '#784575'} size={24} />
);

DrawerIcon.propTypes = {
    name: PropTypes.string.isRequired,
    focused: PropTypes.bool.isRequired,
};

export const LogoImage = ({ title_one, title_two }) => (
    <View style={styles.headerStyle}>
        <Text style={styles.titleText}>{title_one}</Text>
        <View style={styles.divider} />
        <Text style={styles.titleText}>{title_two}</Text>
    </View>
);

LogoImage.propTypes = {
    title_one: PropTypes.string.isRequired,
    title_two: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
    headerStyle: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#FABAEA',
        borderRadius: 10,
        paddingHorizontal: 10,
        gap: 10,
    },
    titleText: {
        fontSize: 18,
        fontWeight: '800',
    },
    divider: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#333',
    },
});

export default DrawerIcon;
