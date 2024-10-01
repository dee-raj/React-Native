import { FlatList, Pressable, Text, View } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { globalstyles } from '../style/GlobalStyle'



const HomePage = ({ navigation }) => {
    const [reviews, setReviews] = useState([
        {
            "id": 1,
            "title": "Inception",
            "type": "Movie",
            "rating": 9.0,
            "reviewer": "Alice Johnson",
            "review": "A mind-bending thriller that keeps you on the edge of your seat!",
            "date": "2023-10-01"
        },
        {
            "id": 2,
            "title": "Stranger Things",
            "type": "Web Series",
            "rating": 8.5,
            "reviewer": "Bob Smith",
            "review": "An excellent blend of nostalgia and suspense with great character development.",
            "date": "2023-09-15"
        },
        {
            "id": 3,
            "title": "The Godfather",
            "type": "Movie",
            "rating": 10.0,
            "reviewer": "Charlie Brown",
            "review": "A timeless classic that defines the gangster genre.",
            "date": "2023-08-20"
        },
        {
            "id": 4,
            "title": "The Crown",
            "type": "Web Series",
            "rating": 9.2,
            "reviewer": "Diana Prince",
            "review": "Beautifully crafted and captivating storytelling.",
            "date": "2023-09-25"
        },
        {
            "id": 5,
            "title": "Interstellar",
            "type": "Movie",
            "rating": 8.8,
            "reviewer": "Ethan Hunt",
            "review": "A visually stunning journey through space and time.",
            "date": "2023-09-30"
        }
    ]);

    return (
        <View style={globalstyles.container}>
            <StatusBar backgroundColor='#54FA98' style='inverted' />

            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View>
                        <Pressable style={globalstyles.Btn} onPress={() => {
                            console.log('Navigating to review with data:', item);
                            navigation.navigate('Review', {
                                review: item.review,
                                title: item.title,
                                rating: item.rating,
                                reviewer: item.reviewer,
                                date: item.date,
                            });
                        }}>
                            <Text style={globalstyles.textStyle}>{item.title} - {item.rating}</Text>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    )
}

export default HomePage;

