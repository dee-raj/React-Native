import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'

const UserInputs = () => {
    const [name, setName] = useState('nothing');
    const [num, setNum] = useState(0);

    const resetHandler = () => {
        setName('nothing');
        setNum(0);
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.field}>
                    <Text style={styles.output}>You typed:<Text style={{ color: '#0F0' }}> {name}</Text></Text>
                    <TextInput
                        multiline={true}
                        placeholder={`eg. Dee`}
                        style={styles.inputStyle}
                        onChangeText={(text) => setName(text)}
                    />
                </View>
                <View style={styles.field}>
                    <Text style={styles.output}>You typed: <Text style={{ color: '#0F0' }}>{num}</Text></Text>
                    <TextInput
                        keyboardType='numeric'
                        placeholder={`eg. 99`}
                        style={styles.inputStyle}
                        onChangeText={(text) => setNum(text)}
                    />
                </View>
            </View>
            <Pressable
                style={styles.btn}
                onPress={resetHandler}
            >
                <Text>Reset</Text>
            </Pressable>
        </>
    )
}

export default UserInputs

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#894890',
        alignItems: 'flex-start',
    },
    field: {
        flexDirection: 'column',
        width: '45%',
        backgroundColor: '#bf9ac0',
        padding: 20,
        margin: 10
    },
    output: {
        fontSize: 22,
        fontWeight: '500',
        paddingVertical: 8,
        borderColor: '#a35',
        borderBottomWidth: 2
    },
    inputStyle: {
        marginVertical: 20,
        backgroundColor: '#999',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f89',
        paddingVertical: 20,
        paddingHorizontal: 10
    },
    btn: {
        position: 'relative',
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#7c3',
        borderRadius: 10,
        borderColor: '#05FF78',
        borderWidth: 1,
        textAlign: 'center'
    }
})