import useSWR from 'swr';
import { getUpcomingMatches, getRunningMatches, getPastMatches } from './api';
import { Match } from '@/types/match';
import { useState, useEffect } from 'react';

// SWR fetcher fonksiyonu
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Gelecek maçlar için hook
export function useUpcomingMatches(page = 1, perPage = 100) {
  const { data, error, isLoading, mutate } = useSWR<Match[]>(
    `upcoming-matches-${page}-${perPage}`,
    () => getUpcomingMatches(page, perPage),
    {
      //refreshInterval: 60000, // Her 1 dakikada bir yenile
      revalidateOnFocus: true,
    }
  );

  return {
    matches: data || [],
    isLoading,
    isError: error,
    mutate,
    totalMatches: data?.length || 0,
  };
}

// Aktif maçlar için hook
export function useRunningMatches(page = 1, perPage = 100) {
  const { data, error, isLoading, mutate } = useSWR<Match[]>(
    `running-matches-${page}-${perPage}`,
    () => getRunningMatches(page, perPage),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      suspense: false,
      fallbackData: [], // Boş array ile başla
      loadingTimeout: 2000, // 2 saniye loading state'i göster
      keepPreviousData: true // Önceki veriyi tut
    }
  );

  return {
    matches: data || [],
    isLoading,
    isError: error,
    mutate,
    totalMatches: data?.length || 0,
  };
}

// Geçmiş maçlar için hook
export function usePastMatches(page = 1, perPage = 100) {
  const { data, error, isLoading, mutate } = useSWR<Match[]>(
    `past-matches-${page}-${perPage}`,
    () => getPastMatches(page, perPage),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    matches: data || [],
    isLoading,
    isError: error,
    mutate,
    totalMatches: data?.length || 0,
  };
} 