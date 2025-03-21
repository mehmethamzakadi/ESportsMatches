import { NextResponse } from 'next/server';
import GoogleMailService from '@/services/GoogleMailService';

export async function GET(request: Request) {
  try {
    // URL'den yetkilendirme kodunu ve state bilgisini al
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth-error?message=Yetkilendirme kodu alınamadı', url.origin));
    }
    
    // Google Mail Servisi
    const googleMailService = GoogleMailService.getInstance();
    
    // State parametresi içinden userId bilgisini al (varsa)
    if (state) {
      try {
        const stateData = JSON.parse(state);
        if (stateData.userId) {
          // Kullanıcı ID'sini ayarla
          googleMailService.setUserId(stateData.userId);
        }
      } catch (stateError) {
        console.error('State parametresi işlenirken hata:', stateError);
        // State hatası kritik değil, devam et
      }
    }
    
    // Yetkilendirme kodunu kullanarak token al
    const success = await googleMailService.getTokensFromCode(code);
    
    if (!success) {
      return NextResponse.redirect(new URL('/auth-error?message=Yetkilendirme başarısız oldu', url.origin));
    }
    
    // Başarılı yetkilendirme sonrası başarı sayfasına yönlendir
    return NextResponse.redirect(new URL('/auth-success', url.origin));
  } catch (error: any) {
    console.error('Google callback hatası:', error);
    const errorMessage = encodeURIComponent(error.message || 'Bilinmeyen bir hata oluştu');
    return NextResponse.redirect(new URL(`/auth-error?message=${errorMessage}`, new URL(request.url).origin));
  }
} 