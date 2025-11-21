export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  tags: string[];
  fileName: string;
  fileSize: number;
  thumbnailDataUrl: string;
  uploadDate: number;
  views: number;
}

// Used for the IndexedDB storage
export interface StoredVideo extends VideoMetadata {
  blob: Blob;
}

export enum AppView {
  HOME = 'HOME',
  WATCH = 'WATCH',
}
