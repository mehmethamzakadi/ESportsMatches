'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
}

export default function Header() {
  return (
    <header className="relative overflow-hidden rounded-lg mb-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg">
      <div className="absolute inset-0 opacity-20 bg-[url('/images/cs2-pattern.svg')] bg-repeat"></div>
      
      <div className="relative z-10 py-12 px-6">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between max-w-4xl mx-auto">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="bg-primary-600 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                <Link href="/" className="hover:text-gray-100 transition-colors">
                  CS2 <span className="text-primary-500">E-Sports</span> Hub
                </Link>
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-xl">
              Canlı maçları izleyin, yaklaşan turnuvaları takip edin ve favori takımlarınızın mücadelelerini kaçırmayın.
            </p>
          </div>
          
          <div className="hidden md:block">
            <div className="relative w-40 h-40 bg-gray-800 rounded-lg shadow-inner overflow-hidden border-2 border-gray-700">
              <div className="absolute inset-0 flex items-center justify-center opacity-75">
                {/* CS2 Logosu */}
                <svg className="h-32 w-32 text-primary-600/30" viewBox="0 0 36 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeWidth="2" stroke="currentColor" fill="none" />
                  <path d="M11 13 L20 13 L25 20 L20 27 L11 27 L6 20 Z" strokeWidth="1" stroke="currentColor" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-yellow-500 to-green-500"></div>
    </header>
  );
} 