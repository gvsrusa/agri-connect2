import React from 'react';

// This is the mock component that will be used by Jest
const MockedLink = jest.fn(
  ({
    href,
    locale,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string; locale: string; [key: string]: any }>) => {
    // Simulate the Link behavior for testing purposes
    // You can add more sophisticated logic here if needed for your tests
    const path = href.startsWith('/') ? href : `/${href}`;
    const localeQuery = locale ? `?locale=${locale}` : '';
    const fullPath = `${path}${localeQuery}`;
    
    return (
      <a href={fullPath} data-testid="mocked-next-intl-link" {...props}>
        {children}
      </a>
    );
  }
);

export default MockedLink;