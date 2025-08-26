import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import EmbedSnippet from './components/embed/EmbedSnippet';
import EmbedDocs from './components/embed/EmbedDocs';
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

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/embed/:snippetId" element={<EmbedSnippet />} />
        <Route path="/embed-docs" element={<EmbedDocs />} />
        
        {/* Protected routes */}
        {user ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/explore" element={<Dashboard />} />
            <Route path="/saved" element={<Dashboard />} />
            <Route path="/liked" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/embed-docs" element={<EmbedDocs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/embed-docs" element={<EmbedDocs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
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