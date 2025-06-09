import { formatDate } from '@/scripts/utils/date-utils.js';

describe('date utils', () => {
  test('formatDate returns formatted string', () => {
    const date = new Date('2023-01-02T00:00:00Z');
    expect(formatDate(date)).toBe('Jan 2, 2023');
  });
});
