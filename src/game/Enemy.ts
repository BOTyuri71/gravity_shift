import Phaser from "phaser";
import { generateEnemyTexture } from "../utils/spriteTextures";

export class Enemy {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private active = true;
  private readonly id: string;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    this.scene = scene;
    this.id = id;

    // Gerar textura do inimigo (apenas uma vez, textura compartilhada)
    if (!scene.textures.exists("enemy")) {
      generateEnemyTexture(scene);
    }

    // Criar sprite com a textura do inimigo
    this.sprite = this.scene.add.sprite(x, y, "enemy");
    this.sprite.setDisplaySize(38, 42);
    this.sprite.setDepth(5);

    // Física do inimigo
    this.scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setVelocityX(0);
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  getId(): string {
    return this.id;
  }

  getIsActive(): boolean {
    return this.active;
  }

  setActive(active: boolean): void {
    this.active = active;
    this.sprite.setActive(active);
    this.sprite.setVisible(active);
  }

  getPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
  }

  moveLeft(distance: number): void {
    this.sprite.x -= distance;
  }

  getBounds(): { left: number; right: number; top: number; bottom: number } {
    const hw = this.sprite.displayWidth / 2;
    const hh = this.sprite.displayHeight / 2;
    return {
      left: this.sprite.x - hw,
      right: this.sprite.x + hw,
      top: this.sprite.y - hh,
      bottom: this.sprite.y + hh,
    };
  }

  checkOverlap(
    otherLeft: number,
    otherRight: number,
    otherTop: number,
    otherBottom: number
  ): boolean {
    const myBounds = this.getBounds();
    const overlapX = Math.min(myBounds.right, otherRight) - Math.max(myBounds.left, otherLeft);
    const overlapY = Math.min(myBounds.bottom, otherBottom) - Math.max(myBounds.top, otherTop);
    return overlapX > 0 && overlapY > 0;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
