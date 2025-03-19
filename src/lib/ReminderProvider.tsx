"use client";

import React, { useEffect } from 'react';
import ClientReminderService from '@/services/ClientReminderService';
import NotificationService from '@/services/NotificationService';

interface ReminderProviderProps {
  children: React.ReactNode;
}

const ReminderProvider: React.FC<ReminderProviderProps> = ({ children }) => {
  useEffect(() => {
    // Client tarafında çalıştığından emin ol
    if (typeof window !== 'undefined') {
      // Servisleri başlat
      const reminderService = ClientReminderService.getInstance();
      const notificationService = NotificationService.getInstance();
      
      // Sayfa yüklendiğinde hatırlatıcıları kontrol et
      const checkReminders = () => {
        const reminders = reminderService.getReminders();
        const now = new Date();
        
        reminders.forEach((reminder) => {
          if (!reminder.matchDate || !reminder.reminderTime) return;
          
          const matchDate = new Date(reminder.matchDate);
          const reminderDate = new Date(matchDate.getTime() - reminder.reminderTime * 60000);
          
          // Şu an hatırlatma zamanı geldiyse ve daha önce bildirim gönderilmediyse
          if (now >= reminderDate && now < matchDate && !reminder.notified) {
            // Bildirim izni kontrolü
            if (notificationService.getNotificationPermission() === 'granted') {
              // Bildirim gönder
              notificationService.sendNotification(
                'Maç Hatırlatıcısı',
                {
                  body: reminder.message || 'Maç başlamak üzere!',
                  icon: '/logo.png',
                }
              );
              
              // Hatırlatıcıyı bildirildi olarak işaretle
              reminderService.markReminderAsNotified(reminder.id);
            }
          }
        });
      };
      
      // Sayfa yüklendiğinde kontrol et
      checkReminders();
      
      // Periyodik kontrol için interval oluştur (her dakika)
      const intervalId = setInterval(checkReminders, 60000);
      
      // Temizleme fonksiyonu
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  return <>{children}</>;
};

export default ReminderProvider; 