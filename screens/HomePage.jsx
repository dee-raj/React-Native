import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { globalstyles } from '../style/GlobalStyle';
import Card from '../shared/Card';
import { ReviewsContext } from '../shared/ReviewsData';
import { ToggleBtn } from '../shared/drawerIcon';
import ModelScreen from './ModelScreen';

const HomePage = ({ navigation }) => {
    const { reviews } = useContext(ReviewsContext);
    return (
        <View style={globalstyles.container}>

            <ModelScreen />
            <ToggleBtn name={'menu-open'} text={'Open Model to Add More'} />

            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [
                            globalstyles.Btn,
                            pressed ? styles.pressed : null
                        ]}
                        onPress={() => {
                            navigation.navigate('Review', {
                                review: item.review,
                                title: item.title,
                                rating: item.rating,
                                reviewer: item.reviewer,
                                date: item.date,
                            });
                        }}
                        accessibilityLabel={`View details for ${item.title}`}
                    >
                        <Card>
                            <Text style={globalstyles.textStyle}>
                                {item.title} - {item.rating}
                            </Text>
                        </Card>
                    </Pressable>
                )}
                contentContainerStyle={{ paddingVertical: 10 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.5,
    },
});

export default HomePage;
