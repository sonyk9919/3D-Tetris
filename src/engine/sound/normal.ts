import * as Three from 'three';
import Sound from './sound';

class NormalSound extends Sound {
    constructor(filePath: string) {
        const listener = new Three.AudioListener();
        const audio = new Three.Audio(listener);
        super(listener, filePath, audio);
    }
}

export default NormalSound;