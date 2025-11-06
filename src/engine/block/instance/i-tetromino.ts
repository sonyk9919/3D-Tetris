import BlockUtil from "../../utils/block-util";
import AbstractBlock from "../abstract-block";

class ITetromino extends AbstractBlock {
    public constructor() {
        super();
        this.init();
    }

    protected init(): void {
        for (let i = 0; i < 4; i++) {
            const mesh = BlockUtil.createMeshWithEdge(this.color);
            mesh.position.set(i, 0, 0);
            this.group.add(mesh);
        }
    }
}

export default ITetromino;