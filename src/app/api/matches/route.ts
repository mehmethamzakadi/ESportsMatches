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
    const perPage = searchParams.get('perPage') || '50';

    // Farklı durumdaki maçları getir
    const [runningResponse, upcomingResponse, pastResponse] = await Promise.all([
      // Aktif maçlar
      fetch(
        `https://api.pandascore.co/csgo/matches/running?page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        }
      ),
      // Yaklaşan maçlar
      fetch(
        `https://api.pandascore.co/csgo/matches/upcoming?page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        }
      ),
      // Geçmiş maçlar
      fetch(
        `https://api.pandascore.co/csgo/matches/past?page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        }
      )
    ]);

    // Hata kontrolü
    if (!runningResponse.ok || !upcomingResponse.ok || !pastResponse.ok) {
      const errorStatus = !runningResponse.ok ? runningResponse.status : 
                        !upcomingResponse.ok ? upcomingResponse.status : 
                        pastResponse.status;
                        
      return NextResponse.json(
        { error: `API responded with status: ${errorStatus}` },
        { status: errorStatus }
      );
    }

    // Verileri JSON'a dönüştür
    const running = await runningResponse.json();
    const upcoming = await upcomingResponse.json();
    const past = await pastResponse.json();

    // Tüm maçları birleştir ve yanıt dön
    const allMatches = [...running, ...upcoming, ...past];
    
    console.log(`API yanıt verdi: ${allMatches.length} maç alındı.`);
    
    return NextResponse.json(allMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
} 