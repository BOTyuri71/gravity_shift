import Phaser from "phaser";
import type { GravityDirection, GameConfig } from "../types";

export class Player {
  private scene: Phaser.Scene;
  private config: GameConfig;
  private container: Phaser.GameObjects.Container;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private body: Phaser.Physics.Arcade.Body;
  private gravityDirection: GravityDirection = 1;
  private isTrapped = false;
  private trappedObstacleId: string | null = null;
  private velocityY = 0;

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.scene = scene;
    this.config = config;

    // Container do jogador (para fazer flip Y ao inverter gravidade)
    this.container = this.scene.add.container(
      config.playerLaneX,
      config.floorY,
    );
    this.container.setDepth(10);

    // Sprite de física
    this.sprite = this.scene.physics.add.sprite(
      config.playerLaneX,
      config.floorY,
      "player-idle",
    );
    this.sprite.setSize(24, 36);
    this.sprite.setOffset(-12, -18);
    this.sprite.setGravityY(0);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setVelocityX(0);
    this.sprite.setVelocityY(0);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Adicionar sprite ao container
    this.container.add(this.sprite);
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  getBody(): Phaser.Physics.Arcade.Body {
    return this.body;
  }

  getGravityDirection(): GravityDirection {
    return this.gravityDirection;
  }

  getIsTrapped(): boolean {
    return this.isTrapped;
  }

  getTrappedObstacleId(): string | null {
    return this.trappedObstacleId;
  }

  getX(): number {
    return this.container.x;
  }

  getY(): number {
    return this.container.y;
  }

  invertGravity(): void {
    this.gravityDirection = this.gravityDirection === 1 ? -1 : 1;
    // Virar 180 graus no eixo Y
    this.container.scaleY = this.gravityDirection === 1 ? 1 : -1;
    if (this.gravityDirection === 1) {
      this.container.y = this.config.floorY;
    } else {
      this.container.y = this.config.ceilingY;
    }
    this.sprite.setPosition(0, 0);
  }

  setTrapped(trapped: boolean, obstacleId: string | null = null): void {
    this.isTrapped = trapped;
    this.trappedObstacleId = obstacleId;
    if (trapped) {
      this.velocityY = 0;
      this.body.setVelocity(0, 0);
      this.sprite.anims.stop();
      this.sprite.setTexture("player-idle");
    } else {
      this.sprite.anims.play("player-walk", true);
    }
  }

  setVelocityY(value: number): void {
    this.velocityY = value;
    this.body.setVelocityY(value);
  }

  update(delta: number): void {
    if (this.isTrapped) {
      this.velocityY = 0;
      this.body.setVelocity(0, 0);
      this.container.x = this.config.playerLaneX;
      return;
    }

    const dt = delta / 1000;

    // Aplicar gravidade
    const gravityY = this.gravityDirection * this.config.gravity;
    this.velocityY += gravityY * dt;

    let newY = this.container.y + this.velocityY * dt;

    const halfHeight = 18;

    if (this.gravityDirection === 1) {
      const floorLimit = this.config.floorY + halfHeight;
      if (newY > floorLimit) {
        newY = floorLimit;
        this.velocityY = 0;
      }
    } else {
      const ceilingLimit = this.config.ceilingY - halfHeight;
      if (newY < ceilingLimit) {
        newY = ceilingLimit;
        this.velocityY = 0;
      }
    }

    this.container.y = newY;
    this.container.x = this.config.playerLaneX;

    // Sincronizar corpo físico com container
    this.body.position.set(this.container.x, this.container.y);

    // Garantir animação de andar tocando
    if (
      !this.sprite.anims.isPlaying ||
      this.sprite.anims.currentAnim?.key !== "player-walk"
    ) {
      this.sprite.anims.play("player-walk", true);
    }

    // Aplicar escala Y (gravidade invertida) - manter consistente
    this.container.scaleY = this.gravityDirection === 1 ? 1 : -1;
  }

  reset(): void {
    this.gravityDirection = 1;
    this.isTrapped = false;
    this.trappedObstacleId = null;
    this.velocityY = 0;
    this.container.scaleY = 1;
    this.container.setPosition(this.config.playerLaneX, this.config.floorY);
    this.body.position.set(this.config.playerLaneX, this.config.floorY);
    this.body.setVelocity(0, 0);
    this.sprite.setTexture("player-idle");
    this.sprite.anims.stop();
  }

  destroy(): void {
    this.container.destroy();
    this.sprite.destroy();
  }
}
