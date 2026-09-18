import * as THREE from 'three';

interface DustParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  maxSize: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

export class RealisticFXSystem {
  private scene: THREE.Scene;
  private particles: DustParticle[] = [];
  private particlePoints: THREE.Points;
  private particleGeo: THREE.BufferGeometry;
  private particleMat: THREE.PointsMaterial;
  private maxParticles = 600;

  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;

  // Screen shake trauma system
  private screenTrauma = 0;
  private shakeOffset = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.particleGeo.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Canvas texture for smooth soft circular particles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    this.particleMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      map: texture,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particlePoints);
  }

  /**
   * Spawn footstep puff when feet strike the stone ground
   */
  public emitFootstepPuff(pos: THREE.Vector3, isSprinting: boolean) {
    const count = isSprinting ? 6 : 3;
    const dustColor = new THREE.Color(0xd1d5db);

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * (isSprinting ? 1.2 : 0.6);

      this.particles.push({
        position: new THREE.Vector3(
          pos.x + (Math.random() - 0.5) * 0.2,
          pos.y + 0.04,
          pos.z + (Math.random() - 0.5) * 0.2
        ),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          0.3 + Math.random() * 0.5,
          Math.sin(angle) * speed
        ),
        size: 0.2,
        maxSize: 0.55 + Math.random() * 0.35,
        opacity: 0.65,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
        color: dustColor,
      });
    }
  }

  /**
   * Massive stone impact debris puff (for Boss slam or high landing)
   */
  public emitImpactBurst(pos: THREE.Vector3, radius: number = 2.5) {
    const count = 35;
    const stoneColor = new THREE.Color(0x94a3b8);
    const emberColor = new THREE.Color(0xf59e0b);

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.2;
      const isEmber = Math.random() > 0.6;

      this.particles.push({
        position: new THREE.Vector3(
          pos.x + Math.cos(angle) * 0.4,
          pos.y + 0.1,
          pos.z + Math.sin(angle) * 0.4
        ),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          1.2 + Math.random() * 3.5,
          Math.sin(angle) * speed
        ),
        size: isEmber ? 0.25 : 0.4,
        maxSize: isEmber ? 0.3 : 1.4,
        opacity: 0.85,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.6,
        color: isEmber ? emberColor : stoneColor,
      });
    }

    this.addTrauma(0.65);
  }

  /**
   * Gate stone scraping dust falling from the archway
   */
  public emitGateDust(x: number, y: number, z: number) {
    if (Math.random() > 0.35 || this.particles.length >= this.maxParticles) return;

    this.particles.push({
      position: new THREE.Vector3(x + (Math.random() - 0.5) * 4.0, y, z + (Math.random() - 0.5) * 1.5),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.3, -0.8 - Math.random() * 0.8, (Math.random() - 0.5) * 0.3),
      size: 0.25,
      maxSize: 0.9,
      opacity: 0.5,
      life: 0,
      maxLife: 1.2 + Math.random() * 0.8,
      color: new THREE.Color(0x94a3b8),
    });
  }

  /**
   * Add screen shake trauma (0 to 1)
   */
  public addTrauma(amount: number) {
    this.screenTrauma = Math.min(1.0, this.screenTrauma + amount);
  }

  /**
   * Update particle physics and camera shake
   */
  public update(delta: number): THREE.Vector3 {
    // 1. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics integration (gravity + air drag)
      p.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= 3.5 * delta; // Gravity
      p.velocity.x *= 0.94;
      p.velocity.z *= 0.94;

      const progress = p.life / p.maxLife;
      p.size = THREE.MathUtils.lerp(p.size, p.maxSize, 8 * delta);
      p.opacity = (1 - progress) * 0.7;
    }

    // 2. Refresh GPU buffers
    const count = this.particles.length;
    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      this.positions[i * 3] = p.position.x;
      this.positions[i * 3 + 1] = p.position.y;
      this.positions[i * 3 + 2] = p.position.z;

      this.colors[i * 3] = p.color.r * p.opacity;
      this.colors[i * 3 + 1] = p.color.g * p.opacity;
      this.colors[i * 3 + 2] = p.color.b * p.opacity;

      this.sizes[i] = p.size;
    }

    // Zero out unused slots
    for (let i = count; i < this.maxParticles; i++) {
      this.sizes[i] = 0;
    }

    this.particleGeo.attributes.position.needsUpdate = true;
    this.particleGeo.attributes.color.needsUpdate = true;
    this.particleGeo.attributes.size.needsUpdate = true;

    // 3. Screen shake calculation (Non-linear trauma decay: Shake = Trauma^2)
    if (this.screenTrauma > 0.001) {
      const shakeMag = this.screenTrauma * this.screenTrauma * 0.55;
      const time = performance.now() * 0.045;
      this.shakeOffset.set(
        Math.sin(time * 1.8) * shakeMag,
        Math.cos(time * 2.2) * shakeMag * 0.8,
        Math.sin(time * 2.7) * shakeMag * 0.5
      );
      this.screenTrauma = Math.max(0, this.screenTrauma - 1.8 * delta);
    } else {
      this.shakeOffset.set(0, 0, 0);
    }

    return this.shakeOffset;
  }

  public dispose() {
    this.scene.remove(this.particlePoints);
    this.particleGeo.dispose();
    this.particleMat.dispose();
  }
}
