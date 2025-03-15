import { Match } from '@/types/match';

// Gelecek maçları getir
export async function getUpcomingMatches(page = 1, perPage = 50): Promise<Match[]> {
  try {
    // Kendi API endpoint'imizi kullanıyoruz
    const response = await fetch('/api/matches/upcoming');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }
}

// Aktif maçları getir
export async function getRunningMatches(page = 1, perPage = 50): Promise<Match[]> {
  try {
    // Kendi API endpoint'imizi kullanıyoruz
    const response = await fetch('/api/matches/running');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching running matches:', error);
    return [];
  }
}

// Geçmiş maçları getir
export async function getPastMatches(page = 1, perPage = 50): Promise<Match[]> {
  try {
    // Kendi API endpoint'imizi kullanıyoruz
    const response = await fetch('/api/matches/past');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching past matches:', error);
    return [];
  }
} 