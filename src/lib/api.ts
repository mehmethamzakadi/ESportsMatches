import axios from 'axios';
import { Match } from '@/types/match';

// API anahtarınızı buraya ekleyin
const API_KEY = process.env.NEXT_PUBLIC_PANDASCORE_API_KEY || '';
const BASE_URL = 'https://api.pandascore.co/csgo/matches';

// Axios instance oluşturma
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'application/json',
  },
});

// Gelecek maçları getir
export async function getUpcomingMatches(page = 1, perPage = 50): Promise<Match[]> {
  try {
    const response = await api.get('/upcoming', {
      params: {
        page,
        per_page: perPage,
        sort: 'begin_at',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }
}

// Aktif maçları getir
export async function getRunningMatches(page = 1, perPage = 50): Promise<Match[]> {
  try {
    const response = await api.get('/running', {
      params: {
        page,
        per_page: perPage,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching running matches:', error);
    return [];
  }
}

// Geçmiş maçları getir
export async function getPastMatches(page = 1, perPage = 50): Promise<Match[]> {
  try {
    const response = await api.get('/past', {
      params: {
        page,
        per_page: perPage        
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching past matches:', error);
    return [];
  }
} 