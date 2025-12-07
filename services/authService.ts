// services/authService.ts
import { User } from '../types';

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  credits?: number;
}

const STORAGE_KEY_USER = 'vm_image_generator_user';
const STORAGE_KEY_CREDITS = 'vm_image_generator_credits';

const MOCK_USERS: Record<string, User & { password?: string }> = {
  'test@example.com': {
    id: 'user123',
    email: 'test@example.com',
    password: 'password123',
    joinDate: new Date().toISOString(),
  },
};

const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await simulateDelay();
    const user = MOCK_USERS[email];

    if (user && user.password === password) {
      const loggedInUser: User = { id: user.id, email: user.email, joinDate: user.joinDate };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedInUser));
      const credits = parseInt(localStorage.getItem(STORAGE_KEY_CREDITS) || '10', 10); // Default 10 credits
      return { success: true, message: 'Login successful!', user: loggedInUser, credits };
    } else {
      return { success: false, message: 'Invalid email or password.' };
    }
  },

  async signup(email: string, password: string): Promise<AuthResponse> {
    await simulateDelay();

    if (MOCK_USERS[email]) {
      return { success: false, message: 'User with this email already exists.' };
    }

    const newUser: User & { password?: string } = {
      id: `user-${Date.now()}`,
      email,
      password,
      joinDate: new Date().toISOString(),
    };
    MOCK_USERS[email] = newUser;
    const initialCredits = 10;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({ id: newUser.id, email: newUser.email, joinDate: newUser.joinDate }));
    localStorage.setItem(STORAGE_KEY_CREDITS, initialCredits.toString());
    return { success: true, message: 'Registration successful! You have 10 free credits.', user: newUser, credits: initialCredits };
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    await simulateDelay();
    if (MOCK_USERS[email]) {
      // In a real app, this would send an OTP to the user's email
      console.log(`[MOCK] OTP sent to ${email}. Use '123456' as OTP.`);
      return { success: true, message: 'OTP sent to your email address.' };
    } else {
      return { success: false, message: 'Email address not found.' };
    }
  },

  async verifyOtp(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    await simulateDelay();
    if (MOCK_USERS[email] && otp === '123456') { // Mock OTP validation
      MOCK_USERS[email].password = newPassword;
      return { success: true, message: 'Password reset successful!' };
    } else {
      return { success: false, message: 'Invalid OTP or email.' };
    }
  },

  async googleSignIn(): Promise<AuthResponse> {
    await simulateDelay(1500);
    // Simulate a successful Google sign-in.
    // In a real app, this would involve OAuth flow and getting user data from Google.
    const email = 'google_user@example.com';
    const user = MOCK_USERS[email] || {
      id: `user-${Date.now()}-google`,
      email,
      joinDate: new Date().toISOString(),
    };
    MOCK_USERS[email] = user; // Add to mock users if new
    const loggedInUser: User = { id: user.id, email: user.email, joinDate: user.joinDate };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedInUser));
    const credits = parseInt(localStorage.getItem(STORAGE_KEY_CREDITS) || '10', 10);
    return { success: true, message: 'Signed in with Google!', user: loggedInUser, credits };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_CREDITS); // Clear credits on logout
  },

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(STORAGE_KEY_USER);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  },

  getCredits(): number {
    const credits = localStorage.getItem(STORAGE_KEY_CREDITS);
    return credits ? parseInt(credits, 10) : 10; // Default 10 if not set
  },

  updateUserEmail(oldEmail: string, newEmail: string): boolean {
    if (MOCK_USERS[oldEmail]) {
      const user = MOCK_USERS[oldEmail];
      // Update in mock storage
      delete MOCK_USERS[oldEmail];
      user.email = newEmail;
      MOCK_USERS[newEmail] = user;

      // Update in local storage if it's the current logged-in user
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.email === oldEmail) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({ ...currentUser, email: newEmail }));
      }
      return true;
    }
    return false;
  },

  updateUserPassword(email: string, newPassword: string): boolean {
    if (MOCK_USERS[email]) {
      MOCK_USERS[email].password = newPassword;
      return true;
    }
    return false;
  }
};
