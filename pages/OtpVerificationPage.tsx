// pages/OtpVerificationPage.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import AlertDialog from '../components/AlertDialog';
import { APP_ROUTES } from '../constants';
import { authService } from '../services/authService';
import { AlertMessage } from '../types';

const OtpVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  React.useEffect(() => {
    if (!email) {
      // If email is not passed via state, redirect to forgot password page
      navigate(APP_ROUTES.FORGOT_PASSWORD, { replace: true });
    }
  }, [email, navigate]);

  const validateOtp = (otp: string) => {
    if (!otp) return 'OTP is required.';
    if (!/^\d{6}$/.test(otp)) return 'OTP must be 6 digits.';
    return '';
  };

  const validateNewPassword = (password: string) => {
    if (!password) return 'New password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const validateConfirmNewPassword = (confirmPassword: string, passwordRef: string) => {
    if (!confirmPassword) return 'Confirm new password is required.';
    if (confirmPassword !== passwordRef) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');

    const otpErrMsg = validateOtp(otp);
    const newPasswordErrMsg = validateNewPassword(newPassword);
    const confirmNewPasswordErrMsg = validateConfirmNewPassword(confirmNewPassword, newPassword);

    if (otpErrMsg || newPasswordErrMsg || confirmNewPasswordErrMsg) {
      setOtpError(otpErrMsg);
      setNewPasswordError(newPasswordErrMsg);
      setConfirmNewPasswordError(confirmNewPasswordErrMsg);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOtp(email, otp, newPassword);
      if (response.success) {
        setAlert({
          title: 'Success!',
          message: 'Your password has been reset successfully. Please log in with your new password.',
          type: 'success',
          onConfirm: () => {
            setAlert(null);
            navigate(APP_ROUTES.LOGIN);
          },
        });
      } else {
        setAlert({
          title: 'Verification Failed',
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
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Verify OTP & Reset Password</h2>
      <p className="text-center text-gray-600 dark:text-gray-400">
        An OTP has been sent to <span className="font-semibold text-indigo-600 dark:text-indigo-400">{email}</span>. Please enter it below along with your new password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="otp"
          label="One-Time Password (OTP)"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          onBlur={() => setOtpError(validateOtp(otp))}
          error={otpError}
          placeholder="e.g., 123456"
          required
        />
        <Input
          id="newPassword"
          label="New Password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onBlur={() => setNewPasswordError(validateNewPassword(newPassword))}
          error={newPasswordError}
          required
        />
        <Input
          id="confirmNewPassword"
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          onBlur={() => setConfirmNewPasswordError(validateConfirmNewPassword(confirmNewPassword, newPassword))}
          error={confirmNewPasswordError}
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <Link to={APP_ROUTES.LOGIN} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Back to Login
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

export default OtpVerificationPage;