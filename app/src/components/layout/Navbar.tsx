import React from 'react';
import Link from 'next/link';
// import { useTranslations } from 'next-intl'; // If you need translations here

const Navbar = () => {
  // const t = useTranslations('Navbar'); // Example if using translations

  return (
    <nav className="bg-green-600 p-4">
      <ul className="flex space-x-4 justify-center text-white">
        <li>
          <Link href="/" className="hover:text-green-200">
            {/* {t('home')} */}
            Home
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="hover:text-green-200">
            {/* {t('dashboard')} */}
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/db-test" className="hover:text-green-200">
            {/* {t('dbTest')} */}
            DB Test
          </Link>
        </li>
        {/* Add other navigation links here */}
      </ul>
    </nav>
  );
};

export default Navbar;