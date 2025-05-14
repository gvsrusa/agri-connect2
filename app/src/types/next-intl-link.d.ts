declare module 'next-intl/link' {
  import * as React from 'react';
  import { LinkProps as NextLinkProps } from 'next/link'; // Assuming it's similar to next/link

  // Define a basic props interface based on common Link component usage
  // and the props used in the LanguageSwitcher component and its mock.
  // This might need adjustment if more specific props from next-intl/link are required.
  export interface NextIntlLinkProps extends Omit<NextLinkProps, 'locale'> {
    locale?: string;
    children?: React.ReactNode;
    className?: string;
    // Add any other props that next-intl/link might accept and are used
  }

  const Link: React.ForwardRefExoticComponent<NextIntlLinkProps & React.RefAttributes<HTMLAnchorElement>>;
  export default Link;
}