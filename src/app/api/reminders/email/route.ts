import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// E-posta göndermek için SMTP yapılandırması
// Bu ayarları kendi SMTP sunucunuza göre değiştirin
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
});

export async function POST(request: Request) {
  try {
    // İstek gövdesini JSON olarak parse et
    const body = await request.json();
    
    // Gerekli alanları al
    const { email, title, message, matchDate, reminderMinutes } = body;
    
    // Eksik zorunlu alanları kontrol et
    if (!email || !title || !message) {
      return NextResponse.json(
        { message: 'E-posta, başlık ve mesaj zorunludur' },
        { status: 400 }
      );
    }
    
    // E-posta adresini doğrula
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Geçersiz e-posta adresi' },
        { status: 400 }
      );
    }
    
    // Hatırlatıcı için tarih bilgilerini format
    let dateInfo = '';
    if (matchDate) {
      const date = new Date(matchDate);
      dateInfo = `<p>Maç Tarihi: ${date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>`;
    }
    
    // E-posta içeriği oluştur
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; border-bottom: 2px solid #f1f1f1; padding-bottom: 10px;">${title}</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #666;">${message}</p>
        ${dateInfo}
        <p style="font-size: 14px; color: #888; margin-top: 20px;">Bu hatırlatıcı, E-Spor Maç Hatırlatıcı uygulaması tarafından gönderilmiştir.</p>
      </div>
    `;
    
    // E-posta gönderme
    const mailOptions = {
      from: `"E-Spor Maç Hatırlatıcısı" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
      to: email,
      subject: title,
      html: html,
      text: message // HTML desteklemeyen e-posta istemcileri için
    };

    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ 
      success: true, 
      message: 'E-posta başarıyla gönderildi' 
    });
    
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return NextResponse.json(
      { message: 'E-posta gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 