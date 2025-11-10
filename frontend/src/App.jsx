import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/UnifiedLanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import modernTheme from './theme/modernTheme';

// Components
import ModernNavigation from './components/ui/ModernNavigation';
import ImprovedNavigation from './components/ui/ImprovedNavigation';
import Home from './pages/Home';
import ModernEventDetail from './components/pages/ModernEventDetail';
import Events from './pages/Events';
import ModernEvents from './pages/ModernEvents';
import CreateEvent from './pages/CreateEvent';
import ModernCreateEvent from './components/ui/ModernCreateEvent';
import Dashboard from './pages/Dashboard';
import ModernDashboard from './components/ui/ModernDashboard';
import Profile from './pages/Profile';
import ModernProfile from './components/ui/ModernProfile';
import Payments from './pages/Payments';
import ModernPayments from './components/ui/ModernPayments';
import Coupons from './pages/Coupons';
import ModernCoupons from './components/ui/ModernCoupons';
import Login from './pages/Login';
import ModernLogin from './components/ui/ModernLogin';
import ImprovedLogin from './components/ui/ImprovedLogin';
import Register from './pages/Register';
import ModernRegister from './components/ui/ModernRegister';
import ImprovedRegister from './components/ui/ImprovedRegister';
import TranslationTest from './components/ui/TranslationTest';
import NotFound from './pages/NotFound';
import ModernNotFound from './components/ui/ModernNotFound';
import Help from './pages/Help';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('home');

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Navigation */}
          <ImprovedNavigation />
              
              {/* Main Content */}
              <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
                    <Routes>
                      {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<ModernEventDetail />} />
                  <Route path="/login" element={<ImprovedLogin />} />
                  <Route path="/register" element={<ImprovedRegister />} />
                  <Route path="/translation-test" element={<TranslationTest />} />
                  <Route path="/help" element={<Help />} />
                      
                      {/* Protected Routes */}
                  <Route 
                    path="/create-event" 
                    element={
                      isAuthenticated ? <ModernCreateEvent /> : <Navigate to="/login" replace />
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      isAuthenticated ? <ModernDashboard /> : <Navigate to="/login" replace />
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      isAuthenticated ? <ModernProfile /> : <Navigate to="/login" replace />
                    } 
                  />
                  <Route 
                    path="/payments" 
                    element={
                      isAuthenticated ? <ModernPayments /> : <Navigate to="/login" replace />
                    } 
                  />
                  <Route 
                    path="/coupons" 
                    element={
                      isAuthenticated ? <ModernCoupons /> : <Navigate to="/login" replace />
                    } 
                  />
                      
                      {/* 404 */}
                  <Route path="*" element={<ModernNotFound />} />
                    </Routes>
              </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
