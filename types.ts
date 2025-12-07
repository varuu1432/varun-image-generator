// types.ts

export interface User {
  id: string;
  email: string;
  joinDate: string;
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  credits: number;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCredits: (newCredits: number) => void;
  updateUserEmail: (newEmail: string) => void;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: string;
  savedToGallery: boolean;
  imageSize: string;
  imageStyle: string;
  model: string;
}

export interface ImageConfig {
  imageSize: ImageSize;
  imageStyle: ImageStyle;
  numberOfImages: number;
  model: ModelType;
}

export enum ImageSize {
  '1K' = '1K',
  '2K' = '2K',
  '4K' = '4K',
  'DEFAULT' = 'DEFAULT', // For gemini-2.5-flash-image which doesn't specify K sizes
}

export enum ImageStyle {
  REALISTIC = 'Realistic',
  CARTOON = 'Cartoon',
  '3D' = '3D Render',
  ABSTRACT = 'Abstract',
  PHOTOGRAPHIC = 'Photographic',
  IMPRESSIONISTIC = 'Impressionistic',
  FANTASY = 'Fantasy', // Added FANTASY style
  DEFAULT = 'Default',
}

export enum ModelType {
  GEMINI_FLASH = 'gemini-2.5-flash-image', // General purpose, lower quality
  GEMINI_PRO_IMAGE = 'gemini-3-pro-image-preview', // High quality, 1K/2K/4K
}

export interface UpiPaymentDetails {
  upiId: string;
  amount: number;
  planName: string;
}

export interface CreditPlan {
  id: string;
  credits: number;
  price: number;
  description: string;
}

export interface Coupon {
  code: string;
  bonusCredits: number;
}

export interface AlertMessage {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}