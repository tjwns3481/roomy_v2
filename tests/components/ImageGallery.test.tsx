import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageGallery } from '@/components/products/image-gallery';
import type { ProductImage } from '@/types/product';

// Mock data
const mockSingleImage: ProductImage[] = [
  {
    id: '1',
    product_id: 'p1',
    url: 'https://example.com/image1.jpg',
    alt_text: 'Test Product Image',
    sort_order: 0,
    is_primary: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockMultipleImages: ProductImage[] = [
  {
    id: '1',
    product_id: 'p1',
    url: 'https://example.com/image1.jpg',
    alt_text: 'Test Product Image 1',
    sort_order: 0,
    is_primary: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    product_id: 'p1',
    url: 'https://example.com/image2.jpg',
    alt_text: 'Test Product Image 2',
    sort_order: 1,
    is_primary: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    product_id: 'p1',
    url: 'https://example.com/image3.jpg',
    alt_text: 'Test Product Image 3',
    sort_order: 2,
    is_primary: false,
    created_at: '2024-01-01T00:00:00Z',
  },
];

describe('ImageGallery', () => {
  describe('Single Image', () => {
    it('renders single image without thumbnails', () => {
      render(<ImageGallery images={mockSingleImage} />);

      // Main image should be visible
      const mainImage = screen.getByAltText('Test Product Image');
      expect(mainImage).toBeInTheDocument();
      // Next.js Image component transforms the URL, so check it contains the original URL
      expect(mainImage.getAttribute('src')).toContain('example.com');

      // Thumbnails should not be visible for single image
      const thumbnails = screen.queryByRole('list', { name: /thumbnails/i });
      expect(thumbnails).not.toBeInTheDocument();
    });
  });

  describe('Multiple Images', () => {
    it('renders main image and thumbnails', () => {
      render(<ImageGallery images={mockMultipleImages} />);

      // Main image should display the primary image
      const mainImage = screen.getByAltText('Test Product Image 1');
      expect(mainImage).toBeInTheDocument();

      // Thumbnails should be visible
      const thumbnail1 = screen.getByAltText('Thumbnail 1: Test Product Image 1');
      const thumbnail2 = screen.getByAltText('Thumbnail 2: Test Product Image 2');
      const thumbnail3 = screen.getByAltText('Thumbnail 3: Test Product Image 3');

      expect(thumbnail1).toBeInTheDocument();
      expect(thumbnail2).toBeInTheDocument();
      expect(thumbnail3).toBeInTheDocument();
    });

    it('changes main image when thumbnail is clicked', async () => {
      render(<ImageGallery images={mockMultipleImages} />);

      // Initially shows first image
      const mainImage = screen.getByAltText('Test Product Image 1');
      expect(mainImage.getAttribute('src')).toContain('image1.jpg');

      // Click second thumbnail
      const thumbnail2 = screen.getByAltText('Thumbnail 2: Test Product Image 2');
      fireEvent.click(thumbnail2);

      // Main image should change
      await waitFor(() => {
        const updatedMainImage = screen.getByAltText('Test Product Image 2');
        expect(updatedMainImage.getAttribute('src')).toContain('image2.jpg');
      });
    });

    it('highlights active thumbnail', () => {
      render(<ImageGallery images={mockMultipleImages} />);

      // First thumbnail should be active
      const thumbnail1 = screen
        .getByAltText('Thumbnail 1: Test Product Image 1')
        .closest('button');
      expect(thumbnail1).toHaveClass('ring-4', 'ring-neo-blue');

      // Other thumbnails should not be active
      const thumbnail2 = screen
        .getByAltText('Thumbnail 2: Test Product Image 2')
        .closest('button');
      expect(thumbnail2).not.toHaveClass('ring-4', 'ring-neo-blue');
    });

    it('updates active thumbnail after clicking', async () => {
      render(<ImageGallery images={mockMultipleImages} />);

      // Click second thumbnail
      const thumbnail2 = screen.getByAltText('Thumbnail 2: Test Product Image 2');
      fireEvent.click(thumbnail2);

      // Second thumbnail should become active
      await waitFor(() => {
        const thumbnail2Button = screen
          .getByAltText('Thumbnail 2: Test Product Image 2')
          .closest('button');
        expect(thumbnail2Button).toHaveClass('ring-4', 'ring-neo-blue');
      });

      // First thumbnail should no longer be active
      const thumbnail1Button = screen
        .getByAltText('Thumbnail 1: Test Product Image 1')
        .closest('button');
      expect(thumbnail1Button).not.toHaveClass('ring-4', 'ring-neo-blue');
    });
  });

  describe('Zoom Functionality', () => {
    it('toggles zoom when main image is clicked', async () => {
      render(<ImageGallery images={mockMultipleImages} />);

      const mainImageContainer = screen.getByTestId('main-image-container');

      // Initially not zoomed
      expect(mainImageContainer).not.toHaveClass('cursor-zoom-out');

      // Click to zoom in
      fireEvent.click(mainImageContainer);

      await waitFor(() => {
        expect(mainImageContainer).toHaveClass('cursor-zoom-out');
      });

      // Click again to zoom out
      fireEvent.click(mainImageContainer);

      await waitFor(() => {
        expect(mainImageContainer).not.toHaveClass('cursor-zoom-out');
      });
    });

    it('shows zoom indicator when not zoomed', () => {
      render(<ImageGallery images={mockMultipleImages} />);

      const zoomIndicator = screen.getByLabelText('Click to zoom');
      expect(zoomIndicator).toBeInTheDocument();
    });

    it('hides zoom indicator when zoomed', async () => {
      render(<ImageGallery images={mockMultipleImages} />);

      const mainImageContainer = screen.getByTestId('main-image-container');

      // Zoom in
      fireEvent.click(mainImageContainer);

      await waitFor(() => {
        const zoomIndicator = screen.queryByLabelText('Click to zoom');
        expect(zoomIndicator).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('renders with proper Neo-Brutalism styling', () => {
      render(<ImageGallery images={mockMultipleImages} />);

      const mainImageContainer = screen.getByTestId('main-image-container');

      // Check for Neo-Brutalism classes
      expect(mainImageContainer).toHaveClass('border-3', 'border-neo-black', 'shadow-neo');
    });

    it('thumbnails are scrollable horizontally on mobile', () => {
      render(<ImageGallery images={mockMultipleImages} />);

      const thumbnailContainer = screen.getByRole('list', { name: /thumbnails/i });

      // Check for horizontal scroll classes
      expect(thumbnailContainer).toHaveClass('overflow-x-auto');
    });
  });

  describe('Empty State', () => {
    it('renders placeholder when no images provided', () => {
      render(<ImageGallery images={[]} />);

      const placeholder = screen.getByText(/no images available/i);
      expect(placeholder).toBeInTheDocument();
    });
  });
});
