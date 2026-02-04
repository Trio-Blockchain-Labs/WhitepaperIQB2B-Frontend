import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Logo } from '../../components/Logo';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Show the logo next to hamburger on token detail, projects, settings, trending and analyses pages
  const showTopbarLogo =
    location.pathname.startsWith('/token/') ||
    location.pathname === '/projects' ||
    location.pathname === '/settings' ||
    location.pathname === '/trending' ||
    location.pathname === '/analyses';

  const handleLogoClick = () => {
    navigate('/search');
  };

  return (
    <div className="main-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <header className="main-layout__topbar">
        <button 
          className="main-layout__hamburger"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          aria-expanded={isSidebarOpen}
        >
          <HamburgerIcon />
        </button>
        {showTopbarLogo && (
          <button 
            className="main-layout__logo-btn"
            onClick={handleLogoClick}
            aria-label="Go to search"
          >
            <Logo className="main-layout__logo" size="md" />
          </button>
        )}
      </header>

      <main className="main-layout__content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
