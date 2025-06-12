import { StateValidator } from '@/scripts/modules/data/validators/state-validator.js';
import { INITIAL_STATE } from '@/scripts/modules/data/schemas/state-schema.js';

describe('StateValidator', () => {
  test('validates initial state with no errors', () => {
    const errors = StateValidator.validateState(INITIAL_STATE);
    expect(errors).toEqual([]);
  });

  test('detects missing required fields', () => {
    const invalidState = { 
      ...INITIAL_STATE,
      players: [{ id: '1' }] // Missing required fields like name, playerClass, level
    };
    const errors = StateValidator.validateState(invalidState);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('name is required'))).toBe(true);
    expect(errors.some(e => e.includes('playerClass is required'))).toBe(true);
    expect(errors.some(e => e.includes('level is required'))).toBe(true);
  });

  test('validates array items', () => {
    const invalidState = {
      ...INITIAL_STATE,
      quests: [
        { 
          id: '1',
          title: 'Test Quest',
          description: 'Test',
          type: 'main',
          status: 'active',
          relatedItems: ['invalid-item']
        }
      ]
    };
    
    const errors = StateValidator.validateState(invalidState);
    expect(errors.length).toBe(0); // Should pass validation
  });

  test('validates nested objects', () => {
    const invalidState = {
      ...INITIAL_STATE,
      guildLogs: {
        activities: [
          {
            id: '1',
            type: 'quest_completed',
            timestamp: new Date().toISOString(),
            description: 'Test activity'
          }
        ],
        resources: []
      }
    };
    
    const errors = StateValidator.validateState(invalidState);
    expect(errors).toEqual([]); // Should pass validation
  });

  test('validates date formats', () => {
    const invalidState = {
      ...INITIAL_STATE,
      quests: [
        { 
          id: '1',
          title: 'Test Quest',
          description: 'Test',
          type: 'main',
          status: 'active',
          createdAt: 'invalid-date',
          updatedAt: 'invalid-date'
        }
      ]
    };
    
    const errors = StateValidator.validateState(invalidState);
    expect(errors.some(e => e.includes('must be a valid ISO date-time string'))).toBe(true);
  });
});
