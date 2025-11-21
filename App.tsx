import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import VideoCard from './components/VideoCard';
import UploadModal from './components/UploadModal';
import VideoPlayer from './components/VideoPlayer';
import { initDB, getAllVideosMetadata } from './services/db';
import { AppView, VideoMetadata } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const allVideos = await getAllVideosMetadata();
      setVideos(allVideos);
    } catch (e) {
      console.error("Failed to load videos", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize DB and load videos on mount
    initDB().then(() => {
      loadVideos();
    }).catch(err => console.error(err));
  }, []);

  const handleUploadSuccess = () => {
    loadVideos(); // Refresh grid
    setCurrentView(AppView.HOME);
  };

  const handleVideoClick = (id: string) => {
    setSelectedVideoId(id);
    setCurrentView(AppView.WATCH);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setSelectedVideoId(null);
    setCurrentView(AppView.HOME);
  };

  const renderContent = () => {
    if (currentView === AppView.WATCH && selectedVideoId) {
      const video = videos.find(v => v.id === selectedVideoId);
      if (video) {
        return <VideoPlayer video={video} onBack={handleBackToHome} />;
      }
    }

    // Home View (Grid)
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      );
    }

    if (videos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="bg-dark-800 p-6 rounded-full">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
             </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">No videos yet</h2>
          <p className="text-gray-400 max-w-md">
            Be the first to broadcast! Upload a video to get started. Your videos are stored locally in your browser.
          </p>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Upload First Video
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {videos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onClick={handleVideoClick} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-900 font-sans text-white">
      <Header 
        onUploadClick={() => setIsUploadModalOpen(true)} 
        onHomeClick={handleBackToHome}
        currentView={currentView}
      />

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default App;