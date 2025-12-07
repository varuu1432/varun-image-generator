import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import ImageGenerationPage from './pages/ImageGenerationPage';
import MyGalleryPage from './pages/MyGalleryPage';
import CreditsPaymentsPage from './pages/CreditsPaymentsPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import AuthLayout from './components/AuthLayout';
import DashboardLayout from './components/DashboardLayout';
import { APP_ROUTES } from './constants';
import LoadingSpinner from './components/LoadingSpinner';

const AuthenticatedRoute: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to={APP_ROUTES.LOGIN} replace />;
};

const App: React.FC = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches))
      ? 'dark'
      : 'light';
  });

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Unauthenticated Routes */}
          <Route path="/" element={<AuthLayout toggleTheme={toggleTheme} theme={theme} />}>
            <Route index element={<Navigate to={APP_ROUTES.LOGIN} replace />} />
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={APP_ROUTES.SIGNUP} element={<SignupPage />} />
            <Route path={APP_ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={APP_ROUTES.OTP_VERIFICATION} element={<OtpVerificationPage />} />
          </Route>

          {/* Authenticated Routes */}
          <Route path={APP_ROUTES.DASHBOARD} element={<AuthenticatedRoute><DashboardLayout toggleTheme={toggleTheme} theme={theme} /></AuthenticatedRoute>}>
            <Route index element={<Navigate to={APP_ROUTES.GENERATE_IMAGE} replace />} />
            <Route path={APP_ROUTES.GENERATE_IMAGE} element={<ImageGenerationPage />} />
            <Route path={APP_ROUTES.MY_GALLERY} element={<MyGalleryPage />} />
            <Route path={APP_ROUTES.CREDITS_PAYMENTS} element={<CreditsPaymentsPage />} />
            <Route path={APP_ROUTES.ACCOUNT_SETTINGS} element={<AccountSettingsPage />} />
          </Route>

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Navigate to={APP_ROUTES.LOGIN} replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;