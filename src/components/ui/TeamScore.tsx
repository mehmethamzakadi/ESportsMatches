import React from 'react';
import TeamLogo from './TeamLogo';
import { Team } from '@/types/match';

interface TeamScoreProps {
  team: Team;
  score?: number;
  isWinner: boolean;
  isRunning: boolean;
}

const TeamScore: React.FC<TeamScoreProps> = ({ 
  team, 
  score, 
  isWinner, 
  isRunning 
}) => {
  return (
    <div className={`flex flex-col items-center w-full ${isWinner ? 'bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg' : ''}`}>
      <TeamLogo 
        imageUrl={team.image_url} 
        teamName={team.name} 
      />
      <div className="w-full mt-4 px-2">
        <p className={`font-medium text-base text-center truncate line-clamp-2 min-h-[2.5rem] ${
          isWinner 
            ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {team.name}
        </p>
      </div>
      {score !== undefined && (
        <span className={`text-2xl font-bold mt-2 ${
          isRunning 
            ? 'text-blue-600 dark:text-blue-400' 
            : (isWinner 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-700 dark:text-gray-400')
        }`}>
          {score}
        </span>
      )}
    </div>
  );
};

export default TeamScore; 