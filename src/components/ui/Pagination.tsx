import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
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
        onClick={() => onPageChange(1)}
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
        onClick={() => onPageChange(i)}
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
        onClick={() => onPageChange(totalPages)}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
      >
        {totalPages}
      </button>
    );
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
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
        onClick={() => onPageChange(currentPage + 1)}
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

export default Pagination; 