import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThreadTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffYears = now.getFullYear() - date.getFullYear();

  if (diffMinutes < 60) {
    return `${diffMinutes <= 0 ? 1 : diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffYears === 0) {
    // Show as '15 July'
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
  } else {
    // Show as '15 July 2023'
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

// Enhanced responsive image utilities for better mobile support
export const getResponsiveImageStyle = (screenWidth: number) => {
  if (screenWidth < 400) {
    // Much smaller for narrow screens to prevent overflow
    const responsiveWidth = screenWidth - 120; // 60px margin each side
    const responsiveHeight = (responsiveWidth * 150) / 200; // Shorter height
    return {
      width: responsiveWidth,
      height: responsiveHeight,
      borderRadius: 12,
      backgroundColor: '#f3f4f6'
    };
  } else if (screenWidth < 500) {
    // Medium size for small screens
    const responsiveWidth = screenWidth - 140; // 70px margin each side
    const responsiveHeight = (responsiveWidth * 160) / 220;
    return {
      width: responsiveWidth,
      height: responsiveHeight,
      borderRadius: 12,
      backgroundColor: '#f3f4f6'
    };
  }
  return {
    width: 280,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6'
  };
};

export const getCompactImageStyle = (screenWidth: number) => {
  if (screenWidth < 400) {
    // Much smaller for preview images on narrow screens
    const compactWidth = screenWidth - 160; // 80px margin each side
    const compactHeight = (compactWidth * 120) / 160; // Taller aspect ratio to show full driver
    return {
      width: compactWidth,
      height: compactHeight,
      borderRadius: 8,
      marginTop: 4,
      backgroundColor: '#f3f4f6'
    };
  } else if (screenWidth < 500) {
    // Medium compact for small screens
    const compactWidth = screenWidth - 180; // 90px margin each side
    const compactHeight = (compactWidth * 140) / 180; // Taller aspect ratio
    return {
      width: compactWidth,
      height: compactHeight,
      borderRadius: 8,
      marginTop: 4,
      backgroundColor: '#f3f4f6'
    };
  }
  return {
    width: 180,
    height: 140,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#f3f4f6'
  };
};

// New function for very compact images (for nested content)
export const getVeryCompactImageStyle = (screenWidth: number) => {
  if (screenWidth < 400) {
    // Extremely small for deeply nested content
    const compactWidth = screenWidth - 200; // 100px margin each side
    const compactHeight = (compactWidth * 100) / 140; // Taller ratio to show full driver
    return {
      width: compactWidth,
      height: compactHeight,
      borderRadius: 6,
      marginTop: 4,
      backgroundColor: '#f3f4f6'
    };
  } else if (screenWidth < 500) {
    const compactWidth = screenWidth - 220; // 110px margin each side
    const compactHeight = (compactWidth * 120) / 160; // Taller ratio
    return {
      width: compactWidth,
      height: compactHeight,
      borderRadius: 6,
      marginTop: 4,
      backgroundColor: '#f3f4f6'
    };
  }
  return {
    width: 140,
    height: 110,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#f3f4f6'
  };
}; 