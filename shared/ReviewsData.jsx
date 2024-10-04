import React, { createContext, useState } from 'react';

export const ReviewsContext = createContext();
export const ModelContext = createContext();

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
            "rating": 4.5,
            "reviewer": "Bob Smith",
            "review": "An excellent blend of nostalgia and suspense with great character development.",
            "date": "2023-09-15"
        }, {
            "id": 3,
            "title": "The Godfather",
            "type": "Movie",
            "rating": 7.0,
            "reviewer": "Charlie Brown",
            "review": "A timeless classic that defines the gangster genre.",
            "date": "2023-08-20"
        }, {
            "id": 4,
            "title": "The Crown",
            "type": "Web Series",
            "rating": 6.2,
            "reviewer": "Diana Prince",
            "review": "Beautifully crafted and captivating storytelling.",
            "date": "2023-09-25"
        }
    ]);

    const addReview = (review) => {
        setReviews(prevReviews => [...prevReviews, { ...review, id: Date.now() }]);
    }

    return (
        <ReviewsContext.Provider value={{ reviews, addReview }}>
            {children}
        </ReviewsContext.Provider>
    );
};

export const ModelProvider = ({ children }) => {
    const [modelOpen, setModelOpen] = useState(false);
    return (
        <ModelContext.Provider value={{ modelOpen, setModelOpen }}>
            {children}
        </ModelContext.Provider>
    )
}