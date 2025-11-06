import * as Three from 'three';

abstract class Sound {
    protected listener: Three.AudioListener;
    protected sound: Three.Audio | Three.PositionalAudio;
    protected buffer: AudioBuffer | null = null;
    protected volume: number = 0.3;
    protected filePath: string;

    public constructor(
        listener: Three.AudioListener,
        filePath: string,
        sound: Three.Audio | Three.PositionalAudio,
    ) {
        this.listener = listener;
        this.filePath = filePath;
        this.sound = sound;
        this.load();
    }

    private load(): Promise<void> {
        const loader = new Three.AudioLoader();

        return new Promise((resolve, reject) => {
            loader.load(
                this.filePath,
                (buffer) => {
                    this.buffer = buffer;
                    this.sound.setBuffer(buffer);
                    this.sound.setVolume(this.volume);
                    resolve();
                },
                undefined,
                reject,
            );
        });
    }

    public play(): void {
        if (!this.buffer) return;
        if (this.sound.isPlaying) this.sound.stop();
        this.sound.play();
    }

    public stop(): void {
        this.sound.stop();
    }

    public getVolume(): number {
        return this.volume;
    }

    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.sound.setVolume(this.volume);
    }

    public isPlaying(): boolean {
        return this.sound.isPlaying;
    }
}

export default Sound;
