import RootDrawerNavigation from './routes/drawer';
import { ReviewsProvider } from './shared/ReviewsData';
import React from 'react';

export default function App() {
  return (
    <ReviewsProvider>
      <RootDrawerNavigation />
    </ReviewsProvider>
  );
}
