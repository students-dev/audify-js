export const EVENTS = {
  READY: 'ready',
  ERROR: 'error',
  PLAY: 'play',
  PAUSE: 'pause',
  STOP: 'stop',
  TRACK_START: 'trackStart',
  TRACK_END: 'trackEnd',
  TRACK_ADD: 'trackAdd',
  TRACK_REMOVE: 'trackRemove',
  QUEUE_UPDATE: 'queueUpdate',
  FILTER_APPLIED: 'filterApplied',
  VOLUME_CHANGE: 'volumeChange',
  SEEK: 'seek'
} as const;

export type EventType = typeof EVENTS[keyof typeof EVENTS];

export const LOOP_MODES = {
  OFF: 'off',
  TRACK: 'track',
  QUEUE: 'queue'
} as const;

export type LoopMode = typeof LOOP_MODES[keyof typeof LOOP_MODES];

export const PLAYER_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering'
} as const;

export type PlayerState = typeof PLAYER_STATES[keyof typeof PLAYER_STATES];

export const FILTER_TYPES = {
  BASSBOOST: 'bassboost',
  NIGHTCORE: 'nightcore',
  VAPORWAVE: 'vaporwave',
  ROTATE_8D: '8d',
  PITCH: 'pitch',
  SPEED: 'speed',
  REVERB: 'reverb'
} as const;

export type FilterType = typeof FILTER_TYPES[keyof typeof FILTER_TYPES];
