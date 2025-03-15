import React, { useState, useEffect, useRef, useCallback } from 'react';
import MatchCard from './MatchCard';
import SearchBar from './SearchBar';
import MatchListSkeleton from './ui/MatchListSkeleton';
import ErrorMessage from './ui/ErrorMessage';
import EmptyState from './ui/EmptyState';
import { Match } from '@/types/match';

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
  
  // Başlangıçta gösterilecek maç sayısı
  const initialMatchCount = 15;
  // Her scroll'da eklenecek maç sayısı
  const matchesPerLoad = 10;
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMatchElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreMatches();
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

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
  }, [searchTerm, matches]);

  // Filtrelenmiş maçlar değiştiğinde ilk grup maçı göster
  useEffect(() => {
    setDisplayedMatches(filteredMatches.slice(0, initialMatchCount));
    setHasMore(filteredMatches.length > initialMatchCount);
  }, [filteredMatches]);

  // Daha fazla maç yükleme fonksiyonu
  const loadMoreMatches = () => {
    const currentSize = displayedMatches.length;
    const nextMatches = filteredMatches.slice(currentSize, currentSize + matchesPerLoad);
    
    if (nextMatches.length > 0) {
      setDisplayedMatches(prev => [...prev, ...nextMatches]);
      setHasMore(currentSize + nextMatches.length < filteredMatches.length);
    } else {
      setHasMore(false);
    }
  };

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
          <div className="space-y-3 mt-4">
            {displayedMatches.map((match, index) => {
              // Son elemana referans ekle
              if (displayedMatches.length === index + 1) {
                return (
                  <div 
                    ref={lastMatchElementRef}
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
          
          {isLoading && <p className="text-center mt-4">Yükleniyor...</p>}
          {!hasMore && displayedMatches.length > 0 && (
            <p className="text-center mt-4 text-gray-500">Tüm maçlar yüklendi</p>
          )}
        </>
      )}
    </div>
  );
};

export default MatchList; 