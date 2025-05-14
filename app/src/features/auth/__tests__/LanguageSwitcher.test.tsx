import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

// Mock fetch
global.fetch = jest.fn();

// Mock next-intl and next/navigation
jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
  useTranslations: jest.fn(),
  NextIntlClientProvider: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => 
    <div data-testid="mock-next-intl-provider" {...props}>{children}</div>,
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()), 
}));

// Mock @clerk/nextjs
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));


// Import after mocking to get the mock implementations
import * as nextIntl from 'next-intl';
import * as nextNavigation from 'next/navigation';
import * as clerkNextjs from '@clerk/nextjs';

interface LanguageTranslations {
  selectLanguage: string;
  english: string;
  hindi: string;
  marathi: string;
  Error: { // Added Error translations
    generic: string;
  };
}

interface MessagesStructure {
  en: { LanguageSwitcher: LanguageTranslations };
  hi: { LanguageSwitcher: LanguageTranslations };
  mr: { LanguageSwitcher: LanguageTranslations };
}

const messages: MessagesStructure = {
  en: {
    LanguageSwitcher: {
      selectLanguage: 'Select Language',
      english: 'English',
      hindi: 'Hindi',
      marathi: 'Marathi',
      Error: {
        generic: 'An error occurred. Please try again.',
      },
    },
  },
  hi: {
    LanguageSwitcher: {
      selectLanguage: 'भाषा चुनें',
      english: 'अंग्रेज़ी',
      hindi: 'हिंदी',
      marathi: 'मराठी',
      Error: {
        generic: 'एक त्रुटि हुई। कृपया पुन प्रयास करें।',
      },
    },
  },
  mr: {
    LanguageSwitcher: {
      selectLanguage: 'भाषा निवडा',
      english: 'इंग्रजी',
      hindi: 'हिंदी',
      marathi: 'मराठी',
      Error: {
        generic: 'एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
      },
    },
  },
};

describe('LanguageSwitcher Component', () => {
  const mockUseLocale = nextIntl.useLocale as jest.Mock;
  const mockUseTranslations = nextIntl.useTranslations as jest.Mock;
  const mockUsePathname = nextNavigation.usePathname as jest.Mock;
  const mockUseRouter = nextNavigation.useRouter as jest.Mock;
  const mockUseUser = clerkNextjs.useUser as jest.Mock;
  const mockFetch = global.fetch as jest.Mock;
  
  let mockRouterReplace: jest.Mock;

  beforeEach(() => {
    mockUseLocale.mockReset();
    mockUseTranslations.mockReset();
    mockUsePathname.mockReset();
    mockRouterReplace = jest.fn();
    mockUseRouter.mockReturnValue({ replace: mockRouterReplace });
    mockUseUser.mockReturnValue({ user: null, isSignedIn: false }); 
    mockFetch.mockClear();
    Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
    });
  });

  const renderComponent = (locale: keyof MessagesStructure, pathname: string) => {
    mockUseLocale.mockReturnValue(locale);
    mockUseTranslations.mockImplementation((namespace: string) => {
      if (namespace === 'LanguageSwitcher') {
        return (key: keyof LanguageTranslations | `Error.${keyof LanguageTranslations['Error']}`) => {
          if (key.startsWith('Error.')) {
            const errorKey = key.substring(6) as keyof LanguageTranslations['Error'];
            return messages[locale].LanguageSwitcher.Error[errorKey];
          }
          return messages[locale].LanguageSwitcher[key as keyof LanguageTranslations];
        }
      }
      return (key: string) => `Missing namespace or key: ${namespace}.${key}`;
    });
    mockUsePathname.mockReturnValue(pathname);
    return render(<LanguageSwitcher />);
  };

  it('should render language options and "Select Language" text in English', () => {
    renderComponent('en', '/some-page');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Hindi')).toBeInTheDocument();
    expect(screen.getByText('Marathi')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('en');
    const label = screen.getByLabelText('Select Language');
    expect(label).toBeInTheDocument();
  });

  it('should render language options and "भाषा चुनें" text in Hindi', () => {
    renderComponent('hi', '/some-page');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('अंग्रेज़ी')).toBeInTheDocument(); 
    expect(screen.getByText('हिंदी')).toBeInTheDocument();    
    expect(screen.getByText('मराठी')).toBeInTheDocument();   
    expect(screen.getByRole('combobox')).toHaveValue('hi');
    const label = screen.getByLabelText('भाषा चुनें');
    expect(label).toBeInTheDocument();
  });
  
  it('should render language options and "भाषा निवडा" text in Marathi', () => {
    renderComponent('mr', '/some-page');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('इंग्रजी')).toBeInTheDocument(); 
    expect(screen.getByText('हिंदी')).toBeInTheDocument();    
    expect(screen.getByText('मराठी')).toBeInTheDocument();   
    expect(screen.getByRole('combobox')).toHaveValue('mr');
    const label = screen.getByLabelText('भाषा निवडा');
    expect(label).toBeInTheDocument();
  });

  it('should change language and navigate when a new language is selected', async () => {
    renderComponent('en', '/current-page');
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'hi' } });

    await waitFor(() => {
      expect(document.cookie).toContain('NEXT_LOCALE=hi');
      expect(mockRouterReplace).toHaveBeenCalledWith('/hi/current-page');
    });
  });

  it('should correctly generate new path when current path includes locale', async () => {
    renderComponent('en', '/en/another-page');
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'mr' } });
    
    await waitFor(() => {
      expect(document.cookie).toContain('NEXT_LOCALE=mr');
      expect(mockRouterReplace).toHaveBeenCalledWith('/mr/another-page');
    });
  });

  it('should correctly generate new path for the root when current path is just locale', async () => {
    renderComponent('hi', '/hi');
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'en' } });

    await waitFor(() => {
      expect(document.cookie).toContain('NEXT_LOCALE=en');
      expect(mockRouterReplace).toHaveBeenCalledWith('/en/');
    });
  });

  it('should correctly generate new path for the root when current path is /', async () => {
    renderComponent('en', '/');
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'mr' } });

    await waitFor(() => {
      expect(document.cookie).toContain('NEXT_LOCALE=mr');
      expect(mockRouterReplace).toHaveBeenCalledWith('/mr/');
    });
  });

  it('should call API to update language for authenticated user', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'user_123' }, isSignedIn: true });
    mockFetch.mockResolvedValueOnce({ // Mock successful API response
      ok: true,
      json: async () => ({ success: true }),
    });

    renderComponent('en', '/profile');
    const selectElement = screen.getByRole('combobox');
    
    fireEvent.change(selectElement, { target: { value: 'hi' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/update-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'hi' }),
      });
      expect(document.cookie).toContain('NEXT_LOCALE=hi');
      expect(mockRouterReplace).toHaveBeenCalledWith('/hi/profile');
    });
  });

  it('should display an error message if API call fails for authenticated user', async () => {
    mockUseUser.mockReturnValue({ user: { id: 'user_123' }, isSignedIn: true });
    mockFetch.mockResolvedValueOnce({ // Mock failed API response
      ok: false,
      json: async () => ({ error: 'DB update failed' }),
    });
  
    renderComponent('en', '/profile');
    const selectElement = screen.getByRole('combobox');
    
    fireEvent.change(selectElement, { target: { value: 'hi' } });
  
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/update-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'hi' }),
      });
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
      // Check that navigation still happens even if API fails (as per current component logic)
      expect(document.cookie).toContain('NEXT_LOCALE=hi');
      expect(mockRouterReplace).toHaveBeenCalledWith('/hi/profile');
    });
  });
});