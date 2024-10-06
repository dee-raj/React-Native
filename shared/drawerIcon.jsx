import React, { useContext } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View, StyleSheet } from 'react-native';
import { MyImages } from '../style/GlobalStyle';
import PropTypes from 'prop-types';
import { ModelContext } from '../shared/ReviewsData';

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
        <Image
            source={MyImages.heart}
            style={styles.imgStyle}
        />
        <Text style={styles.titleText}>{title_two}</Text>
    </View>
);

LogoImage.propTypes = {
    title_one: PropTypes.string.isRequired,
    title_two: PropTypes.string.isRequired,
};

export const ToggleBtn = ({ name, text }) => {
    const { modelOpen, setModelOpen } = useContext(ModelContext);
    return (
        <Pressable
            style={styles.openBtn}
            onPress={() => setModelOpen(!modelOpen)}
            accessibilityLabel="Toggle review model"
        >
            <Text style={styles.textStyle}>{text}</Text>
            <MaterialIcons name={name} size={24} color="#898565" />
        </Pressable>
    );
};

ToggleBtn.propTypes = {
    name: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
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
    imgStyle: {
        opacity: 0.4,
        borderRadius: 20,
        width: 30,
        height: 30,
    },
    openBtn: {
        backgroundColor: '#ACFEDB',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 3 },
        shadowColor: '#789134',
        shadowOpacity: 0.7,
        shadowRadius: 10,
        marginVertical: 5,
        elevation: 5,
        width: '100%',
    },
    textStyle: {
        fontWeight: '700',
        fontStyle: 'italic',
        fontSize: 24,
        color: '#967474',
    },
});

export default DrawerIcon;
