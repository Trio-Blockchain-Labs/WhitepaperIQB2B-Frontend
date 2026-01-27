import React from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__background">
        <div className="auth-layout__gradient-orb auth-layout__gradient-orb--1" />
        <div className="auth-layout__gradient-orb auth-layout__gradient-orb--2" />
        <div className="auth-layout__gradient-orb auth-layout__gradient-orb--3" />
      </div>
      <div className="auth-layout__content">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
