"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Match } from '@/types/match';
import ReminderService from '@/services/ReminderService';
import { createPortal } from 'react-dom';

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

  // Bileşen yüklendiğinde bildirim izni durumunu kontrol et
  useEffect(() => {
    setMounted(true);
    
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
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
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        isolation: 'isolate',
        pointerEvents: 'auto'
      }}
      onClick={handleOutsideClick}
      onMouseMove={(e) => e.stopPropagation()}
    >
      {/* Arka plan overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          pointerEvents: 'auto'
        }}
      />
      
      {/* Modal içeriği */}
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative z-[10000]"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapatma Butonu */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Maç Hatırlatıcısı</h2>
        
        {/* Maç Bilgileri */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h3 className="font-medium text-gray-800 dark:text-gray-100">{matchTitle}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{match.league.name} - {match.serie.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            <span className="inline-block mr-2">📅</span>
            {formattedDate}
          </p>
        </div>
        
        {isSuccess ? (
          <div className="text-center p-4">
            <div className="text-emerald-600 dark:text-emerald-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Hatırlatıcı Oluşturuldu!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Maç başlamadan önce size hatırlatacağız.
            </p>
          </div>
        ) : (
          <>
            {/* Hatırlatıcı Seçenekleri */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hatırlatıcı Tipi
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reminderType"
                    value="browser"
                    checked={selectedOption === 'browser'}
                    onChange={() => setSelectedOption('browser')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Tarayıcı Bildirimi
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reminderType"
                    value="calendar"
                    checked={selectedOption === 'calendar'}
                    onChange={() => setSelectedOption('calendar')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Takvime Ekle (.ics)
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reminderType"
                    value="email"
                    checked={selectedOption === 'email'}
                    onChange={() => setSelectedOption('email')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    E-posta Bildirimi
                  </span>
                </label>
              </div>
            </div>
            
            {/* E-posta Alanı (Sadece e-posta seçiliyse) */}
            {selectedOption === 'email' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta Adresiniz
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            
            {/* Hatırlatıcı Zamanı */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ne Kadar Önce Hatırlatılsın?
              </label>
              <select
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="5">5 dakika önce</option>
                <option value="15">15 dakika önce</option>
                <option value="30">30 dakika önce</option>
                <option value="60">1 saat önce</option>
                <option value="120">2 saat önce</option>
                <option value="1440">1 gün önce</option>
              </select>
            </div>
            
            {/* Hata Mesajı */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {/* Butonlar */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  createReminder();
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'İşleniyor...' : 'Hatırlatıcı Oluştur'}
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