import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message,
  icon 
}) => {
  return (
    <div className="py-4 sm:py-8">
      {title && <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-8">{title}</h2>}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-400 px-4 sm:px-6 py-6 sm:py-8 rounded-lg shadow-sm text-center">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary-400 dark:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <p className="text-base sm:text-lg">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState; 