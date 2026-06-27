import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { account, loading } = useAuth();

  if (loading) return null;
  if (!account) return <Navigate to="/login" replace />;

  return children;
}
