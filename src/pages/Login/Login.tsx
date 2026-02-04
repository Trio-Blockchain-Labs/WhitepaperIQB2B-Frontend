import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/common';
import { Logo } from '../../components/Logo';
import { authService } from '../../services';
import { useToast } from '../../context/ToastContext';
import type { LoginCredentials } from '../../types';
import './Login.css';

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to search if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/search', { replace: true });
    }
  }, [navigate]);

  // Set page title
  useEffect(() => {
    document.title = 'Login - WhitepaperIQ';
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    // TODO: Re-enable password length validation later
    // else if (formData.password.length < 6) {
    //   newErrors.password = 'Password must be at least 6 characters';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'rememberMe') {
      setRememberMe(checked);
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call real API
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Login successful:', response.user);
      
      // Dispatch event to notify OrganizationContext to fetch data
      window.dispatchEvent(new Event('user-logged-in'));
      
      showSuccess('Login successful! Redirecting...');
      
      // Redirect to search page
      setTimeout(() => {
        navigate('/search');
      }, 500);
    } catch (error) {
      // Handle error message
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login">
        <div className="login__header">
          <Logo className="login__logo" size="lg" />
        </div>

        <div className="login__card">
          <div className="login__card-header">
            <h1 className="login__title">Welcome Back</h1>
            <p className="login__subtitle">Access your institutional crypto analysis</p>
          </div>

          <form className="login__form" onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              label="Email Address"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              leftIcon={<EmailIcon />}
              fullWidth
              autoComplete="email"
            />

            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              leftIcon={<LockIcon />}
              fullWidth
              autoComplete="current-password"
            />

            <div className="login__options">
              <label className="login__remember">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={handleInputChange}
                  className="login__checkbox"
                />
                <span className="login__checkbox-custom" />
                <span className="login__remember-text">Remember me</span>
              </label>
              <a href="/forgot-password" className="login__forgot-link">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="login__divider">
            <span>or</span>
          </div>

          <div className="login__footer">
            <p className="login__register-text">
              Don't have an account?{' '}
              <a href="/register" className="login__register-link">
                Request access
              </a>
            </p>
          </div>
        </div>

        <div className="login__security-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Secured with 256-bit SSL encryption</span>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
