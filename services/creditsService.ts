// services/creditsService.ts
import { VALID_COUPONS } from '../constants';
import { Coupon } from '../types';

interface CreditUpdateResponse {
  success: boolean;
  message: string;
  newCredits?: number;
}

const STORAGE_KEY_CREDITS = 'vm_image_generator_credits';

const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const creditsService = {
  getCredits(): number {
    const credits = localStorage.getItem(STORAGE_KEY_CREDITS);
    return credits ? parseInt(credits, 10) : 10; // Default 10 credits
  },

  async deductCredit(): Promise<CreditUpdateResponse> {
    await simulateDelay(200);
    let currentCredits = this.getCredits();
    if (currentCredits > 0) {
      currentCredits--;
      localStorage.setItem(STORAGE_KEY_CREDITS, currentCredits.toString());
      return { success: true, message: 'Credit deducted successfully.', newCredits: currentCredits };
    } else {
      return { success: false, message: 'Not enough credits.' };
    }
  },

  async addCredits(amount: number): Promise<CreditUpdateResponse> {
    await simulateDelay();
    if (amount <= 0) {
      return { success: false, message: 'Amount to add must be positive.' };
    }
    let currentCredits = this.getCredits();
    currentCredits += amount;
    localStorage.setItem(STORAGE_KEY_CREDITS, currentCredits.toString());
    return { success: true, message: `${amount} credits added successfully!`, newCredits: currentCredits };
  },

  async redeemCoupon(code: string): Promise<CreditUpdateResponse> {
    await simulateDelay();
    const coupon: Coupon | undefined = VALID_COUPONS.find(c => c.code === code.toUpperCase());

    if (coupon) {
      let currentCredits = this.getCredits();
      currentCredits += coupon.bonusCredits;
      localStorage.setItem(STORAGE_KEY_CREDITS, currentCredits.toString());
      return { success: true, message: `Coupon redeemed! Added ${coupon.bonusCredits} credits.`, newCredits: currentCredits };
    } else {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
  }
};
