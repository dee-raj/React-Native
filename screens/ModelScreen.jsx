import { Alert, Button, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext } from 'react';
import { Formik } from 'formik';
import { ToggleBtn } from '../shared/drawerIcon';
import { ModelContext, ReviewsContext } from '../shared/ReviewsData';
import { globalstyles } from '../style/GlobalStyle';

const MyReactNativeForm = () => {
    const { addReview } = useContext(ReviewsContext);

    return (
        <ScrollView style={{ marginTop: 20 }}>
            <Formik
                initialValues={{
                    "title": '', "type": '', "rating": 0,
                    "reviewer": '', "review": '', "date": ''
                }}
                onSubmit={(values, { resetForm }) => {
                    if ((values.title !== '') && (0 <= values.rating <= 10)) {
                        addReview(values);
                        resetForm();
                        Alert.alert("Record Submitted",
                            JSON.stringify(values, null, 2), {
                            text: "Done", style: 'destructive'
                        });
                    }
                    Alert.alert("Opps!, Form not Completed.",
                        "You probebly missed title, rating and other field.", {
                        text: "Fill Again!", style: "cancel"
                    });
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values }) => (
                    <View style={styles.formStyle}>
                        <TextInput
                            placeholder='Title of Movie or Web series'
                            onChangeText={handleChange('title')}
                            onBlur={handleBlur('title')}
                            value={values.title}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder='Type (e.g., Movie, Series)'
                            onChangeText={handleChange('type')}
                            onBlur={handleBlur('type')}
                            value={values.type}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder='Rating (out of 10)'
                            onChangeText={handleChange('rating')}
                            onBlur={handleBlur('rating')}
                            value={values.rating}
                            style={styles.input}
                            keyboardType="numeric"
                        />
                        <TextInput
                            placeholder='Reviewer Name'
                            onChangeText={handleChange('reviewer')}
                            onBlur={handleBlur('reviewer')}
                            value={values.reviewer}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder='Review'
                            onChangeText={handleChange('review')}
                            onBlur={handleBlur('review')}
                            value={values.review}
                            style={styles.input}
                            multiline
                            numberOfLines={4}
                        />
                        <TextInput
                            placeholder='Date (YYYY-MM-DD)'
                            onChangeText={handleChange('date')}
                            onBlur={handleBlur('date')}
                            value={values.date}
                            style={styles.input}
                        />
                        <Button onPress={handleSubmit} title="Submit" />
                    </View>
                )}
            </Formik>
        </ScrollView>
    );
}
const ModelScreen = () => {
    const { modelOpen } = useContext(ModelContext);
    return (
        <Modal visible={modelOpen} animationType={'slide'}>
            <View style={styles.modelContainer}>
                <Text style={globalstyles.textStyle}>Here you can add new reviews</Text>
                <ToggleBtn name={'close'} text={'Close Model'} />
                <MyReactNativeForm />
            </View>
        </Modal>
    )
}

export default ModelScreen

const styles = StyleSheet.create({
    modelContainer: {
        marginTop: 10,
        marginHorizontal: 10,
        backgroundColor: '#FAEBCA',
        paddingVertical: 30,
        paddingHorizontal: 10,
        flex: 1,
        borderRadius: 10
    },
    formStyle: {
        paddingVertical: 10,
        backgroundColor: '#ffeedd',
        shadowOffset: { width: 1, height: 2 },
        shadowColor: '#435432',
        shadowRadius: 10,
        shadowOpacity: 0.9,
        marginHorizontal: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        gap: 10
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
})