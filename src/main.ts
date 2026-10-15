import Phaser from "phaser";
import "./style.css";

class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private scoreText!: Phaser.GameObjects.Text;
  private obstacles: Phaser.Physics.Arcade.Image[] = [];
  private solidBlocks: Phaser.GameObjects.Rectangle[] = [];

  private gravityDirection = 1;
  private score = 0;
  private distance = 0;
  private speed = 320;
  private spawnTimer = 0;
  private gameOver = false;

  // A cada 10 pixels percorridos, ganhas 1 ponto.
  private readonly pixelsPerPoint = 10;

  constructor() {
    super("Game");
  }

  create() {
    const { width, height } = this.scale;

    this.gravityDirection = 1;
    this.score = 0;
    this.distance = 0;
    this.speed = 320;
    this.spawnTimer = 0;
    this.gameOver = false;
    this.obstacles = [];

    this.cameras.main.setBackgroundColor("#10121e");

    // Grelha de fundo.
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x25283b, 0.6);

    for (let x = 0; x < width; x += 48) {
      grid.lineBetween(x, 0, x, height);
    }

    for (let y = 0; y < height; y += 48) {
      grid.lineBetween(0, y, width, y);
    }

    // Chão e teto.
    const ceiling = this.add.rectangle(width / 2, 24, width, 48, 0x343958);

    const floor = this.add.rectangle(
      width / 2,
      height - 24,
      width,
      48,
      0x343958,
    );

    this.physics.add.existing(ceiling, true);
    this.physics.add.existing(floor, true);

    // Criar as texturas antes dos sprites.
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x65f0c4);
    playerGraphics.fillRoundedRect(0, 0, 34, 42, 8);
    playerGraphics.generateTexture("player", 34, 42);
    playerGraphics.destroy();

    const obstacleGraphics = this.make.graphics({ x: 0, y: 0 });
    obstacleGraphics.fillStyle(0xff6b6b);
    obstacleGraphics.fillRoundedRect(0, 0, 38, 42, 6);
    obstacleGraphics.generateTexture("obstacle", 38, 42);
    obstacleGraphics.destroy();

    const blockGraphics = this.make.graphics({ x: 0, y: 0 });
    blockGraphics.fillStyle(0x65a9ff);
    blockGraphics.fillRoundedRect(0, 0, 100, 24, 5);
    blockGraphics.generateTexture("solid-block", 100, 24);
    blockGraphics.destroy();

    // Personagem.
    this.player = this.physics.add.sprite(140, height - 72, "player");

    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1000);
    this.player.setBounce(0);
    this.player.setDepth(2);

    this.physics.add.collider(this.player, floor);
    this.physics.add.collider(this.player, ceiling);

    // O único controlo de teclado é a tecla Espaço.
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    // Interface.
    this.add
      .text(24, 20, "GRAVITY SHIFT", {
        fontFamily: "monospace",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#65f0c4",
      })
      .setDepth(3);

    this.scoreText = this.add
      .text(24, 52, "SCORE  0", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setDepth(3);

    this.add
      .text(width - 20, 24, "SPACE / BOTÃO", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#a9afc8",
      })
      .setOrigin(1, 0)
      .setDepth(3);
  }

  // Todas as formas de controlo chamam esta função.
  action() {
    if (this.gameOver) {
      this.scene.restart();
      return;
    }

    this.gravityDirection *= -1;

    this.player.setGravityY(this.gravityDirection * 1000);

    // Impulso para chegar ao teto ou regressar ao chão.
    this.player.setVelocityY(this.gravityDirection * 420);
  }

  private spawnObstacle() {
    const { width, height } = this.scale;

    // Os obstáculos podem aparecer junto ao teto ou ao chão.
    const fromCeiling = Math.random() < 0.5;
    const y = fromCeiling ? 72 : height - 72;

    const obstacle = this.physics.add.image(width + 40, y, "obstacle");

    obstacle.body?.setAllowGravity(false);
    obstacle.setImmovable(true);
    obstacle.setVelocityX(-this.speed);
    obstacle.setDepth(1);

    this.obstacles.push(obstacle);

    this.physics.add.overlap(this.player, obstacle, () => this.endGame());
  }

  private spawnSolidBlock() {
    const width = Phaser.Math.Between(35, 110);
    const height = Phaser.Math.Between(25, 100);

    // Alterna entre obstáculos próximos do teto e do chão
    const fromCeiling = Math.random() < 0.5;

    const y = fromCeiling
      ? Phaser.Math.Between(70, 160)
      : Phaser.Math.Between(this.scale.height - 160, this.scale.height - 70);

    const shapes = [0x678dff, 0x9b6dff, 0x45c4a1, 0xffb347];

    const block = this.add.rectangle(
      this.scale.width + width,
      y,
      width,
      height,
      Phaser.Utils.Array.GetRandom(shapes),
    );

    this.physics.add.existing(block);

    const body = block.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setVelocityX(-this.speed);

    this.physics.add.collider(this.player, block);

    this.solidBlocks.push(block);
  }

  private endGame() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.physics.pause();

    const { width, height } = this.scale;

    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x10121e,
      0.88,
    );

    overlay.setDepth(5);

    this.add
      .text(width / 2, height / 2 - 65, "FIM DO JOGO", {
        fontFamily: "monospace",
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ff6b6b",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.add
      .text(width / 2, height / 2 - 12, `PONTUAÇÃO: ${this.score}`, {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#65f0c4",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.add
      .text(
        width / 2,
        height / 2 + 35,
        `DISTÂNCIA: ${(this.distance / 100).toFixed(1)} m virtuais`,
        {
          fontFamily: "monospace",
          fontSize: "15px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5)
      .setDepth(6);

    this.add
      .text(width / 2, height / 2 + 80, "Carrega no botão para recomeçar", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#a9afc8",
      })
      .setOrigin(0.5)
      .setDepth(6);
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;

    // Impede que manter Espaço pressionado inverta
    // a gravidade continuamente.
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.action();
    }

    // Distância baseada no deslocamento do cenário.
    // Distância percorrida em pixels convertida para metros
    this.distance += (this.speed * delta) / 1000;

    const distanceInMeters = Math.floor(this.distance);

    // Aumenta a velocidade a cada 500 metros
    const speedLevel = Math.floor(distanceInMeters / 500);
    this.speed = 500 + speedLevel * 100;

    // A pontuação depende exclusivamente da distância.
    this.score = Math.floor(this.distance / this.pixelsPerPoint);

    this.scoreText.setText(`SCORE  ${this.score}`);

    // A dificuldade aumenta à medida que jogas.
    this.speed = Math.min(320 + this.score * 0.5, 600);

    // Criar obstáculos periodicamente.
    this.spawnTimer += delta;

    if (this.spawnTimer >= 1500) {
      this.spawnTimer = 0;

      if (Math.random() < 0.65) {
        this.spawnSolidBlock();
      } else {
        this.spawnObstacle();
      }
    }

    // Movimentar e remover obstáculos.
    this.obstacles = this.obstacles.filter((obstacle) => {
      if (obstacle.x < -50) {
        obstacle.destroy();
        return false;
      }

      obstacle.setVelocityX(-this.speed);
      return true;
    });

    if (this.player.x < 20) {
      this.endGame();
      return;
    }
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",

  width: 960,
  height: 540,

  backgroundColor: "#10121e",

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
});

// O botão do ecrã e a tecla Espaço executam a mesma ação.
const actionButton =
  document.querySelector<HTMLButtonElement>("#action-button");

actionButton?.addEventListener("click", () => {
  const scene = game.scene.getScene("Game") as GameScene;
  scene.action();
});
