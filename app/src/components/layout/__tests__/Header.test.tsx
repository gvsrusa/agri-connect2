import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header'; // Adjust the import path as necessary
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/locales/en.json'; // Assuming English messages

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/en/dashboard'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
}));

// Mock Clerk's UserButton and useUser
jest.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button">UserButton Mock</div>,
  useUser: jest.fn(() => ({ isSignedIn: true, user: { fullName: 'Test User' } })),
}));


describe('Header Component', () => {
  it('renders the header with navigation links and user button', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    // Check for logo or brand name (adjust selector as per your Header component)
    expect(screen.getByText('AgriConnect')).toBeInTheDocument();

    // Check for navigation links
    // Note: Link text might come from i18n messages, adjust accordingly
    // expect(screen.getByText('Dashboard')).toBeInTheDocument(); // These links are in Navbar.tsx, not Header.tsx
    // expect(screen.getByText('Marketplace')).toBeInTheDocument();
    // expect(screen.getByText('Advisory')).toBeInTheDocument();
    // Add more links as present in your Header

    // Check for LanguageSwitcher (assuming it renders some identifiable text or element)
    // This might need a more specific selector if LanguageSwitcher is complex
    // expect(screen.getByTestId('language-switcher')).toBeInTheDocument(); // LanguageSwitcher is not currently in Header.tsx


    // Check for UserButton
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });

  it('renders correctly when user is not signed in', () => {
    (jest.requireMock('@clerk/nextjs').useUser as jest.Mock).mockReturnValueOnce({ isSignedIn: false, user: null });
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );
    // Example: Check for a "Sign In" link or button if that's what your header shows
    // expect(screen.getByText('Sign In')).toBeInTheDocument();
    // For now, just check UserButton is still rendered (Clerk might handle its display state)
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });
});