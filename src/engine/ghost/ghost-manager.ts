import * as Three from 'three';

class GhostManager {
    private ghost: Three.Group = new Three.Group();

    public getGhost(): Three.Group {
        return this.ghost;
    }

    public updateGhost(update: Three.Group, color: number): void {
        const clone = update.clone();

        clone.traverse(obj => {
            if ((obj as any).isMesh) {
                const mesh = obj as Three.Mesh;

                mesh.material = new Three.MeshBasicMaterial({
                    color,
                    opacity: 0.6,
                    transparent: true,
                    depthWrite: false,
                });
            }
        });
        this.ghost.clear();
        this.ghost.add(clone);
    }

    public clearGhost(): void {
        this.ghost.clear();
    }
}

export default GhostManager;