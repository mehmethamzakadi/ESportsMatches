import React, { useState, useEffect } from 'react';
import MatchCard from './MatchCard';
import SearchBar from './SearchBar';
import Pagination from './ui/Pagination';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedMatches, setPaginatedMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const matchesPerPage = 10;

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
    // Arama yapıldığında ilk sayfaya dön
    setCurrentPage(1);
  }, [searchTerm, matches]);

  // Sayfalama için toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  // Sayfa değiştiğinde veya filtrelenmiş maçlar güncellendiğinde, gösterilecek maçları güncelle
  useEffect(() => {
    const startIndex = (currentPage - 1) * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    setPaginatedMatches(filteredMatches.slice(startIndex, endIndex));
  }, [filteredMatches, currentPage]);

  // Sayfa değiştirme fonksiyonu
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="py-8 container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Toplam {filteredMatches.length} maç ({currentPage}/{totalPages} sayfa)
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {paginatedMatches.map((match) => (
              <div key={match.id} className="h-full flex">
                <MatchCard 
                  match={match} 
                  showDates={true} 
                />
              </div>
            ))}
          </div>
          
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={changePage} 
          />
        </>
      )}
    </div>
  );
};

export default MatchList; 