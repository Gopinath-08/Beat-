export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateProgress = (currentTime: number, duration: number): number => {
  if (isNaN(duration) || duration === 0) return 0;
  return (currentTime / duration) * 100;
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isValidAudioFile = (filename: string): boolean => {
  const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
  const extension = getFileExtension(filename);
  return validExtensions.includes(extension);
};

export const getFileSizeInMB = (bytes: number): number => {
  return bytes / (1024 * 1024);
};

export const isValidFileSize = (bytes: number, maxSizeMB: number = 50): boolean => {
  return getFileSizeInMB(bytes) <= maxSizeMB;
}; 