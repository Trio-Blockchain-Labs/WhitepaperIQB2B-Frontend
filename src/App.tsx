import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Search, SearchResults, TokenDetail, Settings, Projects, Invite, Trending, Analyses } from './pages';
import { OrganizationProvider, ToastProvider } from './context';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { authService } from './services/auth.service';

function App() {
  // Check authentication synchronously before rendering
  const isAuthenticated = authService.isAuthenticated();

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
