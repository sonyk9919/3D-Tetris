import BlockUtil from "../../utils/block-util";
import AbstractBlock from "../abstract-block";

class TTetromino extends AbstractBlock {
    
    public constructor() {
        super();
        this.init();
    }


    protected init(): void {
        const coords = [[0, 1],[1, 1],[2, 1],[1, 0]];
        
        coords.forEach(([x, y]) => {
            const mesh = BlockUtil.createMeshWithEdge(this.color);
            mesh.position.set(x, y, 0);
            this.group.add(mesh);
        });
    }
}

export default TTetromino