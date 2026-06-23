import { APP_NAME } from '@/shared/const/app.const';

export const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-6 sm:px-10">
      <p className="text-center text-xs text-muted-foreground">
        {APP_NAME} — personalized AI meal plans for your goals. Eat smarter, every day.
      </p>
    </footer>
  );
};
