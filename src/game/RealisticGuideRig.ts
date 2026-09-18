import * as THREE from 'three';

/**
 * RealisticGuideRig
 * "Aethelgard, Architect of Trials"
 * Celestial deity with multi-harmonic zero-g hovering, dynamic astrolabe precession,
 * and divine aura pulsation.
 */
export class RealisticGuideRig {
  public readonly group: THREE.Group;
  public core: THREE.Mesh;
  public eye: THREE.Mesh;
  public rings: THREE.Mesh[] = [];
  public beam: THREE.Mesh;
  public halo: THREE.Mesh;

  private baseY = 2.8;
  private rotSpeeds = [0.8, -1.1, 1.4];
  private precessionAngles = [0, 0, 0];

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(3.8, this.baseY, 10.5);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x92400e,
      emissiveIntensity: 0.45,
    });

    const glowCoreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });

    // Central Deity Core
    this.core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95), goldMat);
    this.core.castShadow = true;
    this.group.add(this.core);

    // Inner Radiant Divine Eye
    this.eye = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 24), glowCoreMat);
    this.group.add(this.eye);

    // 3 Rotating Astrolabe Rings
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.08, 12, 48), goldMat);
    this.group.add(ring1);
    this.rings.push(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.08, 12, 48), goldMat);
    this.group.add(ring2);
    this.rings.push(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.07, 12, 48), goldMat);
    this.group.add(ring3);
    this.rings.push(ring3);

    // Divine Light Beam from Sky
    const beamGeo = new THREE.CylinderGeometry(0.25, 2.2, 32, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });
    this.beam = new THREE.Mesh(beamGeo, beamMat);
    this.beam.position.set(0, 16, 0);
    this.group.add(this.beam);

    // Divine Rune Halo
    const haloGeo = new THREE.RingGeometry(2.4, 2.75, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    this.halo = new THREE.Mesh(haloGeo, haloMat);
    this.halo.rotation.x = -Math.PI / 2;
    this.halo.position.set(0, -1.2, 0);
    this.group.add(this.halo);
  }

  /**
   * Update floating celestial animation with multi-harmonic zero-g dynamics
   */
  public update(delta: number, time: number, playerPos: THREE.Vector3, speedMultiplier: number = 1.0) {
    // 1. Multi-harmonic floating oscillation (organic zero-gravity weightlessness)
    const float1 = Math.sin(time * 1.5) * 0.28;
    const float2 = Math.cos(time * 0.73) * 0.14;
    const float3 = Math.sin(time * 2.31) * 0.06;
    this.group.position.y = this.baseY + float1 + float2 + float3;

    // 2. Astrolabe Gyroscopic Precession
    this.rings.forEach((ring, idx) => {
      this.precessionAngles[idx] += delta * this.rotSpeeds[idx] * speedMultiplier;
      ring.rotation.x = Math.sin(this.precessionAngles[idx] * 0.7) * 0.5 + (idx * Math.PI) / 4;
      ring.rotation.y = this.precessionAngles[idx];
      ring.rotation.z = Math.cos(this.precessionAngles[idx] * 0.5) * 0.35;
    });

    // 3. Core gentle breathing
    const breath = 1.0 + Math.sin(time * 3.0) * 0.06;
    this.eye.scale.setScalar(breath);
    this.core.rotation.y += delta * 0.4 * speedMultiplier;
    this.core.rotation.x = Math.sin(time * 0.8) * 0.15;

    // 4. Halo subtle breathing pulse
    this.halo.scale.setScalar(1.0 + Math.sin(time * 2.0) * 0.05);
    this.halo.rotation.z += delta * 0.3;

    // 5. Look softly towards player
    const lookDir = playerPos.clone().sub(this.group.position).normalize();
    const targetAngle = Math.atan2(lookDir.x, lookDir.z);
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetAngle, 2 * delta);
  }

  public setBaseY(y: number) {
    this.baseY = y;
  }

  public setOpacity(opacity: number) {
    (this.beam.material as THREE.MeshBasicMaterial).opacity = opacity * 0.32;
    (this.halo.material as THREE.MeshBasicMaterial).opacity = opacity * 0.65;
  }
}
