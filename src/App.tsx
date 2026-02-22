import { RouterProvider } from 'react-router-dom';
import { TutorialProvider } from './components/Tutorial';
import { router } from './router';

export default function App() {
  return (
    <TutorialProvider>
      <RouterProvider router={router} />
    </TutorialProvider>
  );
}
