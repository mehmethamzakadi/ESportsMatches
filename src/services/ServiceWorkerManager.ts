import { ReminderData } from '@/types/reminder';
import ReminderStorageService from './ReminderStorageService';

/**
 * Service Worker ile iletişim kurmak ve yönetmek için servis
 */
class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private reminderStorage: ReminderStorageService;

  private constructor() {
    // Singleton pattern
    this.reminderStorage = ReminderStorageService.getInstance();
    this.initServiceWorker();
    this.setupMessageListener();
  }

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Service Worker'ı başlatır
   */
  private async initServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/reminder-worker.js');
      console.log('Reminder Service Worker registered successfully.');
      
      this.setupPeriodicSync();
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Periyodik senkronizasyonu ayarlar (tarayıcı destekliyorsa)
   */
  private async setupPeriodicSync(): Promise<void> {
    if (
      !this.serviceWorkerRegistration || 
      !('periodicSync' in this.serviceWorkerRegistration) ||
      typeof window === 'undefined'
    ) {
      return;
    }
    
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