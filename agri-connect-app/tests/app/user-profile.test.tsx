// IMPORTANT: Mock Clerk first.
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({ isSignedIn: true, user: { id: 'test-user' }, isLoaded: true })),
  UserProfile: (props: any) => <div data-testid="clerk-user-profile" {...props}>UserProfileMock</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import UserProfilePage from '@/app/[locale]/user-profile/page';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageProvider } from '@/context/LanguageProvider';

// Mock next-intl useTranslations
jest.mock('next-intl', () => ({
  ...jest.requireActual('next-intl'),
  useTranslations: (namespace: string) => (key: string) => {
    const messages: { [ns: string]: { [k: string]: string } } = {
      UserProfile: {
        'title': 'User Profile Page Title',
        'welcome': 'Welcome to your profile.',
      }
    };
    return messages[namespace]?.[key] || key;
  },
}));

// Mock LanguageProvider context
const mockChangeLanguage = jest.fn();
const mockAvailableLanguages = [
  { code: 'en', name: 'English', native_name: 'English' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
];
jest.mock('@/context/LanguageProvider', () => ({
  ...jest.requireActual('@/context/LanguageProvider'),
  useLanguage: () => ({
    currentLocale: 'en',
    availableLanguages: mockAvailableLanguages,
    changeLanguage: mockChangeLanguage,
    isLoadingLanguages: false,
  }),
}));

// Mock next/navigation needed by LanguageProvider
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/en/user-profile',
}));


const messages = {
  UserProfile: {
    title: 'User Profile Page Title',
    welcome: 'Welcome to your profile.',
  }
};

const renderUserProfilePage = () => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <LanguageProvider> {/* LanguageProvider is needed as UserProfilePage uses useLanguage */}
        <UserProfilePage />
      </LanguageProvider>
    </NextIntlClientProvider>
  );
};

describe('UserProfile Page', () => {
  it('renders the Clerk UserProfile component and translated title', () => {
    renderUserProfilePage();
    const clerkProfile = screen.getByTestId('clerk-user-profile');
    expect(clerkProfile).toBeInTheDocument();
    expect(clerkProfile).toHaveAttribute('path', '/user-profile');
    
    expect(screen.getByRole('heading', { name: 'User Profile Page Title' })).toBeInTheDocument();
    expect(screen.getByText('Welcome to your profile.')).toBeInTheDocument();
  });

  it('displays the current language preference', () => {
    renderUserProfilePage();
    // Based on the mocked useLanguage context (currentLocale: 'en')
    expect(screen.getByText(/Your current language preference is set to: English \(en\)/i)).toBeInTheDocument();
  });
});