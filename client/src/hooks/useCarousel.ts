import { useState, useEffect } from "react";

interface useCarouselProps {
  totalImages: number;
  interval?: number;
}

export const useCarousel = ({ totalImages, interval = 5000 }: useCarouselProps) => {
  const [currentImages, setCurrentImages] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImages((prev) => (prev + 1) % totalImages);
    }, interval);

    return () => clearInterval(timer);
  });

  return currentImages;
};
