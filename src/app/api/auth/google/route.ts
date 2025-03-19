import { NextResponse } from 'next/server';
import GoogleMailService from '@/services/GoogleMailService';

export async function GET(request: Request) {
  try {
    const googleMailService = GoogleMailService.getInstance();
    const authUrl = googleMailService.generateAuthUrl();
    
    // Kullanıcıyı Google oturum açma sayfasına yönlendir
    return NextResponse.json({ 
      success: true, 
      authUrl 
    });
  } catch (error) {
    console.error('Google yetkilendirme hatası:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Google yetkilendirme hatası oluştu' 
      },
      { status: 500 }
    );
  }
} 