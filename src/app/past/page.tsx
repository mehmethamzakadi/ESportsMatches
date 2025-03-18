'use client';

import React from 'react';
import TabNavigation from '@/components/TabNavigation';
import MatchList from '@/components/MatchList';
import { usePastMatches } from '@/lib/hooks';
import Header from '@/components/Header';

export default function PastMatches() {
  const { matches, isLoading, isError } = usePastMatches(1, 100);

  return (
    <div>
      <Header />
      
      <TabNavigation />
      
      <MatchList 
        matches={matches} 
        isLoading={isLoading} 
        isError={isError} 
        title="Geçmiş Maçlar" 
      />
    </div>
  );
} 