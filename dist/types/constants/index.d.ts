export declare const EVENTS: {
    readonly READY: "ready";
    readonly ERROR: "error";
    readonly PLAY: "play";
    readonly PAUSE: "pause";
    readonly STOP: "stop";
    readonly TRACK_START: "trackStart";
    readonly TRACK_END: "trackEnd";
    readonly TRACK_ADD: "trackAdd";
    readonly TRACK_REMOVE: "trackRemove";
    readonly QUEUE_UPDATE: "queueUpdate";
    readonly FILTER_APPLIED: "filterApplied";
    readonly VOLUME_CHANGE: "volumeChange";
    readonly SEEK: "seek";
};
export type EventType = typeof EVENTS[keyof typeof EVENTS];
export declare const LOOP_MODES: {
    readonly OFF: "off";
    readonly TRACK: "track";
    readonly QUEUE: "queue";
};
export type LoopMode = typeof LOOP_MODES[keyof typeof LOOP_MODES];
export declare const PLAYER_STATES: {
    readonly IDLE: "idle";
    readonly PLAYING: "playing";
    readonly PAUSED: "paused";
    readonly BUFFERING: "buffering";
};
export type PlayerState = typeof PLAYER_STATES[keyof typeof PLAYER_STATES];
export declare const FILTER_TYPES: {
    readonly BASSBOOST: "bassboost";
    readonly NIGHTCORE: "nightcore";
    readonly VAPORWAVE: "vaporwave";
    readonly ROTATE_8D: "8d";
    readonly PITCH: "pitch";
    readonly SPEED: "speed";
    readonly REVERB: "reverb";
};
export type FilterType = typeof FILTER_TYPES[keyof typeof FILTER_TYPES];
