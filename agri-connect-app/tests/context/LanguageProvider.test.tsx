import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/context/LanguageProvider';
import * as supabaseActions from '@/lib/supabaseActions';
import * as nextIntl from 'next-intl';
import * as nextNavigation from 'next/navigation';
import * as clerkNextjs from '@clerk/nextjs';

// --- Mocks ---
// Mock supabaseActions with a factory
jest.mock('@/lib/supabaseActions', () => ({
  getLanguages: jest.fn(),
  getUserPreferredLanguage: jest.fn(),
  upsertUserProfile: jest.fn(),
}));
jest.mock('next-intl');
jest.mock('next/navigation');
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Import the mocked actions to type them and assign mock implementations
import { getLanguages, getUserPreferredLanguage, upsertUserProfile } from '@/lib/supabaseActions';

const mockGetLanguages = getLanguages as jest.Mock;
const mockGetUserPreferredLanguage = getUserPreferredLanguage as jest.Mock;
const mockUpsertUserProfile = upsertUserProfile as jest.Mock;

const mockUseLocale = nextIntl.useLocale as jest.Mock;
const mockUsePathname = nextNavigation.usePathname as jest.Mock;
const mockUseRouter = nextNavigation.useRouter as jest.Mock;
const mockUseUser = clerkNextjs.useUser as jest.Mock; // Now this refers to the jest.fn() from the mock factory

const mockPush = jest.fn();

// Helper component to consume context
const TestConsumer = () => {
  const { currentLocale, availableLanguages, changeLanguage, isLoadingLanguages } = useLanguage();
  return (
    <div>
      <div data-testid="current-locale">{currentLocale}</div>
      <div data-testid="is-loading">{isLoadingLanguages.toString()}</div>
      <ul data-testid="available-languages">
        {availableLanguages.map(lang => <li key={lang.code}>{lang.name}</li>)}
      </ul>
      <button onClick={() => changeLanguage('hi')}>Switch to Hindi</button>
      <button onClick={() => changeLanguage('mr')}>Switch to Marathi</button>
    </div>
  );
};

describe('LanguageProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for hooks
    mockUseLocale.mockReturnValue('en');
    mockUsePathname.mockReturnValue('/en/some-page');
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseUser.mockReturnValue({ isSignedIn: false, user: null, isLoaded: true });
    mockGetLanguages.mockResolvedValue([
      { code: 'en', name: 'English', native_name: 'English' },
      { code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
      { code: 'mr', name: 'Marathi', native_name: 'मराठी' },
    ]);
    mockGetUserPreferredLanguage.mockResolvedValue(null);
    mockUpsertUserProfile.mockResolvedValue({ clerk_user_id: 'test-user', preferred_language_code: 'en' });
    localStorage.clear();
  });

  it('loads available languages on mount', async () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
    await waitFor(() => expect(screen.getByTestId('is-loading')).toHaveTextContent('false'));
    expect(mockGetLanguages).toHaveBeenCalledTimes(1);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Hindi')).toBeInTheDocument();
  });

  it('initializes with locale from next-intl for guest user without localStorage pref', async () => {
    mockUseLocale.mockReturnValue('mr');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await waitFor(() => expect(screen.getByTestId('is-loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('current-locale')).toHaveTextContent('mr');
  });

  it('initializes with localStorage preference for guest user', async () => {
    localStorage.setItem('preferredLanguage', 'hi');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
        // The changeLanguage will be called, which triggers router.push
        // and sets currentLocale
    });
    // Check if router.push was called to change to 'hi'
    expect(mockPush).toHaveBeenCalledWith('/hi/some-page');
    // The currentLocale state should reflect 'hi' after the effect
    // This requires waiting for the state update triggered by changeLanguage
    await waitFor(() => expect(screen.getByTestId('current-locale')).toHaveTextContent('hi'));
  });

  it('initializes with Supabase preference for signed-in user', async () => {
    mockUseUser.mockReturnValue({ isSignedIn: true, user: { id: 'user_123' }, isLoaded: true } as any);
    mockGetUserPreferredLanguage.mockResolvedValue('mr');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await waitFor(() => expect(screen.getByTestId('is-loading')).toHaveTextContent('false'));
    await waitFor(() => expect(mockGetUserPreferredLanguage).toHaveBeenCalledWith('user_123'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/mr/some-page'));
    await waitFor(() => expect(screen.getByTestId('current-locale')).toHaveTextContent('mr'));
  });

  it('creates user profile and sets default lang if signed-in user has no profile', async () => {
    mockUseUser.mockReturnValue({ isSignedIn: true, user: { id: 'new_user_456' }, isLoaded: true } as any);
    mockGetUserPreferredLanguage.mockResolvedValue(null); // No preference, implies no profile or lang is null
    mockUpsertUserProfile.mockResolvedValue({ clerk_user_id: 'new_user_456', preferred_language_code: 'en' });

    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await waitFor(() => expect(screen.getByTestId('is-loading')).toHaveTextContent('false'));
    await waitFor(() => expect(mockGetUserPreferredLanguage).toHaveBeenCalledWith('new_user_456'));
    await waitFor(() => expect(mockUpsertUserProfile).toHaveBeenCalledWith('new_user_456')); 
    // If default 'en' is already the intlLocale, no push. If different, it would push.
    // Assuming intlLocale is 'en' from default mock
    expect(mockPush).not.toHaveBeenCalled(); 
    expect(screen.getByTestId('current-locale')).toHaveTextContent('en');
  });


  it('changes language, updates URL, and saves to localStorage for guest', async () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await waitFor(() => expect(screen.getByTestId('is-loading')).toHaveTextContent('false'));
    
    act(() => {
      screen.getByText('Switch to Hindi').click();
    });

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/hi/some-page'));
    expect(localStorage.getItem('preferredLanguage')).toBe('hi');
    await waitFor(() => expect(screen.getByTestId('current-locale')).toHaveTextContent('hi'));
  });

  it('changes language, updates URL, and saves to Supabase for signed-in user', async () => {
    mockUseUser.mockReturnValue({ isSignedIn: true, user: { id: 'user_789' }, isLoaded: true } as any);
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await waitFor(() => expect(screen.getByTestId('is-loading')).toHaveTextContent('false'));

    act(() => {
      screen.getByText('Switch to Marathi').click();
    });
    
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/mr/some-page'));
    await waitFor(() => expect(mockUpsertUserProfile).toHaveBeenCalledWith('user_789', 'mr'));
    await waitFor(() => expect(screen.getByTestId('current-locale')).toHaveTextContent('mr'));
  });
  
});