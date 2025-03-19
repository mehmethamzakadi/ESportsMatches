// Hatırlatıcı Servisi
// Bu servis, hatırlatıcıları yönetir ve Service Worker ile iletişim kurar

import { ReminderData } from '@/types/reminder';
import ReminderStorageService from './ReminderStorageService';
import NotificationService from './NotificationService';
import CalendarService from './CalendarService';
import ServiceWorkerManager from './ServiceWorkerManager';
import EmailService from './EmailService';
import GoogleMailService from './GoogleMailService';

/**
 * Hatırlatıcı servisi - uygulama için facade sınıf görevi görür
 * Diğer tüm hatırlatıcı servislerini koordine eder
 */
class ReminderService {
  private static instance: ReminderService;
  private storageService: ReminderStorageService;
  private notificationService: NotificationService;
  private calendarService: CalendarService;
  private workerManager: ServiceWorkerManager;
  private emailService: EmailService;
  private googleMailService: GoogleMailService;

  private constructor() {
    // Servisleri başlat
    this.storageService = ReminderStorageService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.calendarService = CalendarService.getInstance();
    this.workerManager = ServiceWorkerManager.getInstance();
    this.emailService = EmailService.getInstance();
    this.googleMailService = GoogleMailService.getInstance();
  }

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
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
   * E-posta hatırlatıcısı gönder
   */
  public async sendEmailReminder(
    email: string,
    title: string,
    message: string,
    matchDate: Date | null,
    reminderMinutes: number
  ): Promise<{ success: boolean; message?: string; authRequired?: boolean; authUrl?: string }> {
    // Google Mail servisini kontrol et, yetkilendirilmiş ise onu kullan
    if (this.googleMailService.isAuthenticated()) {
      try {
        // Tarih bilgilerini formatlama
        let dateInfo = '';
        if (matchDate) {
          const date = matchDate;
          dateInfo = `Maç Tarihi: ${date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`;
        }
        
        // HTML içerik
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333; border-bottom: 2px solid #f1f1f1; padding-bottom: 10px;">${title}</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #666;">${message}</p>
            ${dateInfo ? `<p>${dateInfo}</p>` : ''}
            <p style="font-size: 14px; color: #888; margin-top: 20px;">Bu hatırlatıcı, E-Spor Maç Hatırlatıcı uygulaması tarafından gönderilmiştir.</p>
          </div>
        `;
        
        // Text içerik
        const text = `${title}\n\n${message}\n${dateInfo ? `\n${dateInfo}` : ''}\n\nBu hatırlatıcı, E-Spor Maç Hatırlatıcı uygulaması tarafından gönderilmiştir.`;
        
        // Google Mail ile gönder
        return await this.googleMailService.sendEmail(
          email,
          title,
          html,
          text
        );
      } catch (error: any) {
        console.error('Google Mail gönderme hatası:', error);
        // Google Mail başarısız olursa, normal email servisi ile devam et
      }
    } 
    
    // Google Mail yetkilendirilmemiş veya başarısız oldu, normal email servisi ile devam et
    // Nodemailer ile e-posta gönder
    return this.emailService.sendReminderEmail(
      email,
      title,
      message,
      matchDate,
      reminderMinutes
    );
  }
  
  /**
   * E-posta formatını doğrula
   */
  public validateEmail(email: string): boolean {
    return this.emailService.validateEmail(email);
  }
  
  /**
   * Google Mail yetkilendirmesi gerekip gerekmediğini kontrol et
   */
  public isGoogleMailAuthenticated(): boolean {
    return this.googleMailService.isAuthenticated();
  }
  
  /**
   * Google Mail için yetkilendirme URL'si oluştur
   */
  public getGoogleAuthUrl(): string {
    return this.googleMailService.generateAuthUrl();
  }
}

export default ReminderService; 