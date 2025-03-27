import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/gmail';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: Request) {
  try {
    // Sadece Vercel'den gelen cron isteklerine izin ver
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Şu anki zamandan 5 dakika sonrasına kadar olan hatırlatıcıları al
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_sent', false)
      .gte('reminder_time', now.toISOString())
      .lte('reminder_time', fiveMinutesLater.toISOString());

    if (error) throw error;

    // Her bir hatırlatıcı için mail gönder
    for (const reminder of reminders || []) {
      const subject = 'Maç Hatırlatıcısı';
      const htmlContent = `
        <h2>Maç Başlamak Üzere!</h2>
        <p>${reminder.team1_name} vs ${reminder.team2_name} maçı yakında başlayacak.</p>
        <p>Maç Başlangıç: ${new Date(reminder.match_start_time).toLocaleString('tr-TR')}</p>
      `;

      await sendEmail(reminder.user_email, subject, htmlContent);

      // Hatırlatıcıyı gönderildi olarak işaretle
      await supabase
        .from('reminders')
        .update({ is_sent: true })
        .eq('id', reminder.id);
    }

    return NextResponse.json({
      success: true,
      remindersSent: reminders?.length || 0,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcılar gönderilemedi' },
      { status: 500 }
    );
  }
} 