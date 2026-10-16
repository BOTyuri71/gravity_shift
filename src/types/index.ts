export type GravityDirection = 1 | -1;

export interface GameEntity {
  id: string;
  active: boolean;
  destroy(): void;
}

export type CollisionType = "none" | "lateral" | "vertical";

export interface GameConfig {
  gravity: number;
  baseSpeed: number;
  speedIncrement: number;
  speedIncrementInterval: number;
  spawnInterval: number;
  solidBlockSpawnChance: number;
  playerLaneX: number;
  floorY: number;
  ceilingY: number;
}

export interface GameState {
  score: number;
  distance: number;
  speed: number;
  gameOver: boolean;
  isTrapped: boolean;
  gravityDirection: GravityDirection;
}
