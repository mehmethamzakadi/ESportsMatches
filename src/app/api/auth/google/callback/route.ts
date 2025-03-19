import { NextResponse } from 'next/server';
import GoogleMailService from '@/services/GoogleMailService';

export async function GET(request: Request) {
  try {
    // URL'den yetkilendirme kodunu al
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth-error?message=Yetkilendirme kodu alınamadı', url.origin));
    }
    
    // Google Mail Servisi ile token al
    const googleMailService = GoogleMailService.getInstance();
    await googleMailService.getTokensFromCode(code);
    
    // Başarılı yetkilendirme sonrası ana sayfaya yönlendir
    return NextResponse.redirect(new URL('/auth-success', url.origin));
  } catch (error: any) {
    console.error('Google callback hatası:', error);
    const errorMessage = encodeURIComponent(error.message || 'Bilinmeyen bir hata oluştu');
    return NextResponse.redirect(new URL(`/auth-error?message=${errorMessage}`, new URL(request.url).origin));
  }
} 