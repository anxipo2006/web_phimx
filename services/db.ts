import { StoredVideo, VideoMetadata } from '../types';

const DB_NAME = 'StreamUnboundDB';
const STORE_NAME = 'videos';
const DB_VERSION = 1;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Error opening database');

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve();
  });
};

export const saveVideo = (video: StoredVideo): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(video);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject('Error saving video');
    };
    request.onerror = () => reject('Error opening DB');
  });
};

export const getAllVideosMetadata = (): Promise<VideoMetadata[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const allRequest = store.getAll();
      
      allRequest.onsuccess = () => {
        // We strip the blob to save memory when listing, only needed for playback
        const videos = allRequest.result.map(({ blob, ...meta }) => meta as VideoMetadata);
        // Sort by date desc
        videos.sort((a, b) => b.uploadDate - a.uploadDate);
        resolve(videos);
      };
      allRequest.onerror = () => reject('Error fetching videos');
    };
    request.onerror = () => reject('Error opening DB');
  });
};

export const getVideoBlob = (id: string): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        resolve(getRequest.result ? getRequest.result.blob : null);
      };
      getRequest.onerror = () => reject('Error fetching video blob');
    };
    request.onerror = () => reject('Error opening DB');
  });
};

// Helper to delete old videos if space is tight (Optional, not implemented in UI but good for logic)
export const deleteVideo = (id: string): Promise<void> => {
   return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
    };
   });
}