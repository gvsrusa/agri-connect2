import { SignUp } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("SignUpPage");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}