import { SignIn } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("SignInPage");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}