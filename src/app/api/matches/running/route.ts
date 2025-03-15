import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.PANDASCORE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://api.pandascore.co/csgo/matches/running',
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
    console.error('Error fetching running matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch running matches' },
      { status: 500 }
    );
  }
} 