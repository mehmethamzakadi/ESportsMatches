import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

interface TabItem {
  label: string;
  path: string;
  icon: string;
}

const tabs: TabItem[] = [
  {
    label: 'Gelecek Maçlar',
    path: '/',
    icon: '📅',
  },
  {
    label: 'Aktif Maçlar',
    path: '/running',
    icon: '🔴',
  },
  {
    label: 'Geçmiş Maçlar',
    path: '/past',
    icon: '📚',
  },
];

const TabNavigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 overflow-hidden transition-colors duration-200">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation; 