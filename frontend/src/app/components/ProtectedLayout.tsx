import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Layout } from './Layout';

export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}
