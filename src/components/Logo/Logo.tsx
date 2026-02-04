import React from 'react';
import logo from '../../assets/logo.png';
import './Logo.css';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  return (
    <div className={`logo logo--${size} ${className}`}>
      <img src={logo} alt="WhitepaperIQ" className="logo__image" />
    </div>
  );
};

export default Logo;
