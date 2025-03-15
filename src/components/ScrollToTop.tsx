"use client";

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { eventEmitter } from '@/utils/eventEmitter';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Kullanıcı belirli bir mesafeden fazla aşağı kaydırdığında butonu göster
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Sayfanın en üstüne kaydır ve infinite scroll'u sıfırla
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Infinite scroll'u sıfırlamak için event yayınla
    eventEmitter.emit('resetInfiniteScroll');
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center z-50 border border-gray-200 dark:border-gray-700 group"
          aria-label="Yukarı Çık"
        >
          <div className="flex flex-col items-center">
            <ArrowUp size={18} className="group-hover:-translate-y-1 transition-transform duration-300" />
            <span className="text-xs mt-1 font-medium">Yukarı</span>
          </div>
        </button>
      )}
    </>
  );
} 