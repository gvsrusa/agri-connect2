import React from 'react';
import { render, screen } from '@testing-library/react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

// Mock next-intl and next/navigation using jest.mock without referencing external variables
jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
  useTranslations: jest.fn(),
  NextIntlClientProvider: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => 
    <div data-testid="mock-next-intl-provider" {...props}>{children}</div>
}));

// Manual mock for 'next-intl/link' is in app/__mocks__/next-intl/link.tsx
jest.mock('next-intl/link', () => {
  const mockLink = jest.fn(({ href, locale, ...props }) => (
    <a href={href + '?locale=' + locale} {...props} />
  ));
  return mockLink;
});

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
}));

// Import after mocking to get the mock implementations
import * as nextIntl from 'next-intl';
import Link from 'next-intl/link';
import * as nextNavigation from 'next/navigation';

const messages = {
  en: {
    LanguageSwitcher: {
      selectLanguage: 'Select Language',
    },
  },
  hi: {
    LanguageSwitcher: {
      selectLanguage: 'भाषा चुनें',
    },
  },
};

describe('LanguageSwitcher Component', () => {
  // Get typed references to the mocked functions
  const mockUseLocale = nextIntl.useLocale as jest.Mock;
  const mockUseTranslations = nextIntl.useTranslations as jest.Mock;
  const mockUsePathname = nextNavigation.usePathname as jest.Mock;
  const mockLink = Link as unknown as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockUseLocale.mockReset();
    mockUseTranslations.mockReset();
    mockUsePathname.mockReset();
    mockLink.mockClear();
  });

  it('should render language options and "Select Language" text in English', () => {
    mockUseLocale.mockReturnValue('en');
    mockUseTranslations.mockReturnValue((key: string) => messages.en.LanguageSwitcher[key as keyof typeof messages.en.LanguageSwitcher]);
    mockUsePathname.mockReturnValue('/some-page');

    render(<LanguageSwitcher />);

    expect(screen.getByText('Select Language:')).toBeInTheDocument();
    expect(screen.getByText('HI')).toBeInTheDocument();
    expect(screen.queryByText('EN')).not.toBeInTheDocument();
    
    // Verify mock was called and check specific props instead of exact arguments
    expect(mockLink).toHaveBeenCalled();
    const linkProps = mockLink.mock.calls[0][0]; // First argument of first call
    expect(linkProps).toMatchObject({
      href: '/some-page',
      locale: 'hi',
      children: 'HI'
    });
    expect(linkProps.className).toBeDefined();
  });

  it('should render language options and "भाषा चुनें" text in Hindi', () => {
    mockUseLocale.mockReturnValue('hi');
    mockUseTranslations.mockReturnValue((key: string) => messages.hi.LanguageSwitcher[key as keyof typeof messages.hi.LanguageSwitcher]);
    mockUsePathname.mockReturnValue('/some-page');

    render(<LanguageSwitcher />);

    expect(screen.getByText('भाषा चुनें:')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.queryByText('HI')).not.toBeInTheDocument();
    
    // Verify mock was called and check specific props instead of exact arguments
    expect(mockLink).toHaveBeenCalled();
    const linkProps = mockLink.mock.calls[0][0]; // First argument of first call
    expect(linkProps).toMatchObject({
      href: '/some-page',
      locale: 'en',
      children: 'EN'
    });
    expect(linkProps.className).toBeDefined();
  });

  it('should correctly generate links when pathname includes locale', () => {
    mockUseLocale.mockReturnValue('en');
    mockUseTranslations.mockReturnValue((key: string) => messages.en.LanguageSwitcher[key as keyof typeof messages.en.LanguageSwitcher]);
    mockUsePathname.mockReturnValue('/en/another-page');

    render(<LanguageSwitcher />);

    expect(screen.getByText('HI')).toBeInTheDocument();
    const linkElement1 = screen.getByText('HI').closest('a');
    expect(linkElement1).toHaveAttribute('href', '/another-page?locale=hi');
  });

  it('should correctly generate links for the root path when locale is in path', () => {
    mockUseLocale.mockReturnValue('hi');
    mockUseTranslations.mockReturnValue((key: string) => messages.hi.LanguageSwitcher[key as keyof typeof messages.hi.LanguageSwitcher]);
    mockUsePathname.mockReturnValue('/hi');

    render(<LanguageSwitcher />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
    const linkElement2 = screen.getByText('EN').closest('a');
    expect(linkElement2).toHaveAttribute('href', '/?locale=en'); 
  });

  it('should correctly generate links for the root path when current locale is default', () => {
    mockUseLocale.mockReturnValue('en');
    mockUseTranslations.mockReturnValue((key: string) => messages.en.LanguageSwitcher[key as keyof typeof messages.en.LanguageSwitcher]);
    mockUsePathname.mockReturnValue('/');

    render(<LanguageSwitcher />);
    
    expect(screen.getByText('HI')).toBeInTheDocument();
    const linkElement3 = screen.getByText('HI').closest('a');
    expect(linkElement3).toHaveAttribute('href', '/?locale=hi');
  });
});