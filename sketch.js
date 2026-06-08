let slowTimer = 0;
let invincibleTimer = 0;
let boostTimer = 0;

let gameState = "OPENING";
let currentStage = 1;
let storyStep = 0;
let isProfLoveObtained = false;
let viewRadius = 80;

let profProjectiles = [];
let profAttackTimer = 0;
let score = 0;
let highScore = 0;
let hitFlashTimer = 0;
let collectFlashTimer = 0;

let scorePopups = [];

let garageShopMessage = "";
let garageShopMsgTimer = 0;
let preGameViewBonus = 0;

let imgOpening;
let bgmDark;
let bgmClear;
let currentPlayingBgm = null;

let soundGhostRoar;
let soundStartScream;
let soundStartThud;
let soundCarCrash;

let isStartSoundPlayed = false;
let isGhostSoundPlayed = false;

let fogGraphics;

let carColors = ["#E8E0C8", "#1A3A5C", "#8B2222", "#2D5A27", "#4A3B2A"];
let carColorNames = ["IVORY", "NAVY", "CRIMSON", "FOREST", "SAND"];
let carColorIdx = 0;
let hasSiren = true;
let carTypes = ["세단", "SUV", "스포츠카", "트럭", "모닝", "★SUPERCAR★"];
let carTypeIdx = 0;
let supercarUnlocked = false;

// ── 체력 시스템 ──
let carHP = 10;
const MAX_HP = 10;

// ── 홀짝 승리 여부 (EXIT 활성화 조건) ──
let oeWon = false;

let car;
let buttons = {};
let monsterTriggered = false;
let shakeTimer = 0;

let monsterPhase = "IDLE";
let monsterTimer = 0;
const MONSTER_APPEAR_FRAMES = 38;
let monsterFaceScale = 0;

let groundDebris = [];
let wallCracks = [];
let lightFlicker = [];

let miniGameStep = "SELECT";
let miniGameTimer = 0;
let pChoice = "";
let cChoice = "";
let miniGameResultText = "";
let isMiniGameWin = false;
let profEasterEggUsed = false;

let rpsPlayerScore = 0;
let rpsComputerScore = 0;
let rpsDomButtons = [];

let countdownState = "IDLE";
let countdownValue = 3;
let countdownTimer = 0;
let COUNTDOWN_FRAMES = 55;
let GO_FRAMES = 45;

let rpsResultAnim = 0;
let rpsResultType = "none";

let resultOverlayTimer = 0;
let resultOverlayType = "none";

let lastSpawnTypes = [];

const ORIGINAL_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,1,'B',1,0,'R',0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,'O',0,0,0,0,0,0,0,0,0,'E'],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

let mazeMap = ORIGINAL_MAZE.map(r => [...r]);

let tileSize = 160;
let currentMiniGame = "";
let triggeredGridR = 0;
let triggeredGridC = 0;

let cnv;
let displayScale = 1;
let offsetX = 0;
let offsetY = 0;

function getDtScale() {
  return min(deltaTime / 16.667, 1.5);
}

let wallTextureSeed = [];
let floorTextureSeed = [];

function getVirtualMouseX() { return (mouseX - offsetX) / displayScale; }
function getVirtualMouseY() { return (mouseY - offsetY) / displayScale; }

// ─── 픽셀아트 버튼 클래스 ─────────────────────────────────────
class PixelButton {
  constructor(label, x, y, w, h, onClick) {
    this.label = label; this.x = x; this.y = y;
    this.w = w; this.h = h; this.onClick = onClick;
    this.hoverAnim = 0;
  }
  draw() {
    let vmX = getVirtualMouseX();
    let vmY = getVirtualMouseY();
    let isHover = (vmX > this.x && vmX < this.x + this.w &&
                   vmY > this.y && vmY < this.y + this.h);
    this.hoverAnim = lerp(this.hoverAnim, isHover ? 1 : 0, 0.25);
    if (isHover) cursor(HAND);
    push();
    rectMode(CORNER);
    fill(0, 0, 0, 80); noStroke();
    rect(this.x + 3, this.y + 3, this.w, this.h, 2);
    let bg = lerpColor(color(22, 26, 40), color(40, 50, 70), this.hoverAnim);
    fill(bg);
    stroke(lerpColor(color(60, 70, 100), color(180, 200, 255), this.hoverAnim));
    strokeWeight(1.5);
    rect(this.x, this.y, this.w, this.h, 2);
    stroke(255, 255, 255, 30 + this.hoverAnim * 40); strokeWeight(1);
    line(this.x + 3, this.y + 1, this.x + this.w - 3, this.y + 1);
    noStroke();
    fill(lerpColor(color(180, 190, 210), color(255, 255, 255), this.hoverAnim));
    textAlign(CENTER, CENTER); textSize(12); textStyle(BOLD);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    pop();
  }
  click() {
    let vmX = getVirtualMouseX();
    let vmY = getVirtualMouseY();
    if (vmX > this.x && vmX < this.x + this.w &&
        vmY > this.y && vmY < this.y + this.h) {
      this.onClick();
    }
  }
}

// ─── 프리로드 ────────────────────────────────────────────────
function preload() {
  soundFormats('mp3', 'wav');
  bgmDark  = loadSound('MP_한치 앞도 보이지않아.mp3');
  bgmClear = loadSound('MP_맑게 개인 하늘.mp3');
  soundGhostRoar   = loadSound('귀신 고함 (1).mp3');
  soundStartScream = loadSound('비명소리.mp3');
  soundStartThud   = loadSound('쿵.mp3');
  soundCarCrash    = loadSound('자동차 충돌.wav');
  imgOpening = loadImage('opening.png');
}

// ─── 셋업 ────────────────────────────────────────────────────
function setup() {
  cnv = createCanvas(600, 400);
  updateCanvasSize();
  textFont('Courier New');
  car = new Car(1 * tileSize + tileSize / 2, 1 * tileSize + tileSize / 2);
  initButtons();
  loadGameProgress();
  generateEnvironment();
  fogGraphics = createGraphics(600, 400);
}

function updateCanvasSize() {
  let w = windowWidth, h = windowHeight;
  if (!fullscreen()) {
    w = 600; h = 400; displayScale = 1; offsetX = 0; offsetY = 0;
    resizeCanvas(w, h);
    cnv.style('position', 'relative');
    cnv.style('margin', '20px auto');
  } else {
    resizeCanvas(w, h);
    cnv.style('position', 'absolute');
    cnv.style('top', '0px'); cnv.style('left', '0px'); cnv.style('margin', '0px');
    let cr = w / h, br = 600 / 400;
    if (cr > br) {
      displayScale = h / 400; offsetX = (w - 600 * displayScale) / 2; offsetY = 0;
    } else {
      displayScale = w / 600; offsetX = 0; offsetY = (h - 400 * displayScale) / 2;
    }
  }
  if (gameState === "MINIGAME" && currentMiniGame === "RPS" && miniGameStep === "SELECT") {
    createRPSButtons();
  }
  updateAbortButtonPos();
}

function generateEnvironment() {
  groundDebris = [];
  for (let i = 0; i < 80; i++) {
    groundDebris.push({
      x: random(mazeMap[0].length * tileSize),
      y: random(mazeMap.length * tileSize),
      w: random(3, 18), h: random(3, 18),
      alpha: random(15, 45),
      type: floor(random(3))
    });
  }
  wallCracks = [];
  for (let i = 0; i < 40; i++) {
    wallCracks.push({
      x: random(mazeMap[0].length * tileSize),
      y: random(mazeMap.length * tileSize),
      len: random(10, 40),
      angle: random(TWO_PI)
    });
  }
  wallTextureSeed = [];
  floorTextureSeed = [];
  for (let r = 0; r < mazeMap.length; r++) {
    wallTextureSeed[r] = [];
    floorTextureSeed[r] = [];
    for (let c = 0; c < mazeMap[0].length; c++) {
      wallTextureSeed[r][c] = random(1000);
      floorTextureSeed[r][c] = random(1000);
    }
  }
  lightFlicker = [];
  for (let r = 1; r < mazeMap.length - 1; r++) {
    for (let c = 1; c < mazeMap[0].length - 1; c++) {
      if (mazeMap[r][c] === 0 || mazeMap[r][c] === 'R' ||
          mazeMap[r][c] === 'O' || mazeMap[r][c] === 'B') {
        if (random() < 0.25) {
          lightFlicker.push({
            x: c * tileSize + tileSize / 2,
            y: r * tileSize + tileSize / 2,
            phase: random(TWO_PI),
            intensity: random(0.5, 1.0)
          });
        }
      }
    }
  }
}

// ─── 메인 드로우 ──────────────────────────────────────────────
function draw() {
  background(8, 9, 14);
  cursor(ARROW);
  manageBgm();
  push();
  translate(offsetX, offsetY);
  scale(displayScale);
  if      (gameState === "OPENING")        drawOpeningScreen();
  else if (gameState === "STORY")          drawStoryScreen();
  else if (gameState === "HELP_OR_GARAGE") drawChoiceScreen();
  else if (gameState === "HELP")           drawHelpScreen();
  else if (gameState === "GARAGE")         drawGarageScreen();
  else if (gameState === "COUNTDOWN")      drawCountdownScreen();
  else if (gameState === "PLAY")           drawPlayScreen();
  else if (gameState === "MINIGAME")       drawMiniGameScreen();
  else if (gameState === "END")            drawEndScreen();
  pop();
}

function manageBgm() {
  let target = (gameState === "PLAY" || gameState === "MINIGAME" || gameState === "COUNTDOWN") ? bgmClear
             : (gameState === "END") ? null : bgmDark;
  if (currentPlayingBgm !== target) {
    if (currentPlayingBgm && currentPlayingBgm.isPlaying()) currentPlayingBgm.stop();
    currentPlayingBgm = target;
    if (currentPlayingBgm) currentPlayingBgm.loop();
  }
}

// ─── 중단 버튼 (DOM) ──────────────────────────────────────────
let abortDomBtn = null;

function createAbortButton() {
  removeAbortButton();
  abortDomBtn = createButton("■ 중단");
  updateAbortButtonPos();
  abortDomBtn.style('font-family', 'Courier New, Monospace');
  abortDomBtn.style('background', '#1A0A0A');
  abortDomBtn.style('color', '#CC4444');
  abortDomBtn.style('border', '1.5px solid #663333');
  abortDomBtn.style('border-radius', '3px');
  abortDomBtn.style('cursor', 'pointer');
  abortDomBtn.style('font-weight', 'bold');
  abortDomBtn.style('font-size', '11px');
  abortDomBtn.style('z-index', '999');
  abortDomBtn.mousePressed(() => {
    // 중단 전 점수 알림
    if (confirm("중단하시겠습니까?\n현재 점수 " + score + "pt 는 하이스코어에 반영됩니다.")) {
      abortToGarage();
    }
  });
}

function updateAbortButtonPos() {
  if (!abortDomBtn) return;
  abortDomBtn.position(offsetX + 490 * displayScale, offsetY + 10 * displayScale);
  abortDomBtn.size(98 * displayScale, 26 * displayScale);
}

function removeAbortButton() {
  if (abortDomBtn) { abortDomBtn.remove(); abortDomBtn = null; }
}

function abortToGarage() {
  removeRPSButtons();
  removeAbortButton();
  mazeMap = ORIGINAL_MAZE.map(r => [...r]);
  profProjectiles = [];
  profAttackTimer = 0;
  // 중단 시 현재 점수를 하이스코어에 누적 합산
  highScore += score;
  saveGameProgress();
  score = 0;
  slowTimer = 0; invincibleTimer = 0; boostTimer = 0;
  hitFlashTimer = 0; collectFlashTimer = 0;
  scorePopups = [];
  monsterTriggered = false;
  monsterPhase = "IDLE";
  monsterFaceScale = 0;
  carHP = MAX_HP;
  oeWon = false;
  car.resetToStart();
  viewRadius = 80 + preGameViewBonus;
  gameState = "GARAGE";
}

// ─── 카운트다운 화면 ──────────────────────────────────────────
function startCountdown() {
  score = 0;
  carHP = MAX_HP;
  oeWon = false;
  countdownState = "COUNTING";
  countdownValue = 3;
  countdownTimer = COUNTDOWN_FRAMES;
  gameState = "COUNTDOWN";
  createAbortButton();
}

function drawCountdownScreen() {
  background(8, 10, 16);
  drawConcreteTexture(0, 0, 600, 400, 10);
  countdownTimer--;

  push();
  textAlign(CENTER, CENTER);
  if (countdownState === "COUNTING") {
    let progress = 1.0 - (countdownTimer / COUNTDOWN_FRAMES);
    let sz = lerp(120, 60, progress);
    let alpha = lerp(255, 80, progress);

    noStroke();
    fill(30, 35, 55, 180);
    ellipse(300, 200, 160, 160);
    stroke(80, 90, 130); strokeWeight(2); noFill();
    ellipse(300, 200, 160 + progress * 40, 160 + progress * 40);

    noStroke();
    fill(0, 0, 0, alpha * 0.4);
    textSize(sz); textStyle(BOLD);
    text(countdownValue, 304, 204);
    fill(220, 200, 140, alpha);
    text(countdownValue, 300, 200);

    fill(22, 25, 38); noStroke();
    rect(140, 280, 320, 10, 5);
    fill(180, 160, 80);
    rect(140, 280, 320 * progress, 10, 5);

    fill(130, 135, 150); textSize(13); textStyle(NORMAL);
    text("준비하세요...", 300, 320);

    if (countdownTimer <= 0) {
      countdownValue--;
      if (countdownValue <= 0) {
        countdownState = "GO";
        countdownTimer = GO_FRAMES;
      } else {
        countdownTimer = COUNTDOWN_FRAMES;
      }
    }
  } else if (countdownState === "GO") {
    let progress = 1.0 - (countdownTimer / GO_FRAMES);
    let alpha = lerp(255, 0, progress * progress);
    let sz = lerp(80, 140, progress);

    noStroke();
    fill(40, 180, 90, alpha * 0.25);
    ellipse(300, 200, 80 + progress * 300, 80 + progress * 300);

    fill(80, 220, 130, alpha);
    textSize(sz); textStyle(BOLD);
    text("출발!", 300, 200);

    fill(180, 210, 180, alpha * 0.7);
    textSize(14); textStyle(NORMAL);
    text("GO  GO  GO", 300, 270);

    if (countdownTimer <= 0) {
      countdownState = "DONE";
      gameState = "PLAY";
    }
    countdownTimer--;
  }
  pop();
}

// ─── 오프닝 ──────────────────────────────────────────────────
function drawOpeningScreen() {
  background(6, 7, 12);
  push();
  stroke(40, 45, 60); strokeWeight(1); noFill();
  for (let i = 0; i < 8; i++) {
    let sx = random(600), sy = random(400);
    beginShape();
    for (let j = 0; j < 6; j++) vertex(sx + random(-30, 30), sy + random(-30, 30));
    endShape();
  }
  if (imgOpening) {
    imageMode(CORNER); tint(255, 200);
    image(imgOpening, 0, 0, 600, 400); noTint();
  }
  let vg = drawingContext.createRadialGradient(300, 200, 80, 300, 200, 340);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.82)');
  drawingContext.fillStyle = vg;
  drawingContext.fillRect(0, 0, 600, 400);
  pop();

  push();
  noStroke();
  for (let y = 0; y < 400; y += 3) { fill(0, 0, 0, 18); rect(0, y, 600, 1); }
  pop();

  push();
  textAlign(CENTER, CENTER);
  let titleText = "A CATCH CATCH";
  for (let i = 0; i < titleText.length; i++) {
    let letter = titleText.charAt(i);
    let bounce = sin(frameCount * 0.08 + i * 0.5) * 8;
    textSize(36); textStyle(BOLD);
    fill(0, 0, 0, 120); text(letter, 96 + i * 30 + 2, 152 + bounce + 2);
    let t = (sin(frameCount * 0.05 + i * 0.3) + 1) * 0.5;
    fill(lerpColor(color(220, 190, 100), color(255, 255, 230), t));
    text(letter, 96 + i * 30, 152 + bounce);
  }
  pop();

  push();
  textAlign(CENTER, CENTER); textSize(11);
  fill(140, 150, 170); textStyle(NORMAL);
  text("싱크홀 미로 탈출\n신준희 이서윤 황다연", 300, 200);
  if (floor(frameCount / 30) % 2 === 0) {
    fill(200, 190, 160); textSize(12);
    text(" [ F ] 키를 눌러 전체화면 \n [ ENTER ] 키를 눌러 시작 ", 300, 268);
  }
  pop();
}

// ─── 스토리 ──────────────────────────────────────────────────
function drawStoryScreen() {
  push();
  background(10, 11, 16);
  drawConcreteTexture(0, 0, 600, 400, 18);
  fill(0); noStroke();
  rect(0, 0, 600, 52); rect(0, 350, 600, 50);
  stroke(80, 75, 60); strokeWeight(1); line(0, 52, 600, 52);
  stroke(50, 47, 38); line(0, 54, 600, 54);

  let stories = [
    { title: "프롤로그", body: "오전 10시 25분.\n기철 교수님 코딩 강의 지각 5분 전,\n학교 가는 길에 갑작스런 싱크홀로 떨어졌다.\n\n엄청난 소리와 함께 정체 모를 곳으로 추락했다." },
    { title: "프롤로그", body: "여기가 어디야?! 나 살아있는 거 맞아??\n정체 모를 괴물이 학점을 투하하고 있다.\n\n탈출하지 않으면 F학점이 확정된다." },
    { title: "프롤로그", body: "차를 몰아 미로를 통과하라.\n가위바위보로 시야를 확보하라.\n홀짝 게임을 승리해야 F학점을 면할 수 있다!\n\n출구는 미로 어딘가에 있다. 반드시 탈출하라." }
  ];

  if (storyStep === 0 && !isStartSoundPlayed) {
    soundStartScream.play(); soundStartThud.play();
    isStartSoundPlayed = true;
  }

  let s = stories[min(storyStep, stories.length - 1)];
  textAlign(LEFT, TOP); textSize(10); textStyle(NORMAL);
  fill(130, 120, 100); text(s.title, 55, 65);
  stroke(60, 55, 45); strokeWeight(1); line(55, 78, 350, 78); noStroke();
  textSize(13); textStyle(BOLD); fill(215, 205, 180);
  text(s.body, 55, 92, 490, 240);

  for (let i = 0; i < 3; i++) {
    fill(i === storyStep ? color(200, 180, 100) : color(50, 52, 65));
    noStroke(); rect(265 + i * 18, 334, 10, 10, 2);
  }
  buttons.skip.draw();
  buttons.next.draw();
  pop();
}

function drawConcreteTexture(x, y, w, h, density) {
  push(); noStroke();
  for (let i = 0; i < density; i++) {
    fill(random(18, 30), random(19, 32), random(22, 38), 60);
    let tx = x + random(w), ty = y + random(h);
    rect(tx, ty, random(4, 20), random(2, 8));
  }
  pop();
}

function drawChoiceScreen() {
  background(10, 11, 16);
  drawConcreteTexture(0, 0, 600, 400, 12);
  push();
  textAlign(CENTER, CENTER); textSize(14); textStyle(BOLD);
  fill(200, 190, 160); text("출발 전 마지막 정비!", 300, 130);
  textSize(11); textStyle(NORMAL); fill(120, 130, 145);
  text("게임 설명 또는 상점을 선택하세요", 300, 155);
  pop();
  buttons.goToHelp.draw(); buttons.goToGarage.draw();
}

// ─── GARAGE 화면 ──────────────────────────────────────────────
function drawGarageScreen() {
  background(10, 11, 16);
  drawConcreteTexture(0, 0, 600, 400, 10);

  push();
  fill(200, 190, 160); textAlign(LEFT, TOP); textSize(14); textStyle(BOLD);
  text("GARAGE", 18, 12);
  stroke(60, 58, 48); strokeWeight(1); line(18, 30, 285, 30); noStroke();

  textSize(10); textStyle(NORMAL); fill(140, 148, 160); textAlign(LEFT, TOP);
text("차체 색상: " + carColorNames[carColorIdx], 18, 38);
text("차종: " + carTypes[carTypeIdx], 18, 52);
text("경광등: " + (hasSiren ? "켜짐" : "꺼짐"), 18, 66);

  fill(14, 16, 24); stroke(45, 50, 65); strokeWeight(1.5);
  rect(80, 82, 130, 110, 4); noStroke();
  fill(30, 35, 50, 80); rect(80, 82, 130, 110, 4);
  pop();

  push();
  push();
  translate(145, 137); scale(0.65);
  push(); rotate(-HALF_PI);
  let tempCar = new Car(0, 0);
  tempCar._drawCarBody(carColors[carColorIdx]);
  pop();
  if (hasSiren) drawSirenGlow(0, 0, -HALF_PI);

  if (carTypeIdx === 5) {
    push();
    rotate(-HALF_PI);
    let t = frameCount;
    let exhausts = [{ ox: -8, oy: -10 }, { ox: -8, oy: 10 }];
    for (let ex of exhausts) {
      for (let i = 0; i < 5; i++) {
        let phase  = (t * 0.08 + i * 1.3 + ex.oy * 0.1) % 1.0;
        let d      = phase * 28;
        let wobble = sin(t * 0.12 + i * 2.1 + ex.oy) * 4 * phase;
        let sz     = lerp(4, 1, phase);
        let alpha  = lerp(120, 0, phase * phase);
        let grey   = lerp(180, 120, phase);
        noStroke(); fill(grey, grey, grey, alpha);
        ellipse(ex.ox - d, ex.oy + wobble, sz * 1.2, sz);
      }
    }
    pop();
  }
  pop();

  push();
  fill(12, 14, 20); stroke(50, 55, 75); strokeWeight(1.5);
  rect(296, 8, 298, 318, 4);
  fill(18, 20, 32); noStroke();
  rect(296, 8, 298, 32, 4, 4, 0, 0);

  fill(160, 170, 200); textAlign(LEFT, CENTER); textSize(13); textStyle(BOLD);
  text(" 상점", 310, 24);

  fill(90, 95, 115); textSize(9); textStyle(NORMAL); textAlign(RIGHT, CENTER);
  text("출발 전 구매 가능", 586, 24);
  stroke(45, 50, 70); strokeWeight(1); line(306, 44, 586, 44); noStroke();

  // ── 포인트 표시 ──
  fill(120, 115, 95); textSize(9); textStyle(NORMAL); textAlign(LEFT, TOP);
  text("보유 포인트:", 310, 50);
  fill(220, 200, 120); textSize(18); textStyle(BOLD);
  text(nf(highScore, 5) + " pt", 310, 62);

  stroke(40, 44, 60); strokeWeight(1); line(306, 86, 586, 86); noStroke();

  // ── 시야 확장 (단일 항목) ──
  fill(140, 200, 120); textSize(11); textStyle(BOLD); textAlign(LEFT, TOP);
  text("■ 시야 확장", 310, 94);

  let viewCost = 50;
  let viewBought = preGameViewBonus > 0;
  let canAffordView = highScore >= viewCost;

  let vBgC = viewBought ? color(14, 22, 14) : (canAffordView ? color(16, 28, 14) : color(20, 20, 22));
  let vBdC = viewBought ? color(40, 100, 40) : (canAffordView ? color(60, 130, 50) : color(45, 45, 50));
  fill(vBgC); stroke(vBdC); strokeWeight(1);
  rect(306, 108, 282, 64, 3);

  noStroke();
  fill(viewBought ? color(100, 170, 100) : (canAffordView ? color(180, 220, 160) : color(100, 100, 105)));
  textAlign(LEFT, TOP); textSize(11); textStyle(BOLD);
  text("시야 확장 패키지", 315, 116);
  fill(viewBought ? color(80, 140, 80) : (canAffordView ? color(120, 160, 110) : color(75, 75, 80)));
  textSize(9); textStyle(NORMAL);
  text(viewBought ? ("이미 구매 — 출발 시야 +" + preGameViewBonus) : "+30 시야  (1회 한정)", 315, 132);

  fill(canAffordView && !viewBought ? color(200, 170, 60) : color(70, 65, 45));
  textAlign(RIGHT, TOP); textSize(10); textStyle(BOLD);
  text(viewCost + " pt", 582, 116);

  if (!viewBought) {
    fill(canAffordView ? color(30, 80, 24) : color(28, 28, 30));
    stroke(canAffordView ? color(80, 180, 60) : color(50, 50, 55)); strokeWeight(1);
    rectMode(CORNER); rect(518, 140, 62, 20, 2);
    noStroke(); fill(canAffordView ? color(160, 230, 140) : color(70, 70, 75));
    textAlign(CENTER, CENTER); textSize(10); textStyle(BOLD);
    text(canAffordView ? "구매 ▶" : "부족", 549, 150);
    rectMode(CORNER);
  } else {
    noStroke(); fill(40, 100, 40, 180);
    rectMode(CORNER); rect(518, 140, 62, 20, 2);
    fill(160, 230, 160); textAlign(CENTER, CENTER); textSize(10); textStyle(BOLD);
    text("완료 ✓", 549, 150);
    rectMode(CORNER);
  }

  stroke(40, 44, 60); strokeWeight(1); line(306, 178, 586, 178); noStroke();

  // ── 슈퍼카 해금 ──
  fill(200, 170, 80); textSize(11); textStyle(BOLD); textAlign(LEFT, TOP);
  text("■ 슈퍼카 해금", 310, 186);

  let scCost = 100;
  let canBuySC = highScore >= scCost;
  let scBg2 = supercarUnlocked ? color(14, 20, 36) : (canBuySC ? color(22, 18, 10) : color(18, 16, 12));
  let scBd2 = supercarUnlocked ? color(80, 120, 220) : (canBuySC ? color(160, 120, 40) : color(75, 60, 30));
  fill(scBg2); stroke(scBd2); strokeWeight(1);
  rect(306, 200, 282, 64, 3);

  noStroke();
  if (supercarUnlocked) {
    fill(120, 160, 255); textAlign(LEFT, TOP); textSize(11); textStyle(BOLD);
    text("★ SUPERCAR", 315, 208);
    fill(80, 110, 200); textSize(9); textStyle(NORMAL);
    text("해금 완료 — 차종 변경으로 선택 가능", 315, 224);
    fill(50, 80, 180, 200); rectMode(CORNER); rect(518, 232, 62, 20, 2);
    fill(140, 180, 255); textAlign(CENTER, CENTER); textSize(10); textStyle(BOLD);
    text("보유 ✓", 549, 242);
    rectMode(CORNER);
  } else {
    fill(220, 180, 80); textAlign(LEFT, TOP); textSize(11); textStyle(BOLD);
    text("★ SUPERCAR  [ 잠김 ]", 315, 208);
    fill(160, 130, 70); textSize(9); textStyle(NORMAL);
    text("미구매 시 차종 선택 불가", 315, 224);
    fill(canBuySC ? color(200, 160, 50) : color(70, 65, 45));
    textAlign(RIGHT, TOP); textSize(10); textStyle(BOLD);
    text(scCost + " pt", 582, 208);
    fill(canBuySC ? color(40, 30, 8) : color(24, 22, 16));
    stroke(canBuySC ? color(180, 140, 40) : color(65, 52, 28)); strokeWeight(1);
    rectMode(CORNER); rect(518, 232, 62, 20, 2);
    noStroke(); fill(canBuySC ? color(230, 190, 80) : color(85, 70, 45));
    textAlign(CENTER, CENTER); textSize(10); textStyle(BOLD);
    text(canBuySC ? "구매 ▶" : "부족", 549, 242);
    rectMode(CORNER);
  }

  // ── 현재 출발 시야 게이지 ──
  stroke(40, 44, 60); strokeWeight(1); line(306, 270, 586, 270); noStroke();
  fill(90, 95, 110); textSize(9); textStyle(NORMAL); textAlign(LEFT, TOP);
  text("현재 출발 시야:  " + (80 + preGameViewBonus), 310, 277);
  fill(18, 22, 35); noStroke(); rect(310, 292, 270, 6, 3);
  let vRatioGarage = map(80 + preGameViewBonus, 80, 230, 0, 270);
  fill(60, 130, 200); rect(310, 292, vRatioGarage, 6, 3);

  if (garageShopMsgTimer > 0) {
    garageShopMsgTimer--;
    let a = map(garageShopMsgTimer, 0, 50, 0, 220);
    fill(10, 14, 22, a); stroke(60, 80, 130, a); strokeWeight(1); rectMode(CENTER);
    rect(435, 312, 268, 22, 3);
    noStroke(); fill(180, 200, 255, a);
    textAlign(CENTER, CENTER); textSize(10); textStyle(BOLD);
    text(garageShopMessage, 435, 312);
    rectMode(CORNER);
  }
  pop();

  buttons.colorOpt.draw(); buttons.typeOpt.draw();
  buttons.sirenOpt.draw(); buttons.gameStart.draw();
  buttons.goBack.draw();
}

function handleGarageShopClick(mx, my) {
  // 시야 확장 구매 버튼 (y: 140~160)
  let viewCost = 50;
  let viewBought = preGameViewBonus > 0;
  if (!viewBought && mx >= 518 && mx <= 580 && my >= 140 && my <= 160) {
    if (highScore >= viewCost) {
      highScore -= viewCost;
      preGameViewBonus = 30;
      garageShopMessage = "-" + viewCost + "pt  →  시야 +30 확보!";
      garageShopMsgTimer = 90;
      saveGameProgress();
    } else {
      garageShopMessage = "포인트 부족 (" + viewCost + "pt 필요)";
      garageShopMsgTimer = 60;
    }
    return;
  }
  // 슈퍼카 구매 버튼 (y: 232~252)
  if (!supercarUnlocked && mx >= 518 && mx <= 580 && my >= 232 && my <= 252) {
  if (highScore >= 100) {
    highScore -= 100;
      supercarUnlocked = true;
      garageShopMessage = "-100pt  →  SUPERCAR 해금!";
      garageShopMsgTimer = 90;
      saveGameProgress();
    } else {
      garageShopMessage = "포인트 부족 (100pt 필요)";
      garageShopMsgTimer = 60;
    }
    return;
  }
}

function drawHelpScreen() {
  background(10, 11, 16);
  drawConcreteTexture(0, 0, 600, 400, 10);
  push();
  textAlign(CENTER, CENTER); textSize(15); textStyle(BOLD);
  fill(200, 190, 160); text("작전 지침서", 300, 40);
  stroke(60, 58, 48); strokeWeight(1); line(80, 56, 520, 56); noStroke();

  let rules = [
    ["브레이크 없음",   "차는 항상 전진한다. 방향키 ◀▶ 로만 조종 가능."],
    ["체력 시스템",     "벽 충돌 시 체력 -1. 15회 충돌하면 자동차 고장!"],
    ["A학점 구슬",      "먹으면 시야 확장 +8 · 점수 +10점."],
    ["F학점 폭탄",      "맞으면 일정 시간 속도 75% 감소."],
    ["부스터 패드",     "통과하면 시야 영구 확장 +15 · 점수 +10점."],
    ["홀짝 게임 ★",    "승리해야 출구(EXIT)가 열린다! 패배 시 전체 초기화."],
    ["가위바위보",      "승리 시 시야 +30. 패배 시 점수/시야 전체 초기화!"]
  ];

  let startY = 68;
  for (let i = 0; i < rules.length; i++) {
    let y = startY + i * 34;
    fill(30, 34, 48); noStroke(); rect(55, y, 490, 26, 3);
    fill(190, 175, 120); textAlign(LEFT, CENTER); textSize(11); textStyle(BOLD);
    text("" + rules[i][0], 70, y + 13);
    fill(160, 165, 175); textSize(10); textStyle(NORMAL);
    text(rules[i][1], 185, y + 13);
  }
  pop();
  buttons.actualStart.draw();
buttons.goBackHelp.draw();
}

// ─── 플레이 화면 ──────────────────────────────────────────────
function drawPlayScreen() {
  let dtScale = getDtScale();
  if (slowTimer > 0)       slowTimer       -= dtScale;
  if (invincibleTimer > 0) invincibleTimer  -= dtScale;
  if (boostTimer > 0)      boostTimer       -= dtScale;
  if (hitFlashTimer > 0)   hitFlashTimer    -= dtScale;
  if (collectFlashTimer > 0) collectFlashTimer -= dtScale;

  slowTimer = max(0, slowTimer);
  invincibleTimer = max(0, invincibleTimer);
  boostTimer = max(0, boostTimer);
  hitFlashTimer = max(0, hitFlashTimer);
  collectFlashTimer = max(0, collectFlashTimer);

  for (let i = scorePopups.length - 1; i >= 0; i--) {
    scorePopups[i].y -= 1.2 * dtScale;
    scorePopups[i].life -= dtScale;
    if (scorePopups[i].life <= 0) scorePopups.splice(i, 1);
  }

  car.update();
  checkTriggers();
  handleProfAttack();

  let sOffsetX = 0, sOffsetY = 0;
  if (shakeTimer > 0) {
    sOffsetX = random(-10, 10); sOffsetY = random(-10, 10);
    shakeTimer -= dtScale;
    shakeTimer = max(0, shakeTimer);
  }

  push();
  translate(300 + sOffsetX, 240 + sOffsetY);
  rotate(-car.angle - HALF_PI);
  translate(-car.x, -car.y);
  drawMaze();
  drawProfProjectiles();
  car.draw();
  if (hasSiren) drawSirenGlow(car.x, car.y, car.angle);
  pop();

  drawSmoothFog();
  drawHUD();
  drawScorePopups();

  if (hitFlashTimer > 0) {
    push(); noStroke();
    fill(220, 30, 30, map(hitFlashTimer, 0, 20, 0, 80));
    rect(0, 0, 600, 400); pop();
  }
  if (collectFlashTimer > 0) {
    push(); noStroke();
    fill(200, 230, 150, map(collectFlashTimer, 0, 15, 0, 60));
    rect(0, 0, 600, 400); pop();
  }
  if (monsterTriggered) drawScaryMonsterWindow();
}

function addScorePopup(text, col) {
  scorePopups.push({
    x: 300 + random(-60, 60),
    y: 180,
    text: text,
    col: col || color(220, 240, 160),
    life: 65
  });
}

function drawScorePopups() {
  push();
  for (let p of scorePopups) {
    let a = map(p.life, 0, 65, 0, 255);
    noStroke();
    fill(0, 0, 0, a * 0.5);
    textAlign(CENTER, CENTER); textSize(16); textStyle(BOLD);
    text(p.text, p.x + 1, p.y + 1);
    fill(red(p.col), green(p.col), blue(p.col), a);
    text(p.text, p.x, p.y);
  }
  pop();
}

// ─── 미로 그리기 ──────────────────────────────────────────────
function drawMaze() {
  noStroke(); fill(16, 18, 25);
  rect(0, 0, mazeMap[0].length * tileSize, mazeMap.length * tileSize);

  for (let d of groundDebris) {
    noStroke(); fill(255, 255, 255, d.alpha);
    if (d.type === 0) rect(d.x, d.y, d.w, d.h);
    else if (d.type === 1) ellipse(d.x, d.y, d.w * 0.6, d.h * 0.6);
    else { stroke(255, 255, 255, d.alpha * 0.6); strokeWeight(0.5); line(d.x, d.y, d.x + d.w, d.y + d.h); noStroke(); }
  }

  for (let lf of lightFlicker) {
    let flicker = noise(lf.phase + frameCount * 0.03) * lf.intensity;
    let alpha = 18 + flicker * 22;
    noStroke();
    let lg = drawingContext.createRadialGradient(lf.x, lf.y, 0, lf.x, lf.y, tileSize * 0.6);
    lg.addColorStop(0, `rgba(220, 210, 170, ${alpha / 255})`);
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    drawingContext.fillStyle = lg;
    drawingContext.fillRect(lf.x - tileSize * 0.6, lf.y - tileSize * 0.6, tileSize * 1.2, tileSize * 1.2);
  }

  for (let r = 0; r < mazeMap.length; r++) {
    for (let c = 0; c < mazeMap[r].length; c++) {
      let x = c * tileSize, y = r * tileSize;
      let tile = mazeMap[r][c];
      if (tile === 1) {
        drawWallTile(x, y, r, c);
      } else {
        drawFloorTile(x, y, r, c);
        if (tile === 'R') drawMinigameTile(x, y, 'R');
        if (tile === 'O') drawMinigameTile(x, y, 'O');
        if (tile === 'B') drawBoostTile(x, y);
        if (tile === 'E') drawExitTile(x, y);
      }
    }
  }

  push();
  for (let wc of wallCracks) {
    stroke(0, 0, 0, 40); strokeWeight(1);
    push(); translate(wc.x, wc.y); rotate(wc.angle);
    line(0, 0, wc.len * cos(0.3), wc.len * sin(0.3));
    line(wc.len * 0.4 * cos(0.3), wc.len * 0.4 * sin(0.3),
         wc.len * 0.7 * cos(-0.5), wc.len * 0.7 * sin(-0.5));
    pop();
  }
  pop();
}

function drawWallTile(x, y, r, c) {
  push(); randomSeed(wallTextureSeed[r][c]);
  fill(32, 34, 44); noStroke(); rect(x, y, tileSize, tileSize);
  let brickH = 22, brickW = 40;
  stroke(22, 24, 33); strokeWeight(1);
  for (let by = 0; by < tileSize; by += brickH) {
    let offset = (floor(by / brickH) % 2 === 0) ? 0 : brickW / 2;
    for (let bx = -offset; bx < tileSize; bx += brickW) { noFill(); rect(x + bx, y + by, brickW, brickH); }
    fill(20, 22, 30, 120); noStroke(); rect(x, y + by, tileSize, 2);
  }
  noStroke();
  for (let i = 0; i < 5; i++) {
    fill(10, 11, 18, random(20, 50));
    rect(x + random(tileSize), y + random(tileSize), random(10, 30), random(5, 15));
  }
  fill(20, 38, 28, 35); rect(x, y + tileSize * 0.7, tileSize, tileSize * 0.3);
  stroke(15, 16, 22); strokeWeight(3); noFill(); rect(x + 1, y + 1, tileSize - 2, tileSize - 2);
  pop();
}

function drawFloorTile(x, y, r, c) {
  push(); randomSeed(floorTextureSeed[r][c]);
  fill(20, 22, 30); noStroke(); rect(x, y, tileSize, tileSize);
  stroke(28, 30, 42); strokeWeight(1);
  line(x, y, x + tileSize, y); line(x, y, x, y + tileSize);
  stroke(14, 15, 22, 60); strokeWeight(0.8);
  for (let i = 0; i < 3; i++) {
    let cx1 = x + random(tileSize), cy1 = y + random(tileSize);
    line(cx1, cy1, cx1 + random(-20, 20), cy1 + random(-20, 20));
  }
  noStroke();
  for (let i = 0; i < 4; i++) {
    fill(255, 255, 255, random(4, 14));
    rect(x + random(tileSize), y + random(tileSize), random(2, 8), random(1, 4));
  }
  pop();
}

function drawMinigameTile(x, y, type) {
  push();
  let isR = (type === 'R');
  let col = isR ? color(60, 200, 150) : color(140, 80, 220);
  let colStr = isR ? "#3CC896" : "#8C50DC";
  fill(red(col), green(col), blue(col), 18); noStroke(); rect(x, y, tileSize, tileSize);
  stroke(colStr); strokeWeight(2);
  let inset = 12 + sin(frameCount * 0.08) * 4;
  noFill(); rect(x + inset, y + inset, tileSize - inset * 2, tileSize - inset * 2, 4);
  strokeWeight(3);
  [[x + inset, y + inset], [x + tileSize - inset, y + inset],
   [x + inset, y + tileSize - inset], [x + tileSize - inset, y + tileSize - inset]].forEach(([px, py]) => { point(px, py); });
  noStroke(); fill(colStr);
  textAlign(CENTER, CENTER); textSize(isR ? 18 : 12); textStyle(BOLD);
  text(isR ? "RPS" : "ODD/EVEN", x + tileSize / 2, y + tileSize / 2 - 10);
  textSize(9); textStyle(NORMAL); fill(red(col), green(col), blue(col), 180);
  text(isR ? "가위바위보" : "홀짝 게임", x + tileSize / 2, y + tileSize / 2 + 10);
  pop();
}

function drawBoostTile(x, y) {
  push();
  let pulse = sin(frameCount * 0.12) * 0.5 + 0.5;
  fill(180, 140, 30, 20 + pulse * 25); noStroke(); rect(x, y, tileSize, tileSize);
  stroke("#C8A828"); strokeWeight(2); noFill();
  rect(x + 14, y + 14, tileSize - 28, tileSize - 28, 4);
  let cx = x + tileSize / 2, cy = y + tileSize / 2;
  let aw = 28, ah = 38;
  fill(200 + pulse * 55, 165, 30 + pulse * 20); noStroke();
  triangle(cx, cy - ah / 2, cx - aw / 2, cy + ah / 4, cx + aw / 2, cy + ah / 4);
  rect(cx - aw * 0.25, cy + ah / 4, aw * 0.5, ah / 4);
  fill(255, 230, 100, 80 + pulse * 80); ellipse(cx, cy - ah / 2, 10, 10);
  textAlign(CENTER, CENTER); fill("#C8A828"); textSize(9); textStyle(BOLD); noStroke();
  text("SIGHT+", cx, cy + ah / 2 + 10);
  pop();
}

function drawExitTile(x, y) {
  push();
  // oeWon이 false이면 잠긴 출구로 표시
  if (!oeWon) {
    let flicker = sin(frameCount * 0.06) * 0.5 + 0.5;
    fill(30, 15, 15, 30 + flicker * 20); noStroke(); rect(x, y, tileSize, tileSize);
    stroke(100, 50, 50); strokeWeight(2); noFill();
    rect(x + 10, y + 10, tileSize - 20, tileSize - 20, 3);
    // 자물쇠 아이콘
    noStroke(); fill(120, 70, 70);
    textAlign(CENTER, CENTER); textSize(28); text("🔒", x + tileSize / 2, y + tileSize / 2 - 8);
    textSize(9); textStyle(NORMAL); fill(150, 90, 90);
    text("홀짝 승리 필요", x + tileSize / 2, y + tileSize / 2 + 16);
  } else {
    let pulse = (sin(frameCount * 0.1) + 1) * 0.5;
    fill(20, 160, 80, 25 + pulse * 30); noStroke(); rect(x, y, tileSize, tileSize);
    stroke("#14A050"); strokeWeight(2 + pulse); noFill();
    rect(x + 10, y + 10, tileSize - 20, tileSize - 20, 3);
    noStroke(); fill(20 + pulse * 40, 200, 90 + pulse * 40);
    textAlign(CENTER, CENTER); textSize(22); textStyle(BOLD);
    text("EXIT", x + tileSize / 2, y + tileSize / 2 - 8);
    textSize(9); textStyle(NORMAL); fill(100, 210, 150);
    text("탈출구", x + tileSize / 2, y + tileSize / 2 + 12);
  }
  pop();
}

// ─── 차 클래스 ────────────────────────────────────────────────
class Car {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.speed = 4.2; this.angle = 0;
    this.hasMovedForward = false;
    this.wheelAngle = 0;
    this.trailPoints = [];
  }

  update() {
    let dtScale = getDtScale();
    if (keyIsDown(LEFT_ARROW))  this.angle -= 0.048 * dtScale;
    if (keyIsDown(RIGHT_ARROW)) this.angle += 0.048 * dtScale;
    let spd = this.speed * dtScale;
    if (slowTimer > 0) spd = this.speed * 0.28 * dtScale;
    this.wheelAngle += spd * 0.15;
    let nx = this.x + cos(this.angle) * spd;
    let ny = this.y + sin(this.angle) * spd;
    if (this.checkWallCollision(nx, ny)) {
      if (!soundCarCrash.isPlaying()) soundCarCrash.play();
      shakeTimer = 15;
      if (invincibleTimer <= 0) {
        // ── 체력 감소 ──
        carHP--;
        hitFlashTimer = 20;
        invincibleTimer = 40; // 짧은 무적시간으로 연속 감소 방지
        addScorePopup("체력 -1 (" + carHP + "/" + MAX_HP + ")", color(240, 140, 60));
        if (carHP <= 0) {
          // 자동차 고장: 전체 초기화
          triggerCarBreakdown();
        } else {
          this.resetToStart();
        }
      }
    } else {
      this.x = nx; this.y = ny;
    }
    this.trailPoints.push({ x: this.x, y: this.y, age: 0 });
    if (this.trailPoints.length > 30) this.trailPoints.shift();
    for (let tp of this.trailPoints) tp.age++;
  }

  checkWallCollision(nx, ny) {
    let offsets = [-18, 0, 18];
    for (let ox of offsets) {
      for (let oy of offsets) {
        let cx = nx + ox * cos(this.angle) - oy * sin(this.angle);
        let cy = ny + ox * sin(this.angle) + oy * cos(this.angle);
        let gC = floor(cx / tileSize), gR = floor(cy / tileSize);
        if (gR < 0 || gR >= mazeMap.length || gC < 0 || gC >= mazeMap[0].length) return true;
        if (mazeMap[gR][gC] === 1) return true;
      }
    }
    return false;
  }

  resetToStart() {
    this.x = 1 * tileSize + tileSize / 2;
    this.y = 1 * tileSize + tileSize / 2;
    this.angle = 0; this.hasMovedForward = false;
    this.trailPoints = [];
  }

  draw() {
    push(); noFill();
    for (let i = 1; i < this.trailPoints.length; i++) {
      let tp = this.trailPoints[i];
      let alpha = map(tp.age, 0, 30, 60, 0);
      stroke(40, 38, 32, alpha); strokeWeight(5);
      let prev = this.trailPoints[i - 1];
      line(prev.x, prev.y, tp.x, tp.y);
    }
    pop();
    push();
    translate(this.x, this.y); rotate(this.angle);
    let col = carColors[carColorIdx];

    // HP가 낮으면 차에 경고 효과
    if (carHP <= 3) {
      let warnAlpha = sin(frameCount * 0.3) * 80 + 80;
      noStroke(); fill(220, 60, 60, warnAlpha);
      ellipse(0, 0, 80, 50);
    }

    push(); noStroke(); fill(0, 0, 0, 45); ellipse(3, 3, 68, 38); pop();
    push(); noStroke(); fill(255, 250, 200, 12);
    beginShape(); vertex(28, -14); vertex(80, -40); vertex(80, -12); vertex(28, -8); endShape(CLOSE);
    beginShape(); vertex(28, 14); vertex(80, 12); vertex(80, 40); vertex(28, 8); endShape(CLOSE);
    pop();
    this._drawCarBody(col);

    if (carTypeIdx === 5) {
      push();
      let t = frameCount;
      let exhausts = [
        { ox: -8, oy: -10 },
        { ox: -8, oy:  10 },
      ];
      for (let ex of exhausts) {
        for (let i = 0; i < 5; i++) {
          let phase = (t * 0.08 + i * 1.3 + ex.oy * 0.1) % 1.0;
          let dist  = phase * 28;
          let wobble = sin(t * 0.12 + i * 2.1 + ex.oy) * 4 * phase;
          let sz    = lerp(4, 1, phase);
          let alpha = lerp(120, 0, phase * phase);
          let grey  = lerp(180, 120, phase);
          noStroke();
          fill(grey, grey, grey, alpha);
          ellipse(ex.ox - dist, ex.oy + wobble, sz * 1.2, sz);
        }
      }
      pop();
    }
    pop();
  }

  _drawCarBody(col) {
    push(); rectMode(CENTER);
    let type = carTypeIdx;
    if (type === 0) {
      fill(28, 28, 32); noStroke();
      let wheelR = 9;
      [[-18, -16], [-18, 16], [16, -16], [16, 16]].forEach(([wx, wy]) => {
        push(); translate(wx, wy); rotate(this.wheelAngle);
        ellipse(0, 0, wheelR * 2, wheelR * 2); fill(55, 55, 60); ellipse(0, 0, wheelR, wheelR);
        stroke(70, 70, 75); strokeWeight(1.2); noFill();
        for (let a = 0; a < TWO_PI; a += PI / 2) line(0, 0, cos(a) * wheelR * 0.8, sin(a) * wheelR * 0.8);
        pop();
      });
      fill(col); noStroke(); rect(0, 0, 60, 30, 4);
      fill(lerpColor(color(col), color(15, 17, 24), 0.35)); rect(4, 0, 34, 22, 3);
      fill(lerpColor(color(col), color(0), 0.5)); rect(28, 0, 8, 26, 2); rect(-28, 0, 8, 26, 2);
      fill(60, 80, 120, 180); rect(10, 0, 12, 18, 2); fill(45, 65, 105, 120); rect(-5, 0, 10, 18, 2);
      fill(255, 250, 200); noStroke(); rect(27, -10, 6, 4, 1); rect(27, 10, 6, 4, 1);
      fill(200, 30, 30); rect(-27, -10, 5, 4, 1); rect(-27, 10, 5, 4, 1);
      stroke(lerpColor(color(col), color(0), 0.3)); strokeWeight(1); noFill();
      line(-5, -14, -5, 14); line(8, -14, 8, 14);
    } else if (type === 1) {
      fill(28, 28, 32); noStroke();
      [[-20, -18], [-20, 18], [18, -18], [18, 18]].forEach(([wx, wy]) => {
        push(); translate(wx, wy); rotate(this.wheelAngle);
        ellipse(0, 0, 20, 20); fill(55, 55, 60); ellipse(0, 0, 10, 10);
        stroke(70, 70, 75); strokeWeight(1.5);
        for (let a = 0; a < TWO_PI; a += PI / 3) line(0, 0, cos(a) * 7, sin(a) * 7);
        pop();
      });
      fill(col); noStroke(); rect(0, 0, 68, 36, 5);
      fill(lerpColor(color(col), color(10, 12, 18), 0.3)); rect(0, 0, 60, 28, 4);
      fill(50, 75, 115, 170); rect(6, 0, 36, 24, 3); fill(30, 50, 90, 110); rect(-14, 0, 18, 24, 3);
      fill(255, 250, 200); noStroke(); rect(32, -12, 7, 5, 1); rect(32, 12, 7, 5, 1);
      fill(200, 30, 30); rect(-32, -12, 6, 5, 1); rect(-32, 12, 6, 5, 1);
    } else if (type === 2) {
      fill(28, 28, 32); noStroke();
      [[-14, -15], [-14, 15], [18, -15], [18, 15]].forEach(([wx, wy]) => {
        push(); translate(wx, wy); rotate(this.wheelAngle);
        ellipse(0, 0, 16, 16); fill(55, 55, 60); ellipse(0, 0, 8, 8);
        stroke(70, 70, 75); strokeWeight(1);
        for (let a = 0; a < TWO_PI; a += PI / 2) line(0, 0, cos(a) * 5.5, sin(a) * 5.5);
        pop();
      });
      fill(col); noStroke();
      beginShape(); vertex(30, 0); vertex(22, -14); vertex(-10, -14); vertex(-28, -8); vertex(-28, 8); vertex(-10, 14); vertex(22, 14); endShape(CLOSE);
      fill(lerpColor(color(col), color(5, 6, 12), 0.5));
      beginShape(); vertex(20, 0); vertex(14, -10); vertex(-4, -10); vertex(-14, -6); vertex(-14, 6); vertex(-4, 10); vertex(14, 10); endShape(CLOSE);
      fill(60, 90, 140, 200);
      beginShape(); vertex(16, -8); vertex(2, -8); vertex(-8, -5); vertex(-8, 5); vertex(2, 8); vertex(16, 8); endShape(CLOSE);
      fill(255, 250, 200); noStroke(); rect(27, -9, 5, 3, 1); rect(27, 9, 5, 3, 1);
      fill(200, 30, 30); rect(-26, -9, 4, 3, 1); rect(-26, 9, 4, 3, 1);
    } else if (type === 3) {
      fill(28, 28, 32); noStroke();
      [[-22, -20], [-22, 20], [10, -20], [10, 20]].forEach(([wx, wy]) => {
        push(); translate(wx, wy); rotate(this.wheelAngle);
        ellipse(0, 0, 22, 22); fill(50, 50, 55); ellipse(0, 0, 11, 11);
        stroke(65, 65, 70); strokeWeight(1.5);
        for (let a = 0; a < TWO_PI; a += PI / 3) line(0, 0, cos(a) * 7.5, sin(a) * 7.5);
        pop();
      });
      fill(col); noStroke(); rect(10, 0, 32, 38, 3);
      fill(lerpColor(color(col), color(10), 0.4)); rect(-14, 0, 42, 38, 3);
      fill(50, 75, 115, 180); rect(16, 0, 18, 30, 2);
      fill(255, 250, 200); noStroke(); rect(28, -13, 6, 4, 1); rect(28, 13, 6, 4, 1);
      fill(200, 30, 30); rect(-36, -13, 5, 4, 1); rect(-36, 13, 5, 4, 1);
      stroke(lerpColor(color(col), color(0), 0.4)); strokeWeight(1); noFill(); rect(-14, 0, 42, 38, 3);
    } else if (type === 5) {
      fill(28, 28, 32); noStroke();
      [[-50,-20],[-50,20],[56,-20],[56,20]].forEach(([wx,wy]) => {
        push(); translate(wx, wy); rotate(this.wheelAngle);
        ellipse(0,0,20,20); fill(34,34,40); ellipse(0,0,11,11);
        stroke(96,96,128); strokeWeight(1.4); noFill();
        for (let a=0; a<TWO_PI; a+=PI/3) line(0,0,cos(a)*7,sin(a)*7);
        pop();
      });
      fill(col); noStroke();
      beginShape();
        vertex(42,0); vertex(34,-6); vertex(22,-12);
        vertex(4,-15); vertex(-10,-16); vertex(-28,-14);
        vertex(-40,-10); vertex(-46,-5); vertex(-46,5);
        vertex(-40,10); vertex(-28,14); vertex(-10,16);
        vertex(4,15); vertex(22,12); vertex(34,6);
      endShape(CLOSE);
      fill(lerpColor(color(col),color(0),0.15)); noStroke();
      beginShape(); vertex(22,-12); vertex(34,-6); vertex(42,0);
        vertex(34,6); vertex(22,12); vertex(20,-13); vertex(20,13);
      endShape(CLOSE);
      beginShape(); vertex(-28,-14); vertex(-40,-10); vertex(-46,-5);
        vertex(-46,5); vertex(-40,10); vertex(-28,14);
        vertex(-26,-14); vertex(-26,14);
      endShape(CLOSE);
      fill(lerpColor(color(col),color(5,5,10),0.45)); noStroke();
      beginShape();
        vertex(20,0); vertex(14,-8); vertex(2,-10);
        vertex(-12,-9); vertex(-22,-6); vertex(-24,0);
        vertex(-22,6); vertex(-12,9); vertex(2,10); vertex(14,8);
      endShape(CLOSE);
      fill(30,53,96,210); noStroke();
      beginShape();
        vertex(16,-7); vertex(4,-9); vertex(-8,-7); vertex(-10,-4);
        vertex(-10,4); vertex(-8,7); vertex(4,9); vertex(16,7);
        vertex(18,4); vertex(18,-4);
      endShape(CLOSE);
      stroke(68,102,170); strokeWeight(0.8); noFill();
      line(14,-6,12,6); line(10,-8,8,8);
      stroke(255,60,60); strokeWeight(1.5); noFill();
      line(18,-13,6,-14); line(18,13,6,14);
      stroke(255,136,136); strokeWeight(0.6);
      line(16,-12,6,-13); line(16,12,6,13);
      stroke(lerpColor(color(col),color(0),0.5)); strokeWeight(1.2); noFill();
      line(-4,-15,-18,-14); line(-4,15,-18,14);
      stroke(lerpColor(color(col),color(0),0.35)); strokeWeight(0.7); noFill();
      line(40,-3,18,-6); line(40,3,18,6);
      fill(lerpColor(color(col),color(255,60,60),0.3)); noStroke();
      triangle(42,0,36,-4,36,4);
      fill(255,252,200); noStroke();
      triangle(38,-5,30,-12,26,-9);
      triangle(38,5,30,12,26,9);
      stroke(255,232,64); strokeWeight(1.2); noFill();
      line(38,-4,32,-10); line(38,4,32,10);
      fill(238,32,32); noStroke();
      triangle(-40,-7,-46,-4,-36,-5);
      triangle(-40,7,-46,4,-36,5);
      stroke(255,51,51); strokeWeight(1.5); noFill();
      line(-42,-1,-42,1);
      fill(lerpColor(color(col),color(0),0.7)); noStroke();
      rect(-52,-18,6,36,1);
      fill(lerpColor(color(col),color(0),0.85));
      rect(-54,-20,4,8); rect(-54,12,4,8);
      stroke(lerpColor(color(col),color(0),0.55)); strokeWeight(1.5); noFill();
      line(-44,-10,-52,-10); line(-44,10,-52,10);
      noFill(); stroke(lerpColor(color(col),color(255,80,80),0.4)); strokeWeight(0.5);
      beginShape();
        vertex(42,0); vertex(34,-6); vertex(22,-12);
        vertex(4,-15); vertex(-10,-16); vertex(-28,-14);
        vertex(-40,-10); vertex(-46,-5); vertex(-46,5);
        vertex(-40,10); vertex(-28,14); vertex(-10,16);
        vertex(4,15); vertex(22,12); vertex(34,6);
      endShape(CLOSE);
    } else {
      fill(28, 28, 32); noStroke();
      [[-16, -13], [-16, 13], [14, -13], [14, 13]].forEach(([wx, wy]) => {
        push(); translate(wx, wy); rotate(this.wheelAngle);
        ellipse(0, 0, 14, 14); fill(55, 55, 60); ellipse(0, 0, 7, 7);
        stroke(70, 70, 75); strokeWeight(1);
        for (let a = 0; a < TWO_PI; a += PI / 2) line(0, 0, cos(a) * 4.5, sin(a) * 4.5);
        pop();
      });
      fill(col); noStroke(); rect(0, 0, 50, 26, 6);
      fill(lerpColor(color(col), color(10, 12, 18), 0.3)); rect(2, 0, 36, 20, 5);
      fill(55, 85, 130, 190); rect(4, 0, 28, 18, 4);
      fill(255, 250, 200); noStroke(); rect(23, -8, 5, 3, 1); rect(23, 8, 5, 3, 1);
      fill(200, 30, 30); rect(-22, -8, 4, 3, 1); rect(-22, 8, 4, 3, 1);
    }
    pop();
  }
}

// ─── 자동차 고장 (체력 0) 전체 초기화 ──────────────────────────
function triggerCarBreakdown() {
  // score를 highScore에 합산하지 않고 둘 다 초기화
  score = 0;
  highScore = 0;
  preGameViewBonus = 0;
  supercarUnlocked = false;
  saveGameProgress();
  viewRadius = 80;
  mazeMap = ORIGINAL_MAZE.map(r => [...r]);
  profProjectiles = [];
  profAttackTimer = 0;
  slowTimer = 0; invincibleTimer = 0; boostTimer = 0;
  scorePopups = [];
  carHP = MAX_HP;
  oeWon = false;
  monsterTriggered = false;
  monsterPhase = "IDLE";
  monsterFaceScale = 0;
  rpsPlayerScore = 0;
  rpsComputerScore = 0;
  car.resetToStart();
  shakeTimer = 40;
  addScorePopup("💥 자동차 고장! 전체 초기화", color(255, 80, 40));
}

function drawSirenGlow(cx, cy, angle) {
  push(); translate(cx, cy); rotate(angle);
  let isRed = (floor(frameCount / 5) % 2 === 0);
  noStroke(); rectMode(CENTER);
  if (isRed) {
    let g1 = drawingContext.createRadialGradient(20, -8, 0, 20, -8, 60);
    g1.addColorStop(0, 'rgba(255,20,60,0.22)'); g1.addColorStop(1, 'rgba(0,0,0,0)');
    drawingContext.fillStyle = g1; drawingContext.fillRect(-20, -60, 120, 100);
    let g2 = drawingContext.createRadialGradient(20, 8, 0, 20, 8, 60);
    g2.addColorStop(0, 'rgba(0,80,255,0.14)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
    drawingContext.fillStyle = g2; drawingContext.fillRect(-20, -30, 120, 100);
  } else {
    let g1 = drawingContext.createRadialGradient(20, 8, 0, 20, 8, 60);
    g1.addColorStop(0, 'rgba(0,80,255,0.22)'); g1.addColorStop(1, 'rgba(0,0,0,0)');
    drawingContext.fillStyle = g1; drawingContext.fillRect(-20, -30, 120, 100);
    let g2 = drawingContext.createRadialGradient(20, -8, 0, 20, -8, 60);
    g2.addColorStop(0, 'rgba(255,20,60,0.14)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
    drawingContext.fillStyle = g2; drawingContext.fillRect(-20, -60, 120, 100);
  }
  fill(18, 18, 22); noStroke(); rect(0, 0, 10, 18, 2);
  if (isRed) { fill("#FF1432"); rect(0, -5, 7, 7, 1); fill("#2244FF"); rect(0, 5, 7, 7, 1); }
  else { fill("#991020"); rect(0, -5, 7, 7, 1); fill("#1133DD"); rect(0, 5, 7, 7, 1); }
  pop();
}

// ─── 교수님 학점 공격 ──────────────────────────────────────────
function handleProfAttack() {
  profAttackTimer++;
  let spawnInterval = 65;
  if (profAttackTimer % spawnInterval === 0) {
    let spawnX = car.x + random(-160, 160);
    let spawnY = car.y - 260;
    let lastTwo = lastSpawnTypes.slice(-2);
    let forceA = (lastTwo.length === 2 && lastTwo[0] === 'F' && lastTwo[1] === 'F');
    let forceF = (lastTwo.length === 2 && lastTwo[0] === 'A' && lastTwo[1] === 'A');
    let type;
    if (forceA)      type = 'A';
    else if (forceF) type = 'F';
    else             type = (random() < 0.55) ? 'A' : 'F';
    lastSpawnTypes.push(type);
    if (lastSpawnTypes.length > 6) lastSpawnTypes.shift();
    profProjectiles.push({
      x: spawnX, y: spawnY,
      type: type,
      speed: random(3.0, 5.5),
      rot: random(TWO_PI),
      rotSpeed: random(-0.08, 0.08)
    });
  }

  let dtScale = getDtScale();
  for (let i = profProjectiles.length - 1; i >= 0; i--) {
    let p = profProjectiles[i];
    p.y += p.speed * dtScale;
    p.rot += p.rotSpeed * dtScale;
    let d = dist(car.x, car.y, p.x, p.y);
    if (d < 38) {
      if (p.type === 'A') {
        score += 10;
        viewRadius = min(viewRadius + 5, 230);
        isProfLoveObtained = true;
        collectFlashTimer = 15;
        addScorePopup("+10점  시야↑", color(160, 240, 180));
      } else {
        slowTimer = 130; hitFlashTimer = 20; shakeTimer = 18;
        addScorePopup("F학점!  속도↓", color(240, 100, 100));
      }
      profProjectiles.splice(i, 1); continue;
    }
    if (p.y > car.y + 400) profProjectiles.splice(i, 1);
  }
}

function drawProfProjectiles() {
  for (let p of profProjectiles) {
    push(); translate(p.x, p.y); rotate(p.rot); rectMode(CENTER);
    let isA = p.type === 'A';
    fill(0, 0, 0, 60); noStroke(); rect(3, 3, 30, 30, 4);
    fill(isA ? color(30, 140, 90) : color(160, 25, 25));
    stroke(isA ? "#50F0A0" : "#FF4444"); strokeWeight(2); rect(0, 0, 30, 30, 4);
    noStroke(); fill(isA ? "#AAFFCC" : "#FFB0B0");
    textAlign(CENTER, CENTER); textSize(16); textStyle(BOLD); text(p.type, 0, 0);
    noStroke(); fill(isA ? color(80, 255, 160, 40) : color(255, 80, 80, 40));
    ellipse(0, 0, 44, 44);
    pop();
  }
}

function drawSmoothFog() {
  if (monsterTriggered) return;

  let fw = width, fh = height;
  if (!fogGraphics || fogGraphics.width !== fw || fogGraphics.height !== fh) {
    if (fogGraphics) fogGraphics.remove();
    fogGraphics = createGraphics(fw, fh);
  }

  fogGraphics.clear();
  let fg = fogGraphics.drawingContext;

  fg.fillStyle = 'rgba(6, 7, 12, 1)';
  fg.fillRect(0, 0, fw, fh);

  let cx = offsetX + 300 * displayScale;
  let cy = offsetY + 240 * displayScale;

  fg.globalCompositeOperation = 'destination-out';

  let r = viewRadius * displayScale * 1.2;

  let grd = fg.createRadialGradient(cx, cy, r * 0.35, cx, cy, r * 1.6);
  grd.addColorStop(0,    'rgba(0,0,0,1.0)');
  grd.addColorStop(0.55, 'rgba(0,0,0,0.95)');
  grd.addColorStop(0.78, 'rgba(0,0,0,0.6)');
  grd.addColorStop(0.91, 'rgba(0,0,0,0.25)');
  grd.addColorStop(1.0,  'rgba(0,0,0,0.0)');
  fg.fillStyle = grd;
  fg.beginPath();
  fg.ellipse(cx, cy, r * 1.6, r * 1.35, 0, 0, Math.PI * 2);
  fg.fill();

  fg.globalCompositeOperation = 'source-over';

  push();
  resetMatrix();
  image(fogGraphics, 0, 0, fw, fh);
  pop();
}

// ─── HUD ─────────────────────────────────────────────────────
function drawHUD() {
  push();

  // ── 좌상단 스코어 패널 ──
  fill(8, 10, 18, 210); stroke(50, 55, 75); strokeWeight(1);
  rect(10, 10, 145, 56, 3); noStroke();
  fill(120, 115, 95); textSize(9); textStyle(NORMAL); textAlign(LEFT, TOP);
  text("SCORE", 20, 16);
  fill(220, 210, 170); textSize(20); textStyle(BOLD);
  text(nf(score, 5), 20, 26);
  fill(130, 120, 95); textSize(8); textStyle(NORMAL);
  text("BEST: " + nf(highScore, 5), 20, 52);

  // ── 체력 패널 (스코어 패널 아래) ──
  fill(8, 10, 18, 210); stroke(50, 55, 75); strokeWeight(1);
  rect(10, 72, 145, 36, 3); noStroke();
  fill(120, 115, 95); textSize(9); textStyle(NORMAL); textAlign(LEFT, TOP);
  text("HP", 20, 77);
  // 하트 아이콘으로 체력 표시
  let heartSpacing = 9;
let heartStartX = 40;
for (let i = 0; i < MAX_HP; i++) {
  let row = floor(i / 5);        // 0: 윗줄, 1: 아랫줄
  let col = i % 5;
  let hx = heartStartX + col * heartSpacing;
  let hy = 78 + row * 10;        // 윗줄 78, 아랫줄 88
  if (i < carHP) {
    let hpRatio = carHP / MAX_HP;
    let hCol = lerpColor(color(240, 60, 60), color(200, 100, 50), 1 - hpRatio);
    fill(hCol);
  } else {
    fill(30, 30, 40);
  }
  noStroke();
  let hs = 3.5;
  ellipse(hx - hs * 0.5, hy - hs * 0.3, hs, hs);
  ellipse(hx + hs * 0.5, hy - hs * 0.3, hs, hs);
  triangle(hx - hs, hy, hx + hs, hy, hx, hy + hs * 1.2);
}
  // 숫자로도 표시
  let hpColor = carHP <= 3 ? color(240, 80, 80) : carHP <= 10 ? color(220, 160, 60) : color(160, 210, 140);
  fill(hpColor); textSize(8); textStyle(BOLD); textAlign(RIGHT, TOP);
  text(carHP + "/" + MAX_HP, 148, 77);

  // HP 낮을 때 경고
  if (carHP <= 3) {
    let warnAlpha = (sin(frameCount * 0.2) + 1) * 80 + 40;
    fill(220, 50, 50, warnAlpha); stroke(180, 30, 30, warnAlpha); strokeWeight(1);
    rect(10, 72, 145, 42, 3);
    noStroke(); fill(255, 100, 100, warnAlpha * 0.8);
    textSize(8); textStyle(BOLD); textAlign(CENTER, CENTER);
    text("⚠ 위험!", 83, 110);
  }

  // ── 홀짝 승리 상태 표시 ──
  fill(8, 10, 18, 200); stroke(oeWon ? color(60, 180, 80) : color(100, 60, 100)); strokeWeight(1);
  rect(10, 114, 145, 22, 3); noStroke();
  if (oeWon) {
    fill(80, 220, 120); textSize(9); textStyle(BOLD); textAlign(LEFT, CENTER);
    text("✓ 출구 개방됨!", 18, 125);
  } else {
    fill(160, 100, 180); textSize(9); textStyle(BOLD); textAlign(LEFT, CENTER);
    text("🔒 홀짝 승리 필요", 18, 125);
  }

  // ── 상태 배지 ──
  if (slowTimer > 0) {
    fill(18, 22, 35, 220); stroke(80, 30, 30); strokeWeight(1);
    rect(10, 140, 145, 24, 2); noStroke();
    fill(40, 12, 12); rect(18, 147, 80, 7, 2);
    fill(200, 60, 60); rect(18, 147, map(slowTimer, 0, 130, 0, 80), 7, 2);
    fill(220, 80, 80); textSize(9); textStyle(BOLD); textAlign(LEFT, CENTER);
    text("F-PENALTY", 18, 155);
  }

  // ── 시야 게이지 ──
  fill(8, 10, 18, 185); stroke(40, 55, 80); strokeWeight(1);
  rect(340, 40, 150, 28, 3); noStroke();
  fill(90, 110, 140); textSize(8); textStyle(NORMAL); textAlign(LEFT, TOP);
  text("시야  " + floor(viewRadius), 350, 45);
  fill(18, 24, 36); noStroke(); rect(350, 57, 130, 5, 2);
  let vRatio = map(viewRadius, 80, 230, 0, 130);
  fill(color(60, 130, 200));
  rect(350, 57, vRatio, 5, 2);

  // ── 좌하단 조작 힌트 ──
  fill(8, 10, 18, 150); stroke(45, 50, 65); strokeWeight(1);
  rect(10, 335, 130, 56, 3); noStroke();
  fill(90, 95, 110); textSize(9); textStyle(NORMAL); textAlign(LEFT, TOP);
  text("방향키 : 방향 조절", 18, 341);
  let arrowData = [{lbl:"↑",x:55,y:358},{lbl:"←",x:38,y:373},{lbl:"↓",x:55,y:373},{lbl:"→",x:72,y:373}];
  for (let a of arrowData) {
    fill(30, 35, 50); stroke(60, 65, 85); strokeWeight(1); rectMode(CENTER);
    rect(a.x, a.y, 14, 14, 2); noStroke(); fill(160, 165, 175);
    textSize(9); textStyle(BOLD); textAlign(CENTER, CENTER);
    text(a.lbl, a.x, a.y);
  }
  rectMode(CORNER);

  // ── 우하단 미니맵 ──
  let mx = 448, my = 290, mw = 142, mh = 102;
  fill(8, 10, 18, 210); stroke(50, 55, 75); strokeWeight(1);
  rect(mx, my, mw, mh, 3); noStroke();
  fill(100, 105, 120); textSize(9); textStyle(NORMAL); textAlign(RIGHT, TOP);
  text("Mini Map", mx + mw - 6, my + 4);
  let rows = mazeMap.length, cols = mazeMap[0].length;
  let cellW = (mw - 12) / cols, cellH = (mh - 18) / rows;
  let mapX = mx + 6, mapY = my + 16;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let t = mazeMap[r][c];
      let cx2 = mapX + c * cellW, cy2 = mapY + r * cellH;
      if      (t === 1)   { fill(48, 50, 68);  rect(cx2, cy2, cellW, cellH); }
else if (t === 'E') {
  fill(oeWon ? color(20, 160, 80) : color(100, 40, 40));
  rect(cx2, cy2, cellW, cellH);
  fill(255); textAlign(CENTER, CENTER); textSize(5); textStyle(BOLD);
  text("E", cx2 + cellW / 2, cy2 + cellH / 2);
}
else if (t === 'R') { fill(30, 140, 90);  rect(cx2, cy2, cellW, cellH); }
else if (t === 'O') { fill(100, 50, 180); rect(cx2, cy2, cellW, cellH); }
else if (t === 'B') { fill(160, 130, 30); rect(cx2, cy2, cellW, cellH); }
else                { fill(22, 24, 34);   rect(cx2, cy2, cellW, cellH); }
  }
}
  let carGC = floor(car.x / tileSize), carGR = floor(car.y / tileSize);
  fill(255, 255, 100); noStroke();
  ellipse(mapX + (carGC + 0.5) * cellW, mapY + (carGR + 0.5) * cellH, 4, 4);

  // ── 하단 중앙 힌트 ──
  fill(8, 10, 18, 140); stroke(45, 50, 65); strokeWeight(1);
  rect(230, 383, 100, 14, 3);
  noStroke(); fill(90, 95, 110); textSize(8); textStyle(NORMAL); textAlign(CENTER, CENTER);
  text("F = 전체화면", 280, 390);
  pop();
}

// ─── 트리거 체크 ──────────────────────────────────────────────
function checkTriggers() {
  let gC = floor(car.x / tileSize);
  let gR = floor(car.y / tileSize);
  if (gR < 0 || gR >= mazeMap.length || gC < 0 || gC >= mazeMap[0].length) return;
  let tile = mazeMap[gR][gC];

  if (tile === 'R' || tile === 'O') {
    triggeredGridR = gR; triggeredGridC = gC;
    miniGameStep = "SELECT";
  }
  if (tile === 'R') {
    mazeMap[gR][gC] = 0;
    gameState = "MINIGAME"; currentMiniGame = "RPS";
    pChoice = ""; cChoice = "";
    miniGameResultText = "가위, 바위, 보 중 선택하세요.";
    rpsResultAnim = 0; rpsResultType = "none"; resultOverlayTimer = 0;
    removeRPSButtons();
    createRPSButtons();
  } else if (tile === 'O') {
    mazeMap[gR][gC] = 0;
    gameState = "MINIGAME"; currentMiniGame = "OE";
  } else if (tile === 'B') {
    mazeMap[gR][gC] = 0;
    viewRadius = min(viewRadius + 15, 230);
    collectFlashTimer = 20; score += 10;
    addScorePopup("+10점  시야+15", color(220, 200, 100));
  } else if (tile === 'E') {
    // oeWon이 false이면 출구 진입 불가
    if (!oeWon) {
      // 출구 앞에서 튕겨냄 (invincible 상태가 아닐 때)
      if (invincibleTimer <= 0) {
        addScorePopup("🔒 홀짝 게임 승리 먼저!", color(200, 120, 240));
        // 차를 살짝 뒤로 밀기
        car.x -= cos(car.angle) * tileSize * 0.6;
        car.y -= sin(car.angle) * tileSize * 0.6;
        invincibleTimer = 30;
        shakeTimer = 10;
      }
      return;
    }
    // 탈출 성공 보너스 먼저 추가
    score += 50;
    addScorePopup("🚪 탈출 성공! +50점", color(100, 255, 180));
    // 이번 게임 score를 highScore에 누적 합산
    highScore += score;
    saveGameProgress();
    removeAbortButton();
    gameState = "END";
  }

  if (monsterPhase === "IDLE" && car.hasMovedForward && gC === 1 && gR === 1) {
    monsterTriggered = true;
    monsterPhase = "JUMPSCARE";
    monsterTimer = MONSTER_APPEAR_FRAMES;
    monsterFaceScale = 0;
    shakeTimer = 80;
    if (!soundGhostRoar.isPlaying()) soundGhostRoar.play();
  }
  if (gC > 3 || gR > 2) car.hasMovedForward = true;
}

// ─── RPS 버튼 생성 ────────────────────────────────────────────
function createRPSButtons() {
  removeRPSButtons();
  if (miniGameStep === "RESULT") return;
  // 오른쪽 패널 3개 선택지 박스에 투명 클릭 영역 생성
  let boxYs = [170, 218, 266];
  let moves = ["가위", "바위", "보"];
  for (let i = 0; i < 3; i++) {
    let btn = createButton("");
    let vx = 318, vy = boxYs[i] - 19, vw = 248, vh = 38;
    btn.position(offsetX + vx * displayScale, offsetY + vy * displayScale);
    btn.size(vw * displayScale, vh * displayScale);
    btn.style("background", "transparent");
    btn.style("border", "none");
    btn.style("cursor", "pointer");
    btn.style("z-index", "999");
    let move = moves[i];
    btn.mousePressed(() => handleRPSPlay(move));
    rpsDomButtons.push(btn);
  }
}

function removeRPSButtons() {
  for (let b of rpsDomButtons) b.remove();
  rpsDomButtons = [];
}

// ─── RPS 승패 로직 ───────────────────────────────────────────
function handleRPSPlay(playerMove) {
  if (miniGameStep !== "SELECT") return;
  miniGameStep = "RESULT";

  pChoice = playerMove;
  let opts = ["가위", "바위", "보"];
  cChoice = opts[Math.floor(Math.random() * 3)];

  rpsResultAnim = 0.3;
  resultOverlayTimer = 140; // 넉넉하게 늘림

  removeRPSButtons();

  if (pChoice === cChoice) {
    miniGameResultText = "무승부! 다시 선택하세요.";
    rpsResultType = "draw";
    resultOverlayType = "draw";
  } else if (
    (pChoice === "가위" && cChoice === "보")   ||
    (pChoice === "바위" && cChoice === "가위") ||
    (pChoice === "보"   && cChoice === "바위")
  ) {
    score += 5;
    miniGameResultText = "승리! 시야 +30  점수 +5";
    rpsResultType = "win";
    resultOverlayType = "win";
    rpsPlayerScore++;
    viewRadius = min(viewRadius + 30, 230);
    isProfLoveObtained = true;
    addScorePopup("+5점!", color(80, 240, 140));
  } else {
    // ── RPS 패배: 전체 초기화 ──
    miniGameResultText = "패배! 모든 것이 초기화됩니다...";
    rpsResultType = "lose";
    resultOverlayType = "lose";
    rpsComputerScore++;
    addScorePopup("패배! 점수 초기화", color(240, 80, 80));
  }
}

// ─── RPS 패배 후 초기화 실행 ──────────────────────────────────
function applyRPSLosePenalty() {
  // 점수만 초기화, 나머지(시야·체력·미로·포인트) 유지
  score = 0;
  slowTimer = 0;
  hitFlashTimer = 0; collectFlashTimer = 0;
  scorePopups = [];
  addScorePopup("패배! 점수 초기화", color(240, 80, 80));
  gameState = "PLAY";
}

// ─── OE 패배 후 초기화 실행 ──────────────────────────────────
function applyOELosePenalty() {
  score = 0;
  viewRadius = 80 + preGameViewBonus;
  mazeMap = ORIGINAL_MAZE.map(r => [...r]);
  profProjectiles = [];
  profAttackTimer = 0;
  slowTimer = 0; invincibleTimer = 60; boostTimer = 0;
  hitFlashTimer = 0; collectFlashTimer = 0;
  scorePopups = [];
  carHP = MAX_HP;
  oeWon = false;
  rpsPlayerScore = 0;
  rpsComputerScore = 0;
  monsterTriggered = false;
  monsterPhase = "IDLE";
  monsterFaceScale = 0;
  car.resetToStart();
}

// ─── 미니게임 화면 ────────────────────────────────────────────
function drawMiniGameScreen() {
  if (currentMiniGame === "RPS") drawRPSScreen();
  else if (currentMiniGame === "OE") {
    background(10, 12, 18);
    drawConcreteTexture(0, 0, 600, 400, 8);
    push();
    fill(12, 14, 22); stroke(55, 60, 85); strokeWeight(1.5); rect(35, 22, 530, 355, 4);
    fill(22, 25, 38); noStroke(); rect(35, 22, 530, 46, 4, 4, 0, 0);
    fill(180, 175, 150); textAlign(LEFT, CENTER); textSize(13); textStyle(BOLD);
    text("MINIGAME", 55, 45);
    fill(100, 105, 120); textAlign(RIGHT, CENTER); textSize(10); textStyle(NORMAL);
    text("[ 방어 시스템 가동 중 ]", 550, 45);
    pop();
    drawOELogic();
  }
}

// ─── RPS 전용 화면 ───────────────────────────────────────────
// ─── RPS 전용 화면 ───────────────────────────────────────────
// 이스터에그: 교수 클릭 카운터
let profClickCount = 0;
let profEasterEggActive = false;
let profEasterEggTimer = 0;

function drawRPSScreen() {
  background(6, 5, 10);

  // 배경 패턴 (random 미사용 — 깜빡임 방지)
  push(); stroke(20, 16, 14); strokeWeight(1); noFill();
  for (let i = 0; i < 6; i++) {
    line(i * 100, 0, i * 100 + 50, 400);
  }
  pop();

  // rpsResultAnim: SELECT일 땐 항상 1.0, RESULT일 때만 lerp
  if (miniGameStep === "RESULT") {
    rpsResultAnim = lerp(rpsResultAnim, 1.0, 0.14);
  } else {
    rpsResultAnim = 0;
  }

  drawRPSMonster();

  // ── 이스터에그 오버레이 ──
  if (profEasterEggActive) {
    profEasterEggTimer--;
    let ea = min(profEasterEggTimer / 60.0, 1.0);
    push();
    fill(0, 0, 0, 180 * ea); noStroke(); rect(0, 0, 600, 400);
    textAlign(CENTER, CENTER); textStyle(BOLD);
    textSize(28); fill(220, 190, 80, 255 * ea);
    text("그만 좀 때리세요...!", 300, 155);
    textSize(16); fill(180, 240, 160, 240 * ea);
    text("50점을 드릴 테니 제발 가주세요", 300, 198);
    textSize(40); text("😭", 300, 248);
    textSize(11); fill(160, 200, 140, 200 * ea);
    text("(보너스 +50pt 지급됨)", 300, 295);
    pop();
    if (profEasterEggTimer <= 0) {
      profEasterEggActive = false;
      profClickCount = 0;
    }
    return;
  }

  // ══════════════ SELECT ══════════════
  if (miniGameStep === "SELECT") {
    drawSpeechBubble(270, 8, 286, 92,
  "이기면 점수를 주고\n지면 모든 점수를\n가져가마...",
    color(220, 190, 120));
    push();
    fill(12, 14, 22, 235); stroke(55, 60, 90); strokeWeight(1.5);
    rect(310, 108, 262, 268, 6);
    noStroke();
    fill(160, 155, 130); textAlign(CENTER, CENTER); textSize(13); textStyle(BOLD);
    text("무엇을 낼까?", 441, 128);
    stroke(50, 55, 75); strokeWeight(1); noFill();
    line(328, 144, 554, 144);

    let choices = [
      { label: "✂  가위",  y: 170 },
      { label: "✊  바위", y: 218 },
      { label: "✋  보",   y: 266 }
    ];
    for (let c of choices) {
      let vmX = getVirtualMouseX(), vmY = getVirtualMouseY();
      let isHov = vmX > 318 && vmX < 566 && vmY > c.y - 21 && vmY < c.y + 21;
      fill(isHov ? color(28, 38, 62) : color(16, 18, 30));
      stroke(isHov ? color(130, 155, 220) : color(48, 52, 78));
      strokeWeight(isHov ? 2 : 1);
      rectMode(CENTER); rect(441, c.y, 224, 38, 4);
      noStroke();
      fill(isHov ? color(220, 210, 255) : color(168, 162, 138));
      textSize(14); textStyle(BOLD); textAlign(LEFT, CENTER);
      text(c.label, 338, c.y);
      fill(isHov ? color(140, 140, 200) : color(88, 90, 104));
      textSize(9); textStyle(NORMAL); textAlign(RIGHT, CENTER);
      text(c.desc, 558, c.y);
    }
    rectMode(CORNER);

    fill(10, 12, 20, 185); noStroke(); rect(318, 316, 244, 52, 4);
    fill(130, 125, 100); textSize(9); textStyle(NORMAL); textAlign(CENTER, CENTER);
    text("현재 점수: " + score + "pt", 440, 332);
    fill(90, 88, 75); textSize(8);
    text("클릭 또는 키보드 1/2/3 으로 선택", 440, 350);
    pop();

  // ══════════════ RESULT ══════════════
  } else if (miniGameStep === "RESULT") {
    let a = rpsResultAnim; // 0 → 1

    // 말풍선 반응
    if (rpsResultType === "draw") {
      drawSpeechBubble(270, 44, 286, 86, "흥... 비겼군.\n다시 해봐라.", color(180, 180, 230));
    } else if (rpsResultType === "win") {
      drawSpeechBubble(270, 44, 286, 86, "...말도 안 돼!\n네가 이기다니!", color(100, 220, 150));
    } else {
      drawSpeechBubble(270, 44, 286, 86, "크하하!\n점수는 내 거다!", color(240, 100, 80));
    }

    push();
    // 우측 결과 패널
    let pBg = rpsResultType === "win"  ? color(8, 30, 15, 240) :
              rpsResultType === "lose" ? color(30, 6, 6, 240)  : color(15, 15, 36, 240);
    let pBd = rpsResultType === "win"  ? color(55, 200, 90)  :
              rpsResultType === "lose" ? color(210, 45, 45)   : color(130, 130, 205);
    fill(pBg); stroke(pBd); strokeWeight(2);
    rect(308, 54, 266, 322, 6);

    // ── 선택 카드 2장 ──
    // 내 선택
    noStroke(); fill(18, 22, 36); rect(318, 64, 108, 104, 5);
    stroke(75, 86, 118); strokeWeight(1); noFill(); rect(318, 64, 108, 104, 5);
    noStroke();
    fill(115, 110, 96); textSize(9); textStyle(NORMAL); textAlign(CENTER, CENTER);
    text("내가 낸 것", 372, 78);
    textSize(38); fill(220, 215, 195); text(getRPSEmoji(pChoice), 372, 114);
    fill(160, 155, 130); textSize(12); textStyle(BOLD); text(pChoice, 372, 152);

    // VS
    fill(80, 82, 98); textSize(13); textStyle(BOLD); textAlign(CENTER, CENTER);
    text("VS", 441, 114);

    // 교수가 낸 것
    noStroke(); fill(18, 22, 36); rect(453, 64, 108, 104, 5);
    stroke(75, 86, 118); strokeWeight(1); noFill(); rect(453, 64, 108, 104, 5);
    noStroke();
    fill(115, 110, 96); textSize(9); textStyle(NORMAL); textAlign(CENTER, CENTER);
    text("교수가 낸 것", 507, 78);
    textSize(38); fill(220, 215, 195); text(getRPSEmoji(cChoice), 507, 114);
    fill(160, 155, 130); textSize(12); textStyle(BOLD); text(cChoice, 507, 152);

    // 구분선
    stroke(pBd); strokeWeight(1); noFill(); line(318, 174, 566, 174);

    // ── WIN / LOSE / DRAW 결과 ──
    noStroke(); textAlign(CENTER, CENTER); textStyle(BOLD);

    if (rpsResultType === "win") {
      textSize(62); fill(0, 0, 0, 120); text("WIN!", 442, 220);
      textSize(62); fill(70, 252, 140); text("WIN!", 440, 218);

      fill(10, 40, 18); rect(318, 246, 244, 86, 4);
      stroke(48, 175, 78); strokeWeight(1); noFill(); rect(318, 246, 244, 86, 4);
      noStroke();
      fill(90, 252, 155); textSize(12); textStyle(BOLD); text("✦  보상  ✦", 440, 265);
      fill(70, 218, 120); textSize(18); textStyle(BOLD); text("시야 +30", 400, 292);
      fill(70, 195, 110); textSize(12); textStyle(NORMAL); text("점수 +5", 500, 292);
      fill(110, 170, 132); textSize(9); text("미로 탐험 계속!", 440, 316);

    } else if (rpsResultType === "lose") {
      textSize(62); fill(0, 0, 0, 120); text("LOSE", 442, 220);
      textSize(62); fill(238, 50, 50); text("LOSE", 440, 218);

      fill(42, 7, 7); rect(318, 246, 244, 86, 4);
      stroke(195, 38, 38); strokeWeight(1); noFill(); rect(318, 246, 244, 86, 4);
      noStroke();
      fill(252, 85, 85); textSize(12); textStyle(BOLD); text("⚠  패널티  ⚠", 440, 265);
      fill(252, 65, 65); textSize(16); textStyle(BOLD); text("태초 마을로 초기화", 440, 291);
      fill(215, 122, 122); textSize(9); textStyle(NORMAL);
      text("점수·시야·체력·미로 전부 리셋!", 440, 315);

    } else {
      textSize(56); fill(0, 0, 0, 100); text("DRAW", 442, 216);
      textSize(56); fill(175, 175, 252); text("DRAW", 440, 214);

      fill(22, 22, 50); rect(318, 246, 244, 68, 4);
      noStroke();
      fill(155, 155, 225); textSize(14); textStyle(BOLD); text("비겼습니다", 440, 270);
      fill(125, 125, 175); textSize(10); textStyle(NORMAL); text("다시 한 번 선택하세요", 440, 294);
    }

    // 하단 안내
    fill(7, 9, 17); noStroke(); rect(318, 340, 244, 28, 4);
    if (rpsResultType === "lose") {
      fill(252, 105, 105); textSize(9); textStyle(BOLD); textAlign(CENTER, CENTER);
      text("아무 키 / 클릭  →  초기화 후 재시작", 440, 354);
    } else if (rpsResultType === "draw") {
      fill(145, 145, 205); textSize(9); textStyle(NORMAL); textAlign(CENTER, CENTER);
      text("아무 키 / 클릭  →  다시 선택", 440, 354);
    } else {
      fill(95, 205, 145); textSize(9); textStyle(NORMAL); textAlign(CENTER, CENTER);
      text("아무 키 / 클릭  →  계속하기", 440, 354);
    }
    pop();
  }
}

// ── 교수 몬스터 ──────────────────────────────────────────────
function drawRPSMonster() {
  push();
  fill(8, 6, 12, 220); stroke(38, 28, 48); strokeWeight(1.5);
  rect(6, 106, 290, 270, 6);

  let cx = 138, cy = 255;

  // 이스터에그: 클릭 시 흔들림
  let shk = 0;
  if (profClickCount > 0 && profClickCount < 10) {
    shk = sin(frameCount * 0.8) * (profClickCount * 0.8);
  }
  translate(shk, 0);

  // 그림자
  fill(0, 0, 0, 55); noStroke(); ellipse(cx + 4, cy + 92, 128, 36);

  // 가운 (검정 학자 로브)
  fill(14, 10, 22); noStroke();
  beginShape();
    vertex(cx - 54, cy + 100); vertex(cx - 70, cy + 148);
    vertex(cx + 70, cy + 148); vertex(cx + 54, cy + 100);
    vertex(cx + 34, cy + 18);  vertex(cx - 34, cy + 18);
  endShape(CLOSE);
  // 가운 깃 (흰색 셔츠)
  fill(185, 180, 168); noStroke();
  triangle(cx - 16, cy + 18, cx, cy + 52, cx + 16, cy + 18);
  // 넥타이
  fill(140, 20, 20);
  triangle(cx - 6, cy + 22, cx + 6, cy + 22, cx, cy + 60);

  // 목
  fill(52, 38, 34); rect(cx - 12, cy - 10, 24, 30, 3);

  // ── 얼굴 (스케치 스타일: 각진 사각형 얼굴) ──
  fill(62, 44, 38); noStroke();
  // 턱 각진 형태
  beginShape();
    vertex(cx - 44, cy - 80); vertex(cx + 44, cy - 80);
    vertex(cx + 48, cy - 50); vertex(cx + 42, cy + 8);
    vertex(cx + 28, cy + 22); vertex(cx - 28, cy + 22);
    vertex(cx - 42, cy + 8);  vertex(cx - 48, cy - 50);
  endShape(CLOSE);
  // 얼굴 음영
  fill(42, 28, 22, 100); ellipse(cx + 16, cy - 20, 50, 65);

  // ── 흰 머리 (교수) ──
  fill(195, 190, 178); noStroke();
  // 옆 머리
  ellipse(cx - 44, cy - 70, 22, 52);
  ellipse(cx + 44, cy - 70, 22, 52);
  // 윗 머리 (듬성듬성)
  ellipse(cx - 20, cy - 92, 30, 22);
  ellipse(cx + 20, cy - 92, 30, 22);
  ellipse(cx,      cy - 96, 20, 16);
  // 대머리 부분
  fill(62, 44, 38); ellipse(cx, cy - 84, 52, 30);

  // ── 학사모 ──
  fill(12, 8, 20); noStroke();
  rect(cx - 46, cy - 106, 92, 14, 2); // 챙
  rect(cx - 30, cy - 128, 60, 26, 3); // 모자 몸통
  fill(200, 35, 35); rect(cx - 30, cy - 132, 60, 6, 2); // 빨간 띠
  // 졸업 술
  stroke(210, 180, 50); strokeWeight(1.5); noFill();
  line(cx + 28, cy - 112, cx + 50, cy - 96);
  fill(225, 195, 55); noStroke(); ellipse(cx + 50, cy - 93, 9, 9);

  // ── 안경 (두꺼운 뿔테) ──
  fill(28, 22, 18); noStroke();
  rect(cx - 38, cy - 46, 32, 22, 3);  // 왼쪽 테
  rect(cx + 6,  cy - 46, 32, 22, 3);  // 오른쪽 테
  rect(cx - 6,  cy - 40, 12, 6);      // 코받침
  rect(cx - 52, cy - 42, 14, 6, 2);   // 왼쪽 다리
  rect(cx + 38, cy - 42, 14, 6, 2);   // 오른쪽 다리

  // ── 눈 ──
  let ep = 0.7 + sin(frameCount * 0.07) * 0.3;
  // 흰자
  fill(210, 200, 188); noStroke();
  ellipse(cx - 22, cy - 36, 20, 14);
  ellipse(cx + 22, cy - 36, 20, 14);
  // 홍채 (빨간 화난 눈)
  fill(int(180 * ep), int(15 * ep), int(15 * ep));
  ellipse(cx - 22, cy - 36, 12, 12);
  ellipse(cx + 22, cy - 36, 12, 12);
  // 동공
  fill(5, 0, 0);
  ellipse(cx - 22, cy - 36, 6, 6);
  ellipse(cx + 22, cy - 36, 6, 6);
  // 반짝임
  fill(255, 210, 210, 185);
  ellipse(cx - 25, cy - 39, 4, 3);
  ellipse(cx + 19, cy - 39, 4, 3);

  // ── 눈썹 (V자로 화남) ──
  fill(55, 38, 28); noStroke();
  // 왼쪽 눈썹
  beginShape(); vertex(cx-36,cy-53); vertex(cx-14,cy-48); vertex(cx-14,cy-44); vertex(cx-36,cy-49); endShape(CLOSE);
  // 오른쪽 눈썹
  beginShape(); vertex(cx+14,cy-48); vertex(cx+36,cy-53); vertex(cx+36,cy-49); vertex(cx+14,cy-44); endShape(CLOSE);

  // ── 코 (뭉툭) ──
  fill(48, 32, 26); noStroke();
  ellipse(cx, cy - 14, 14, 12);
  fill(38, 24, 18);
  ellipse(cx - 4, cy - 12, 5, 4);
  ellipse(cx + 4, cy - 12, 5, 4);

  // ── 입 (화난 — 아래로 내려간 양 끝) ──
  let mw = sin(frameCount * 0.1) * 1.5;
  stroke(26, 12, 10); strokeWeight(2.5); noFill();
  beginShape();
    vertex(cx - 22, cy + 14 + mw);
    vertex(cx - 10, cy + 8);
    vertex(cx + 10, cy + 8);
    vertex(cx + 22, cy + 14 + mw);
  endShape();
  // 이빨 (아랫니)
  fill(205, 195, 178); noStroke();
  for (let ti = 0; ti < 4; ti++) {
    rect(cx - 16 + ti * 9, cy + 8, 7, 5, 1);
  }

  // ── 수염 ──
  stroke(178, 172, 155, 155); strokeWeight(1.2);
  line(cx - 24, cy + 4, cx - 40, cy + 2);
  line(cx - 24, cy + 7, cx - 40, cy + 8);
  line(cx + 24, cy + 4, cx + 40, cy + 2);
  line(cx + 24, cy + 7, cx + 40, cy + 8);

  // ── 팔 & 검지 ──
  fill(50, 36, 30); noStroke();
  push();
  translate(cx + 54, cy + 62);
  rotate(-0.45 + sin(frameCount * 0.06) * 0.1);
  rect(-7, -48, 14, 52, 4);
  ellipse(0, -50, 21, 21);
  // 검지 손가락
  fill(54, 40, 34);
  rect(-4, -80, 9, 34, 3);
  // 손가락 마디
  stroke(40, 28, 22); strokeWeight(1); noFill();
  line(-4, -68, 5, -68);
  line(-4, -58, 5, -58);
  pop();

  // ── 점수/승패 기록 ──
  fill(7, 5, 11, 190); noStroke(); rect(14, 340, 276, 28, 4);
  fill(135, 96, 75); textSize(9); textStyle(NORMAL); textAlign(LEFT, CENTER);
  text("점수: " + score + "pt", 26, 354);
  fill(175, 135, 55); textAlign(RIGHT, CENTER);
  text("교수 " + rpsComputerScore + " : " + rpsPlayerScore + " 나", 282, 354);

  // 이스터에그 힌트 (5번 이상 클릭 시)
  if (profClickCount >= 5 && profClickCount < 10) {
    fill(220, 180, 60, 180); textSize(8); textStyle(BOLD); textAlign(CENTER, CENTER);
    text("(계속 때리면 뭔가 일어날 것 같은데...)", 148, 372);
  }

  pop();
}

// ── 말풍선 ──────────────────────────────────────────────────
function drawSpeechBubble(x, y, w, h, txt, col) {
  push();
  // 꼬리
  fill(14, 12, 24); noStroke();
  triangle(x + 16, y + h, x + 46, y + h, x + 12, y + h + 22);
  // 배경
  fill(14, 12, 24); stroke(col); strokeWeight(1.5);
  rect(x, y, w, h, 10);
  noStroke(); fill(col);
  textAlign(CENTER, CENTER); textSize(11); textStyle(BOLD);
  text(txt, x + w / 2, y + h / 2 + 2);
  pop();
}

function getRPSEmoji(m) {
  if (m === "가위") return "✂";
  if (m === "바위") return "✊";
  if (m === "보")   return "✋";
  return "？";
}

// ─── 홀짝 로직 ────────────────────────────────────────────────
function drawOELogic() {
  push();
  fill(140, 110, 200); textAlign(CENTER, CENTER); textSize(14); textStyle(BOLD);
  text("홀짝 학점 예측 매트릭스", 300, 88);
  textSize(10); textStyle(NORMAL); fill(120, 125, 135);
  text("주사위 결과를 예측하여 A+ 플래그를 획득하세요", 300, 108);

  if (miniGameStep === "SELECT") {
    fill(180, 175, 150); textSize(13); textStyle(BOLD);
    text("주사위 숫자 예측", 300, 168);
    [{ label: "[ 1 ]  홀수", x: 180 }, { label: "[ 2 ]  짝수", x: 420 }].forEach(b => {
      fill(18, 20, 30); stroke(50, 55, 75); strokeWeight(1); rectMode(CENTER);
      rect(b.x, 228, 150, 50, 4);
      noStroke(); fill(180, 175, 150); textSize(13); textStyle(BOLD);
      text(b.label, b.x, 228);
    });
    fill(120, 125, 135); textSize(10); textStyle(NORMAL);
    text("키보드 1 또는 2 를 눌러 선택", 300, 290);
    // 경고 표시
    fill(220, 160, 60); textSize(9); textStyle(BOLD);
    text("⚠ 패배 시 전체 초기화  |  승리 시 출구 개방!", 300, 312);
  } else if (miniGameStep === "ANIMATION") {
    miniGameTimer--;
    textSize(64); fill("#C8A828");
    let faces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
    text(faces[floor(frameCount / 3) % 6], 300, 218);
    fill(160, 155, 130); textSize(12); textStyle(NORMAL);
    text("주사위 굴리는 중...", 300, 290);
    if (miniGameTimer <= 0) miniGameStep = "RESULT";
  } else if (miniGameStep === "RESULT") {
    rpsResultAnim = lerp(rpsResultAnim, 1.0, 0.10);
    
    // 결과 카드
    noStroke();
    fill(isMiniGameWin ? color(18, 60, 35, 180 * rpsResultAnim) : color(60, 18, 18, 180 * rpsResultAnim));
    rect(60, 148, 480, 100, 6);
    stroke(isMiniGameWin ? color(60, 200, 100, 200 * rpsResultAnim) : color(200, 60, 60, 200 * rpsResultAnim));
    strokeWeight(2); noFill(); rect(60, 148, 480, 100, 6);
    noStroke();
    textSize(44); fill(255, 255, 255, 200 * rpsResultAnim);
    text(isMiniGameWin ? "🎉" : "💀", 300, 168);
    textSize(14); textStyle(BOLD); noStroke();
    fill(isMiniGameWin ? color(80, 220, 130) : color(220, 70, 70));
    text(miniGameResultText, 300, 210);
    fill(170, 165, 145); textSize(11); textStyle(NORMAL);
    text("예측: " + pChoice + "  |  결과: " + cChoice, 300, 258);
    fill(100, 105, 120); textSize(10);
    if (isMiniGameWin) {
      text("아무 키나 누르면 게임으로 돌아갑니다", 300, 330);
    } else {
      fill(220, 100, 100); textSize(10); textStyle(BOLD);
      text("아무 키 → 초기화 후 게임 재시작", 300, 330);
    }
  }
  pop();
}

function processMiniGameSelection(numInput) {
  miniGameStep = "ANIMATION"; miniGameTimer = 70;
  rpsResultAnim = 0;
  resultOverlayTimer = 120; // 넉넉하게 늘림
  if (currentMiniGame === "OE") {
    pChoice = (numInput === 1) ? "홀수" : "짝수";
    let dice = floor(random(1, 7));
    let isOdd = (dice % 2 !== 0);
    cChoice = dice + " (" + (isOdd ? "홀수" : "짝수") + ")";
    if ((numInput === 1 && isOdd) || (numInput === 2 && !isOdd)) {
      miniGameResultText = "연산 성공! A+ 플래그 확보.  시야 +30";
      isProfLoveObtained = true; isMiniGameWin = true;
      viewRadius = min(viewRadius + 30, 230);
      oeWon = true; // ★ 출구 개방!
    } else {
      miniGameResultText = "연산 실패. 재수강 루프 진입...";
      isMiniGameWin = false;
    }
  }
}

// ─── 종료 화면 ────────────────────────────────────────────────
function drawEndScreen() {
  background(8, 9, 14);
  drawConcreteTexture(0, 0, 600, 400, 8);
  push(); textAlign(CENTER, CENTER);
  if (!isProfLoveObtained) {
    fill(160, 30, 30, 40); noStroke(); rect(0, 0, 600, 400);
    for (let i = 0; i < 400; i += 4) { stroke(160, 0, 0, 18); strokeWeight(1); line(0, i, 600, i); }
    noStroke();
    fill(180, 50, 50); textSize(10); textStyle(NORMAL); text("RESULT: FAIL", 300, 90);
    fill(220, 60, 60); textSize(20); textStyle(BOLD);
    text('"지각에 과제 미제출,\nF학점입니다."', 300, 148);
    fill(170, 145, 145); textSize(12); textStyle(NORMAL);
    text("다음 학기에 다시 보겠습니다.", 300, 212);
    fill(100, 70, 70); textSize(11); text("SCORE: " + score, 300, 238);
    fill(140, 100, 100); textSize(10); text("BEST: " + highScore, 300, 256);
  } else {
    fill(20, 160, 80, 20); noStroke(); rect(0, 0, 600, 400);
    for (let i = 0; i < 600; i += 3) { stroke(20, 160, 80, 8); strokeWeight(1); line(i, 0, i, 400); }
    noStroke();
    fill(80, 200, 130); textSize(10); textStyle(NORMAL); text("RESULT: CLEAR", 300, 80);
    fill(160, 210, 175); textSize(16); textStyle(BOLD);
    text('"이 험난한 예외 처리를 뚫고\n출근하다니 — A+ 수여합니다."', 300, 138);
    fill(200, 220, 180); textSize(22); textStyle(BOLD); text(" <탈출 성공> ", 300, 200);
    fill(100, 220, 160); textSize(11); textStyle(NORMAL);
    text("탈출 보너스  +50pt  포함", 300, 224);
    fill(130, 170, 150); textSize(14); textStyle(BOLD); text("FINAL SCORE: " + score, 300, 246);
    fill(220, 200, 100); textSize(10); textStyle(NORMAL);
    text("누적 포인트(상점 사용 가능):  " + highScore + " pt", 300, 264);
  }
  fill(60, 65, 80); textSize(9); textStyle(NORMAL);
  text(" SSU GLOBAL MEDIA  // made by 황다연, 신준희, 이서윤  //  Class of 26 ", 300, 360);
  pop();
  buttons.reset.draw();
}

// ─── 점프스케어 ───────────────────────────────────────────────
function drawScaryMonsterWindow() {
  if (monsterPhase !== "JUMPSCARE") return;

  let dtScale = getDtScale();
  monsterTimer -= dtScale;

  let progress = 1.0 - (monsterTimer / MONSTER_APPEAR_FRAMES);
  monsterFaceScale = lerp(monsterFaceScale, 3.2, 0.22);

  let flashAlpha = map(progress, 0, 0.25, 0, 255);
  if (progress < 0.25) {
    let fc = drawingContext;
    fc.fillStyle = `rgba(180,0,0,${flashAlpha/255})`;
    fc.fillRect(0, 0, 600, 400);
  } else {
    drawingContext.fillStyle = 'rgba(0,0,0,0.92)';
    drawingContext.fillRect(0, 0, 600, 400);
  }

  push(); noFill();
  for (let i = 0; i < 12; i++) {
    let ly = random(400);
    stroke(200, 0, 0, random(40, 120)); strokeWeight(random(0.5, 2.5));
    line(0, ly, 600, ly);
  }
  for (let i = 0; i < 4; i++) {
    let lx = random(600);
    stroke(180, 0, 40, random(30, 80)); strokeWeight(random(0.5, 1.5));
    line(lx, 0, lx, 400);
  }
  pop();

  if (progress > 0.12) {
    let faceAlpha = map(progress, 0.12, 0.35, 0, 1.0);
    let s = monsterFaceScale;
    let cx = 300, cy = 210;

    let ctx = drawingContext;
    ctx.save();
    ctx.globalAlpha = min(faceAlpha, 1.0);
    ctx.translate(cx, cy);
    ctx.scale(s * (1 + sin(frameCount * 0.6) * 0.03), s * (1 + cos(frameCount * 0.5) * 0.03));

    ctx.beginPath();
    ctx.ellipse(0, 0, 58, 70, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0A0000';
    ctx.fill();
    let skinGrad = ctx.createRadialGradient(-10, -20, 5, 0, 0, 62);
    skinGrad.addColorStop(0,   'rgba(60,15,10,0.9)');
    skinGrad.addColorStop(0.5, 'rgba(30,5,5,0.85)');
    skinGrad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 56, 68, 0, 0, Math.PI * 2);
    ctx.fill();

    let eyePulse = sin(frameCount * 0.4) * 0.5 + 0.5;
    for (let ex of [-20, 20]) {
      ctx.beginPath();
      ctx.ellipse(ex, -12, 16, 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,210,200,0.95)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(180,20,20,0.7)`;
      ctx.lineWidth = 0.6;
      for (let v = 0; v < 5; v++) {
        ctx.beginPath();
        ctx.moveTo(ex + random(-14, 14), -12 + random(-8, 8));
        ctx.lineTo(ex + random(-14, 14), -12 + random(-8, 8));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(ex, -12, 8, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${160 + eyePulse*60},0,0,1)`;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex, -12, 2.5, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex - 3, -16, 3, 2, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.ellipse(-6, 4, 4, 5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(6, 4, 4, 5, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#050000';
    ctx.fill();

    let mouthOpen = 14 + sin(frameCount * 0.35) * 6;
    ctx.beginPath();
    ctx.moveTo(-32, 26);
    ctx.bezierCurveTo(-20, 20, 0, 18, 32, 26);
    ctx.bezierCurveTo(20, 26 + mouthOpen, 0, 28 + mouthOpen, -32, 26);
    ctx.fillStyle = '#1A0000';
    ctx.fill();
    ctx.fillStyle = '#6A1515';
    ctx.beginPath();
    ctx.moveTo(-30, 26); ctx.lineTo(30, 26);
    ctx.bezierCurveTo(20, 26 + 4, 0, 26 + 5, -30, 26);
    ctx.fill();
    let teethX = [-24, -16, -8, 0, 8, 16, 24];
    let teethH  = [10, 14, 11, 16, 9, 13, 10];
    ctx.fillStyle = '#D8C8B0';
    for (let t = 0; t < teethX.length; t++) {
      ctx.beginPath();
      ctx.rect(teethX[t] - 3, 26, 5, teethH[t]);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(160,0,0,0.85)';
    for (let bd of [-18, -4, 12, 22]) {
      let bdLen = 8 + noise(bd + frameCount * 0.05) * 14;
      ctx.beginPath();
      ctx.moveTo(bd, 26 + mouthOpen + 2);
      ctx.lineTo(bd + random(-2,2), 26 + mouthOpen + bdLen);
      ctx.lineWidth = random(1.5, 3);
      ctx.strokeStyle = 'rgba(160,0,0,0.8)';
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(100,0,0,0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, -55); ctx.lineTo(2, -35); ctx.lineTo(-3, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, -50); ctx.lineTo(12, -30);
    ctx.stroke();

    let glowGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, 120);
    glowGrad.addColorStop(0, 'rgba(120,0,0,0.0)');
    glowGrad.addColorStop(0.6, 'rgba(120,0,0,0.22)');
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = min(faceAlpha, 1.0) * 0.8;
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 120, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  if (progress > 0.1) {
    let vg = drawingContext.createRadialGradient(300, 200, 60, 300, 200, 320);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(0.7, 'rgba(100,0,0,0.25)');
    vg.addColorStop(1, 'rgba(0,0,0,0.9)');
    drawingContext.fillStyle = vg;
    drawingContext.fillRect(0, 0, 600, 400);
  }

  if (monsterTimer <= 0) {
    monsterPhase = "DEAD";
    monsterTriggered = false;
    car.resetToStart();
    shakeTimer = 20;
    monsterPhase = "IDLE";
    car.hasMovedForward = false;
  }
}

// ─── 키 입력 ──────────────────────────────────────────────────
function keyPressed() {
  if (key === 'f' || key === 'F') {
    fullscreen(!fullscreen()); setTimeout(updateCanvasSize, 100);
  }

  userStartAudio();

  if (gameState === "OPENING" && keyCode === ENTER) {
    gameState = "STORY"; return;
  }

  if (keyCode === ESCAPE && (gameState === "PLAY" || gameState === "MINIGAME" || gameState === "COUNTDOWN")) {
    if (confirm("중단하시겠습니까?\n현재 점수 " + score + "pt 는 하이스코어에 반영됩니다.")) {
      abortToGarage();
    }
    return;
  }

  if (gameState === "MINIGAME") {
    if (miniGameStep === "SELECT" && currentMiniGame === "RPS") {
      if (key === '1') handleRPSPlay("가위");
      else if (key === '2') handleRPSPlay("바위");
      else if (key === '3') handleRPSPlay("보");
    }
    if (miniGameStep === "SELECT" && currentMiniGame !== "RPS") {
      if (key === '1') processMiniGameSelection(1);
      else if (key === '2') processMiniGameSelection(2);
    } else if (miniGameStep === "RESULT") {
      removeRPSButtons(); saveGameProgress();

      // RPS 무승부: 다시 선택
      if (currentMiniGame === "RPS" && rpsResultType === "draw") {
        miniGameStep = "SELECT";
        pChoice = ""; cChoice = "";
        miniGameResultText = "가위, 바위, 보 중 선택하세요.";
        rpsResultType = "none"; rpsResultAnim = 0; resultOverlayTimer = 0;
        createRPSButtons();
        return;
      }

      // RPS 패배: 전체 초기화 후 재시작
      if (currentMiniGame === "RPS" && rpsResultType === "lose") {
        applyRPSLosePenalty();
        gameState = "PLAY";
        return;
      }

      // OE 패배: 전체 초기화 후 재시작
      if (currentMiniGame === "OE" && !isMiniGameWin) {
        applyOELosePenalty();
        gameState = "PLAY";
        return;
      }

      // 정상 복귀
      car.x = triggeredGridC * tileSize + tileSize / 2;
      car.y = triggeredGridR * tileSize + tileSize / 2;
      car.angle = 0; slowTimer = 50; invincibleTimer = 60;
      gameState = "PLAY";
    }
  }
}

// ─── 마우스 클릭 ──────────────────────────────────────────────
function mousePressed() {
  userStartAudio();
  let vmX = getVirtualMouseX();
  let vmY = getVirtualMouseY();

  // ── 이스터에그: RPS 화면에서 교수 클릭 감지 ──
  if (gameState === "MINIGAME" && currentMiniGame === "RPS" && !profEasterEggActive) {
  if (vmX >= 6 && vmX <= 296 && vmY >= 54 && vmY <= 376) {
    if (!profEasterEggUsed) {  // ← 추가
      profClickCount++;
      if (profClickCount >= 10) {
        profEasterEggActive = true;
        profEasterEggTimer = 180;
        score += 50;
        profEasterEggUsed = true;  // ← 추가
        addScorePopup("+50점! (이스터에그)", color(220, 200, 80));
      }
    }
  }
}

  let stateMap = {
    STORY: ["skip", "next"],
    HELP_OR_GARAGE: ["goToHelp", "goToGarage"],
    HELP: ["actualStart", "goBackHelp"],
    GARAGE: ["colorOpt", "typeOpt", "sirenOpt", "gameStart", "goBack"],
    END: ["reset"]
  };
  (stateMap[gameState] || []).forEach(k => buttons[k] && buttons[k].click());

  if (gameState === "GARAGE") {
    handleGarageShopClick(vmX, vmY);
  }

  if (gameState === "MINIGAME" && currentMiniGame === "RPS" && miniGameStep === "RESULT") {
    removeRPSButtons(); saveGameProgress();
    if (rpsResultType === "draw") {
      miniGameStep = "SELECT";
      pChoice = ""; cChoice = "";
      miniGameResultText = "가위, 바위, 보 중 선택하세요.";
      rpsResultType = "none"; rpsResultAnim = 0; resultOverlayTimer = 0;
      createRPSButtons(); return;
    }
    if (rpsResultType === "lose") {
      applyRPSLosePenalty();
      gameState = "PLAY";
      return;
    }
    car.x = triggeredGridC * tileSize + tileSize / 2;
    car.y = triggeredGridR * tileSize + tileSize / 2;
    car.angle = 0; slowTimer = 50; invincibleTimer = 60;
    gameState = "PLAY";
  }

  // OE 결과 화면 마우스 클릭으로도 복귀
  if (gameState === "MINIGAME" && currentMiniGame === "OE" && miniGameStep === "RESULT") {
    saveGameProgress();
    if (!isMiniGameWin) {
      applyOELosePenalty();
      gameState = "PLAY";
      return;
    }
    car.x = triggeredGridC * tileSize + tileSize / 2;
    car.y = triggeredGridR * tileSize + tileSize / 2;
    car.angle = 0; slowTimer = 50; invincibleTimer = 60;
    gameState = "PLAY";
  }
}

// ─── 버튼 초기화 ──────────────────────────────────────────────
function initButtons() {
  let mk = (label, x, y, w, h, fn) => {
    let b = new PixelButton(label, x, y, w, h); b.onClick = fn; return b;
  };
  buttons.skip = mk("SKIP ▶▶", 490, 14, 95, 28, () => { gameState = "HELP_OR_GARAGE"; });
  buttons.next = mk("다음 ▶", 232, 290, 120, 34, () => { storyStep++; if (storyStep > 2) gameState = "HELP_OR_GARAGE"; });
  buttons.goToHelp   = mk("게임 설명",    110, 210, 180, 42, () => { gameState = "HELP"; });
  buttons.goToGarage = mk("상점", 310, 210, 180, 42, () => { gameState = "GARAGE"; });
  buttons.goBack       = mk("◀ 뒤로", 48, 336, 194, 28, () => { gameState = "HELP_OR_GARAGE"; }); // GARAGE용
buttons.goBackHelp   = mk("◀ 뒤로", 390, 330, 120, 42, () => { gameState = "HELP_OR_GARAGE"; }); // HELP용
  buttons.actualStart = mk("게임 시작", 200, 330, 200, 42, () => {
  if (carTypeIdx === 5 && !supercarUnlocked) {
    gameState = "GARAGE";
    garageShopMessage = "SUPERCAR 해금 후 출발 가능합니다!";
    garageShopMsgTimer = 90;
    return;
  }
  car.resetToStart(); profProjectiles = []; score = 0;
  viewRadius = 80 + preGameViewBonus;
  startCountdown();
});

  buttons.colorOpt  = mk("차체 색상",   48, 200, 194, 28, () => { carColorIdx = (carColorIdx + 1) % carColors.length; });
buttons.typeOpt = mk("차종 변경",   48, 234, 194, 28, () => {
  carTypeIdx = (carTypeIdx + 1) % carTypes.length;
  if (carTypeIdx === 5 && !supercarUnlocked) {
    garageShopMessage = "★ SUPERCAR — 상점에서 해금 필요 (100pt)";
    garageShopMsgTimer = 90;
  }
});
buttons.sirenOpt  = mk("경광등 토글", 48, 268, 194, 28, () => { hasSiren = !hasSiren; });
  buttons.gameStart = mk("출발", 48, 302, 194, 28, () => {
  if (carTypeIdx === 5 && !supercarUnlocked) {
    garageShopMessage = "SUPERCAR 해금 후 출발 가능합니다!";
    garageShopMsgTimer = 90;
    return;
  }
  car.resetToStart(); profProjectiles = []; score = 0;
  viewRadius = 80 + preGameViewBonus;
  startCountdown();
});

  buttons.reset = mk("재시작", 190, 290, 220, 38, () => {
    gameState = "GARAGE"; storyStep = 0; isProfLoveObtained = false;
    viewRadius = 80 + preGameViewBonus;
    monsterTriggered = false;
    monsterPhase = "IDLE"; monsterFaceScale = 0;
    isStartSoundPlayed = false; isGhostSoundPlayed = false;
    profProjectiles = []; score = 0; rpsPlayerScore = 0; rpsComputerScore = 0;
    scorePopups = [];
    carHP = MAX_HP;
    oeWon = false;
    removeAbortButton();
    generateEnvironment();
    mazeMap = ORIGINAL_MAZE.map(r => [...r]);
    saveGameProgress();
  });
}

// ─── 저장/불러오기 ────────────────────────────────────────────
function saveGameProgress() {
  let d = {
    stage: currentStage,
    profLove: isProfLoveObtained,
    carColor: carColorIdx, carType: carTypeIdx, siren: hasSiren,
    hi: highScore,
    preBonus: preGameViewBonus,
    supercar: supercarUnlocked
  };
  localStorage.setItem("acatchcatch_v23", JSON.stringify(d));
}

function loadGameProgress() {
  let s = localStorage.getItem("acatchcatch_v23");
  if (!s) s = localStorage.getItem("acatchcatch_v22");
  if (!s) s = localStorage.getItem("acatchcatch_v21");

  if (s) {
    let d = JSON.parse(s);
    currentStage = d.stage || 1;
    isProfLoveObtained = d.profLove || false;
    carColorIdx = d.carColor || 0;
    carTypeIdx  = d.carType  || 0;
    if (carTypeIdx === 5 && !supercarUnlocked) carTypeIdx = 0;
    hasSiren = (d.siren !== undefined) ? d.siren : true;
    // highScore, preGameViewBonus, supercarUnlocked 은 불러오지 않음
    // → 새로고침 시 항상 0/false로 초기화
  }
}

function windowResized() {
  updateCanvasSize();
  if (gameState === "MINIGAME" && currentMiniGame === "RPS" && miniGameStep === "SELECT") createRPSButtons();
}
