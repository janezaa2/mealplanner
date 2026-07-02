import crypto from 'crypto';

import { passwordResetTokenRepository } from '@/features/auth/repository/password-reset-token.repository';
import { userRepository } from '@/features/auth/repository/user.repository';
import { mailer } from '@/shared/lib/mailer';
import { ServiceResult } from '@/shared/types/common';
import { hashPassword } from '@/shared/utils/password';

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function requestPasswordResetService(
  email: string
): Promise<ServiceResult<{ message: string }>> {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    return { data: { error: 'User not found.' }, status: 404 };
  }

  await passwordResetTokenRepository.deleteByEmail(email);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ONE_HOUR_MS);

  await passwordResetTokenRepository.create(email, token, expiresAt);
  await mailer.sendPasswordReset(email, token);

  return { data: { message: 'Reset link sent to your email.' }, status: 200 };
}

export async function resetPasswordService(
  token: string,
  newPassword: string
): Promise<ServiceResult<{ message: string }>> {
  const record = await passwordResetTokenRepository.findByToken(token);

  if (!record || record.used || new Date() > new Date(record.expiresAt)) {
    return { data: { error: 'Invalid or expired reset link.' }, status: 400 };
  }

  await userRepository.updateByEmail(record.email, { passwordHash: hashPassword(newPassword) });
  await passwordResetTokenRepository.markUsed(token);

  return { data: { message: 'Password reset successfully.' }, status: 200 };
}
