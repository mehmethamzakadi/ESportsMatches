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
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">{title}</h2>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg shadow-sm">
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {message}
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage; 