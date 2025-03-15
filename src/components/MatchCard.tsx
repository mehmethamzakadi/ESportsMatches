import React, { useState } from 'react';
import { Match } from '@/types/match';
import StatusBadge from './ui/StatusBadge';
import MatchDate from './ui/MatchDate';
import TeamLogo from './ui/TeamLogo';
import StreamEmbed from './ui/StreamEmbed';

interface MatchCardProps {
  match: Match;
  showDates?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, showDates = true }) => {
  const [showStreamEmbed, setShowStreamEmbed] = useState(false);

  // Kazanan takımı belirle
  const getWinnerTeamId = () => {
    if (match.status !== 'finished' || !match.results || match.results.length < 2) {
      return null;
    }
    
    const team1Score = match.results[0]?.score || 0;
    const team2Score = match.results[1]?.score || 0;
    
    if (team1Score > team2Score) {
      return match.results[0]?.team_id;
    } else if (team2Score > team1Score) {
      return match.results[1]?.team_id;
    }
    
    return null; // Beraberlik durumu
  };

  const winnerTeamId = getWinnerTeamId();
  const team1Id = match.opponents[0]?.opponent.id;
  const team2Id = match.opponents[1]?.opponent.id;
  const isCanceled = match.status === 'canceled';
  const isRunning = match.status === 'running';
  const isFinished = match.status === 'finished';

  // Skor gösterimi için yardımcı fonksiyon
  const renderScore = (teamIndex: number) => {
    if (!match.results || match.results.length <= teamIndex) return null;
    
    const score = match.results[teamIndex]?.score;
    const isWinner = winnerTeamId === match.results[teamIndex]?.team_id;
    
    return (
      <span className={`font-bold text-lg ${
        isRunning 
          ? 'text-blue-600 dark:text-blue-400' 
          : (isWinner 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-gray-700 dark:text-gray-400')
      }`}>
        {score}
      </span>
    );
  };

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all hover:translate-y-[-1px]">
      <div className="p-4">
        {/* Üst Bilgi Satırı */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm">
              {match.league.name} 
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {match.serie.name === '' ? '' : '•'} {match.serie.name}
              </span>
            </h3>
          </div>
          <StatusBadge status={match.status} />
        </div>
        
        {/* Ana İçerik */}
        <div className="flex items-center py-2">
          {/* Sol Takım */}
          <div className="flex items-center flex-1">
            <TeamLogo 
              imageUrl={match.opponents[0]?.opponent.image_url} 
              teamName={match.opponents[0]?.opponent.name || 'TBD'} 
              size="sm"
            />
            <span className={`ml-2 font-medium text-sm ${
              winnerTeamId === team1Id 
                ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {match.opponents[0]?.opponent.name || 'TBD'}
            </span>
          </div>
          
          {/* Skor */}
          <div className="flex items-center justify-center space-x-2 px-3">
            {renderScore(0)}
            <span className="text-gray-400 dark:text-gray-500 mx-1">-</span>
            {renderScore(1)}
          </div>
          
          {/* Sağ Takım */}
          <div className="flex items-center justify-end flex-1">
            <span className={`mr-2 font-medium text-sm text-right ${
              winnerTeamId === team2Id 
                ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {match.opponents[1]?.opponent.name || 'TBD'}
            </span>
            <TeamLogo 
              imageUrl={match.opponents[1]?.opponent.image_url} 
              teamName={match.opponents[1]?.opponent.name || 'TBD'} 
              size="sm"
            />
          </div>
        </div>
        
        {/* Alt Bilgi Satırı - Tarihler */}
        {showDates && (
          <div className="flex flex-col items-center justify-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            {/* Başlangıç Tarihi */}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Başlangıç: {formatDate(match.begin_at)}</span>
            </div>
            
            {/* Bitiş Tarihi (Sadece tamamlanmış maçlar için) */}
            {isFinished && match.end_at && (
              <div className="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Bitiş: {formatDate(match.end_at)}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Canlı İzle Butonu */}
        {match.status === 'running' && match.streams_list && match.streams_list.length > 0 && (
          <div className="flex justify-center mt-3">
            <button 
              onClick={() => setShowStreamEmbed(!showStreamEmbed)}
              className="flex items-center justify-center px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-all shadow-sm hover:shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showStreamEmbed ? 'YAYIN PANELINI KAPAT' : 'CANLI İZLE'}
            </button>
          </div>
        )}
      </div>
      
      {/* Stream Embed (Açılır Kapanır Panel) */}
      {showStreamEmbed && match.status === 'running' && match.streams_list && match.streams_list.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4">
          <StreamEmbed 
            streamUrl={match.streams_list[0].raw_url} 
            teamNames={{
              team1: match.opponents[0]?.opponent.name || 'Team 1',
              team2: match.opponents[1]?.opponent.name || 'Team 2'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MatchCard; 