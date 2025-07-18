import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  if (!user) {
    // Ako korisnik nije ulogovan, preusmeri ga na login i sačuvaj prethodnu lokaciju
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ako je ulogovan, prikaži decu
  return <>{children}</>;
};
