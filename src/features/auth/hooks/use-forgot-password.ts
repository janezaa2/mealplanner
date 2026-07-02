'use client';
import { useState } from 'react';

import { ForgotPasswordType } from '@/features/auth/validations/password-reset.validation';
import { http } from '@/shared/lib/http';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestReset = async (data: ForgotPasswordType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/auth/forgot-password', data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return { requestReset, loading, error, success };
};
