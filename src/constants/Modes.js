/**
 * Loop modes for playback
 */
export const LOOP_MODES = {
  OFF: 'off',
  TRACK: 'track',
  QUEUE: 'queue'
};

/**
 * Repeat modes (alias for loop modes)
 */
export const REPEAT_MODES = LOOP_MODES;

/**
 * Filter types
 */
export const FILTER_TYPES = {
  BASSBOOST: 'bassboost',
  TREBLEBOOST: 'trebleboost',
  NIGHTCORE: 'nightcore',
  VAPORWAVE: 'vaporwave',
  ROTATE_8D: '8d',
  PITCH: 'pitch',
  SPEED: 'speed',
  REVERB: 'reverb'
};

/**
 * Event types
 */
export const EVENTS = {
  READY: 'ready',
  PLAY: 'play',
  PAUSE: 'pause',
  STOP: 'stop',
  ERROR: 'error',
  QUEUE_EMPTY: 'queueEmpty',
  TRACK_START: 'trackStart',
  TRACK_END: 'trackEnd',
  FILTER_APPLIED: 'filterApplied',
  TRACK_ADD: 'trackAdd',
  TRACK_REMOVE: 'trackRemove',
  SHUFFLE: 'shuffle',
  CLEAR: 'clear'
};