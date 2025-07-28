'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  updateProfile,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, canUseFirestore } from '@/lib/firebase';
import { AuthContextType, AuthUser } from '@/types/auth';
import { sanitizeInput } from '@/utils/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { passwordResetEmailConfig } from '@/config/emailConfig';
import { authErrorLogger, AuthMonitoring } from '@/utils/authMonitoring';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const notifications = useNotifications();
  const createUserDocument = async (user: User, additionalData: Record<string, unknown> = {}) => {
    if (!user) return { success: false, reason: 'No user provided' };
    
    if (!canUseFirestore()) {
      return { success: false, reason: 'Database not available' };
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      const userData = {
        uid: user.uid,
        displayName: sanitizeInput(user.displayName || ''),
        email: sanitizeInput(user.email || ''),
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified || false,
        isActive: true,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData
      };

      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          ...userData,
          createdAt: serverTimestamp(),
          signUpMethod: additionalData.provider || 'email',
          loginCount: 1,
          lastSeenAt: serverTimestamp()
        });
        return { success: true, reason: 'User created' };
      } else {
        const existingData = userDoc.data();
        await setDoc(userDocRef, {
          ...userData,
          loginCount: (existingData.loginCount || 0) + 1,
          lastSeenAt: serverTimestamp(),
          createdAt: existingData.createdAt,
          signUpMethod: existingData.signUpMethod
        }, { merge: true });
        return { success: true, reason: 'User updated' };
      }
    } catch (error: any) {
      return { success: false, reason: error.message };
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user && isMounted) {
          const dbResult = await createUserDocument(result.user, {
            provider: 'google',
            authMethod: 'redirect'
          });
          
          await notifications.auth.googleSignInSuccess(
            result.user.displayName || result.user.email?.split('@')[0]
          );
        }
      } catch (error) {
        // Silent error handling for redirect
      }
    };
    
    handleRedirectResult();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!isMounted) return;
      
      if (firebaseUser) {
        let userData: Partial<AuthUser> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        };

        if (canUseFirestore()) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const firestoreData = userDoc.data();
              userData = {
                ...userData,
                ...firestoreData,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified
              };
            }
          } catch (error: any) {
            // Continue with Firebase Auth data only
          }
        }
        
        if (isMounted) {
          setUser(userData as AuthUser);
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true);
      
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
      const sanitizedDisplayName = displayName ? sanitizeInput(displayName.trim()) : '';
      
      if (!sanitizedEmail || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      try {
        const existingMethods = await fetchSignInMethodsForEmail(auth, sanitizedEmail);
        if (existingMethods.length > 0) {
          await notifications.auth.errors.emailInUse();
          throw new Error('An account with this email already exists');
        }
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          throw error;
        }
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      const user = userCredential.user;
      
      if (sanitizedDisplayName) {
        try {
          await updateProfile(user, {
            displayName: sanitizedDisplayName
          });
        } catch (profileError) {
          // Continue if profile update fails
        }
      }
      
      await createUserDocument(user, {
        displayName: sanitizedDisplayName,
        provider: 'email',
        signUpMethod: 'email',
        accountStatus: 'active'
      });
      
      await notifications.auth.signUpSuccess(
        sanitizedDisplayName || user.email?.split('@')[0] || 'New User'
      );
      
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          await notifications.auth.errors.emailInUse();
          throw new Error('An account with this email already exists');
        case 'auth/weak-password':
          await notifications.auth.errors.weakPassword();
          throw new Error('Password is too weak. Please choose a stronger password.');
        case 'auth/invalid-email':
          await notifications.auth.errors.invalidEmail();
          throw new Error('Please enter a valid email address');
        case 'auth/operation-not-allowed':
          await notifications.auth.errors.authError('Email/password accounts are not enabled');
          throw new Error('Email registration is temporarily unavailable');
        case 'auth/network-request-failed':
          await notifications.auth.errors.networkError();
          throw new Error('Network error. Please check your connection and try again.');
        case 'auth/too-many-requests':
          await notifications.auth.errors.tooManyRequests();
          throw new Error('Too many registration attempts. Please wait and try again.');
        default:
          if (error instanceof Error) {
            throw error;
          }
          await notifications.auth.errors.authError('Registration failed. Please try again.');
          throw new Error('Unable to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
      
      if (!sanitizedEmail || !password) {
        throw new Error('Email and password are required');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      
      await createUserDocument(userCredential.user, {
        lastSignInMethod: 'email',
        lastSignInAt: serverTimestamp()
      });
      
      await notifications.auth.signInSuccess(
        userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User'
      );
      
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          await notifications.auth.errors.wrongPassword();
          throw new Error('Invalid email or password');
          
        case 'auth/invalid-email':
          await notifications.auth.errors.invalidEmail();
          throw new Error('Please enter a valid email address');
          
        case 'auth/user-disabled':
          await notifications.auth.errors.authError('This account has been disabled');
          throw new Error('Account has been disabled. Please contact support.');
          
        case 'auth/too-many-requests':
          await notifications.auth.errors.tooManyRequests();
          throw new Error('Too many failed attempts. Please wait before trying again.');
          
        case 'auth/network-request-failed':
          await notifications.auth.errors.networkError();
          throw new Error('Network error. Please check your connection.');
          
        case 'auth/internal-error':
          await notifications.auth.errors.authError('Service temporarily unavailable');
          throw new Error('Service temporarily unavailable. Please try again later.');
          
        default:
          if (error instanceof Error) {
            throw error;
          }
          await notifications.auth.errors.authError('Sign in failed. Please try again.');
          throw new Error('Unable to sign in. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
        
        if (!result?.user) {
          throw new Error('No user data received from Google');
        }
        
      } catch (popupError: unknown) {
        const firebaseError = popupError as { code?: string; message?: string };
        
        if (firebaseError.code === 'auth/popup-blocked' || 
            firebaseError.code === 'auth/cancelled-popup-request') {
          await notifications.auth.errors.googlePopupBlocked();
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        
        if (firebaseError.code === 'auth/popup-closed-by-user') {
          await notifications.auth.errors.googlePopupClosed();
          throw new Error('Sign-in was cancelled');
        }
        
        throw popupError;
      }
      
      const user = result.user;
      
      await createUserDocument(user, {
        provider: 'google',
        signUpMethod: 'google',
        lastSignInMethod: 'google',
        lastSignInAt: serverTimestamp(),
        googleProfile: {
          providerId: 'google.com',
          lastSignIn: serverTimestamp()
        }
      });
      
      await notifications.auth.googleSignInSuccess(
        user.displayName || user.email?.split('@')[0] || 'User'
      );
      
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      
      switch (firebaseError.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Sign-in was cancelled');
          
        case 'auth/popup-blocked':
          await notifications.auth.errors.googlePopupBlocked();
          throw new Error('Popup was blocked. Please allow popups and try again.');
          
        case 'auth/cancelled-popup-request':
          await notifications.auth.errors.googlePopupClosed();
          throw new Error('Another sign-in is in progress. Please wait and try again.');
          
        case 'auth/account-exists-with-different-credential':
          await notifications.auth.errors.accountExistsWithDifferentCredential();
          throw new Error('An account already exists with this email using a different sign-in method.');
          
        case 'auth/operation-not-allowed':
          await notifications.auth.errors.authError('Google sign-in is not enabled');
          throw new Error('Google sign-in is temporarily unavailable.');
          
        case 'auth/auth-domain-config-required':
        case 'auth/operation-not-supported-in-this-environment':
          await notifications.auth.errors.authError('Google sign-in configuration error');
          throw new Error('Google sign-in is not properly configured.');
          
        case 'auth/unauthorized-domain':
          await notifications.auth.errors.authError('Domain not authorized for Google sign-in');
          throw new Error('This domain is not authorized for Google sign-in.');
          
        case 'auth/network-request-failed':
          await notifications.auth.errors.networkError();
          throw new Error('Network error. Please check your connection and try again.');
          
        case 'auth/too-many-requests':
          await notifications.auth.errors.tooManyRequests();
          throw new Error('Too many sign-in attempts. Please wait and try again.');
          
        case 'auth/internal-error':
          await notifications.auth.errors.authError('Service temporarily unavailable');
          throw new Error('Service temporarily unavailable. Please try again later.');
          
        default:
          if (error instanceof Error && !firebaseError.code) {
            throw error;
          }
          await notifications.auth.errors.authError('Google sign-in failed. Please try again.');
          throw new Error('Unable to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (user && canUseFirestore()) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            lastSeenAt: serverTimestamp(),
            isOnline: false
          }, { merge: true });
        } catch (error) {
          // Continue with signout even if status update fails
        }
      }
      
      notifications.auth.loading.signOut();
      
      await firebaseSignOut(auth);
      
      setUser(null);
      
      notifications.closeAlert();
      await notifications.auth.signOutSuccess();
      
    } catch (error) {
      notifications.closeAlert();
      await notifications.auth.errors.authError('Failed to sign out. Please try again.');
      throw new Error('Failed to sign out');
    }
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Use a different approach - try to get sign-in methods
      // If this throws an auth/user-not-found error, the user doesn't exist
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, sanitizedEmail);
        return signInMethods.length > 0;
      } catch (fetchError: unknown) {
        const firebaseError = fetchError as { code?: string };
        if (firebaseError.code === 'auth/user-not-found') {
          return false;
        }
        // For other errors, assume user might exist to avoid enumeration attacks
        return true;
      }
      
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      
      switch (firebaseError.code) {
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address');
        case 'auth/too-many-requests':
          throw new Error('Too many requests. Please wait a moment and try again.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection.');
        default:
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Unable to verify email at this time. Please try again.');
      }
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    const startTime = Date.now();
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        await notifications.auth.errors.invalidEmail();
        throw new Error('Please enter a valid email address');
      }

      const actionCodeSettings = {
        url: passwordResetEmailConfig.url,
        handleCodeInApp: passwordResetEmailConfig.handleCodeInApp,
      };

      await sendPasswordResetEmail(auth, sanitizedEmail, actionCodeSettings);
      
      await notifications.auth.passwordResetSent(sanitizedEmail);
      
      authErrorLogger.logAuthSuccess('password-reset-requested', undefined, {
        emailDomain: sanitizedEmail.split('@')[1]
      });
      
      AuthMonitoring.trackAuthFlow('password-reset', startTime, true);
      
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      
      authErrorLogger.logAuthError('password-reset', firebaseError, undefined, 'medium');
      AuthMonitoring.trackAuthFlow('password-reset', startTime, false);
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          await notifications.auth.passwordResetSent(sanitizedEmail);
          break;
          
        case 'auth/invalid-email':
          await notifications.auth.errors.invalidEmail();
          throw new Error('Please enter a valid email address');
          
        case 'auth/too-many-requests':
          await notifications.auth.errors.tooManyRequests();
          throw new Error('Too many password reset attempts. Please wait before trying again.');
          
        case 'auth/network-request-failed':
          await notifications.auth.errors.networkError();
          throw new Error('Network connection error. Please check your internet and try again.');
          
        case 'auth/quota-exceeded':
          await notifications.auth.errors.authError('Service temporarily unavailable. Please try again later.');
          throw new Error('Service temporarily unavailable. Please try again later.');
          
        default:
          if (error instanceof Error) {
            throw error;
          }
          await notifications.auth.errors.authError('Unable to send reset email. Please try again.');
          throw new Error('Unable to send reset email. Please try again.');
      }
    }
  };

  const updateUserProfile = async (updates: { displayName?: string; email?: string }, currentPassword?: string): Promise<void> => {
    if (!user) {
      throw new Error('No user signed in');
    }

    // Get the current Firebase Auth user to ensure we have the full Firebase User object
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    try {
      // If email is being updated, require password for re-authentication
      if (updates.email && updates.email !== currentUser.email) {
        if (!currentPassword) {
          throw new Error('Password required for email update');
        }
        
        // Re-authenticate user
        const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        // Update email
        await updateEmail(currentUser, updates.email);
      }

      // Update display name if provided
      if (updates.displayName !== undefined) {
        await updateProfile(currentUser, {
          displayName: updates.displayName
        });
      }

      // Update Firestore document if available
      if (canUseFirestore()) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const updateData: any = {
          updatedAt: serverTimestamp()
        };

        if (updates.displayName !== undefined) {
          updateData.displayName = updates.displayName;
        }
        if (updates.email) {
          updateData.email = updates.email;
        }

        await updateDoc(userDocRef, updateData);
      }

      // Update local user state by triggering auth state change
      // The onAuthStateChanged listener will update the user object
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const deleteUserAccount = async (currentPassword: string): Promise<void> => {
    if (!user) {
      throw new Error('No user signed in');
    }

    // Get the current Firebase Auth user to ensure we have the full Firebase User object
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    try {
      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete Firestore document if available
      if (canUseFirestore()) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await deleteDoc(userDocRef);
      }

      // Delete Firebase Auth user
      await deleteUser(currentUser);

      // Clear local state
      setUser(null);
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    checkUserExists,
    updateUserProfile,
    deleteUserAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
