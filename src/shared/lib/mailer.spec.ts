import { describe, expect, it, vi } from 'vitest';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
    })),
  },
}));

import { mailer } from './mailer';

describe('Mailer', () => {
  it('sends password reset email without throwing', async () => {
    await expect(mailer.sendPasswordReset('test@example.com', 'abc123')).resolves.toBeUndefined();
  });
});
