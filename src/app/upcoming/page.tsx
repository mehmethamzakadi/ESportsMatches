'use client';

import React from 'react';
import TabNavigation from '@/components/TabNavigation';
import MatchList from '@/components/MatchList';
import { useUpcomingMatches } from '@/lib/hooks';
import Header from '@/components/Header';

export default function UpcomingMatches() {
  const { matches, isLoading, isError } = useUpcomingMatches(1, 100);

  return (
    <div>
      <Header />
      
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