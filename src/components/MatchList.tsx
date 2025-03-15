import React, { useState, useEffect } from 'react';
import MatchCard from './MatchCard';
import SearchBar from './SearchBar';
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

  // Sayfalama butonlarını oluştur
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Başlangıç sayfasını ayarla
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // İlk sayfa butonu
    if (startPage > 1) {
      pageButtons.push(
        <button
          key="first"
          onClick={() => changePage(1)}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageButtons.push(
          <span key="ellipsis1" className="px-2 text-gray-500 dark:text-gray-400">
            ...
          </span>
        );
      }
    }

    // Sayfa numaraları
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => changePage(i)}
          className={`px-3 py-1 rounded-md ${
            i === currentPage
              ? 'bg-blue-600 dark:bg-blue-700 text-white border border-blue-600 dark:border-blue-700'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          } transition-colors`}
        >
          {i}
        </button>
      );
    }

    // Son sayfa butonu
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(
          <span key="ellipsis2" className="px-2 text-gray-500 dark:text-gray-400">
            ...
          </span>
        );
      }
      pageButtons.push(
        <button
          key="last"
          onClick={() => changePage(totalPages)}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          } transition-colors`}
        >
          Önceki
        </button>
        {pageButtons}
        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          } transition-colors`}
        >
          Sonraki
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <div className="ml-4 h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse h-full">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="flex justify-between items-center my-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">{title}</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg shadow-sm">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Maç verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">{title}</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-6 py-8 rounded-lg shadow-sm text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-blue-400 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">Şu anda gösterilecek maç bulunmuyor.</p>
        </div>
      </div>
    );
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-6 py-8 rounded-lg shadow-sm text-center mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-blue-400 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">"{searchTerm}" aramasına uygun maç bulunamadı.</p>
        </div>
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
          
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default MatchList; 