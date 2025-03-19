'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // URL'den hata mesajını al
  useEffect(() => {
    const message = searchParams.get('message');
    setErrorMessage(message || 'Bilinmeyen bir hata oluştu');
  }, [searchParams]);
  
  // 5 saniye sonra ana sayfaya yönlendir
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/');
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="flex flex-col items-center">
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Yetkilendirme Hatası
          </h2>
          
          <p className="text-red-600 text-center mb-6">
            {errorMessage}
          </p>
          
          <p className="text-gray-600 text-center mb-6">
            Google hesabınızla yetkilendirme sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin veya farklı bir e-posta hatırlatıcı yöntemi seçin.
          </p>
          
          <p className="text-sm text-gray-500">
            Ana sayfaya otomatik olarak yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    </div>
  );
} 