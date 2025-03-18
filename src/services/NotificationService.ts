/**
 * Bildirim yönetimi için servis
 * Web bildirimlerinin desteklenip desteklenmediğini kontrol eder ve 
 * bildirim izinlerini yönetir
 */
class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Bildirimlerin desteklenip desteklenmediğini kontrol eder
   */
  public checkNotificationSupport(): { supported: boolean; reason?: string } {
    // Web tarafında çalıştığımızdan emin ol
    if (typeof window === 'undefined') {
      return { supported: false, reason: 'Web tarayıcısı dışında bir ortamda çalışıyor' };
    }
    
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

  /**
   * Bildirim izni iste
   */
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

  /**
   * Bildirim izin durumunu getir
   */
  public getNotificationPermission(): string {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    
    return Notification.permission;
  }

  /**
   * Bildirim gönder
   */
  public sendNotification(title: string, options?: NotificationOptions): boolean {
    if (this.getNotificationPermission() !== 'granted') {
      return false;
    }
    
    try {
      new Notification(title, options);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
}

export default NotificationService; 