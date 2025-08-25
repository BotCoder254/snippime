import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LoadingSkeleton from './components/common/LoadingSkeleton';

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();
  
  // Initialize theme
  useTheme();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;