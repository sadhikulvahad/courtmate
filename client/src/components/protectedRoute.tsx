// src/components/ProtectedRoute.tsx
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // Show loading indicator if authentication status is being checked
  if (loading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/signup" replace />;
};

export default ProtectedRoute;