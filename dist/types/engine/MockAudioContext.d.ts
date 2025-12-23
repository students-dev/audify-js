export declare class MockAudioContext {
    state: string;
    currentTime: number;
    private startTime;
    constructor();
    private updateTime;
    createGain(): {
        connect: () => void;
        gain: {
            value: number;
        };
    };
    createBiquadFilter(): {
        connect: () => void;
        frequency: {
            value: number;
        };
        gain: {
            value: number;
        };
    };
    createPanner(): {
        connect: () => void;
    };
    createConvolver(): {
        connect: () => void;
    };
    createBufferSource(): MockAudioBufferSource;
    decodeAudioData(buffer: ArrayBuffer): Promise<any>;
    suspend(): void;
    resume(): void;
    close(): void;
}
declare class MockAudioBufferSource {
    buffer: any;
    onended: (() => void) | null;
    private context;
    constructor(context: MockAudioContext);
    connect(): void;
    start(when?: number, offset?: number): void;
    stop(): void;
}
export {};
