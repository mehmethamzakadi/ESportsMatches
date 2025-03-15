import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ScrollToTop from '@/components/ScrollToTop';
import { ThemeProvider } from '@/lib/ThemeContext';
import ReminderProvider from '@/lib/ReminderProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CS:GO E-Sports Matches',
  description: 'Track upcoming, running, and past CS:GO matches',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ReminderProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <main className="container mx-auto px-4 py-4 max-w-6xl">
                {children}
              </main>
              <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
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