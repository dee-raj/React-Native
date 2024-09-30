import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { Picker } from 'react-native-web';


const InputForm = ({ setTasks }) => {
    const [title, setTitle] = useState('');
    const [selectedValue, setSelectedValue] = useState('sun');
    const days = ['sun', 'mon', 'tue', 'wed', 'thus', 'fri', 'sat'];
    const [isRept, setIsRept] = useState(false);

    const handleAddTasks = () => {
        if (title.length > 3) {
            const newTask = { id: Math.random() * 10, title: title, setFor: selectedValue, isRepeat: isRept };
            setTasks((prevTasks) => {
                return [newTask, ...prevTasks];
            });
            console.log(`Your new Task:`, newTask);
        } else {
            Alert.alert("Kay Bolya bhai..?", "The task should be at least 3 char long.", [
                { text: 'Ok', onPress: () => console.log('alert closed.') }
            ]);
        }
        setTitle('');
        setSelectedValue('sun');
        setIsRept(false);
    }

    const TextComp = ({ title, color, fw }) => (
        <Text
            style={[styles.textStyle,
            { fontWeight: fw, color: color }]}
        >{title}</Text>
    );

    return (
        <View style={styles.formBox}>
            <TextInput
                multiline
                value={title}
                onChangeText={(text) => setTitle(text)}
                style={[styles.inputBox, { width: '45%' }]}
            />
            <Picker
                style={[styles.inputBox, { textTransform: 'capitalize' }]}
                selectedValue={selectedValue}
                onValueChange={(val) => setSelectedValue(val)}>
                {days.map((d) => (
                    <Picker.Item label={d} value={d} key={d} />
                ))}
            </Picker>
            <Pressable style={styles.btn} onPress={() => setIsRept(!isRept)}>
                {isRept ? <TextComp title={'Repeat'} color={'pink'} fw={'700'} /> : <TextComp title={'Repeat'} fw={'400'} />}
            </Pressable>
            <Pressable style={styles.btn} onPress={handleAddTasks}>
                <TextComp title={'Add Task'} />
            </Pressable>
        </View>
    )
}

export default InputForm;

const styles = StyleSheet.create({
    formBox: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#986989',
        paddingVertical: 20,
        borderRadius: 10,
        flexWrap: 'wrap'
    },
    inputBox: {
        borderWidth: 1,
        borderColor: 'coral',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: '#867586',
        color: '#fdefde',
        fontSize: 24,
        cursor:'pointer'
    },
    btn: {
        marginTop: 10,
        borderWidth: 1,
        backgroundColor: '#759749',
        padding: 5,
        borderRadius: 10
    },
    textStyle: {
        fontSize: 24,
        fontStyle: 'italic',
        fontWeight: '500',
        textTransform: 'capitalize',
    }
})