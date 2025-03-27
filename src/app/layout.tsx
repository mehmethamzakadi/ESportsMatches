import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ScrollToTop from '@/components/ScrollToTop';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CS2 E-Sports Matches',
  description: 'Gelecek, aktif ve geçmiş CS2 maçlarını takip edin',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
        <Providers>
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
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
} 