import { useState, useEffect } from 'react';
import { Match } from '@/types/match';

interface MatchesResponse {
  matches: Match[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Yaklaşan ve mevcut maçları getiren hook
 */
export function useMatches(): MatchesResponse {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        console.log('Maçlar yükleniyor...');
        
        // Yeni API endpoint'ini kullan
        const response = await fetch('/api/matches');
        
        if (!response.ok) {
          throw new Error('Maç verileri alınamadı');
        }
        
        const data = await response.json();
        console.log(`Maçlar yüklendi: ${data.length} maç`);
        setMatches(data);
      } catch (error) {
        console.error('Maç verileri yüklenirken hata:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return { matches, isLoading, isError };
} 