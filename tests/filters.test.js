import { Filters, FILTER_TYPES } from '../src/index.js';

describe('Filters', () => {
  let filters;
  let mockAudioContext;

  beforeEach(() => {
    mockAudioContext = {
      createBiquadFilter: jest.fn(() => ({
        type: '',
        frequency: { value: 0 },
        gain: { value: 0 }
      }))
    };
    filters = new Filters(mockAudioContext);
  });

  test('should apply bassboost filter', () => {
    filters.apply(FILTER_TYPES.BASSBOOST);
    expect(filters.isEnabled(FILTER_TYPES.BASSBOOST)).toBe(true);
  });

  test('should remove filter', () => {
    filters.apply(FILTER_TYPES.BASSBOOST);
    filters.remove(FILTER_TYPES.BASSBOOST);
    expect(filters.isEnabled(FILTER_TYPES.BASSBOOST)).toBe(false);
  });

  test('should clear all filters', () => {
    filters.apply(FILTER_TYPES.BASSBOOST);
    filters.clear();
    expect(filters.getEnabled().size).toBe(0);
  });
});