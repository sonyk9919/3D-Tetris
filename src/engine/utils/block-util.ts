import * as Three from 'three';
import AbstractBlock from '../block/abstract-block';
import { BlockType } from '../block/types';
import ITetromino from '../block/instance/i-tetromino';
import JTetromino from '../block/instance/j-tetromino';
import LTetromino from '../block/instance/l-tetromino';
import OTetromino from '../block/instance/o-tetromino';
import STetromino from '../block/instance/s-tetromino';
import TTetromino from '../block/instance/t-tetromino';
import ZTetromino from '../block/instance/z-tetromino';

class BlockUtil {
    private static unit: Three.BoxGeometry = new Three.BoxGeometry(1, 1, 1);
    private static BlockClassMapper: Record<BlockType, new () => AbstractBlock> = {
        [BlockType.I_TETROMINO]: ITetromino,
        [BlockType.J_TETROMINO]: JTetromino,
        [BlockType.L_TETROMINO]: LTetromino,
        [BlockType.O_TETROMINO]: OTetromino,
        [BlockType.S_TETROMINO]: STetromino,
        [BlockType.T_TETROMINO]: TTetromino,
        [BlockType.Z_TETROMINO]: ZTetromino,     
    };
    
    public static createMesh(color: number): Three.Mesh {
        const material = new Three.MeshStandardMaterial({ color });
        const cube = new Three.Mesh(this.unit, material);
        return cube;
    }

    public static createMeshWithEdge(meshColor: number): Three.Mesh {
        const mesh = this.createMesh(meshColor);
        const edges = new Three.EdgesGeometry(this.unit);
        const lineMaterial = new Three.LineBasicMaterial({ color: 0x222222 });
        const edgeLines = new Three.LineSegments(edges, lineMaterial);
        mesh.add(edgeLines);
        return mesh;
    }

    public static createRandomBlock(): AbstractBlock {
        return this.createBlock(Math.floor(Math.random() * 6));
    }

    public static createBlock(blockType: BlockType): AbstractBlock {
        return new this.BlockClassMapper[blockType]();
    }
}

export default BlockUtil;