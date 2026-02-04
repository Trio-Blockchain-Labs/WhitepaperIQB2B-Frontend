import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Search, SearchResults, TokenDetail, Settings, Projects, Invite, Trending, Analyses } from './pages';
import { OrganizationProvider, ToastProvider } from './context';

function App() {
  return (
    <Router>
      <ToastProvider>
        <OrganizationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/search/results" element={<SearchResults />} />
            <Route path="/token/:coingeckoId" element={<TokenDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/analyses" element={<Analyses />} />
            <Route path="/invite/:token" element={<Invite />} />
            <Route path="/" element={<Navigate to="/search" replace />} />
          </Routes>
        </OrganizationProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
