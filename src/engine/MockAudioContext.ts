export class MockAudioContext {
  state: string = 'running';
  currentTime: number = 0;
  private startTime: number = Date.now();

  constructor() {
    this.updateTime();
  }

  private updateTime() {
    if (this.state === 'running') {
      const diff = (Date.now() - this.startTime) / 1000;
      this.currentTime = diff;
    }
    // Simulate clock
    if (typeof setTimeout !== 'undefined') {
       setTimeout(() => this.updateTime(), 100);
    }
  }

  createGain() { return { connect: () => {}, gain: { value: 0 } }; }
  createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 }, gain: { value: 0 } }; }
  createPanner() { return { connect: () => {} }; }
  createConvolver() { return { connect: () => {} }; }
  
  createBufferSource() { 
    return new MockAudioBufferSource(this);
  }
  
  async decodeAudioData(buffer: ArrayBuffer): Promise<any> {
    return { duration: 5 }; // Mock 5 seconds duration
  }

  suspend() { this.state = 'suspended'; }
  resume() { this.state = 'running'; this.startTime = Date.now() - (this.currentTime * 1000); }
  close() { this.state = 'closed'; }
}

class MockAudioBufferSource {
  buffer: any = null;
  onended: (() => void) | null = null;
  private context: MockAudioContext;

  constructor(context: MockAudioContext) {
    this.context = context;
  }

  connect() {}
  
  start(when: number = 0, offset: number = 0) {
    // Simulate playback duration
    const duration = this.buffer ? this.buffer.duration : 0;
    setTimeout(() => {
      if (this.onended) this.onended();
    }, duration * 1000); // Speed up for tests? No, keep real time or fast? 
    // 5 seconds mock duration might be too long for quick examples.
    // Let's make it 1 second for examples unless buffer says otherwise.
  }

  stop() {
    if (this.onended) this.onended();
  }
}
