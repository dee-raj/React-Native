import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import UseStates from '../topics/UseStates';
import UserInputs from '../topics/UserInputs';
import ListsScrollView from '../topics/ListsScrollView';
import FlatLists from '../topics/FlatLists';


const Basics = () => {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#9ac'} />
            <View style={styles.header}>
                <Text style={styles.boldText}>Hey; There!</Text>
            </View>
            {/* <UseStates /> */}
            {/* <UserInputs /> */}
            {/* <ListsScrollView /> */}
            <FlatLists />
        </View>
    )
}

export default Basics

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#dee',
        justifyContent: 'flex-start',
        gap: 5,
        marginBottom: 110
    },
    header: {
        backgroundColor: 'pink',
        alignItems: 'center',
        padding: 20,
    },
    boldText: {
        fontSize: 24,
        fontWeight: '600',
    },
})