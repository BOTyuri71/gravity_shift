import Phaser from "phaser";
import { generateBlockTexture } from "../utils/spriteTextures";

export class Obstacle {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private active = true;
  private readonly id: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    id: string,
  ) {
    this.scene = scene;
    this.id = id;

    // Gerar textura pixel art retro para o bloco
    generateBlockTexture(scene, id, size);

    // Criar sprite com a textura
    this.sprite = this.scene.add.sprite(x, y, `block-${id}`);
    this.sprite.setDisplaySize(size, size);
    this.sprite.setDepth(5);

    // Física do bloco
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

    // Sincronizar o corpo de física do Arcade Engine
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.x -= distance;
      body.updateFromGameObject();
    }
  }

  getBounds(): { left: number; right: number; top: number; bottom: number } {
    const half = this.sprite.displayWidth / 2;
    return {
      left: this.sprite.x - half,
      right: this.sprite.x + half,
      top: this.sprite.y - half,
      bottom: this.sprite.y + half,
    };
  }

  checkSideCollision(
    otherLeft: number,
    otherRight: number,
    otherTop: number,
    otherBottom: number,
  ): boolean {
    const myBounds = this.getBounds();
    const overlapY =
      Math.min(myBounds.bottom, otherBottom) - Math.max(myBounds.top, otherTop);
    if (overlapY <= 0) return false;
    const overlapRight = myBounds.right - otherLeft;
    const overlapLeft = otherRight - myBounds.left;
    return overlapRight > 0 || overlapLeft > 0;
  }

  checkVerticalCollision(
    otherLeft: number,
    otherRight: number,
    otherTop: number,
    otherBottom: number,
  ): boolean {
    const myBounds = this.getBounds();
    const overlapX =
      Math.min(myBounds.right, otherRight) - Math.max(myBounds.left, otherLeft);
    if (overlapX <= 0) return false;
    const overlapTop = myBounds.bottom - otherTop;
    const overlapBottom = otherBottom - myBounds.top;
    return overlapTop > 0 || overlapBottom > 0;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
