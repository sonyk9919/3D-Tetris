import * as Three from 'three';

class BackgroundUtil {
    public static createNightSky(): Three.Mesh {
        const geometry = new Three.PlaneGeometry(800, 800);
        const material = new Three.ShaderMaterial({
            uniforms: {
                topColor:    { value: new Three.Color('#03050A') },
                bottomColor: { value: new Three.Color('#0A1A33') },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform vec3 topColor;
                uniform vec3 bottomColor;

                void main() {
                    gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
                }
            `,
            depthWrite: false
        });

        const sky = new Three.Mesh(geometry, material);
        sky.position.set(9, 12, -80);
        return sky;
    }

    public static createGrassFloor(): Three.Mesh {
        const geometry = new Three.PlaneGeometry(800, 500);

        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d")!;

        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, "#0F3A1C");
        gradient.addColorStop(1, "#0A2A14");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 8000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const alpha = Math.random() * 0.08;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(x, y, 1.5, 1.5);
        }

        const texture = new Three.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = Three.RepeatWrapping;
        texture.repeat.set(3, 3);

        const material = new Three.MeshPhongMaterial({
            map: texture,
            shininess: 4,
        });

        const floor = new Three.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;

        return floor;
    }

    public static createStars(count: number = 400): Three.Points {
        const geometry = new Three.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 400;
            positions[i * 3 + 1] = Math.random() * 200 + 30;
            positions[i * 3 + 2] = -50 - Math.random() * 40;

            phases[i] = Math.random() * Math.PI * 2; // 개별 별의 위상
        }

        geometry.setAttribute("position", new Three.BufferAttribute(positions, 3));
        geometry.setAttribute("phase", new Three.BufferAttribute(phases, 1));

        const material = new Three.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new Three.Color(0xffffff) }
            },
            vertexShader: `
                attribute float phase;
                uniform float uTime;
                varying float vIntensity;

                void main() {
                    // 반짝임 (트윙클) 강도
                    vIntensity = 0.5 + 0.5 * sin(uTime * 2.0 + phase * 3.0);

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 2.0 * (1.0 + vIntensity);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vIntensity;

                void main() {
                    gl_FragColor = vec4(uColor * vIntensity, 1.0);
                }
            `,
            transparent: true
        });

        const stars = new Three.Points(geometry, material);

        stars.onBeforeRender = (_, __, ___, ____, _____, object) => {
            material.uniforms.uTime.value = performance.now() * 0.001;
        };

        return stars;
    }
}

export default BackgroundUtil;
