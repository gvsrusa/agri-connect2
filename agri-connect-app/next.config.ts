import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   turbo: true, // Already enabled via --turbopack in dev script
  // },
};

export default withNextIntl(nextConfig);
