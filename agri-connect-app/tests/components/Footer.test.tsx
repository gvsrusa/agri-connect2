import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({children, href}: {children: React.ReactNode, href: string}) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays copyright information', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} AgriConnect. All rights reserved.`)).toBeInTheDocument();
  });

  it('contains links to relevant pages or information', () => {
    render(<Footer />);
    // Example: Check for a "Privacy Policy" link
    // Replace with actual links present in your Footer
    // expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    // expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
    // For now, just check if the footer is there
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});