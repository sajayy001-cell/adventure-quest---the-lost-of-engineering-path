import * as THREE from 'three';
import { CinematicSceneId } from '../types';

export interface CinematicState {
  // Adventurer pose
  playerPos: THREE.Vector3;
  playerRotY: number;
  playerWalkAnim: boolean;
  playerReachGesture: number; // 0 = none, 1 = right arm raised to activate gate
  playerLookAtTarget?: THREE.Vector3;

  // Guide pose
  guidePos: THREE.Vector3;
  guideOpacity: number;
  guideRotSpeed: number;

  // Gateway doors & FX
  doorLeftAngle: number;   // 0 = closed, -0.42 * PI = fully open
  doorRightAngle: number;  // 0 = closed, +0.42 * PI = fully open
  gateActivationFlare: number; // 0 to 1 intensity
  shockwaveScale: number;
  shockwaveOpacity: number;

  // Camera
  camPos: THREE.Vector3;
  camLookAt: THREE.Vector3;
  camFov: number;

  // Scene metadata
  sceneId: CinematicSceneId;
}

// Ease helper functions
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerpVec(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3(
    THREE.MathUtils.lerp(a.x, b.x, t),
    THREE.MathUtils.lerp(a.y, b.y, t),
    THREE.MathUtils.lerp(a.z, b.z, t)
  );
}

/**
 * CinematicDirector computes exact smooth 60fps positions, animations, and camera choreography
 * for the 30-second adventure game intro sequence.
 */
export class CinematicDirector {
  public static readonly DURATION = 30.0;

  /**
   * Evaluate complete cinematic state at time t (0.0 to 30.0 seconds)
   */
  public static evaluate(t: number): CinematicState {
    const time = clamp(t, 0, 30.0);

    // Identify current scene
    let sceneId: CinematicSceneId;
    if (time < 6.0) {
      sceneId = CinematicSceneId.SCENE_1_ARRIVAL;
    } else if (time < 12.0) {
      sceneId = CinematicSceneId.SCENE_2_THE_GUIDE;
    } else if (time < 18.0) {
      sceneId = CinematicSceneId.SCENE_3_GRAND_GATEWAY;
    } else if (time < 24.0) {
      sceneId = CinematicSceneId.SCENE_4_GATE_OPENS;
    } else {
      sceneId = CinematicSceneId.SCENE_5_BRIDGE_REVEAL;
    }

    // Default states
    const playerPos = new THREE.Vector3(0, 1.2, 20);
    let playerRotY = Math.PI; // Face forward (-Z)
    let playerWalkAnim = false;
    let playerReachGesture = 0;
    let playerLookAtTarget: THREE.Vector3 | undefined = undefined;

    const guidePos = new THREE.Vector3(3.8, 12.0, 10.5);
    let guideOpacity = 0;
    let guideRotSpeed = 1.0;

    let doorLeftAngle = 0;
    let doorRightAngle = 0;
    let gateActivationFlare = 0;
    let shockwaveScale = 0.1;
    let shockwaveOpacity = 0;

    const camPos = new THREE.Vector3();
    const camLookAt = new THREE.Vector3();
    let camFov = 55;

    // --- SCENE 1: ARRIVAL (0.0s – 6.0s) ---
    // A lone male adventurer enters an ancient mysterious world.
    // Large stone ruins, statues, rocks, atmospheric fog and dramatic lighting.
    // Third-person adventure-game camera.
    if (time < 6.0) {
      const p = smoothstep(0, 6.0, time);
      // Adventurer walks from z = 26 down to z = 17.5
      playerPos.set(0, 0.4, THREE.MathUtils.lerp(26.0, 17.5, p));
      playerRotY = Math.PI;
      playerWalkAnim = true;

      // Third-person adventure-game camera following the adventurer, sweeping to reveal ruins
      // Starts behind and slightly right, pans smoothly to high three-quarters angle
      const camStart = new THREE.Vector3(2.4, 2.8, 30.5);
      const camEnd = new THREE.Vector3(-2.2, 3.6, 22.0);
      const lookStart = new THREE.Vector3(0, 1.8, 19.0);
      const lookEnd = new THREE.Vector3(0, 2.2, 10.0);

      camPos.copy(lerpVec(camStart, camEnd, p));
      camLookAt.copy(lerpVec(lookStart, lookEnd, p));
      camFov = 58;

      guideOpacity = 0;
      guidePos.set(3.8, 14.0, 10.5);
    }

    // --- SCENE 2: THE GUIDE (6.0s – 12.0s) ---
    // A powerful mystical God/Guide character appears before the player.
    // The Guide tells him that his journey has begun and that he must overcome several challenges.
    else if (time < 12.0) {
      const p = smoothstep(6.0, 12.0, time);
      playerPos.set(0, 0.4, 16.5);
      // Player stops and turns slightly toward the Guide (at x=3.8, z=10.5)
      playerRotY = THREE.MathUtils.lerp(Math.PI, Math.PI - 0.55, smoothstep(6.0, 7.5, time));
      playerWalkAnim = false;
      playerLookAtTarget = new THREE.Vector3(3.8, 2.8, 10.5);

      // Guide descends from heaven into view
      const guideY = THREE.MathUtils.lerp(12.0, 2.8, smoothstep(6.0, 8.5, time)) + Math.sin(time * 2.5) * 0.25;
      guidePos.set(3.8, guideY, 10.5);
      guideOpacity = smoothstep(6.0, 7.5, time);
      guideRotSpeed = 2.5;

      // Cinematic Two-Shot framing: Low angle from adventurer's shoulder looking up toward the mystical Guide
      const camStart = new THREE.Vector3(-2.8, 1.8, 19.5);
      const camEnd = new THREE.Vector3(-3.4, 2.6, 17.5);
      const lookStart = new THREE.Vector3(2.5, 3.2, 12.0);
      const lookEnd = new THREE.Vector3(2.8, 3.0, 11.0);

      camPos.copy(lerpVec(camStart, camEnd, p));
      camLookAt.copy(lerpVec(lookStart, lookEnd, p));
      camFov = 52;
    }

    // --- SCENE 3: GRAND GATEWAY (12.0s – 18.0s) ---
    // The player walks toward a HUGE ancient stone gateway.
    // The gateway is CLOSED.
    // Show glowing symbols, giant doors, pillars, torches and stairs.
    // Camera slowly moves closer to create suspense.
    else if (time < 18.0) {
      const p = smoothstep(12.0, 18.0, time);

      // Guide ascends / fades into celestial glow
      guideOpacity = 1.0 - smoothstep(12.0, 13.5, time);
      guidePos.set(3.8, 2.8 + (time - 12.0) * 1.5, 10.5);

      // Adventurer turns back forward and walks up the stairs toward the closed gateway
      playerRotY = Math.PI;
      playerWalkAnim = time < 17.6;
      // Walks from z = 16.0 to z = 3.2 (just before the closed gate at z = 0)
      const walkZ = THREE.MathUtils.lerp(16.0, 3.2, p);
      // Elevation increases slightly on the grand stone stairs
      const stairsY = 0.4 + smoothstep(12.0, 17.5, time) * 0.6;
      playerPos.set(0, stairsY, walkZ);

      // The gateway is CLOSED! (doors at angle 0)
      doorLeftAngle = 0;
      doorRightAngle = 0;

      // Camera: Slowly moves closer to the closed giant doors from low angle to create intense suspense
      const camStart = new THREE.Vector3(0, 2.8, 17.0);
      const camEnd = new THREE.Vector3(0, 2.0, 7.2);
      const lookStart = new THREE.Vector3(0, 6.0, 0);
      const lookEnd = new THREE.Vector3(0, 7.5, 0);

      camPos.copy(lerpVec(camStart, camEnd, p));
      camLookAt.copy(lerpVec(lookStart, lookEnd, p));
      camFov = 54;
    }

    // --- SCENE 4: GATE OPENS (18.0s – 24.0s) ---
    // The player reaches the gateway and activates it.
    // The giant doors slowly open with a powerful magical effect.
    // The camera moves through the opening.
    else if (time < 24.0) {
      playerWalkAnim = false;
      playerRotY = Math.PI;
      playerPos.set(0, 1.0, 3.0);

      // Activation gesture: Adventurer raises right arm toward the door lock at t = 18.0s to 20.5s
      if (time >= 18.0 && time <= 20.5) {
        playerReachGesture = smoothstep(18.0, 18.5, time) * (1.0 - smoothstep(20.0, 20.5, time));
      }

      // Magical Flare & Shockwave at t = 18.3s
      if (time >= 18.2 && time <= 21.0) {
        gateActivationFlare = Math.sin(smoothstep(18.2, 20.2, time) * Math.PI);
        const swTime = smoothstep(18.3, 20.0, time);
        shockwaveScale = 0.5 + swTime * 14.0;
        shockwaveOpacity = (1.0 - swTime) * 0.95;
      }

      // Giant Doors Slowly Open between t = 18.8s and t = 22.8s
      const openProgress = smoothstep(18.8, 22.8, time);
      // Colossal doors pivot open around outer pillar hinges
      const maxDoorAngle = Math.PI * 0.42; // ~75 degrees
      doorLeftAngle = -openProgress * maxDoorAngle;
      doorRightAngle = openProgress * maxDoorAngle;

      // Camera: Moves right through the giant opening!
      // Starts behind adventurer at z = 6.5, glides between the doors past z = 0 to z = -6.5
      const p = smoothstep(18.0, 24.0, time);
      const camStart = new THREE.Vector3(0, 2.4, 6.5);
      const camMid = new THREE.Vector3(0, 2.8, 0.5);
      const camEnd = new THREE.Vector3(0, 3.2, -6.8);

      if (p < 0.5) {
        camPos.copy(lerpVec(camStart, camMid, p * 2));
      } else {
        camPos.copy(lerpVec(camMid, camEnd, (p - 0.5) * 2));
      }

      camLookAt.set(0, 2.8, -25.0);
      camFov = 62; // Wider cinematic FOV as we push through
    }

    // --- SCENE 5: BRIDGE REVEAL (24.0s – 30.0s) ---
    // Behind the gateway is a long ancient bridge extending into a huge mysterious adventure world.
    // Reveal the bridge with a dramatic wide camera shot.
    // Add lights, ruins, statues and distant structures.
    // FINAL TEXT: "THE ADVENTURE BEGINS"
    else {
      // Adventurer has crossed the threshold and stands at the beginning of the grand bridge
      playerPos.set(0, 0.5, -4.5);
      playerRotY = Math.PI;
      playerWalkAnim = false;
      playerReachGesture = 0;

      // Doors remain majestically open
      doorLeftAngle = -Math.PI * 0.42;
      doorRightAngle = Math.PI * 0.42;

      // Dramatic wide camera crane shot:
      // Ascends high up into the cosmic sky and pulls back, overlooking the 70m ancient bridge,
      // balustrade lanterns, floating ruins, celestial abyss, and distant citadel monoliths!
      const p = smoothstep(24.0, 30.0, time);
      const camStart = new THREE.Vector3(0, 3.6, -7.0);
      const camEnd = new THREE.Vector3(0, 16.5, 9.5);
      const lookStart = new THREE.Vector3(0, 2.0, -32.0);
      const lookEnd = new THREE.Vector3(0, 1.5, -55.0);

      camPos.copy(lerpVec(camStart, camEnd, p));
      camLookAt.copy(lerpVec(lookStart, lookEnd, p));
      camFov = 65; // Wide epic panoramic lens
    }

    return {
      playerPos,
      playerRotY,
      playerWalkAnim,
      playerReachGesture,
      playerLookAtTarget,
      guidePos,
      guideOpacity,
      guideRotSpeed,
      doorLeftAngle,
      doorRightAngle,
      gateActivationFlare,
      shockwaveScale,
      shockwaveOpacity,
      camPos,
      camLookAt,
      camFov,
      sceneId
    };
  }
}
