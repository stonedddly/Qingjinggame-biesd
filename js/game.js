'use strict';

// 依赖外部定义的变量：W, H, ctx, C, LEVELS, FINAL_REVIEW, UI, drawNode, drawEnding, drawReview, drawFinal, choiceBoxes

let scene = 'title';
let currentLevel = 0;
let currentNode = null;
let currentMsgIndex = 0;
let choiceLock = false;
let msgTimer = 0;
let earnedStars = [];
let endStats = { safe: 0, danger: 0 };
let now = 0;
let ptr = { x: 320, y: 180, down: false };

function getNode() { return LEVELS[currentLevel].nodes[currentNode]; }

function go(s) { 
  scene = s; 
}

function startLevel(i) {
  currentLevel = i;
  currentNode = LEVELS[i].start;
  currentMsgIndex = 0;
  msgTimer = now;
  choiceLock = false;
  endStats = { safe: 0, danger: 0 }; // 重置单局统计数据
  scene = 'node';
  fit();
}

function chooseOption(idx) {
  if (choiceLock) return;
  const node = getNode();
  const opt = node.choices[idx];
  if (!opt) return;
  choiceLock = true;
  if (opt.kind === 'safe') endStats.safe++;
  if (opt.kind === 'danger') endStats.danger++;
  
  const target = LEVELS[currentLevel].nodes[opt.next];
  if (target.ending) {
    currentNode = opt.next; // 修复：必须更新当前节点，否则结局页面读取不到 endingTitle
    earnedStars[currentLevel] = target.ending;
    if (typeof UI !== 'undefined' && UI.updateLevelStatus) {
      UI.updateLevelStatus(earnedStars);
    }
    setTimeout(() => go('ending'), 300);
  } else {
    setTimeout(() => {
      currentNode = opt.next;
      currentMsgIndex = 0;
      msgTimer = now;
      choiceLock = false;
    }, 300);
  }
}

function nodeClick(x, y) {
  if (choiceLock) return;
  
  // 如果消息没播完，点击立即跳过等待，直接播下一条
  const node = getNode();
  if (currentMsgIndex < node.msgs.length - 1) {
    if (now - msgTimer > 0.2) { // 防止连点过快
      currentMsgIndex++;
      msgTimer = now;
    }
    return;
  }

  // 消息播完了，检查选项
  for (let i = 0; i < choiceBoxes.length; i++) {
    if (inBox(x, y, choiceBoxes[i])) { chooseOption(i); return; }
  }
}

function endingClick(x, y) {
  const bx = W / 2 - 100, by = 290;
  if (inBox(x, y, [bx, by, 200, 30])) go('review');
}

function reviewClick(x, y) {
  const bx = W / 2 - 100, by = H - 34;
  if (inBox(x, y, [bx, by, 200, 26])) {
    const allDone = earnedStars.filter(Boolean).length === LEVELS.length;
    if (allDone) {
      go('final');
    } else {
      scene = 'title';
      if (typeof UI !== 'undefined' && UI.showTitle) UI.showTitle();
    }
  }
}

function reviewWheel(dy) { 
  reviewScroll = Math.max(0, Math.min(400, reviewScroll + dy * 0.5)); 
}

function finalClick(x, y) {
  const bx = W / 2 - 80, by = H - 30;
  if (inBox(x, y, [bx, by, 160, 24])) {
    earnedStars = []; endStats = { safe: 0, danger: 0 }; reviewScroll = 0;
    if (typeof UI !== 'undefined' && UI.updateLevelStatus) {
      UI.updateLevelStatus(earnedStars);
    }
    if (typeof UI !== 'undefined' && UI.showTitle) UI.showTitle();
    scene = 'title';
  }
}

// --- 输入监听 ---
function toGame(ev) {
  const r = canvasEl.getBoundingClientRect();
  return [Math.floor((ev.clientX - r.left) * W / r.width), Math.floor((ev.clientY - r.top) * H / r.height)];
}

canvasEl.addEventListener('pointerdown', (ev) => {
  if (scene === 'title') return;
  const [x, y] = toGame(ev);
  ptr.x = x; ptr.y = y; ptr.down = true;
  ev.preventDefault();
  
  if (scene === 'node') nodeClick(x, y);
  else if (scene === 'ending') endingClick(x, y);
  else if (scene === 'review') reviewClick(x, y);
  else if (scene === 'final') finalClick(x, y);
});

canvasEl.addEventListener('pointermove', (ev) => {
  const [x, y] = toGame(ev);
  ptr.x = x; ptr.y = y;
});

canvasEl.addEventListener('pointerup', () => { ptr.down = false; });
canvasEl.addEventListener('contextmenu', (e) => e.preventDefault());
canvasEl.addEventListener('wheel', (ev) => {
  if (scene === 'review') { reviewWheel(ev.deltaY); ev.preventDefault(); }
}, { passive: false });

// --- 缩放适配 ---
function fit() {
  const container = document.getElementById('game-screen');
  if (!container) return;
  const s = Math.min(container.clientWidth / W, container.clientHeight / H);
  canvasEl.style.width = Math.floor(W * s) + 'px';
  canvasEl.style.height = Math.floor(H * s) + 'px';
}
window.addEventListener('resize', fit);

// --- 游戏入口 ---
function bootGame(startLevelIdx) {
  if (startLevelIdx !== undefined && startLevelIdx >= 0) {
    startLevel(startLevelIdx);
  } else {
    const next = earnedStars.findIndex(v => !v);
    startLevel(next >= 0 ? next : 0);
  }
}

// --- 主循环 ---
function loop(ts) {
  now = ts / 1000;
  
  if (scene !== 'title') {
    // 逻辑更新：对话自动推进
    if (scene === 'node') {
      const node = getNode();
      if (node && currentMsgIndex < node.msgs.length - 1 && now - msgTimer > 1.2) {
        currentMsgIndex++; 
        msgTimer = now;
      }
      drawNode();
    }
    else if (scene === 'ending') drawEnding();
    else if (scene === 'review') drawReview();
    else if (scene === 'final') drawFinal();

    // 自定义光标
    if (window.matchMedia('(pointer: fine)').matches) {
      canvasEl.style.cursor = 'none';
      const x = ptr.x, y = ptr.y;
      ctx.fillStyle = C.INK;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x, y + 14); ctx.lineTo(x + 4, y + 10);
      ctx.lineTo(x + 7, y + 15); ctx.lineTo(x + 9, y + 14); ctx.lineTo(x + 6, y + 9);
      ctx.lineTo(x + 11, y + 9); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.WHITE; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  
  requestAnimationFrame(loop);
}

// --- 启动逻辑 ---
if (typeof UI !== 'undefined' && UI.init) {
  UI.init(bootGame);
}
requestAnimationFrame(loop);