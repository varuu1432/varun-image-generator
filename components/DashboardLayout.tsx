// components/DashboardLayout.tsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_NAME, APP_ROUTES } from '../constants';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import AlertDialog from './AlertDialog';
import { AlertMessage } from '../types';

interface DashboardLayoutProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ toggleTheme, theme }) => {
  const { currentUser, credits, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const handleLogout = async () => {
    setAlert({
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      type: 'info',
      onConfirm: () => {
        logout();
        navigate(APP_ROUTES.LOGIN);
        setAlert(null);
      },
      onCancel: () => setAlert(null),
      confirmText: 'Logout',
      cancelText: 'Cancel',
    });
  };

  const navLinks = [
    { name: 'Generate Image', path: APP_ROUTES.GENERATE_IMAGE, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L20 16m-2-6a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ) },
    { name: 'My Gallery', path: APP_ROUTES.MY_GALLERY, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
    ) },
    { name: 'Credits & Payments', path: APP_ROUTES.CREDITS_PAYMENTS, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ) },
    { name: 'Account Settings', path: APP_ROUTES.ACCOUNT_SETTINGS, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ) },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 p-2 rounded-md lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <Link to={APP_ROUTES.GENERATE_IMAGE} className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {APP_NAME}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser && (
              <span className="hidden sm:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
                Credits left: <span className="font-bold text-indigo-600 dark:text-indigo-400">{credits}</span>
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Button onClick={handleLogout} variant="secondary" className="hidden sm:inline-flex">Logout</Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 dark:bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:flex lg:flex-col lg:shrink-0`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-700">
            <span className="text-lg font-semibold text-white">Dashboard</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info & Credits for mobile */}
          <div className="p-4 border-b border-gray-700 dark:border-gray-700 lg:hidden">
            {currentUser && (
              <>
                <p className="text-sm font-medium text-gray-300">{currentUser.email}</p>
                <p className="text-sm font-medium text-gray-300 mt-1">
                  Credits left: <span className="font-bold text-indigo-400">{credits}</span>
                </p>
              </>
            )}
          </div>

          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${location.pathname === link.path
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            <hr className="border-t border-gray-700 my-4" />
            <Button onClick={handleLogout} variant="secondary" className="w-full justify-center lg:hidden">Logout</Button>
          </nav>

          {/* User Info at bottom for desktop */}
          <div className="p-4 border-t border-gray-700 dark:border-gray-700 hidden lg:block">
            {currentUser && (
              <p className="text-sm font-medium text-gray-300 truncate">{currentUser.email}</p>
            )}
          </div>
        </aside>

        {/* Content Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {alert && (
        <AlertDialog
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={alert.onConfirm}
          onCancel={alert.onCancel}
          confirmText={alert.confirmText}
          cancelText={alert.cancelText}
        />
      )}
    </div>
  );
};

export default DashboardLayout;