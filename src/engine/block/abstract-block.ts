import * as Three from 'three';
import { BLOCK_COLORS } from './types';

abstract class AbstractBlock {
    protected color: number = BLOCK_COLORS[Math.floor(Math.random() * 8)];
    
    protected group: Three.Group = new Three.Group();

    protected abstract init(): void;

    public rotate(): void {
        this.group.rotateZ(Math.PI / 2);
    }

    public getGroup(): Three.Group {
        return this.group;
    }

    public getColor(): number {
        return this.color;
    }
}

export default AbstractBlock;