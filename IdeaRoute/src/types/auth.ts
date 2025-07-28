import { User as FirebaseUser } from 'firebase/auth';

export interface AuthUser extends FirebaseUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkUserExists: (email: string) => Promise<boolean>;
  updateUserProfile: (updates: { displayName?: string; email?: string }, currentPassword?: string) => Promise<void>;
  deleteUserAccount: (currentPassword: string) => Promise<void>;
}

export interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  displayName?: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
  general?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

export type AuthMode = 'signin' | 'signup';
