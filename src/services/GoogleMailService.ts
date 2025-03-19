import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

/**
 * Google API kullanarak e-posta gönderme servisi
 */
class GoogleMailService {
  private static instance: GoogleMailService;
  private oauth2Client: OAuth2Client | null = null;
  private tokens: any = null;

  private constructor() {
    this.initializeCredentials();
  }

  public static getInstance(): GoogleMailService {
    if (!GoogleMailService.instance) {
      GoogleMailService.instance = new GoogleMailService();
    }
    return GoogleMailService.instance;
  }

  /**
   * Google API kimlik bilgilerini yükle
   */
  private initializeCredentials() {
    try {
      // .env.local dosyasından kimlik bilgilerini oku
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

      if (!clientId || !clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET .env.local dosyasında tanımlanmalıdır');
      }

      // OAuth2 client oluştur
      this.oauth2Client = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri
      );

      // Eğer token varsa, yükle
      const tokenPath = path.join(process.cwd(), 'token.json');
      if (fs.existsSync(tokenPath)) {
        const tokenContent = fs.readFileSync(tokenPath, 'utf8');
        this.tokens = JSON.parse(tokenContent);
        this.oauth2Client.setCredentials(this.tokens);
      }
    } catch (error) {
      console.error('Google API kimlik bilgileri yüklenirken hata:', error);
    }
  }

  /**
   * Oauth2 URL'si oluştur
   */
  public generateAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client başlatılamadı');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Token al ve kaydet
   */
  public async getTokensFromCode(code: string): Promise<any> {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client başlatılamadı');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.tokens = tokens;
    this.oauth2Client.setCredentials(tokens);

    // Token'ı dosyaya kaydet
    const tokenPath = path.join(process.cwd(), 'token.json');
    fs.writeFileSync(tokenPath, JSON.stringify(tokens));

    return tokens;
  }

  /**
   * Gmail ile e-posta gönder
   */
  public async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.oauth2Client || !this.tokens) {
        return { 
          success: false, 
          message: 'Google API kimlik doğrulaması yapılmamış. Lütfen önce yetkilendirme işlemini tamamlayın.' 
        };
      }

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // E-posta içeriğini oluştur
      const emailLines = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        htmlContent
      ];
      
      const email = emailLines.join('\r\n');
      const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
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
        // Token süresi dolmuş olabilir, yenileme token'ını kullanarak yeniden dene
        try {
          if (this.oauth2Client && this.tokens.refresh_token) {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            this.tokens = credentials;
            this.oauth2Client.setCredentials(credentials);
            
            // Güncellenmiş token'ı kaydet
            const tokenPath = path.join(process.cwd(), 'token.json');
            fs.writeFileSync(tokenPath, JSON.stringify(credentials));
            
            // Tekrar göndermeyi dene
            return this.sendEmail(to, subject, htmlContent, textContent);
          }
        } catch (refreshError) {
          console.error('Token yenilenirken hata:', refreshError);
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
    return !!this.tokens;
  }
}

export default GoogleMailService; 