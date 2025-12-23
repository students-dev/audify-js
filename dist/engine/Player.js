import { LOOP_MODES, EVENTS } from '../constants';
import { EventBus } from '../events/EventBus';
import { MockAudioContext } from './MockAudioContext';
/**
 * Audio player with playback controls
 */
export class Player {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        let AudioContextClass;
        if (typeof window !== 'undefined') {
            AudioContextClass = window.AudioContext || window.webkitAudioContext;
        }
        else {
            AudioContextClass = global.AudioContext;
        }
        if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
        }
        else {
            this.audioContext = new MockAudioContext();
        }
        this.source = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 1;
        this.loopMode = LOOP_MODES.OFF;
        this.eventBus = new EventBus();
    }
    /**
     * Play audio track
     * @param track - Track to play
     */
    async play(track) {
        if (!track)
            return;
        // Reset state
        this.stop();
        try {
            this.eventBus.emit(EVENTS.PLAY, track);
            // Check providers via registry
            const provider = this.audioEngine.getProvider(track.source || 'local');
            if (provider) {
                await provider.play(track);
            }
            else {
                // Fallback to direct URL playback if no specific provider found
                await this.playStream(track);
            }
            this.eventBus.emit(EVENTS.TRACK_START, track);
        }
        catch (error) {
            console.error(error);
            this.eventBus.emit(EVENTS.ERROR, error);
        }
    }
    /**
     * Play audio from URL/Stream directly
     * This is called by Providers or as fallback
     * @param track - Track object with URL
     */
    async playStream(track) {
        if (!this.audioContext)
            throw new Error('AudioContext not available');
        // If already playing, stop
        if (this.source) {
            this.source.stop();
        }
        try {
            // Fetch audio data
            // For Node.js (Mock), we might fail to fetch if it's a real URL
            // If MockAudioContext is used, we probably want to skip fetch?
            // Or Mock fetch? 
            // In Node environment, fetch is global in recent versions (v18+)
            // But if we are mocking, we can't really "decode" the buffer from a remote stream easily without logic.
            // My MockAudioContext.decodeAudioData returns a mock buffer.
            let audioBuffer;
            // Check if real fetch is feasible
            if (this.audioContext instanceof MockAudioContext) {
                // Mock fetch behavior if needed or just create dummy buffer
                audioBuffer = await this.audioContext.decodeAudioData(new ArrayBuffer(0));
            }
            else {
                const response = await fetch(track.url);
                const arrayBuffer = await response.arrayBuffer();
                audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            }
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = audioBuffer;
            this.duration = audioBuffer.duration;
            // Connect through filters
            this.audioEngine.filters.connect(this.source, this.audioContext.destination);
            // Handle end of track
            this.source.onended = () => {
                this.isPlaying = false;
                this.eventBus.emit(EVENTS.TRACK_END, track);
                this.handleTrackEnd();
            };
            this.source.start(0);
            this.isPlaying = true;
        }
        catch (error) {
            throw new Error(`Failed to play stream: ${error}`);
        }
    }
    /**
     * Pause playback
     */
    pause() {
        if (this.audioContext.state === 'running') {
            this.audioContext.suspend();
            this.isPlaying = false;
            this.eventBus.emit(EVENTS.PAUSE);
        }
    }
    /**
     * Resume playback
     */
    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            this.isPlaying = true;
            this.eventBus.emit(EVENTS.PLAY);
        }
    }
    /**
     * Stop playback
     */
    stop() {
        if (this.source) {
            try {
                this.source.stop();
            }
            catch (e) {
                // Ignore if already stopped
            }
            this.source = null;
        }
        this.isPlaying = false;
        this.currentTime = 0;
        this.eventBus.emit(EVENTS.STOP);
    }
    /**
     * Seek to position
     * @param time - Time in seconds
     */
    seek(time) {
        if (this.source && this.isPlaying) {
            // TODO: Implement proper seek
            console.warn('Seek not fully implemented for Web Audio BufferSource');
        }
        this.currentTime = Math.max(0, Math.min(time, this.duration));
    }
    /**
     * Set volume
     * @param volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    /**
     * Set loop mode
     * @param mode - Loop mode
     */
    setLoopMode(mode) {
        this.loopMode = mode;
    }
    /**
     * Handle track end based on loop mode
     */
    handleTrackEnd() {
        if (this.loopMode === LOOP_MODES.TRACK) {
            // Replay current track
            const current = this.audioEngine.queue.getCurrent();
            if (current)
                this.play(current);
        }
        else if (this.loopMode === LOOP_MODES.QUEUE) {
            // Play next in queue
            const next = this.audioEngine.queue.next(true);
            if (next)
                this.play(next);
        }
        else {
            // Loop OFF: Play next or stop
            const next = this.audioEngine.queue.next(false);
            if (next) {
                this.play(next);
            }
            else {
                this.stop();
            }
        }
    }
    /**
     * Get current playback state
     * @returns State object
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.audioContext.currentTime,
            duration: this.duration,
            volume: this.volume,
            loopMode: this.loopMode
        };
    }
}
