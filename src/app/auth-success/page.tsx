'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ClientReminderService from '@/services/ClientReminderService';

export default function AuthSuccessPage() {
  const router = useRouter();
  const [isCreatingReminder, setIsCreatingReminder] = useState(false);
  const [reminderCreated, setReminderCreated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reminderProcessedRef = useRef(false);
  
  // Bekleyen hatırlatıcıyı oluştur ve ana sayfaya yönlendir
  useEffect(() => {
    // Eğer işlem zaten yapıldıysa tekrar yapmayı önle
    if (reminderProcessedRef.current) return;
    
    const createPendingReminder = async () => {
      // İşlemi yalnızca bir kez çalıştırmak için flag'i ayarla
      reminderProcessedRef.current = true;
      
      try {
        setIsCreatingReminder(true);
        
        // localStorage'dan bekleyen hatırlatıcı bilgilerini al
        const pendingReminderJSON = localStorage.getItem('pendingEmailReminder');
        
        if (!pendingReminderJSON) {
          // Bekleyen hatırlatıcı bilgisi yok, sadece ana sayfaya yönlendir
          setTimeout(() => router.push('/'), 3000);
          return;
        }
        
        // JSON verisini parse et
        const pendingReminder = JSON.parse(pendingReminderJSON);
        
        // ClientReminderService ile e-posta hatırlatıcısı oluştur
        const reminderService = ClientReminderService.getInstance();
        const result = await reminderService.sendGoogleMailReminder(
          pendingReminder.email,
          pendingReminder.title,
          pendingReminder.message,
          pendingReminder.matchDate ? new Date(pendingReminder.matchDate) : null,
          pendingReminder.reminderMinutes
        );
        
        if (result.success) {
          setReminderCreated(true);
          // İşlem tamamlandıktan sonra localStorage'dan temizle
          localStorage.removeItem('pendingEmailReminder');
          
          // 3 saniye sonra ana sayfaya yönlendir
          setTimeout(() => router.push('/'), 3000);
        } else {
          // Hata oluştu, mesajı göster
          setErrorMessage(result.message);
          // Hataya rağmen 5 saniye sonra ana sayfaya yönlendir
          setTimeout(() => router.push('/'), 5000);
        }
      } catch (error) {
        // Hata oluştu, ana sayfaya yönlendir
        setErrorMessage('Hatırlatıcı oluşturulurken bir hata oluştu.');
        setTimeout(() => router.push('/'), 5000);
      } finally {
        setIsCreatingReminder(false);
      }
    };
    
    // Fonksiyonu çağır
    createPendingReminder();
  }, [router]); // Sadece router'a bağımlı
  
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
          
          {isCreatingReminder && (
            <p className="text-sm text-primary-600 font-medium mb-2">
              Hatırlatıcı oluşturuluyor...
            </p>
          )}
          
          {reminderCreated && (
            <p className="text-sm text-success-600 font-medium mb-2">
              Hatırlatıcı başarıyla oluşturuldu! E-posta gönderildi.
            </p>
          )}
          
          {errorMessage && (
            <p className="text-sm text-danger-600 font-medium mb-2">
              Hata: {errorMessage}
            </p>
          )}
          
          <p className="text-sm text-gray-500">
            Ana sayfaya otomatik olarak yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    </div>
  );
} 