// pages/SignupPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import AlertDialog from '../components/AlertDialog';
import { APP_ROUTES } from '../constants';
import { AlertMessage } from '../types';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email address is invalid.';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, passwordRef: string) => {
    if (!confirmPassword) return 'Confirm password is required.';
    if (confirmPassword !== passwordRef) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    const emailErrMsg = validateEmail(email);
    const passwordErrMsg = validatePassword(password);
    const confirmPasswordErrMsg = validateConfirmPassword(confirmPassword, password);

    if (emailErrMsg || passwordErrMsg || confirmPasswordErrMsg) {
      setEmailError(emailErrMsg);
      setPasswordError(passwordErrMsg);
      setConfirmPasswordError(confirmPasswordErrMsg);
      return;
    }

    setLoading(true);
    try {
      const success = await signup(email, password);
      if (success) {
        setAlert({
          title: 'Sign Up Successful!',
          message: 'Your account has been created. You have 10 free credits. Please log in.',
          type: 'success',
          onConfirm: () => {
            setAlert(null);
            navigate(APP_ROUTES.LOGIN);
          },
        });
      } else {
        setAlert({
          title: 'Sign Up Failed',
          message: 'Account creation failed. This email might already be registered.',
          type: 'error',
          onConfirm: () => setAlert(null),
        });
      }
    } catch (error) {
      setAlert({
        title: 'Sign Up Error',
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
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Create your account</h2>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordError(validatePassword(password))}
          error={passwordError}
          required
        />
        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setConfirmPasswordError(validateConfirmPassword(confirmPassword, password))}
          error={confirmPasswordError}
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
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

export default SignupPage;