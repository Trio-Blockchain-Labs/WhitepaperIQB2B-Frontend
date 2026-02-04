import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/common';
import { Logo } from '../../components/Logo';
import { authService } from '../../services';
import { roleLabels } from '../../types/organization';
import type { InvitationDetails } from '../../types';
import './Invite.css';

// Icons
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
  </svg>
);

export const Invite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Set page title
  useEffect(() => {
    document.title = 'Accept Invitation - WhitepaperIQ';
  }, []);
  
  const [isValidating, setIsValidating] = useState(true);
  const [invite, setInvite] = useState<InvitationDetails | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setValidationError('Invalid invitation link.');
        setIsValidating(false);
        return;
      }
      
      try {
        const invitationDetails = await authService.getInvitationDetails(token);
        setInvite(invitationDetails);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid or expired invitation link.';
        setValidationError(message);
      } finally {
        setIsValidating(false);
      }
    };
    
    validate();
  }, [token]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // fullName is optional, but we can validate if provided
    if (formData.fullName.trim() && formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Accept invitation - this will create the user account and log them in
      await authService.acceptInvitation({
        token,
        password: formData.password,
        fullName: formData.fullName.trim() || undefined, // Optional field
      });
      
      // Dispatch event to notify OrganizationContext to fetch data
      window.dispatchEvent(new Event('user-logged-in'));
      
      // Success - user is now logged in, redirect to search page
      setIsSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/search');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <AuthLayout>
        <div className="invite">
          <div className="invite__loading">
            <span className="invite__spinner" />
            <span>Validating invitation...</span>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Error state
  if (validationError) {
    return (
      <AuthLayout>
        <div className="invite">
          <div className="invite__error">
            <AlertCircleIcon />
            <h2>Invalid Invitation</h2>
            <p>{validationError}</p>
            <Button variant="primary" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="invite">
          <div className="invite__success">
            <CheckCircleIcon />
            <h2>Account Created!</h2>
            <p>Your account has been successfully created. Redirecting you to the dashboard...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Registration form
  if (!invite) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="invite">
        <div className="invite__header">
          <Logo className="invite__logo" size="lg" />
        </div>

        <div className="invite__card">
          <div className="invite__card-header">
            <h1 className="invite__title">Join {invite.organization.name}</h1>
            <p className="invite__subtitle">
              You've been invited to join as <strong>{roleLabels[invite.role]}</strong>
            </p>
          </div>

          <div className="invite__org-info">
            <BuildingIcon />
            <div>
              <span className="invite__org-name">{invite.organization.name}</span>
              <span className="invite__org-email">{invite.email}</span>
            </div>
          </div>

          <form className="invite__form" onSubmit={handleSubmit}>
            {submitError && (
              <div className="invite__error-banner">
                <AlertCircleIcon />
                <span>{submitError}</span>
              </div>
            )}

            <Input
              name="fullName"
              type="text"
              label="Full Name (Optional)"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              error={errors.fullName}
              leftIcon={<UserIcon />}
              fullWidth
              autoComplete="name"
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
              autoComplete="new-password"
            />

            <Input
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              leftIcon={<LockIcon />}
              fullWidth
              autoComplete="new-password"
            />

            <div className="invite__password-hint">
              Password must be at least 8 characters long
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              fullWidth
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="invite__login-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Invite;
