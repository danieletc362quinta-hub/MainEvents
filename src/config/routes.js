import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Páginas públicas
import HomePage from '../pages/HomePage';
import EventsPage from '../pages/EventsPage';
import EventDetailPage from '../pages/EventDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Páginas protegidas
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import MyTicketsPage from '../pages/MyTicketsPage';
import PaymentMethodsPage from '../pages/PaymentMethodsPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';

// Componentes
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';

/**
 * Configuración de rutas de la aplicación
 * @returns {JSX.Element} Configuración de rutas
 */
const AppRoutes = () => {
  const { t } = useTranslation();

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        
        {/* Rutas de autenticación (solo para usuarios no autenticados) */}
        <Route element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Rutas protegidas (solo para usuarios autenticados) */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-tickets" element={<MyTicketsPage />} />
          <Route path="payment-methods" element={<PaymentMethodsPage />} />
          <Route path="checkout/:eventId" element={<CheckoutPage />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
