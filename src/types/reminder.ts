/**
 * Bir hatırlatıcının verilerini tanımlayan arayüz
 */
export interface ReminderData {
  id: string;
  title: string;
  message: string;
  matchDate: string | null;
  reminderTime: number; // Dakika cinsinden
  created: string;
  notified?: boolean;
  email?: string; // E-posta bildirimleri için e-posta adresi
} 