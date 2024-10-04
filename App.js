import RootDrawerNavigation from './routes/drawer'
import { ReviewsProvider } from './shared/ReviewsData';

export default function App() {
  return (
    <ReviewsProvider>
      <RootDrawerNavigation />
    </ReviewsProvider>
  );
}
