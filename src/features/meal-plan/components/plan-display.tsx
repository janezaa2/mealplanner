'use client';
import { Loader2, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { DayPlanCard } from '@/features/meal-plan/components/day-plan-card';
import { useMealPlanStore } from '@/features/meal-plan/hooks/useMealPlanStore';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { GOAL_OPTIONS, WEEK_DAYS } from '@/shared/const/meal-plan.const';
import { http } from '@/shared/lib/http';

type PlanDisplayProps = {
  onRegenerate: () => void;
  generating?: boolean;
};

export const PlanDisplay = ({ onRegenerate, generating = false }: PlanDisplayProps) => {
  const { plan, profile } = useMealPlanStore();
  const { data: session } = useSession();
  const accountEmail = (session?.user as { email?: string } | undefined)?.email ?? '';

  const [emailInput, setEmailInput] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const sendPdf = async (email?: string) => {
    setSending(true);
    setEmailStatus(null);
    try {
      const res = await http.post<{ message: string }>('/meal-plan/email', { email: email || undefined });
      setEmailStatus({ ok: true, message: res.message });
      setShowEmailForm(false);
      setEmailInput('');
    } catch (err) {
      setEmailStatus({ ok: false, message: err instanceof Error ? err.message : 'Failed to send email.' });
    } finally {
      setSending(false);
    }
  };

  if (!plan || !profile) return null;

  const goalLabel =
    GOAL_OPTIONS.find((option) => option.value === profile.goal)?.label ?? profile.goal;

  const orderedDays = [...plan.days].sort(
    (a, b) => WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day)
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold">{goalLabel}</p>
            <p className="text-sm text-muted-foreground">
              {profile.height} cm · {profile.weight} kg · {profile.age} yrs · {profile.gender}
            </p>
          </div>
          {generating ? (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Generating… {orderedDays.length}/7 days
            </span>
          ) : (
            <div className="flex flex-col items-end gap-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={onRegenerate}>
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailForm((v) => !v);
                    setEmailStatus(null);
                    setEmailInput('');
                  }}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send as PDF
                </Button>
              </div>

              {showEmailForm && (
                <div className="flex w-full max-w-sm flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder={accountEmail || 'your@email.com'}
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      disabled={sending}
                      onClick={() => sendPdf(emailInput.trim() || undefined)}
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                    </Button>
                  </div>
                  {accountEmail && (
                    <button
                      type="button"
                      onClick={() => sendPdf(accountEmail)}
                      disabled={sending}
                      className="text-left text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-50"
                    >
                      Send to my account email ({accountEmail})
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave blank to send to your account email.
                  </p>
                </div>
              )}

              {emailStatus && (
                <p className={`text-xs ${emailStatus.ok ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {emailStatus.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-8">
        {orderedDays.map((day, index) => (
          <DayPlanCard key={index} day={day} />
        ))}

        {generating && (
          <Card>
            <CardContent className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="text-sm">
                {orderedDays.length === 0
                  ? 'Building your week of meals…'
                  : 'Adding more days…'}
              </span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
