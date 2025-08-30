'use client';

import Swal from 'sweetalert2';
import { validateEmail } from '@/utils/auth';

interface PasswordResetModalResult {
  isConfirmed: boolean;
  email?: string;
}

interface PasswordResetModalOptions {
  onPasswordReset: (email: string) => Promise<void>;
  onCheckUserExists?: (email: string) => Promise<boolean>;
}

export class PasswordResetModal {
  private cooldownTimers = new Map<string, number>();
  private options: PasswordResetModalOptions;

  constructor(options: PasswordResetModalOptions) {
    this.options = options;
  }

  
  public async show(): Promise<PasswordResetModalResult> {
    let email = '';
    let isValidEmail = false;
    let isLoading = false;
    let successMessage = '';
    let cooldownTime = 0;

    const result = await Swal.fire({
      title: '🔐 Reset Your Password',
      html: this.getModalHTML('', false, false, '', '', 0),
      showCancelButton: true,
      confirmButtonText: 'Send Reset Link',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: true,
      showLoaderOnConfirm: false,
      width: '400px',
      padding: '2rem',
      customClass: {
        popup: 'password-reset-modal',
        title: 'password-reset-title',
        htmlContainer: 'password-reset-content',
        confirmButton: 'password-reset-confirm-btn',
        cancelButton: 'password-reset-cancel-btn'
      },
      preConfirm: async () => {
        if (!isValidEmail || isLoading || cooldownTime > 0) {
          return false;
        }
        return this.handlePasswordReset(email);
      },
      didOpen: (popup) => {
        this.setupModalInteractions(popup, (newEmail, valid, loading, error, success, cooldown) => {
          email = newEmail;
          isValidEmail = valid;
          isLoading = loading;
          successMessage = success;
          cooldownTime = cooldown;
          
          
          const confirmBtn = popup.querySelector('.swal2-confirm') as HTMLButtonElement;
          if (confirmBtn) {
            confirmBtn.disabled = !isValidEmail || isLoading || cooldownTime > 0;
            confirmBtn.innerHTML = this.getConfirmButtonText(isLoading, cooldownTime, successMessage);
          }
        });
      }
    });

    return {
      isConfirmed: result.isConfirmed,
      email: result.isConfirmed ? email : undefined
    };
  }

 
  private getModalHTML(
    email: string, 
    isValid: boolean, 
    isLoading: boolean, 
    error: string, 
    success: string, 
    cooldown: number
  ): string {
    return `
      <div class="password-reset-container">
        <div class="reset-description">
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        
        <div class="email-input-container">
          <input 
            type="email" 
            id="reset-email" 
            placeholder="Enter your email address"
            value="${email}"
            class="reset-email-input ${error ? 'error' : isValid ? 'valid' : ''}"
            ${isLoading ? 'disabled' : ''}
          />
          <div class="input-icon">
            ${isLoading ? this.getSpinnerHTML() : isValid ? '✓' : ''}
          </div>
        </div>
        
        ${error ? `<div class="error-message">${error}</div>` : ''}
        ${success ? `<div class="success-message">${success}</div>` : ''}
        ${cooldown > 0 ? `<div class="cooldown-message">Please wait ${cooldown}s before trying again</div>` : ''}
        
        <div class="security-notice">
          <small>
            🔒 For security reasons, we'll show the same confirmation message whether or not an account exists for this email.
          </small>
        </div>
      </div>
      
      <style>
        .password-reset-container {
          text-align: left;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .reset-description {
          margin-bottom: 1.5rem;
          color: #d1d5db;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .email-input-container {
          position: relative;
          margin-bottom: 1rem;
        }
        
        .reset-email-input {
          width: 100%;
          padding: 12px 40px 12px 12px;
          border: 2px solid #4b5563;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          background-color: #374151;
          color: #f8f8f8;
        }

        .reset-email-input::placeholder {
          color: #9ca3af;
        }
        
        .reset-email-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .reset-email-input.valid {
          border-color: #22c55e;
          background-color: #1f2937;
        }
        
        .reset-email-input.error {
          border-color: #ef4444;
          background-color: #1f2937;
        }
        
        .input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #22c55e;
          font-weight: bold;
        }
        
        .error-message {
          color: #fca5a5;
          font-size: 12px;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #1f2937;
          border-radius: 4px;
          border-left: 3px solid #ef4444;
        }
        
        .success-message {
          color: #86efac;
          font-size: 12px;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #1f2937;
          border-radius: 4px;
          border-left: 3px solid #22c55e;
        }
        
        .cooldown-message {
          color: #fbbf24;
          font-size: 12px;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #1f2937;
          border-radius: 4px;
          border-left: 3px solid #f59e0b;
        }
        
        .security-notice {
          margin-top: 1.5rem;
          padding: 1rem;
          background-color: #1f2937;
          border-radius: 6px;
          border: 1px solid #374151;
        }
        
        .security-notice small {
          color: #d1d5db;
          font-size: 11px;
          line-height: 1.4;
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #4b5563;
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .password-reset-modal {
          border-radius: 12px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
        
        .password-reset-title {
          color: #1e293b !important;
          font-size: 20px !important;
          font-weight: 600 !important;
          margin-bottom: 1rem !important;
        }
        
        .password-reset-confirm-btn {
          background-color: #667eea !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 12px 24px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        
        .password-reset-confirm-btn:hover:not(:disabled) {
          background-color: #5a67d8 !important;
          transform: translateY(-1px) !important;
        }
        
        .password-reset-confirm-btn:disabled {
          background-color: #94a3b8 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }
        
        .password-reset-cancel-btn {
          background-color: transparent !important;
          color: #64748b !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 12px 24px !important;
          font-weight: 500 !important;
        }
        
        .password-reset-cancel-btn:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }
      </style>
    `;
  }

  
  private setupModalInteractions(
    popup: HTMLElement,
    onStateChange: (email: string, isValid: boolean, isLoading: boolean, error: string, success: string, cooldown: number) => void
  ): void {
    const emailInput = popup.querySelector('#reset-email') as HTMLInputElement;
    
    if (!emailInput) return;

   
    const validateAndUpdate = () => {
      const email = emailInput.value.trim();
      const isValid = validateEmail(email);
      let error = '';
      
      if (email && !isValid) {
        error = 'Please enter a valid email address';
      }
      
     
      const cooldown = this.getCooldownTime(email);
      
      onStateChange(email, isValid, false, error, '', cooldown);
      this.updateModalContent(popup, email, isValid, false, error, '', cooldown);
    };

   
    emailInput.addEventListener('input', validateAndUpdate);
    emailInput.addEventListener('blur', validateAndUpdate);
    
   
    setTimeout(() => emailInput.focus(), 100);
    
    
    const initialCooldown = this.getCooldownTime(emailInput.value);
    if (initialCooldown > 0) {
      this.startCooldownTimer(popup, emailInput.value, onStateChange);
    }
  }

  
  private async handlePasswordReset(email: string): Promise<boolean> {
    try {
      
      if (this.getCooldownTime(email) > 0) {
        throw new Error('Please wait before requesting another reset email');
      }

      
      this.setCooldown(email, 60);

      
      await this.options.onPasswordReset(email);

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
     
      Swal.showValidationMessage((error as Error).message);
      return false;
    }
  }

 
  private getSpinnerHTML(): string {
    return '<div class="spinner"></div>';
  }

  
  private getConfirmButtonText(isLoading: boolean, cooldown: number, success: string): string {
    if (isLoading) {
      return '<div class="spinner"></div> Sending...';
    }
    if (cooldown > 0) {
      return `Wait ${cooldown}s`;
    }
    if (success) {
      return 'Email Sent ✓';
    }
    return 'Send Reset Link';
  }

  
  private updateModalContent(
    popup: HTMLElement,
    email: string,
    isValid: boolean,
    isLoading: boolean,
    error: string,
    success: string,
    cooldown: number
  ): void {
    const container = popup.querySelector('.password-reset-container');
    if (container) {
      const newHTML = this.getModalHTML(email, isValid, isLoading, error, success, cooldown);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newHTML;
      const newContainer = tempDiv.querySelector('.password-reset-container');
      
      if (newContainer) {
        container.innerHTML = newContainer.innerHTML;
      }
    }
  }

 
  private setCooldown(email: string, seconds: number): void {
    this.cooldownTimers.set(email, Date.now() + (seconds * 1000));
  }

  private getCooldownTime(email: string): number {
    const cooldownEnd = this.cooldownTimers.get(email);
    if (!cooldownEnd) return 0;
    
    const remainingTime = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
    if (remainingTime === 0) {
      this.cooldownTimers.delete(email);
    }
    
    return remainingTime;
  }

  private startCooldownTimer(
    popup: HTMLElement,
    email: string,
    onStateChange: (email: string, isValid: boolean, isLoading: boolean, error: string, success: string, cooldown: number) => void
  ): void {
    const timer = setInterval(() => {
      const cooldown = this.getCooldownTime(email);
      if (cooldown === 0) {
        clearInterval(timer);
      }
      onStateChange(email, validateEmail(email), false, '', '', cooldown);
      this.updateModalContent(popup, email, validateEmail(email), false, '', '', cooldown);
    }, 1000);
  }
}


export const usePasswordResetModal = () => {
  const createModal = (
    onPasswordReset: (email: string) => Promise<void>,
    onCheckUserExists?: (email: string) => Promise<boolean>
  ) => {
    return new PasswordResetModal({ onPasswordReset, onCheckUserExists });
  };

  return { createModal };
};
