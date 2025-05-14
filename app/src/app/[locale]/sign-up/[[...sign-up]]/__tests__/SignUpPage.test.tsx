import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import SignUpPage from '../page';

// Mock Clerk's SignUp component
jest.mock('@clerk/nextjs', () => ({
  SignUp: (props: any) => (
    <div 
      data-testid="mock-clerk-signup" 
      data-path={props.path}
      data-routing={props.routing}
      data-signin-url={props.signInUrl}
    >
      Clerk Sign Up
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
  SignUpPage: {
    title: 'Create an Account',
  },
};

const messagesHi = {
  SignUpPage: {
    title: 'खाता बनाएं', // Hindi for "Create an Account"
  },
};

describe('SignUpPage', () => {
  beforeEach(() => {
    mockTranslate.mockClear();
  });

  const renderSignUpPage = (locale: string, messages: any) => {
    mockTranslate.mockImplementation((key) => {
      // This simulates the behavior of the useTranslations hook
      const parts = key.split('.');
      if (parts.length === 1) {
        // If it's a simple key in the SignUpPage namespace
        return messages.SignUpPage?.[key] || key;
      }
      return key;
    });

    return render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <SignUpPage />
      </NextIntlClientProvider>
    );
  };

  it('should render the Clerk SignUp component with correct props', () => {
    renderSignUpPage('en', messagesEn);
    const signUpElement = screen.getByTestId('mock-clerk-signup');
    expect(signUpElement).toBeInTheDocument();
    expect(signUpElement).toHaveAttribute('data-path', '/sign-up');
    expect(signUpElement).toHaveAttribute('data-routing', 'path');
    expect(signUpElement).toHaveAttribute('data-signin-url', '/sign-in');
  });

  it('should display the title in English when locale is "en"', () => {
    mockTranslate.mockImplementation(() => messagesEn.SignUpPage.title);
    renderSignUpPage('en', messagesEn);
    expect(screen.getByRole('heading')).toHaveTextContent(messagesEn.SignUpPage.title);
  });

  it('should display the title in Hindi when locale is "hi"', () => {
    mockTranslate.mockImplementation(() => messagesHi.SignUpPage.title);
    renderSignUpPage('hi', messagesHi);
    expect(screen.getByRole('heading')).toHaveTextContent(messagesHi.SignUpPage.title);
  });
});