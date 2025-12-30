import { registerPlugin } from '@capacitor/core';

export interface NativeAudioPlugin {
    play(options: {
        url: string;
        title: string;
        artist: string;
        album?: string;
        artwork?: string;
    }): Promise<void>;

    pause(): Promise<void>;
    resume(): Promise<void>;
    stop(): Promise<void>;
    seekTo(options: { time: number }): Promise<void>;
    setVolume(options: { volume: number }): Promise<void>;
}

const NativeAudio = registerPlugin<NativeAudioPlugin>('NativeAudio');

export default NativeAudio;
