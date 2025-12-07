// pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import AlertDialog from '../components/AlertDialog';
import { APP_ROUTES } from '../constants';
import { AlertMessage } from '../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email address is invalid.';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    const emailErrMsg = validateEmail(email);
    const passwordErrMsg = validatePassword(password);

    if (emailErrMsg || passwordErrMsg) {
      setEmailError(emailErrMsg);
      setPasswordError(passwordErrMsg);
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate(APP_ROUTES.GENERATE_IMAGE);
      } else {
        setAlert({
          title: 'Login Failed',
          message: 'Invalid email or password. Please try again.',
          type: 'error',
          onConfirm: () => setAlert(null),
        });
      }
    } catch (error) {
      setAlert({
        title: 'Login Error',
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
        onConfirm: () => setAlert(null),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Mock Google sign-in. In a real app, this would redirect to Google's OAuth flow.
      // After successful OAuth, your backend would verify the token and return user data.
      const mockGoogleLogin = (await import('../services/authService')).authService.googleSignIn;
      const response = await mockGoogleLogin();
      if (response.success && response.user && response.credits !== undefined) {
        const authService = (await import('../services/authService')).authService;
        await authService.login(response.user.email, 'any_mock_password_for_google'); // Simulate login using the mock google user
        navigate(APP_ROUTES.GENERATE_IMAGE);
      } else {
        setAlert({
          title: 'Google Sign-in Failed',
          message: response.message || 'Could not sign in with Google.',
          type: 'error',
          onConfirm: () => setAlert(null),
        });
      }
    } catch (error) {
      setAlert({
        title: 'Google Sign-in Error',
        message: `An error occurred during Google sign-in: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
        onConfirm: () => setAlert(null),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Login to your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailError(validateEmail(email))}
          error={emailError}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordError(validatePassword(password))}
          error={passwordError}
          required
        />
        <div className="flex items-center justify-between">
          <Link to={APP_ROUTES.FORGOT_PASSWORD} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign In
        </Button>
      </form>

      <div className="relative flex justify-center text-sm">
        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
          Or continue with
        </span>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200 dark:bg-gray-700 -z-10"></div>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogleSignIn}
        loading={loading}
        className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400"
        size="lg"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google logo" className="h-6 w-6" />
        <span>Sign in with Google</span>
      </Button>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to={APP_ROUTES.SIGNUP} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Sign up
        </Link>
      </p>

      {alert && (
        <AlertDialog
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={alert.onConfirm}
        />
      )}
    </div>
  );
};

export default LoginPage;