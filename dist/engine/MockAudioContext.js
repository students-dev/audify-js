export class MockAudioContext {
    constructor() {
        this.state = 'running';
        this.currentTime = 0;
        this.startTime = Date.now();
        this.updateTime();
    }
    updateTime() {
        if (this.state === 'running') {
            const diff = (Date.now() - this.startTime) / 1000;
            this.currentTime = diff;
        }
        // Simulate clock
        if (typeof setTimeout !== 'undefined') {
            setTimeout(() => this.updateTime(), 100);
        }
    }
    createGain() { return { connect: () => { }, gain: { value: 0 } }; }
    createBiquadFilter() { return { connect: () => { }, frequency: { value: 0 }, gain: { value: 0 } }; }
    createPanner() { return { connect: () => { } }; }
    createConvolver() { return { connect: () => { } }; }
    createBufferSource() {
        return new MockAudioBufferSource(this);
    }
    async decodeAudioData(buffer) {
        return { duration: 5 }; // Mock 5 seconds duration
    }
    suspend() { this.state = 'suspended'; }
    resume() { this.state = 'running'; this.startTime = Date.now() - (this.currentTime * 1000); }
    close() { this.state = 'closed'; }
}
class MockAudioBufferSource {
    constructor(context) {
        this.buffer = null;
        this.onended = null;
        this.context = context;
    }
    connect() { }
    start(when = 0, offset = 0) {
        // Simulate playback duration
        const duration = this.buffer ? this.buffer.duration : 0;
        setTimeout(() => {
            if (this.onended)
                this.onended();
        }, duration * 1000); // Speed up for tests? No, keep real time or fast? 
        // 5 seconds mock duration might be too long for quick examples.
        // Let's make it 1 second for examples unless buffer says otherwise.
    }
    stop() {
        if (this.onended)
            this.onended();
    }
}
