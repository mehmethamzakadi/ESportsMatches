'use client';

import React from 'react';
import TabNavigation from '@/components/TabNavigation';
import MatchList from '@/components/MatchList';
import { useUpcomingMatches } from '@/lib/hooks';

export default function Home() {
  const { matches, isLoading, isError } = useUpcomingMatches(1, 100);

  return (
    <div>
      <header className="py-8 mb-2">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
          CS2 <span className="text-blue-600 dark:text-blue-400">E-Sports</span> Maçları
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
          Gelecek, aktif ve geçmiş CS2 maçlarını takip edin
        </p>
      </header>
      
      <TabNavigation />
      
      <MatchList 
        matches={matches} 
        isLoading={isLoading} 
        isError={isError} 
        title="Gelecek Maçlar" 
      />
    </div>
  );
} 