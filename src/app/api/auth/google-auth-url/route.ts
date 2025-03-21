import { NextResponse } from 'next/server';
import GoogleMailService from '@/services/GoogleMailService';

export async function GET() {
  try {
    const googleMailService = GoogleMailService.getInstance();
    const url = googleMailService.generateAuthUrl();
    
    return NextResponse.json({ 
      success: true, 
      url 
    });
  } catch (error: any) {
    console.error('Google Auth URL hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Google Auth URL oluşturulurken bir hata oluştu' 
      },
      { status: 500 }
    );
  }
} 