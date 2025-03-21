"use client";

import React, { useState, useEffect } from 'react';
import { Match } from '@/types/match';
import MatchCard from '@/components/MatchCard';
import FavoriteService from '@/services/FavoriteService';
import { useMatches } from '@/hooks/useMatches';
import { StarIcon } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteMatches, setFavoriteMatches] = useState<Match[]>([]);
  const favoriteService = FavoriteService.getInstance();
  
  // Tüm maçları getir
  const { matches, isLoading, isError } = useMatches();
  
  // Favori maç ID'lerini takip et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // İlk yüklemede favori ID'lerini al
      setFavoriteIds(favoriteService.getFavorites());
      
      // Favori değişikliklerini dinle
      const handleFavoritesChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        setFavoriteIds(customEvent.detail?.favorites || []);
      };
      
      window.addEventListener('favoritesChanged', handleFavoritesChange);
      
      return () => {
        window.removeEventListener('favoritesChanged', handleFavoritesChange);
      };
    }
  }, [favoriteService]);
  
  // Favorilere eklenmiş maçları filtrele
  useEffect(() => {
    if (matches && matches.length > 0 && favoriteIds.length > 0) {
      const filtered = matches.filter(match => {
        return favoriteIds.includes(match.id);
      });
      
      setFavoriteMatches(filtered);
    } else {
      setFavoriteMatches([]);
    }
  }, [matches, favoriteIds]);
  
  // Favori maçları temizleme işlemi
  const clearAllFavorites = () => {
    if (confirm('Tüm favori maçlarınızı silmek istediğinize emin misiniz?')) {
      favoriteService.clearAllFavorites();
      // State'i güncelleme gerekmiyor çünkü event listener ile otomatik güncellenecek
    }
  };
  
  return (
    <div>
      <Header />
      
      <TabNavigation />
      
      <div className="container mx-auto px-4 mt-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <StarIcon className="h-6 w-6 text-yellow-500 mr-2" aria-hidden="true" />
            Favori Maçlarım
          </h2>
          
          {favoriteIds.length > 0 && (
            <button
              onClick={clearAllFavorites}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/40"
              title="Tüm favorileri temizle"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Favorileri Temizle
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center my-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-red-500">Maçlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
          </div>
        ) : favoriteMatches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <StarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Favori maçınız bulunmuyor</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Maç listesinden yıldız ikonuna tıklayarak favori maçlarınızı ekleyebilirsiniz.
              </p>
              <Link href="/" className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Maçları Görüntüle
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {favoriteMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 