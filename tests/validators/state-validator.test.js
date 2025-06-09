import { StateValidator, INITIAL_STATE } from '@/scripts/modules/data/index.js';

describe('StateValidator', () => {
  test('validates initial state with no errors', () => {
    const errors = StateValidator.validateState(INITIAL_STATE);
    expect(errors).toEqual([]);
  });

  test('detects missing required fields', () => {
    const invalidState = { quests: [{ id: '1' }] };
    const errors = StateValidator.validateState(invalidState);
    expect(errors.length).toBeGreaterThan(0);
  });
});
