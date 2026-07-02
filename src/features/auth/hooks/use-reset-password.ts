'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { http } from '@/shared/lib/http';

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/auth/reset-password', { token, password });
      router.push('/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error };
};
