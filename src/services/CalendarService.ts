/**
 * Takvim dosyalarını (iCalendar formatı) oluşturmak ve yönetmek için servis
 */
class CalendarService {
  private static instance: CalendarService;

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * iCalendar formatında takvim dosyası içeriği oluşturur
   * 
   * @param title Etkinlik başlığı
   * @param description Etkinlik açıklaması
   * @param startDate Başlangıç tarihi
   * @param reminderMinutes Hatırlatıcı dakikası (başlangıçtan önce)
   * @param durationHours Etkinlik süresi (saat cinsinden, varsayılan: 2 saat)
   */
  public createCalendarContent(
    title: string,
    description: string,
    startDate: Date,
    reminderMinutes: number,
    durationHours: number = 2
  ): string {
    // Bitiş zamanını hesapla
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60000);
    
    // iCalendar formatında dosya içeriği oluştur
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ESportsMatches//TR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${this.escapeIcsValue(title)}`,
      `DESCRIPTION:${this.escapeIcsValue(description)}`,
      `DTSTART:${this.formatDateForICS(startDate)}`,
      `DTEND:${this.formatDateForICS(endDate)}`,
      'BEGIN:VALARM',
      `TRIGGER:-PT${reminderMinutes}M`,
      'ACTION:DISPLAY',
      `DESCRIPTION:Hatırlatıcı: ${this.escapeIcsValue(title)}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    return icsContent;
  }

  /**
   * Takvim dosyasını indirmek için URL oluşturur
   */
  public generateCalendarURL(icsContent: string): string {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  }

  /**
   * iCalendar formatı için tarih formatla
   */
  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
  }
  
  /**
   * iCalendar değerlerini kaçış karakterleriyle düzenle
   */
  private escapeIcsValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }
}

export default CalendarService; 