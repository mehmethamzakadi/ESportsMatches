import React from 'react';

interface MatchListSkeletonProps {
  count?: number;
  title: string;
}

const MatchListSkeleton: React.FC<MatchListSkeletonProps> = ({ count = 4, title }) => {
  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        <div className="ml-4 h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse h-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="flex justify-between items-center my-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchListSkeleton; 