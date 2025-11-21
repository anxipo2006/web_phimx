import React from 'react';
import { VideoMetadata } from '../types';

interface VideoCardProps {
  video: VideoMetadata;
  onClick: (id: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  // Format time ago
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  return (
    <div 
      className="group cursor-pointer flex flex-col gap-2"
      onClick={() => onClick(video.id)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-dark-800 border border-dark-700 shadow-sm transition-all duration-300 group-hover:ring-2 group-hover:ring-brand-500">
        {video.thumbnailDataUrl ? (
          <img 
            src={video.thumbnailDataUrl} 
            alt={video.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dark-800 to-dark-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
      </div>

      {/* Meta */}
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="h-9 w-9 rounded-full bg-brand-900 text-brand-100 flex items-center justify-center font-bold text-xs">
            {video.title.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-white line-clamp-2 leading-tight group-hover:text-brand-500 transition-colors">
            {video.title}
          </h3>
          <div className="text-xs text-gray-400 mt-1">
            <span>{video.views} views</span>
            <span className="mx-1">•</span>
            <span>{timeAgo(video.uploadDate)}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {video.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-dark-700 text-gray-300 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;