import { useState, useEffect } from 'react';

export interface LandingPageImages {
  hero: string;
  about: string;
}

const DEFAULT_IMAGES: LandingPageImages = {
  hero: '/jeya1.jpeg',
  about: '/jeya.jpeg'
};

export function useLandingPage() {
  const [images, setImages] = useState<LandingPageImages>(() => {
    try {
      const saved = localStorage.getItem('rhythm_rise_landing_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading landing page images:", e);
    }
    return DEFAULT_IMAGES;
  });

  useEffect(() => {
    localStorage.setItem('rhythm_rise_landing_v1', JSON.stringify(images));
  }, [images]);

  const updateImage = (key: keyof LandingPageImages, url: string) => {
    setImages(prev => ({ ...prev, [key]: url }));
  };

  const resetImages = () => {
    setImages(DEFAULT_IMAGES);
  };

  return { images, updateImage, resetImages };
}
