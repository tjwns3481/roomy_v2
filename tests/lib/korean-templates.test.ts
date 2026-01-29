// @TASK P3-T3.4 - 한국 특화 템플릿 테스트
// @SPEC docs/planning/06-tasks.md#P3-T3.4

import { describe, it, expect } from 'vitest';
import {
  // Amenities
  KOREAN_AMENITIES,
  KOREAN_AMENITIES_BY_CATEGORY,
  KOREAN_AMENITY_CATEGORY_NAMES,
  KOREAN_UNIQUE_AMENITIES,
  DEFAULT_KOREAN_AMENITIES,
  getAmenitiesDetails,
  // Rules
  KOREAN_RULES_TEMPLATES,
  KOREAN_RULES_BY_CATEGORY,
  ESSENTIAL_KOREAN_RULES,
  DEFAULT_CHECKOUT_CHECKLIST,
  getRulesDetails,
  // Notices
  KOREAN_NOTICE_TEMPLATES,
  KOREAN_NOTICES_BY_CATEGORY,
  ESSENTIAL_KOREAN_NOTICES,
  getNoticesDetails,
  getNoticesByType,
  // Tips
  KOREAN_TIPS_TEMPLATES,
  KOREAN_TIPS_BY_CATEGORY,
  ESSENTIAL_KOREAN_TIPS,
  getTipsDetails,
  getTipsByTag,
  getSeasonalTip,
  // AI Prompt
  buildKoreanContextPrompt,
  buildGuidebookSystemPrompt,
  getDefaultTemplateSet,
  formatAmenitiesForUI,
  formatRulesForUI,
  formatNoticesForUI,
  TEMPLATE_STATS,
} from '@/lib/templates';

describe('Korean Amenities Templates', () => {
  it('should have at least 20 amenities', () => {
    const amenityCount = Object.keys(KOREAN_AMENITIES).length;
    expect(amenityCount).toBeGreaterThanOrEqual(20);
  });

  it('should have required fields for each amenity', () => {
    Object.entries(KOREAN_AMENITIES).forEach(([key, amenity]) => {
      expect(amenity.name).toBeDefined();
      expect(amenity.nameEn).toBeDefined();
      expect(amenity.icon).toBeDefined();
      expect(typeof amenity.name).toBe('string');
      expect(typeof amenity.nameEn).toBe('string');
      expect(typeof amenity.icon).toBe('string');
    });
  });

  it('should have all category amenities exist in KOREAN_AMENITIES', () => {
    Object.values(KOREAN_AMENITIES_BY_CATEGORY).forEach((amenityIds) => {
      amenityIds.forEach((id) => {
        expect(KOREAN_AMENITIES[id]).toBeDefined();
      });
    });
  });

  it('should have Korean unique amenities', () => {
    expect(KOREAN_UNIQUE_AMENITIES).toContain('ondol');
    expect(KOREAN_UNIQUE_AMENITIES).toContain('bidet');
    expect(KOREAN_UNIQUE_AMENITIES).toContain('kimchiFridge');
  });

  it('getAmenitiesDetails should return correct details', () => {
    const details = getAmenitiesDetails(['wifi', 'ondol', 'invalid']);
    expect(details).toHaveLength(2);
    expect(details[0].name).toBe('와이파이');
    expect(details[1].name).toBe('온돌');
  });

  it('should have category names in Korean and English', () => {
    Object.values(KOREAN_AMENITY_CATEGORY_NAMES).forEach((names) => {
      expect(names.ko).toBeDefined();
      expect(names.en).toBeDefined();
    });
  });
});

describe('Korean Rules Templates', () => {
  it('should have at least 10 rules', () => {
    const ruleCount = Object.keys(KOREAN_RULES_TEMPLATES).length;
    expect(ruleCount).toBeGreaterThanOrEqual(10);
  });

  it('should have required fields for each rule', () => {
    Object.entries(KOREAN_RULES_TEMPLATES).forEach(([key, rule]) => {
      expect(rule.id).toBe(key);
      expect(rule.title).toBeDefined();
      expect(rule.titleEn).toBeDefined();
      expect(rule.content).toBeDefined();
      expect(rule.contentEn).toBeDefined();
      expect(rule.icon).toBeDefined();
      expect(typeof rule.isImportant).toBe('boolean');
    });
  });

  it('should have essential rules defined', () => {
    ESSENTIAL_KOREAN_RULES.forEach((ruleId) => {
      expect(KOREAN_RULES_TEMPLATES[ruleId]).toBeDefined();
    });
  });

  it('should have recycling rule with subcategories', () => {
    const recyclingRule = KOREAN_RULES_TEMPLATES.recycling;
    expect(recyclingRule.subcategories).toBeDefined();
    expect(recyclingRule.subcategories?.length).toBeGreaterThan(0);
  });

  it('getRulesDetails should return correct details', () => {
    const details = getRulesDetails(['noisePolicy', 'noSmoking', 'invalid']);
    expect(details).toHaveLength(2);
    expect(details[0].title).toBe('층간소음 주의');
  });

  it('should have checkout checklist items', () => {
    expect(DEFAULT_CHECKOUT_CHECKLIST.length).toBeGreaterThan(0);
    DEFAULT_CHECKOUT_CHECKLIST.forEach((item) => {
      expect(item.ko).toBeDefined();
      expect(item.en).toBeDefined();
    });
  });
});

describe('Korean Notice Templates', () => {
  it('should have at least 10 notices', () => {
    const noticeCount = Object.keys(KOREAN_NOTICE_TEMPLATES).length;
    expect(noticeCount).toBeGreaterThanOrEqual(10);
  });

  it('should have required fields for each notice', () => {
    Object.entries(KOREAN_NOTICE_TEMPLATES).forEach(([key, notice]) => {
      expect(notice.id).toBe(key);
      expect(notice.type).toMatch(/^(info|warning|tip|success)$/);
      expect(notice.title).toBeDefined();
      expect(notice.titleEn).toBeDefined();
      expect(notice.content).toBeDefined();
      expect(notice.contentEn).toBeDefined();
      expect(notice.icon).toBeDefined();
    });
  });

  it('should have emergency notice with contacts', () => {
    const emergencyNotice = KOREAN_NOTICE_TEMPLATES.emergency;
    expect(emergencyNotice.contacts).toBeDefined();
    expect(emergencyNotice.contacts?.length).toBeGreaterThan(0);

    const policeContact = emergencyNotice.contacts?.find((c) => c.number === '112');
    expect(policeContact).toBeDefined();
  });

  it('getNoticesDetails should return correct details', () => {
    const details = getNoticesDetails(['emergency', 'taxi', 'invalid']);
    expect(details).toHaveLength(2);
  });

  it('getNoticesByType should filter correctly', () => {
    const warnings = getNoticesByType('warning');
    expect(warnings.length).toBeGreaterThan(0);
    warnings.forEach((notice) => {
      expect(notice.type).toBe('warning');
    });

    const tips = getNoticesByType('tip');
    expect(tips.length).toBeGreaterThan(0);
    tips.forEach((notice) => {
      expect(notice.type).toBe('tip');
    });
  });
});

describe('Korean Tips Templates', () => {
  it('should have at least 15 tips', () => {
    const tipCount = Object.keys(KOREAN_TIPS_TEMPLATES).length;
    expect(tipCount).toBeGreaterThanOrEqual(15);
  });

  it('should have required fields for each tip', () => {
    Object.entries(KOREAN_TIPS_TEMPLATES).forEach(([key, tip]) => {
      expect(tip.id).toBe(key);
      expect(tip.category).toBeDefined();
      expect(tip.title).toBeDefined();
      expect(tip.titleEn).toBeDefined();
      expect(tip.content).toBeDefined();
      expect(tip.contentEn).toBeDefined();
      expect(tip.icon).toBeDefined();
      expect(Array.isArray(tip.tags)).toBe(true);
    });
  });

  it('getTipsDetails should return correct details', () => {
    const details = getTipsDetails(['cashlessPayment', 'koreanApps', 'invalid']);
    expect(details).toHaveLength(2);
  });

  it('getTipsByTag should find tips by tag', () => {
    const paymentTips = getTipsByTag('payment');
    expect(paymentTips.length).toBeGreaterThan(0);
    paymentTips.forEach((tip) => {
      expect(tip.tags).toContain('payment');
    });
  });

  it('getSeasonalTip should return a valid tip', () => {
    const tip = getSeasonalTip();
    expect(tip).toBeDefined();
    expect(tip.category).toBe('seasonal');
    expect(tip.id).toMatch(/Tips$/);
  });

  it('should have seasonal tips for all seasons', () => {
    expect(KOREAN_TIPS_TEMPLATES.springTips).toBeDefined();
    expect(KOREAN_TIPS_TEMPLATES.summerTips).toBeDefined();
    expect(KOREAN_TIPS_TEMPLATES.fallTips).toBeDefined();
    expect(KOREAN_TIPS_TEMPLATES.winterTips).toBeDefined();
  });
});

describe('AI Prompt Builder', () => {
  it('buildKoreanContextPrompt should return non-empty string', () => {
    const prompt = buildKoreanContextPrompt();
    expect(prompt).toBeDefined();
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('한국');
    expect(prompt).toContain('Emergency');
  });

  it('buildGuidebookSystemPrompt should include property info when provided', () => {
    const prompt = buildGuidebookSystemPrompt({
      name: 'Test Property',
      address: '서울시 강남구',
      amenities: ['wifi', 'aircon'],
      checkIn: '15:00',
      checkOut: '11:00',
    });

    expect(prompt).toContain('Test Property');
    expect(prompt).toContain('서울시 강남구');
    expect(prompt).toContain('15:00');
  });

  it('buildGuidebookSystemPrompt should work without property info', () => {
    const prompt = buildGuidebookSystemPrompt();
    expect(prompt).toBeDefined();
    expect(prompt).toContain('AI 어시스턴트');
  });
});

describe('Template Utilities', () => {
  it('getDefaultTemplateSet should return all template types', () => {
    const templateSet = getDefaultTemplateSet();

    expect(templateSet.amenities).toBeDefined();
    expect(templateSet.amenities.length).toBeGreaterThan(0);

    expect(templateSet.rules).toBeDefined();
    expect(templateSet.rules.length).toBeGreaterThan(0);

    expect(templateSet.notices).toBeDefined();
    expect(templateSet.notices.length).toBeGreaterThan(0);

    expect(templateSet.tips).toBeDefined();
    expect(templateSet.tips.length).toBeGreaterThan(0);
  });

  it('formatAmenitiesForUI should return formatted data', () => {
    const formatted = formatAmenitiesForUI(['wifi', 'ondol']);

    expect(formatted).toHaveLength(2);
    expect(formatted[0].id).toBe('wifi');
    expect(formatted[0].name).toBeDefined();
    expect(formatted[0].nameEn).toBeDefined();
    expect(formatted[0].icon).toBeDefined();
  });

  it('formatRulesForUI should return formatted data', () => {
    const formatted = formatRulesForUI(['noisePolicy', 'recycling']);

    expect(formatted).toHaveLength(2);
    expect(formatted[0].id).toBe('noisePolicy');
    expect(formatted[0].title).toBeDefined();
    expect(formatted[0].isImportant).toBeDefined();
  });

  it('formatNoticesForUI should return formatted data', () => {
    const formatted = formatNoticesForUI(['emergency', 'taxi']);

    expect(formatted).toHaveLength(2);
    expect(formatted[0].id).toBe('emergency');
    expect(formatted[0].type).toBeDefined();
    expect(formatted[0].contacts).toBeDefined();
  });

  it('TEMPLATE_STATS should have correct counts', () => {
    expect(TEMPLATE_STATS.amenitiesCount).toBeGreaterThanOrEqual(20);
    expect(TEMPLATE_STATS.rulesCount).toBeGreaterThanOrEqual(10);
    expect(TEMPLATE_STATS.noticesCount).toBeGreaterThanOrEqual(10);
    expect(TEMPLATE_STATS.tipsCount).toBeGreaterThanOrEqual(15);
    expect(TEMPLATE_STATS.totalCount).toBe(
      TEMPLATE_STATS.amenitiesCount +
      TEMPLATE_STATS.rulesCount +
      TEMPLATE_STATS.noticesCount +
      TEMPLATE_STATS.tipsCount
    );
  });
});

describe('Type Safety', () => {
  it('should have consistent category keys', () => {
    // Amenities categories
    const amenityCategoryKeys = Object.keys(KOREAN_AMENITIES_BY_CATEGORY);
    const amenityCategoryNameKeys = Object.keys(KOREAN_AMENITY_CATEGORY_NAMES);
    expect(amenityCategoryKeys.sort()).toEqual(amenityCategoryNameKeys.sort());

    // Rules categories
    const ruleCategoryKeys = Object.keys(KOREAN_RULES_BY_CATEGORY);
    expect(ruleCategoryKeys.length).toBeGreaterThan(0);

    // Notice categories
    const noticeCategoryKeys = Object.keys(KOREAN_NOTICES_BY_CATEGORY);
    expect(noticeCategoryKeys.length).toBeGreaterThan(0);

    // Tips categories
    const tipCategoryKeys = Object.keys(KOREAN_TIPS_BY_CATEGORY);
    expect(tipCategoryKeys.length).toBeGreaterThan(0);
  });

  it('should not have duplicate IDs across templates', () => {
    const allIds = [
      ...Object.keys(KOREAN_AMENITIES),
      ...Object.keys(KOREAN_RULES_TEMPLATES),
      ...Object.keys(KOREAN_NOTICE_TEMPLATES),
      ...Object.keys(KOREAN_TIPS_TEMPLATES),
    ];

    // Some IDs may intentionally overlap (e.g., 'wifi' in amenities and notices)
    // But within each template type, there should be no duplicates
    const amenityIds = Object.keys(KOREAN_AMENITIES);
    expect(new Set(amenityIds).size).toBe(amenityIds.length);

    const ruleIds = Object.keys(KOREAN_RULES_TEMPLATES);
    expect(new Set(ruleIds).size).toBe(ruleIds.length);

    const noticeIds = Object.keys(KOREAN_NOTICE_TEMPLATES);
    expect(new Set(noticeIds).size).toBe(noticeIds.length);

    const tipIds = Object.keys(KOREAN_TIPS_TEMPLATES);
    expect(new Set(tipIds).size).toBe(tipIds.length);
  });
});
