import React from 'react';
import { render, screen } from '@testing-library/react';
import SignInPage from '@/app/[locale]/sign-in/[[...sign-in]]/page'; // Updated import path
import { NextIntlClientProvider } from 'next-intl';

// Mock Clerk's SignIn component
jest.mock('@clerk/nextjs', () => ({
  SignIn: (props: { path?: string; routing?: string; signUpUrl?: string; }) => ( // Be more specific or omit props if not used by mock
    <div data-testid="clerk-sign-in"
         data-path={props.path}
         data-routing={props.routing}
         data-signupurl={props.signUpUrl} // Use data attributes for non-standard props
    >
      SignInMock
    </div>
  ),
}));

// Mock next-intl useTranslations
jest.mock('next-intl', () => ({
  ...jest.requireActual('next-intl'),
  useTranslations: () => (key: string) => {
    const translations: { [key: string]: string } = {
      'SignIn.title': 'Sign In to AgriConnect', // Example, if used
    };
    return translations[key] || key;
  },
}));

const messages = {
  SignIn: {
    title: 'Sign In to AgriConnect',
  }
};

const renderSignInPage = () => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SignInPage />
    </NextIntlClientProvider>
  );
};

describe('SignIn Page', () => {
  it('renders the Clerk SignIn component', () => {
    renderSignInPage();
    const signInMock = screen.getByTestId('clerk-sign-in');
    expect(signInMock).toBeInTheDocument();
    // Check if Clerk's SignIn component receives path props correctly via data attributes
    expect(signInMock).toHaveAttribute('data-path', '/sign-in');
    expect(signInMock).toHaveAttribute('data-routing', 'path');
    expect(signInMock).toHaveAttribute('data-signupurl', '/sign-up');

  });

  // The page itself doesn't render a separate title currently, relies on Clerk.
  // If a title like <h1 className="text-2xl font-semibold mb-6">{t('title')}</h1>
  // were uncommented in the page, this test would be more relevant.
  // For now, just ensuring the main component renders is sufficient.
  it('renders correctly within providers', () => {
    renderSignInPage();
    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument();
  });
});