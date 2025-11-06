import * as Three from 'three';
import BlockUtil from '../utils/block-util';
import AnimateUtil from '../utils/animate-util';

class MapManager {
    private map: Three.Group = new Three.Group();
    private width: number;
    private height: number;
    private gameOverLine: number;
    private mapGrid: boolean[][];

    public getMap(): Three.Group {
        return this.map;
    }

    public constructor(width: number, height: number, gameOverLine: number) {
        this.width = width;
        this.height = height + gameOverLine;
        this.gameOverLine = gameOverLine;
        this.mapGrid = Array.from({ length: this.height + this.gameOverLine - 1 }).map(() => Array.from({ length: this.width - 2 }).map(() => false));
    }

    public isGameOver(): boolean {
        return this.mapGrid.slice(this.height - (this.gameOverLine + 1)).some(columns => columns.some(value => value)); 
    }

    public clear(): void {
        this.mapGrid = Array.from({ length: this.height + this.gameOverLine - 1 }).map(() => Array.from({ length: this.width - 2 }).map(() => false));
        this.map.clear();
    }

    public copyBlockToMap(block: Three.Group, color: number): void {
        this.copyToMap(block, color);
        this.checkMapGrid(block);
    }

    private copyToMap(block: Three.Group, color: number): void {
        const temp = new Three.Vector3();

        block.children.forEach(blockGroup => blockGroup.children.forEach(mesh => {
            mesh.getWorldPosition(temp);
            const newMesh = BlockUtil.createMeshWithEdge(color);
            newMesh.position.set(temp.x, temp.y, temp.z);
            this.map.add(newMesh);
        }));
    }

    private checkMapGrid(block: Three.Group): void {
        this.extractPosFromActive(block).forEach(pos => {
            if (this.invalidateMapGridArea(pos[0], pos[1])) return;
            this.mapGrid[pos[1] - 1][pos[0] - 1] = true
        });
    }

    private extractPosFromActive(active: Three.Group): [number, number][] {
        active.updateMatrixWorld(true);

        const positions: [number, number][] = [];
        const temp = new Three.Vector3();
        const blockGroup = active.children[0];

        blockGroup.children.forEach(child => {
            child.getWorldPosition(temp);
            positions.push([Math.round(temp.x), Math.floor(Number(temp.y.toFixed(2)))]);
        });

        return positions;
    }

    private invalidateMapGridArea(x: number, y: number): boolean {
        return y >= this.height - 1  || y <= 0 || x >= this.width - 1 || x <= 0;
    }

    public hasCollisionGroupToWall(active: Three.Group): boolean {
        return this.extractPosFromActive(active).some(pos => pos[0] < 1 || pos[0] > this.width - 2);
    }

    public hasCollisionGroupToMap(active: Three.Group): boolean {
        return this.extractPosFromActive(active).some(pos => this.validateMapGrid(pos[0], pos[1]));
    }

    private validateMapGrid(x: number, y: number): boolean {
        if (this.invalidateMapGridArea(x, y)) return false;
        return this.mapGrid[y - 1][x - 1];
    }

    public isBlockStickToBottom(active: Three.Group): boolean {
        return this.extractPosFromActive(active).some(pos => pos[1] <= 0);
    }

    public async clearLines(animate: Three.Group): Promise<number> {
        const fullLines = this.findFullLines();
        if (fullLines.length === 0) return 0;

        const temp = new Three.Vector3();
        const removeMeshs: Three.Object3D[] = [];

        fullLines.forEach(y => this.map.children.forEach(mesh => {
            mesh.getWorldPosition(temp);
            if (Math.round(temp.y) === y) {
                removeMeshs.push(mesh);
            }
        }));

        await AnimateUtil.clearLine(this.map, animate, removeMeshs);

        fullLines.forEach(y => this.map.children.forEach(mesh => {
            mesh.getWorldPosition(temp);
            if (Math.round(temp.y) > y) {
                mesh.position.add({ x: 0, y: -1, z: 0 });
            }
        }));

        this.mapGrid = Array.from({ length: this.height - 1 }).map(() =>
            Array.from({ length: this.width - 2 }).map(() => false)
        );

        const occupied = this.getOccupiedGridPositions();
        
        for (const o of occupied) {
            if (o.y <= 0 || o.y >= this.height - 1) continue;
            if (o.x <= 0 || o.x >= this.width - 1) continue;
            this.mapGrid[o.y - 1][o.x - 1] = true;
        }

        return fullLines.length;
    }
    
    private findFullLines(): number[] {
        const occupied = this.getOccupiedGridPositions();
        const lineCounts: Map<number, number> = new Map();

        for (const tile of occupied) {
            if (!lineCounts.has(tile.y)) lineCounts.set(tile.y, 0);
            lineCounts.set(tile.y, lineCounts.get(tile.y)! + 1);
        }

        const fullLines: number[] = [];
        Array.from(lineCounts.keys()).forEach(key => {
            if (lineCounts.get(Number(key)) === this.width - 2) {
                fullLines.push(Number(key));
            }
        });

        return fullLines.sort((a, b) => b - a);
    }

    private getOccupiedGridPositions(): { x: number; y: number; cube: Three.Mesh }[] {
        const result: { x: number; y: number; cube: Three.Mesh }[] = [];
        const temp = new Three.Vector3();

        this.map.children.forEach(cube => {
            cube.getWorldPosition(temp);
            const gx = Math.round(temp.x);
            const gy = Math.round(temp.y);
            result.push({ x: gx, y: gy, cube: cube as Three.Mesh });
        });

        return result;
    }

    public getBlockInBottom(active: Three.Group): Three.Group {
        const testGroup = active.clone();
        while (
            !this.hasCollisionGroupToWall(testGroup) 
            && !this.isBlockStickToBottom(testGroup) 
            && !this.hasCollisionGroupToMap(testGroup)
        ) {
            testGroup.position.set(testGroup.position.x, Math.round(testGroup.position.y) - 1, testGroup.position.z);
        }
        testGroup.position.add({ x: 0, y: 1, z: 0 });
        return testGroup;
    }
}

export default MapManager;