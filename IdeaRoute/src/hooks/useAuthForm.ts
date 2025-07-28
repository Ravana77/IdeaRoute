import { useState, useCallback } from 'react';
import { FormData, FormErrors, ValidationResult } from '@/types/auth';
import { validateAuthForm } from '@/utils/auth';

interface UseAuthFormProps {
  initialData?: Partial<FormData>;
  mode: 'signin' | 'signup';
}

interface UseAuthFormReturn {
  formData: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateForm: () => ValidationResult;
  resetForm: () => void;
  clearErrors: () => void;
}

export const useAuthForm = ({ 
  initialData = {}, 
  mode 
}: UseAuthFormProps): UseAuthFormReturn => {
  const [formData, setFormData] = useState<FormData>({
    email: initialData.email || '',
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || '',
    displayName: initialData.displayName || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for the field being edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const validateForm = useCallback((): ValidationResult => {
    return validateAuthForm(formData, mode === 'signup');
  }, [formData, mode]);

  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    showPassword,
    showConfirmPassword,
    setFormData,
    setErrors,
    setIsSubmitting,
    setShowPassword,
    setShowConfirmPassword,
    handleInputChange,
    validateForm,
    resetForm,
    clearErrors
  };
};
