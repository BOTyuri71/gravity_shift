import Phaser from "phaser";

export function generatePlayerTextures(scene: Phaser.Scene): void {
  const skin = 0xffccaa;
  const blue = 0x45b6fe;
  const darkBlue = 0x2a9df4;
  const black = 0x000000;
  const white = 0xffffff;

  const w = 32;
  const h = 42;

  const drawFrame = (
    g: Phaser.GameObjects.Graphics,
    legOffset: number,
    armOffset: number,
  ) => {
    g.clear();

    // Cabeça
    g.fillStyle(skin, 1);
    g.fillRect(-10, -18, 20, 12);
    // Cabelo
    g.fillStyle(black, 1);
    g.fillRect(-10, -18, 20, 4);
    // Olhos
    g.fillStyle(white, 1);
    g.fillRect(-6, -14, 4, 4);
    g.fillRect(2, -14, 4, 4);
    g.fillStyle(black, 1);
    g.fillRect(-5, -13, 2, 2);
    g.fillRect(3, -13, 2, 2);

    // Corpo
    g.fillStyle(blue, 1);
    g.fillRect(-8, -6, 16, 14);
    g.fillStyle(darkBlue, 1);
    g.fillRect(-4, -2, 8, 2);

    // Pernas
    g.fillStyle(darkBlue, 1);
    g.fillRect(-6, 8 + legOffset, 6, 14 - Math.abs(legOffset));
    g.fillRect(0, 8 - legOffset, 6, 14 - Math.abs(legOffset));

    // Braços
    g.fillStyle(blue, 1);
    g.fillRect(-12, -4 - armOffset, 6, 10);
    g.fillRect(6, -4 + armOffset, 6, 10);

    // Pés
    g.fillStyle(black, 1);
    g.fillRect(-6, 22, 6, 4);
    g.fillRect(0, 22, 6, 4);
  };

  // Gerar texturas individuais para cada frame de andar
  for (let i = 0; i < 4; i++) {
    const textureKey = `player-walk-${i}`;
    if (!scene.textures.exists(textureKey)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      const legOffset = Math.floor((i / 2) * 6) * (i % 2 === 0 ? 1 : -1);
      const armOffset = -legOffset;
      drawFrame(g, legOffset, armOffset);
      g.generateTexture(textureKey, w, h);
      g.destroy();
    }
  }

  // Frame parado (idle)
  if (!scene.textures.exists("player-idle")) {
    const gIdle = scene.make.graphics({ x: 0, y: 0 });
    drawFrame(gIdle, 0, 0);
    gIdle.generateTexture("player-idle", w, h);
    gIdle.destroy();
  }

  // Criar a animação global no Animation Manager
  if (!scene.anims.exists("player-walk")) {
    scene.anims.create({
      key: "player-walk",
      frames: [
        { key: "player-walk-0" },
        { key: "player-walk-1" },
        { key: "player-walk-2" },
        { key: "player-walk-3" },
      ],
      frameRate: 10,
      repeat: -1,
    });
  }
}

export function generateEnemyTexture(scene: Phaser.Scene): void {
  const red = 0xff4040;
  const darkRed = 0xcc0000;
  const white = 0xffffff;
  const black = 0x000000;

  const px = 4;
  const w = 40;
  const h = 44;
  const cols = 10;
  const rows = 11;

  if (scene.textures.exists("enemy")) return;

  const g = scene.make.graphics({ x: 0, y: 0 });

  // Corpo vermelho
  g.fillStyle(red, 1);
  for (let y = 0; y < rows; y++) {
    for (let x = 1; x < cols - 1; x++) {
      g.fillRect(x * px, y * px, px - 1, px - 1);
    }
  }

  // Cabeça vermelho escuro
  g.fillStyle(darkRed, 1);
  for (let y = 0; y < 3; y++) {
    for (let x = 1; x < cols - 1; x++) {
      g.fillRect(x * px, y * px, px - 1, px - 1);
    }
  }

  // Olhos
  g.fillStyle(white, 1);
  g.fillRect(3 * px, 1 * px, px - 1, px - 1);
  g.fillRect(7 * px, 1 * px, px - 1, px - 1);
  g.fillStyle(black, 1);
  g.fillRect(3 * px, 1 * px, 2, 2);
  g.fillRect(7 * px, 1 * px, 2, 2);

  // Sobrancelhas
  g.fillStyle(black, 1);
  g.fillRect(2 * px, 0, px - 1, px - 1);
  g.fillRect(3 * px, 0, px - 1, px - 1);
  g.fillRect(6 * px, 0, px - 1, px - 1);
  g.fillRect(7 * px, 0, px - 1, px - 1);

  // Sorriso
  g.fillStyle(white, 1);
  g.fillRect(4 * px, 3 * px, px - 1, px - 1);
  g.fillRect(5 * px, 3 * px, px - 1, px - 1);
  g.fillRect(6 * px, 3 * px, px - 1, px - 1);

  // Pernas e pés
  g.fillStyle(darkRed, 1);
  for (let y = 8; y < 11; y++) {
    g.fillRect(3 * px, y * px, px - 1, px - 1);
    g.fillRect(6 * px, y * px, px - 1, px - 1);
  }
  g.fillStyle(black, 1);
  for (let x = 2; x < 8; x++) {
    g.fillRect(x * px, 10 * px, px - 1, px - 1);
  }

  g.generateTexture("enemy", w, h);
  g.destroy();
}

export function generateBlockTexture(
  scene: Phaser.Scene,
  id: string,
  size: number,
): void {
  const textureKey = `block-${id}`;
  if (scene.textures.exists(textureKey)) return;

  const gray = 0x8c8c9b;
  const darkGray = 0x6b6b75;
  const lightGray = 0xbdbdc9;

  const px = 4;
  const cols = Math.ceil(size / px);
  const rows = Math.ceil(size / px);

  const g = scene.make.graphics({ x: 0, y: 0 });

  // Preenchimento
  g.fillStyle(gray, 1);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      g.fillRect(x * px, y * px, px - 1, px - 1);
    }
  }

  // Borda escura
  g.fillStyle(darkGray, 1);
  for (let x = 0; x < cols; x++) {
    g.fillRect(x * px, 0, px - 1, px - 1);
    g.fillRect(x * px, (rows - 1) * px, px - 1, px - 1);
  }
  for (let y = 0; y < rows; y++) {
    g.fillRect(0, y * px, px - 1, px - 1);
    g.fillRect((cols - 1) * px, y * px, px - 1, px - 1);
  }

  // Detalhe interno
  g.fillStyle(lightGray, 1);
  for (let x = 2; x < cols - 2; x++) {
    g.fillRect(x * px, 2 * px, px - 1, px - 1);
    g.fillRect(x * px, (rows - 3) * px, px - 1, px - 1);
  }
  for (let y = 2; y < rows - 2; y++) {
    g.fillRect(2 * px, y * px, px - 1, px - 1);
    g.fillRect((cols - 3) * px, y * px, px - 1, px - 1);
  }

  g.generateTexture(textureKey, size, size);
  g.destroy();
}
