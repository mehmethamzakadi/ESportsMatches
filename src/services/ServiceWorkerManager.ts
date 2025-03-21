import { ReminderData } from '@/types/reminder';
import ReminderStorageService from './ReminderStorageService';

/**
 * Service Worker ile iletişim kurmak ve yönetmek için servis
 */
class ServiceWorkerManager {
  private static instance: ServiceWorkerManager | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private reminderStorage: ReminderStorageService;

  private constructor() {
    // Singleton pattern
    this.reminderStorage = ReminderStorageService.getInstance();
  }

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Service Worker'ı kaydet
   */
  public async register(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/reminder-worker.js');
      
      this.setupPeriodicSync();
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Periyodik senkronizasyonu ayarla
   */
  private async setupPeriodicSync(): Promise<void> {
    if (!('periodicSync' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if (!('periodicSync' in registration)) {
        return;
      }

      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as PermissionName
      });

      if (status.state !== 'granted') {
        return;
      }

      await (registration as any).periodicSync.register('reminder-sync', {
        minInterval: 15 * 60 * 1000 // 15 dakika
      });
    } catch (err) {
      console.error('Periodic sync could not be registered:', err);
    }
  }

  /**
   * Post mesajı gönder
   */
  public async sendMessage(message: any): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registration = await this.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage(message);
    }
  }

  /**
   * Hatırlatıcı ekle
   */
  public async addReminder(reminderData: ReminderData): Promise<void> {
    await this.sendMessage({
      type: 'ADD_REMINDER',
      data: reminderData
    });
  }

  /**
   * Hatırlatıcı sil
   */
  public async removeReminder(reminderId: string): Promise<void> {
    await this.sendMessage({
      type: 'REMOVE_REMINDER',
      data: { id: reminderId }
    });
  }

  /**
   * Service Worker kaydını getir
   */
  private async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.serviceWorkerRegistration) {
      return this.serviceWorkerRegistration;
    }

    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length > 0) {
        this.serviceWorkerRegistration = registrations[0];
        return this.serviceWorkerRegistration;
      }
    } catch (error) {
      console.error('Service Worker registration retrieval failed:', error);
    }

    return null;
  }

  /**
   * Service Worker'dan gelen mesajları dinle
   */
  private setupMessageListener(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'GET_REMINDERS') {
        // Service Worker hatırlatıcıları istediğinde
        const reminders = this.reminderStorage.getReminders();
        event.ports[0].postMessage({ reminders });
      } else if (event.data && event.data.type === 'UPDATE_REMINDERS') {
        // Service Worker hatırlatıcıları güncellediğinde
        this.reminderStorage.saveReminders(event.data.reminders);
      }
    });
  }

  /**
   * Service Worker'a yeni hatırlatıcı eklendiğini bildirir
   */
  public notifyServiceWorker(): void {
    if (
      typeof window === 'undefined' || 
      !this.serviceWorkerRegistration || 
      !navigator.serviceWorker.controller
    ) {
      return;
    }
    
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_REMINDERS'
    });
  }

  /**
   * Service Worker'dan hatırlatıcıları kontrol etmesini ister
   */
  public requestCheckReminders(): void {
    this.notifyServiceWorker();
  }
  
  /**
   * Service Worker kaydını döndürür
   */
  public getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.serviceWorkerRegistration;
  }
}

export default ServiceWorkerManager; 