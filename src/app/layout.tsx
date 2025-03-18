import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ScrollToTop from '@/components/ScrollToTop';
import { ThemeProvider } from '@/lib/ThemeContext';
import ReminderProvider from '@/lib/ReminderProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CS2 E-Sports Matches',
  description: 'Gelecek, aktif ve geçmiş CS2 maçlarını takip edin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
        <ThemeProvider>
          <ReminderProvider>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <main className="container mx-auto px-4 py-4 max-w-6xl flex-grow">
                {children}
              </main>
              <footer className="mt-auto py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="container mx-auto px-4 text-center text-secondary-500 dark:text-secondary-400 text-sm">
                  <p>© {new Date().getFullYear()} CS2 E-Sports Matches. All rights reserved.</p>
                </div>
              </footer>
              <ScrollToTop />
            </div>
          </ReminderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 