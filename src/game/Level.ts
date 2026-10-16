import Phaser from "phaser";
import type { GameConfig, GameState } from "../types";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Enemy } from "./Enemy";

const SHAPES: number[][][] = [
  [[0, 0]],
  [
    [0, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
];

const BLOCK_SIZE = 40;
const ENEMY_SIZE = 40;

export class Level {
  private scene: Phaser.Scene;
  private config: GameConfig;
  private player: Player;

  private obstacles: Obstacle[] = [];
  private enemies: Enemy[] = [];
  private obstacleCount = 0;
  private enemyCount = 0;

  private state: GameState = {
    score: 0,
    distance: 0,
    speed: 250,
    gameOver: false,
    isTrapped: false,
    gravityDirection: 1,
  };

  private spawnTimer = 0;
  private releasedObstacleId: string | null = null;

  private onGameOver: () => void = () => {};

  constructor(
    scene: Phaser.Scene,
    config: GameConfig,
    player: Player,
    onGameOver: () => void
  ) {
    this.scene = scene;
    this.config = config;
    this.player = player;
    this.onGameOver = onGameOver;

    this.state.speed = config.baseSpeed;
    this.state.gravityDirection = 1;
  }

  getState(): GameState {
    return { ...this.state };
  }

  getObstacles(): Obstacle[] {
    return this.obstacles.filter((o) => o.getIsActive());
  }

  getEnemies(): Enemy[] {
    return this.enemies.filter((e) => e.getIsActive());
  }

  getPlayer(): Player {
    return this.player;
  }

  spawnObstacle(): void {
    const spawnX = this.scene.scale.width + 60;
    const fromCeiling = Math.random() < 0.5;
    const maxRow = 2;

    const ceilingY = this.config.ceilingY;
    const floorY = this.config.floorY;

    const firstY = fromCeiling
      ? ceilingY + BLOCK_SIZE / 2
      : floorY - BLOCK_SIZE / 2 - maxRow * BLOCK_SIZE;

    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    for (const [column, row] of shape) {
      const x = spawnX + column * BLOCK_SIZE;
      const y = firstY + row * BLOCK_SIZE;

      const obstacle = new Obstacle(
        this.scene,
        x,
        y,
        BLOCK_SIZE,
        `obs-${this.obstacleCount++}`
      );

      this.obstacles.push(obstacle);
    }
  }

  spawnEnemy(): void {
    const spawnX = this.scene.scale.width + 60;
    const fromCeiling = Math.random() < 0.5;
    const y = fromCeiling
      ? this.config.ceilingY + ENEMY_SIZE / 2
      : this.config.floorY - ENEMY_SIZE / 2;

    const enemy = new Enemy(
      this.scene,
      spawnX,
      y,
      `enemy-${this.enemyCount++}`
    );

    this.enemies.push(enemy);
  }

  update(delta: number): void {
    if (this.state.gameOver) {
      return;
    }

    // Atualizar distância e velocidade
    this.state.distance += (this.state.speed * delta) / 1000;
    this.state.speed =
      this.config.baseSpeed +
      Math.floor(this.state.distance / 200) * 1;
    this.state.score = Math.floor(this.state.distance / 10);

    // Timer de spawn
    this.spawnTimer += delta;
    if (this.spawnTimer >= 2200) {
      this.spawnTimer -= 2200;
      if (Math.random() < this.config.solidBlockSpawnChance) {
        this.spawnObstacle();
      } else {
        this.spawnEnemy();
      }
    }

    // Se estiver preso, não movimentar entidades (mundo parado em relação ao jogador)
    if (this.state.isTrapped) {
      return;
    }

    const moveAmount = (this.state.speed * delta) / 1000;

    // Mover obstáculos para a esquerda
    for (const obstacle of this.obstacles) {
      if (!obstacle.getIsActive()) continue;
      obstacle.moveLeft(moveAmount);
    }

    // Mover inimigos para a esquerda
    for (const enemy of this.enemies) {
      if (!enemy.getIsActive()) continue;
      enemy.moveLeft(moveAmount);
    }

    // Detetar colisões com inimigos (game over imediato)
    const playerBounds = this.getPlayerBounds();

    for (const enemy of this.enemies) {
      if (!enemy.getIsActive()) continue;
      if (enemy.checkOverlap(playerBounds.left, playerBounds.right, playerBounds.top, playerBounds.bottom)) {
        this.endGame();
        return;
      }
    }

    // Detetar colisões com obstáculos
    for (const obstacle of this.obstacles) {
      if (!obstacle.getIsActive()) continue;

      // Verificar colisão lateral primeiro
      const sideCollision = obstacle.checkSideCollision(
        playerBounds.left,
        playerBounds.right,
        playerBounds.top,
        playerBounds.bottom
      );

      if (sideCollision && !this.state.isTrapped) {
        // Colisão lateral - prender o jogador
        this.state.isTrapped = true;
        this.player.setTrapped(true, obstacle.getId());
        continue;
      }

      // Verificar colisão vertical (pousar em cima ou bater cabeça)
      if (!this.state.isTrapped) {
        const verticalCollision = obstacle.checkVerticalCollision(
          playerBounds.left,
          playerBounds.right,
          playerBounds.top,
          playerBounds.bottom
        );
        if (verticalCollision) {
          // Ajustar posição Y para não atravessar, mas manter movimento livre
          const gravityDir = this.player.getGravityDirection();
          const obsBounds = obstacle.getBounds();
          const halfHeight = 18;

          if (gravityDir === 1) {
            // Cai para baixo - pousou em cima do obstáculo
            if (playerBounds.bottom > obsBounds.top - 2) {
              this.player.getContainer().y = obsBounds.top - halfHeight;
              this.player.getBody().position.set(
                this.player.getContainer().x,
                this.player.getContainer().y
              );
              this.player.setVelocityY(0);
            }
          } else {
            // Cai para cima - bateu cabeça por baixo
            if (playerBounds.top < obsBounds.bottom + 2) {
              this.player.getContainer().y = obsBounds.bottom + halfHeight;
              this.player.getBody().position.set(
                this.player.getContainer().x,
                this.player.getContainer().y
              );
              this.player.setVelocityY(0);
            }
          }
        }
      }
    }

    // Limpar obstáculos que saíram do ecrã
    this.obstacles = this.obstacles.filter((obstacle) => {
      if (!obstacle.getIsActive()) return false;
      if (obstacle.getPosition().x < -100) {
        obstacle.destroy();
        if (this.releasedObstacleId === obstacle.getId()) {
          this.releasedObstacleId = null;
        }
        if (
          this.state.isTrapped &&
          this.player.getTrappedObstacleId() === obstacle.getId()
        ) {
          this.releasePlayer();
        }
        return false;
      }
      return true;
    });

    // Limpar inimigos que saíram do ecrã
    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy.getIsActive()) return false;
      if (enemy.getPosition().x < -100) {
        enemy.destroy();
        return false;
      }
      return true;
    });

    // Verificar se jogador saiu do ecrã à esquerda
    if (this.player.getX() < 20) {
      this.endGame();
    }
  }

  private getPlayerBounds(): { left: number; right: number; top: number; bottom: number } {
    const body = this.player.getBody();
    const hw = body.width / 2;
    const hh = body.height / 2;
    return {
      left: body.x - hw,
      right: body.x + hw,
      top: body.y - hh,
      bottom: body.y + hh,
    };
  }

  releasePlayer(): void {
    this.state.isTrapped = false;
    this.player.setTrapped(false, null);
    const gravityDir = this.player.getGravityDirection();
    this.state.gravityDirection = gravityDir;
  }

  action(): void {
    if (this.state.gameOver) {
      this.onGameOver();
      return;
    }

    if (this.state.isTrapped) {
      // Libertar o jogador
      this.releasePlayer();
      this.state.isTrapped = false;
      this.player.setTrapped(false, null);
      return;
    }

    // Inverter gravidade
    this.player.invertGravity();
    this.state.gravityDirection = this.player.getGravityDirection();
  }

  private endGame(): void {
    this.state.gameOver = true;
    this.onGameOver();
  }

  reset(): void {
    this.state = {
      score: 0,
      distance: 0,
      speed: this.config.baseSpeed,
      gameOver: false,
      isTrapped: false,
      gravityDirection: 1,
    };
    this.spawnTimer = 0;
    this.releasedObstacleId = null;

    for (const obstacle of this.obstacles) {
      obstacle.destroy();
    }
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.obstacles = [];
    this.enemies = [];
    this.obstacleCount = 0;
    this.enemyCount = 0;

    this.player.reset();
  }

  dispose(): void {
    for (const obstacle of this.obstacles) {
      obstacle.destroy();
    }
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
  }
}
