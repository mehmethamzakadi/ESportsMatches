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
    <div className="mt-6 flex flex-col items-center">
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
        <div className="flex flex-col items-center">
          <a 
            href={streamUrl} 
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
    </div>
  );
};

export default StreamEmbed; 