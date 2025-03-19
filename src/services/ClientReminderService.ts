// Hatırlatıcı Servisi - Client Version
// Bu servis, hatırlatıcıları yönetir ve Service Worker ile iletişim kurar
// Sadece client-side için güvenli metodları içerir (Node.js modüllerini kullanmaz)

import { ReminderData } from '@/types/reminder';
import ReminderStorageService from './ReminderStorageService';
import NotificationService from './NotificationService';
import CalendarService from './CalendarService';
import ServiceWorkerManager from './ServiceWorkerManager';

/**
 * Hatırlatıcı servisi (Client Version) - Tarayıcı ortamı için güvenli sürüm
 */
class ClientReminderService {
  private static instance: ClientReminderService;
  private storageService: ReminderStorageService;
  private notificationService: NotificationService;
  private calendarService: CalendarService;
  private workerManager: ServiceWorkerManager;

  private constructor() {
    // Servisleri başlat
    this.storageService = ReminderStorageService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.calendarService = CalendarService.getInstance();
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
   * Hatırlatıcıyı ID'ye göre bul
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
   * Bildirim desteğini kontrol et
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
   * Bildirim izni durumunu kontrol et
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
   * Takvim dosyası içeriği oluştur
   */
  public createCalendarFile(
    title: string,
    description: string,
    startDate: Date,
    reminderMinutes: number
  ): string {
    return this.calendarService.createCalendarContent(
      title,
      description,
      startDate,
      reminderMinutes
    );
  }

  /**
   * Takvim dosyası için URL oluştur
   */
  public generateCalendarURL(icsContent: string): string {
    return this.calendarService.generateCalendarURL(icsContent);
  }
  
  /**
   * Google Mail ile e-posta gönder - API üzerinden
   */
  public async sendGoogleMailReminder(
    email: string,
    title: string,
    message: string,
    matchDate: Date | null,
    reminderMinutes: number
  ): Promise<{ success: boolean; message?: string; authRequired?: boolean; authUrl?: string }> {
    try {
      // E-posta formatını doğrula
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Geçersiz e-posta adresi' };
      }
      
      // API endpoint'e istek gönder
      const response = await fetch('/api/reminders/gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          title,
          message,
          matchDate: matchDate?.toISOString(),
          reminderMinutes
        }),
      });
      
      const data = await response.json();
      
      // Yetkilendirme gerekiyorsa
      if (data.authRequired && data.authUrl) {
        // Kullanıcıyı Google yetkilendirme sayfasına yönlendir
        window.location.href = data.authUrl;
        return { 
          success: false, 
          message: 'Google hesabınızla yetkilendirme gerekiyor. Yönlendiriliyorsunuz...',
          authRequired: true,
          authUrl: data.authUrl
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('Google Mail gönderme hatası:', error);
      return { 
        success: false, 
        message: error.message || 'Bilinmeyen bir hata oluştu'
      };
    }
  }
  
  /**
   * E-posta formatını doğrula
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Google yetkilendirme URL'sini al
   */
  public async getGoogleAuthUrl(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        return data.authUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Google yetkilendirme URL\'si alınamadı:', error);
      return null;
    }
  }
}

export default ClientReminderService; 