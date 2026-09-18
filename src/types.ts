export enum GamePhase {
  CINEMATIC_INTRO = 'CINEMATIC_INTRO',
  START_SCREEN = 'START_SCREEN',
  INTRO_DIALOGUE = 'INTRO_DIALOGUE',
  EXPLORING_GATEWAY = 'EXPLORING_GATEWAY',
  CROSSING_BRIDGE = 'CROSSING_BRIDGE',
  PUZZLE_AREA = 'PUZZLE_AREA',
  PUZZLE_1 = 'PUZZLE_1',
  PUZZLE_2 = 'PUZZLE_2',
  PUZZLE_3 = 'PUZZLE_3',
  FINAL_BOSS = 'FINAL_BOSS',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER'
}

export enum CinematicSceneId {
  SCENE_1_ARRIVAL = 1,
  SCENE_2_THE_GUIDE = 2,
  SCENE_3_GRAND_GATEWAY = 3,
  SCENE_4_GATE_OPENS = 4,
  SCENE_5_BRIDGE_REVEAL = 5
}

export interface CinematicSceneDef {
  id: CinematicSceneId;
  startTime: number;
  endTime: number;
  title: string;
  badge: string;
  description: string;
  subtitle: string;
  speaker?: string;
}

export const CINEMATIC_SCENES: CinematicSceneDef[] = [
  {
    id: CinematicSceneId.SCENE_1_ARRIVAL,
    startTime: 0,
    endTime: 6,
    title: 'SCENE 1 — ARRIVAL',
    badge: 'ARRIVAL',
    description: 'A lone male adventurer enters an ancient mysterious world among towering stone ruins and atmospheric fog.',
    subtitle: 'A lone adventurer enters the forgotten ruins of an ancient world...',
  },
  {
    id: CinematicSceneId.SCENE_2_THE_GUIDE,
    startTime: 6,
    endTime: 12,
    title: 'SCENE 2 — THE GUIDE',
    badge: 'THE GUIDE',
    description: 'A powerful mystical God/Guide character appears before the player.',
    subtitle: '"The journey has begun, wanderer. You must overcome several challenges to reach the final battle."',
    speaker: 'Aethelgard, The Architect',
  },
  {
    id: CinematicSceneId.SCENE_3_GRAND_GATEWAY,
    startTime: 12,
    endTime: 18,
    title: 'SCENE 3 — GRAND GATEWAY',
    badge: 'GRAND GATEWAY',
    description: 'The player walks toward a HUGE ancient stone gateway. The gateway is CLOSED with glowing symbols and pillars.',
    subtitle: 'The Grand Gateway stands monolithic and sealed, pulsing with ancient dormant glyphs...',
  },
  {
    id: CinematicSceneId.SCENE_4_GATE_OPENS,
    startTime: 18,
    endTime: 24,
    title: 'SCENE 4 — GATE OPENS',
    badge: 'GATE OPENS',
    description: 'The player activates the gateway. Giant stone doors slowly open with powerful magical effects.',
    subtitle: 'The ancient runes ignite! The colossal stone doors slowly part before the adventurer...',
  },
  {
    id: CinematicSceneId.SCENE_5_BRIDGE_REVEAL,
    startTime: 24,
    endTime: 30,
    title: 'SCENE 5 — BRIDGE REVEAL',
    badge: 'BRIDGE REVEAL',
    description: 'Behind the gateway, a long ancient bridge extends into a huge mysterious adventure world.',
    subtitle: 'Beyond the threshold lies the celestial expanse—an ancient bridge stretching into the infinite...',
  }
];

export type CameraDirectorMode = 'CINEMATIC' | 'FREE_ORBIT' | 'FIRST_PERSON' | 'WIDE_DRONE';

export enum PuzzleLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3
}

export interface Inventory {
  keys: {
    sunKey: boolean;      // From Puzzle 1
    moonKey: boolean;     // From Puzzle 2
    starKey: boolean;     // From Puzzle 3
  };
  resources: {
    aetherCore: number;      // Resource 1: Power conduit
    resonantCrystal: number; // Resource 2: Sound prism
    titanCatalyst: number;   // Resource 3: Overdrive engine
  };
}

export interface DialogueLine {
  speaker: string;
  title: string;
  text: string;
  avatarColor: string;
}

export interface BossState {
  health: number;
  maxHealth: number;
  phase: 'idle' | 'telegraph' | 'attack' | 'stunned' | 'defeated';
  attackName: string;
  attackTimer: number;
  isVulnerable: boolean;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  isGrounded: boolean;
  position: [number, number, number];
}
