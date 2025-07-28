'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNotifications } from '@/hooks/useNotifications';
import { validatePassword } from '@/utils/auth';
import styles from '../auth/Auth.module.css';

const ResetPasswordContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notifications = useNotifications();
  
  const [actionCode, setActionCode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Verify the reset code when component mounts
  useEffect(() => {
    const verifyCode = async () => {
      const oobCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');
      
      if (!oobCode || mode !== 'resetPassword') {
        await notifications.showError(
          'Invalid Reset Link',
          'This password reset link is invalid or has expired. Please request a new one.'
        );
        router.push('/auth');
        return;
      }

      try {
        setActionCode(oobCode);
        
        // Verify the code and get associated email
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setIsValidCode(true);
        
      } catch (error: unknown) {
        console.error('Error verifying reset code:', error);
        
        const firebaseError = error as { code?: string };
        let errorMessage = 'This password reset link is invalid or has expired.';
        
        switch (firebaseError.code) {
          case 'auth/expired-action-code':
            errorMessage = 'This password reset link has expired. Please request a new one.';
            break;
          case 'auth/invalid-action-code':
            errorMessage = 'This password reset link is invalid. Please request a new one.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found for this reset link. The account may have been deleted.';
            break;
        }
        
        await notifications.showError('Invalid Reset Link', errorMessage);
        router.push('/auth');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [searchParams, notifications, router]);

  /**
   * Handle input changes with real-time validation
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'newPassword') {
      setNewPassword(value);
      
      // Clear password error when user starts typing
      if (errors.password) {
        setErrors(prev => ({ ...prev, password: undefined }));
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
      
      // Clear confirm password error when user starts typing
      if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  /**
   * Handle password reset form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validate passwords
    const passwordValidation = validatePassword(newPassword);
    const newErrors: typeof errors = {};
    
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Reset the password using Firebase
      await confirmPasswordReset(auth, actionCode, newPassword);
      
      // Show success notification
      await notifications.showSuccess(
        'Password Reset Successfully! 🎉',
        'Your password has been updated. You can now sign in with your new password.',
        false
      );
      
      // Redirect to sign-in page
      router.push('/auth');
      
    } catch (error: unknown) {
      console.error('Error resetting password:', error);
      
      const firebaseError = error as { code?: string };
      let errorMessage = 'Failed to reset password. Please try again.';
      
      switch (firebaseError.code) {
        case 'auth/expired-action-code':
          errorMessage = 'This password reset link has expired. Please request a new one.';
          break;
        case 'auth/invalid-action-code':
          errorMessage = 'This password reset link is invalid. Please request a new one.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Please choose a stronger password.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found. The account may have been deleted.';
          break;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while verifying code
  if (isVerifying) {
    return (
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <h2>Verifying reset link...</h2>
            <p>Please wait while we verify your password reset link.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if code is invalid
  if (!isValidCode) {
    return (
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>Invalid Reset Link</h1>
            <p className={styles.subtitle}>
              This password reset link is invalid or has expired.
            </p>
          </div>
          <button
            onClick={() => router.push('/auth')}
            className={styles.submitButton}
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset Your Password</h1>
          <p className={styles.subtitle}>
            Enter your new password for <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* New Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.error : ''}`}
                placeholder="Enter your new password"
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
                disabled={isSubmitting}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          {/* Confirm New Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm New Password
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${styles.passwordInput} ${errors.confirmPassword ? styles.error : ''}`}
                placeholder="Confirm your new password"
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.passwordToggle}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className={styles.generalError}>
              {errors.general}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <div className={styles.buttonSpinner}></div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Back to Sign In */}
        <div className={styles.footer}>
          <button
            type="button"
            onClick={() => router.push('/auth')}
            className={styles.toggleButton}
            disabled={isSubmitting}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <h2>Loading...</h2>
            <p>Please wait while we load the password reset page.</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
