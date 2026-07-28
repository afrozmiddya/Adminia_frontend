import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    // Not logged in, redirect to main login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but incorrect role, redirect to their specific dashboard
    const roleRoutes = {
      STUDENT: '/student',
      COLLEGE_ADMIN: '/admin',
      SUPER_ADMIN: '/super-admin',
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return <Outlet />;
}
