import { SignUp } from "@clerk/nextjs";
import { useTranslations } from 'next-intl';

export default function SignUpPage() {
  const t = useTranslations('SignUp'); // For potential page title or surrounding text

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Example: <h1 className="text-2xl font-semibold mb-6">{t('title')}</h1> */}
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}