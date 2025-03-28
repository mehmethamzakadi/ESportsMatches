import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { toUTCTime } from '@/utils/dateUtils';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      matchId,
      matchStartTime,
      reminderMinutes,
      team1Name,
      team2Name
    } = body;

    // Hatırlatma zamanını hesapla (UTC olarak)
    const reminderTime = new Date(matchStartTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - reminderMinutes);

    // Supabase'e UTC formatında kaydet
    const { data, error } = await supabase
      .from('reminders')
      .insert([
        {
          user_email: email,
          match_id: matchId,
          match_start_time: toUTCTime(new Date(matchStartTime)),
          reminder_time: toUTCTime(reminderTime),
          team1_name: team1Name,
          team2_name: team2Name
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reminder creation error:', error);
    return NextResponse.json(
      { error: 'Hatırlatıcı oluşturulamadı' },
      { status: 500 }
    );
  }
} 