// pages/AccountSettingsPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import AlertDialog from '../components/AlertDialog';
import { authService } from '../services/authService';
import { AlertMessage } from '../types';

const AccountSettingsPage: React.FC = () => {
  const { currentUser, updateUserEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const [email, setEmail] = useState(currentUser?.email || '');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);

  React.useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const validateEmail = (e: string) => {
    if (!e) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(e)) return 'Email address is invalid.';
    return '';
  };

  const validatePassword = (p: string) => {
    if (!p) return 'Password is required.';
    if (p.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const validateConfirmPassword = (c: string, pRef: string) => {
    if (!c) return 'Confirm password is required.';
    if (c !== pRef) return 'Passwords do not match.';
    return '';
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    const emailErrMsg = validateEmail(email);
    if (emailErrMsg) {
      setEmailError(emailErrMsg);
      return;
    }

    if (email === currentUser?.email) {
      setAlert({
        title: 'No Change',
        message: 'The new email address is the same as your current one.',
        type: 'info',
        onConfirm: () => setAlert(null),
      });
      return;
    }

    setLoading(true);
    try {
      if (currentUser && authService.updateUserEmail(currentUser.email, email)) {
        updateUserEmail(email); // Update context
        setAlert({
          title: 'Email Updated',
          message: 'Your email address has been successfully updated.',
          type: 'success',
          onConfirm: () => setAlert(null),
        });
      } else {
        setAlert({
          title: 'Update Failed',
          message: 'Failed to update email. Email might be in use or an error occurred.',
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmPasswordError('');

    const passwordErrMsg = validatePassword(password);
    const confirmPasswordErrMsg = validateConfirmPassword(confirmPassword, password);

    if (passwordErrMsg || confirmPasswordErrMsg) {
      setPasswordError(passwordErrMsg);
      setConfirmPasswordError(confirmPasswordErrMsg);
      return;
    }

    setLoading(true);
    try {
      if (currentUser && authService.updateUserPassword(currentUser.email, password)) {
        setAlert({
          title: 'Password Updated',
          message: 'Your password has been successfully updated. Please log in with your new password next time.',
          type: 'success',
          onConfirm: () => {
            setAlert(null);
            setPassword('');
            setConfirmPassword('');
          },
        });
      } else {
        setAlert({
          title: 'Update Failed',
          message: 'Failed to update password. Please try again.',
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

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <p className="text-xl text-gray-700 dark:text-gray-300">Please log in to view account settings.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center lg:text-left">Account Settings</h1>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Information</h2>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Member Since:</strong> {new Date(currentUser.joinDate).toLocaleDateString()}</p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Change Email</h2>
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <Input
            id="current-email"
            label="Current Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailError(validateEmail(email))}
            error={emailError}
            required
            disabled={loading}
          />
          <Button type="submit" loading={loading} className="w-full">
            Update Email
          </Button>
        </form>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            id="new-password"
            label="New Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordError(validatePassword(password))}
            error={passwordError}
            required
            disabled={loading}
          />
          <Input
            id="confirm-new-password"
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setConfirmPasswordError(validateConfirmPassword(confirmPassword, password))}
            error={confirmPasswordError}
            required
            disabled={loading}
          />
          <Button type="submit" loading={loading} className="w-full">
            Update Password
          </Button>
        </form>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
        <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700">
          <span className="text-lg text-gray-700 dark:text-gray-300">Email Notifications for Credit Usage</span>
          <label htmlFor="email-notifications" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="email-notifications"
                className="sr-only"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                disabled={loading}
              />
              <div className="block bg-gray-300 dark:bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${emailNotifications ? 'translate-x-6 bg-indigo-600' : ''}`}></div>
            </div>
          </label>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Toggle to receive email notifications when your credits are low or topped up.
        </p>
      </section>

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

export default AccountSettingsPage;