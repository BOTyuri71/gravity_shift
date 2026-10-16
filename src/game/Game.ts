import Phaser from "phaser";
import type { GameConfig } from "../types";
import { Player } from "./Player";
import { Level } from "./Level";
import { UI } from "../ui/UI";
import { generatePlayerTextures } from "../utils/spriteTextures";

const DEFAULT_CONFIG: GameConfig = {
  gravity: 800,
  baseSpeed: 200,
  speedIncrement: 25,
  speedIncrementInterval: 500,
  spawnInterval: 2200,
  solidBlockSpawnChance: 0.65,
  playerLaneX: 200,
  floorY: 400,
  ceilingY: 140,
};

export class GameScene extends Phaser.Scene {
  private config: GameConfig;
  private player!: Player;
  private level!: Level;
  private ui!: UI;

  private floorLine!: Phaser.GameObjects.Graphics;
  private ceilingLine!: Phaser.GameObjects.Graphics;
  private backgroundGrid!: Phaser.GameObjects.Graphics;

  constructor() {
    super("GameScene");
    this.config = { ...DEFAULT_CONFIG };
  }

  create(): void {
    const { width, height } = this.scale;

    // Gerar texturas de sprite (player, inimigo, blocos)
    generatePlayerTextures(this);

    // Configurar física
    this.physics.world.setBounds(0, 0, width, height);

    // Criar fundo com grade retro
    this.createBackground(width, height);

    // Criar chão e teto visuais
    this.createFloorCeiling(width, height);

    // Criar jogador
    this.player = new Player(this, {
      ...this.config,
      playerLaneX: this.config.playerLaneX,
    });

    // Criar nível
    this.level = new Level(this, this.config, this.player, () =>
      this.onGameOver(),
    );

    // Criar UI
    this.ui = new UI(this, () => this.restart());

    // Input
    this.input.keyboard?.on("keydown-SPACE", () => {
      this.level.action();
    });

    this.input.on("pointerdown", () => {
      this.level.action();
    });
  }

  private createBackground(width: number, height: number): void {
    this.backgroundGrid = this.add.graphics();
    this.backgroundGrid.lineStyle(1, 0x292d38, 0.6);

    const cellSize = 40;
    for (let x = 0; x <= width; x += cellSize) {
      this.backgroundGrid.lineBetween(x, 48, x, height - 48);
    }
    for (let y = 48; y <= height - 48; y += cellSize) {
      this.backgroundGrid.lineBetween(0, y, width, y);
    }
    this.backgroundGrid.setDepth(-1);
  }

  private createFloorCeiling(width: number, height: number): void {
    // Chão
    this.floorLine = this.add.graphics();
    this.floorLine.lineStyle(16, 0x678d6c, 1);
    this.floorLine.lineBetween(48, height - 40, width - 48, height - 40);
    // Borda do chão
    this.floorLine.lineStyle(2, 0x4a6b4f, 1);
    this.floorLine.lineBetween(48, height - 40, width - 48, height - 40);
    this.floorLine.setDepth(0);

    // Teto
    this.ceilingLine = this.add.graphics();
    this.ceilingLine.lineStyle(16, 0x678d6c, 1);
    this.ceilingLine.lineBetween(48, 40, width - 48, 40);
    // Borda do teto
    this.ceilingLine.lineStyle(2, 0x4a6b4f, 1);
    this.ceilingLine.lineBetween(48, 40, width - 48, 40);
    this.ceilingLine.setDepth(0);
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.level.update(delta);

    const state = this.level.getState();
    this.ui.setScore(state.score);

    if (state.gameOver) {
      this.ui.showGameOver(state.score);
    }
  }

  private onGameOver(): void {
    // Game over será tratado no update via state.gameOver
  }

  private restart(): void {
    this.level.reset();
    this.ui.hideGameOver();
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#151820",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
};

export function startGame(): void {
  new Phaser.Game(config);
}
