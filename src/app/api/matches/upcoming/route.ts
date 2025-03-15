import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.PANDASCORE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    // URL'den sayfalama parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '100';

    // Gelecek 7 günün maçlarını getir
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    
    const todayFormatted = today.toISOString().split('T')[0];
    const sevenDaysLaterFormatted = sevenDaysLater.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.pandascore.co/csgo/matches/upcoming?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `API responded with status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming matches' },
      { status: 500 }
    );
  }
} 