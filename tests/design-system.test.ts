// @TASK P8-S1-T1 - 디자인 시스템 테스트 (AirBnB 스타일)
import { describe, it, expect } from 'vitest';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config';

const config = resolveConfig(tailwindConfig as any);

describe('P8-S1-T1: AirBnB Design System', () => {
  describe('Primary Colors', () => {
    it('should have AirBnB Rausch as primary color', () => {
      const primary = config.theme?.colors?.primary;
      expect(primary).toBeDefined();

      if (typeof primary === 'object' && primary !== null) {
        expect(primary.DEFAULT).toBe('#FF385C');
      } else {
        expect(primary).toBe('#FF385C');
      }
    });

    it('should have primary light variant', () => {
      const primary = config.theme?.colors?.primary;
      if (typeof primary === 'object' && primary !== null) {
        expect(primary.light).toBe('#FFE4E8');
      }
    });

    it('should have primary dark variant', () => {
      const primary = config.theme?.colors?.primary;
      if (typeof primary === 'object' && primary !== null) {
        expect(primary.dark).toBe('#E31C5F');
      }
    });
  });

  describe('Secondary Colors', () => {
    it('should have teal as secondary color', () => {
      const secondary = config.theme?.colors?.secondary;
      expect(secondary).toBeDefined();

      if (typeof secondary === 'object' && secondary !== null) {
        expect(secondary.DEFAULT).toBe('#00A699');
      } else {
        expect(secondary).toBe('#00A699');
      }
    });

    it('should have accent orange color', () => {
      const accent = config.theme?.colors?.accent;
      expect(accent).toBeDefined();

      if (typeof accent === 'object' && accent !== null) {
        expect(accent.DEFAULT).toBe('#FC642D');
      }
    });
  });

  describe('Neutral Colors', () => {
    it('should have text-primary color', () => {
      const textPrimary = (config.theme?.colors as any)?.['text-primary'];
      expect(textPrimary).toBe('#222222');
    });

    it('should have text-secondary color', () => {
      const textSecondary = (config.theme?.colors as any)?.['text-secondary'];
      expect(textSecondary).toBe('#717171');
    });

    it('should have text-tertiary color', () => {
      const textTertiary = (config.theme?.colors as any)?.['text-tertiary'];
      expect(textTertiary).toBe('#B0B0B0');
    });

    it('should have surface background', () => {
      const surface = config.theme?.colors?.surface;
      expect(surface).toBe('#F7F7F7');
    });

    it('should have border color', () => {
      const border = config.theme?.colors?.border;
      expect(border).toBe('#DDDDDD');
    });
  });

  describe('Semantic Colors', () => {
    it('should have success color (teal)', () => {
      const success = config.theme?.colors?.success;
      expect(success).toBe('#00A699');
    });

    it('should have warning color', () => {
      const warning = config.theme?.colors?.warning;
      expect(warning).toBe('#FFB400');
    });

    it('should have error color', () => {
      const error = config.theme?.colors?.error;
      expect(error).toBe('#C13515');
    });

    it('should have info color', () => {
      const info = config.theme?.colors?.info;
      expect(info).toBe('#008489');
    });
  });

  describe('AirBnB Shadows', () => {
    it('should have airbnb-sm shadow', () => {
      const shadows = config.theme?.boxShadow;
      expect(shadows).toBeDefined();
      expect((shadows as any)['airbnb-sm']).toBe('0 1px 2px rgba(0,0,0,0.08)');
    });

    it('should have airbnb-md shadow', () => {
      const shadows = config.theme?.boxShadow;
      expect((shadows as any)['airbnb-md']).toBe('0 2px 8px rgba(0,0,0,0.12)');
    });

    it('should have airbnb-lg shadow', () => {
      const shadows = config.theme?.boxShadow;
      expect((shadows as any)['airbnb-lg']).toBe('0 4px 16px rgba(0,0,0,0.12)');
    });

    it('should have airbnb-xl shadow', () => {
      const shadows = config.theme?.boxShadow;
      expect((shadows as any)['airbnb-xl']).toBe('0 8px 28px rgba(0,0,0,0.15)');
    });

    it('should have airbnb-2xl shadow', () => {
      const shadows = config.theme?.boxShadow;
      expect((shadows as any)['airbnb-2xl']).toBe('0 16px 40px rgba(0,0,0,0.18)');
    });
  });

  describe('Border Radius (Soft Curves)', () => {
    it('should have rounded-lg as 8px', () => {
      const borderRadius = config.theme?.borderRadius;
      expect(borderRadius).toBeDefined();
      expect((borderRadius as any).lg).toBe('8px');
    });

    it('should have rounded-xl as 12px', () => {
      const borderRadius = config.theme?.borderRadius;
      expect((borderRadius as any).xl).toBe('12px');
    });

    it('should have rounded-2xl as 16px', () => {
      const borderRadius = config.theme?.borderRadius;
      expect((borderRadius as any)['2xl']).toBe('16px');
    });

    it('should have rounded-3xl as 24px', () => {
      const borderRadius = config.theme?.borderRadius;
      expect((borderRadius as any)['3xl']).toBe('24px');
    });
  });

  describe('Typography', () => {
    it('should have Pretendard as primary font', () => {
      const fontFamily = config.theme?.fontFamily;
      expect(fontFamily).toBeDefined();
      const sans = (fontFamily as any)?.sans;
      expect(sans).toBeDefined();
      expect(sans[0]).toContain('Pretendard');
    });

    it('should have proper font sizes', () => {
      const fontSize = config.theme?.fontSize;
      expect(fontSize).toBeDefined();

      // Display: 48px (3rem)
      const display = (fontSize as any)?.display;
      expect(display).toBeDefined();
      expect(display[0]).toBe('3rem');

      // H1: 32px (2rem)
      const h1 = (fontSize as any)?.h1;
      expect(h1).toBeDefined();
      expect(h1[0]).toBe('2rem');

      // H2: 24px (1.5rem)
      const h2 = (fontSize as any)?.h2;
      expect(h2).toBeDefined();
      expect(h2[0]).toBe('1.5rem');
    });
  });

  describe('Spacing System', () => {
    it('should have proper spacing values', () => {
      const spacing = config.theme?.spacing;
      expect(spacing).toBeDefined();

      // 8px base
      expect((spacing as any)['2']).toBe('0.5rem'); // 8px
      expect((spacing as any)['4']).toBe('1rem'); // 16px
      expect((spacing as any)['6']).toBe('1.5rem'); // 24px
      expect((spacing as any)['8']).toBe('2rem'); // 32px
    });
  });
});
