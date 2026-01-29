/**
 * @TASK P3-T3.1 - 에어비앤비 메타데이터 추출 테스트
 * @TEST src/lib/airbnb/metadata.ts
 */

import { describe, it, expect } from 'vitest';
import { parseOgTags, isValidMetadata } from '@/lib/airbnb/metadata';

describe('parseOgTags', () => {
  it('should parse og:title', () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="og:title" content="Beautiful Apartment in Seoul">
      </head>
      <body></body>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.title).toBe('Beautiful Apartment in Seoul');
  });

  it('should parse og:description', () => {
    const html = `
      <html>
      <head>
        <meta property="og:description" content="A cozy place to stay">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.description).toBe('A cozy place to stay');
  });

  it('should parse og:image', () => {
    const html = `
      <html>
      <head>
        <meta property="og:image" content="https://example.com/image.jpg">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
  });

  it('should parse og:url', () => {
    const html = `
      <html>
      <head>
        <meta property="og:url" content="https://www.airbnb.co.kr/rooms/12345678">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.url).toBe('https://www.airbnb.co.kr/rooms/12345678');
  });

  it('should parse og:site_name', () => {
    const html = `
      <html>
      <head>
        <meta property="og:site_name" content="Airbnb">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.siteName).toBe('Airbnb');
  });

  it('should parse multiple og tags', () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="og:title" content="Seoul Apartment">
        <meta property="og:description" content="Best location">
        <meta property="og:image" content="https://img.com/1.jpg">
        <meta property="og:url" content="https://airbnb.co.kr/rooms/123">
        <meta property="og:site_name" content="Airbnb">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result).toEqual({
      title: 'Seoul Apartment',
      description: 'Best location',
      imageUrl: 'https://img.com/1.jpg',
      url: 'https://airbnb.co.kr/rooms/123',
      siteName: 'Airbnb',
    });
  });

  it('should handle reversed attribute order (content before property)', () => {
    const html = `
      <html>
      <head>
        <meta content="Reversed Order Title" property="og:title">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.title).toBe('Reversed Order Title');
  });

  it('should fallback to <title> tag if og:title not found', () => {
    const html = `
      <html>
      <head>
        <title>Page Title</title>
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.title).toBe('Page Title');
  });

  it('should fallback to description meta tag if og:description not found', () => {
    const html = `
      <html>
      <head>
        <meta name="description" content="Meta description">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.description).toBe('Meta description');
  });

  it('should decode HTML entities', () => {
    const html = `
      <html>
      <head>
        <meta property="og:title" content="Tom &amp; Jerry&#39;s Place">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.title).toBe("Tom & Jerry's Place");
  });

  it('should decode numeric HTML entities', () => {
    const html = `
      <html>
      <head>
        <meta property="og:title" content="Price: &#36;100">
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.title).toBe('Price: $100');
  });

  it('should return null for missing og tags', () => {
    const html = `
      <html>
      <head></head>
      <body></body>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result).toEqual({
      title: null,
      description: null,
      imageUrl: null,
      url: null,
      siteName: null,
    });
  });

  it('should handle empty HTML', () => {
    const result = parseOgTags('');
    expect(result).toEqual({
      title: null,
      description: null,
      imageUrl: null,
      url: null,
      siteName: null,
    });
  });

  it('should handle single quotes in meta tags', () => {
    const html = `
      <html>
      <head>
        <meta property='og:title' content='Single Quote Title'>
      </head>
      </html>
    `;
    const result = parseOgTags(html);
    expect(result.title).toBe('Single Quote Title');
  });
});

describe('isValidMetadata', () => {
  it('should return true for metadata with title', () => {
    expect(
      isValidMetadata({
        title: 'Some Title',
        description: null,
        imageUrl: null,
        url: null,
        siteName: null,
      })
    ).toBe(true);
  });

  it('should return false for null metadata', () => {
    expect(isValidMetadata(null)).toBe(false);
  });

  it('should return false for metadata with null title', () => {
    expect(
      isValidMetadata({
        title: null,
        description: 'Some description',
        imageUrl: 'https://example.com/img.jpg',
        url: null,
        siteName: null,
      })
    ).toBe(false);
  });

  it('should return false for metadata with empty title', () => {
    expect(
      isValidMetadata({
        title: '',
        description: null,
        imageUrl: null,
        url: null,
        siteName: null,
      })
    ).toBe(false);
  });

  it('should return false for metadata with whitespace-only title', () => {
    expect(
      isValidMetadata({
        title: '   ',
        description: null,
        imageUrl: null,
        url: null,
        siteName: null,
      })
    ).toBe(false);
  });
});
