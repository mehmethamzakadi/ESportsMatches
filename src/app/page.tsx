'use client';

import React from 'react';
import TabNavigation from '@/components/TabNavigation';
import MatchList from '@/components/MatchList';
import { useRunningMatches } from '@/lib/hooks';
import Header from '@/components/Header';

export default function Home() {
  const { matches, isLoading, isError } = useRunningMatches(1, 100);

  return (
    <div>
      <Header />
      
      <TabNavigation />
      
      <MatchList 
        matches={matches} 
        isLoading={isLoading} 
        isError={isError} 
        title="Aktif Maçlar" 
      />
    </div>
  );
} 