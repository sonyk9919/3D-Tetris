import NormalSound from "./normal";
import Sound from "./sound";
import { SoundPath, SoundType } from "./type";


class SoundManager {
    private hitSound: NormalSound;
    private scoreSound: NormalSound;

    private soundMap: Record<SoundType, Sound>;

    public constructor() {
        this.hitSound = new NormalSound(SoundPath.hit);
        this.scoreSound = new NormalSound(SoundPath.score);

        this.soundMap = {
            [SoundType.hit]: this.hitSound,
            [SoundType.score]: this.scoreSound,
        };
    }

    public play(type: SoundType): void {
        this.soundMap[type].play();
    }
}

export default SoundManager;