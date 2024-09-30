import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

const FlatLists = () => {
    const [Persons, setPersons] = useState([
        { SN: '0', F_name: 'Raju', L_name: 'Jha', age: 24 },
        { SN: '1', F_name: 'Ram', L_name: 'Kumar', age: 45 },
        { SN: '2', F_name: 'Dev', L_name: 'Mishra', age: 35 },
        { SN: '3', F_name: 'Manshi', L_name: 'Yadav', age: 64 },
        { SN: '4', F_name: 'Diksha', L_name: 'Chaudhary', age: 25 },
        { SN: '5', F_name: 'Vishal', L_name: 'Panday', age: 76 },
        { SN: '6', F_name: 'Rishi', L_name: 'Joshi', age: 23 },
        { SN: '7', F_name: 'Yash', L_name: 'Patil', age: 14 },
        { SN: '8', F_name: 'Paresh', L_name: 'Rao', age: 18 },
        { SN: '9', F_name: 'Sapana', L_name: 'Devi', age: 44 },
        { SN: '10', F_name: 'Shusma', L_name: 'Sharma', age: 69 },
        { SN: '11', F_name: 'Deepa', L_name: 'Kapoor', age: 73 },
        { SN: '12', F_name: 'Anita', L_name: 'Malla', age: 52 }
    ]);

    const HideHandle = (id) => {
        console.log(`You Hide: ${id}`);
        setPersons((prevPersons) => {
            return prevPersons.filter(person => person.SN != id);
        })
    };

    return (
        <View style={styles.box}>
            <View style={[styles.personStyle, { marginBottom: 10, padding: 0 }]}>
                <Text style={[styles.details, { color: 'green', fontSize: 18 }]}>First Name</Text>
                <Text style={[styles.details, { color: 'green', fontSize: 18 }]}>Last Name</Text>
                <Text style={[styles.details, { color: 'green', fontSize: 18 }]}>Age</Text>
                <Text style={[styles.details, { color: 'green', fontSize: 18 }]}>BTN</Text>
            </View>
            <FlatList
                keyExtractor={(item) => item.SN}
                data={Persons}
                renderItem={({ item }) => {
                    return (
                        <View style={styles.personStyle}>
                            <Text style={styles.details}>{item.F_name}</Text>
                            <Text style={styles.details}>{item.L_name}</Text>
                            <Text style={styles.details}>{item.age}</Text>
                            <TouchableOpacity onPress={() => HideHandle(item.SN)} style={styles.btn}>
                                <Text style={styles.details}>Hide</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }}
            // numColumns={2}
            />
        </View>
    )
}

export default FlatLists

const styles = StyleSheet.create({
    box: {
        flexDirection: 'column',
        marginVertical: 20,
        marginHorizontal: 10,
        backgroundColor: '#fcafca',
        height: '100%',
        padding: 10,
        borderRadius: 10,
        justifyContent: 'space-evenly',
    },
    personStyle: {
        padding: 10,
        marginBottom: 30,
        backgroundColor: '#fa9212',
        flexDirection: 'row',
        borderRadius: 15,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    details: {
        padding: 5,
        fontSize: 24,
        fontWeight: '500',
        color: '#fff'
    },
    btn: {
        borderWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'lightgrey',
        borderRadius: 15,
        alignItems: 'center',
        paddingHorizontal: 10
    }
})