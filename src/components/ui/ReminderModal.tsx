"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Match } from '@/types/match';
import ReminderService from '@/services/ReminderService';
import NotificationService from '@/services/NotificationService';
import CalendarService from '@/services/CalendarService';
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
  const reminderService = ReminderService.getInstance();
  const notificationService = NotificationService.getInstance();
  const calendarService = CalendarService.getInstance();

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

  // Takvim dosyası oluştur ve indir
  const createCalendarFile = () => {
    if (!matchDate) {
      setError('Maç tarihi belirtilmemiş.');
      return;
    }

    try {
      const reminderMinutes = parseInt(reminderTime, 10);
      
      // iCalendar içeriği oluştur
      const icsContent = calendarService.createCalendarContent(
        matchTitle,
        `${match.league.name} - ${match.serie.name}`,
        matchDate,
        reminderMinutes
      );
      
      // URL oluşturup dosyayı indir
      const downloadUrl = calendarService.generateCalendarURL(icsContent);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `match_${match.id}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URL'i temizle
      URL.revokeObjectURL(downloadUrl);
      
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
      } else if (selectedOption === 'calendar') {
        createCalendarFile();
      } else if (selectedOption === 'email') {
        // E-posta bildirimi gönder
        const emailResult = await reminderService.sendEmailReminder(
          email,
          matchTitle,
          `${match.league.name} - ${match.serie.name} maçı ${reminderMinutes} dakika içinde başlayacak!`,
          matchDate,
          reminderMinutes
        );
        
        if (emailResult.success) {
          setIsSuccess(true);
        } else {
          throw new Error(emailResult.message || 'E-posta bildirimi gönderilemedi');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Hatırlatıcı oluşturulurken bir hata oluştu.');
      console.error('Reminder creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eğer client tarafında değilse, içerik render edilmiyor
  if (!mounted) return null;

  // Modal içeriği
  return createPortal(
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
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Hatırlatıcı başarıyla oluşturuldu!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hatırlatıcı tipi:
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="browser"
                    name="notificationType"
                    type="radio"
                    value="browser"
                    checked={selectedOption === 'browser'}
                    onChange={() => setSelectedOption('browser')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="browser" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tarayıcı bildirimi
                  </label>
                </div>
                
                {selectedOption === 'browser' && notificationPermission !== 'granted' && notificationSupported && (
                  <div className="ml-7">
                    <button
                      type="button"
                      onClick={requestNotificationPermission}
                      className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Bildirim izni ver
                    </button>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    id="calendar"
                    name="notificationType"
                    type="radio"
                    value="calendar"
                    checked={selectedOption === 'calendar'}
                    onChange={() => setSelectedOption('calendar')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="calendar" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Takvim dosyası
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="email"
                    name="notificationType"
                    type="radio"
                    value="email"
                    checked={selectedOption === 'email'}
                    onChange={() => setSelectedOption('email')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="email" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    E-posta bildirimi
                  </label>
                </div>
                
                {selectedOption === 'email' && (
                  <div className="ml-7 mt-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-posta adresiniz"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hatırlatma zamanı:
              </label>
              <select
                id="reminderTime"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="5">5 dakika önce</option>
                <option value="15">15 dakika önce</option>
                <option value="30">30 dakika önce</option>
                <option value="60">1 saat önce</option>
                <option value="120">2 saat önce</option>
                <option value="1440">1 gün önce</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={createReminder}
                disabled={isSubmitting || (selectedOption === 'email' && !email)}
                className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSubmitting || (selectedOption === 'email' && !email)
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                }`}
              >
                {isSubmitting ? 'İşleniyor...' : 'Hatırlatıcı Oluştur'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ReminderModal; 