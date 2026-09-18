import * as THREE from 'three';

export type BossAnimState = 'IDLE' | 'TELEGRAPH' | 'SLAM' | 'RECOVERY' | 'STUNNED' | 'DEFEATED';

/**
 * RealisticBossRig
 * Articulated Titan Construct ("The Chrono-Colossus")
 * Features multi-joint arms with hydraulic pistons, segmented chest plates,
 * glowing reactor core with gear rings, and weighty physical combat animations.
 */
export class RealisticBossRig {
  public readonly group: THREE.Group;

  // Skeletal hierarchy
  public torso: THREE.Group;
  public chest: THREE.Group;
  public head: THREE.Group;
  public reactorCore: THREE.Mesh;
  public reactorRings: THREE.Mesh[] = [];

  // Left Arm
  public leftShoulder: THREE.Group;
  public leftUpperArm: THREE.Group;
  public leftElbow: THREE.Group;
  public leftFist: THREE.Group;
  public leftPiston: THREE.Mesh;

  // Right Arm (Primary smashing weapon)
  public rightShoulder: THREE.Group;
  public rightUpperArm: THREE.Group;
  public rightElbow: THREE.Group;
  public rightFist: THREE.Group;
  public rightPiston: THREE.Mesh;

  // Animation logic
  private animState: BossAnimState = 'IDLE';
  private stateTimer = 0;
  private telegraphDuration = 1.4;
  private slamDuration = 0.25;
  private recoveryDuration = 1.2;

  // Dynamic visual parameters
  private hoverOffset = 0;
  private reactorPulse = 1.0;
  private currentTorsoTwist = 0;

  // Materials
  private titanArmorMat: THREE.MeshStandardMaterial;
  private darkSteelMat: THREE.MeshStandardMaterial;
  private goldTrimMat: THREE.MeshStandardMaterial;
  private reactorGlowMat: THREE.MeshBasicMaterial;
  private visorGlowMat: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.titanArmorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.32,
      metalness: 0.88,
    });

    this.darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.8,
    });

    this.goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.92,
    });

    this.reactorGlowMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });

    this.visorGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff3333,
    });

    // 1. Torso Base
    this.torso = new THREE.Group();
    this.torso.position.y = 3.5;
    this.group.add(this.torso);

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(4.6, 5.0, 3.2), this.titanArmorMat);
    torsoMesh.castShadow = true;
    this.torso.add(torsoMesh);

    // 2. Articulated Chest Plates
    this.chest = new THREE.Group();
    this.chest.position.set(0, 0.4, 0);
    this.torso.add(this.chest);

    const chestPlateLeft = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.8, 0.6), this.darkSteelMat);
    chestPlateLeft.position.set(-1.2, 0.2, 1.7);
    this.chest.add(chestPlateLeft);

    const chestPlateRight = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.8, 0.6), this.darkSteelMat);
    chestPlateRight.position.set(1.2, 0.2, 1.7);
    this.chest.add(chestPlateRight);

    // 3. Central Reactor Core & Revolving Gear Rings
    this.reactorCore = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), this.reactorGlowMat);
    this.reactorCore.position.set(0, 0.2, 1.55);
    this.chest.add(this.reactorCore);

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.2 + i * 0.28, 0.06, 8, 32),
        this.goldTrimMat
      );
      ring.position.copy(this.reactorCore.position);
      ring.rotation.x = (i * Math.PI) / 3;
      this.chest.add(ring);
      this.reactorRings.push(ring);
    }

    // 4. Head & Monolithic Helmet
    this.head = new THREE.Group();
    this.head.position.set(0, 3.2, 0);
    this.torso.add(this.head);

    const helmetMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), this.titanArmorMat);
    helmetMesh.position.y = 0.5;
    helmetMesh.castShadow = true;
    this.head.add(helmetMesh);

    // Colossal Horns / Crown Crest
    const crownCrest = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), this.goldTrimMat);
    crownCrest.position.set(0, 1.8, -0.2);
    this.head.add(crownCrest);

    // Glowing Cyclopean Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.3), this.visorGlowMat);
    visor.position.set(0, 0.5, 1.25);
    this.head.add(visor);

    // 5. Left Arm Articulation (Shoulder -> Bicep -> Elbow with Piston -> Fist)
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-3.2, 1.8, 0);
    this.torso.add(this.leftShoulder);

    const leftPauldron = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 2.6), this.goldTrimMat);
    leftPauldron.position.set(-0.2, 0.4, 0);
    this.leftShoulder.add(leftPauldron);

    this.leftUpperArm = new THREE.Group();
    this.leftUpperArm.position.set(-0.3, -0.8, 0);
    this.leftShoulder.add(this.leftUpperArm);

    const leftBicep = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 1.6), this.titanArmorMat);
    leftBicep.position.y = -1.2;
    leftBicep.castShadow = true;
    this.leftUpperArm.add(leftBicep);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.set(0, -2.4, 0);
    this.leftUpperArm.add(this.leftElbow);

    const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.8, 1.7), this.darkSteelMat);
    leftForearm.position.y = -1.3;
    leftForearm.castShadow = true;
    this.leftElbow.add(leftForearm);

    this.leftPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 12), this.goldTrimMat);
    this.leftPiston.position.set(0, -1.2, -0.9);
    this.leftElbow.add(this.leftPiston);

    this.leftFist = new THREE.Group();
    this.leftFist.position.set(0, -2.8, 0);
    this.leftElbow.add(this.leftFist);

    const leftFistMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 2.0), this.titanArmorMat);
    leftFistMesh.position.y = -0.8;
    this.leftFist.add(leftFistMesh);

    // 6. Right Arm Articulation (Main Smashing Weapon)
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(3.2, 1.8, 0);
    this.torso.add(this.rightShoulder);

    const rightPauldron = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 2.6), this.goldTrimMat);
    rightPauldron.position.set(0.2, 0.4, 0);
    this.rightShoulder.add(rightPauldron);

    this.rightUpperArm = new THREE.Group();
    this.rightUpperArm.position.set(0.3, -0.8, 0);
    this.rightShoulder.add(this.rightUpperArm);

    const rightBicep = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 1.6), this.titanArmorMat);
    rightBicep.position.y = -1.2;
    rightBicep.castShadow = true;
    this.rightUpperArm.add(rightBicep);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.set(0, -2.4, 0);
    this.rightUpperArm.add(this.rightElbow);

    const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.8, 1.7), this.darkSteelMat);
    rightForearm.position.y = -1.3;
    rightForearm.castShadow = true;
    this.rightElbow.add(rightForearm);

    this.rightPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 12), this.goldTrimMat);
    this.rightPiston.position.set(0, -1.2, -0.9);
    this.rightElbow.add(this.rightPiston);

    this.rightFist = new THREE.Group();
    this.rightFist.position.set(0, -2.8, 0);
    this.rightElbow.add(this.rightFist);

    const rightFistMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), this.goldTrimMat);
    rightFistMesh.position.y = -0.8;
    this.rightFist.add(rightFistMesh);
  }

  /**
   * Update the Boss animations based on state machine and time
   */
  public update(delta: number, time: number, targetPlayerPos: THREE.Vector3, onSlamImpact?: () => void) {
    this.stateTimer += delta;

    // Smooth orientation towards player with colossal inertia
    const dx = targetPlayerPos.x - this.group.position.x;
    const dz = targetPlayerPos.z - this.group.position.z;
    const targetAngle = Math.atan2(dx, dz);
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetAngle, 2.5 * delta);

    // Planetary Gear Rings continuous spin
    this.reactorRings.forEach((ring, idx) => {
      ring.rotation.z += delta * (1.2 + idx * 0.8);
      ring.rotation.y += delta * (0.8 + idx * 0.5);
    });

    // Evaluate current state
    switch (this.animState) {
      case 'IDLE':
        this.animateIdle(delta, time);
        break;

      case 'TELEGRAPH':
        this.animateTelegraph(delta);
        if (this.stateTimer >= this.telegraphDuration) {
          this.animState = 'SLAM';
          this.stateTimer = 0;
        }
        break;

      case 'SLAM':
        this.animateSlam(delta, onSlamImpact);
        if (this.stateTimer >= this.slamDuration) {
          this.animState = 'RECOVERY';
          this.stateTimer = 0;
        }
        break;

      case 'RECOVERY':
        this.animateRecovery(delta);
        if (this.stateTimer >= this.recoveryDuration) {
          this.animState = 'IDLE';
          this.stateTimer = 0;
        }
        break;

      case 'STUNNED':
        this.animateStunned(delta, time);
        break;

      case 'DEFEATED':
        this.animateDefeated(delta);
        break;
    }
  }

  private animateIdle(delta: number, time: number) {
    // Heavy hovering oscillation (multiple harmonic waves)
    this.hoverOffset = Math.sin(time * 1.8) * 0.35 + Math.cos(time * 0.9) * 0.15;
    this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 3.5 + this.hoverOffset, 4 * delta);

    // Breathing chest expansion
    const breath = (Math.sin(time * 2.2) + 1) * 0.5;
    this.chest.position.z = THREE.MathUtils.lerp(this.chest.position.z, breath * 0.12, 3 * delta);
    this.reactorPulse = 0.8 + breath * 0.4;
    this.reactorCore.scale.setScalar(this.reactorPulse);

    // Torso subtle sway
    this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.04, 3 * delta);
    this.torso.rotation.z = THREE.MathUtils.lerp(this.torso.rotation.z, Math.sin(time * 1.2) * 0.03, 3 * delta);

    // Head tracks level
    this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, -0.05, 3 * delta);

    // Arms in heavy defensive rest
    this.leftUpperArm.rotation.x = THREE.MathUtils.lerp(this.leftUpperArm.rotation.x, 0.25, 4 * delta);
    this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, 0.6, 4 * delta);

    this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, 0.25, 4 * delta);
    this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.6, 4 * delta);
  }

  private animateTelegraph(delta: number) {
    const progress = Math.min(1.0, this.stateTimer / this.telegraphDuration);
    // Exponential wind-up ease
    const ease = Math.pow(progress, 2.5);

    // Colossus draws back its right arm high into the sky!
    this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, -2.4, 6 * delta);
    this.rightUpperArm.rotation.z = THREE.MathUtils.lerp(this.rightUpperArm.rotation.z, 0.5, 6 * delta);
    this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 1.8, 6 * delta);

    // Torso twists back to accumulate momentum
    this.torso.rotation.y = THREE.MathUtils.lerp(this.torso.rotation.y, 0.45, 6 * delta);
    this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, -0.22, 6 * delta);
    this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 4.2, 5 * delta);

    // Head tilts down to glare at victim
    this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, 0.35, 6 * delta);

    // Reactor flares with emergency crimson power
    this.reactorCore.scale.setScalar(1.2 + ease * 0.8);
    this.reactorGlowMat.color.setRGB(1.0, 0.2 + ease * 0.6, 0.2);
  }

  private animateSlam(delta: number, onImpact?: () => void) {
    // Explosive downward smash!
    this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, 1.65, 28 * delta);
    this.rightUpperArm.rotation.z = THREE.MathUtils.lerp(this.rightUpperArm.rotation.z, -0.15, 28 * delta);
    this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.25, 28 * delta);

    // Torso crunches downward
    this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.8, 26 * delta);
    this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.38, 26 * delta);
    this.torso.rotation.y = THREE.MathUtils.lerp(this.torso.rotation.y, -0.15, 26 * delta);

    // Trigger impact event once upon reaching ground
    if (this.stateTimer < delta * 1.5 && onImpact) {
      onImpact();
    }
  }

  private animateRecovery(delta: number) {
    // Slow hydraulic hiss reset
    this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, 0.3, 3 * delta);
    this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.7, 3 * delta);
    this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 3.5, 3 * delta);
    this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.0, 3 * delta);
    this.torso.rotation.y = THREE.MathUtils.lerp(this.torso.rotation.y, 0.0, 3 * delta);
    this.reactorCore.scale.setScalar(1.0);
    this.reactorGlowMat.color.setHex(0xef4444);
  }

  private animateStunned(delta: number, time: number) {
    // Mechanical breakdown: head drops, limbs hang limp, sparks
    this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, 0.65, 5 * delta);
    this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 2.2, 5 * delta);
    this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.28, 5 * delta);

    // Limbs hang loose
    this.leftUpperArm.rotation.x = THREE.MathUtils.lerp(this.leftUpperArm.rotation.x, 0.1, 4 * delta);
    this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, 0.1, 4 * delta);
    this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, 0.1, 4 * delta);
    this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.1, 4 * delta);

    // Shudder jitter
    const jitter = Math.sin(time * 30) * 0.04;
    this.torso.position.x = jitter;

    // Flickering core
    const flicker = Math.random() > 0.4 ? 0.4 : 1.2;
    this.reactorCore.scale.setScalar(flicker);
  }

  private animateDefeated(delta: number) {
    // Collapse to arena floor
    this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 0.8, 2 * delta);
    this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.85, 2 * delta);
    this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, 0.9, 2 * delta);
    this.reactorCore.scale.setScalar(0.01);
  }

  public triggerAttack() {
    if (this.animState === 'IDLE' || this.animState === 'RECOVERY') {
      this.animState = 'TELEGRAPH';
      this.stateTimer = 0;
    }
  }

  public triggerStun() {
    this.animState = 'STUNNED';
    this.stateTimer = 0;
    setTimeout(() => {
      if (this.animState === 'STUNNED') {
        this.animState = 'IDLE';
        this.stateTimer = 0;
      }
    }, 3200);
  }

  public triggerDefeat() {
    this.animState = 'DEFEATED';
  }

  public getAnimState(): BossAnimState {
    return this.animState;
  }
}
