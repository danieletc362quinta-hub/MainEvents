import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * Componente de ruta protegida que redirige al login si el usuario no está autenticado
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si el usuario está autenticado
 * @param {string} [props.redirectTo='/login'] - Ruta a la que redirigir si el usuario no está autenticado
 * @returns {JSX.Element} Componente de ruta protegida
 */
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();

  if (!isAuth) {
    // Redirigir al login, guardando la ubicación a la que intentaban acceder
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
