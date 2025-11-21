import React, { useState, useRef, useCallback } from 'react';
import { generateVideoMetadataAI } from '../services/geminiService';
import { saveVideo } from '../services/db';
import { StoredVideo } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'select' | 'preview' | 'processing' | 'success'>('select');
  const [metadata, setMetadata] = useState<{ title: string; description: string; tags: string[] } | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Extract thumbnail from video
  const generateThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.currentTime = 1; // capture at 1 second
      video.onloadeddata = () => {
        setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
        }, 500); // slight delay to ensure rendering
      };
      video.load();
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStep('preview');
      setIsGenerating(true);

      try {
        // 1. Generate Thumbnail
        const thumb = await generateThumbnail(selectedFile);
        setThumbnailUrl(thumb);

        // 2. Generate AI Metadata
        const aiMeta = await generateVideoMetadataAI(selectedFile.name);
        setMetadata(aiMeta);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handlePublish = async () => {
    if (!file || !metadata) return;
    setStep('processing');

    try {
      const newVideo: StoredVideo = {
        id: uuidv4(),
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        fileName: file.name,
        fileSize: file.size,
        thumbnailDataUrl: thumbnailUrl,
        uploadDate: Date.now(),
        views: 0,
        blob: file
      };

      await saveVideo(newVideo);
      
      setStep('success');
      setTimeout(() => {
        onUploadSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to save video", err);
      setStep('preview'); // Go back on error
      alert("Storage failed. The file might be too large for your browser.");
    }
  };

  const handleClose = () => {
    setFile(null);
    setStep('select');
    setMetadata(null);
    setThumbnailUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-800 rounded-2xl w-full max-w-xl border border-dark-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Upload Content</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          
          {step === 'select' && (
            <div className="border-2 border-dashed border-dark-600 hover:border-brand-500 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer relative">
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="bg-dark-700 rounded-full p-4 mb-4 group-hover:bg-brand-900/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Select a video to upload</h3>
              <p className="text-sm text-gray-400">No censorship. No limits. <br/>MP4, WebM, Ogg supported.</p>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              {/* Preview Area */}
              <div className="flex gap-4">
                <div className="w-1/3 aspect-video bg-black rounded-lg overflow-hidden border border-dark-700 relative">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
                    </div>
                  )}
                </div>
                <div className="w-2/3 flex flex-col justify-center">
                   <p className="text-sm text-gray-400 mb-1">Filename</p>
                   <p className="text-white font-mono text-sm truncate">{file?.name}</p>
                   <p className="text-xs text-brand-500 mt-2">
                     {isGenerating ? "Gemini AI is analyzing your video..." : "Analysis Complete"}
                   </p>
                </div>
              </div>

              {/* Form */}
              {isGenerating ? (
                <div className="space-y-4 animate-pulse">
                   <div className="h-10 bg-dark-700 rounded w-3/4"></div>
                   <div className="h-24 bg-dark-700 rounded w-full"></div>
                   <div className="flex gap-2">
                     <div className="h-6 bg-dark-700 rounded w-16"></div>
                     <div className="h-6 bg-dark-700 rounded w-16"></div>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={metadata?.title || ''}
                      onChange={(e) => setMetadata(prev => prev ? {...prev, title: e.target.value} : null)}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea 
                      value={metadata?.description || ''}
                      onChange={(e) => setMetadata(prev => prev ? {...prev, description: e.target.value} : null)}
                      rows={3}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {metadata?.tags.map((tag, idx) => (
                        <span key={idx} className="bg-dark-700 text-gray-200 text-xs px-2 py-1 rounded-full border border-dark-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mb-4"></div>
              <h3 className="text-lg font-medium text-white">Uploading to Local Storage...</h3>
              <p className="text-sm text-gray-400 mt-2">Please wait while we save your masterpiece.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-green-500/20 p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">Upload Complete!</h3>
            </div>
          )}

        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="p-6 border-t border-dark-700 bg-dark-800/50 flex justify-end gap-3">
            <button 
              onClick={() => setStep('select')}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handlePublish}
              disabled={isGenerating}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-900/20"
            >
              Publish Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;