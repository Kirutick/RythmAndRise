import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'user' | 'admin';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const data = await AuthService.verifyToken();
        if (!data || !data.user) {
          throw new Error('Not authenticated');
        }
        const user = data.user;
        setUserRole(user.role);
        setIsAuthenticated(true);

        if (allowedRole && user.role !== allowedRole) {
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (err) {
        AuthService.clearLocalAuth();
        setIsAuthenticated(false);
        setIsAuthorized(false);
        setUserRole(null);
      }
    };

    verifySession();
  }, [allowedRole, location.pathname]);

  if (isAuthenticated === null || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-brand-text-muted">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted location so we could redirect back later (optional)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    // Authenticated but wrong role - cross-redirect to appropriate dashboard
    if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  return <>{children}</>;
}
