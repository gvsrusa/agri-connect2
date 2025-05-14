import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from "next/font/google";
// Removed: import { NextIntlClientProvider, useMessages } from 'next-intl';
import "./globals.css";

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

export default function RootLayout({
  children,
  params: { locale }, // locale is still passed down
}: Readonly<RootLayoutProps>) {
  // Removed: const messages = useMessages();

  return (
    <ClerkProvider>
      <html>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* NextIntlClientProvider will be in app/[locale]/layout.tsx */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
