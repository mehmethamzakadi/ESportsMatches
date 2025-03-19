'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  
  // 3 saniye sonra ana sayfaya yönlendir
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/');
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="flex flex-col items-center">
          <div className="mb-4 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Yetkilendirme Başarılı
          </h2>
          
          <p className="text-gray-600 text-center mb-6">
            Google hesabınızla başarıyla yetkilendirildiniz. Artık e-posta bildirimleri için Google Mail servisini kullanabilirsiniz.
          </p>
          
          <p className="text-sm text-gray-500">
            Ana sayfaya otomatik olarak yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    </div>
  );
} 