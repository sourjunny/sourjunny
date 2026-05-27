let slowTimer = 0;
let invincibleTimer = 0;

let gameState = "OPENING"; 
let currentStage = 1;
let storyStep = 0;
let isProfLoveObtained = false;
let viewRadius = 120;
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

let fogMask; 

let carColors = ["#00FF00", "#FF69B4", "#FF0000", "#0000FF", "#FFFF00"];
let carColorIdx = 1; 
let hasSiren = false;
let carTypes = ["모닝", "지프", "트럭", "리무진", "아반떼", "오토바이", "레이싱카"];
let carTypeIdx = 4; 

let car;
let buttons = {};
let flashArrowsTimer = 0;
let monsterTriggered = false; 
let shakeTimer = 0;              

let groundCracks = []; 
let wallStains = [];   

let miniGameStep = "SELECT";
let miniGameTimer = 0;
let pChoice = "";
let cChoice = "";
let miniGameResultText = "";
let isMiniGameWin = false;
let shellAnswer = 1;

let rpsPlayerScore = 0;
let rpsComputerScore = 0;
let rpsDomButtons = [];

// 1 = 벽, 0 = 길, R = 가위바위보, S = 야바위, O = 홀짝, E = 출구
let mazeMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,'O',0,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,'S',1,1,1,1,1,0,1,1,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,'R',0,0,1,0,0,0,1,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'E'],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let tileSize = 110; 
let currentMiniGame = ""; 
let triggeredGridR = 0;
let triggeredGridC = 0;

let cnv; 
let displayScale = 1;
let offsetX = 0;
let offsetY = 0;

function getVirtualMouseX() {
  return (mouseX - offsetX) / displayScale;
}
function getVirtualMouseY() {
  return (mouseY - offsetY) / displayScale;
}
class Buttonn {
  constructor(label, x, y, w, h, onClick) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.onClick = onClick;
  }

  draw() {
    let vmX = getVirtualMouseX();
    let vmY = getVirtualMouseY();

    push();
    rectMode(CORNER);
    if (vmX > this.x && vmX < this.x + this.w && vmY > this.y && vmY < this.y + this.h) {
      fill(80, 180, 255);
      cursor(HAND);
    } else {
      fill(50, 70, 110);
    }
    stroke(255);
    makeStrokeWeight();
    rect(this.x, this.y, this.w, this.h, 7);
    
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(13); 
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    pop();
  }

  click() {
    let vmX = getVirtualMouseX();
    let vmY = getVirtualMouseY();
    if (vmX > this.x && vmX < this.x + this.w && vmY > this.y && vmY < this.y + this.h) {
      this.onClick();
    }
  }
}

function makeStrokeWeight() {
  strokeWeight(1.5);
}
function preload() {
  soundFormats('mp3', 'wav');
  bgmDark = loadSound('MP_한치 앞도 보이지않아.mp3');
  bgmClear = loadSound('MP_맑게 개인 하늘.mp3');
  
  // [추가] 업로드해두신 효과음 파일 로드 등록
  soundGhostRoar = loadSound('귀신 고함 (1).mp3');
  soundStartScream = loadSound('비명소리.mp3');
  soundStartThud = loadSound('쿵.mp3');
  soundCarCrash = loadSound('자동차 충돌.wav');
  
  imgOpening = loadImage('opening.png');
}

function setup() {
  cnv = createCanvas(600, 400);
  updateCanvasSize();
  textFont('Gungsuh', '궁서');
  
  car = new Car(1 * tileSize + tileSize/2, 1 * tileSize + tileSize/2);
  initButtons();
  loadGameProgress();
  generateSinkholeCracks(); 
  generateWallStains(); 
}

function updateCanvasSize() {
  let w = windowWidth;
  let h = windowHeight;
  
  if (!fullscreen()) {
    w = 600;
    h = 400;
    displayScale = 1;
    offsetX = 0;
    offsetY = 0;
    resizeCanvas(w, h);
    cnv.style('position', 'relative');
    cnv.style('margin', '20px auto');
  } else {
    resizeCanvas(w, h);
    cnv.style('position', 'absolute');
    cnv.style('top', '0px');
    cnv.style('left', '0px');
    cnv.style('margin', '0px');
    
    let containerRatio = w / h;
    let baseRatio = 600 / 400;
    
    if (containerRatio > baseRatio) {
      displayScale = h / 400;
      offsetX = (w - 600 * displayScale) / 2;
      offsetY = 0;
    } else {
      displayScale = w / 600;
      offsetX = 0;
      offsetY = (h - 400 * displayScale) / 2;
    }
  }
  
  if (fogMask) {
    fogMask = createGraphics(600, 400);
  }
}

function draw() {
  background(0); 
  cursor(ARROW); 
  manageBgm();
  
  push();
  translate(offsetX, offsetY);
  scale(displayScale);
  fill(12);
  noStroke();
  rect(0, 0, 600, 400);

  if (gameState === "OPENING") {
    imageMode(CORNER);
    image(imgOpening, 0, 0, 600, 400);
  }
  else if (gameState === "STORY") drawStoryScreen();
  else if (gameState === "HELP_OR_GARAGE") drawChoiceScreen();
  else if (gameState === "HELP") drawHelpScreen();
  else if (gameState === "GARAGE") drawGarageScreen();
  else if (gameState === "PLAY") drawPlayScreen();
  else if (gameState === "MINIGAME") drawMiniGameScreen();
  else if (gameState === "END") drawEndScreen();
  
  pop();
}

function manageBgm() {
  let targetBgm = null;

  if (gameState === "PLAY" || gameState === "MINIGAME") {
    targetBgm = bgmClear;
  } else if (gameState === "END") {
    targetBgm = null;     
  } else {
    targetBgm = bgmDark;  
  }

  if (currentPlayingBgm !== targetBgm) {
    if (currentPlayingBgm && currentPlayingBgm.isPlaying()) {
      currentPlayingBgm.stop();
    }
    
    currentPlayingBgm = targetBgm;
    
    if (currentPlayingBgm) {
      currentPlayingBgm.loop();
    }
  }
}

function generateSinkholeCracks() {
  groundCracks = [];
  for (let i = 0; i < 45; i++) {
    groundCracks.push({
      x: random(0, mazeMap[0].length * tileSize),
      y: random(0, mazeMap.length * tileSize),
      size: random(20, 60),
      points: floor(random(3, 6))
    });
  }
}

function generateWallStains() {
  wallStains = [];
  for (let r = 0; r < mazeMap.length; r++) {
    for (let c = 0; c < mazeMap[r].length; c++) {
      if (mazeMap[r][c] === 1) {
        let count = floor(random(2, 5));
        for (let k = 0; k < count; k++) {
          wallStains.push({
            gridR: r,
            gridC: c,
            offsetX: random(15, tileSize - 15),
            offsetY: random(15, tileSize - 15),
            d: random(10, 35),
            col: color(random(40, 65), random(50, 70), random(40, 55), random(60, 110))
          });
        }
      }
    }
  }
}

function checkTriggers() {
  let currentGridC = floor(car.x / tileSize);
  let currentGridR = floor(car.y / tileSize);
  
  if (currentGridR >= 0 && currentGridR < mazeMap.length && currentGridC >= 0 && currentGridC < mazeMap[0].length) {
    let tile = mazeMap[currentGridR][currentGridC];
    
    if (tile === 'R' || tile === 'S' || tile === 'O') {
      triggeredGridR = currentGridR;
      triggeredGridC = currentGridC;
      miniGameStep = "SELECT"; 
    }
    
    if (tile === 'R') { 
      gameState = "MINIGAME"; 
      currentMiniGame = "RPS"; 
      mazeMap[currentGridR][currentGridC] = 0; 
      pChoice = ""; cChoice = ""; miniGameResultText = "가위, 바위, 보 중 하나를 선택하세요!"; 
      createRPSButtons(); 
    }
    else if (tile === 'S') { gameState = "MINIGAME"; currentMiniGame = "SHELL"; mazeMap[currentGridR][currentGridC] = 0; shellAnswer = floor(random(1, 4)); }
    else if (tile === 'O') { gameState = "MINIGAME"; currentMiniGame = "OE"; mazeMap[currentGridR][currentGridC] = 0; }
    else if (tile === 'E') { gameState = "END"; }
    
    if (!monsterTriggered && car.hasMovedForward && currentGridC === 1 && currentGridR === 1) {
      monsterTriggered = true; 
      shakeTimer = 90;
      
      if (!soundGhostRoar.isPlaying()) {
        soundGhostRoar.play();
      }
    }
    if (currentGridC > 3 || currentGridR > 2) { 
      car.hasMovedForward = true; 
    }
  }
}

function createRPSButtons() {
  removeRPSButtons(); 
  
  let choices = ["✌️ 가위", "✊ 바위", "✋ 보"];
  let btnWidth = 100; 
  let btnHeight = 40;
  let btnMargin = 15;

  for (let i = 0; i < choices.length; i++) {
    let btn = createButton(choices[i]);
    
    let startX = (600 - (btnWidth * choices.length + btnMargin * (choices.length - 1))) / 2;
    let virtualX = startX + i * (btnWidth + btnMargin);
    let virtualY = 330;
    
    btn.position(offsetX + virtualX * displayScale, offsetY + virtualY * displayScale);
    btn.size(btnWidth * displayScale, btnHeight * displayScale);
    
    btn.style('font-family', 'Gungsuh, 궁서, serif');
    btn.style('font-size', (14 * displayScale) + 'px');
    btn.style('cursor', 'pointer');
    
    let move = choices[i].split(" ")[1];
    btn.mousePressed(() => handleRPSPlay(move));
    rpsDomButtons.push(btn);
  }
}

function removeRPSButtons() {
  for (let btn of rpsDomButtons) {
    btn.remove();
  }
  rpsDomButtons = [];
}

function handleRPSPlay(playerMove) {
  pChoice = playerMove;
  let options = ["가위", "바위", "보"];
  cChoice = random(options);
  miniGameStep = "RESULT"; 
  
  if (pChoice === cChoice) {
    miniGameResultText = "무승부입니다! 다시 해보세요.";
  } else if (
    (pChoice === "가위" && cChoice === "보") ||
    (pChoice === "바위" && cChoice === "가위") ||
    (pChoice === "보" && cChoice === "바위")
  ) {
    miniGameResultText = "🎉 당신의 승리입니다! 시야가 영구 상향 조정됩니다.";
    rpsPlayerScore++;
    viewRadius = 180; 
  } else {
    miniGameResultText = "😢 컴퓨터의 승리입니다..";
    rpsComputerScore++;
  }
}

function drawAdvancedSirenGlow(cx, cy, angle) {
  if (!hasSiren) return;

  push();
  translate(cx, cy);
  rotate(angle);

  let isRedPhase = (floor(frameCount / 3) % 2 === 0);
  
  noStroke();
  if (isRedPhase) {
    fill(255, 0, 0, 35);
    ellipse(20, 0, 180, 110); 
    fill(0, 0, 255, 15);
    ellipse(-20, 0, 100, 70);
  } else {
    fill(0, 0, 255, 35);
    ellipse(-20, 0, 180, 110); 
    fill(255, 0, 0, 15);
    ellipse(20, 0, 100, 70);
  }

  rectMode(CENTER);
  fill(30);
  rect(-2, 0, 10, 26, 2); 

  if (isRedPhase) {
    fill(255, 50, 50); rect(-2, -8, 8, 10, 2); 
    fill(0, 50, 150); rect(-2, 8, 8, 10, 2);  
    fill(255, 255, 200); ellipse(-2, -8, 4, 4);
  } else {
    fill(150, 50, 50); rect(-2, -8, 8, 10, 2);  
    fill(50, 100, 255); rect(-2, 8, 8, 10, 2); 
    fill(255, 255, 200); ellipse(-2, 8, 4, 4);
  }
  pop();
}

class Car {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 3;
    this.angle = 0; 
    this.hasMovedForward = false;
  }
  
  update() {
    if (keyIsDown(LEFT_ARROW)) {
      this.angle -= 0.045;
      if (monsterTriggered) monsterTriggered = false;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.angle += 0.045;
      if (monsterTriggered) monsterTriggered = false;
    }

    let currentSpeed = this.speed;
    if (slowTimer > 0) currentSpeed = this.speed * 0.3;

    let nextX = this.x + cos(this.angle) * currentSpeed;
    let nextY = this.y + sin(this.angle) * currentSpeed;

    if (invincibleTimer > 0) {
      this.x = nextX;
      this.y = nextY;
    } else {
      if (this.checkWallCollision(nextX, nextY)) {
        if (!soundCarCrash.isPlaying()) {
          soundCarCrash.play();
        }
        this.resetToStart(); 
      } else {
        this.x = nextX;
        this.y = nextY;
      }
    }
  }
  
  checkWallCollision(nx, ny) {
    let checkOffsets = [-10, 0, 10]; 
    for (let ox of checkOffsets) {
      for (let oy of checkOffsets) {
        let cx = nx + ox * cos(this.angle);
        let cy = ny + oy * sin(this.angle);
        let gridC = floor(cx / tileSize);
        let gridR = floor(cy / tileSize);
        
        if (gridR < 0 || gridR >= mazeMap.length || gridC < 0 || gridC >= mazeMap[0].length) return true;
        if (mazeMap[gridR][gridC] === 1) return true;
      }
    }
    return false;
  }
  
  resetToStart() {
    this.x = 1 * tileSize + tileSize/2;
    this.y = 1 * tileSize + tileSize/2;
    this.angle = 0;
    this.hasMovedForward = false; 
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);

    noStroke();
    for (let i = 3; i > 0; i--) {
      fill(255, 245, 180, 10 + i * 5); 
      let lightLength = 70 + i * 15;   
      let lightSpread = 20 + i * 8;    
      triangle(15, 0, lightLength, -lightSpread, lightLength, lightSpread);
    }

    rectMode(CENTER);
    let col = carColors[carColorIdx];
    
    if (carTypeIdx === 0) { 
      fill(col); rect(0, 0, 42, 34, 10); fill(60); rect(10, 0, 8, 26); fill(0); ellipse(-12, -18, 10, 6); ellipse(-12, 18, 10, 6);
    } 
    else if (carTypeIdx === 1) { 
      fill(col); rect(0, 0, 54, 44, 2); fill(40); rect(7, 0, 10, 36); fill(100); rect(-15, 0, 12, 30); fill(0); rect(12, -24, 14, 7); rect(12, 24, 14, 7); fill(50); ellipse(-30, 0, 18, 18);
    } 
    else if (carTypeIdx === 2) { 
      fill(col); rect(15, 0, 24, 38, 4); fill(130); rect(-12, 0, 38, 38); fill(50); rect(-6, 0, 24, 32); fill(0); ellipse(18, -21, 12, 7); ellipse(18, 21, 12, 7); ellipse(-18, -21, 14, 7); ellipse(-18, 21, 14, 7);
    } 
    else if (carTypeIdx === 3) { 
      fill(col); rect(0, 0, 95, 32, 6); fill(40); rect(35, 0, 10, 26); rect(0, 0, 35, 26); rect(-35, 0, 10, 26); fill(0); ellipse(36, -18, 11, 6); ellipse(36, 18, 11, 6); ellipse(-36, -18, 11, 6); ellipse(-36, 18, 11, 6);
    } 
    else if (carTypeIdx === 4) { 
      fill(col); rect(0, 0, 62, 36, 8); fill(50); rect(15, 0, 12, 30); rect(-20, 0, 10, 30); fill(0); ellipse(18, -20, 12, 6); ellipse(18, 20, 12, 6); ellipse(-18, -20, 12, 6); ellipse(-18, 20, 12, 6);
    } 
    else if (carTypeIdx === 5) { 
      fill(col); rect(0, 0, 52, 12, 3); fill(0); ellipse(24, 0, 18, 18); ellipse(-24, 0, 18, 18); fill(255, 200, 0); rect(7, 0, 22, 22);
    } 
    else if (carTypeIdx === 6) { 
      fill(col); rect(0, 0, 66, 30, 12); fill(20); rect(-26, 0, 8, 50); fill(col); rect(22, 0, 6, 40); fill(255, 255, 0); ellipse(6, 0, 14, 14); fill(0); rect(18, -18, 13, 8); rect(18, 18, 13, 8); rect(-18, -20, 16, 11); rect(-18, 20, 16, 11);
    }
    pop();
  }
}

function drawPlayScreen() {
  if (slowTimer > 0) slowTimer--;
  if (invincibleTimer > 0) invincibleTimer--;
  
  car.update();
  checkTriggers(); 
  let sOffsetX = 0; let sOffsetY = 0;
  if (shakeTimer > 0) { sOffsetX = random(-15, 15); sOffsetY = random(-15, 15); shakeTimer--; }

  push();
  translate(300 + sOffsetX, 280 + sOffsetY);
  rotate(-car.angle - HALF_PI); 
  translate(-car.x, -car.y);

  stroke(28, 20, 15, 90);
  makeLayersCracks();

  for (let r = 0; r < mazeMap.length; r++) {
    for (let c = 0; c < mazeMap[r].length; c++) {
      let x = c * tileSize; let y = r * tileSize;
      
      if (mazeMap[r][c] === 1) {
        fill(45, 48, 53); 
        stroke(25, 28, 32); 
        strokeWeight(3);
        rect(x, y, tileSize, tileSize, 4);
        
        noStroke();
        fill(58, 62, 69);
        rect(x + 10, y + 10, tileSize - 20, tileSize - 20, 2);
      } else {
        stroke(255, 255, 255, 15); 
        strokeWeight(1);
        fill(20, 21, 24);
        rect(x, y, tileSize, tileSize);
        
        noStroke();
        if (mazeMap[r][c] === 'R') { fill(0, 100, 255, 45); rect(x+6, y+6, tileSize-12, tileSize-12, 12); fill(0, 170, 255); textAlign(CENTER, CENTER); textSize(18); text("RPS", x+tileSize/2, y+tileSize/2); }
        if (mazeMap[r][c] === 'S') { fill(255, 120, 0, 45); rect(x+6, y+6, tileSize-12, tileSize-12, 12); fill(255, 160, 0); textAlign(CENTER, CENTER); textSize(18); text("SHELL", x+tileSize/2, y+tileSize/2); }
        if (mazeMap[r][c] === 'O') { fill(180, 0, 255, 45); rect(x+6, y+6, tileSize-12, tileSize-12, 12); fill(210, 80, 255); textAlign(CENTER, CENTER); textSize(18); text("O/E", x+tileSize/2, y+tileSize/2); }
      }
    }
  }

  for (let stain of wallStains) {
    let sx = stain.gridC * tileSize + stain.offsetX;
    let sy = stain.gridR * tileSize + stain.offsetY; 
    fill(stain.col);
    noStroke();
    ellipse(sx, sy, stain.d, stain.d * 0.8);
  }
  
  car.draw();
  drawAdvancedSirenGlow(car.x, car.y, car.angle);
  pop();

  drawDarkFog();
  
  if (flashArrowsTimer > 0) {
    push();
    rectMode(CENTER);
    fill(0, 0, 0, 180);
    stroke(255, 255, 0, 150);
    rect(300, 40, 480, 40, 8);
    noStroke();
    fill(255, 255, 0); textSize(14); textAlign(CENTER, CENTER);
    text("📢 [야바위 힌트] 출구는 맵의 우측 맨 아래(E)에 있다! 📢", 300, 40);
    pop();
    flashArrowsTimer--;
  }
  
  if (monsterTriggered) drawScaryMonsterWindow();
}

function makeLayersCracks() {
  strokeWeight(2.5);
  for (let crack of groundCracks) {
    fill(10, 9, 9);
    push();
    translate(crack.x, crack.y);
    beginShape();
    for (let j = 0; j < crack.points; j++) {
      let angle = TWO_PI / crack.points * j;
      let r = crack.size + random(-6, 6);
      vertex(cos(angle) * r, sin(angle) * r);
    }
    endShape(CLOSE);
    pop();
  }
}

function drawStoryScreen() {
  push();
  rectMode(CORNER);
  ellipseMode(CENTER);
  imageMode(CORNER);
  
  background(5); 
  
  fill(0); 
  noStroke();
  rect(0, 0, 600, 50); 
  rect(0, 350, 600, 50);
  
  let stories = [
    "【 사건의 서막 】\n\n(쿠르릉- 쾅!)\n\n\"으악!!\"\n기철 교수님 강의에 지각하게 생겼네ㅠㅠ,\n이게 대체 무슨 일이지?",
    "【 암전 (暗轉) 】\n\n여기가 대체 어디야... 뭐 어디까지 떨어진거지? \n아무것도 안보이네...",
    "【 탈출 계기 】\n\n싱크홀 아래로 추락한 모양이다.\n살아서 강의실에 도달하려면 반드시 길을 찾아야만 한다."
  ];
  
  if (storyStep === 0 && !isStartSoundPlayed) {
    soundStartScream.play();
    soundStartThud.play();
    isStartSoundPlayed = true; 
  }
  
  if (storyStep === 1 && !isGhostSoundPlayed) {
    bgmDark.play(); 
  }
  
  textStyle(BOLD); 
  textAlign(CENTER, CENTER);
  
  fill(0, 0, 0, 180);
  textSize(16);
  text(stories[storyStep], 42, 102, 520, 200); 
  
  fill(245);
  text(stories[storyStep], 40, 100, 520, 200); 
  
  textStyle(NORMAL);
  
  buttons.skip.draw(); 
  buttons.next.draw();
  
  pop(); 
}

function drawChoiceScreen() {
  background(15);
  fill(255); textAlign(CENTER, CENTER); textSize(15);
  text("🎬 프롤로그가 끝났습니다. 어떤 작업을 먼저 진행하시겠습니까?", 300, 140);
  buttons.goToHelp.draw(); buttons.goToGarage.draw();
}

function drawGarageScreen() {
  background(15);
  fill(255); textAlign(CENTER, CENTER); textSize(18);
  text("🚗 커스텀 정비소 🚗", 300, 45);
  textSize(13); fill(carColors[carColorIdx]); text("현재 도색: ■", 300, 80);
  fill(255); text("차종 스타일: " + carTypes[carTypeIdx], 300, 110);
  text("특수 듀얼 경광등: " + (hasSiren ? "🚨 하이라이트 활성화" : "꺼짐"), 300, 140);
  
  push(); translate(300, 220); scale(1.1); 
  let tempCar = new Car(0, 0); tempCar.draw(); 
  drawAdvancedSirenGlow(0, 0, -HALF_PI);
  pop();
  
  buttons.colorOpt.draw(); buttons.typeOpt.draw(); buttons.sirenOpt.draw(); buttons.gameStart.draw();
}

function drawHelpScreen() {
  background(15);
  fill(255); textAlign(CENTER, CENTER); textSize(13);
  text("🚨 [싱크홀 탈출 규정집] 🚨\n\n- 브레이크가 파손되었다! 차는 절대 멈출 수 없다! \n- 방향키(◀ ▶)를 사용하여 부드럽게 컨트롤하세요.\n- 미로 벽면 충돌 시 처음으로 다시 돌아갑니다.\n- 열심히 달리다 보면 미니게임을 수행해야 길을 지나갈 수 있습니다.\n- 역주행하면 끔찍한 괴물을 만날수도..? 후훗~", 300, 160);
  buttons.actualStart.draw();
}

function drawMiniGameScreen() {
  background(15, 20, 35);
  
  stroke(0, 200, 255);
  weight = makeStrokeWeight(); // 기존 코드 가독성용
  strokeWeight(3);
  noFill();
  rect(40, 30, 520, 340, 15);
  noStroke();

  fill(255); textAlign(CENTER, CENTER); textSize(20);
  text("🎰 돌발 미니게임 구역 진입! 🎰", 300, 60);
  
  if (currentMiniGame === "RPS") {
    drawRPSLogic();
  } else if (currentMiniGame === "SHELL") {
    drawShellLogic();
  } else if (currentMiniGame === "OE") {
    drawOELogic();
  }
}

function drawRPSLogic() {
  textSize(17); 
  fill(0, 180, 255);
  text("✌️ 가위바위보 미니게임 ✊", 300, 105);
  
  textSize(13); 
  fill(255);
  text(`플레이어: ${rpsPlayerScore}  |  컴퓨터: ${rpsComputerScore}`, 300, 135);

  let boxWidth = 130; 
  let boxHeight = 100; 
  stroke(100, 200, 255, 150);
  fill(25, 30, 50);
  rect(150, 165, boxWidth, boxHeight, 10);
  rect(320, 165, boxWidth, boxHeight, 10);
  noStroke();

  fill(180, 220, 255);
  textSize(12); 
  text("나의 선택", 215, 185);
  text("컴퓨터의 선택", 385, 185);
  
  textSize(30); 
  text(getRPSEmoji(pChoice), 215, 225);
  text(getRPSEmoji(cChoice), 385, 225);

  textSize(13); 
  if (miniGameResultText.includes("승리")) fill(46, 204, 113);
  else if (miniGameResultText.includes("패배") || miniGameResultText.includes("아쉽게")) fill(231, 76, 60);
  else fill(170, 180, 190);
  
  text(miniGameResultText, 300, 295);

  if (miniGameStep === "RESULT") {
    textSize(11); fill(200);
    text("[ 아무 키나 누르거나 마우스를 클릭하면 미로로 복귀합니다 ]", 300, 355);
  }
}

function getRPSEmoji(move) {
  if (move === "가위") return "✌️";
  if (move === "바위") return "✊";
  if (move === "보") return "✋";
  return "❓";
}

function drawShellLogic() {
  textSize(13);
  fill(255, 180, 100);
  text("🎩 초고난도 야바위 존 🎩\n성공 시 3초간 맵 상단에 탈출구(E) 위치 힌트 출력!", 300, 105);

  let cupX1 = 180;
  let cupX2 = 300;
  let cupX3 = 420;
  let cupY = 240;

  if (miniGameStep === "SELECT") {
    fill(255); textSize(14);
    text("보석이 숨겨진 진짜 컵을 고르세요.\n\n[ 키보드 1번 ]      [ 키보드 2번 ]      [ 키보드 3번 ]", 300, 160);
    
    fill(139, 69, 19); stroke(255, 150, 0); strokeWeight(2);
    rect(cupX1 - 30, cupY - 35, 60, 60, 8);
    rect(cupX2 - 30, cupY - 35, 60, 60, 8);
    rect(cupX3 - 30, cupY - 35, 60, 60, 8);
    noStroke();
  } 
  else if (miniGameStep === "ANIMATION") {
    miniGameTimer--;
    textSize(14); fill(255, 255, 0);
    text("컵이 어지럽게 뒤섞이는 중입니다... 집중하세요!", 300, 160);
    
    let shake = sin(frameCount * 0.5) * 80;
    fill(139, 69, 19);
    rect(cupX1 - 30 + shake, cupY - 35, 60, 60, 8);
    rect(cupX2 - 30, cupY - 35, 60, 60, 8);
    rect(cupX3 - 30 - shake, cupY - 35, 60, 60, 8);
    if (miniGameTimer <= 0) miniGameStep = "RESULT";
  } 
  else if (miniGameStep === "RESULT") {
    textSize(15);
    fill(isMiniGameWin ? "#00FF00" : "#FF5555");
    text(miniGameResultText, 300, 155);

    fill(139, 69, 19);
    let liftY1 = (shellAnswer === 1) ? -45 : 0;
    let liftY2 = (shellAnswer === 2) ? -45 : 0;
    let liftY3 = (shellAnswer === 3) ? -45 : 0;

    textSize(22); text("💎", cupX1, cupY + 5); text("💎", cupX2, cupY + 5); text("💎", cupX3, cupY + 5); 

    fill(100, 50, 20); rect(cupX1 - 30, cupY - 35 + liftY1, 60, 60, 8);
    fill(100, 50, 20); rect(cupX2 - 30, cupY - 35 + liftY2, 60, 60, 8);
    fill(100, 50, 20); rect(cupX3 - 30, cupY - 35 + liftY3, 60, 60, 8);

    fill(255); textSize(13);
    text("내 선택: " + pChoice + "번 컵   |   실제 위치: " + shellAnswer + "번 컵", 300, 310);
    textSize(11); fill(180);
    text("[ 아무 키나 누르면 미로로 즉시 복귀합니다 ]", 300, 345);
  }
}

function drawOELogic() {
  textSize(13);
  fill(210, 150, 255);
  text("🎲 홀짝 교수님 존 🎲\n기철 교수님의 눈초리를 뚫고 학점 A+ 표식을 거머쥐세요!", 300, 105);

  if (miniGameStep === "SELECT") {
    fill(255); textSize(14);
    text("과연 주사위 눈금은 무엇이 나올까?\n\n[ 키보드 1번: 🔴 홀수 ]      [ 키보드 2번: 🔵 짝수 ]", 300, 200);
  } 
  else if (miniGameStep === "ANIMATION") {
    miniGameTimer--;
    textSize(45); fill(255, 255, 100);
    let diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    text(diceFaces[floor(frameCount / 3) % 6], 300, 200);
    if (miniGameTimer <= 0) miniGameStep = "RESULT";
  } 
  else if (miniGameStep === "RESULT") {
    textSize(15);
    fill(isMiniGameWin ? "#00FF00" : "#FF5555");
    text(miniGameResultText, 300, 165);

    textSize(13); fill(255);
    text("나의 예측: " + pChoice + "  |  결과 눈금: " + cChoice, 300, 225);
    textSize(11); fill(180);
    text("[ 아무 키나 누르면 미로로 즉시 복귀합니다 ]", 300, 310);
  }
}

function processMiniGameSelection(numInput) {
  miniGameStep = "ANIMATION";
  miniGameTimer = 75; 

  if (currentMiniGame === "SHELL") {
    pChoice = numInput.toString();
    if (numInput === shellAnswer) {
      miniGameResultText = "💎 보석 적중 완료! 출구 힌트 활성화.";
      isMiniGameWin = true;
      flashArrowsTimer = 180;
    } else {
      miniGameResultText = "💨 꽝! 빈 컵이었습니다. 힌트 획득 실패..";
      isMiniGameWin = false;
    }
  } 
  else if (currentMiniGame === "OE") {
    pChoice = (numInput === 1) ? "홀수" : "짝수";
    let realDice = floor(random(1, 7));
    let isDiceOdd = (realDice % 2 !== 0);
    cChoice = realDice + " (" + (isDiceOdd ? "홀수" : "짝수") + ")";

    if ((numInput === 1 && isDiceOdd) || (numInput === 2 && !isDiceOdd)) {
      miniGameResultText = "🎓 정답 적중! 기철 교수님의 참사랑(A+)을 확보했습니다!";
      isProfLoveObtained = true;
      isMiniGameWin = true;
    } else {
      miniGameResultText = "🥶 오답! 교수님의 차가운 시선과 F학점 위기 도래.";
      isMiniGameWin = false;
    }
  }
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
    setTimeout(updateCanvasSize, 100);
  }
  userStartAudio();
  
  if (gameState === "OPENING") {
    if (keyCode === ENTER) {
      gameState = "STORY";
    }
    return;
  }
  
  if (gameState === "OPENING") {
    if (keyCode === ENTER) {
      gameState = "STORY";
    }
    return; 
  }

  if (gameState === "MINIGAME") {
    if (miniGameStep === "SELECT" && currentMiniGame !== "RPS") { 
      if (key === '1') processMiniGameSelection(1);
      else if (key === '2') processMiniGameSelection(2);
      else if (key === '3') processMiniGameSelection(3);
    } 
    else if (miniGameStep === "RESULT") {
      removeRPSButtons(); 
      saveGameProgress(); 

      car.x = triggeredGridC * tileSize + tileSize / 2;
      car.y = triggeredGridR * tileSize + tileSize / 2;
      car.angle = 0; 

      slowTimer = 60;
      invincibleTimer = 60;

      gameState = "PLAY";
    }
  }
}

function drawScaryMonsterWindow() {
  push();
  if (frameCount % 4 === 0) background(0);
  else if (frameCount % 7 === 0) background(150, 0, 0);
  else background(15);
  
  stroke(255, 0, 0, 180); strokeWeight(random(1, 3));
  for (let i = 0; i < 8; i++) { let y = random(400); line(0, y, 600, y + random(-10, 10)); }
  
  noStroke(); fill(255, 0, 0, 230);
  ellipse(300 - 90 + random(-5, 5), 200 - 30, 80, 25);
  ellipse(300 + 90 + random(-5, 5), 200 - 30, 80, 25);
  fill(0); ellipse(300 - 90, 200 - 30, 20, 20); ellipse(300 + 90, 200 - 30, 20, 20);
  
  fill(200, 0, 0); beginShape(); vertex(300 - 120, 200 + 40); vertex(300 - 35, 200 + random(20, 60)); vertex(300 + 35, 200 + random(20, 60)); vertex(300 + 120, 200 + 40); vertex(300, 200 + random(80, 120)); endShape(CLOSE);

  textAlign(CENTER, CENTER); 
  fill(0, 0,  blue = 255, 150); 
  textSize(32); 
  text("⚠️ WARNING: SYSTEM COLLAPSE ⚠️", 300 + 2, 80 + 2);
  
  fill(255, 0, 0); 
  textSize(30); 
  text("⚠️ WARNING: SYSTEM COLLAPSE ⚠️", 300, 80);
  
  fill(255); 
  textSize(14); 
  text("누가 감히 역주행을 시도했는가?\n\n[ 아무 방향키나 누르면 경고가 해제됩니다 ]", 300, 330); 
  pop();
}

function drawDarkFog() {
  if (monsterTriggered) return;
  if (!fogMask || fogMask.width !== width || fogMask.height !== height) {
    fogMask = createGraphics(width, height);
  }
  
  fogMask.clear();
  fogMask.background(0, 0, 0, 242); 
  
  fogMask.push();
  fogMask.translate(offsetX + 300 * displayScale, offsetY + 280 * displayScale);
  fogMask.rotate(-HALF_PI); 
  
  fogMask.erase();

  fogMask.ellipse(0, 0, viewRadius * 2 * displayScale, viewRadius * 2 * displayScale);
  fogMask.triangle(15 * displayScale, 0, 110 * displayScale, -35 * displayScale, 110 * displayScale, 35 * displayScale); 
  fogMask.noErase();
  fogMask.pop();
  
  push();
  resetMatrix();
  image(fogMask, 0, 0);
  pop();
}

function drawEndScreen() {
  background(15);
  fill(255); textAlign(CENTER, CENTER);
  if (!isProfLoveObtained) {
    textSize(26); fill(255, 50, 50); text("\"학생은 지각입니다.\"", 300, 140);
    textSize(15); fill(255); text("안 돼애애애~~ㅠㅠ (학점 F 수여)", 300, 195);
  } else {
    textSize(18); fill(50, 255, 50); text("\"오느라 수고 많았습니다.\n이런 난관을 빠져나오다니 학생은 A+입니다.\"", 300, 130);
    textSize(20); fill(255, 255, 0); text("야호~~~!!!! 🎓 야르다!", 300, 205);
  }
  fill(180); textSize(11); text("제작: 숭실대학교 글로벌미디어학부 황다연,이서윤, 신준희 (Class of '26)", 300, 340);
  buttons.reset.draw();
}

function initButtons() {
  buttons.skip = new Buttonn("스킵 ⏭️", 495, 15, 90, 32);
  buttons.skip.onClick = () => { gameState = "HELP_OR_GARAGE"; };
  
  buttons.next = new Buttonn("다음 단계 ▶", 240, 305, 120, 38);
  buttons.next.onClick = () => { storyStep++; if (storyStep > 2) gameState = "HELP_OR_GARAGE"; };
  
  buttons.goToHelp = new Buttonn("설명 및 시작하기 🏁", 120, 210, 170, 45);
  buttons.goToHelp.onClick = () => { gameState = "HELP"; };
  
  buttons.goToGarage = new Buttonn("차 꾸미러 가기 🛠️", 310, 210, 170, 45);
  buttons.goToGarage.onClick = () => { gameState = "GARAGE"; };
  
  buttons.actualStart = new Buttonn("게임 스타트!! 🚀", 220, 290, 160, 45);
  buttons.actualStart.onClick = () => { gameState = "PLAY"; car.resetToStart(); };
  
  buttons.colorOpt = new Buttonn("도색 변경", 50, 335, 105, 35);
  buttons.colorOpt.onClick = () => { carColorIdx = (carColorIdx + 1) % carColors.length; };
  
  buttons.typeOpt = new Buttonn("기종 체인지", 170, 335, 105, 35);
  buttons.typeOpt.onClick = () => { carTypeIdx = (carTypeIdx + 1) % carTypes.length; };
  
  buttons.sirenOpt = new Buttonn("경광등 토글", 290, 335, 105, 35);
  buttons.sirenOpt.onClick = () => { hasSiren = !hasSiren; };
  
  buttons.gameStart = new Buttonn("달려볼까? 🏁", 410, 335, 140, 35);
  buttons.gameStart.onClick = () => { gameState = "PLAY"; car.resetToStart(); };
  
  buttons.reset = new Buttonn("처음부터 다시 하기 🔄", 200, 260, 200, 42);
  buttons.reset.onClick = () => {
    gameState = "STORY"; storyStep = 0; isProfLoveObtained = false; viewRadius = 120; monsterTriggered = false;
    isStartSoundPlayed = false; isGhostSoundPlayed = false;
    saveGameProgress();
  };
}

function mousePressed() {
  userStartAudio();
  
  for (let b in buttons) {
    if (gameState === "STORY" && (b === "skip" || b === "next")) buttons[b].click();
    if (gameState === "HELP_OR_GARAGE" && (b === "goToHelp" || b === "goToGarage")) buttons[b].click();
    if (gameState === "HELP" && b === "actualStart") buttons[b].click();
    if (gameState === "GARAGE" && (b === "colorOpt" || b === "typeOpt" || b === "sirenOpt" || b === "gameStart")) buttons[b].click();
    if (gameState === "END" && b === "reset") buttons[b].click();
  }
  
  if (gameState === "MINIGAME" && currentMiniGame === "RPS" && miniGameStep === "RESULT") {
    removeRPSButtons();
    saveGameProgress();
    car.x = triggeredGridC * tileSize + tileSize / 2;
    car.y = triggeredGridR * tileSize + tileSize / 2;
    car.angle = 0;
    slowTimer = 60;
    invincibleTimer = 60;
    gameState = "PLAY";
  }
}

function saveGameProgress() {
  let gameData = { stage: currentStage, profLove: isProfLoveObtained, carColor: carColorIdx, carType: carTypeIdx, siren: hasSiren };
  localStorage.setItem("kicheol_maze_save_v9", JSON.stringify(gameData));
}

function loadGameProgress() {
  let saved = localStorage.getItem("kicheol_maze_save_v9");
  if (saved) {
    let data = JSON.parse(saved);
    currentStage = data.stage; isProfLoveObtained = data.profLove; carColorIdx = data.carColor; carTypeIdx = data.carType; hasSiren = data.siren;
  }
}

function windowResized() { 
  updateCanvasSize();
  if (gameState === "MINIGAME" && currentMiniGame === "RPS" && miniGameStep === "SELECT") {
    createRPSButtons();
  }
}