import * as Three from 'three';
import BlockUtil from '../utils/block-util';
import AbstractBlock from '../block/abstract-block';
import MathUtil from '../utils/math.util';
import AnimateUtil from '../utils/animate-util';
import SoundManager from '../sound/sound-manager';
import { SoundType } from '../sound/type';
import GhostManager from '../ghost/ghost-manager';
import MapManager from '../map/map-manager';

class Board {
    private currentBlock: AbstractBlock | null = null;
    private width: number = 18;
    private height: number = 25;
    private gameOverLine: number = 3;
    private fallDownYPositionValue = 0.05;

    private board: Three.Group = new Three.Group();
    private wall: Three.Group = new Three.Group();
    private animate: Three.Group = new Three.Group();
    private active: Three.Group = new Three.Group();
    
    private color: number = 0x3E3A39;
    private score: number = 0;
    private soundManager: SoundManager = new SoundManager();
    private ghostManager: GhostManager = new GhostManager();
    private mapManager: MapManager = new MapManager(this.width, this.height, this.gameOverLine);

    private waitClearAnimation: boolean = false;

    public getBoard(): Three.Group {
        return this.board;
    }

    public getScore(): number {
        return this.score;
    }

    public constructor() {
        this.init(); 
    }
    
    private clear(): void {
        this.active.clear();
        this.animate.clear();
        this.currentBlock = null;
        this.ghostManager.clearGhost();
        this.mapManager.clear();
        this.waitClearAnimation = false;
        this.score = 0;
    }

    private init(): void {
        this.buildWall();
        this.combineGroup();
    }

    private combineGroup(): void {
        this.board.position.set(0,0,0);
        this.board.add(
            this.wall, 
            this.mapManager.getMap(),
            this.active, 
            this.animate, 
            this.ghostManager.getGhost(),
        );
    }

    private buildWall(): void {
        this.buildBackWall();
        this.addLine(0, 0, 0, 0, 1, this.height);
        this.addLine(0, 0, 0, 1, 0, this.width);
        this.addLine(this.width - 1, 0, 0, 0, 1, this.height);
    }

    private buildBackWall(): void {
        for (let y = 0; y < this.height; y++) {
            this.addLine(0, y, -1, 1, 0, this.width);
        }
    }

    private addLine(startX: number, startY: number, z: number, dx: number, dy: number, count: number) {
        for (let i = 0; i < count; i++) {
            const cube = BlockUtil.createMesh(this.color);
            cube.position.set(startX + dx * i, startY + dy * i, z);
            this.wall.add(cube);
        }
    }

    public onUpdate(): void {
        if (this.mapManager.isGameOver()) {
            this.clear();
            return;
        }
        if (this.waitClearAnimation) {
            return;
        }
        if (this.emptyCurrentBlock()) {
            this.initCurrentBlock();
        }
        if (this.hasCollisionInCurrentBlock()) {
            this.extractBlockToMap();
            this.handleLineClear();
        } else {
            this.fallDownCurrentBlock();
        }
    }

    private isGameOver(): boolean {
        return false;
    }

    private emptyCurrentBlock(): boolean {
        return this.currentBlock === null;
    }

    private hasCollisionInCurrentBlock(): boolean {
        if (this.emptyCurrentBlock()) {
            throw new Error();
        }
        return this.mapManager.isBlockStickToBottom(this.active) 
            || this.mapManager.hasCollisionGroupToMap(this.active);
    }
    
    private extractBlockToMap(): void {
        if (this.emptyCurrentBlock()) {
            throw new Error();
        }
        const block = this.active.clone(true);
        block.position.x = MathUtil.roundToHalf(block.position.x);
        block.position.y = MathUtil.roundToHalf(block.position.y);
        this.mapManager.copyBlockToMap(block, this.currentBlock!.getColor());
    }

    private removeCurrentBlock(): void {
        if (this.emptyCurrentBlock()) {
            throw new Error();
        }
        this.ghostManager.clearGhost();
        this.active.remove(this.currentBlock!.getGroup());
        this.currentBlock = null;
    }

    private handleLineClear(): void {
        this.waitClearAnimation = true;
        this.mapManager.clearLines(this.animate)
            .then(length => {
                if (length > 0) {
                    this.score += length;
                    this.soundManager.play(SoundType.score);                    
                }
                this.waitClearAnimation = false;
                this.removeCurrentBlock();
            });
    }

    private fallDownCurrentBlock(): void {
        if (this.emptyCurrentBlock()) {
            throw new Error();
        }
        this.active.position.y -= this.fallDownYPositionValue;
    }

    private initCurrentBlock() {
        this.currentBlock = BlockUtil.createRandomBlock();
        this.active.position.set(this.width / 2, this.height + this.gameOverLine, 0);
        this.active.add(this.currentBlock.getGroup());
        this.ghostManager.updateGhost(this.mapManager.getBlockInBottom(this.active), this.currentBlock.getColor());
    }

    public moveActiveToDown(): void {
        if (this.emptyCurrentBlock()) {
            return;
        }
        const testGroup = this.active.clone();
        testGroup.position.add({ x: 0, y: -1, z: 0});
        if (this.mapManager.isBlockStickToBottom(testGroup) || this.mapManager.hasCollisionGroupToMap(testGroup)) {
            return;
        }
        this.active.position.copy(testGroup.position);
    }

    public moveActiveToLeftOrRight(direction: 1 | -1): void {
        if (this.emptyCurrentBlock()) {
            return;
        }
        const testGroup = this.active.clone();
        testGroup.position.add({ x: direction, y: 0, z: 0 });
        if (
            this.mapManager.hasCollisionGroupToWall(testGroup) 
            || this.mapManager.hasCollisionGroupToMap(testGroup)
        ) {
            return;
        }
        this.active.position.copy(testGroup.position);
        this.ghostManager.updateGhost(this.mapManager.getBlockInBottom(testGroup), this.currentBlock!.getColor());
    }

    public takeDownBlock(): number {
        const blockInBottom = this.mapManager.getBlockInBottom(this.active);
        const fallDistance = this.active.position.y - blockInBottom.position.y;
        this.active.position.copy(blockInBottom.position);
        this.soundManager.play(SoundType.hit);
        return AnimateUtil.takeDown(this.active, this.animate, fallDistance, this.currentBlock!.getColor());
    }

    public rotateCurrentBlock(): void {
        if (this.emptyCurrentBlock()) {
            return;
        }
        if (!this.canRotate()) {
            return;
        }
        this.currentBlock!.rotate();
        this.ghostManager.updateGhost(this.mapManager.getBlockInBottom(this.active), this.currentBlock!.getColor());
    }

    private canRotate(): boolean {
        const testGroup = this.active.clone();
        const testBlock = testGroup.children[0];

        testBlock.rotateZ(Math.PI / 2);

        return !this.mapManager.hasCollisionGroupToWall(testGroup) 
            && !this.mapManager.isBlockStickToBottom(testGroup) 
            && !this.mapManager.hasCollisionGroupToMap(testGroup);
    }
}

export default Board;