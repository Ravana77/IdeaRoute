'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { validateEmail, sanitizeInput } from '@/utils/auth';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import Swal from 'sweetalert2';
import styles from './ProfileSettings.module.css';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  general?: string;
}

const ProfileSettings: React.FC = () => {
  const { user, updateUserProfile, deleteUserAccount } = useAuth();
  const notifications = useNotifications();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [originalData, setOriginalData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const initialData = {
        firstName,
        lastName,
        email: user.email || ''
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 30) {
      newErrors.firstName = 'First name must be less than 30 characters';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 30) {
      newErrors.lastName = 'Last name must be less than 30 characters';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: sanitizeInput(value)
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      await notifications.showError(
        'Validation Error',
        'Please fix the errors above and try again.'
      );
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const newDisplayName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const emailChanged = formData.email !== originalData.email;

      // Show loading notification
      notifications.showLoading(
        'Updating Profile',
        'Please wait while we save your changes...'
      );

      let currentPassword: string | undefined;

      // If email changed, get password confirmation
      if (emailChanged) {
        const result = await Swal.fire({
          title: 'Confirm Password',
          text: 'To change your email, please enter your current password for security:',
          input: 'password',
          inputAttributes: {
            autocomplete: 'current-password'
          },
          showCancelButton: true,
          confirmButtonText: 'Update Email',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#667eea',
          cancelButtonColor: '#e53e3e',
          customClass: {
            popup: 'swal2-responsive-popup',
            title: 'swal2-responsive-title',
            htmlContainer: 'swal2-responsive-content',
            confirmButton: 'swal2-responsive-button',
            cancelButton: 'swal2-responsive-button'
          }
        });

        if (result.isConfirmed && result.value) {
          currentPassword = result.value;
        } else {
          // User cancelled, revert email change
          setFormData(prev => ({ ...prev, email: originalData.email }));
          notifications.closeAlert();
          return;
        }
      }

      // Use the centralized update method
      await updateUserProfile({
        displayName: newDisplayName,
        email: emailChanged ? formData.email : undefined
      }, currentPassword);

      // Update original data to reflect saved state
      setOriginalData({ ...formData });
      
      notifications.closeAlert();
      await notifications.showSuccess(
        'Profile Updated!',
        'Your profile information has been successfully updated.'
      );

    } catch (error: any) {
      notifications.closeAlert();
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use by another account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security reasons, please sign out and sign back in before changing your email.';
      }
      
      await notifications.showError('Update Failed', errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // First confirmation
      const firstConfirm = await Swal.fire({
        title: '⚠️ Delete Account?',
        text: 'This action cannot be undone. All your data will be permanently deleted.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#374151',
        customClass: {
          popup: 'swal2-responsive-popup',
          title: 'swal2-responsive-title',
          htmlContainer: 'swal2-responsive-content',
          confirmButton: 'swal2-responsive-button',
          cancelButton: 'swal2-responsive-button'
        }
      });

      if (!firstConfirm.isConfirmed) return;

      // Second confirmation with password
      const passwordConfirm = await Swal.fire({
        title: 'Confirm Account Deletion',
        html: `
          <p style="margin-bottom: 1rem;">To permanently delete your account, please:</p>
          <ol style="text-align: left; margin-bottom: 1rem;">
            <li>Enter your current password</li>
            <li>Type "DELETE" to confirm</li>
          </ol>
        `,
        input: 'password',
        inputAttributes: {
          autocomplete: 'current-password',
          placeholder: 'Enter your password'
        },
        showCancelButton: true,
        confirmButtonText: 'Delete Account',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#374151',
        customClass: {
          popup: 'swal2-responsive-popup',
          title: 'swal2-responsive-title',
          htmlContainer: 'swal2-responsive-content',
          confirmButton: 'swal2-responsive-button',
          cancelButton: 'swal2-responsive-button'
        },
        preConfirm: (password) => {
          if (!password) {
            Swal.showValidationMessage('Password is required');
            return false;
          }
          return password;
        }
      });

      if (!passwordConfirm.isConfirmed) return;

      // Final confirmation with typing "DELETE"
      const finalConfirm = await Swal.fire({
        title: 'Final Confirmation',
        text: 'Type "DELETE" to permanently delete your account:',
        input: 'text',
        inputAttributes: {
          placeholder: 'Type DELETE'
        },
        showCancelButton: true,
        confirmButtonText: 'Delete My Account',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#374151',
        customClass: {
          popup: 'swal2-responsive-popup',
          title: 'swal2-responsive-title',
          htmlContainer: 'swal2-responsive-content',
          confirmButton: 'swal2-responsive-button',
          cancelButton: 'swal2-responsive-button'
        },
        preConfirm: (confirmation) => {
          if (confirmation !== 'DELETE') {
            Swal.showValidationMessage('Please type "DELETE" exactly');
            return false;
          }
          return true;
        }
      });

      if (!finalConfirm.isConfirmed) return;

      // Show deleting progress
      notifications.showLoading(
        'Deleting Account',
        'Please wait while we delete your account and all associated data...'
      );

      // Use the centralized delete method
      await deleteUserAccount(passwordConfirm.value);

      notifications.closeAlert();
      
      // Show success and redirect
      await Swal.fire({
        title: 'Account Deleted',
        text: 'Your account has been permanently deleted. We\'re sorry to see you go.',
        icon: 'success',
        confirmButtonText: 'Goodbye',
        confirmButtonColor: '#667eea',
        customClass: {
          popup: 'swal2-responsive-popup',
          title: 'swal2-responsive-title',
          htmlContainer: 'swal2-responsive-content',
          confirmButton: 'swal2-responsive-button'
        }
      });

      // Redirect to home page
      window.location.href = '/';

    } catch (error: any) {
      notifications.closeAlert();
      console.error('Error deleting account:', error);
      
      let errorMessage = 'Failed to delete account. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security reasons, please sign out and sign back in before deleting your account.';
      }
      
      await notifications.showError('Deletion Failed', errorMessage);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          {user.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt="Profile" 
              className={styles.avatar}
              width={80}
              height={80}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
            </div>
          )}
          <div className={styles.avatarInfo}>
            <h2 className={styles.currentName}>
              {user.displayName || 'User'}
            </h2>
            <p className={styles.currentEmail}>{user.email}</p>
            {user.emailVerified && (
              <span className={styles.verifiedBadge}>✓ Verified</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.settingsGrid}>
        {/* Profile Information Card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Profile Information</h3>
            <p className={styles.cardDescription}>
              Update your personal information and email address
            </p>
          </div>

          <div className={styles.cardContent}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName" className={styles.label}>
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                    placeholder="Enter your first name"
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <span className={styles.errorText}>{errors.firstName}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="lastName" className={styles.label}>
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                    placeholder="Enter your last name"
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <span className={styles.errorText}>{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
                {formData.email !== originalData.email && (
                  <p className={styles.warningText}>
                    ⚠️ Changing your email will require password confirmation
                  </p>
                )}
              </div>

              {errors.general && (
                <div className={styles.generalError}>{errors.general}</div>
              )}
            </form>
          </div>

          <div className={styles.cardFooter}>
            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={!hasChanges || isLoading}
              isLoading={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {hasChanges && (
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...originalData });
                  setErrors({});
                }}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Security Card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Account Security</h3>
            <p className={styles.cardDescription}>
              Manage your account security and data
            </p>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.securityItem}>
              <div className={styles.securityIcon}>🔒</div>
              <div className={styles.securityContent}>
                <h4 className={styles.securityTitle}>Password</h4>
                <p className={styles.securityDescription}>
                  Change your password to keep your account secure
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Navigate to password reset
                  window.location.href = '/reset-password';
                }}
              >
                Change Password
              </Button>
            </div>

            <div className={styles.securityItem}>
              <div className={styles.securityIcon}>📧</div>
              <div className={styles.securityContent}>
                <h4 className={styles.securityTitle}>Email Verification</h4>
                <p className={styles.securityDescription}>
                  {user.emailVerified 
                    ? 'Your email is verified' 
                    : 'Verify your email for better security'
                  }
                </p>
              </div>
              {user.emailVerified ? (
                <span className={styles.verifiedStatus}>✓ Verified</span>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement email verification resend
                    notifications.showInfo('Email Verification', 'Feature coming soon!');
                  }}
                >
                  Verify Email
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className={`${styles.settingsCard} ${styles.dangerCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Danger Zone</h3>
            <p className={styles.cardDescription}>
              Irreversible and destructive actions
            </p>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.dangerItem}>
              <div className={styles.dangerContent}>
                <h4 className={styles.dangerTitle}>Delete Account</h4>
                <p className={styles.dangerDescription}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
