import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../Logo';
import { useOrganization } from '../../context';
import { authService } from '../../services';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ProjectsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { organization } = useOrganization();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Show remaining percentage (inverse of used)
  const remainingPercentage = organization?.credits 
    ? (organization.credits.remaining / organization.credits.total) * 100 
    : 0;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      // logout() already handles redirect, but we can close sidebar
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <Logo className="sidebar__logo" size="md" />
          <p className="sidebar__business-name">
            {organization?.name || 'Loading...'}
          </p>
        </div>

        <nav className="sidebar__nav">
          <NavLink 
            to="/search" 
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
            onClick={onClose}
          >
            <SearchIcon />
            <span>Search</span>
          </NavLink>
          <NavLink 
            to="/projects" 
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
            onClick={onClose}
          >
            <ProjectsIcon />
            <span>Analyzed Projects</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
            onClick={onClose}
          >
            <SettingsIcon />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__usage">
            <h4 className="sidebar__usage-title">Usage Stats</h4>
            <div className="sidebar__usage-bar">
              <div 
                className="sidebar__usage-bar-fill" 
                style={{ width: `${remainingPercentage}%` }}
              />
            </div>
            <div className="sidebar__usage-info">
              <span className="sidebar__usage-count">
                {organization?.credits 
                  ? `${organization.credits.remaining} remaining`
                  : '0 remaining'
                }
              </span>
              <a href="/settings" className="sidebar__usage-link">view my plan</a>
            </div>
          </div>
          
          <button 
            className="sidebar__logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogoutIcon />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
