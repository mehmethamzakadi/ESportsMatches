import { ReminderData } from '@/types/reminder';

/**
 * Hatırlatıcıların yerel depolanması ve yönetiminden sorumlu servis
 */
class ReminderStorageService {
  private static instance: ReminderStorageService;
  private readonly STORAGE_KEY = 'matchReminders';

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): ReminderStorageService {
    if (!ReminderStorageService.instance) {
      ReminderStorageService.instance = new ReminderStorageService();
    }
    return ReminderStorageService.instance;
  }

  /**
   * Tüm hatırlatıcıları getir
   */
  public getReminders(): ReminderData[] {
    try {
      const remindersJson = localStorage.getItem(this.STORAGE_KEY);
      return remindersJson ? JSON.parse(remindersJson) : [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  /**
   * Hatırlatıcıları kaydet
   */
  public saveReminders(reminders: ReminderData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }

  /**
   * Yeni hatırlatıcı ekle veya var olanı güncelle
   */
  public addOrUpdateReminder(reminderData: ReminderData): void {
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
  }

  /**
   * Hatırlatıcıyı kaldır
   */
  public removeReminder(reminderId: string): void {
    const reminders = this.getReminders();
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    this.saveReminders(updatedReminders);
  }
  
  /**
   * Hatırlatıcıyı bildirildi olarak işaretle
   */
  public markAsNotified(reminderId: string): void {
    const reminders = this.getReminders();
    const updatedReminders = reminders.map(reminder => 
      reminder.id === reminderId ? { ...reminder, notified: true } : reminder
    );
    this.saveReminders(updatedReminders);
  }
  
  /**
   * Hatırlatıcıyı ID'ye göre bul
   */
  public getReminderById(reminderId: string): ReminderData | undefined {
    const reminders = this.getReminders();
    return reminders.find(r => r.id === reminderId);
  }
}

export default ReminderStorageService; 