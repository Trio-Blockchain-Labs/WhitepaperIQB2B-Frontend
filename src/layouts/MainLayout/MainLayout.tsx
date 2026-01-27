import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Only show the logo next to hamburger on token detail/analysis pages
  const showTopbarLogo = location.pathname.startsWith('/token/');

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
        {showTopbarLogo && <Logo className="main-layout__logo" size="sm" />}
      </header>

      <main className="main-layout__content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
