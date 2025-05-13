import React from 'react';
import { UserButton } from '@clerk/nextjs';
// import LanguageSwitcher from '@/components/ui/LanguageSwitcher'; // Or from features/auth/components

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">AgriConnect</div>
      <nav className="flex items-center space-x-4">
        {/* Placeholder for Navbar items if they are part of the header */}
        {/* <LanguageSwitcher /> */}
        <UserButton afterSignOutUrl="/" />
      </nav>
    </header>
  );
};

export default Header;