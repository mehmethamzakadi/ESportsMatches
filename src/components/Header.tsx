'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";

interface HeaderProps {
}

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="relative overflow-hidden rounded-lg mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg">
      <div className="absolute inset-0 opacity-10 bg-[url('/images/cs2-pattern.svg')] bg-repeat"></div>
      
      <div className="relative z-10 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4">
              <div className="bg-primary-600/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                <Link href="/" className="hover:text-gray-100 transition-colors">
                  CS2 <span className="text-primary-500">E-Sports</span> Hub
                </Link>
              </h1>
            </div>
            
            <div className="space-y-3 max-w-2xl">
              <p className="text-sm sm:text-base text-gray-300/90">
                Canlı maçları izleyin, yaklaşan turnuvaları takip edin ve favori takımlarınızın mücadelelerini kaçırmayın.
              </p>
              {!session && (
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700/40">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-primary-200">
                    Gelecek maçlara hatırlatıcı oluşturabilmek için lütfen Google hesabınızla giriş yapınız.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 via-yellow-500 to-green-500"></div>
    </header>
  );
} 