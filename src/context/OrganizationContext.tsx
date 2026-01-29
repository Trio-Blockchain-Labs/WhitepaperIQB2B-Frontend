import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { organizationService } from '../services';
import type { Organization } from '../types';

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  error: string | null;
  refreshOrganization: () => Promise<void>;
  updateOrganizationName: (name: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await organizationService.getOrganization();
      setOrganization(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      fetchOrganization();
    } else {
      setIsLoading(false);
    }

    // Listen for login events (when user logs in, refresh organization)
    const handleLogin = () => {
      const newToken = localStorage.getItem('token');
      if (newToken) {
        fetchOrganization();
      }
    };

    // Listen for custom login event
    window.addEventListener('user-logged-in', handleLogin);
    
    // Also listen for storage changes (in case token is set from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        fetchOrganization();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('user-logged-in', handleLogin);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchOrganization]);

  const refreshOrganization = useCallback(async () => {
    await fetchOrganization();
  }, [fetchOrganization]);

  // Optimistic update for organization name
  const updateOrganizationName = useCallback((name: string) => {
    setOrganization(prev => prev ? { ...prev, name } : null);
  }, []);

  return (
    <OrganizationContext.Provider 
      value={{ 
        organization, 
        isLoading, 
        error, 
        refreshOrganization,
        updateOrganizationName 
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export default OrganizationContext;
