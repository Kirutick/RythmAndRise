import { useState, useEffect } from 'react';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
}

const DEFAULT_MEDIA: MediaItem[] = [
  { id: '1', type: 'image', url: '/jeya1.jpeg', title: 'Energy Activation' },
  { id: '2', type: 'image', url: '/jeya.jpeg', title: 'Wellness Coaching' },
];

export function useMedia() {
  const [media, setMedia] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('rhythm_rise_media');
      return saved ? JSON.parse(saved) : DEFAULT_MEDIA;
    } catch (error) {
      console.error("Error parsing media data from localStorage:", error);
      return DEFAULT_MEDIA;
    }
  });

  useEffect(() => {
    localStorage.setItem('rhythm_rise_media', JSON.stringify(media));
  }, [media]);

  const addMedia = (item: Omit<MediaItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setMedia([...media, newItem]);
  };

  const removeMedia = (id: string) => {
    setMedia(media.filter(item => item.id !== id));
  };

  return { media, addMedia, removeMedia };
}
