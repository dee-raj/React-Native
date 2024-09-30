import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const ListsScrollView = () => {
    const books = [
        { bookName: 'Data Science', code: 601 },
        { bookName: 'Cloud Computing', code: 602 },
        { bookName: 'Wireless Sensor Network', code: 603 },
        { bookName: 'Ethical Hacking', code: 604 },
        { bookName: 'Project Management', code: 615 },
        { bookName: 'Web Services', code: 631 },
        { bookName: 'Artificial Intelligence', code: 535 },
        { bookName: 'Software Testing', code: 536 },
        { bookName: 'Quality Assurance', code: 589 },
        { bookName: 'Internet Services', code: 590 },
        { bookName: 'Machine Learning', code: 517 }
    ];
    return (
        // <View style={styles.box}>
        //     {books.map((book) => {
        //         return (
        //             <View style={styles.book}>
        //                 <Text style={styles.bookInfo}>Name: {book.bookName}</Text>
        //                 <Text style={styles.bookInfo}>Code: {book.code}</Text>
        //             </View>
        //         );
        //     })}
        // </View>
        <ScrollView>
            <View style={styles.box}>
                {books.map(({ bookName, code }) => {
                    return (
                        <View style={styles.book} key={code}>
                            <Text style={styles.bookInfo}>Name: {bookName}</Text>
                            <Text style={styles.bookInfo}>Code: {code}</Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

export default ListsScrollView

const styles = StyleSheet.create({
    box: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        gap: 20,
        marginVertical: 30,
        marginHorizontal: 20
    },
    book: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        marginBottom: 10,
        backgroundColor: '#A8FBEA',
        width: '100%',
        borderRadius: 10,
        paddingHorizontal: 10,
        borderWidth: 1
    },
    bookInfo: {
        fontSize: 24,
        fontWeight: '600',
        color: '#bc3f09'
    }
})