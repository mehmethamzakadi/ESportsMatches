import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import AuthButtons from './AuthButtons';

interface TabItem {
  label: string;
  path: string;
  icon: string;
}

const tabs: TabItem[] = [
  {
    label: 'Aktif Maçlar',
    path: '/',
    icon: '🔴',
  },
  {
    label: 'Gelecek Maçlar',
    path: '/upcoming',
    icon: '📅',
  },
  {
    label: 'Geçmiş Maçlar',
    path: '/past',
    icon: '📚',
  },
  {
    label: 'Favorilerim',
    path: '/favorites',
    icon: '⭐',
  },
];

const TabNavigation: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 overflow-hidden transition-colors duration-200 border border-gray-100 dark:border-gray-700">
      <div className="container mx-auto relative">
        {/* Desktop horizontal tabs */}
        <div className="hidden md:block">
          <div className="flex justify-between items-center">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400'
                        : 'text-secondary-600 dark:text-secondary-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <span className="mr-2 text-lg">{tab.icon}</span>
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-4 px-4 py-2">
              <AuthButtons />
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Mobile view */}
        <div className="md:hidden">
          {/* Top bar with active tab and controls */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-lg mr-2">{tabs.find(tab => tab.path === pathname)?.icon}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {tabs.find(tab => tab.path === pathname)?.label}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <AuthButtons />
              <ThemeToggle />
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-secondary-600 dark:text-secondary-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-opacity-50 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile dropdown menu */}
          {isMenuOpen && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-6 py-3 text-sm font-medium border-b border-gray-100 dark:border-gray-700 transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-secondary-600 dark:text-secondary-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <span className="mr-2 text-lg">{tab.icon}</span>
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation; 