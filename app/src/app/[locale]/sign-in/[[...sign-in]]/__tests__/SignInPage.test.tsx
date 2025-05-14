import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import SignInPage from '../page';

// Mock Clerk's SignIn component without trying to access it from the outer scope
jest.mock('@clerk/nextjs', () => ({
  SignIn: (props: any) => (
    <div 
      data-testid="mock-clerk-signin" 
      data-path={props.path}
      data-routing={props.routing}
      data-signup-url={props.signUpUrl}
    >
      Clerk Sign In
    </div>
  ),
}));

// Mock next-intl's useTranslations
const mockTranslate = jest.fn((key) => key);
jest.mock('next-intl', () => ({
  ...jest.requireActual('next-intl'),
  useTranslations: () => mockTranslate,
  // Simple mock for NextIntlClientProvider that passes locale and messages props to children
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const messagesEn = {
  SignInPage: {
    title: 'Sign In to AgriConnect',
  },
};

const messagesHi = {
  SignInPage: {
    title: 'एग्रीकल्चर से जुड़ें', // Hindi for "Sign In to AgriConnect"
  },
};

describe('SignInPage', () => {
  beforeEach(() => {
    mockTranslate.mockClear();
  });

  const renderSignInPage = (locale: string, messages: any) => {
    mockTranslate.mockImplementation((key) => {
      // This simulates the behavior of the useTranslations hook
      const parts = key.split('.');
      if (parts.length === 1) {
        // If it's a simple key in the SignInPage namespace
        return messages.SignInPage?.[key] || key;
      }
      return key;
    });

    return render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <SignInPage />
      </NextIntlClientProvider>
    );
  };

  it('should render the Clerk SignIn component with correct props', () => {
    renderSignInPage('en', messagesEn);
    const signInElement = screen.getByTestId('mock-clerk-signin');
    expect(signInElement).toBeInTheDocument();
    expect(signInElement).toHaveAttribute('data-path', '/sign-in');
    expect(signInElement).toHaveAttribute('data-routing', 'path');
    expect(signInElement).toHaveAttribute('data-signup-url', '/sign-up');
  });

  it('should display the title in English when locale is "en"', () => {
    mockTranslate.mockImplementation(() => messagesEn.SignInPage.title);
    renderSignInPage('en', messagesEn);
    expect(screen.getByRole('heading')).toHaveTextContent(messagesEn.SignInPage.title);
  });

  it('should display the title in Hindi when locale is "hi"', () => {
    mockTranslate.mockImplementation(() => messagesHi.SignInPage.title);
    renderSignInPage('hi', messagesHi);
    expect(screen.getByRole('heading')).toHaveTextContent(messagesHi.SignInPage.title);
  });
});