import gsap from 'gsap';
import * as Three from 'three';

class AnimateUtil {
    public static async clearLine(map: Three.Group, animate: Three.Group, meshes: Three.Object3D[]): Promise<void> {
        return new Promise((resolve) => {
            let finished = 0;

            meshes.forEach((mesh) => {
                const material = (mesh as any).material;
                gsap.to(material.color, { r: 1, g: 1, b: 1, duration: 0.08 });
                gsap.to(mesh.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.1, ease: "power2.out" });

                const particleCount = 12;
                const particleLifetime = 0.35;

                const origin = new Three.Vector3();
                mesh.getWorldPosition(origin);

                for (let i = 0; i < particleCount; i++) {
                    const geom = new Three.BoxGeometry(0.2, 0.2, 0.2);
                    const mat = new Three.MeshBasicMaterial({ color: material.color });
                    const particle = new Three.Mesh(geom, mat);

                    particle.position.copy(origin);
                    animate.add(particle);

                    const dir = new Three.Vector3(
                        (Math.random() - 0.5) * 2,
                        (Math.random() - 0.5) * 2,
                        (Math.random() - 0.5) * 2,
                    ).normalize().multiplyScalar(Math.random() * 1.2 + 0.4);

                    gsap.to(particle.position, {
                        x: particle.position.x + dir.x,
                        y: particle.position.y + dir.y,
                        z: particle.position.z + dir.z,
                        duration: particleLifetime,
                        ease: "power2.out",
                    });

                    gsap.to(particle.scale, { x: 0, y: 0, z: 0, duration: particleLifetime, ease: "power3.in" });
                    gsap.to(mat.color, { r: 255, g: 255, b: 255, duration: particleLifetime });
                    setTimeout(() => animate.remove(particle), particleLifetime * 1000);
                }

                const onComplete = () => {
                        map.remove(mesh);
                        finished++;

                        if (finished === meshes.length) resolve();
                    }
                gsap.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 0.25, delay: 0.05, ease: "power3.in", onComplete });
                gsap.to(material.color, { r: 0, g: 0, b: 0, duration: 0.25, delay: 0.05 });
            });
        });
    }

    public static takeDown(active: Three.Group, animate: Three.Group, fallDistance: number, color: number): number {
        if (fallDistance <= 0) return 0;

        const intensity = Math.min(fallDistance / 6, 1.2);
        const blockGroup = active.children[0];
        const particlePerCube = Math.floor(3 + fallDistance * 0.2);

        blockGroup.children.forEach((cube: any) => {
            const cubeOrigin = new Three.Vector3();
            cube.getWorldPosition(cubeOrigin);

            for (let i = 0; i < particlePerCube; i++) {
                const geom = new Three.BoxGeometry(
                    0.25 * (Math.random() * 0.4 + 0.3),
                    0.03,
                    0.25 * (Math.random() * 0.4 + 0.3)
                );
                const mat = new Three.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
                mat.depthTest = false;
                mat.depthWrite = false;

                const particle = new Three.Mesh(geom, mat);
                particle.renderOrder = 9999;

                particle.position.copy(cubeOrigin);
                animate.add(particle);

                const dir = new Three.Vector3(
                    (Math.random() - 0.5) * 1.2,
                    -(Math.random() * 1.0 + 0.4),
                    (Math.random() - 0.5) * 1.2
                ).multiplyScalar(0.8 + intensity * 1.1);

                const duration = 0.32 + intensity * 0.25;

                gsap.to(particle.position, {
                    x: particle.position.x + dir.x,
                    y: particle.position.y + dir.y,
                    z: particle.position.z + dir.z,
                    duration,
                    ease: "power2.out"
                });

                gsap.to(particle.scale, {
                    x: 0, y: 0, z: 0,
                    duration,
                    ease: "power3.in",
                    onComplete: () => { animate.remove(particle); },
                });
            }
        });

        return fallDistance;
    }
}

export default AnimateUtil;