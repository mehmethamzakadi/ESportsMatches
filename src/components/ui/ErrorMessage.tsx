import React from 'react';

interface ErrorMessageProps {
  title: string;
  message?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title, 
  message = "Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin." 
}) => {
  return (
    <div className="py-4 sm:py-8">
      {title && <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-8">{title}</h2>}
      <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-100 dark:border-danger-800 text-danger-700 dark:text-danger-400 px-4 sm:px-6 py-4 sm:py-5 rounded-lg shadow-sm">
        <p className="flex items-start sm:items-center text-sm sm:text-base">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage; 