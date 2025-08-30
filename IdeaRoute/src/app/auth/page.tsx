'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FormData, FormErrors, AuthMode } from '@/types/auth';
import { validateAuthForm } from '@/utils/auth';
import { usePasswordResetModal } from '@/components';
import styles from './Auth.module.css';

const AuthPage: React.FC = () => {
  const router = useRouter();
  const { user, loading, signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const { createModal } = usePasswordResetModal();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
   
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
  
    const validation = validateAuthForm(formData, mode === 'signup');
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({}); 
    
    try {
      if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.displayName);
      } else {
        await signIn(formData.email, formData.password);
      }
      
      
    } catch (error: unknown) {
      
      console.error('Form submission error:', error);
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

 
  const handleGoogleSignIn = async () => {
    if (isGoogleSigningIn) return;
    
    setIsGoogleSigningIn(true);
    setErrors({});
    
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      
      console.error('Google sign-in error:', error);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  
  const handlePasswordReset = async () => {
    try {
      const modal = createModal(resetPassword);
      const result = await modal.show();
      
      if (result.isConfirmed && result.email) {
        console.log('Password reset email sent successfully');
      }
    } catch (error) {
      console.error('Password reset modal error:', error);
    }
  };

 
  const toggleMode = () => {
    setMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.authIcon}>
              {mode === 'signin' ? '🔐' : '✨'}
            </span>
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'signin' 
              ? 'Sign in to access your dashboard'
              : 'Join our community and start your project now'
            }
          </p>
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSigningIn || isSubmitting}
          className={styles.googleButton}
        >
          <div className={styles.googleIcon}>
            {isGoogleSigningIn ? (
              <div className={styles.spinner}></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
          </div>
          {isGoogleSigningIn ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        
        <form onSubmit={handleSubmit} className={styles.form}>
         
          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label htmlFor="displayName" className={styles.label}>
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.displayName ? styles.error : ''}`}
                placeholder="Enter your display name"
                disabled={isSubmitting}
              />
              {errors.displayName && (
                <span className={styles.errorText}>{errors.displayName}</span>
              )}
            </div>
          )}

          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
              placeholder="Enter your email"
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

         
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.error : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
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

          
          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <div className={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${styles.input} ${styles.passwordInput} ${errors.confirmPassword ? styles.error : ''}`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                  autoComplete="new-password"
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
          )}

         
          {errors.general && (
            <div className={styles.generalError}>
              {errors.general}
            </div>
          )}

          
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <div className={styles.buttonSpinner}></div>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>

        
          {mode === 'signin' && (
            <button
              type="button"
              onClick={handlePasswordReset}
              className={styles.forgotPassword}
              disabled={isSubmitting}
            >
              Forgot your password?
            </button>
          )}
        </form>

      
        <div className={styles.footer}>
          <span>
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className={styles.toggleButton}
            disabled={isSubmitting}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;