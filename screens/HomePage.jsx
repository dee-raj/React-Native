import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { globalstyles } from '../style/GlobalStyle'
import Card from '../shared/Card';
import { ReviewsContext } from '../shared/ReviewsData';

import { ToggleBtn } from '../shared/drawerIcon';
import ModelScreen from './ModelScreen';

const HomePage = ({ navigation }) => {
    const { reviews } = useContext(ReviewsContext);
    return (
        <View style={globalstyles.container}>
            <StatusBar backgroundColor='#54CA98' style='inverted' />

            <ModelScreen />
            <ToggleBtn name={'menu-open'} text={'Open Model to Add More'} />

            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View>
                        <Pressable style={globalstyles.Btn} onPress={() => {
                            // console.log('Navigating to review with data:', item);
                            navigation.navigate('Review', {
                                review: item.review,
                                title: item.title,
                                rating: item.rating,
                                reviewer: item.reviewer,
                                date: item.date,
                            });
                        }}>
                            <Card>
                                <Text style={globalstyles.textStyle}>{item.title} - {item.rating}</Text>
                            </Card>
                        </Pressable>
                    </View>
                )}
                contentContainerStyle={{ paddingVertical: 10 }}
            />
        </View>
    )
}

export default HomePage;
