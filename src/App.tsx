import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Search, SearchResults, TokenDetail, Settings, Projects, Invite, Trending, Analyses } from './pages';
import { OrganizationProvider, ToastProvider } from './context';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { authService } from './services/auth.service';

function App() {
  // Check authentication synchronously before rendering
  const isAuthenticated = authService.isAuthenticated();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh token periodically (every 1 minute) after login
  useEffect(() => {
    const refreshToken = async () => {
      // Check if still authenticated before refreshing
      if (!authService.isAuthenticated()) {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
        return;
      }

      try {
        await authService.refreshToken();
        console.log('Token refreshed');
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // If refresh fails, clear interval
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }
    };

    // Only start if authenticated
    if (isAuthenticated) {
      // Set up interval to refresh every 1 minute (60000 ms)
      refreshIntervalRef.current = setInterval(refreshToken, 60 * 1000);
    } else {
      // Clear interval if user is not authenticated
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    // Cleanup on unmount or when authentication changes
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [isAuthenticated]);

  // Listen for login/logout events to start/stop refresh interval
  useEffect(() => {
    const handleLogin = () => {
      // User logged in, start refresh interval
      const refreshToken = async () => {
        if (!authService.isAuthenticated()) {
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
          }
          return;
        }

        try {
          await authService.refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
          }
        }
      };

      // Clear existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Start interval (no need to refresh immediately, token already new from login)
      refreshIntervalRef.current = setInterval(refreshToken, 60 * 1000);
    };

    const handleLogout = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };

    // Listen for login event
    window.addEventListener('user-logged-in', handleLogin);

    // Listen for storage changes (token removal = logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        handleLogout();
      } else if (e.key === 'token' && e.newValue) {
        // Token was added (login from another tab)
        handleLogin();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('user-logged-in', handleLogin);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <ToastProvider>
        <OrganizationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/invite/:token" element={<Invite />} />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search/results"
              element={
                <ProtectedRoute>
                  <SearchResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/token/:coingeckoId"
              element={
                <ProtectedRoute>
                  <TokenDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trending"
              element={
                <ProtectedRoute>
                  <Trending />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyses"
              element={
                <ProtectedRoute>
                  <Analyses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? '/search' : '/login'} replace />}
            />
          </Routes>
        </OrganizationProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
