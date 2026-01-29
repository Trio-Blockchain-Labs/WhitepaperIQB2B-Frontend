import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Search, SearchResults, TokenDetail, Settings, Projects, Invite } from './pages';
import { OrganizationProvider } from './context';

function App() {
  return (
    <Router>
      <OrganizationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search/results" element={<SearchResults />} />
          <Route path="/token/:ticker" element={<TokenDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/invite/:token" element={<Invite />} />
          <Route path="/" element={<Navigate to="/search" replace />} />
        </Routes>
      </OrganizationProvider>
    </Router>
  );
}

export default App;
