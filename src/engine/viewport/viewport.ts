import * as Three from 'three';
import { IViewport } from './types';

class Viewport implements IViewport {
  public readonly scene: Three.Scene;
  public readonly camera: Three.PerspectiveCamera;
  public readonly renderer: Three.WebGLRenderer;
  private readonly light: Three.DirectionalLight;

  public constructor(container: HTMLElement) {
    this.renderer = new Three.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.scene = new Three.Scene();
    this.scene.background = new Three.Color(0x333333);

    this.camera = new Three.PerspectiveCamera(
      90,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );

    this.camera.position.set(9.6, 14.4, 20.8);
    this.camera.lookAt(9, 12, 0);

    this.light = new Three.DirectionalLight(0xffffff, 1);
    this.light.position.set(9, 9, 15);
    this.light.intensity = 1.2;
    this.scene.add(this.light);
  }

  private renderFrame(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public startLoop(onUpdate: () => void): void {
    const animate = () => {
      requestAnimationFrame(animate);
      onUpdate();
      this.renderFrame();
    };
    animate();
  }

  public render(group: Three.Object3D): void {
    this.scene.add(group);
  }

  public shakeCamera(intensity: number, duration: number = 200): void {
    const original = this.camera.position.clone();
    const interval = setInterval(() => {
      let amplitude = 0;
      
      if (intensity < 10 ) {
        amplitude = 0.005;
      } else if (intensity < 15) {
        amplitude = 0.015;
      } else {
        amplitude = 0.03;
      }

      this.camera.position.set(
        original.x + (Math.random() - 0.5) * intensity * amplitude,
        original.y + (Math.random() - 0.5) * intensity * amplitude,
        original.z + (Math.random() - 0.5) * intensity * amplitude,
      );
    }, 16); 
    
    setTimeout(() => {
      clearInterval(interval);
      this.camera.position.copy(original);
    }, duration);
  }
}


export default Viewport;