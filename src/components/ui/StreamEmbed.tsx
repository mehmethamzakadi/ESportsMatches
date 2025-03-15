"use client";

import React, { useState } from 'react';

interface StreamEmbedProps {
  streamUrl: string;
  teamNames: {
    team1: string;
    team2: string;
  };
}

const StreamEmbed: React.FC<StreamEmbedProps> = ({ streamUrl, teamNames }) => {
  const [showEmbed, setShowEmbed] = useState(false);

  // Twitch embed URL oluştur
  const createTwitchEmbedUrl = (rawUrl: string): string | undefined => {
    if (rawUrl.includes('twitch.tv')) {
      const channelMatch = rawUrl.match(/twitch\.tv\/([^\/\?]+)/);
      if (channelMatch && channelMatch[1]) {
        return `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${window.location.hostname}`;
      }
    }
    return undefined;
  };

  const embedUrl = createTwitchEmbedUrl(streamUrl);

  if (!embedUrl) {
    return (
      <div className="text-gray-500 text-base">
        <span className="inline-block mr-2">📺</span>
        Geçersiz Yayın Linki
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {showEmbed ? (
        <div className="w-full mt-3 relative pt-[56.25%]">
          <iframe 
            src={embedUrl} 
            className="absolute top-0 left-0 w-full h-full rounded-md"
            frameBorder="0" 
            allowFullScreen={true} 
            scrolling="no"
            title={`${teamNames.team1 || 'Team 1'} vs ${teamNames.team2 || 'Team 2'}`}
          ></iframe>
          <button 
            onClick={() => setShowEmbed(false)}
            className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-2 text-xs"
          >
            Kapat
          </button>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center gap-3 w-full">
          <a 
            href={streamUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all shadow-sm hover:shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Canlı İzle
          </a>
          <button 
            onClick={() => setShowEmbed(true)}
            className="flex-1 flex items-center justify-center px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all shadow-sm hover:shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Gömülü İzle
          </button>
        </div>
      )}
    </div>
  );
};

export default StreamEmbed; 