import React from 'react';
import logoWhitepaper from '../../assets/logo-whitepaper.png';
import logo from '../../assets/logo.png';
import './Logo.css';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  return (
    <div className={`logo logo--${size} ${className}`}>
      <img src={logoWhitepaper} alt="WhitepaperIQ" className="logo__whitepaper" />
      <img src={logo} alt="WhitepaperIQ" className="logo__icon" />
    </div>
  );
};

export default Logo;
