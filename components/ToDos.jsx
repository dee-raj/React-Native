import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Header from '../toDos/Header'
import ToDoLists from '../toDos/ToDoLists';
import InputForm from '../toDos/InputForm';

const ToDos = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'take bath', setFor: 'sun', isRepeat: false },
        { id: 2, title: 'study moral book', setFor: 'mon', isRepeat: true },
        { id: 3, title: 'play chess', setFor: 'wed', isRepeat: true },
        { id: 4, title: 'talk with friends', setFor: 'tue', isRepeat: false },
        { id: 5, title: 'plan for earning', setFor: 'sat', isRepeat: true },
        { id: 6, title: 'make new content', setFor: 'fri', isRepeat: true },
        { id: 7, title: 'design a page', setFor: 'thus', isRepeat: false }
    ]);
    return (
        <View style={styles.container}>
            <View style={styles.titleStyle}>
                <Header />
            </View>
            <View style={styles.inputSection}>
                <InputForm setTasks={setTasks} />
            </View>

            <View style={styles.listBody}>
                <ToDoLists tasks={tasks} setTasks={setTasks} />
            </View>
        </View>
    );
}

export default ToDos

const styles = StyleSheet.create({
    container: {
        flex: 2,
        flexDirection: 'column',
        marginVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'pink'
    },
    titleStyle: {
        paddingVertical: 10,
        marginBottom: 10
    },
    listBody: {
        height: '89%',
        paddingVertical: 10
    }
})