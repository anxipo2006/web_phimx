import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  onUploadClick: () => void;
  onHomeClick: () => void;
  currentView: AppView;
}

const Header: React.FC<HeaderProps> = ({ onUploadClick, onHomeClick, currentView }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-700 bg-dark-900/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={onHomeClick}
        >
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Stream<span className="text-brand-500">Unbound</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onHomeClick}
            className={`text-sm font-medium transition-colors ${currentView === AppView.HOME ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Browse
          </button>
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-brand-900/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;