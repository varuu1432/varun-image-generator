// pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import AlertDialog from '../components/AlertDialog';
import { APP_ROUTES } from '../constants';
import { authService } from '../services/authService';
import { AlertMessage } from '../types';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email address is invalid.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const emailErrMsg = validateEmail(email);
    if (emailErrMsg) {
      setEmailError(emailErrMsg);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setAlert({
          title: 'OTP Sent',
          message: 'A one-time password has been sent to your email. Please check your inbox.',
          type: 'success',
          onConfirm: () => {
            setAlert(null);
            navigate(APP_ROUTES.OTP_VERIFICATION, { state: { email } });
          },
        });
      } else {
        setAlert({
          title: 'Error',
          message: response.message,
          type: 'error',
          onConfirm: () => setAlert(null),
        });
      }
    } catch (error) {
      setAlert({
        title: 'Error',
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
        onConfirm: () => setAlert(null),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Forgot Password</h2>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Enter your email address to receive a one-time password (OTP) to reset your password.
      </p>
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
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Send OTP
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password?{' '}
        <Link to={APP_ROUTES.LOGIN} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Login
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

export default ForgotPasswordPage;