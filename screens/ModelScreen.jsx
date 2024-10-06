import { Button, Modal, ScrollView, StyleSheet, Text, TextInput, View, TouchableWithoutFeedback, Keyboard, Pressable } from 'react-native';
import React, { useContext, useState } from 'react';
import { Formik } from 'formik';
import { ToggleBtn } from '../shared/drawerIcon';
import { ModelContext, ReviewsContext } from '../shared/ReviewsData';
import { globalstyles } from '../style/GlobalStyle';
import * as Yup from 'yup';

const ReviewSchema = Yup.object({
    title: Yup.string()
        .trim()
        .required('Title is required')
        .min(4, 'Must be at least 4 characters long'),
    type: Yup.string()
        .trim()
        .required('Type is required')
        .min(4, 'Must be at least 4 characters long'),
    rating: Yup.number()
        .required('Rating is required')
        .min(1, 'Rating must be at least 1')
        .max(10, 'Rating must be at most 10'),
    reviewer: Yup.string()
        .required('Reviewer name is required')
        .trim()
        .min(3, 'Must be at least 3 characters long'),
    review: Yup.string()
        .trim()
        .required('Review is required')
        .min(10, 'Must be at least 10 characters long'),
});

const MyReactNativeForm = () => {
    const { addReview } = useContext(ReviewsContext);
    const [submittedValues, setSubmittedValues] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <ScrollView style={{ marginTop: 20 }}>
            <Formik
                initialValues={{
                    title: '',
                    type: '',
                    rating: '',
                    reviewer: '',
                    review: '',
                }}
                validationSchema={ReviewSchema}
                onSubmit={(values, { resetForm }) => {
                    addReview(values);
                    resetForm();
                    setSubmittedValues(values);
                    setModalVisible(true);
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={styles.formStyle}>
                        <TextInput
                            placeholder='Title of Movie or Web series'
                            onChangeText={handleChange('title')}
                            onBlur={handleBlur('title')}
                            value={values.title}
                            style={[styles.input, touched.title && errors.title && styles.errorInput]}
                        />
                        <Text style={globalstyles.errorStyle}>{touched.title && errors.title}</Text>

                        <TextInput
                            placeholder='Type (e.g., Movie, Series)'
                            onChangeText={handleChange('type')}
                            onBlur={handleBlur('type')}
                            value={values.type}
                            style={[styles.input, touched.type && errors.type && styles.errorInput]}
                        />
                        <Text style={globalstyles.errorStyle}>{touched.type && errors.type}</Text>

                        <TextInput
                            placeholder='Rating (out of 10)'
                            onChangeText={handleChange('rating')}
                            onBlur={handleBlur('rating')}
                            value={values.rating}
                            style={[styles.input, touched.rating && errors.rating && styles.errorInput]}
                            keyboardType="numeric"
                        />
                        <Text style={globalstyles.errorStyle}>{touched.rating && errors.rating}</Text>

                        <TextInput
                            placeholder='Reviewer Name'
                            onChangeText={handleChange('reviewer')}
                            onBlur={handleBlur('reviewer')}
                            value={values.reviewer}
                            style={[styles.input, touched.reviewer && errors.reviewer && styles.errorInput]}
                        />
                        <Text style={globalstyles.errorStyle}>{touched.reviewer && errors.reviewer}</Text>

                        <TextInput
                            placeholder='Review'
                            onChangeText={handleChange('review')}
                            onBlur={handleBlur('review')}
                            value={values.review}
                            style={[styles.input, touched.review && errors.review && styles.errorInput]}
                            multiline
                            numberOfLines={4}
                        />
                        <Text style={globalstyles.errorStyle}>{touched.review && errors.review}</Text>

                        {/* <Button onPress={handleSubmit} title="Submit" /> */}
                        <Pressable style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </Pressable>
                    </View>
                )}
            </Formik>

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.SuccessModalContainer}>
                        <Text style={styles.modalTitle}>Record Submitted!</Text>
                        <ScrollView>
                            {submittedValues ? (
                                Object.entries(submittedValues).map(([key, value]) => (
                                    <View key={key} style={styles.valueSum}>
                                        <Text style={[styles.modalTitle, { color: '#FACEFB', textTransform: 'capitalize' }]}>{key}: </Text>
                                        <Text style={styles.modalMessage}>{value}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.modalMessage}>No data available.</Text>
                            )}
                        </ScrollView>
                        <Pressable style={styles.doneButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const ModelScreen = () => {
    const { modelOpen, setModelOpen } = useContext(ModelContext);
    return (
        <Modal visible={modelOpen} animationType={'slide'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modelContainer}>
                    <Text style={globalstyles.textStyle}>Here you can add new reviews</Text>
                    <ToggleBtn name={'close'} text={'Close Model'} onPress={() => setModelOpen(false)} />
                    <MyReactNativeForm />
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

export default ModelScreen;

const styles = StyleSheet.create({
    modelContainer: {
        flex: 1,
        marginTop: 10,
        marginHorizontal: 10,
        backgroundColor: '#FAEBCA',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
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
        gap: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    errorInput: {
        borderColor: 'red', // Change border color on error
        borderWidth: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    SuccessModalContainer: {
        width: '90%',
        padding: 10,
        backgroundColor: '#FEFEEE',
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#FEAACC',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#34FE90',
    },
    modalMessage: {
        fontSize: 18,
        textAlign: 'center',
        color: '#546764',
        fontFamily: 'Roboto',
    },
    valueSum: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#895794',
        borderRadius: 10,
        padding: 10,
        marginBottom: 5,
        flexWrap: 'wrap',
    },
    submitButton: {
        backgroundColor: '#56AF78',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    doneButton: {
        backgroundColor: '#28FA45',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
