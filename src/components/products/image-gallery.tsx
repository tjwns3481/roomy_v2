'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, ZoomOut } from 'lucide-react';
import type { ProductImage } from '@/types/product';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: ProductImage[];
}

/**
 * ImageGallery Component
 *
 * Multi-image gallery with thumbnails and zoom functionality.
 * Features:
 * - Main image display (large)
 * - Thumbnail list (horizontal scroll on mobile)
 * - Click thumbnail to change main image
 * - Click main image to zoom
 * - Neo-Brutalism styling
 * - Responsive layout
 */
export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Filter valid images with non-empty URLs
  const validImages = (images || []).filter(img => img && img.url && img.url.trim() !== '');

  // Empty state
  if (validImages.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-neo-cream border-3 border-neo-black shadow-neo h-96"
        data-testid="main-image-container"
      >
        <p className="text-neo-black/50 font-bold">No images available</p>
      </div>
    );
  }

  // Sort images by sort_order
  const sortedImages = [...validImages].sort((a, b) => a.sort_order - b.sort_order);
  const selectedImage = sortedImages[selectedIndex];
  const showThumbnails = sortedImages.length > 1;

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false); // Reset zoom when changing image
  };

  const handleMainImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className={cn(
          'relative bg-neo-cream border-3 border-neo-black shadow-neo overflow-hidden',
          'aspect-square',
          isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        )}
        onClick={handleMainImageClick}
        data-testid="main-image-container"
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt_text || `Product image ${selectedIndex + 1}`}
          fill
          className={cn(
            'object-cover transition-transform duration-300',
            isZoomed ? 'scale-150' : 'scale-100'
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={selectedIndex === 0}
          unoptimized
        />

        {/* Zoom Indicator */}
        {!isZoomed && (
          <div
            className="absolute bottom-4 right-4 p-2 bg-neo-white border-2 border-neo-black shadow-neo-sm"
            aria-label="Click to zoom"
          >
            <ZoomIn className="w-5 h-5 text-neo-black" strokeWidth={2.5} />
          </div>
        )}

        {isZoomed && (
          <div
            className="absolute bottom-4 right-4 p-2 bg-neo-white border-2 border-neo-black shadow-neo-sm"
            aria-label="Click to zoom out"
          >
            <ZoomOut className="w-5 h-5 text-neo-black" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && (
        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          role="list"
          aria-label="Image thumbnails"
        >
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative flex-shrink-0 w-20 h-20',
                'bg-neo-cream border-3 border-neo-black overflow-hidden',
                'transition-all duration-150',
                selectedIndex === index
                  ? 'ring-4 ring-neo-blue ring-offset-2'
                  : 'hover:border-neo-blue'
              )}
              aria-label={`Select image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}: ${image.alt_text || 'Product image'}`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {/* Custom scrollbar hide utility */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
