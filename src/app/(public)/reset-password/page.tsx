import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthPageShell>
        <p className="text-sm text-destructive">Invalid or missing reset token.</p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <ResetPasswordForm token={token} />
    </AuthPageShell>
  );
}
