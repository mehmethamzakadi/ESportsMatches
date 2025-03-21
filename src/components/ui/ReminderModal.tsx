"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Match } from '@/types/match';
import ClientReminderService from '@/services/ClientReminderService';
import NotificationService from '@/services/NotificationService';
import { createPortal } from 'react-dom';
import { XMarkIcon as XIcon, CheckCircleIcon, ExclamationTriangleIcon as ExclamationIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ReminderData } from '@/types/reminder';

interface ReminderModalProps {
  match: Match;
  onClose: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ match, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string>('browser');
  const [email, setEmail] = useState<string>('');
  const [reminderTime, setReminderTime] = useState<string>('15');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Servis instansları
  const reminderService = ClientReminderService.getInstance();
  const notificationService = NotificationService.getInstance();

  // Maç bilgilerini formatla
  const matchTitle = `${match.opponents[0]?.opponent.name || 'TBD'} vs ${match.opponents[1]?.opponent.name || 'TBD'}`;
  const matchDate = match.begin_at ? new Date(match.begin_at) : null;
  const formattedDate = matchDate ? matchDate.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : 'TBA';

  // Tarayıcı bildirimleri için izin kontrolü
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [notificationSupported, setNotificationSupported] = useState<boolean>(true);
  const [notificationSupportReason, setNotificationSupportReason] = useState<string | undefined>(undefined);

  // Bileşen yüklendiğinde bildirim izni durumunu kontrol et
  useEffect(() => {
    setMounted(true);
    
    // Bildirim desteğini kontrol et
    if (typeof window !== 'undefined') {
      const supportCheck = notificationService.checkNotificationSupport();
      
      setNotificationSupported(supportCheck.supported);
      setNotificationSupportReason(supportCheck.reason);
      
      if (supportCheck.supported) {
        setNotificationPermission(notificationService.getNotificationPermission());
      }
    }
    
    // Modal açıldığında body'nin scroll'unu engelle
    document.body.style.overflow = 'hidden';
    
    // Temizleme fonksiyonu
    return () => {
      document.body.style.overflow = 'auto';
      setMounted(false);
    };
  }, [notificationService]);

  // Başarılı olduğunda modalı kapat
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      // Temizleme fonksiyonu
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  // ESC tuşu ile modalı kapat
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  // Modal dışına tıklandığında kapat
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  // Tarayıcı bildirimleri için izin iste
  const requestNotificationPermission = async () => {
    try {
      // Bildirim desteği kontrolü
      if (!notificationSupported) {
        setError(notificationSupportReason || 'Bu cihaz veya tarayıcı web bildirimlerini desteklemiyor. Lütfen başka bir hatırlatıcı yöntemi seçin.');
        return;
      }
      
      const permission = await notificationService.requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setSelectedOption('browser');
      } else {
        setError('Bildirim izni reddedildi. Hatırlatıcı almak için izin vermeniz gerekiyor.');
      }
    } catch (err) {
      setError('Bildirim izni istenirken bir hata oluştu.');
      console.error('Notification permission error:', err);
    }
  };

  // Hatırlatıcı oluştur
  const createReminder = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!match) {
        throw new Error('Maç bilgisi bulunamadı');
      }
      
      // E-posta geçerliliğini kontrol et
      if (selectedOption === 'email') {
        if (!email || !email.includes('@')) {
          throw new Error('Lütfen geçerli bir e-posta adresi girin');
        }
        
        if (!reminderService.validateEmail(email)) {
          throw new Error('Lütfen geçerli bir e-posta adresi girin');
        }
      }

      // Gerekli bilgileri kontrol et
      if (!matchDate) {
        throw new Error('Maç tarihi bulunamadı');
      }
      
      // Hatırlatıcı zamanını dakika olarak al
      const reminderMinutes = parseInt(reminderTime, 10);
      
      // Maç başlığını oluştur
      const matchTitle = `${match.opponents[0]?.opponent.name || 'TBD'} vs ${match.opponents[1]?.opponent.name || 'TBD'}`;
      
      if (selectedOption === 'browser') {
        // Bildirim desteği kontrolü
        if (!notificationSupported) {
          throw new Error('Bu cihaz veya tarayıcı web bildirimlerini desteklemiyor. Lütfen başka bir hatırlatıcı yöntemi seçin.');
        }
        
        // İzin kontrolü ve gerekiyorsa isteme
        let currentPermission = notificationPermission;
        if (currentPermission !== 'granted') {
          // İzin iste ve fonksiyonun döndürdüğü değeri doğrudan kullan
          currentPermission = await notificationService.requestNotificationPermission();
          // State güncelleme asenkron olduğu için yerel değişkeni güncelleyelim
          setNotificationPermission(currentPermission);
          
          // Kontrol için state yerine yerel değişkeni kullan
          if (currentPermission !== 'granted') {
            throw new Error('Bildirim izni alınamadı.');
          }
        }
        
        // Hatırlatıcı verisi oluştur
        const reminderData: ReminderData = {
          id: `match_${match.id}`,
          title: matchTitle,
          message: `${match.league.name} - ${match.serie.name} maçı başlamak üzere!`,
          matchDate: matchDate?.toISOString() || null,
          reminderTime: reminderMinutes,
          created: new Date().toISOString()
        };
        
        // Hatırlatıcıyı kaydet
        reminderService.addReminder(reminderData);
        setIsSuccess(true);
      } else if (selectedOption === 'email') {
        // E-posta için hatırlatıcı verisi oluştur
        const emailTitle = matchTitle;
        const emailMessage = `${match.league.name} - ${match.serie.name} maçı ${reminderMinutes} dakika içinde başlayacak!`;

        // Anında e-posta gönderme
        const emailResult = await reminderService.sendGoogleMailReminder(
          email,
          emailTitle,
          emailMessage,
          matchDate,
          reminderMinutes
        );

        if (emailResult.success) {
          setIsSuccess(true);
        } else {
          // Yetkilendirme URL'si varsa otomatik yönlendir
          if (emailResult.authRequired && emailResult.authUrl) {
            // Hatırlatıcı bilgilerini localStorage'a kaydet
            const reminderInfo = {
              email,
              title: emailTitle,
              message: emailMessage,
              matchDate: matchDate ? matchDate.toISOString() : null,
              reminderMinutes
            };
            localStorage.setItem('pendingEmailReminder', JSON.stringify(reminderInfo));
            
            // Aynı sekmede Google yetkilendirme sayfasına yönlendir
            window.location.href = emailResult.authUrl;
            return; // Yönlendirme yaptıktan sonra fonksiyonu sonlandır
          } else {
            throw new Error(emailResult.message);
          }
        }
      }
    } catch (error) {
      setError((error as Error).message || 'Hatırlatıcı oluşturulurken bir hata oluştu.');
      console.error('Reminder creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modalı oluştur
  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Başlık */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Maç Hatırlatıcısı
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Modal İçerik */}
        <div className="p-4">
          {/* Başarılı Mesajı */}
          {isSuccess ? (
            <div className="flex flex-col items-center p-6 text-center">
              <CheckCircleIcon className="h-12 w-12 text-success-500 mb-4" />
              <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Hatırlatıcı Oluşturuldu!
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedOption === 'email' 
                  ? 'E-posta anında gönderildi.' 
                  : 'Maç zamanı yaklaştığında size bildirim gönderilecek.'}
              </p>
            </div>
          ) : (
            <>
              {/* Maç Bilgileri */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Maç:
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {matchTitle}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 mb-1">
                  Tarih:
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formattedDate}
                </div>
              </div>
  
              {/* Hata Mesajı */}
              {error && (
                <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300 rounded-md flex items-start">
                  <ExclamationIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    {error}
                  </div>
                </div>
              )}
              
              {/* Hatırlatıcı Türü Seçimi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hatırlatıcı Türü
                </label>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary-600 dark:text-primary-400"
                      name="reminder-type"
                      value="browser"
                      checked={selectedOption === 'browser'}
                      onChange={() => setSelectedOption('browser')}
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Tarayıcı Bildirimi
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary-600 dark:text-primary-400"
                      name="reminder-type"
                      value="email"
                      checked={selectedOption === 'email'}
                      onChange={() => setSelectedOption('email')}
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      E-posta Bildirimi
                    </span>
                  </label>
                </div>
              </div>
              
              {/* E-posta Girişi (Sadece e-posta türü seçildiğinde) */}
              {selectedOption === 'email' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@adresiniz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              
              {/* Hatırlatıcı Zamanı */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hatırlatıcı Zamanı
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                >
                  <option value="5">5 dakika önce</option>
                  <option value="15">15 dakika önce</option>
                  <option value="30">30 dakika önce</option>
                  <option value="60">1 saat önce</option>
                  <option value="120">2 saat önce</option>
                  <option value="1440">1 gün önce</option>
                </select>
              </div>
              
              {/* İzin Bildirim Mesajı (Tarayıcı bildirimi seçiliyse) */}
              {selectedOption === 'browser' && notificationPermission !== 'granted' && (
                <div className="mb-4 p-3 bg-info-50 dark:bg-info-900/30 text-info-800 dark:text-info-300 rounded-md text-sm">
                  <p className="mb-2">Bu tarayıcıda bildirim izni gerekiyor.</p>
                  <button
                    onClick={requestNotificationPermission}
                    className="w-full px-3 py-2 bg-info-600 hover:bg-info-700 dark:bg-info-700 dark:hover:bg-info-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-info-500 focus:ring-opacity-50 text-sm font-medium"
                  >
                    Bildirim İzni İste
                  </button>
                </div>
              )}
              
              {/* Bildirim Desteği Uyarısı */}
              {selectedOption === 'browser' && !notificationSupported && (
                <div className="mb-4 p-3 bg-warning-50 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300 rounded-md flex items-start text-sm">
                  <ExclamationIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    {notificationSupportReason || 'Bu cihaz veya tarayıcı web bildirimlerini desteklemiyor. Lütfen başka bir hatırlatıcı yöntemi seçin.'}
                  </div>
                </div>
              )}
              
              {/* Butonlar */}
              <div className="mt-6">
                <button
                  onClick={createReminder}
                  disabled={isSubmitting || (selectedOption === 'browser' && notificationPermission !== 'granted')}
                  className={`w-full px-4 py-2 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 font-medium ${
                    (isSubmitting || (selectedOption === 'browser' && notificationPermission !== 'granted'))
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800'
                  }`}
                >
                  {isSubmitting ? 'İşlem Yapılıyor...' : 'Hatırlatıcı Oluştur'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Portal kullanarak body'ye modal ekle
  return mounted ? createPortal(modalContent, document.body) : null;
};

export default ReminderModal; 