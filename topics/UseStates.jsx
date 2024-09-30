import React, { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
const UseStates = () => {
    const [topic, setTopic] = useState('states');
    const [isOk, setIsOk] = useState(false);

    return (
        <>
            <View style={styles.topicBox}>
                <View style={styles.topicStyle}>
                    <Text style={styles.topicHeader}>Today's Topic : {topic}</Text>
                    <Pressable
                        style={styles.nextBtn}
                        onPress={() => setTopic('user input')}
                    ><Text>next Topic</Text>
                    </Pressable>
                </View>
                <View style={styles.topicStyle}>
                    {isOk ?
                        < Text style={styles.topicHeader}>OK</Text> :
                        <Text style={styles.topicHeader}>Not OK</Text>
                    }
                    <Pressable
                        style={styles.nextBtn}
                        onPress={() => setIsOk(!isOk)}
                    ><Text>toggle</Text>
                    </Pressable>
                </View>
            </View >
        </>
    )
}

export default UseStates

const styles = StyleSheet.create({
    topicBox: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    topicStyle: {
        gap: 15,
        padding: 90,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#48ac67',
    },
    topicHeader: {
        fontSize: 24,
        color: '#f0fa00',
        fontWeight: '600',
    },
    nextBtn: {
        padding: 10,
        fontSize: 24,
        borderWidth: 3,
        borderRadius: 10,
        fontWeight: '600',
        backgroundColor: '#0F0',
        borderBlockColor: '#00F',
    }
})