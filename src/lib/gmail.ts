import { google } from 'googleapis';
import { toLocalTime } from '@/utils/dateUtils';
import { Match } from '@/types/match';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Gmail API için playground URL'i
);

// Gmail API için token ayarla
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    // Email içeriğini Base64 formatına çevir
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: CS2 E-Sports Matches <${process.env.GMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlContent,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return true;
  } catch (error) {
    console.error('Gmail API error:', error);
    throw error;
  }
}

export async function sendReminderEmail(to: string, match: Match, reminderTime: Date) {
  // Maç saatini Türkiye saatine çevir
  const localMatchTime = toLocalTime(match.begin_at);
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Maç Hatırlatıcısı</h2>
      <p>Takip ettiğiniz maç <strong>${localMatchTime}</strong>'de başlayacak:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0; color: #444;">${match.opponents[0]?.opponent.name || 'TBD'} vs ${match.opponents[1]?.opponent.name || 'TBD'}</h3>
        <p style="margin: 10px 0 0; color: #666;">${match.league.name}</p>
      </div>
      <p style="color: #666; font-size: 14px;">Bu e-posta ${localMatchTime} tarihinde gönderilmiştir.</p>
    </div>
  `;

  await sendEmail(to, `CS2 Maç Hatırlatıcısı: ${match.opponents[0]?.opponent.name || 'TBD'} vs ${match.opponents[1]?.opponent.name || 'TBD'}`, htmlContent);
} 