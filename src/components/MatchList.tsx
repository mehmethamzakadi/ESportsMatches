import React, { useState, useEffect, useRef, useCallback } from 'react';
import MatchCard from './MatchCard';
import SearchBar from './SearchBar';
import MatchListSkeleton from './ui/MatchListSkeleton';
import ErrorMessage from './ui/ErrorMessage';
import EmptyState from './ui/EmptyState';
import { Match } from '@/types/match';
import { eventEmitter } from '@/utils/eventEmitter';

interface MatchListProps {
  matches: Match[];
  isLoading: boolean;
  isError: any;
  title: string;
}

const MatchList: React.FC<MatchListProps> = ({ matches, isLoading, isError, title }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [displayedMatches, setDisplayedMatches] = useState<Match[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Başlangıçta gösterilecek maç sayısı
  const initialMatchCount = 15;
  // Her scroll'da eklenecek maç sayısı
  const matchesPerLoad = 10;
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Infinite scroll'u sıfırlama fonksiyonu
  const resetInfiniteScroll = useCallback(() => {
    // Observer'ı temizle
    if (observer.current) {
      observer.current.disconnect();
    }
    
    // İlk maçları göster
    const initialMatches = filteredMatches.slice(0, initialMatchCount);
    setDisplayedMatches(initialMatches);
    
    // hasMore'u güncelle
    const newHasMore = filteredMatches.length > initialMatchCount;
    setHasMore(newHasMore);
    setLoadingMore(false);
  }, [filteredMatches, initialMatchCount]);
  
  // Daha fazla maç yükleme fonksiyonu
  const loadMoreMatches = useCallback(() => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    
    // Asenkron işlemi simüle etmek için setTimeout kullanıyoruz
    setTimeout(() => {
      const currentSize = displayedMatches.length;
      
      // Eğer tüm maçlar zaten yüklendiyse, hasMore'u false yap ve çık
      if (currentSize >= filteredMatches.length) {
        setHasMore(false);
        setLoadingMore(false);
        //console.log('Tüm maçlar zaten yüklenmiş, daha fazla yükleme yapılmayacak');
        return;
      }
      
      const nextMatches = filteredMatches.slice(currentSize, currentSize + matchesPerLoad);
      
      if (nextMatches.length > 0) {
        setDisplayedMatches(prev => [...prev, ...nextMatches]);
        // Eğer yüklenen son maç, filtrelenmiş maçların sonuncusuysa hasMore'u false yap
        const newHasMore = currentSize + nextMatches.length < filteredMatches.length;
        setHasMore(newHasMore);
        //console.log(`Yeni maçlar yüklendi. Toplam: ${currentSize + nextMatches.length}/${filteredMatches.length}, Daha fazla var mı: ${newHasMore}`);
      } else {
        setHasMore(false);
        //console.log('Yüklenecek başka maç kalmadı');
      }
      
      setLoadingMore(false);
    }, 300);
  }, [displayedMatches, filteredMatches, hasMore, loadingMore]);
  
  const lastMatchElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || loadingMore || !hasMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        //console.log('Son eleman görünür oldu, daha fazla maç yükleniyor...');
        loadMoreMatches();
      }
    }, { threshold: 0.1, rootMargin: '100px' });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadingMore, loadMoreMatches]);

  // Arama terimine göre maçları filtrele
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMatches(matches);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = matches.filter(match => {
        // Takım adlarında arama yap
        const team1Name = match.opponents[0]?.opponent.name.toLowerCase() || '';
        const team2Name = match.opponents[1]?.opponent.name.toLowerCase() || '';
        
        return team1Name.includes(term) || team2Name.includes(term);
      });
      setFilteredMatches(filtered);
    }
    
    // Arama yapıldığında görüntülenen maçları sıfırla
    setDisplayedMatches([]);
    setHasMore(true);
    setLoadingMore(false);
  }, [searchTerm, matches]);

  // Filtrelenmiş maçlar değiştiğinde ilk grup maçı göster
  useEffect(() => {
    const initialMatches = filteredMatches.slice(0, initialMatchCount);
    setDisplayedMatches(initialMatches);
    
    // Eğer filtrelenmiş maç sayısı başlangıçta gösterilecek maç sayısından azsa veya eşitse
    // hasMore'u false yap
    const newHasMore = filteredMatches.length > initialMatchCount;
    setHasMore(newHasMore);
    //console.log(`İlk maçlar yüklendi. Toplam: ${initialMatches.length}/${filteredMatches.length}, Daha fazla var mı: ${newHasMore}`);
  }, [filteredMatches]);

  // resetInfiniteScroll eventini dinle
  useEffect(() => {
    const cleanup = eventEmitter.on('resetInfiniteScroll', resetInfiniteScroll);
    
    return cleanup;
  }, [resetInfiniteScroll]);

  // Component unmount olduğunda observer'ı temizle
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  if (isLoading) {
    return <MatchListSkeleton title={title} count={4} />;
  }

  if (isError) {
    return <ErrorMessage title={title} message="Maç verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin." />;
  }

  if (matches.length === 0) {
    return <EmptyState title={title} message="Şu anda gösterilecek maç bulunmuyor." />;
  }

  return (
    <div className="py-6 container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Toplam {filteredMatches.length} maç
        </div>
      </div>
      
      <SearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        placeholder="Takım adına göre ara..."
      />
      
      {filteredMatches.length === 0 ? (
        <EmptyState 
          title="" 
          message={`"${searchTerm}" aramasına uygun maç bulunamadı.`} 
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
            {displayedMatches.map((match, index) => {
              // Son elemana referans ekle
              if (displayedMatches.length === index + 1) {
                return (
                  <div 
                    ref={hasMore ? lastMatchElementRef : null}
                    key={`${match.id}-${index}`}
                  >
                    <MatchCard 
                      match={match} 
                      showDates={true} 
                    />
                  </div>
                );
              } else {
                return (
                  <div key={`${match.id}-${index}`}>
                    <MatchCard 
                      match={match} 
                      showDates={true} 
                    />
                  </div>
                );
              }
            })}
          </div>
          
          {loadingMore && (
            <p className="text-center mt-4 text-gray-500">Daha fazla maç yükleniyor...</p>
          )}
          
          {!hasMore && displayedMatches.length > 0 && (
            <p className="text-center mt-4 text-gray-500">Tüm maçlar yüklendi</p>
          )}
        </>
      )}
    </div>
  );
};

export default MatchList; 