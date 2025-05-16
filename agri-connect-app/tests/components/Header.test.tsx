// IMPORTANT: Mock Clerk first, as LanguageProvider (imported by Header) uses useUser from Clerk.
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({ isSignedIn: true, user: { id: 'test-user' }, isLoaded: true })),
  UserButton: () => <div data-testid="user-button">UserButtonMock</div>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out">{children}</div>,
  SignInButton: ({ children }: { children: React.ReactNode }) => <div data-testid="sign-in-button">{children}</div>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <div data-testid="sign-up-button">{children}</div>,
}));

import React from 'react';
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { LanguageProvider } from '@/context/LanguageProvider';
import { NextIntlClientProvider } from 'next-intl';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({children, href}: {children: React.ReactNode, href: string}) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock next-intl useTranslations (ensure this is also high enough if other mocks depend on it)
jest.mock('next-intl', () => ({
  ...jest.requireActual('next-intl'),
  useTranslations: (namespace: string) => (key: string) => {
    const messages: { [ns: string]: { [k: string]: string } } = {
      Header: {
        'marketplace': 'Marketplace',
        'marketPrices': 'Market Prices',
        'cropAdvisory': 'Crop Advisory',
        'signIn': 'Sign In',
        'signUp': 'Sign Up',
      }
      // Add other namespaces if needed by Header or its children indirectly
    };
    return messages[namespace]?.[key] || key;
  },
  useLocale: () => 'en',
}));


// Mock LanguageProvider context
const mockChangeLanguage = jest.fn();
const mockAvailableLanguages = [
  { code: 'en', name: 'English', native_name: 'English' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
];
jest.mock('@/context/LanguageProvider', () => ({
  ...jest.requireActual('@/context/LanguageProvider'), // Keep original exports like LanguageProvider itself
  useLanguage: () => ({
    currentLocale: 'en',
    availableLanguages: mockAvailableLanguages,
    changeLanguage: mockChangeLanguage,
    isLoadingLanguages: false,
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/en/somepage', // Mock pathname
}));


const messages = {
  Header: {
    marketplace: 'Marketplace',
    marketPrices: 'Market Prices',
    cropAdvisory: 'Crop Advisory',
    signIn: 'Sign In',
    signUp: 'Sign Up',
  }
};

const renderHeaderWithProviders = async () => {
  let utils;
  await act(async () => {
    utils = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LanguageProvider>
          <Header />
        </LanguageProvider>
      </NextIntlClientProvider>
    );
    // Allow time for LanguageProvider's useEffect to fetch languages and update state
    await waitFor(() => expect(jest.requireMock('@/context/LanguageProvider').useLanguage().isLoadingLanguages).toBe(false), { timeout: 2000 });
  });
  return utils!;
};


describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to signed in state for most tests
    (jest.requireMock('@clerk/nextjs').useUser as jest.Mock).mockReturnValue({ isSignedIn: true, user: { id: 'test-user' }, isLoaded: true });
    // Note: Modifying parts of a mock like SignedIn/SignedOut directly on the mocked module can be tricky
    // It's often cleaner to control this via the useUser mock's return value if components react to isSignedIn.
    // For direct SignedIn/SignedOut components, the mock factory itself is the primary control point.
    // The current mock factory for @clerk/nextjs already defines SignedIn and SignedOut.
    // To test the SignedOut state, we'll re-mock useUser to return isSignedIn: false.
  });

  it('renders without crashing', async () => {
    await renderHeaderWithProviders();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the application title or logo', async () => {
    await renderHeaderWithProviders();
    const homeLink = screen.getByRole('link', { name: /agriconnect/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/en');
  });

  it('renders navigation links with translated text', async () => {
    await renderHeaderWithProviders();
    expect(screen.getByRole('link', { name: 'Marketplace' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Market Prices' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crop Advisory' })).toBeInTheDocument();
  });

  it('renders UserButton when user is authenticated', async () => {
    (jest.requireMock('@clerk/nextjs').useUser as jest.Mock).mockReturnValue({ isSignedIn: true, user: { id: 'test-user' }, isLoaded: true });
    await renderHeaderWithProviders();
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });

  it('renders Sign In and Sign Up buttons when user is not authenticated', async () => {
    (jest.requireMock('@clerk/nextjs').useUser as jest.Mock).mockReturnValue({ isSignedIn: false, user: null, isLoaded: true });
    await renderHeaderWithProviders(); // useUser is mocked to isSignedIn: false
    
    // Check for the buttons within the sign-in-button and sign-up-button testids
    const signInButtonContainer = screen.getByTestId('sign-in-button');
    expect(signInButtonContainer).toBeInTheDocument();
    expect(within(signInButtonContainer).getByText('Sign In')).toBeInTheDocument();
    
    const signUpButtonContainer = screen.getByTestId('sign-up-button');
    expect(signUpButtonContainer).toBeInTheDocument();
    expect(within(signUpButtonContainer).getByText('Sign Up')).toBeInTheDocument();
  });

  it('renders language switcher with available languages', async () => {
    await renderHeaderWithProviders();
    const languageSelect = screen.getByRole('combobox', {name: /select language/i});
    expect(languageSelect).toBeInTheDocument();
    // Ensure assertions wait for the available languages to be populated by the provider
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument(); // From native_name in mockAvailableLanguages
      expect(screen.getByText('हिन्दी')).toBeInTheDocument(); // From native_name in mockAvailableLanguages
    });
  });

  it('calls changeLanguage when a new language is selected', async () => {
    await renderHeaderWithProviders();
    const languageSelect = screen.getByRole('combobox', {name: /select language/i});
    await act(async () => {
      fireEvent.change(languageSelect, { target: { value: 'hi' } });
    });
    expect(mockChangeLanguage).toHaveBeenCalledWith('hi');
  });
});