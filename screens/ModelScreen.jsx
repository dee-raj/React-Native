import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Pressable,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { Formik } from 'formik';
import { ToggleBtn } from '../shared/drawerIcon';
import { ModelContext, ReviewsContext } from '../shared/ReviewsData';
import { globalstyles } from '../style/GlobalStyle';
import * as Yup from 'yup';

/* -------------------- Validation -------------------- */
const ReviewSchema = Yup.object({
    title: Yup.string().trim().min(4).required('Title is required'),
    type: Yup.string().trim().min(4).required('Type is required'),
    rating: Yup.number().min(1).max(10).required('Rating is required'),
    reviewer: Yup.string().trim().min(3).required('Reviewer name is required'),
    review: Yup.string().trim().min(10).required('Review is required'),
});

/* -------------------- Reusable Field -------------------- */
const FormField = ({ label, error, touched, children }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        {children}
        {touched && error ? (
            <Text style={styles.errorText}>{error}</Text>
        ) : (
            <Text style={styles.helperText}> </Text>
        )}
    </View>
);

/* -------------------- Form -------------------- */
const MyReactNativeForm = () => {
    const { addReview } = useContext(ReviewsContext);
    const [submittedValues, setSubmittedValues] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
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
                    setSubmittedValues(values);
                    resetForm();
                    setModalVisible(true);
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={styles.formCard}>
                        <FormField label="Title" error={errors.title} touched={touched.title}>
                            <TextInput
                                placeholder="Movie or Web Series"
                                style={[styles.input, touched.title && errors.title && styles.errorInput]}
                                onChangeText={handleChange('title')}
                                onBlur={handleBlur('title')}
                                value={values.title}
                            />
                        </FormField>

                        <FormField label="Type" error={errors.type} touched={touched.type}>
                            <TextInput
                                placeholder="Movie, Series, Anime"
                                style={[styles.input, touched.type && errors.type && styles.errorInput]}
                                onChangeText={handleChange('type')}
                                onBlur={handleBlur('type')}
                                value={values.type}
                            />
                        </FormField>

                        <FormField label="Rating (1–10)" error={errors.rating} touched={touched.rating}>
                            <TextInput
                                placeholder="e.g. 8"
                                keyboardType="numeric"
                                style={[styles.input, touched.rating && errors.rating && styles.errorInput]}
                                onChangeText={handleChange('rating')}
                                onBlur={handleBlur('rating')}
                                value={values.rating}
                            />
                        </FormField>

                        <FormField label="Reviewer Name" error={errors.reviewer} touched={touched.reviewer}>
                            <TextInput
                                placeholder="Your name"
                                style={[styles.input, touched.reviewer && errors.reviewer && styles.errorInput]}
                                onChangeText={handleChange('reviewer')}
                                onBlur={handleBlur('reviewer')}
                                value={values.reviewer}
                            />
                        </FormField>

                        <FormField label="Review" error={errors.review} touched={touched.review}>
                            <TextInput
                                placeholder="Write your thoughts..."
                                multiline
                                numberOfLines={4}
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    touched.review && errors.review && styles.errorInput,
                                ]}
                                onChangeText={handleChange('review')}
                                onBlur={handleBlur('review')}
                                value={values.review}
                            />
                        </FormField>

                        <Pressable style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Submit Review</Text>
                        </Pressable>
                    </View>
                )}
            </Formik>

            {/* ---------- Success Modal ---------- */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.successModal}>
                        <Text style={styles.modalTitle}>🎉 Review Submitted</Text>

                        <ScrollView>
                            {submittedValues &&
                                Object.entries(submittedValues).map(([key, value]) => (
                                    <View key={key} style={styles.summaryRow}>
                                        <Text style={styles.summaryKey}>{key}</Text>
                                        <Text style={styles.summaryValue}>{value}</Text>
                                    </View>
                                ))}
                        </ScrollView>

                        <Pressable style={styles.doneButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

/* -------------------- Screen -------------------- */
const ModelScreen = () => {
    const { modelOpen, setModelOpen } = useContext(ModelContext);

    return (
        <Modal visible={modelOpen} animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.screen}>
                    <Text style={globalstyles.textStyle}>Add New Review</Text>
                    {/* <ToggleBtn name="close" text="Close" onPress={() => setModelOpen(false)} /> */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.closeBtn,
                            pressed && styles.closeBtnPressed,
                        ]}
                        onPress={() => setModelOpen(false)}
                        accessibilityLabel="Close add review modal"
                    >
                        <Text style={styles.closeIcon}>✕</Text>
                    </Pressable>

                    <MyReactNativeForm />
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ModelScreen;

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 16,
        paddingTop: 56, // 👈 prevents overlap
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },

    closeBtnPressed: {
        transform: [{ scale: 0.92 }],
        backgroundColor: '#D1D5DB',
    },

    closeIcon: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },

    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    fieldContainer: {
        marginBottom: 12,
    },

    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 4,
    },

    helperText: {
        fontSize: 11,
        color: 'transparent',
    },

    errorText: {
        fontSize: 11,
        color: '#DC2626',
        marginTop: 2,
    },

    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#FFF',
        fontSize: 14,
    },

    textArea: {
        height: 90,
        textAlignVertical: 'top',
    },

    errorInput: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },

    submitButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },

    submitButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },

    successModal: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    summaryKey: {
        fontWeight: '600',
        color: '#334155',
        textTransform: 'capitalize',
    },

    summaryValue: {
        color: '#475569',
        flexShrink: 1,
        textAlign: 'right',
    },

    doneButton: {
        backgroundColor: '#22C55E',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
        alignItems: 'center',
    },

    doneButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});
