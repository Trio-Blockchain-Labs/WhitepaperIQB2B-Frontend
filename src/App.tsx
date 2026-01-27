import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Search, SearchResults, TokenDetail, Settings } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/search/results" element={<SearchResults />} />
        <Route path="/token/:ticker" element={<TokenDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/search" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
