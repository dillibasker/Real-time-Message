import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        
        <p className="text-[var(--color-text-secondary)] mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link
          to="/"
          className="app-button inline-block"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;