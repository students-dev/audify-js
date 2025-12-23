import { Filters, FILTER_TYPES } from '../src/index';

describe('Filters', () => {
  let filters: Filters;
  let mockAudioContext: any;

  beforeEach(() => {
    mockAudioContext = {
      createBiquadFilter: jest.fn(() => ({
        type: '',
        frequency: { value: 0 },
        gain: { value: 0 },
        connect: jest.fn(),
        disconnect: jest.fn()
      })),
      createPanner: jest.fn(() => ({
        panningModel: '',
        connect: jest.fn()
      })),
      createConvolver: jest.fn(() => ({
        connect: jest.fn()
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
