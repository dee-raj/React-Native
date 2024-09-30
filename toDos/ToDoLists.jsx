import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const ToDoLists = ({ tasks, setTasks }) => {
    const handleCompletion = (id) => {
        setTasks((prevTasks) => {
            return prevTasks.filter(task => task.id != id);
        });
    }
    return (
        <FlatList
            style={styles.listBox}
            keyExtractor={(item) => item.id}
            data={tasks}
            renderItem={({ item }) => (
                <View style={[styles.taskBody, { backgroundColor: item.isRepeat ? '#56f3f9' : 'grey' }]}>
                    <Text
                        style={[styles.textStyle,
                        { color: !item.isRepeat ? '#fefefe' : '#123987' }]}
                    >{item.title}</Text>

                    <Text
                        style={[styles.textStyle,
                        { color: !item.isRepeat ? '#EAADBC' : '#897311', fontSize: 18 }]}
                    >{item.setFor}</Text>

                    <Pressable
                        style={styles.btnStyle}
                        onPress={() => handleCompletion(item.id)}
                    >
                        <Text style={styles.textStyle}>complete</Text>
                    </Pressable>
                </View>
            )}
        // numColumns={2}
        />
    )
}

export default ToDoLists

const styles = StyleSheet.create({
    listBox: {
        backgroundColor: '#b9bc9c',
        paddingVertical: 30,
        paddingHorizontal: 5,
        flexDirection: 'column',
    },
    taskBody: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        textAlign: 'center',
        paddingVertical: 15,
        marginVertical: 20,
        paddingHorizontal: 5,
        borderRadius: 23
    },
    textStyle: {
        fontSize: 24,
        fontWeight: '600',
        color: 'white',
        textTransform: 'capitalize'
    },
    btnStyle: {
        backgroundColor: 'green',
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    }
})