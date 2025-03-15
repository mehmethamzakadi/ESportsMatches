import React, { useState } from 'react';
import Image from 'next/image';
import { Match } from '@/types/match';

interface MatchCardProps {
  match: Match;
  showDates?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, showDates = true }) => {
  const [showEmbed, setShowEmbed] = useState(false);
  
  // Maç tarihini formatla
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Twitch embed URL oluştur
  const createTwitchEmbedUrl = (rawUrl: string): string | undefined => {
    // Twitch URL'sinden kanal adını çıkar
    if (rawUrl.includes('twitch.tv')) {
      // URL'den kanal adını çıkar
      const channelMatch = rawUrl.match(/twitch\.tv\/([^\/\?]+)/);
      if (channelMatch && channelMatch[1]) {
        return `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${window.location.hostname}`;
      }
    }
    return undefined;
  };

  // Takım logosunu göster veya varsayılan logo
  const TeamLogo = ({ imageUrl, teamName }: { imageUrl: string | null; teamName: string }) => {
    if (imageUrl) {
      return (
        <div className="w-14 h-14 relative bg-white rounded-full shadow-sm p-2 border border-gray-100">
          <Image
            src={imageUrl}
            alt={teamName}
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      );
    }
    return (
      <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full shadow-sm border border-gray-100">
        <span className="text-sm font-bold text-gray-600">{teamName.substring(0, 2)}</span>
      </div>
    );
  };

  // Maçın durumuna göre renk ve metin belirle
  const getStatusBadge = () => {
    switch (match.status) {
      case 'running':
        return <span className="badge badge-success"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>CANLI</span>;
      case 'not_started':
        return <span className="badge badge-info">YAKINDA</span>;
      case 'finished':
        return <span className="badge badge-neutral">TAMAMLANDI</span>;
      case 'canceled':
        return <span className="badge badge-danger">İPTAL EDİLDİ</span>;
      default:
        return <span className="badge badge-neutral">{match.status}</span>;
    }
  };

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

  return (
    <div className="card p-8 transition-all hover:translate-y-[-2px] h-full flex flex-col shadow-md rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 w-full">
      <div className="flex flex-col mb-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 mr-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate text-lg">
              {match.league.name} <span className="text-sm text-gray-500 dark:text-gray-400">{match.serie.name === '' ? '' : '•'} {match.serie.name}</span>
            </h3>
          </div>
        </div>
        <div className="mt-3 self-start">
          {getStatusBadge()}
        </div>
      </div>

      {showDates && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm text-gray-600 dark:text-gray-300">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Başlangıç: {formatDate(match.begin_at)}</span>
            </div>
            {match.end_at && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Bitiş: {formatDate(match.end_at)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center flex-1 py-4">
        {match.opponents && match.opponents.length > 0 ? (
          <>
            <div className={`flex flex-col items-center w-1/3 ${winnerTeamId === team1Id ? 'bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg' : ''}`}>
              <TeamLogo 
                imageUrl={match.opponents[0]?.opponent.image_url} 
                teamName={match.opponents[0]?.opponent.name} 
              />
              <div className="w-full mt-4 px-2">
                <p className={`font-medium text-base text-center truncate line-clamp-2 min-h-[2.5rem] ${winnerTeamId === team1Id ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                  {match.opponents[0]?.opponent.name}
                </p>
              </div>
              {(match.status === 'finished' || match.status === 'running') && match.results && match.results.length >= 1 && (
                <span className={`text-2xl font-bold mt-2 ${match.status === 'running' ? 'text-blue-600 dark:text-blue-400' : (winnerTeamId === team1Id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-400')}`}>
                  {match.results[0]?.score}
                </span>
              )}
            </div>

            <div className="text-center w-1/3 px-2 flex flex-col justify-center">
              <div className="text-xl font-medium text-gray-400 dark:text-gray-500">
                VS
              </div>
              {match.status === 'finished' && !isCanceled && (
                <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full mt-3 text-gray-600 dark:text-gray-300">
                  {winnerTeamId ? 'Maç Sonucu' : 'Beraberlik'}
                </div>
              )}
            </div>

            <div className={`flex flex-col items-center w-1/3 ${winnerTeamId === team2Id ? 'bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg' : ''}`}>
              {match.opponents.length > 1 ? (
                <>
                  <TeamLogo 
                    imageUrl={match.opponents[1]?.opponent.image_url} 
                    teamName={match.opponents[1]?.opponent.name} 
                  />
                  <div className="w-full mt-4 px-2">
                    <p className={`font-medium text-base text-center truncate line-clamp-2 min-h-[2.5rem] ${winnerTeamId === team2Id ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                      {match.opponents[1]?.opponent.name}
                    </p>
                  </div>
                  {(match.status === 'finished' || match.status === 'running') && match.results && match.results.length >= 2 && (
                    <span className={`text-2xl font-bold mt-2 ${match.status === 'running' ? 'text-blue-600 dark:text-blue-400' : (winnerTeamId === team2Id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-400')}`}>
                      {match.results[1]?.score}
                    </span>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-full shadow-sm border border-gray-100 dark:border-gray-600">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">TBD</span>
                  </div>
                  <span className="mt-4 font-medium text-base text-gray-500 dark:text-gray-400">TBD</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">Eşleşme Belli Olmadı</div>
        )}
      </div>

      {match.status === 'running' && (
        <div className="mt-6 flex flex-col items-center">
          {match.streams_list && match.streams_list.length > 0 ? (
            <>
              {showEmbed ? (
                <div className="w-full mt-3 relative pt-[56.25%]">
                  <iframe 
                    src={createTwitchEmbedUrl(match.streams_list[0].raw_url)} 
                    className="absolute top-0 left-0 w-full h-full rounded-md"
                    frameBorder="0" 
                    allowFullScreen={true} 
                    scrolling="no"
                    title={`${match.opponents[0]?.opponent.name || 'Team 1'} vs ${match.opponents[1]?.opponent.name || 'Team 2'}`}
                  ></iframe>
                  <button 
                    onClick={() => setShowEmbed(false)}
                    className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-2 text-xs"
                  >
                    Kapat
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <a 
                    href={match.streams_list[0].raw_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors mb-3"
                  >
                    <span className="mr-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Canlı İzle
                  </a>
                  <button 
                    onClick={() => setShowEmbed(true)}
                    className="text-base text-blue-600 hover:underline flex items-center"
                  >
                    <span className="mr-2">📺</span>
                    Gömülü İzle
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-base">
              <span className="inline-block mr-2">📺</span>
              Link Yok
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchCard; 