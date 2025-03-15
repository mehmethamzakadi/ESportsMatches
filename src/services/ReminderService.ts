// Hatırlatıcı Servisi
// Bu servis, hatırlatıcıları yönetir ve Service Worker ile iletişim kurar

interface ReminderData {
  id: string;
  title: string;
  message: string;
  matchDate: string | null;
  reminderTime: number;
  created: string;
  notified?: boolean;
}

class ReminderService {
  private static instance: ReminderService;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    // Singleton pattern
    this.initServiceWorker();
    this.setupMessageListener();
  }

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  // Service Worker'ı başlat
  private async initServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/reminder-worker.js');
        console.log('Reminder Service Worker registered successfully.');
        
        // Periyodik senkronizasyon için izin iste (tarayıcı destekliyorsa)
        if ('periodicSync' in this.serviceWorkerRegistration) {
          try {
            // @ts-ignore - TypeScript periodicSync'i tanımıyor olabilir
            await this.serviceWorkerRegistration.periodicSync.register('check-reminders', {
              minInterval: 15 * 60 * 1000 // 15 dakika
            });
            console.log('Periodic sync registered for reminders');
          } catch (err) {
            console.log('Periodic sync could not be registered:', err);
          }
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Service Worker'dan gelen mesajları dinle
  private setupMessageListener(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'GET_REMINDERS') {
          // Service Worker hatırlatıcıları istediğinde
          const reminders = this.getReminders();
          event.ports[0].postMessage({ reminders });
        } else if (event.data && event.data.type === 'UPDATE_REMINDERS') {
          // Service Worker hatırlatıcıları güncellediğinde
          this.saveReminders(event.data.reminders);
        }
      });
    }
  }

  // Yeni hatırlatıcı ekle
  public addReminder(reminderData: ReminderData): void {
    const reminders = this.getReminders();
    
    // Aynı maç için zaten bir hatırlatıcı var mı kontrol et
    const existingIndex = reminders.findIndex(r => r.id === reminderData.id);
    
    if (existingIndex !== -1) {
      // Varsa güncelle
      reminders[existingIndex] = reminderData;
    } else {
      // Yoksa ekle
      reminders.push(reminderData);
    }
    
    this.saveReminders(reminders);
    this.notifyServiceWorker();
  }

  // Hatırlatıcıyı kaldır
  public removeReminder(reminderId: string): void {
    const reminders = this.getReminders();
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    this.saveReminders(updatedReminders);
  }

  // Tüm hatırlatıcıları getir
  public getReminders(): ReminderData[] {
    try {
      const remindersJson = localStorage.getItem('matchReminders');
      return remindersJson ? JSON.parse(remindersJson) : [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  // Hatırlatıcıları kaydet
  private saveReminders(reminders: ReminderData[]): void {
    try {
      localStorage.setItem('matchReminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }

  // Service Worker'a yeni hatırlatıcı eklendiğini bildir
  private notifyServiceWorker(): void {
    if (this.serviceWorkerRegistration && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CHECK_REMINDERS'
      });
    }
  }

  // Bildirim desteğini kontrol et
  public checkNotificationSupport(): { supported: boolean; reason?: string } {
    // Web Notifications API desteği kontrolü
    if (!('Notification' in window)) {
      return { supported: false, reason: 'Bu tarayıcı Web Notifications API\'sini desteklemiyor.' };
    }
    
    // iOS Safari kontrolü (iOS Safari'de Notification tanımlı olabilir ama çalışmaz)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      return { supported: false, reason: 'iOS cihazlarda web bildirimleri desteklenmemektedir.' };
    }
    
    // Service Worker desteği kontrolü
    if (!('serviceWorker' in navigator)) {
      return { supported: false, reason: 'Bu tarayıcı Service Worker\'ları desteklemiyor.' };
    }
    
    return { supported: true };
  }

  // Bildirim izni iste
  public async requestNotificationPermission(): Promise<string> {
    // Önce bildirim desteğini kontrol et
    const supportCheck = this.checkNotificationSupport();
    if (!supportCheck.supported) {
      console.warn('Notification support check failed:', supportCheck.reason);
      return 'denied';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Takvim dosyası oluştur
  public createCalendarFile(
    title: string,
    description: string,
    startDate: Date,
    reminderMinutes: number
  ): string {
    // Bitiş zamanını hesapla (varsayılan olarak 2 saat sonra)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60000);
    
    // iCalendar formatında dosya içeriği oluştur
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ESportsMatches//TR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `DTSTART:${this.formatDateForICS(startDate)}`,
      `DTEND:${this.formatDateForICS(endDate)}`,
      `BEGIN:VALARM`,
      `TRIGGER:-PT${reminderMinutes}M`,
      `ACTION:DISPLAY`,
      `DESCRIPTION:Hatırlatıcı: ${title}`,
      `END:VALARM`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    return icsContent;
  }

  // iCalendar formatı için tarih formatla
  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
  }
}

export default ReminderService; 