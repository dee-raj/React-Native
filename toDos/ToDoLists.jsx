import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'

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
                <View style={[styles.taskBody, {
                    backgroundColor: item.isRepeat ? '#56f3f9' : 'grey',
                }]}>
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
                        <View style={styles.item}>
                            <MaterialIcons name='delete' size={24} color={'#911'} />
                            <Text style={styles.itemStyleText}>done</Text>
                        </View>
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
        paddingVertical: 10,
        paddingHorizontal: 5,
        flexDirection: 'column',
    },
    taskBody: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
        paddingVertical: 15,
        marginVertical: 20,
        paddingHorizontal: 5,
        borderRadius: 10
    },
    textStyle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        textTransform: 'capitalize'
    },
    btnStyle: {
        backgroundColor: 'green',
        padding: 5,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    item: {
        flex: 1,
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemStyleText: {
        paddingLeft: 10,
        fontSize: 16,
        color: '#FFABAB'
    }
})