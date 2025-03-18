/**
 * E-posta bildirimleri için servis
 * E-posta doğrulama ve gönderme işlemlerini yönetir
 */
class EmailService {
  private static instance: EmailService;
  private apiUrl: string = '/api/reminders/email';

  private constructor() {
    // Yapılandırma ile ilgili başlatma işlemleri yapılabilir
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }
  
  /**
   * E-posta hatırlatıcısı gönder
   * @param email E-posta adresi
   * @param title Hatırlatıcı başlığı
   * @param message Hatırlatıcı mesajı
   * @param matchDate Maç tarihi
   * @param reminderMinutes Hatırlatma süresi (dakika)
   * @returns İşlem sonucu
   */
  public async sendReminderEmail(
    email: string,
    title: string,
    message: string,
    matchDate: Date | null,
    reminderMinutes: number
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.validateEmail(email)) {
        return { success: false, message: 'Geçersiz e-posta adresi' };
      }
      
      // API endpoint'e istek gönder
      const response = await fetch(this.apiUrl, {
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || `Sunucu hatası: ${response.status}`
        };
      }
      
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error('E-posta gönderme hatası:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
      };
    }
  }
  
  /**
   * E-posta adresinin geçerli bir formatta olup olmadığını kontrol eder
   * @param email E-posta adresi
   * @returns Geçerli ise true, değilse false
   */
  public validateEmail(email: string): boolean {
    // Basit e-posta doğrulama regex'i
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default EmailService; 