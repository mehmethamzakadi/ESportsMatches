// Hatırlatıcı Servisi
// Bu servis, hatırlatıcıları yönetir ve Service Worker ile iletişim kurar

import { ReminderData } from '@/types/reminder';
import ReminderStorageService from './ReminderStorageService';
import NotificationService from './NotificationService';
import CalendarService from './CalendarService';
import ServiceWorkerManager from './ServiceWorkerManager';
import EmailService from './EmailService';

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

  private constructor() {
    // Servisleri başlat
    this.storageService = ReminderStorageService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.calendarService = CalendarService.getInstance();
    this.workerManager = ServiceWorkerManager.getInstance();
    this.emailService = EmailService.getInstance();
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
  ): Promise<{ success: boolean; message?: string }> {
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
}

export default ReminderService; 