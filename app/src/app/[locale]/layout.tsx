import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
// Don't use getMessages since it's failing to find the config
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ApplyUserLanguage } from '@/components/auth/ApplyUserLanguage'; // Import the new component
import "./../globals.css"; // Adjusted path for globals.css

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriConnect",
  description: "Connecting farmers and consumers.",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({ // Made the function async
  children,
  params,
}: Readonly<RootLayoutProps>) {
  // Need to await params and then access locale property
  const { locale } = params;
  // Load messages directly without using getMessages
  let messages;
  try {
    messages = (await import(`../../../locales/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to English if locale file can't be loaded
    messages = (await import(`../../../locales/en.json`)).default;
  }

  return (
    <ClerkProvider>
      <html lang={locale}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ApplyUserLanguage /> {/* Add the component here */}
            <Header />
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}