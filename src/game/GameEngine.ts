import * as THREE from 'three';
import { GamePhase, Inventory, PlayerStats, CinematicSceneId, CameraDirectorMode } from '../types';
import { CinematicDirector } from './CinematicDirector';
import { sound } from '../audio';
import { RealisticHumanoidRig } from './RealisticHumanoidRig';
import { RealisticBossRig } from './RealisticBossRig';
import { RealisticGuideRig } from './RealisticGuideRig';
import { RealisticFXSystem } from './RealisticFXSystem';

export interface GameEngineCallbacks {
  onPhaseChange: (phase: GamePhase) => void;
  onOpenDialogue: () => void;
  onOpenPuzzle: (level: 1 | 2 | 3) => void;
  onLockedNotice: (msg: string) => void;
  onBossStateChange: (state: { health: number; maxHealth: number; phase: string; attackName: string }) => void;
  onPlayerStatsChange: (stats: PlayerStats) => void;
  onCinematicTimeUpdate?: (time: number, sceneId: CinematicSceneId, isPlaying: boolean) => void;
  onCinematicComplete?: () => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animationFrameId: number | null = null;

  // Realistic Rigs & Animation Systems
  private humanoidRig!: RealisticHumanoidRig;
  private bossRig!: RealisticBossRig;
  private guideRig!: RealisticGuideRig;
  private fxSystem!: RealisticFXSystem;
  private isSprinting = false;
  private previousPlayerPos = new THREE.Vector3();
  private lastFootstepTime = 0;
  private cameraBobPhase = 0;

  // Player
  private playerGroup: THREE.Group;
  private playerMesh: THREE.Group;
  private playerLimbs: {
    leftLeg: THREE.Object3D;
    rightLeg: THREE.Object3D;
    leftArm: THREE.Object3D;
    rightArm: THREE.Object3D;
    head: THREE.Object3D;
    backpackCore: THREE.Mesh;
  };
  private cloakMesh!: THREE.Mesh;
  private rightGauntletGlow!: THREE.Mesh;
  private playerVelocity = new THREE.Vector3();
  private isGrounded = true;
  private playerStats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    stamina: 100,
    isGrounded: true,
    position: [0, 1.5, 20]
  };

  // Camera Orbit Controls
  private cameraOffset = new THREE.Vector3(0, 3.2, 6.5);
  private cameraYaw = 0;
  private cameraPitch = 0.25;
  private isDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;

  // Cinematic Intro System (30-second sequence)
  private cinematicTime = 0;
  private isCinematicPlaying = true;
  private playbackSpeed = 1.0;
  private cameraDirectorMode: CameraDirectorMode = 'CINEMATIC';

  // Gateway Doors & Dynamic FX
  private leftDoorGroup!: THREE.Group;
  private rightDoorGroup!: THREE.Group;
  private gateRuneSigil!: THREE.Mesh;
  private gateShockwave!: THREE.Mesh;
  private gateGodRays!: THREE.Mesh;
  private torchLights: THREE.PointLight[] = [];
  private torchFlames: THREE.Mesh[] = [];

  // Guide
  private guideMesh!: THREE.Group;
  private guideRings: THREE.Mesh[] = [];
  private guideBeam!: THREE.Mesh;

  // Input
  private keysPressed: { [key: string]: boolean } = {};

  // World Elements
  private colliders: THREE.Box3[] = [];
  private platforms: { xMin: number; xMax: number; zMin: number; zMax: number; y: number }[] = [];
  private bossMesh!: THREE.Group;
  private bossShockwaves: { mesh: THREE.Mesh; radius: number; maxRadius: number; speed: number }[] = [];
  private glowingRings: THREE.Mesh[] = [];
  private starsParticles!: THREE.Points;

  // Gate Meshes
  private gatewayBarrier!: THREE.Mesh;
  private gate2Barrier!: THREE.Mesh;
  private gate3Barrier!: THREE.Mesh;
  private bossBarrier!: THREE.Mesh;

  // State cache
  private currentPhase: GamePhase = GamePhase.CINEMATIC_INTRO;
  private inventory: Inventory = {
    keys: { sunKey: false, moonKey: false, starKey: false },
    resources: { aetherCore: 0, resonantCrystal: 0, titanCatalyst: 0 }
  };

  // Boss Logic
  private bossHealth = 100;
  private bossMaxHealth = 100;
  private bossPhase: 'idle' | 'telegraph' | 'attack' | 'stunned' | 'defeated' = 'idle';
  private bossTimer = 0;
  private bossAttackName = 'Chrono Pulse';

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Scene & Fog (Ethereal Cosmic Sky - STRICTLY NO FOREST)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e1a);
    this.scene.fog = new THREE.FogExp2(0x0e1424, 0.009);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Realistic Particle & Dynamic FX System
    this.fxSystem = new RealisticFXSystem(this.scene);

    // Build World & Player
    this.playerGroup = new THREE.Group();
    this.playerLimbs = this.createPlayerCharacter();
    this.playerMesh = this.playerGroup;
    this.scene.add(this.playerGroup);

    this.setupLighting();
    this.buildCitadelWorld();
    this.buildGuideCharacter();
    this.buildBossConstruct();
    this.createCosmicAtmosphere();

    // Event Listeners
    this.bindEvents();

    // Initial cinematic positioning (at t=0)
    const initialState = CinematicDirector.evaluate(0);
    this.playerGroup.position.copy(initialState.playerPos);
    this.camera.position.copy(initialState.camPos);
    this.camera.lookAt(initialState.camLookAt);

    // Start loop
    this.startLoop();

    // Start cinematic audio
    sound.startCinematicAudio();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    this.scene.add(ambientLight);

    // Primary Celestial Key Sun
    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 280;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    this.scene.add(sunLight);

    // Fill Cool Moon Light from opposite angle
    const moonLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    moonLight.position.set(-40, 50, -80);
    this.scene.add(moonLight);
  }

  private createPlayerCharacter() {
    this.humanoidRig = new RealisticHumanoidRig();
    this.playerGroup.add(this.humanoidRig.group);

    // Provide legacy references for backward compatibility
    this.cloakMesh = (this.humanoidRig.cloakSegments[0]?.children[0] as THREE.Mesh) || new THREE.Mesh();
    this.rightGauntletGlow = this.humanoidRig.rightGauntletGlow;

    return {
      leftLeg: this.humanoidRig.leftThigh,
      rightLeg: this.humanoidRig.rightThigh,
      leftArm: this.humanoidRig.leftUpperArm,
      rightArm: this.humanoidRig.rightUpperArm,
      head: this.humanoidRig.head,
      backpackCore: this.humanoidRig.backpackCore
    };
  }

  private createTextSprite(text: string, subtitle?: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Rounded container background
      ctx.fillStyle = 'rgba(10, 15, 30, 0.92)';
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 140, 24);
      ctx.fill();

      // Border glow
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, subtitle ? 62 : 80);

      // Subtitle
      if (subtitle) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(subtitle, 256, 112);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(6, 2, 1);
    return sprite;
  }

  private buildCitadelWorld() {
    // Marble Material (White/Off-white ancient stone)
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.45,
      metalness: 0.15
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.65
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.85
    });

    const energyCyanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });

    const runeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });

    // 1. STARTING PLAZA (z: 10 to 30) - Ancient weathered marble flagstones
    const startPlazaGeo = new THREE.CylinderGeometry(16, 17, 3, 32);
    const startPlaza = new THREE.Mesh(startPlazaGeo, marbleMat);
    startPlaza.position.set(0, -1.5, 20);
    startPlaza.receiveShadow = true;
    this.scene.add(startPlaza);

    // Inset decorative runic circle on arrival plaza
    const ringGeo = new THREE.RingGeometry(11, 12.2, 36);
    const runicRing = new THREE.Mesh(ringGeo, energyCyanMat);
    runicRing.rotation.x = -Math.PI / 2;
    runicRing.position.set(0, 0.03, 20);
    this.scene.add(runicRing);

    this.platforms.push({ xMin: -14, xMax: 14, zMin: 6, zMax: 34, y: 0 });

    // Build Ancient Weathered Stone Ruins and Slabs (NO FOREST)
    this.createAncientRuins();

    // Colossal Carved Stone Sentinel Statues flanking the avenue
    this.createSentinelStatue(-7.5, 0, 22, Math.PI / 4, 1.2);
    this.createSentinelStatue(7.5, 0, 22, -Math.PI / 4, 1.2);
    this.createSentinelStatue(-7.8, 0, 10, Math.PI / 3, 1.35);
    this.createSentinelStatue(7.8, 0, 10, -Math.PI / 3, 1.35);

    // 6 Flaming Stone Torch Braziers with dynamic point lights
    this.createTorchBrazier(-5.2, 0, 20);
    this.createTorchBrazier(5.2, 0, 20);
    this.createTorchBrazier(-5.2, 0, 12);
    this.createTorchBrazier(5.2, 0, 12);
    this.createTorchBrazier(-5.2, 0.4, 4);
    this.createTorchBrazier(5.2, 0.4, 4);

    // Ceremonial Stone Stairs ascending toward the Grand Gateway
    for (let step = 0; step < 5; step++) {
      const stepZ = 12 - step * 2.2;
      const stepY = 0.12 * (step + 1);
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(11 - step * 0.4, 0.24, 2.4),
        marbleMat
      );
      stepMesh.position.set(0, stepY - 0.12, stepZ);
      stepMesh.receiveShadow = true;
      this.scene.add(stepMesh);
      this.platforms.push({ xMin: -5, xMax: 5, zMin: stepZ - 1.2, zMax: stepZ + 1.2, y: stepY });
    }

    // 2. THE GRAND GATEWAY (z: 0)
    // Left & Right Towering Monumental Pillars
    const gatePillarGeo = new THREE.BoxGeometry(3.6, 16, 3.6);
    const leftPillar = new THREE.Mesh(gatePillarGeo, darkTrimMat);
    leftPillar.position.set(-6.5, 8, 0);
    leftPillar.castShadow = true;
    this.scene.add(leftPillar);

    const rightPillar = new THREE.Mesh(gatePillarGeo, darkTrimMat);
    rightPillar.position.set(6.5, 8, 0);
    rightPillar.castShadow = true;
    this.scene.add(rightPillar);

    // Golden Capital Trims on Pillars
    const pCapLeft = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 4.2), goldMat);
    pCapLeft.position.set(-6.5, 15.6, 0);
    this.scene.add(pCapLeft);

    const pCapRight = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 4.2), goldMat);
    pCapRight.position.set(6.5, 15.6, 0);
    this.scene.add(pCapRight);

    // Massive Arch Header / Architrave
    const archHeader = new THREE.Mesh(new THREE.BoxGeometry(17.4, 3.2, 4.0), marbleMat);
    archHeader.position.set(0, 16.6, 0);
    archHeader.castShadow = true;
    this.scene.add(archHeader);

    // Golden Celestial Arch Crest
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.8, 12), goldMat);
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, 19.2, 0);
    this.scene.add(crest);

    // Central Floating Gate Sigil (Pulses and expands upon activation)
    const sigilGeo = new THREE.TorusGeometry(2.6, 0.18, 16, 48);
    this.gateRuneSigil = new THREE.Mesh(sigilGeo, runeMat);
    this.gateRuneSigil.position.set(0, 7.8, 0);
    this.scene.add(this.gateRuneSigil);

    // Gate Shockwave Ring (Flat on ground, expands upon door activation)
    const shockwaveGeo = new THREE.RingGeometry(0.8, 1.3, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.gateShockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    this.gateShockwave.rotation.x = -Math.PI / 2;
    this.gateShockwave.position.set(0, 0.08, 0);
    this.scene.add(this.gateShockwave);

    // Gate Volumetric God-Rays Light Shaft (beaming through opening doors)
    const godRayGeo = new THREE.CylinderGeometry(1.5, 7.5, 24, 24, 1, true);
    const godRayMat = new THREE.MeshBasicMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.gateGodRays = new THREE.Mesh(godRayGeo, godRayMat);
    this.gateGodRays.rotation.x = Math.PI / 2;
    this.gateGodRays.position.set(0, 7.5, -12);
    this.scene.add(this.gateGodRays);

    // --- GIANT HINGED MONOLITHIC GATEWAY DOORS ---
    // Left Door Group: Pivot hinged at outer post (x = -4.6, y = 0, z = 0)
    this.leftDoorGroup = new THREE.Group();
    this.leftDoorGroup.position.set(-4.6, 0, 0);

    const doorPanelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.7
    });

    // Left Door slab (extends from pivot at 0 to +4.6)
    const doorGeo = new THREE.BoxGeometry(4.55, 14.8, 1.1);
    const leftDoorMesh = new THREE.Mesh(doorGeo, doorPanelMat);
    leftDoorMesh.position.set(2.28, 7.4, 0);
    leftDoorMesh.castShadow = true;
    this.leftDoorGroup.add(leftDoorMesh);

    // Left Door Gold Trim Frame & Inset Carved Runes
    const leftDoorTrim = new THREE.Mesh(new THREE.BoxGeometry(4.3, 14.2, 1.16), goldMat);
    leftDoorTrim.position.set(2.28, 7.4, 0);
    this.leftDoorGroup.add(leftDoorTrim);

    const leftInnerPanel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 13.0, 1.22), doorPanelMat);
    leftInnerPanel.position.set(2.28, 7.4, 0);
    this.leftDoorGroup.add(leftInnerPanel);

    // Glowing Runic Inlay Strips on Left Door
    for (let r = 0; r < 4; r++) {
      const runeStrip = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 1.26), runeMat);
      runeStrip.position.set(2.28, 3.5 + r * 2.8, 0);
      this.leftDoorGroup.add(runeStrip);
    }
    this.scene.add(this.leftDoorGroup);

    // Right Door Group: Pivot hinged at outer post (x = +4.6, y = 0, z = 0)
    this.rightDoorGroup = new THREE.Group();
    this.rightDoorGroup.position.set(4.6, 0, 0);

    // Right Door slab (extends from pivot at 0 to -4.6)
    const rightDoorMesh = new THREE.Mesh(doorGeo, doorPanelMat);
    rightDoorMesh.position.set(-2.28, 7.4, 0);
    rightDoorMesh.castShadow = true;
    this.rightDoorGroup.add(rightDoorMesh);

    const rightDoorTrim = new THREE.Mesh(new THREE.BoxGeometry(4.3, 14.2, 1.16), goldMat);
    rightDoorTrim.position.set(-2.28, 7.4, 0);
    this.rightDoorGroup.add(rightDoorTrim);

    const rightInnerPanel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 13.0, 1.22), doorPanelMat);
    rightInnerPanel.position.set(-2.28, 7.4, 0);
    this.rightDoorGroup.add(rightInnerPanel);

    // Glowing Runic Inlay Strips on Right Door
    for (let r = 0; r < 4; r++) {
      const runeStrip = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 1.26), runeMat);
      runeStrip.position.set(-2.28, 3.5 + r * 2.8, 0);
      this.rightDoorGroup.add(runeStrip);
    }
    this.scene.add(this.rightDoorGroup);

    // 3. THE LONG ANCIENT BRIDGE (z: -2 to -68)
    // Long ancient bridge spanning into the mysterious cosmic abyss
    const bridgeLength = 66;
    const bridgeWidth = 8.5;
    const bridgeGeo = new THREE.BoxGeometry(bridgeWidth, 2.5, bridgeLength);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, marbleMat);
    bridgeMesh.position.set(0, -1.25, -36);
    bridgeMesh.receiveShadow = true;
    this.scene.add(bridgeMesh);

    this.platforms.push({ xMin: -bridgeWidth / 2, xMax: bridgeWidth / 2, zMin: -68, zMax: -2, y: 0 });

    // Bridge Golden Guardrails
    const railGeo = new THREE.BoxGeometry(0.35, 0.6, bridgeLength);
    const leftRail = new THREE.Mesh(railGeo, goldMat);
    leftRail.position.set(-3.9, 1.4, -36);
    this.scene.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, goldMat);
    rightRail.position.set(3.9, 1.4, -36);
    this.scene.add(rightRail);

    // Bridge Balustrade Posts & Glowing Lanterns
    for (let z = -6; z >= -66; z -= 8) {
      const postLeft = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 0.6), darkTrimMat);
      postLeft.position.set(-3.9, 1.0, z);
      this.scene.add(postLeft);

      const lampLeft = new THREE.Mesh(new THREE.OctahedronGeometry(0.38), energyCyanMat);
      lampLeft.position.set(-3.9, 2.3, z);
      this.scene.add(lampLeft);

      const postRight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 0.6), darkTrimMat);
      postRight.position.set(3.9, 1.0, z);
      this.scene.add(postRight);

      const lampRight = new THREE.Mesh(new THREE.OctahedronGeometry(0.38), energyCyanMat);
      lampRight.position.set(3.9, 2.3, z);
      this.scene.add(lampRight);
    }

    // Colossal Guardian Statues lining the bridge in the abyss
    this.createSentinelStatue(-12.0, -12, -22, Math.PI / 2, 2.2);
    this.createSentinelStatue(12.0, -12, -22, -Math.PI / 2, 2.2);
    this.createSentinelStatue(-14.0, -14, -48, Math.PI / 2, 2.6);
    this.createSentinelStatue(14.0, -14, -48, -Math.PI / 2, 2.6);

    // Distant Citadel spires and beacons in the adventure world
    const citadelBeacon = new THREE.PointLight(0x38bdf8, 4.0, 160);
    citadelBeacon.position.set(0, 24, -120);
    this.scene.add(citadelBeacon);

    // Visible Destination Area Lighting (At bridge terminus, illuminating entry to Puzzle Area)
    const bridgeEndLight = new THREE.PointLight(0x38bdf8, 2.5, 45);
    bridgeEndLight.position.set(0, 7, -66);
    this.scene.add(bridgeEndLight);

    // 4. CENTRAL PUZZLE NEXUS (z: -65 to -155)
    // Massive circular celestial plaza
    const nexusRadius = 38;
    const nexusGeo = new THREE.CylinderGeometry(nexusRadius, nexusRadius + 2, 4, 48);
    const nexusMesh = new THREE.Mesh(nexusGeo, marbleMat);
    nexusMesh.position.set(0, -2, -110);
    nexusMesh.receiveShadow = true;
    this.scene.add(nexusMesh);

    this.platforms.push({ xMin: -36, xMax: 36, zMin: -146, zMax: -74, y: 0 });

    // --- "PUZZLE AREA" WELCOME ARCH & SIGN ---
    // Prominent archway immediately as the player finishes crossing the bridge
    const archMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 });
    const archPillarLeft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 9, 1.6), archMat);
    archPillarLeft.position.set(-7, 4.5, -67);
    this.scene.add(archPillarLeft);

    const archPillarRight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 9, 1.6), archMat);
    archPillarRight.position.set(7, 4.5, -67);
    this.scene.add(archPillarRight);

    const archLintel = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, 2), goldMat);
    archLintel.position.set(0, 9, -67);
    this.scene.add(archLintel);

    // 3D "PUZZLE AREA" Signboard
    const puzzleAreaSign = this.createTextSprite('PUZZLE AREA', 'THE TRIALS OF THE ARCHITECTS');
    puzzleAreaSign.position.set(0, 11.2, -67);
    this.scene.add(puzzleAreaSign);

    // Center Monument / Compass
    const nexusCenterRing = new THREE.Mesh(new THREE.RingGeometry(18, 19, 48), energyCyanMat);
    nexusCenterRing.rotation.x = -Math.PI / 2;
    nexusCenterRing.position.set(0, 0.03, -110);
    this.scene.add(nexusCenterRing);

    // Surrounding architectural pillars (Citadel aesthetic, strictly no trees)
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 5) {
      const px = Math.cos(angle) * 33;
      const pz = -110 + Math.sin(angle) * 33;
      this.createPillar(px, 0, pz, 12);
    }

    // --- PUZZLE 1 STATION (West Wing: x = -20, z = -105) ---
    this.createPuzzleStation(-20, -105, 1, 'Trial of Power Matrix', 0x38bdf8);

    // --- PUZZLE 2 STATION (North Wing: x = 0, z = -135) ---
    this.createPuzzleStation(0, -135, 2, 'Trial of Harmonic Resonance', 0xa855f7);

    // --- PUZZLE 3 STATION (East Wing: x = 20, z = -105) ---
    this.createPuzzleStation(20, -105, 3, 'Trial of Hydraulic Pressure', 0xf59e0b);

    // Gate 2 Barrier (Energy shield blocking path to North Wing until Key 1 collected)
    const barrierGeo = new THREE.BoxGeometry(14, 6, 1);
    this.gate2Barrier = new THREE.Mesh(barrierGeo, new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55
    }));
    this.gate2Barrier.position.set(0, 3, -122);
    this.scene.add(this.gate2Barrier);

    // Gate 3 Barrier (Energy shield blocking path to East Wing until Key 2 collected)
    this.gate3Barrier = new THREE.Mesh(new THREE.BoxGeometry(1, 6, 14), new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55
    }));
    this.gate3Barrier.position.set(10, 3, -105);
    this.scene.add(this.gate3Barrier);

    // 5. BRIDGE TO FINAL BOSS ARENA (z: -146 to -178)
    const bossBridge = new THREE.Mesh(new THREE.BoxGeometry(7, 2, 32), marbleMat);
    bossBridge.position.set(0, -1, -162);
    bossBridge.receiveShadow = true;
    this.scene.add(bossBridge);
    this.platforms.push({ xMin: -3.5, xMax: 3.5, zMin: -178, zMax: -146, y: 0 });

    // Final Boss Archway & Barrier
    this.bossBarrier = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 1), new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.6
    }));
    this.bossBarrier.position.set(0, 4, -177);
    this.scene.add(this.bossBarrier);

    // 6. FINAL BOSS ARENA (z: -180 to -240)
    const bossArenaRadius = 26;
    const bossArena = new THREE.Mesh(
      new THREE.CylinderGeometry(bossArenaRadius, bossArenaRadius + 2, 4, 48),
      darkTrimMat
    );
    bossArena.position.set(0, -2, -210);
    bossArena.receiveShadow = true;
    this.scene.add(bossArena);
    this.platforms.push({ xMin: -bossArenaRadius + 2, xMax: bossArenaRadius - 2, zMin: -234, zMax: -186, y: 0 });

    // Boss Arena Glowing Runes
    const bossRing = new THREE.Mesh(new THREE.RingGeometry(18, 20, 48), new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.7
    }));
    bossRing.rotation.x = -Math.PI / 2;
    bossRing.position.set(0, 0.03, -210);
    this.scene.add(bossRing);
  }

  private createPillar(x: number, y: number, z: number, height: number) {
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });

    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(x, y, z);

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), marbleMat);
    base.position.y = 0.6;
    pillarGroup.add(base);

    // Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, height, 16), marbleMat);
    shaft.position.y = height / 2 + 1.2;
    shaft.castShadow = true;
    pillarGroup.add(shaft);

    // Capital
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1, 2.2), goldMat);
    cap.position.y = height + 1.7;
    pillarGroup.add(cap);

    this.scene.add(pillarGroup);
  }

  private createPuzzleStation(x: number, z: number, level: 1 | 2 | 3, title: string, colorHex: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Pedestal Base
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 1.4, 16), pedestalMat);
    base.position.y = 0.7;
    group.add(base);

    // Glowing Interface Terminal
    const terminalMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const terminal = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.2), terminalMat);
    terminal.position.y = 1.5;
    terminal.rotation.x = -Math.PI / 6;
    group.add(terminal);

    // Floating Rotating Crystal Sigil above pedestal
    const crystalGeo = new THREE.OctahedronGeometry(0.7, 0);
    const crystal = new THREE.Mesh(crystalGeo, new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.5
    }));
    crystal.position.y = 3.2;
    group.add(crystal);

    // Beacon Beam
    const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 14, 8);
    const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.35
    }));
    beam.position.y = 8;
    group.add(beam);

    // Floating 3D Text Label
    const subtitle = level === 1 ? 'Key 1 + Aether Core' : level === 2 ? 'Key 2 + Resonant Crystal' : 'Key 3 + Titan Catalyst';
    const labelSprite = this.createTextSprite(`TRIAL ${level}`, subtitle);
    labelSprite.position.set(0, 5.2, 0);
    labelSprite.scale.set(4.5, 1.5, 1);
    group.add(labelSprite);

    this.scene.add(group);
  }

  private createSentinelStatue(x: number, y: number, z: number, rotY: number, scale = 1.0) {
    const statueGroup = new THREE.Group();
    statueGroup.position.set(x, y, z);
    statueGroup.rotation.y = rotY;
    statueGroup.scale.set(scale, scale, scale);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.3
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.8
    });
    const runeGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });

    // Tiered Pedestal
    const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 2.6), stoneMat);
    plinth1.position.y = 0.4;
    statueGroup.add(plinth1);

    const plinth2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.2), stoneMat);
    plinth2.position.y = 1.2;
    statueGroup.add(plinth2);

    // Sentinel Robes / Lower Body
    const robes = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 3.2, 8), stoneMat);
    robes.position.y = 3.2;
    robes.castShadow = true;
    statueGroup.add(robes);

    // Sentinel Torso Cuirass
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.0), stoneMat);
    torso.position.y = 5.2;
    torso.castShadow = true;
    statueGroup.add(torso);

    // Gold Chest Emblem
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.06), goldTrimMat);
    crest.position.y = 5.3;
    statueGroup.add(crest);

    // Broad Shoulders
    const leftP = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.9), goldTrimMat);
    leftP.position.set(-1.1, 5.7, 0);
    statueGroup.add(leftP);

    const rightP = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.9), goldTrimMat);
    rightP.position.set(1.1, 5.7, 0);
    statueGroup.add(rightP);

    // Monumental Helmet
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.85), stoneMat);
    head.position.y = 6.8;
    head.castShadow = true;
    statueGroup.add(head);

    // Glowing Visor Slit
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.15, 0.1), runeGlowMat);
    visor.position.set(0, 6.85, 0.44);
    statueGroup.add(visor);

    // Colossal Stone Greatsword planted blade-down
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.6, 0.08), goldTrimMat);
    blade.position.set(0, 3.8, 0.7);
    statueGroup.add(blade);

    const guard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.2), goldTrimMat);
    guard.position.set(0, 6.0, 0.7);
    statueGroup.add(guard);

    this.scene.add(statueGroup);
  }

  private createTorchBrazier(x: number, y: number, z: number) {
    const brazierGroup = new THREE.Group();
    brazierGroup.position.set(x, y, z);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3, metalness: 0.8 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    // Stone Pedestal
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 1.4, 8), stoneMat);
    base.position.y = 0.7;
    base.castShadow = true;
    brazierGroup.add(base);

    // Bronze Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.35, 0.45, 12), bronzeMat);
    bowl.position.y = 1.55;
    brazierGroup.add(bowl);

    // Burning Flame Core
    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), flameMat);
    flame.position.y = 1.95;
    flame.scale.set(1.0, 1.6, 1.0);
    brazierGroup.add(flame);
    this.torchFlames.push(flame);

    // Dynamic Flickering Point Light
    const fireLight = new THREE.PointLight(0xf59e0b, 2.0, 14);
    fireLight.position.set(0, 2.2, 0);
    brazierGroup.add(fireLight);
    this.torchLights.push(fireLight);

    this.scene.add(brazierGroup);
  }

  private createAncientRuins() {
    const ruinMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8,
      metalness: 0.1
    });

    // Weathered tilted monolith pillars at the boundaries
    const ruins = [
      { x: -11, y: 0, z: 25, rx: 0.2, rz: 0.15, h: 6.5 },
      { x: 12, y: 0, z: 24, rx: -0.25, rz: -0.1, h: 5.8 },
      { x: -12, y: 0, z: 14, rx: 0.1, rz: 0.3, h: 7.2 },
      { x: 11.5, y: 0, z: 15, rx: -0.15, rz: -0.2, h: 6.0 },
      { x: -9, y: 0, z: 6, rx: 0.05, rz: 0.25, h: 4.8 },
      { x: 9.5, y: 0, z: 5, rx: -0.1, rz: -0.15, h: 5.2 },
    ];

    for (const r of ruins) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, r.h, 10), ruinMat);
      p.position.set(r.x, r.h / 2, r.z);
      p.rotation.set(r.rx, 0, r.rz);
      p.castShadow = true;
      this.scene.add(p);
    }

    // Broken Archway Fragment
    const archFragment = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.2, 1.4), ruinMat);
    archFragment.position.set(-10, 5.5, 18);
    archFragment.rotation.set(0.1, 0.4, -0.3);
    archFragment.castShadow = true;
    this.scene.add(archFragment);

    // Weathered Ancient Stone Slabs & Boulders (strictly no vegetation / forest)
    const rocks = [
      { x: -5, z: 27, sx: 2.2, sy: 1.2, sz: 1.8, ry: 0.6 },
      { x: 6, z: 28, sx: 1.8, sy: 0.9, sz: 2.1, ry: 1.2 },
      { x: -8, z: 18, sx: 2.5, sy: 1.4, sz: 2.0, ry: 0.3 },
      { x: 8, z: 19, sx: 2.0, sy: 1.1, sz: 1.6, ry: 2.1 },
      { x: -4, z: 8, sx: 1.6, sy: 0.8, sz: 1.5, ry: 0.9 },
      { x: 4.5, z: 8.5, sx: 1.7, sy: 0.9, sz: 1.7, ry: 1.5 }
    ];

    for (const rock of rocks) {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0), ruinMat);
      m.position.set(rock.x, rock.sy * 0.45, rock.z);
      m.rotation.y = rock.ry;
      m.scale.set(rock.sx, rock.sy, rock.sz);
      m.castShadow = true;
      this.scene.add(m);
    }
  }

  private buildGuideCharacter() {
    // "Aethelgard, Architect of Trials"
    // Powerful mystical God / Guide character appearing before the player
    this.guideRig = new RealisticGuideRig();
    this.guideMesh = this.guideRig.group;
    this.guideRings = this.guideRig.rings;
    this.guideBeam = this.guideRig.beam;
    this.scene.add(this.guideMesh);
  }

  private buildBossConstruct() {
    // "The Chrono-Colossus" / Titan Construct with articulated pneumatic joints
    this.bossRig = new RealisticBossRig();
    this.bossMesh = this.bossRig.group;
    this.bossMesh.position.set(0, 0, -210);
    this.scene.add(this.bossMesh);
  }

  private createCosmicAtmosphere() {
    // 1500 twinkling star particles in celestial sky
    const count = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 1] = Math.random() * 250 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600;

      const c = Math.random();
      if (c > 0.6) {
        colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0;
      } else if (c > 0.3) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.6;
      } else {
        colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 1.0;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.starsParticles = new THREE.Points(geometry, material);
    this.scene.add(this.starsParticles);
  }

  private bindEvents() {
    // Keyboard
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Mouse camera orbit
    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    // Touch support for mobile camera orbit
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);

    // Window Resize
    window.addEventListener('resize', this.onWindowResize);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;

    // Interaction key [E]
    if (e.code === 'KeyE') {
      this.checkPlayerInteractions();
    }

    // Spacebar Jump
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.isGrounded) {
        this.playerVelocity.y = 8.5;
        this.isGrounded = false;
        sound.playJump();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
  };

  private onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  };

  private onMouseUp = () => {
    this.isDragging = false;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;
    const deltaX = e.clientX - this.prevMouseX;
    const deltaY = e.clientY - this.prevMouseY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    this.cameraYaw -= deltaX * 0.005;
    this.cameraPitch = Math.max(0.05, Math.min(Math.PI / 2.2, this.cameraPitch + deltaY * 0.004));
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.isDragging = true;
      this.prevMouseX = e.touches[0].clientX;
      this.prevMouseY = e.touches[0].clientY;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - this.prevMouseX;
    const deltaY = e.touches[0].clientY - this.prevMouseY;
    this.prevMouseX = e.touches[0].clientX;
    this.prevMouseY = e.touches[0].clientY;

    this.cameraYaw -= deltaX * 0.006;
    this.cameraPitch = Math.max(0.05, Math.min(Math.PI / 2.2, this.cameraPitch + deltaY * 0.005));
  };

  private onTouchEnd = () => {
    this.isDragging = false;
  };

  private onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public checkPlayerInteractions() {
    const pos = this.playerGroup.position;

    // Check proximity to Guide Character (x: 4.5, z: 8)
    const guideDist = Math.hypot(pos.x - 4.5, pos.z - 8);
    if (guideDist < 4.5) {
      sound.playDialogueChime();
      this.callbacks.onOpenDialogue();
      return;
    }

    // Check proximity to Puzzle 1 (x: -20, z: -105)
    const p1Dist = Math.hypot(pos.x - (-20), pos.z - (-105));
    if (p1Dist < 5.0) {
      this.callbacks.onOpenPuzzle(1);
      return;
    }

    // Check proximity to Puzzle 2 (x: 0, z: -135)
    const p2Dist = Math.hypot(pos.x - 0, pos.z - (-135));
    if (p2Dist < 5.0) {
      if (!this.inventory.keys.sunKey) {
        sound.playFailure();
        this.callbacks.onLockedNotice('Sealed: Complete Trial 1 to obtain the Sun Keystone.');
      } else {
        this.callbacks.onOpenPuzzle(2);
      }
      return;
    }

    // Check proximity to Puzzle 3 (x: 20, z: -105)
    const p3Dist = Math.hypot(pos.x - 20, pos.z - (-105));
    if (p3Dist < 5.0) {
      if (!this.inventory.keys.moonKey) {
        sound.playFailure();
        this.callbacks.onLockedNotice('Sealed: Complete Trial 2 to obtain the Moon Keystone.');
      } else {
        this.callbacks.onOpenPuzzle(3);
      }
      return;
    }

    // Check proximity to Boss Barrier (z: -177)
    const bossGateDist = Math.hypot(pos.x - 0, pos.z - (-177));
    if (bossGateDist < 6.0) {
      if (!this.inventory.keys.starKey) {
        sound.playFailure();
        this.callbacks.onLockedNotice('Sealed: Complete Trial 3 to obtain the Star Keystone.');
      }
    }
  }

  // Update Game Logic per frame
  private update(delta: number) {
    if (this.currentPhase === GamePhase.CINEMATIC_INTRO) {
      this.updateCinematic(delta);
      return;
    }

    // 1. Player Movement with realistic kinematics & animation
    this.updatePlayerMovement(delta);

    // 2. Camera Tracking with dynamic bobbing & trauma recovery
    this.updateCamera(delta);

    // 3. Environment & Realistic Celestial Guide animations
    if (this.guideRig) {
      this.guideRig.update(delta, this.clock.getElapsedTime(), this.playerGroup.position, 1.0);
    }

    // 4. Boss Loop (when in boss arena or final boss phase)
    if (this.playerGroup.position.z < -185 && this.bossHealth > 0) {
      this.updateBoss(delta);
    }

    // 5. Update Shockwaves
    this.updateShockwaves(delta);

    // 6. Check Level Phase Transitions based on position
    this.checkPhaseProgression();
  }

  private updateCinematic(delta: number) {
    if (this.isCinematicPlaying) {
      this.cinematicTime += delta * this.playbackSpeed;
      if (this.cinematicTime >= 30.0) {
        this.cinematicTime = 30.0;
        this.isCinematicPlaying = false;
        this.callbacks.onCinematicComplete?.();
      }
    }

    // Synchronize procedural sound engine with timestamp
    sound.handleCinematicTimestamp(this.cinematicTime, this.isCinematicPlaying);

    // Evaluate cinematic state
    const state = CinematicDirector.evaluate(this.cinematicTime);

    // 1. Update Player Position & Rotation
    this.playerGroup.position.copy(state.playerPos);
    this.playerGroup.rotation.y = state.playerRotY;

    // 2. Animate Player Limbs with Realistic Biomechanical Rig
    if (this.humanoidRig) {
      this.humanoidRig.update({
        speed: state.playerWalkAnim ? 7.2 : 0,
        isGrounded: true,
        verticalVelocity: 0,
        turnAngularVelocity: 0,
        delta,
        time: this.cinematicTime,
        reachGesture: state.playerReachGesture,
        lookAtTarget: state.playerLookAtTarget
      });
      if (state.playerWalkAnim) {
        const walkCycle = this.cinematicTime * 9.5;
        if (Math.sin(walkCycle) > 0.94 && this.isCinematicPlaying) {
          sound.playFootstep();
          this.fxSystem.emitFootstepPuff(this.playerGroup.position, false);
        }
      }
    }

    // 3. Update Guide Deity with Realistic Precession Rig
    if (this.guideRig) {
      this.guideRig.group.position.copy(state.guidePos);
      this.guideRig.group.visible = state.guideOpacity > 0.01;
      this.guideRig.setOpacity(state.guideOpacity);
      this.guideRig.update(delta, this.cinematicTime, this.playerGroup.position, state.guideRotSpeed);
    }

    // 4. Update Gateway Doors (Closed -> Smooth magical opening)
    if (this.leftDoorGroup) {
      this.leftDoorGroup.rotation.y = state.doorLeftAngle;
    }
    if (this.rightDoorGroup) {
      this.rightDoorGroup.rotation.y = state.doorRightAngle;
    }

    // 5. Update Gate Magical FX & Stone Scraping Particles
    if (this.gateRuneSigil) {
      const scale = 1.0 + state.gateActivationFlare * 0.8;
      this.gateRuneSigil.scale.set(scale, scale, scale);
      this.gateRuneSigil.rotation.z += delta * (1.2 + state.gateActivationFlare * 4.5);
    }

    if (this.gateShockwave) {
      this.gateShockwave.visible = state.shockwaveOpacity > 0.01;
      this.gateShockwave.scale.set(state.shockwaveScale, state.shockwaveScale, 1);
      (this.gateShockwave.material as THREE.MeshBasicMaterial).opacity = state.shockwaveOpacity;
    }

    if (this.gateGodRays) {
      const isOpen = Math.abs(state.doorLeftAngle) > 0.05;
      this.gateGodRays.visible = isOpen;
      if (isOpen) {
        const openFrac = THREE.MathUtils.clamp(Math.abs(state.doorLeftAngle) / (Math.PI * 0.42), 0, 1);
        (this.gateGodRays.material as THREE.MeshBasicMaterial).opacity = openFrac * 0.4;
      }
    }

    // Gate opening rumble & dust particles
    if (state.sceneId === CinematicSceneId.SCENE_4_GATE_OPENS && Math.abs(state.doorLeftAngle) > 0.05) {
      this.fxSystem.emitGateDust(0, 8.5, 0);
      if (state.shockwaveOpacity > 0.15) {
        this.fxSystem.addTrauma(0.04);
      }
    }

    // 6. Torch flames & flickering fire lights
    const elapsed = this.clock.getElapsedTime();
    this.torchFlames.forEach((flame, i) => {
      const s = 0.85 + Math.sin(elapsed * 9 + i * 1.5) * 0.2;
      flame.scale.set(s, s * (1.0 + Math.cos(elapsed * 11 + i) * 0.25), s);
    });
    this.torchLights.forEach((light, i) => {
      light.intensity = 1.8 + Math.sin(elapsed * 14 + i * 2.2) * 0.5;
    });

    // 7. Cinematic Camera Director with Screen Shake
    const shake = this.fxSystem.update(delta);
    if (this.cameraDirectorMode === 'CINEMATIC') {
      this.camera.position.copy(state.camPos).add(shake);
      this.camera.lookAt(state.camLookAt);
      if (this.camera.fov !== state.camFov) {
        this.camera.fov = state.camFov;
        this.camera.updateProjectionMatrix();
      }
    } else if (this.cameraDirectorMode === 'FREE_ORBIT') {
      this.updateCamera(delta);
    } else if (this.cameraDirectorMode === 'FIRST_PERSON') {
      this.camera.position.copy(this.playerGroup.position).add(new THREE.Vector3(0, 1.85, 0));
      const lookDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerGroup.rotation.y);
      this.camera.lookAt(this.camera.position.clone().add(lookDir));
    } else if (this.cameraDirectorMode === 'WIDE_DRONE') {
      this.camera.position.set(0, 20, 12);
      this.camera.lookAt(0, 2, -35);
    }

    // 8. Update Callback to React UI
    this.callbacks.onCinematicTimeUpdate?.(this.cinematicTime, state.sceneId, this.isCinematicPlaying);
  }

  private updatePlayerMovement(delta: number) {
    const isSprintKey = this.keysPressed['ShiftLeft'] || this.keysPressed['ShiftRight'];
    const targetSpeed = isSprintKey ? 12.5 : 7.8;
    this.isSprinting = isSprintKey;

    const moveDir = new THREE.Vector3();
    if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) moveDir.z -= 1;
    if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) moveDir.z += 1;
    if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) moveDir.x -= 1;
    if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) moveDir.x += 1;

    let isMoving = false;
    let turnAngularVelocity = 0;
    let currentSpeed = 0;

    if (moveDir.lengthSq() > 0) {
      isMoving = true;
      moveDir.normalize();

      // Rotate move direction relative to camera yaw
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      // Smoothly rotate character to face movement direction
      const targetAngle = Math.atan2(-moveDir.x, -moveDir.z);
      const prevAngle = this.playerGroup.rotation.y;
      this.playerGroup.rotation.y = THREE.MathUtils.lerp(
        this.playerGroup.rotation.y,
        targetAngle,
        14 * delta
      );
      turnAngularVelocity = (this.playerGroup.rotation.y - prevAngle) / Math.max(0.001, delta);

      currentSpeed = targetSpeed;
      this.playerGroup.position.x += moveDir.x * targetSpeed * delta;
      this.playerGroup.position.z += moveDir.z * targetSpeed * delta;

      // Realistic Footstep cadence & dust puff
      const elapsed = this.clock.getElapsedTime();
      const strideRate = isSprintKey ? 0.22 : 0.34;
      if (elapsed - this.lastFootstepTime > strideRate && this.isGrounded) {
        this.lastFootstepTime = elapsed;
        sound.playFootstep();
        this.fxSystem.emitFootstepPuff(this.playerGroup.position, isSprintKey);
      }
    }

    // Update Humanoid Rig with complete realistic biomechanics
    if (this.humanoidRig) {
      this.humanoidRig.update({
        speed: isMoving ? currentSpeed : 0,
        isGrounded: this.isGrounded,
        verticalVelocity: this.playerVelocity.y,
        turnAngularVelocity: turnAngularVelocity,
        delta,
        time: this.clock.getElapsedTime(),
      });
    }

    // Gravity & Ground Collision
    this.playerVelocity.y -= 22.0 * delta;
    this.playerGroup.position.y += this.playerVelocity.y * delta;

    // Platform Height checking
    let currentGroundY = -999;
    const px = this.playerGroup.position.x;
    const pz = this.playerGroup.position.z;

    for (const p of this.platforms) {
      if (px >= p.xMin && px <= p.xMax && pz >= p.zMin && pz <= p.zMax) {
        currentGroundY = Math.max(currentGroundY, p.y);
      }
    }

    // Ground hit
    if (currentGroundY > -900 && this.playerGroup.position.y <= currentGroundY + 0.05) {
      this.playerGroup.position.y = currentGroundY;
      if (!this.isGrounded && this.playerVelocity.y < -5.0) {
        // Hard landing impact puff and subtle camera bump
        this.fxSystem.emitImpactBurst(this.playerGroup.position, 1.4);
        this.fxSystem.addTrauma(0.12);
        sound.playFootstep();
      }
      this.playerVelocity.y = 0;
      this.isGrounded = true;
    } else if (this.playerGroup.position.y < -35) {
      // Fell into void: respawn at last safe checkpoint
      this.respawnAtCurrentPhase();
    } else {
      this.isGrounded = false;
    }

    // Gate Collisions
    // Gate 2
    if (!this.inventory.keys.sunKey && pz < -120 && pz > -124 && Math.abs(px) < 7) {
      this.playerGroup.position.z = -120;
      this.callbacks.onLockedNotice('Sealed: Requires Sun Keystone from Trial 1.');
    }
    // Gate 3
    if (!this.inventory.keys.moonKey && px > 9 && px < 11 && Math.abs(pz - (-105)) < 7) {
      this.playerGroup.position.x = 9;
      this.callbacks.onLockedNotice('Sealed: Requires Moon Keystone from Trial 2.');
    }
    // Boss Gate
    if (!this.inventory.keys.starKey && pz < -176 && Math.abs(px) < 6) {
      this.playerGroup.position.z = -176;
      this.callbacks.onLockedNotice('Sealed: Requires Star Keystone from Trial 3.');
    }

    // Update Player Stats Callback
    this.playerStats.position = [
      Math.round(this.playerGroup.position.x * 10) / 10,
      Math.round(this.playerGroup.position.y * 10) / 10,
      Math.round(this.playerGroup.position.z * 10) / 10
    ];
    this.playerStats.isGrounded = this.isGrounded;
    this.callbacks.onPlayerStatsChange({ ...this.playerStats });
  }

  private updateCamera(delta: number) {
    const target = this.playerGroup.position.clone().add(new THREE.Vector3(0, 1.4, 0));

    // Dynamic Camera Bob during movement
    const isMoving = this.keysPressed['KeyW'] || this.keysPressed['KeyS'] || this.keysPressed['KeyA'] || this.keysPressed['KeyD'];
    if (isMoving && this.isGrounded) {
      this.cameraBobPhase += delta * (this.isSprinting ? 14 : 9);
      const bobY = Math.sin(this.cameraBobPhase) * (this.isSprinting ? 0.08 : 0.035);
      const bobX = Math.cos(this.cameraBobPhase * 0.5) * (this.isSprinting ? 0.04 : 0.015);
      target.y += bobY;
      target.x += bobX;
    }

    // Calculate camera position based on Yaw and Pitch
    const distance = this.isSprinting ? 6.8 : 6.2;
    const camX = target.x + distance * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
    const camY = target.y + distance * Math.sin(this.cameraPitch);
    const camZ = target.z + distance * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);

    const desiredCamPos = new THREE.Vector3(camX, camY, camZ);
    this.camera.position.lerp(desiredCamPos, Math.min(1.0, 15 * delta));

    // Apply trauma screen shake
    const shake = this.fxSystem.update(delta);
    this.camera.position.add(shake);

    this.camera.lookAt(target);
  }

  private checkPhaseProgression() {
    const pz = this.playerGroup.position.z;

    if (pz > 5 && this.currentPhase !== GamePhase.EXPLORING_GATEWAY && this.currentPhase !== GamePhase.START_SCREEN && this.currentPhase !== GamePhase.INTRO_DIALOGUE) {
      this.setPhase(GamePhase.EXPLORING_GATEWAY);
    } else if (pz <= 5 && pz > -65 && this.currentPhase !== GamePhase.CROSSING_BRIDGE) {
      this.setPhase(GamePhase.CROSSING_BRIDGE);
    } else if (pz <= -65 && pz > -175 && this.currentPhase !== GamePhase.PUZZLE_AREA && this.currentPhase !== GamePhase.PUZZLE_1 && this.currentPhase !== GamePhase.PUZZLE_2 && this.currentPhase !== GamePhase.PUZZLE_3) {
      this.setPhase(GamePhase.PUZZLE_AREA);
    } else if (pz <= -180 && this.currentPhase !== GamePhase.FINAL_BOSS && this.currentPhase !== GamePhase.VICTORY) {
      this.setPhase(GamePhase.FINAL_BOSS);
    }
  }

  private setPhase(newPhase: GamePhase) {
    this.currentPhase = newPhase;
    this.callbacks.onPhaseChange(newPhase);
  }

  private updateBoss(delta: number) {
    this.bossTimer += delta;

    // Realistic Boss Rig animation update
    if (this.bossRig) {
      this.bossRig.update(delta, this.clock.getElapsedTime(), this.playerGroup.position, () => {
        // Ground slam impact: shockwave, debris, screen shake
        this.fxSystem.emitImpactBurst(new THREE.Vector3(this.bossMesh.position.x, 0.1, this.bossMesh.position.z + 2.4), 4.2);
        this.fxSystem.addTrauma(0.45);
        sound.playBossAttack();
        this.spawnBossShockwave();
      });
    }

    // Boss Attack cycle every 6 seconds
    if (this.bossTimer > 6.0 && this.bossPhase !== 'stunned' && this.bossPhase !== 'defeated') {
      this.bossTimer = 0;
      this.triggerBossAttack();
    }
  }

  private triggerBossAttack() {
    this.bossPhase = 'attack';
    this.bossAttackName = Math.random() > 0.5 ? 'Chrono Shockwave' : 'Gravitational Pulse';
    if (this.bossRig) {
      this.bossRig.triggerAttack();
    }

    this.callbacks.onBossStateChange({
      health: this.bossHealth,
      maxHealth: this.bossMaxHealth,
      phase: this.bossPhase,
      attackName: this.bossAttackName
    });

    setTimeout(() => {
      if (this.bossHealth > 0 && this.bossPhase !== 'stunned' && this.bossPhase !== 'defeated') {
        this.bossPhase = 'idle';
        this.callbacks.onBossStateChange({
          health: this.bossHealth,
          maxHealth: this.bossMaxHealth,
          phase: 'idle',
          attackName: 'Idle'
        });
      }
    }, 2800);
  }

  private spawnBossShockwave() {
    const ringGeo = new THREE.RingGeometry(0.6, 1.8, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const shockwave = new THREE.Mesh(ringGeo, ringMat);
    shockwave.rotation.x = -Math.PI / 2;
    shockwave.position.set(this.bossMesh.position.x, 0.1, this.bossMesh.position.z + 2.0);
    this.scene.add(shockwave);

    this.bossShockwaves.push({
      mesh: shockwave,
      radius: 1,
      maxRadius: 40,
      speed: 13
    });
  }

  private updateShockwaves(delta: number) {
    for (let i = this.bossShockwaves.length - 1; i >= 0; i--) {
      const sw = this.bossShockwaves[i];
      sw.radius += sw.speed * delta;
      sw.mesh.scale.set(sw.radius, sw.radius, 1);

      // Check collision with player if player is on ground
      const dist = Math.hypot(
        this.playerGroup.position.x - sw.mesh.position.x,
        this.playerGroup.position.z - sw.mesh.position.z
      );

      if (Math.abs(dist - sw.radius) < 1.4 && this.isGrounded && this.playerStats.health > 0) {
        // Player hit!
        this.damagePlayer(15);
      }

      // Cleanup
      if (sw.radius >= sw.maxRadius) {
        this.scene.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        this.bossShockwaves.splice(i, 1);
      }
    }
  }

  private damagePlayer(amount: number) {
    this.playerStats.health = Math.max(0, this.playerStats.health - amount);
    sound.playFailure();
    this.callbacks.onPlayerStatsChange({ ...this.playerStats });

    if (this.playerStats.health <= 0) {
      this.callbacks.onPhaseChange(GamePhase.GAME_OVER);
    }
  }

  public attackBossWithResource(resourceType: 1 | 2 | 3): boolean {
    if (this.bossHealth <= 0) return false;

    // Check inventory resource
    if (resourceType === 1 && this.inventory.resources.aetherCore <= 0) return false;
    if (resourceType === 2 && this.inventory.resources.resonantCrystal <= 0) return false;
    if (resourceType === 3 && this.inventory.resources.titanCatalyst <= 0) return false;

    sound.playResourceAttack(resourceType);

    // Damage & effects
    let damage = 25;
    let beamColor = 0x38bdf8;
    if (resourceType === 2) {
      damage = 35;
      beamColor = 0xa855f7;
    } else if (resourceType === 3) {
      damage = 45;
      beamColor = 0xf59e0b;
      this.bossPhase = 'stunned';
      if (this.bossRig) {
        this.bossRig.triggerStun();
      }
    }

    // Visual Beam from player to boss
    const start = this.playerGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    const end = this.bossMesh.position.clone().add(new THREE.Vector3(0, 1, 0));

    const beamMesh = this.createVisualBeam(start, end, beamColor);
    setTimeout(() => {
      this.scene.remove(beamMesh);
      beamMesh.geometry.dispose();
    }, 450);

    // Apply Damage
    this.bossHealth = Math.max(0, this.bossHealth - damage);
    sound.playBossHit();
    this.fxSystem.addTrauma(0.25);
    this.fxSystem.emitImpactBurst(end, 2.5);

    if (this.bossHealth <= 0) {
      this.bossPhase = 'defeated';
      if (this.bossRig) {
        this.bossRig.triggerDefeat();
      }
      sound.playPuzzleSuccess();
      this.setPhase(GamePhase.VICTORY);
    }

    this.callbacks.onBossStateChange({
      health: this.bossHealth,
      maxHealth: this.bossMaxHealth,
      phase: this.bossPhase,
      attackName: this.bossPhase === 'stunned' ? 'Stunned!' : 'Damaged'
    });

    return true;
  }

  private createVisualBeam(start: THREE.Vector3, end: THREE.Vector3, colorHex: number): THREE.Mesh {
    const distance = start.distanceTo(end);
    const cylinderGeo = new THREE.CylinderGeometry(0.3, 0.3, distance, 16);
    cylinderGeo.translate(0, distance / 2, 0);
    cylinderGeo.rotateX(Math.PI / 2);

    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 });
    const beam = new THREE.Mesh(cylinderGeo, mat);
    beam.position.copy(start);
    beam.lookAt(end);
    this.scene.add(beam);
    return beam;
  }

  public respawnAtCurrentPhase() {
    this.playerVelocity.set(0, 0, 0);

    if (this.currentPhase === GamePhase.FINAL_BOSS) {
      this.playerGroup.position.set(0, 1.2, -188);
    } else if (this.inventory.keys.moonKey) {
      this.playerGroup.position.set(0, 1.2, -110);
    } else if (this.inventory.keys.sunKey) {
      this.playerGroup.position.set(0, 1.2, -90);
    } else {
      this.playerGroup.position.set(0, 1.2, 20);
    }

    this.playerStats.health = 100;
    this.callbacks.onPlayerStatsChange({ ...this.playerStats });
  }

  public teleportToArea(area: 'gateway' | 'bridge' | 'puzzle_area' | 'puzzle_1' | 'puzzle_2' | 'puzzle_3' | 'boss') {
    this.playerVelocity.set(0, 0, 0);

    switch (area) {
      case 'gateway':
        this.playerGroup.position.set(0, 1.2, 18);
        this.cameraYaw = 0;
        break;
      case 'bridge':
        this.playerGroup.position.set(0, 1.2, -20);
        this.cameraYaw = 0;
        break;
      case 'puzzle_area':
        this.playerGroup.position.set(0, 1.2, -95);
        this.cameraYaw = 0;
        break;
      case 'puzzle_1':
        this.playerGroup.position.set(-18, 1.2, -105);
        this.cameraYaw = Math.PI / 2;
        break;
      case 'puzzle_2':
        this.playerGroup.position.set(0, 1.2, -130);
        this.cameraYaw = 0;
        break;
      case 'puzzle_3':
        this.playerGroup.position.set(18, 1.2, -105);
        this.cameraYaw = -Math.PI / 2;
        break;
      case 'boss':
        this.playerGroup.position.set(0, 1.2, -190);
        this.cameraYaw = 0;
        break;
    }
  }

  public updateInventory(inv: Inventory) {
    this.inventory = inv;

    // Update Gate Barriers visibility / removal when keys collected
    if (inv.keys.sunKey && this.gate2Barrier) {
      this.gate2Barrier.visible = false;
    }
    if (inv.keys.moonKey && this.gate3Barrier) {
      this.gate3Barrier.visible = false;
    }
    if (inv.keys.starKey && this.bossBarrier) {
      this.bossBarrier.visible = false;
    }

    // Update Player backpack core glow
    if (this.humanoidRig) {
      if (inv.keys.starKey) {
        this.humanoidRig.setCoreColor(0xf59e0b);
      } else if (inv.keys.moonKey) {
        this.humanoidRig.setCoreColor(0xa855f7);
      } else if (inv.keys.sunKey) {
        this.humanoidRig.setCoreColor(0x38bdf8);
      }
    } else if (this.playerLimbs?.backpackCore) {
      if (inv.keys.starKey) {
        (this.playerLimbs.backpackCore.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
      } else if (inv.keys.moonKey) {
        (this.playerLimbs.backpackCore.material as THREE.MeshBasicMaterial).color.setHex(0xa855f7);
      } else if (inv.keys.sunKey) {
        (this.playerLimbs.backpackCore.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
      }
    }
  }

  // --- Cinematic Intro Control API ---
  public setCinematicTime(t: number) {
    this.cinematicTime = Math.max(0, Math.min(30.0, t));
    // Immediately evaluate and display frame
    this.updateCinematic(0);
  }

  public getCinematicTime(): number {
    return this.cinematicTime;
  }

  public playCinematic() {
    this.isCinematicPlaying = true;
    sound.startCinematicAudio();
  }

  public pauseCinematic() {
    this.isCinematicPlaying = false;
    sound.stopCinematicAudio();
  }

  public togglePlayCinematic(): boolean {
    if (this.isCinematicPlaying) {
      this.pauseCinematic();
    } else {
      this.playCinematic();
    }
    return this.isCinematicPlaying;
  }

  public isCinematicActive(): boolean {
    return this.isCinematicPlaying;
  }

  public setPlaybackSpeed(speed: number) {
    this.playbackSpeed = speed;
  }

  public setCameraMode(mode: CameraDirectorMode) {
    this.cameraDirectorMode = mode;
    if (mode === 'CINEMATIC') {
      const state = CinematicDirector.evaluate(this.cinematicTime);
      this.camera.fov = state.camFov;
      this.camera.updateProjectionMatrix();
    }
  }

  public getCameraMode(): CameraDirectorMode {
    return this.cameraDirectorMode;
  }

  public replayCinematic() {
    this.cinematicTime = 0;
    this.isCinematicPlaying = true;
    this.currentPhase = GamePhase.CINEMATIC_INTRO;
    sound.stopCinematicAudio();
    sound.startCinematicAudio();
    this.callbacks.onPhaseChange(GamePhase.CINEMATIC_INTRO);
    this.updateCinematic(0);
  }

  public enterPlayableMode() {
    this.currentPhase = GamePhase.CROSSING_BRIDGE;
    this.isCinematicPlaying = false;
    sound.stopCinematicAudio();
    this.cameraDirectorMode = 'FREE_ORBIT';

    // Position adventurer on the grand bridge
    this.playerGroup.position.set(0, 0.5, -6);
    this.playerGroup.rotation.y = Math.PI;

    // Reset limbs and rig
    if (this.humanoidRig) {
      this.humanoidRig.update({
        speed: 0,
        isGrounded: true,
        verticalVelocity: 0,
        turnAngularVelocity: 0,
        delta: 0.016,
        time: 0,
        reachGesture: 0,
        lookAtTarget: false
      });
    }
    this.playerLimbs.leftLeg.rotation.x = 0;
    this.playerLimbs.rightLeg.rotation.x = 0;
    this.playerLimbs.leftArm.rotation.x = 0;
    this.playerLimbs.rightArm.rotation.x = 0;
    this.playerLimbs.rightArm.rotation.z = 0;
    this.playerLimbs.head.rotation.x = 0;
    this.playerLimbs.head.rotation.y = 0;

    // Doors remain open
    if (this.leftDoorGroup) this.leftDoorGroup.rotation.y = -Math.PI * 0.42;
    if (this.rightDoorGroup) this.rightDoorGroup.rotation.y = Math.PI * 0.42;

    this.camera.fov = 60;
    this.camera.updateProjectionMatrix();
    this.callbacks.onPhaseChange(GamePhase.CROSSING_BRIDGE);
  }

  public getPhase(): GamePhase {
    return this.currentPhase;
  }

  public resetBossFight() {
    this.bossHealth = this.bossMaxHealth;
    this.bossPhase = 'idle';
    this.playerStats.health = 100;
    this.respawnAtCurrentPhase();
    this.callbacks.onBossStateChange({
      health: this.bossHealth,
      maxHealth: this.bossMaxHealth,
      phase: 'idle',
      attackName: 'Idle'
    });
  }

  private startLoop() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onWindowResize);

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    canvas.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
