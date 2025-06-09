import { formatEnumValue, getStatusBadgeClass, getQuestTypeBadgeClass } from '@/scripts/modules/quests/ui/quest-utils.js';

describe('quest ui utils', () => {
  test('formatEnumValue converts value', () => {
    expect(formatEnumValue('NOT_STARTED')).toBe('Not Started');
  });

  test('getStatusBadgeClass returns class', () => {
    expect(getStatusBadgeClass('COMPLETED')).toBe('bg-success');
  });

  test('getQuestTypeBadgeClass defaults for unknown', () => {
    expect(getQuestTypeBadgeClass('UNKNOWN')).toBe('bg-secondary');
  });
});
