import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';

/**
 * Google API kullanarak e-posta gönderme servisi
 * Supabase entegrasyonu ile token yönetimi
 */
class GoogleMailService {
  private static instance: GoogleMailService;
  private oauth2Client: OAuth2Client;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scope: string[];
  private userId: string = 'system_admin'; // Varsayılan kullanıcı ID'si
  private supabase;

  private constructor() {
    // Supabase istemcisini oluştur
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );
    
    // Google API ayarlarını al
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
    
    // Gerekli izinler
    this.scope = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
    ];

    // OAuth2 istemcisini oluştur
    this.oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
    
    // Token'ları yükle
    this.initializeCredentials();
  }

  public static getInstance(): GoogleMailService {
    if (!GoogleMailService.instance) {
      GoogleMailService.instance = new GoogleMailService();
    }
    return GoogleMailService.instance;
  }

  /**
   * Kullanıcı kimliğini ayarla (oturum açıldığında)
   */
  public setUserId(userId: string) {
    this.userId = userId;
    // Kullanıcı değiştiğinde token'ları yeniden yükle
    this.loadTokensFromSupabase();
  }

  /**
   * Google API kimlik bilgilerini başlat
   */
  private async initializeCredentials() {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET .env.local dosyasında tanımlanmalıdır');
      }
      
      // Token'ları Supabase'den yükle
      await this.loadTokensFromSupabase();
    } catch (error) {
      console.error('Google API kimlik bilgileri yüklenirken hata:', error);
    }
  }

  /**
   * Supabase'den token'ları yükle
   */
  private async loadTokensFromSupabase() {
    if (!this.userId || !this.oauth2Client) return;

    try {
      const { data, error } = await this.supabase
        .from('google_auth_tokens')
        .select('*')
        .eq('user_id', this.userId)
        .maybeSingle();

      if (error) {
        console.error('Token yüklenirken Supabase hatası:', error);
        // Token bilgilerini temizle
        this.oauth2Client.credentials = {};
        return;
      }

      if (!data) {
        // Token bilgilerini temizle
        this.oauth2Client.credentials = {};
        return;
      }
      
      // Token verisini ayarla
      this.oauth2Client.setCredentials({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: data.expiry_date
      });
    } catch (error) {
      console.error('Supabase\'den token yüklenirken hata:', error);
      // Hata durumunda token bilgilerini temizle
      this.oauth2Client.credentials = {};
    }
  }

  /**
   * Token'ları Supabase'e kaydet
   */
  private async saveTokensToSupabase(tokens: any) {
    if (!this.userId) {
      console.error('Kullanıcı kimliği (userId) bulunamadı, token kaydedilemedi');
      return false;
    }

    try {
      // Önce mevcut bir kayıt var mı kontrol et
      const { data: existingToken, error: queryError } = await this.supabase
        .from('google_auth_tokens')
        .select('id, refresh_token')  // refresh_token da alıyoruz, boş ise eski değeri kullanmak için
        .eq('user_id', this.userId)
        .maybeSingle();

      if (queryError) {
        console.error('Token sorgulanırken hata:', queryError);
        return false;
      }

      // Token bilgilerini hazırla
      const tokenData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || (existingToken?.refresh_token || ''),
        expiry_date: tokens.expiry_date || Date.now() + (tokens.expires_in || 0) * 1000,
        updated_at: new Date()
      };

      if (existingToken) {
        // Varsa güncelle
        const { error } = await this.supabase
          .from('google_auth_tokens')
          .update(tokenData)
          .eq('user_id', this.userId);

        if (error) {
          console.error('Token güncellenirken hata:', error);
          return false;
        }
      } else {
        // Yoksa yeni kayıt oluştur
        const { error } = await this.supabase
          .from('google_auth_tokens')
          .insert({
            user_id: this.userId,
            ...tokenData,
            created_at: new Date()
          });

        if (error) {
          console.error('Token eklenirken hata:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Token Supabase\'e kaydedilirken hata:', error);
      return false;
    }
  }

  /**
   * Supabase'den token'ları yükle ve yenile
   */
  public async refreshTokens(): Promise<boolean> {
    try {
      // Supabase'den token bilgilerini yükle
      await this.loadTokensFromSupabase();
      
      // Token süresi dolmuş mu kontrol et ve gerekirse yenile
      if (this.isAuthenticated()) {
        const credentials = this.oauth2Client.credentials;
        if (credentials.expiry_date && typeof credentials.expiry_date === 'number') {
          const now = Date.now();
          if (credentials.expiry_date < now && credentials.refresh_token) {
            try {
              const { credentials: newCredentials } = await this.oauth2Client.refreshAccessToken();
              this.oauth2Client.setCredentials(newCredentials);
              await this.saveTokensToSupabase(newCredentials);
            } catch (refreshError) {
              console.error('Token yenileme hatası:', refreshError);
              return false;
            }
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      return false;
    }
  }

  /**
   * Oauth2 URL'si oluştur
   */
  public generateAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client başlatılamadı');
    }

    // State içine kullanıcı ID'sini ekle
    const state = JSON.stringify({ userId: this.userId });

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scope,
      state: state,
      prompt: 'consent' // Her zaman yeni bir refresh token al
    });
  }

  /**
   * Token al ve kaydet
   */
  public async getTokensFromCode(code: string): Promise<boolean> {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client başlatılamadı');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      this.oauth2Client.setCredentials(tokens);

      // Token'ı Supabase'e kaydet
      const saved = await this.saveTokensToSupabase(tokens);
      
      if (!saved) {
        console.error('Token Supabase\'e kaydedilemedi');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token alınamadı:', error);
      return false;
    }
  }

  /**
   * Gmail ile e-posta gönder
   */
  public async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<{ success: boolean; message?: string; needsAuthentication?: boolean }> {
    try {
      // Her e-posta gönderimi öncesinde Supabase'den token kontrolü yap
      await this.loadTokensFromSupabase();
      
      if (!this.isAuthenticated()) {
        return { 
          success: false, 
          message: 'Google API kimlik doğrulaması yapılmamış. Lütfen önce yetkilendirme işlemini tamamlayın.',
          needsAuthentication: true
        };
      }

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // E-posta içeriğini oluştur
      const emailContent = [
        `From: CS2 Maç Hatırlatıcı <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="boundary"',
        '',
        '--boundary',
        'Content-Type: text/plain; charset="UTF-8"',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        textContent,
        '',
        '--boundary',
        'Content-Type: text/html; charset="UTF-8"',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        htmlContent,
        '',
        '--boundary--',
      ].join('\r\n');
      
      // Base64 kodlama
      const encodedEmail = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // E-posta gönder
      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });
      
      return { 
        success: true, 
        message: 'E-posta başarıyla gönderildi' 
      };
    } catch (error: any) {
      console.error('Gmail ile e-posta gönderme hatası:', error);
      
      if (error.code === 401) {
        // Token süresi dolmuşsa ve refresh token varsa, yenilemeyi dene
        try {
          if (this.oauth2Client && this.oauth2Client.credentials.refresh_token) {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            this.oauth2Client.setCredentials(credentials);
            
            // Yeni token'ı kaydet
            await this.saveTokensToSupabase(credentials);
            
            // E-posta göndermeyi tekrar dene
            return this.sendEmail(to, subject, htmlContent, textContent);
          }
        } catch (refreshError) {
          console.error('Token yenileme hatası:', refreshError);
          return {
            success: false,
            message: 'Kimlik doğrulama hatası, yeniden yetkilendirme gerekiyor',
            needsAuthentication: true
          };
        }
      }
      
      return {
        success: false,
        message: error.message || 'E-posta gönderilirken bir hata oluştu'
      };
    }
  }

  /**
   * Oturum açık mı kontrolü
   */
  public isAuthenticated(): boolean {
    try {
      const credentials = this.oauth2Client.credentials;
      
      // Credentials tamamen boş mu kontrol et
      if (!credentials || Object.keys(credentials).length === 0) {
        return false;
      }
      
      // Gerekli token'lar var mı kontrol et
      if (!credentials.access_token || !credentials.refresh_token) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('isAuthenticated kontrolü sırasında hata:', error);
      return false;
    }
  }
}

export default GoogleMailService; 