import { NextResponse } from 'next/server';
import GoogleMailService from '@/services/GoogleMailService';

export async function POST(request: Request) {
  try {
    // İstek gövdesini JSON olarak parse et
    const body = await request.json();
    
    // Gerekli alanları al
    const { 
      email, 
      title, 
      message, 
      matchDate, 
      reminderMinutes 
    } = body;
    
    // Zorunlu alanlar
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçerli bir e-posta adresi gereklidir' 
        }, 
        { status: 400 }
      );
    }
    
    if (!title) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Bir e-posta başlığı gereklidir' 
        }, 
        { status: 400 }
      );
    }
    
    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçerli bir e-posta adresi gereklidir'
        }, 
        { status: 400 }
      );
    }
    
    // GoogleMailService örneğini al
    const mailService = GoogleMailService.getInstance();
    
    // Supabase'den tokenları yenile
    await mailService.refreshTokens();

    // Google Mail kimlik doğrulaması kontrolü
    if (!mailService.isAuthenticated()) {
      try {
        // Yetkilendirme URL'si oluştur
        const authUrl = mailService.generateAuthUrl();
        
        return NextResponse.json({
          success: false,
          needsAuthentication: true,
          authUrl,
          message: 'Google Mail API yetkilendirmesi gerekiyor'
        }, { status: 401 });
      } catch (authError) {
        console.error('Yetkilendirme URL oluşturulurken hata:', authError);
        return NextResponse.json({
          success: false,
          message: 'Yetkilendirme URL oluşturulurken hata oluştu'
        }, { status: 500 });
      }
    }
    
    // Tarih bilgisini formatlama
    let formattedDate = '';
    if (matchDate) {
      const matchDateTime = new Date(matchDate);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      formattedDate = matchDateTime.toLocaleDateString('tr-TR', options);
    }
    
    // E-posta içeriğini oluştur - HTML versiyonu
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2a3f54;">${title}</h2>
        <p>${message || 'Hatırlatıcı mesajı'}</p>
        ${matchDate ? `<p><strong>Maç Tarihi:</strong> ${formattedDate}</p>` : ''}
        ${reminderMinutes ? `<p><strong>Hatırlatıcı:</strong> Maç başlamadan ${reminderMinutes} dakika önce</p>` : ''}
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">Bu e-posta, CS2 Maç Hatırlatıcı uygulaması tarafından gönderilmiştir.</p>
      </div>
    `;
    
    // Düz metin versiyonu
    const textContent = `
      ${title}
      
      ${message || 'Hatırlatıcı mesajı'}
      ${matchDate ? `Maç Tarihi: ${formattedDate}` : ''}
      ${reminderMinutes ? `Hatırlatıcı: Maç başlamadan ${reminderMinutes} dakika önce` : ''}
      
      Bu e-posta, CS2 Maç Hatırlatıcı uygulaması tarafından gönderilmiştir.
    `;
    
    // E-posta gönder
    const result = await mailService.sendEmail(
      email,
      title,
      htmlContent,
      textContent
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'E-posta hatırlatıcısı başarıyla gönderildi'
      });
    } else {
      // Token geçersiz veya yenileme başarısız olmuşsa yeniden yetkilendirme gerekebilir
      if (result.needsAuthentication) {
        const authUrl = mailService.generateAuthUrl();
        return NextResponse.json({
          success: false,
          needsAuthentication: true,
          authUrl,
          message: result.message || 'Google Mail API yeniden yetkilendirmesi gerekiyor'
        }, { status: 401 });
      }
      
      return NextResponse.json({
        success: false,
        message: result.message || 'E-posta gönderilirken bir hata oluştu'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('E-posta gönderme hatası:', error);
    
    return NextResponse.json({
      success: false,
      message: `E-posta gönderilirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`
    }, { status: 500 });
  }
} 