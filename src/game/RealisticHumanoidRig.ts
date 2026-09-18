import * as THREE from 'three';

export type LocomotionState =
  | 'IDLE'
  | 'WALK'
  | 'SPRINT'
  | 'JUMP_START'
  | 'JUMP_AIR'
  | 'LANDING'
  | 'CINEMATIC_REACH'
  | 'CINEMATIC_AWE';

export interface RigPoseParams {
  speed: number;          // 0 = stationary, ~8 = walk, ~13 = sprint
  isGrounded: boolean;
  verticalVelocity: number;
  turnAngularVelocity: number;
  delta: number;
  time: number;
  reachGesture?: number; // 0 to 1 for activating gateway
  lookAtTarget?: THREE.Vector3;
}

/**
 * RealisticHumanoidRig
 * Articulated skeletal rig with multi-joint legs (thigh, knee, ankle, foot),
 * articulated arms (shoulder, upper arm, elbow, forearm, hand),
 * articulated spine & chest with breathing and counter-twist,
 * multi-segment physics-simulated cloak/cape,
 * and natural locomotion gait cycles (heel strike, knee flex shock absorption, push-off, swing).
 */
export class RealisticHumanoidRig {
  public readonly group: THREE.Group;

  // Skeletal Bones / Groups
  public root: THREE.Group;
  public hips: THREE.Group;
  public spine: THREE.Group;
  public chest: THREE.Group;
  public neck: THREE.Group;
  public head: THREE.Group;

  // Left Leg Chain
  public leftThigh: THREE.Group;
  public leftKnee: THREE.Group;
  public leftAnkle: THREE.Group;

  // Right Leg Chain
  public rightThigh: THREE.Group;
  public rightKnee: THREE.Group;
  public rightAnkle: THREE.Group;

  // Left Arm Chain
  public leftClavicle: THREE.Group;
  public leftUpperArm: THREE.Group;
  public leftElbow: THREE.Group;
  public leftHand: THREE.Group;

  // Right Arm Chain
  public rightClavicle: THREE.Group;
  public rightUpperArm: THREE.Group;
  public rightElbow: THREE.Group;
  public rightHand: THREE.Group;

  // Accessories & FX
  public backpackCore: THREE.Mesh;
  public coreGlowRing1: THREE.Mesh;
  public coreGlowRing2: THREE.Mesh;
  public rightGauntletGlow: THREE.Mesh;
  public cloakSegments: THREE.Group[] = [];

  // Procedural Animation State
  private gaitPhase = 0;
  private currentSpeed = 0;
  private landingRecoil = 0;
  private jumpAnticipation = 0;
  private weightShiftTimer = 0;
  private idleWeightSide = 0; // -1 to 1
  private currentLean = 0;
  private currentBank = 0;
  private wasGrounded = true;

  // Materials
  private armorMat: THREE.MeshStandardMaterial;
  private underArmorMat: THREE.MeshStandardMaterial;
  private goldTrimMat: THREE.MeshStandardMaterial;
  private visorMat: THREE.MeshBasicMaterial;
  private coreMat: THREE.MeshBasicMaterial;
  private cloakMat: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    // High quality PBR materials with subtle physical roughness & metallic response
    this.armorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.75,
    });

    this.underArmorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });

    this.goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.88,
    });

    this.visorMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });

    this.coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
    });

    this.cloakMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    // 1. Root and Pelvis/Hips
    this.root = new THREE.Group();
    this.group.add(this.root);

    this.hips = new THREE.Group();
    this.hips.position.y = 0.96; // Hip joint height above ground
    this.root.add(this.hips);

    const hipsMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.24, 0.36), this.armorMat);
    hipsMesh.castShadow = true;
    this.hips.add(hipsMesh);

    // Belt / Fauld armor plates
    const beltBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.39), this.goldTrimMat);
    this.hips.add(beltBuckle);

    // 2. Spine & Torso
    this.spine = new THREE.Group();
    this.spine.position.y = 0.12;
    this.hips.add(this.spine);

    const spineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.28, 12), this.underArmorMat);
    spineMesh.position.y = 0.14;
    spineMesh.castShadow = true;
    this.spine.add(spineMesh);

    // Chest / Ribcage
    this.chest = new THREE.Group();
    this.chest.position.y = 0.28;
    this.spine.add(this.chest);

    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.44, 0.44), this.armorMat);
    chestMesh.position.y = 0.22;
    chestMesh.castShadow = true;
    this.chest.add(chestMesh);

    // Cuirass gold crest
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.47), this.goldTrimMat);
    crest.position.y = 0.23;
    this.chest.add(crest);

    // 3. Neck & Head
    this.neck = new THREE.Group();
    this.neck.position.y = 0.46;
    this.chest.add(this.neck);

    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 10), this.underArmorMat);
    neckMesh.position.y = 0.06;
    this.neck.add(neckMesh);

    this.head = new THREE.Group();
    this.head.position.y = 0.12;
    this.neck.add(this.head);

    const helmetMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.44), this.armorMat);
    helmetMesh.position.y = 0.18;
    helmetMesh.castShadow = true;
    this.head.add(helmetMesh);

    // Helmet Cheekguards / Crest
    const helmetCrest = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.48, 0.46), this.goldTrimMat);
    helmetCrest.position.set(0, 0.22, -0.02);
    this.head.add(helmetCrest);

    // Visor with glowing aperture
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.1), this.visorMat);
    visor.position.set(0, 0.18, -0.23);
    this.head.add(visor);

    // 4. Backpack Core & Power Conduit
    const packMount = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.4, 0.16), this.underArmorMat);
    packMount.position.set(0, 0.22, 0.28);
    this.chest.add(packMount);

    this.backpackCore = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 16), this.coreMat);
    this.backpackCore.rotation.x = Math.PI / 2;
    this.backpackCore.position.set(0, 0.22, 0.38);
    this.chest.add(this.backpackCore);

    // Revolving Gyroscopic Rings around Backpack Core
    this.coreGlowRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 24), this.goldTrimMat);
    this.coreGlowRing1.position.set(0, 0.22, 0.38);
    this.chest.add(this.coreGlowRing1);

    this.coreGlowRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 24), this.goldTrimMat);
    this.coreGlowRing2.position.set(0, 0.22, 0.38);
    this.chest.add(this.coreGlowRing2);

    // 5. Left Leg Articulation (Hip -> Knee -> Ankle -> Foot)
    this.leftThigh = new THREE.Group();
    this.leftThigh.position.set(-0.19, -0.08, 0);
    this.hips.add(this.leftThigh);

    const leftThighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.46, 0.26), this.armorMat);
    leftThighMesh.position.y = -0.23;
    leftThighMesh.castShadow = true;
    this.leftThigh.add(leftThighMesh);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.set(0, -0.46, 0);
    this.leftThigh.add(this.leftKnee);

    // Knee cap armor
    const leftKneecap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.14), this.goldTrimMat);
    leftKneecap.position.set(0, 0, -0.12);
    this.leftKnee.add(leftKneecap);

    const leftShinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.44, 0.24), this.armorMat);
    leftShinMesh.position.y = -0.22;
    leftShinMesh.castShadow = true;
    this.leftKnee.add(leftShinMesh);

    this.leftAnkle = new THREE.Group();
    this.leftAnkle.position.set(0, -0.44, 0);
    this.leftKnee.add(this.leftAnkle);

    const leftFootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.36), this.armorMat);
    leftFootMesh.position.set(0, -0.06, -0.07);
    leftFootMesh.castShadow = true;
    this.leftAnkle.add(leftFootMesh);

    // 6. Right Leg Articulation
    this.rightThigh = new THREE.Group();
    this.rightThigh.position.set(0.19, -0.08, 0);
    this.hips.add(this.rightThigh);

    const rightThighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.46, 0.26), this.armorMat);
    rightThighMesh.position.y = -0.23;
    rightThighMesh.castShadow = true;
    this.rightThigh.add(rightThighMesh);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.set(0, -0.46, 0);
    this.rightThigh.add(this.rightKnee);

    const rightKneecap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.14), this.goldTrimMat);
    rightKneecap.position.set(0, 0, -0.12);
    this.rightKnee.add(rightKneecap);

    const rightShinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.44, 0.24), this.armorMat);
    rightShinMesh.position.y = -0.22;
    rightShinMesh.castShadow = true;
    this.rightKnee.add(rightShinMesh);

    this.rightAnkle = new THREE.Group();
    this.rightAnkle.position.set(0, -0.44, 0);
    this.rightKnee.add(this.rightAnkle);

    const rightFootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.36), this.armorMat);
    rightFootMesh.position.set(0, -0.06, -0.07);
    rightFootMesh.castShadow = true;
    this.rightAnkle.add(rightFootMesh);

    // 7. Left Arm Articulation (Clavicle/Shoulder -> Upper Arm -> Elbow -> Forearm -> Hand)
    this.leftClavicle = new THREE.Group();
    this.leftClavicle.position.set(-0.4, 0.36, 0);
    this.chest.add(this.leftClavicle);

    // Left Pauldron
    const leftPauldron = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.34), this.goldTrimMat);
    leftPauldron.position.set(-0.06, 0.04, 0);
    this.leftClavicle.add(leftPauldron);

    this.leftUpperArm = new THREE.Group();
    this.leftUpperArm.position.set(-0.04, -0.08, 0);
    this.leftClavicle.add(this.leftUpperArm);

    const leftBicepMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.armorMat);
    leftBicepMesh.position.y = -0.18;
    leftBicepMesh.castShadow = true;
    this.leftUpperArm.add(leftBicepMesh);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.set(0, -0.36, 0);
    this.leftUpperArm.add(this.leftElbow);

    const leftForearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.34, 0.17), this.underArmorMat);
    leftForearmMesh.position.y = -0.17;
    leftForearmMesh.castShadow = true;
    this.leftElbow.add(leftForearmMesh);

    this.leftHand = new THREE.Group();
    this.leftHand.position.set(0, -0.34, 0);
    this.leftElbow.add(this.leftHand);

    const leftGloveMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.16), this.armorMat);
    leftGloveMesh.position.y = -0.07;
    this.leftHand.add(leftGloveMesh);

    // 8. Right Arm Articulation (with Aetheric Gauntlet Rune)
    this.rightClavicle = new THREE.Group();
    this.rightClavicle.position.set(0.4, 0.36, 0);
    this.chest.add(this.rightClavicle);

    const rightPauldron = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.34), this.goldTrimMat);
    rightPauldron.position.set(0.06, 0.04, 0);
    this.rightClavicle.add(rightPauldron);

    this.rightUpperArm = new THREE.Group();
    this.rightUpperArm.position.set(0.04, -0.08, 0);
    this.rightClavicle.add(this.rightUpperArm);

    const rightBicepMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.armorMat);
    rightBicepMesh.position.y = -0.18;
    rightBicepMesh.castShadow = true;
    this.rightUpperArm.add(rightBicepMesh);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.set(0, -0.36, 0);
    this.rightUpperArm.add(this.rightElbow);

    const rightForearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.34, 0.17), this.underArmorMat);
    rightForearmMesh.position.y = -0.17;
    rightForearmMesh.castShadow = true;
    this.rightElbow.add(rightForearmMesh);

    // Aetheric Gauntlet Inlay
    const gauntletCasing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.2), this.goldTrimMat);
    gauntletCasing.position.y = -0.15;
    this.rightElbow.add(gauntletCasing);

    this.rightGauntletGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.24, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
    );
    this.rightGauntletGlow.position.y = -0.15;
    this.rightElbow.add(this.rightGauntletGlow);

    this.rightHand = new THREE.Group();
    this.rightHand.position.set(0, -0.34, 0);
    this.rightElbow.add(this.rightHand);

    const rightGloveMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.16), this.armorMat);
    rightGloveMesh.position.y = -0.07;
    this.rightHand.add(rightGloveMesh);

    // 9. Multi-Segment Dynamic Cloak / Cape
    this.buildDynamicCape();
  }

  private buildDynamicCape() {
    // 4 chained segments for realistic cloth inertia & trailing
    const segmentWidths = [0.58, 0.64, 0.7, 0.74];
    const segmentHeights = [0.28, 0.32, 0.34, 0.36];

    let parentGroup: THREE.Group = this.chest;
    let attachY = 0.38;
    let attachZ = 0.24;

    for (let i = 0; i < 4; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.set(0, attachY, attachZ);
      parentGroup.add(segGroup);
      this.cloakSegments.push(segGroup);

      const geo = new THREE.PlaneGeometry(segmentWidths[i], segmentHeights[i], 2, 1);
      const mesh = new THREE.Mesh(geo, this.cloakMat);
      mesh.position.set(0, -segmentHeights[i] / 2, 0);
      mesh.castShadow = true;
      segGroup.add(mesh);

      // Connect next segment to the bottom of this segment
      parentGroup = segGroup;
      attachY = -segmentHeights[i];
      attachZ = 0;
    }
  }

  /**
   * Update the rig's articulated limbs based on physics, locomotion state, and kinematics
   */
  public update(params: RigPoseParams) {
    const { speed, isGrounded, verticalVelocity, turnAngularVelocity, delta, time, reachGesture = 0, lookAtTarget } = params;

    // Smooth speed transitions
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, speed, 12 * delta);

    // Detect landing impact
    if (isGrounded && !this.wasGrounded && verticalVelocity < -2.0) {
      // Impact proportional to fall velocity
      this.landingRecoil = Math.min(1.0, Math.abs(verticalVelocity) / 14);
    }
    this.wasGrounded = isGrounded;

    // Decay landing recoil
    this.landingRecoil = Math.max(0, this.landingRecoil - 3.8 * delta);

    // Advance gait cycle if moving
    const isMoving = this.currentSpeed > 0.4 && isGrounded;
    const isSprinting = this.currentSpeed > 9.5;
    const strideFreq = isSprinting ? 14.5 : 9.5;

    if (isMoving) {
      this.gaitPhase += delta * strideFreq;
    } else {
      // Settle gait cycle gently back to neutral stance
      this.gaitPhase = THREE.MathUtils.lerp(this.gaitPhase, Math.round(this.gaitPhase / Math.PI) * Math.PI, 8 * delta);
    }

    // Dynamic lean & bank into turns
    const targetBank = turnAngularVelocity * (isSprinting ? 0.32 : 0.18);
    this.currentBank = THREE.MathUtils.lerp(this.currentBank, targetBank, 10 * delta);

    const targetLean = (this.currentSpeed / 13.0) * (isSprinting ? 0.28 : 0.12);
    this.currentLean = THREE.MathUtils.lerp(this.currentLean, targetLean, 8 * delta);

    // Core ring orbital spin
    this.coreGlowRing1.rotation.z += delta * (2.0 + this.currentSpeed * 0.4);
    this.coreGlowRing2.rotation.x += delta * (1.8 + this.currentSpeed * 0.3);

    // --- EVALUATE PROCEDURAL SKELETAL POSES ---

    if (isGrounded) {
      if (isMoving) {
        this.applyLocomotionGait(isSprinting, delta);
      } else {
        this.applyIdleBreathing(time, delta, reachGesture);
      }
    } else {
      this.applyAirPose(verticalVelocity, delta);
    }

    // Apply Landing Recoil compression to hips, knees, and spine
    if (this.landingRecoil > 0.01) {
      const compression = this.landingRecoil * 0.22;
      this.hips.position.y -= compression;
      this.leftKnee.rotation.x += this.landingRecoil * 0.7;
      this.rightKnee.rotation.x += this.landingRecoil * 0.7;
      this.spine.rotation.x += this.landingRecoil * 0.35;
      this.leftUpperArm.rotation.z -= this.landingRecoil * 0.4;
      this.rightUpperArm.rotation.z += this.landingRecoil * 0.4;
    }

    // Apply banking and forward pitch to Root
    this.root.rotation.z = this.currentBank;
    this.root.rotation.x = this.currentLean;

    // Apply Look-At System for head orientation
    this.applyHeadOrientation(lookAtTarget, time);

    // Apply Multi-segment Cape Physics
    this.updateDynamicCape(delta, time, isSprinting);
  }

  /**
   * Realistic multi-joint locomotion gait (heel strike, knee shock absorption, push-off, swing)
   */
  private applyLocomotionGait(isSprinting: boolean, delta: number) {
    const p = this.gaitPhase;
    const strideAmp = isSprinting ? 0.85 : 0.62;

    // Left leg phase (0 to 2*PI), Right leg is 180 degrees (PI) out of phase
    const leftPhase = p;
    const rightPhase = p + Math.PI;

    // 1. Pelvis Vertical Bounce: 2 cycles per gait period! Dips on contact, rises at mid-stance
    const hipBounce = Math.cos(p * 2) * (isSprinting ? 0.06 : 0.035);
    this.hips.position.y = 0.96 - hipBounce;

    // 2. Pelvis Lateral Sway & Roll: shifts toward weight-bearing foot
    const hipSway = Math.sin(p) * (isSprinting ? 0.045 : 0.025);
    this.hips.position.x = hipSway;
    this.hips.rotation.z = -Math.sin(p) * 0.06; // Pelvic roll tilt
    this.hips.rotation.y = Math.sin(p) * 0.12;  // Pelvic twist

    // 3. Spine & Chest Counter-Twist: Torso twists opposite to hips to preserve balance
    this.spine.rotation.y = -Math.sin(p) * 0.16;
    this.chest.rotation.y = -Math.sin(p) * 0.08;

    // 4. Left Leg Articulation
    const leftThighAngle = Math.sin(leftPhase) * strideAmp;
    this.leftThigh.rotation.x = leftThighAngle;

    // Knee bends backward only during the swing phase (when thigh is moving forward)
    // plus slight spring flexion during heel contact
    const leftSwingProgress = Math.cos(leftPhase);
    const leftKneeBend = Math.max(0, leftSwingProgress * (isSprinting ? 1.35 : 0.95)) +
                         Math.max(0, -Math.sin(leftPhase) * 0.25); // shock absorption
    this.leftKnee.rotation.x = leftKneeBend;

    // Ankle / Foot: dorsiflexes up at heel strike, plantarflexes back at push-off
    const leftFootAngle = -Math.sin(leftPhase) * 0.38 + (leftSwingProgress > 0.5 ? 0.25 : -0.15);
    this.leftAnkle.rotation.x = leftFootAngle;

    // 5. Right Leg Articulation
    const rightThighAngle = Math.sin(rightPhase) * strideAmp;
    this.rightThigh.rotation.x = rightThighAngle;

    const rightSwingProgress = Math.cos(rightPhase);
    const rightKneeBend = Math.max(0, rightSwingProgress * (isSprinting ? 1.35 : 0.95)) +
                          Math.max(0, -Math.sin(rightPhase) * 0.25);
    this.rightKnee.rotation.x = rightKneeBend;

    const rightFootAngle = -Math.sin(rightPhase) * 0.38 + (rightSwingProgress > 0.5 ? 0.25 : -0.15);
    this.rightAnkle.rotation.x = rightFootAngle;

    // 6. Arm Swings (oppose leg movements) with natural elbow flexion
    const armSwingAmp = isSprinting ? 0.88 : 0.54;

    // Left arm swings opposite to left leg (in sync with right leg)
    const leftArmAngle = Math.sin(rightPhase) * armSwingAmp;
    this.leftUpperArm.rotation.x = leftArmAngle;
    // Elbow naturally flexes more when swinging forward!
    const leftElbowBend = Math.max(0.2, (leftArmAngle < 0 ? -leftArmAngle * 1.4 : 0.2));
    this.leftElbow.rotation.x = isSprinting ? leftElbowBend + 0.4 : leftElbowBend;
    this.leftUpperArm.rotation.z = -0.12; // Natural arm clearance from torso

    // Right arm swings opposite to right leg
    const rightArmAngle = Math.sin(leftPhase) * armSwingAmp;
    this.rightUpperArm.rotation.x = rightArmAngle;
    const rightElbowBend = Math.max(0.2, (rightArmAngle < 0 ? -rightArmAngle * 1.4 : 0.2));
    this.rightElbow.rotation.x = isSprinting ? rightElbowBend + 0.4 : rightElbowBend;
    this.rightUpperArm.rotation.z = 0.12;
  }

  /**
   * Realistic idle animation with deep diaphragmatic breathing and weight shifts
   */
  private applyIdleBreathing(time: number, delta: number, reachGesture: number) {
    // 1. Natural diaphragmatic breathing cycle (period ~ 2.2s)
    const breath = Math.sin(time * 2.8);
    const breathChest = (breath + 1) * 0.5; // 0 to 1

    this.hips.position.y = THREE.MathUtils.lerp(this.hips.position.y, 0.96 + breath * 0.008, 6 * delta);
    this.hips.position.x = THREE.MathUtils.lerp(this.hips.position.x, this.idleWeightSide * 0.025, 3 * delta);
    this.hips.rotation.z = THREE.MathUtils.lerp(this.hips.rotation.z, -this.idleWeightSide * 0.035, 3 * delta);

    // Spine & Chest expand on inhale, contract on exhale
    this.spine.rotation.x = THREE.MathUtils.lerp(this.spine.rotation.x, -0.04 - breathChest * 0.03, 5 * delta);
    this.chest.rotation.x = THREE.MathUtils.lerp(this.chest.rotation.x, 0.05 + breathChest * 0.04, 5 * delta);
    this.chest.scale.set(1.0 + breathChest * 0.025, 1.0 + breathChest * 0.015, 1.0 + breathChest * 0.03);

    // Subtle shifting of weight between feet every 5 seconds
    this.weightShiftTimer += delta;
    if (this.weightShiftTimer > 5.5) {
      this.weightShiftTimer = 0;
      this.idleWeightSide = (Math.random() - 0.5) * 2; // -1 to 1
    }

    // Legs in relaxed idle stance
    this.leftThigh.rotation.x = THREE.MathUtils.lerp(this.leftThigh.rotation.x, 0.05, 8 * delta);
    this.leftKnee.rotation.x = THREE.MathUtils.lerp(this.leftKnee.rotation.x, 0.08, 8 * delta);
    this.leftAnkle.rotation.x = THREE.MathUtils.lerp(this.leftAnkle.rotation.x, -0.05, 8 * delta);

    this.rightThigh.rotation.x = THREE.MathUtils.lerp(this.rightThigh.rotation.x, -0.02, 8 * delta);
    this.rightKnee.rotation.x = THREE.MathUtils.lerp(this.rightKnee.rotation.x, 0.06, 8 * delta);
    this.rightAnkle.rotation.x = THREE.MathUtils.lerp(this.rightAnkle.rotation.x, -0.03, 8 * delta);

    // Arms relaxed at sides with natural elbow crook
    this.leftUpperArm.rotation.x = THREE.MathUtils.lerp(this.leftUpperArm.rotation.x, 0.08 + breath * 0.02, 6 * delta);
    this.leftUpperArm.rotation.z = THREE.MathUtils.lerp(this.leftUpperArm.rotation.z, -0.15, 6 * delta);
    this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, 0.28, 6 * delta);

    if (reachGesture > 0.01) {
      // Cinematic / interaction arm reach gesture
      this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, -1.68 * reachGesture, 8 * delta);
      this.rightUpperArm.rotation.z = THREE.MathUtils.lerp(this.rightUpperArm.rotation.z, -0.32 * reachGesture, 8 * delta);
      this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.45 * reachGesture, 8 * delta);
      this.rightHand.rotation.y = THREE.MathUtils.lerp(this.rightHand.rotation.y, 0.5 * reachGesture, 8 * delta);
      this.rightGauntletGlow.scale.setScalar(1.0 + reachGesture * 1.8);
    } else {
      this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, 0.08 + breath * 0.02, 6 * delta);
      this.rightUpperArm.rotation.z = THREE.MathUtils.lerp(this.rightUpperArm.rotation.z, 0.15, 6 * delta);
      this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.28, 6 * delta);
      this.rightGauntletGlow.scale.setScalar(1.0);
    }
  }

  /**
   * In-Air jump & falling pose
   */
  private applyAirPose(verticalVelocity: number, delta: number) {
    const isAscending = verticalVelocity > 0;

    // When ascending: legs trail behind, arms raise slightly
    // When descending: legs extend slightly forward preparing for touchdown
    const legPitch = isAscending ? -0.32 : 0.25;
    const kneeBend = isAscending ? 0.65 : 0.35;

    this.leftThigh.rotation.x = THREE.MathUtils.lerp(this.leftThigh.rotation.x, legPitch, 10 * delta);
    this.rightThigh.rotation.x = THREE.MathUtils.lerp(this.rightThigh.rotation.x, legPitch * 0.8, 10 * delta);

    this.leftKnee.rotation.x = THREE.MathUtils.lerp(this.leftKnee.rotation.x, kneeBend, 10 * delta);
    this.rightKnee.rotation.x = THREE.MathUtils.lerp(this.rightKnee.rotation.x, kneeBend * 1.1, 10 * delta);

    // Arms splay outward and backward for aerodynamic stabilization
    this.leftUpperArm.rotation.x = THREE.MathUtils.lerp(this.leftUpperArm.rotation.x, -0.45, 8 * delta);
    this.leftUpperArm.rotation.z = THREE.MathUtils.lerp(this.leftUpperArm.rotation.z, -0.48, 8 * delta);
    this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, 0.65, 8 * delta);

    this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, -0.45, 8 * delta);
    this.rightUpperArm.rotation.z = THREE.MathUtils.lerp(this.rightUpperArm.rotation.z, 0.48, 8 * delta);
    this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.65, 8 * delta);

    // Torso arches slightly during jump
    this.spine.rotation.x = THREE.MathUtils.lerp(this.spine.rotation.x, isAscending ? -0.15 : 0.1, 8 * delta);
  }

  /**
   * Head look-at orientation and subtle ambient glances
   */
  private applyHeadOrientation(lookAtTarget?: THREE.Vector3, time: number = 0) {
    if (lookAtTarget) {
      // Track target in world space
      const worldPos = new THREE.Vector3();
      this.head.getWorldPosition(worldPos);
      const toTarget = lookAtTarget.clone().sub(worldPos).normalize();

      // Convert to local rotation
      const yaw = Math.atan2(-toTarget.x, -toTarget.z) - this.group.rotation.y;
      const pitch = Math.asin(THREE.MathUtils.clamp(toTarget.y, -0.7, 0.7));

      this.head.rotation.y = THREE.MathUtils.clamp(yaw, -0.75, 0.75);
      this.head.rotation.x = THREE.MathUtils.clamp(-pitch, -0.65, 0.55);
    } else {
      // Natural subtle idle glance
      const glanceX = Math.sin(time * 0.8) * 0.08;
      const glanceY = Math.cos(time * 0.5) * 0.12;
      this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, glanceX, 0.1);
      this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, glanceY, 0.1);
    }
  }

  /**
   * Physics-driven 4-segment dynamic cape simulation
   */
  private updateDynamicCape(delta: number, time: number, isSprinting: boolean) {
    if (this.cloakSegments.length === 0) return;

    // Movement drag angle
    const speedRatio = this.currentSpeed / 13.0;
    const baseTrailAngle = 0.18 + speedRatio * (isSprinting ? 0.85 : 0.52);

    // Wind turbulence & flutter
    const flutterFreq = 12.0 + this.currentSpeed * 1.5;
    const flutterAmp = 0.08 + speedRatio * 0.18;

    this.cloakSegments.forEach((segment, index) => {
      const segLag = index * 0.14;
      const flutter = Math.sin(time * flutterFreq - segLag) * flutterAmp;
      const sway = Math.cos(time * (flutterFreq * 0.6) - segLag) * (flutterAmp * 0.6);

      const targetPitch = (baseTrailAngle * (0.85 + index * 0.35)) + flutter;
      segment.rotation.x = THREE.MathUtils.lerp(segment.rotation.x, targetPitch, 14 * delta);
      segment.rotation.z = THREE.MathUtils.lerp(segment.rotation.z, sway, 12 * delta);
    });
  }

  /**
   * Set color of power core (sun, moon, star keystone power)
   */
  public setCoreColor(hexColor: number) {
    (this.backpackCore.material as THREE.MeshBasicMaterial).color.setHex(hexColor);
    (this.rightGauntletGlow.material as THREE.MeshBasicMaterial).color.setHex(hexColor);
  }
}
