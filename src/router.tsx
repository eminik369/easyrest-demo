import { createBrowserRouter } from 'react-router-dom';
import { Shell } from './components/layout';
import { CoverPage } from './modules/cover/CoverPage';
import { OverviewPage } from './modules/overview/OverviewPage';
import { RecipesPage } from './modules/recipes/RecipesPage';
import { RecipeDetailPage } from './modules/recipes/RecipeDetailPage';
import { ScannerPage } from './modules/scanner/ScannerPage';
import { InventoryPage } from './modules/scanner/InventoryPage';
import { ExpiryPage } from './modules/scanner/ExpiryPage';
import { HACCPPage } from './modules/scanner/HACCPPage';
import { WastePage } from './modules/scanner/WastePage';
import { ReorderPage } from './modules/scanner/ReorderPage';
import { ComparisonPage } from './modules/scanner/ComparisonPage';
import { PreparationsPage } from './modules/preparations/PreparationsPage';
import { AnalyticsPage } from './modules/analytics/AnalyticsPage';
import { FloorPlanPage } from './modules/floor-plan/FloorPlanPage';
import { ChatbotPage } from './modules/chatbot/ChatbotPage';
import { BusinessCasePage } from './modules/business-case/BusinessCasePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CoverPage />,
  },
  {
    element: <Shell />,
    children: [
      { path: 'overview', element: <OverviewPage /> },
      { path: 'recipes', element: <RecipesPage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'scanner', element: <ScannerPage /> },
      { path: 'scanner/inventory', element: <InventoryPage /> },
      { path: 'scanner/expiry', element: <ExpiryPage /> },
      { path: 'scanner/haccp', element: <HACCPPage /> },
      { path: 'scanner/waste', element: <WastePage /> },
      { path: 'scanner/reorder', element: <ReorderPage /> },
      { path: 'scanner/comparison', element: <ComparisonPage /> },
      { path: 'preparations', element: <PreparationsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'floor-plan', element: <FloorPlanPage /> },
      { path: 'chatbot', element: <ChatbotPage /> },
      { path: 'business-case', element: <BusinessCasePage /> },
    ],
  },
]);
