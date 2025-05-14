import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/locales/en.json'; // Default to English messages for tests
import SignInPage from '../page'; // Adjust path if necessary

// Mock Clerk's SignIn component as it's an external dependency
jest.mock('@clerk/nextjs', () => ({
  SignIn: jest.fn(() => <div data-testid="mock-clerk-signin">Clerk Sign In</div>),
}));

describe('SignInPage', () => {
  const renderSignInPage = () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SignInPage />
      </NextIntlClientProvider>
    );
  };

  it('should render the Clerk SignIn component', () => {
    renderSignInPage();
    expect(screen.getByTestId('mock-clerk-signin')).toBeInTheDocument();
    expect(screen.getByText('Clerk Sign In')).toBeInTheDocument();
  });

  it.todo('should display appropriate UI elements for sign-in');
  it.todo('should handle language selection if integrated on this page');
});