import React, { useEffect, useState, useRef } from 'react';
import { VideoMetadata } from '../types';
import { getVideoBlob } from '../services/db';

interface VideoPlayerProps {
  video: VideoMetadata;
  onBack: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onBack }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadVideo = async () => {
      try {
        setLoading(true);
        const blob = await getVideoBlob(video.id);
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setVideoUrl(objectUrl);
        } else {
          setError("Video file not found in local storage.");
        }
      } catch (e) {
        setError("Failed to load video.");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();

    // Cleanup
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [video.id]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      {/* Main Content: Player */}
      <div className="flex-1">
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 flex-col gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <span className="text-sm">{error}</span>
            </div>
          )}

          {videoUrl && !error && (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
            />
          )}
          
          {/* Back Button Overlay (Visible on hover or if needed) */}
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 bg-black/50 hover:bg-brand-600 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
             <h1 className="text-2xl font-bold text-white">{video.title}</h1>
             <div className="flex items-center justify-between mt-2 border-b border-dark-700 pb-4">
               <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white">
                    {video.title.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Anonymous Creator</p>
                    <p className="text-xs text-gray-400">{video.views} views</p>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button className="flex items-center gap-1 bg-dark-700 hover:bg-dark-600 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Like
                 </button>
                 <button className="flex items-center gap-1 bg-dark-700 hover:bg-dark-600 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                 </button>
               </div>
             </div>
          </div>

          <div className="bg-dark-800/50 p-4 rounded-xl">
            <p className="text-sm font-bold text-white mb-2">Description</p>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
            <div className="flex gap-2 mt-4">
               {video.tags.map(tag => (
                 <span key={tag} className="text-xs text-brand-400">#{tag}</span>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Up Next (Mock) */}
      <div className="lg:w-[350px] flex flex-col gap-4">
         <h3 className="text-lg font-bold text-white">Up Next</h3>
         {[1,2,3].map(i => (
           <div key={i} className="flex gap-2 cursor-pointer group hover:bg-dark-800 p-2 rounded-lg transition-colors">
              <div className="w-40 h-24 bg-dark-700 rounded-lg overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
              </div>
              <div className="flex-1">
                 <div className="h-4 w-3/4 bg-dark-700 rounded mb-2 group-hover:bg-dark-600"></div>
                 <div className="h-3 w-1/2 bg-dark-700 rounded group-hover:bg-dark-600"></div>
              </div>
           </div>
         ))}
         <div className="p-4 bg-brand-900/20 border border-brand-900/50 rounded-lg text-xs text-brand-200">
            Note: This is a local demo. Uploaded videos are stored in your browser.
         </div>
      </div>
    </div>
  );
};

export default VideoPlayer;