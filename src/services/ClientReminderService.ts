// Hatırlatıcı Servisi - Client Version
// Bu servis, hatırlatıcıları yönetir ve Service Worker ile iletişim kurar
// Sadece client-side için güvenli metodları içerir (Node.js modüllerini kullanmaz)

import { ReminderData } from '@/types/reminder';
import ReminderStorageService from './ReminderStorageService';
import NotificationService from './NotificationService';
import ServiceWorkerManager from './ServiceWorkerManager';

/**
 * Hatırlatıcı servisi (Client Version) - Tarayıcı ortamı için güvenli sürüm
 */
class ClientReminderService {
  private static instance: ClientReminderService;
  private storageService: ReminderStorageService;
  private notificationService: NotificationService;
  private workerManager: ServiceWorkerManager;

  private constructor() {
    // Servisleri başlat
    this.storageService = ReminderStorageService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.workerManager = ServiceWorkerManager.getInstance();
  }

  public static getInstance(): ClientReminderService {
    if (!ClientReminderService.instance) {
      ClientReminderService.instance = new ClientReminderService();
    }
    return ClientReminderService.instance;
  }

  /**
   * Yeni hatırlatıcı ekle
   */
  public addReminder(reminderData: ReminderData): void {
    this.storageService.addOrUpdateReminder(reminderData);
    this.workerManager.notifyServiceWorker();
  }

  /**
   * Hatırlatıcıyı kaldır
   */
  public removeReminder(reminderId: string): void {
    this.storageService.removeReminder(reminderId);
    this.workerManager.notifyServiceWorker();
  }

  /**
   * Tüm hatırlatıcıları getir
   */
  public getReminders(): ReminderData[] {
    return this.storageService.getReminders();
  }

  /**
   * ID'ye göre hatırlatıcı getir
   */
  public getReminderById(reminderId: string): ReminderData | undefined {
    return this.storageService.getReminderById(reminderId);
  }

  /**
   * Hatırlatıcıyı bildirildi olarak işaretle
   */
  public markReminderAsNotified(reminderId: string): void {
    this.storageService.markAsNotified(reminderId);
  }

  /**
   * Bildirim desteği kontrolü
   */
  public checkNotificationSupport(): { supported: boolean; reason?: string } {
    return this.notificationService.checkNotificationSupport();
  }

  /**
   * Bildirim izni iste
   */
  public async requestNotificationPermission(): Promise<string> {
    return this.notificationService.requestNotificationPermission();
  }

  /**
   * Mevcut bildirim izni durumunu al
   */
  public getNotificationPermission(): string {
    return this.notificationService.getNotificationPermission();
  }

  /**
   * Bildirim gönder
   */
  public sendNotification(title: string, options?: NotificationOptions): boolean {
    return this.notificationService.sendNotification(title, options);
  }

  /**
   * Google Mail ile e-posta hatırlatıcısı gönderir
   */
  async sendGoogleMailReminder(
    email: string,
    title: string,
    message: string,
    matchDate: Date | null,
    reminderMinutes: number
  ): Promise<{
    success: boolean;
    message: string;
    authRequired?: boolean;
    authUrl?: string;
  }> {
    try {
      // Maç tarihi kontrol et
      if (!matchDate) {
        return {
          success: false,
          message: 'Maç tarihi belirtilmemiş',
        };
      }

      // Hatırlatıcı verisi oluştur
      const reminderData: ReminderData = {
        id: `email_${Date.now()}`,
        title,
        message,
        matchDate: matchDate.toISOString(),
        reminderTime: reminderMinutes,
        email, // E-posta adresi bilgisini ekle
        created: new Date().toISOString()
      };

      // Hatırlatıcıyı kaydet - bu bilgiler daha sonra ServiceWorker tarafından kontrol edilecek
      // NOT: Şu anda bu bilgiler kaydediliyor ama test amaçlı olarak hemen mail gönderiliyor
      this.storageService.addOrUpdateReminder(reminderData);
      this.workerManager.notifyServiceWorker();

      // TEST AMAÇLI: Anında e-posta gönderme
      try {
        const response = await fetch('/api/reminders/gmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            title: title,
            message: message,
            matchDate: matchDate.toISOString(),
            reminderMinutes: reminderMinutes,
          }),
        });
        
        // Yanıtı analiz et
        const result = await response.json();
        
        if (response.ok) {
          if (result.success) {
            return {
              success: true,
              message: 'E-posta hatırlatıcısı başarıyla oluşturuldu ve e-posta gönderildi.',
            };
          } else {
            console.error('E-posta gönderme hatası:', result.message);
            return {
              success: false,
              message: result.message || 'E-posta gönderilirken bir hata oluştu.',
              authRequired: result.authRequired,
              authUrl: result.authUrl
            };
          }
        } else {
          console.error('E-posta API isteği başarısız oldu:', response.status, response.statusText);
          
          // Yetkilendirme hatası
          if (response.status === 401) {
            // Yetkilendirme URL'sini al
            const authUrl = result.authUrl || await this.getGoogleAuthUrl();
            
            return {
              success: false,
              message: 'Google Mail yetkilendirmesi gerekiyor. Lütfen aşağıdaki butona tıklayarak hesabınızı yetkilendirin.',
              authRequired: true,
              authUrl: authUrl
            };
          }
          
          return {
            success: false,
            message: result.message || 'E-posta gönderilemedi. Sunucu hatası.',
          };
        }
      } catch (error) {
        console.error('E-posta gönderme işleminde hata:', error);
        return {
          success: false,
          message: 'E-posta gönderilirken bir hata oluştu.',
        };
      }

      // Zaman duyarlı e-posta gönderimi için eski kod (şimdilik devre dışı)
      /* 
      return {
        success: true,
        message: 'E-posta hatırlatıcısı başarıyla oluşturuldu. Maçtan önce e-posta gönderilecek.',
      };
      */
    } catch (error) {
      console.error('E-posta hatırlatıcısı oluşturulurken hata oluştu:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'E-posta hatırlatıcısı oluşturulurken beklenmeyen bir hata oluştu.',
      };
    }
  }

  /**
   * E-posta geçerliliğini kontrol et
   */
  public validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  /**
   * Google Auth URL'ini al
   */
  public async getGoogleAuthUrl(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/google-auth-url');
      if (!response.ok) {
        throw new Error('Auth URL alınamadı');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      return null;
    }
  }
}

export default ClientReminderService; 