// constants.ts
import { ImageSize, ImageStyle, ModelType, CreditPlan, Coupon } from './types';

export const APP_NAME = "VM Image Generator";
export const MAX_FREE_CREDITS = 10;
export const INITIAL_DEMO_IMAGES_COUNT = 3; // Number of static demo images

export const APP_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  OTP_VERIFICATION: '/otp-verification',
  DASHBOARD: '/dashboard',
  GENERATE_IMAGE: '/dashboard/generate-image',
  MY_GALLERY: '/dashboard/my-gallery',
  CREDITS_PAYMENTS: '/dashboard/credits-payments',
  ACCOUNT_SETTINGS: '/dashboard/account-settings',
  LOGOUT: '/logout', // Not a real route, but a logical path
};

export const IMAGE_SIZES: { value: ImageSize, label: string }[] = [
  { value: ImageSize.DEFAULT, label: 'Default' }, // Corresponds to gemini-2.5-flash-image default output
  { value: ImageSize['1K'], label: '1024x1024 (1K)' }, // For gemini-3-pro-image-preview
  { value: ImageSize['2K'], label: '2048x2048 (2K)' }, // For gemini-3-pro-image-preview
  { value: ImageSize['4K'], label: '4096x4096 (4K)' }, // For gemini-3-pro-image-preview
];

export const IMAGE_STYLES: { value: ImageStyle, label: string }[] = [
  { value: ImageStyle.DEFAULT, label: 'Default' },
  { value: ImageStyle.REALISTIC, label: 'Realistic' },
  { value: ImageStyle.CARTOON, label: 'Cartoon' },
  { value: ImageStyle['3D'], label: '3D Render' },
  { value: ImageStyle.ABSTRACT, label: 'Abstract' },
  { value: ImageStyle.PHOTOGRAPHIC, label: 'Photographic' },
  { value: ImageStyle.IMPRESSIONISTIC, label: 'Impressionistic' },
];

export const MODEL_TYPES: { value: ModelType, label: string }[] = [
  { value: ModelType.GEMINI_FLASH, label: 'Gemini Flash (Standard)' },
  { value: ModelType.GEMINI_PRO_IMAGE, label: 'Gemini Pro Image (High Quality)' },
];

export const NUMBER_OF_IMAGES_OPTIONS: number[] = [1, 2, 3, 4];

export const UPI_APP_ICONS: string[] = [
  'https://www.vectorlogo.zone/logos/phonepe/phonepe-icon.svg',
  'https://www.vectorlogo.zone/logos/google_pay/google_pay-icon.svg',
  'https://www.vectorlogo.zone/logos/paytm/paytm-icon.svg',
  'https://www.vectorlogo.zone/logos/bhimupi/bhimupi-icon.svg',
];

export const CREDIT_PLANS: CreditPlan[] = [
  { id: 'plan-20', credits: 20, price: 10, description: 'Get 20 image generation credits.' },
  { id: 'plan-50', credits: 50, price: 20, description: 'Get 50 image generation credits and save 20%!' },
  { id: 'plan-100', credits: 100, price: 35, description: 'Get 100 image generation credits and save 30%!' },
];

export const VALID_COUPONS: Coupon[] = [
  { code: 'WELCOME10', bonusCredits: 10 },
  { code: 'MEGA25', bonusCredits: 25 },
];

export const DEMO_APK_DOWNLOAD_URL = 'https://example.com/demo-upi-helper.apk'; // Placeholder URL

export const API_KEY_BILLING_DOCS_URL = 'https://ai.google.dev/gemini-api/docs/billing';
