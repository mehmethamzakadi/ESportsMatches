"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Match } from '@/types/match';
import ReminderService from '@/services/ReminderService';
import { createPortal } from 'react-dom';
import { XMarkIcon as XIcon, CheckCircleIcon, ExclamationTriangleIcon as ExclamationIcon, XCircleIcon } from '@heroicons/react/24/outline';

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
      const reminderService = ReminderService.getInstance();
      const supportCheck = reminderService.checkNotificationSupport();
      
      setNotificationSupported(supportCheck.supported);
      setNotificationSupportReason(supportCheck.reason);
      
      if (supportCheck.supported && typeof Notification !== 'undefined') {
        setNotificationPermission(Notification.permission);
      }
    }
    
    // Modal açıldığında body'nin scroll'unu engelle
    document.body.style.overflow = 'hidden';
    
    // Temizleme fonksiyonu
    return () => {
      document.body.style.overflow = 'auto';
      setMounted(false);
    };
  }, []);

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
      
      const reminderService = ReminderService.getInstance();
      const permission = await reminderService.requestNotificationPermission();
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

  // Takvim dosyası oluştur ve indir
  const createCalendarFile = () => {
    if (!matchDate) {
      setError('Maç tarihi belirtilmemiş.');
      return;
    }

    try {
      const reminderService = ReminderService.getInstance();
      const reminderMinutes = parseInt(reminderTime, 10);
      
      // iCalendar içeriği oluştur
      const icsContent = reminderService.createCalendarFile(
        matchTitle,
        `${match.league.name} - ${match.serie.name}`,
        matchDate,
        reminderMinutes
      );
      
      // Dosyayı indir
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `match_${match.id}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsSuccess(true);
    } catch (error) {
      setError('Takvim dosyası oluşturulurken bir hata oluştu.');
      console.error('Calendar file creation error:', error);
    }
  };

  // Hatırlatıcı oluştur
  const createReminder = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const reminderService = ReminderService.getInstance();
      
      switch (selectedOption) {
        case 'browser':
          // Bildirim desteği kontrolü
          if (!notificationSupported) {
            throw new Error('Bu cihaz veya tarayıcı web bildirimlerini desteklemiyor. Lütfen başka bir hatırlatıcı yöntemi seçin.');
          }
          
          if (notificationPermission !== 'granted') {
            await requestNotificationPermission();
            if (notificationPermission !== 'granted') {
              throw new Error('Bildirim izni alınamadı.');
            }
          }
          
          // Hatırlatıcı verisi oluştur
          const reminderData = {
            id: `match_${match.id}`,
            title: matchTitle,
            message: `${match.league.name} - ${match.serie.name} maçı başlamak üzere!`,
            matchDate: matchDate?.toISOString() || null,
            reminderTime: parseInt(reminderTime, 10),
            created: new Date().toISOString()
          };
          
          // Hatırlatıcıyı kaydet
          reminderService.addReminder(reminderData);
          setIsSuccess(true);
          break;
          
        case 'calendar':
          createCalendarFile();
          break;
          
        case 'email':
          if (!email || !email.includes('@')) {
            throw new Error('Geçerli bir e-posta adresi giriniz.');
          }
          
          // Burada e-posta hatırlatıcısı için API çağrısı yapılabilir
          // Örnek: await fetch('/api/reminders/email', { method: 'POST', body: JSON.stringify({ email, matchId: match.id, reminderTime }) });
          
          // Şimdilik başarılı kabul edelim
          console.log(`E-posta hatırlatıcısı oluşturuldu: ${email} için ${matchTitle}`);
          setIsSuccess(true);
          break;
          
        default:
          throw new Error('Geçersiz hatırlatıcı tipi.');
      }
    } catch (err: any) {
      setError(err.message || 'Hatırlatıcı oluşturulurken bir hata oluştu.');
      console.error('Reminder creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal içeriği
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleOutsideClick}>
      <div ref={modalRef} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maç Hatırlatıcısı Oluştur</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>{matchTitle}</strong>
            <br />
            {formattedDate}
          </p>
        </div>
        
        {isSuccess ? (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Hatırlatıcı başarıyla oluşturuldu!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hatırlatıcı Tipi
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="browser"
                    name="notification-type"
                    type="radio"
                    value="browser"
                    checked={selectedOption === 'browser'}
                    onChange={() => setSelectedOption('browser')}
                    disabled={!notificationSupported}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label
                    htmlFor="browser"
                    className={`ml-3 block text-sm font-medium ${
                      !notificationSupported 
                        ? 'text-gray-400 dark:text-gray-500' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Tarayıcı Bildirimi
                    {!notificationSupported && (
                      <span className="ml-2 text-xs text-red-500">
                        (Bu cihazda desteklenmiyor)
                      </span>
                    )}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="calendar"
                    name="notification-type"
                    type="radio"
                    value="calendar"
                    checked={selectedOption === 'calendar'}
                    onChange={() => setSelectedOption('calendar')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="calendar" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Takvim Dosyası (.ics)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="email"
                    name="notification-type"
                    type="radio"
                    value="email"
                    checked={selectedOption === 'email'}
                    onChange={() => setSelectedOption('email')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    E-posta Bildirimi
                  </label>
                </div>
              </div>
            </div>
            
            {!notificationSupported && selectedOption === 'browser' && (
              <div className="mb-4 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                      {notificationSupportReason || 'Bu cihaz veya tarayıcı web bildirimlerini desteklemiyor. Lütfen başka bir hatırlatıcı yöntemi seçin.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedOption === 'email' && (
              <div className="mb-4">
                <label htmlFor="email-address" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  id="email-address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="ornek@email.com"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="reminder-time" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ne kadar önce hatırlatılsın?
              </label>
              <select
                id="reminder-time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="5">5 dakika önce</option>
                <option value="15">15 dakika önce</option>
                <option value="30">30 dakika önce</option>
                <option value="60">1 saat önce</option>
                <option value="120">2 saat önce</option>
                <option value="1440">1 gün önce</option>
              </select>
            </div>
            
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={createReminder}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {isSubmitting ? (
                  <>
                    <svg className="mr-2 -ml-1 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İşleniyor...
                  </>
                ) : (
                  'Hatırlatıcı Oluştur'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // React Portal kullanarak modal'ı doğrudan body'ye render et
  return mounted ? createPortal(modalContent, document.body) : null;
};

export default ReminderModal; 