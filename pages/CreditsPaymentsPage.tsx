// pages/CreditsPaymentsPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { creditsService } from '../services/creditsService';
import Button from '../components/Button';
import Input from '../components/Input';
import AlertDialog from '../components/AlertDialog';
import {
  CREDIT_PLANS,
  UPI_APP_ICONS,
  DEMO_APK_DOWNLOAD_URL,
  API_KEY_BILLING_DOCS_URL,
} from '../constants';
import { UpiPaymentDetails, AlertMessage, CreditPlan } from '../types';

const CreditsPaymentsPage: React.FC = () => {
  const { credits, updateCredits } = useAuth();
  const [upiId, setUpiId] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<CreditPlan | null>(null);

  const validateUpiId = (id: string) => {
    if (!id.trim()) return 'UPI ID is required.';
    if (!/^[\w.-]+@[\w.-]+$/.test(id)) return 'Invalid UPI ID format.';
    return '';
  };

  const handleBuyCreditsClick = (plan: CreditPlan) => {
    setSelectedPlan(plan);
    setUpiId(''); // Clear previous UPI ID
    setUpiIdError('');
    setAlert({
      title: `Confirm Purchase: ${plan.description}`,
      message: `You are about to purchase ${plan.credits} credits for ₹${plan.price}. Please enter your UPI ID to proceed.`,
      type: 'info',
      confirmText: 'Pay Now',
      cancelText: 'Cancel',
      onConfirm: () => { /* Handled by UPI form logic */ },
      onCancel: () => setAlert(null),
      // This alert is primarily to trigger the UPI input. Actual payment logic is in handleUpiPayment.
    });
  };

  const handleUpiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpiIdError('');

    const upiErrMsg = validateUpiId(upiId);
    if (upiErrMsg) {
      setUpiIdError(upiErrMsg);
      return;
    }

    if (!selectedPlan) {
      setAlert({
        title: 'Error',
        message: 'No credit plan selected. Please choose a plan first.',
        type: 'error',
        onConfirm: () => setAlert(null),
      });
      return;
    }

    setLoading(true);
    // Simulate UPI payment
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // In a real app, this would integrate with a UPI payment gateway.
      // For demo purposes, we simulate success.
      const response = await creditsService.addCredits(selectedPlan.credits);
      if (response.success && response.newCredits !== undefined) {
        updateCredits(response.newCredits);
        setAlert({
          title: 'Payment Successful!',
          message: `${selectedPlan.credits} credits have been added to your account. Your new balance is ${response.newCredits}.`,
          type: 'success',
          onConfirm: () => {
            setAlert(null);
            setSelectedPlan(null); // Clear selected plan
            setUpiId(''); // Clear UPI ID
          },
        });
      } else {
        setAlert({
          title: 'Payment Failed',
          message: response.message || 'An error occurred during payment.',
          type: 'error',
          onConfirm: () => setAlert(null),
        });
      }
    } catch (error) {
      setAlert({
        title: 'Payment Error',
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
        onConfirm: () => setAlert(null),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Coupon code cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const response = await creditsService.redeemCoupon(couponCode);
      if (response.success && response.newCredits !== undefined) {
        updateCredits(response.newCredits);
        setAlert({
          title: 'Coupon Redeemed!',
          message: response.message,
          type: 'success',
          onConfirm: () => setAlert(null),
        });
        setCouponCode('');
      } else {
        setAlert({
          title: 'Redemption Failed',
          message: response.message,
          type: 'error',
          onConfirm: () => setAlert(null),
        });
      }
    } catch (error) {
      setAlert({
        title: 'Redemption Error',
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
        onConfirm: () => setAlert(null),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center lg:text-left">Credits & Payments</h1>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Current Credits</h2>
        <div className="flex items-center justify-center sm:justify-start space-x-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            <span className="text-indigo-600 dark:text-indigo-400">{credits}</span> Credits
          </p>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          When your credits run out, you can purchase more using the plans below.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Buy More Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {CREDIT_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col items-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-400"
            >
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{plan.credits} Credits</h3>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">₹{plan.price}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">{plan.description}</p>
              <Button onClick={() => handleBuyCreditsClick(plan)} loading={loading} className="w-full">
                Buy Now
              </Button>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Pay for {selectedPlan.credits} Credits (₹{selectedPlan.price})
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              This is a demo integration. In a real project, this would connect to an actual UPI payment gateway.
            </p>
            <form onSubmit={handleUpiPayment} className="space-y-4">
              <Input
                id="upi-id"
                label="Your UPI ID"
                type="text"
                placeholder="e.g., yourname@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                onBlur={() => setUpiIdError(validateUpiId(upiId))}
                error={upiIdError}
                required
              />
              <div className="flex flex-wrap gap-3 items-center justify-center">
                {UPI_APP_ICONS.map((icon, index) => (
                  <img
                    key={index}
                    src={icon}
                    alt={`UPI App ${index + 1}`}
                    className="h-10 w-10 opacity-70 hover:opacity-100 transition-opacity duration-200"
                  />
                ))}
              </div>
              <Button type="submit" loading={loading} className="w-full mt-4" size="lg">
                Pay with UPI (₹{selectedPlan.price})
              </Button>
            </form>
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Redeem Coupon Code</h2>
        <form onSubmit={handleRedeemCoupon} className="space-y-4">
          <Input
            id="coupon-code"
            label="Coupon Code"
            type="text"
            placeholder="Enter your coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onBlur={() => setCouponError(couponCode.trim() ? '' : 'Coupon code cannot be empty.')}
            error={couponError}
          />
          <Button type="submit" loading={loading} className="w-full">
            Redeem Coupon
          </Button>
        </form>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Download UPI Helper APK (Demo)</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          For demo purposes, you can download a placeholder UPI Helper APK. In a real application, this would link to an actual payment helper application.
        </p>
        <a
          href={DEMO_APK_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download APK
        </a>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gemini API Key Information</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This application utilizes Google's Gemini API for image generation. For optimal performance and higher quality models like `gemini-3-pro-image-preview`, a paid API key from a Google Cloud Project is recommended.
          Ensure your API key is correctly configured in your backend environment (e.g., `process.env.API_KEY`).
        </p>
        <a
          href={API_KEY_BILLING_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 12v-1m-9.75-2.25A1.5 1.5 0 013 12m0 3.75a1.5 1.5 0 01-1.5-1.5M21 12a1.5 1.5 0 01-1.5 1.5M21 12a1.5 1.5 0 00-1.5-1.5m-9.75-3.75h.008v.008h-.008v-.008zm0 12h.008v.008h-.008v-.008z" /></svg>
          Gemini API Billing Info
        </a>
      </section>

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

export default CreditsPaymentsPage;