import Phaser from "phaser";

export class UI {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private gameOverContainer!: Phaser.GameObjects.Container;
  private finalScoreText!: Phaser.GameObjects.Text;
  private restartButton!: Phaser.GameObjects.Text;

  private onRestart: () => void;

  constructor(scene: Phaser.Scene, onRestart: () => void) {
    this.scene = scene;
    this.onRestart = onRestart;

    const { width, height } = this.scene.scale;

    // Score
    this.scoreText = this.scene.add.text(20, 20, "Score: 0", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "Courier New, monospace",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.scoreText.setDepth(100);

    // Instructions
    this.instructionText = this.scene.add.text(
      width / 2,
      20,
      "SPACE / CLICK: INVERTER GRAVIDADE",
      {
        fontSize: "16px",
        color: "#bbbbbb",
        fontFamily: "Courier New, monospace",
        stroke: "#000000",
        strokeThickness: 3,
      }
    );
    this.instructionText.setOrigin(0.5, 0);
    this.instructionText.setDepth(100);

    // Game Over Container
    this.gameOverContainer = this.scene.add.container(width / 2, height / 2);
    this.gameOverContainer.setDepth(200);
    this.gameOverContainer.setVisible(false);

    // Fundo semi-transparente
    const bg = this.scene.add.rectangle(0, 0, 400, 300, 0x151820, 0.95);
    bg.setStrokeStyle(4, 0xffffff);
    this.gameOverContainer.add(bg);

    // Título
    const title = this.scene.add.text(0, -80, "GAME OVER", {
      fontSize: "34px",
      color: "#ffffff",
      fontFamily: "Courier New, monospace",
      stroke: "#000000",
      strokeThickness: 4,
    });
    title.setOrigin(0.5);
    this.gameOverContainer.add(title);

    // Score final
    this.finalScoreText = this.scene.add.text(0, -20, "Score: 0", {
      fontSize: "20px",
      color: "#bbbbbb",
      fontFamily: "Courier New, monospace",
    });
    this.finalScoreText.setOrigin(0.5);
    this.gameOverContainer.add(this.finalScoreText);

    // Botão restart
    this.restartButton = this.scene.add.text(
      0,
      40,
      "Carregar no botão para recomeçar",
      {
        fontSize: "18px",
        color: "#151820",
        backgroundColor: "#45b6fe",
        padding: { x: 20, y: 10 },
        fontFamily: "Courier New, monospace",
        fontStyle: "bold",
      }
    );
    this.restartButton.setOrigin(0.5);
    this.restartButton.setInteractive({ useHandCursor: true });
    this.restartButton.on("pointerdown", () => {
      this.onRestart();
    });
    this.gameOverContainer.add(this.restartButton);
  }

  setScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  showGameOver(score: number): void {
    this.finalScoreText.setText(`Score: ${score}`);
    this.gameOverContainer.setVisible(true);
    this.instructionText.setVisible(false);
  }

  hideGameOver(): void {
    this.gameOverContainer.setVisible(false);
    this.instructionText.setVisible(true);
  }

  destroy(): void {
    this.scoreText.destroy();
    this.instructionText.destroy();
    this.gameOverContainer.destroy();
  }
}
