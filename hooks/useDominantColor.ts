import { useEffect, useState } from 'react';
import ColorThief from 'color-thief-browser';

export function useDominantColor(imageUrl: string, fallback: string = '#222') {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    img.onload = () => {
      try {
        const colorArr = ColorThief.getColor(img);
        setColor(`rgb(${colorArr[0]},${colorArr[1]},${colorArr[2]})`);
      } catch {
        setColor(fallback);
      }
    };
    img.onerror = () => setColor(fallback);
  }, [imageUrl, fallback]);

  return color;
} 