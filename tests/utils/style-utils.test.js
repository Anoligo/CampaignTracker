import { getRarityBadgeClass, getRarityColor, formatEnumValue, formatCurrency } from '@/scripts/utils/style-utils.js';

describe('style utils', () => {
  test('getRarityBadgeClass normalizes rarity', () => {
    expect(getRarityBadgeClass('Very Rare')).toBe('rarity-very-rare');
  });

  test('getRarityColor falls back on unknown rarity', () => {
    expect(getRarityColor('unknown')).toBe('#aaaaaa');
  });

  test('formatEnumValue converts snake case', () => {
    expect(formatEnumValue('VERY_RARE')).toBe('Very Rare');
  });

  test('formatCurrency converts to proper unit', () => {
    expect(formatCurrency(2)).toBe('2 gp');
    expect(formatCurrency(0.5)).toBe('5 sp');
    expect(formatCurrency(0.02)).toBe('2 cp');
  });
});
