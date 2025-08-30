'use client';

import Swal from 'sweetalert2';


export const useNotifications = () => {
  
  const baseConfig = {
    confirmButtonColor: '#667eea',
    cancelButtonColor: '#e53e3e',
    background: '#1f1f1f',
    color: '#f8f8f8',
    customClass: {
      popup: 'swal2-responsive-popup',
      title: 'swal2-responsive-title',
      content: 'swal2-responsive-content',
      confirmButton: 'swal2-responsive-button',
      cancelButton: 'swal2-responsive-button'
    },
    backdrop: 'rgba(0, 0, 0, 0.8)',
    allowOutsideClick: true,
    allowEscapeKey: true,
    showCloseButton: true,
    timer: undefined, 
    timerProgressBar: false,
    width: '90%',
    padding: '1.5rem'
  };

  
  const showSuccess = (title: string, message?: string, autoClose = true) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title,
      text: message,
      timer: autoClose ? 3000 : undefined,
      timerProgressBar: autoClose,
      showConfirmButton: !autoClose,
      confirmButtonText: 'Continue',
      customClass: {
        ...baseConfig.customClass,
        icon: 'swal2-success-icon'
      }
    });
  };


  const showError = (title: string, message?: string, showRetry = false) => {
    const config = {
      ...baseConfig,
      icon: 'error' as const,
      title,
      text: message,
      showConfirmButton: true,
      confirmButtonText: showRetry ? 'Try Again' : 'OK',
      customClass: {
        ...baseConfig.customClass,
        icon: 'swal2-error-icon'
      }
    };

    return Swal.fire(config);
  };

  
  const showWarning = (title: string, message?: string) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title,
      text: message,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      customClass: {
        ...baseConfig.customClass,
        icon: 'swal2-warning-icon'
      }
    });
  };

 
  const showInfo = (title: string, message?: string, autoClose = true) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'info',
      title,
      text: message,
      timer: autoClose ? 4000 : undefined,
      timerProgressBar: autoClose,
      showConfirmButton: !autoClose,
      confirmButtonText: 'Got it',
      customClass: {
        ...baseConfig.customClass,
        icon: 'swal2-info-icon'
      }
    });
  };

  
  const showLoading = (title: string, message?: string) => {
    return Swal.fire({
      ...baseConfig,
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showCloseButton: false,
      backdrop: 'rgba(0, 0, 0, 0.8)',
      background: '#1f1f1f',
      color: '#f8f8f8',
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        ...baseConfig.customClass,
        popup: 'swal2-loading-popup swal2-responsive-popup',
        title: 'swal2-responsive-title',
        htmlContainer: 'swal2-responsive-content'
      }
    });
  };


  const showConfirmation = (
    title: string,
    message?: string,
    confirmText = 'Yes',
    cancelText = 'No'
  ) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      customClass: {
        ...baseConfig.customClass,
        icon: 'swal2-question-icon'
      }
    });
  };


  const closeAlert = () => {
    Swal.close();
  };

  
  const auth = {
   
    signUpSuccess: (name?: string) => showSuccess(
      'Welcome aboard! 🎉',
      name 
        ? `Welcome ${name}! Your account has been created successfully.`
        : 'Your account has been created successfully. Welcome to our community!',
      true
    ),

   
    signInSuccess: (name?: string) => showSuccess(
      'Welcome back! 👋',
      name 
        ? `Hello ${name}! You've been signed in successfully.`
        : 'You\'ve been signed in successfully.',
      true
    ),

   
    googleSignInSuccess: (name?: string) => showSuccess(
      'Google Sign-in Successful! ✨',
      name 
        ? `Welcome ${name}! You've been signed in with Google.`
        : 'You\'ve been successfully signed in with Google.',
      true
    ),

    
    passwordResetSent: (email: string) => showInfo(
      'Password Reset Email Sent 📧',
      `We've sent a password reset link to ${email}. Please check your inbox (and spam folder) and click the link to reset your password. The link will expire in 1 hour for security.`,
      false
    ),

   
    signOutSuccess: () => showSuccess(
      'Signed Out Successfully 👋',
      'You have been safely signed out. See you soon!',
      true
    ),

    
    errors: {
      
      emailInUse: () => showError(
        'Email Already Registered 📧',
        'An account with this email already exists. Try signing in instead or use a different email.',
        true
      ),

      
      invalidEmail: () => showError(
        'Invalid Email Address ❌',
        'Please enter a valid email address and try again.',
        true
      ),

      
      weakPassword: () => showError(
        'Password Too Weak 🔒',
        'Your password should be at least 6 characters long with a mix of letters, numbers, and symbols.',
        true
      ),

      // Wrong password
      wrongPassword: () => showError(
        'Incorrect Password ❌',
        'The password you entered is incorrect. Please try again or reset your password.',
        true
      ),

      
      userNotFound: () => showError(
        'Account Not Found 👤',
        'No account found with this email. Please check your email or create a new account.',
        true
      ),

      
      googlePopupClosed: () => showWarning(
        'Sign-in Cancelled 🚫',
        'Google sign-in was cancelled. Click "Continue with Google" to try again.'
      ),

     
      googlePopupBlocked: () => showWarning(
        'Popup Blocked 🚫',
        'Your browser blocked the Google sign-in popup. We\'ll redirect you to Google instead.'
      ),

      
      accountExistsWithDifferentCredential: () => showError(
        'Account Already Exists 🔄',
        'An account with this email already exists using a different sign-in method. Try signing in with email/password instead.',
        true
      ),

      
      tooManyRequests: () => showError(
        'Too Many Attempts 🚫',
        'Too many failed attempts. Please wait a few minutes before trying again.',
        false
      ),

     
      networkError: () => showError(
        'Connection Error 🌐',
        'Unable to connect to our servers. Please check your internet connection and try again.',
        true
      ),

     
      authError: (message?: string) => showError(
        'Authentication Error ❌',
        message || 'Something went wrong during authentication. Please try again.',
        true
      )
    },

    
    loading: {
      signIn: () => showLoading(
        'Signing In...',
        'Please wait while we sign you in.'
      ),

      signUp: () => showLoading(
        'Creating Account...',
        'Please wait while we create your account.'
      ),

      googleAuth: () => showLoading(
        'Connecting to Google...',
        'Please wait while we connect to Google.'
      ),

      passwordReset: () => showLoading(
        'Sending Reset Email...',
        'Please wait while we send the password reset email.'
      ),

      signOut: () => showLoading(
        'Signing Out...',
        'Please wait while we sign you out safely.'
      )
    }
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showConfirmation,
    closeAlert,
    auth
  };
};

export default useNotifications;
