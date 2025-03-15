import React from 'react';
import Image from 'next/image';

interface TeamLogoProps {
  imageUrl: string | null;
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
}

const TeamLogo: React.FC<TeamLogoProps> = ({ 
  imageUrl, 
  teamName,
  size = 'md'
}) => {
  // Size değerlerine göre boyutları belirle
  const sizeClasses = {
    sm: {
      container: "w-10 h-10",
      image: { width: 32, height: 32 },
      text: "text-xs"
    },
    md: {
      container: "w-14 h-14",
      image: { width: 48, height: 48 },
      text: "text-sm"
    },
    lg: {
      container: "w-20 h-20",
      image: { width: 64, height: 64 },
      text: "text-base"
    }
  };

  const { container, image, text } = sizeClasses[size];

  if (imageUrl) {
    return (
      <div className={`${container} relative bg-white rounded-full shadow-sm p-2 border border-gray-100`}>
        <Image
          src={imageUrl}
          alt={teamName}
          width={image.width}
          height={image.height}
          className="object-contain"
        />
      </div>
    );
  }
  
  return (
    <div className={`${container} bg-gray-100 flex items-center justify-center rounded-full shadow-sm border border-gray-100`}>
      <span className={`${text} font-bold text-gray-600`}>{teamName.substring(0, 2)}</span>
    </div>
  );
};

export default TeamLogo; 