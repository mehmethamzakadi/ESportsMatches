import React from 'react';
import { Match } from '@/types/match';
import StatusBadge from './ui/StatusBadge';
import MatchDate from './ui/MatchDate';
import TeamScore from './ui/TeamScore';
import StreamEmbed from './ui/StreamEmbed';
import TeamLogo from './ui/TeamLogo';

interface MatchCardProps {
  match: Match;
  showDates?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, showDates = true }) => {
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
          <StatusBadge status={match.status} />
        </div>
      </div>

      {showDates && (
        <MatchDate beginAt={match.begin_at} endAt={match.end_at} />
      )}

      <div className="flex justify-between items-center flex-1 py-4">
        {match.opponents && match.opponents.length > 0 ? (
          <>
            <div className="w-1/3">
              <TeamScore 
                team={match.opponents[0]?.opponent}
                score={match.results && match.results.length >= 1 ? match.results[0]?.score : undefined}
                isWinner={winnerTeamId === team1Id}
                isRunning={isRunning}
              />
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

            <div className="w-1/3">
              {match.opponents.length > 1 ? (
                <TeamScore 
                  team={match.opponents[1]?.opponent}
                  score={match.results && match.results.length >= 2 ? match.results[1]?.score : undefined}
                  isWinner={winnerTeamId === team2Id}
                  isRunning={isRunning}
                />
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

      {match.status === 'running' && match.streams_list && match.streams_list.length > 0 && (
        <StreamEmbed 
          streamUrl={match.streams_list[0].raw_url} 
          teamNames={{
            team1: match.opponents[0]?.opponent.name || 'Team 1',
            team2: match.opponents[1]?.opponent.name || 'Team 2'
          }}
        />
      )}
    </div>
  );
};

export default MatchCard; 