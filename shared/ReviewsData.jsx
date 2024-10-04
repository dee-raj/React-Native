import React, { createContext, useState } from 'react';

export const ReviewsContext = createContext();

export const ReviewsProvider = ({ children }) => {
    const [reviews, setReviews] = useState([
        {
            "id": 1,
            "title": "Inception",
            "type": "Movie",
            "rating": 9.0,
            "reviewer": "Alice Johnson",
            "review": "A mind-bending thriller that keeps you on the edge of your seat!",
            "date": "2023-10-01"
        }, {
            "id": 2,
            "title": "Stranger Things",
            "type": "Web Series",
            "rating": 8.5,
            "reviewer": "Bob Smith",
            "review": "An excellent blend of nostalgia and suspense with great character development.",
            "date": "2023-09-15"
        }, {
            "id": 3,
            "title": "The Godfather",
            "type": "Movie",
            "rating": 10.0,
            "reviewer": "Charlie Brown",
            "review": "A timeless classic that defines the gangster genre.",
            "date": "2023-08-20"
        }, {
            "id": 4,
            "title": "The Crown",
            "type": "Web Series",
            "rating": 9.2,
            "reviewer": "Diana Prince",
            "review": "Beautifully crafted and captivating storytelling.",
            "date": "2023-09-25"
        }, {
            "id": 5,
            "title": "Interstellar",
            "type": "Movie",
            "rating": 8.8,
            "reviewer": "Ethan Hunt",
            "review": "A visually stunning journey through space and time.",
            "date": "2023-09-30"
        }, {
            "id": 12,
            "title": "Terrible Movie",
            "type": "Movie",
            "rating": 1.0,
            "reviewer": "John Doe",
            "review": "Absolutely awful. Do not recommend.",
            "date": "2024-10-01"
        }, {
            "id": 42,
            "title": "Bad Experience",
            "type": "Web Series",
            "rating": 2.5,
            "reviewer": "Jane Smith",
            "review": "Had some moments, but mostly disappointing.",
            "date": "2024-09-15"
        }, {
            "id": 53,
            "title": "Average Flick",
            "type": "Movie",
            "rating": 4.0,
            "reviewer": "Chris Johnson",
            "review": "It was okay, nothing special.",
            "date": "2024-08-20"
        }, {
            "id": 404,
            "title": "Good Show",
            "type": "Web Series",
            "rating": 7.0,
            "reviewer": "Emily Davis",
            "review": "Enjoyable with some great episodes!",
            "date": "2024-09-25"
        }, {
            "id": 55,
            "title": "Fantastic Movie",
            "type": "Movie",
            "rating": 9.5,
            "reviewer": "Michael Brown",
            "review": "One of the best films I’ve ever seen!",
            "date": "2024-09-30"
        }, {
            "id": 76,
            "title": "Masterpiece",
            "type": "Movie",
            "rating": 10.0,
            "reviewer": "Sarah Wilson",
            "review": "A true cinematic achievement.",
            "date": "2024-10-02"
        }

    ]);
    return (
        <ReviewsContext.Provider value={{ reviews, setReviews }}>
            {children}
        </ReviewsContext.Provider>
    );
};
