import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute({ children }) {
  const { session } = useAuth();
  
  // If the user isn't authenticated (or was rejected by the invite gate), bounce them to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the requested page
  return children;
}
