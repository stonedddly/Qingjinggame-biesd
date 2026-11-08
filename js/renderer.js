'use strict';

const W = 640, H = 360;
const canvasEl = document.getElementById('game');
const ctx = canvasEl.getContext('2d');
ctx.imageSmoothingEnabled = false;

const C = {
  INK: '#161313', PAPER: '#e4dfd4', PAPER_D: '#c8c0b0',
  GREY: '#968f87', GREY_D: '#5c5650', GREY_L: '#b8b0a4',
  RED: '#b42e28', RED_D: '#78201c', RED_L: '#de5c4c',
  GREEN: '#548046', GREEN_D: '#385830', GREEN_L: '#7ab262',
  BLUE: '#3c5a78', BLUE_L: '#5c7e9e',
  ORANGE: '#dc9646', CLAUDE: '#cc7050', CLAUDE_L: '#e89c74',
  DESK: '#443932', DESK_D: '#382f2a', DESK_L: '#54483f',
  SKY: '#2a3440', NIGHT: '#1a2230', CHAT_BG: '#1e1c1c',
  BUBBLE_ME: '#95ec69', BUBBLE_OTHER: '#ffffff',
  WHITE: '#e4dfd4', BLACK: '#161313', GOLD: '#bea064',
  SKIN: '#d8a888', SKIN_D: '#b88868', HAIR: '#2a2420', HAIR_L: '#3a322c',
  SHIRT: '#4a5a6a', SHIRT_L: '#5a6a7a', PANTS: '#2a2a30',
  WOOD: '#6a5244', WALL: '#3a3430', FLOOR: '#2a2420',
  PHONE: '#1a1a1e', PHONE_L: '#2a2a30', PHONE_SCREEN: '#95ec69',
  DOC: '#e8e0d0', DOC_D: '#c8c0b0', STAMP_RED: '#b42e28', STAMP_GREEN: '#548046',
};

let choiceBoxes = [];

function setFont(size, bold = false) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px "Courier New", monospace`;
  ctx.textBaseline = 'top';
}
function txt(x, y, s, size = 12, col = C.WHITE, align = 'left', bold = false) {
  setFont(size, bold); ctx.fillStyle = col; ctx.textAlign = align;
  ctx.fillText(String(s), Math.round(x), Math.round(y));
}
function txtW(s, size = 12, bold = false) { setFont(size, bold); return ctx.measureText(String(s)).width; }
function rect(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function outline(x, y, w, h, col, lw = 1) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1); }
function inBox(x, y, b) { return x >= b[0] && y >= b[1] && x <= b[0] + b[2] && y <= b[1] + b[3]; }
function wrap(s, size, width) {
  const lines = []; let cur = '';
  for (const ch of String(s)) {
    if (ch === '\n') { lines.push(cur); cur = ''; continue; }
    if (cur && txtW(cur + ch, size) > width) { lines.push(cur); cur = ch; } else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}
function roundRect(x, y, w, h, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
}

// ================= 人物绘制 =================
function drawPerson(x, y, scale, expr, opts = {}) {
  const s = scale;
  const skin = opts.skin || C.SKIN;
  const hair = opts.hair || C.HAIR;
  const shirt = opts.shirt || C.SHIRT;
  const pants = opts.pants || C.PANTS;
  const shirtL = opts.shirtL || C.SHIRT_L;
  const hairL = opts.hairL || C.HAIR_L;
  const isFem = opts.female;

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 1 * s, 16 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const legH = 18 * s, bodyH = 22 * s, headR = 11 * s;
  const bodyY = y - legH - bodyH;
  const headY = bodyY - headR * 2 + 2 * s;

  rect(x - 7 * s, y - legH, 5 * s, legH, pants);
  rect(x + 2 * s, y - legH, 5 * s, legH, pants);
  rect(x - 8 * s, y - 3 * s, 7 * s, 3 * s, '#1a1a1e');
  rect(x + 1 * s, y - 3 * s, 7 * s, 3 * s, '#1a1a1e');

  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, bodyY + bodyH);
  ctx.lineTo(x - 14 * s, bodyY + 6 * s);
  ctx.lineTo(x - 8 * s, bodyY);
  ctx.lineTo(x + 8 * s, bodyY);
  ctx.lineTo(x + 14 * s, bodyY + 6 * s);
  ctx.lineTo(x + 12 * s, bodyY + bodyH);
  ctx.closePath(); ctx.fill();
  rect(x - 3 * s, bodyY, 6 * s, 4 * s, shirtL);

  rect(x - 16 * s, bodyY + 6 * s, 4 * s, 14 * s, shirt);
  rect(x + 12 * s, bodyY + 6 * s, 4 * s, 14 * s, shirt);
  rect(x - 16 * s, bodyY + 20 * s, 4 * s, 4 * s, skin);
  rect(x + 12 * s, bodyY + 20 * s, 4 * s, 4 * s, skin);

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(x, headY + headR, headR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hair;
  if (isFem) {
    ctx.beginPath();
    ctx.arc(x, headY + headR, headR + 1 * s, Math.PI, Math.PI * 2);
    ctx.lineTo(x + headR + 1 * s, headY + headR + 10 * s);
    ctx.lineTo(x + headR - 3 * s, headY + headR + 10 * s);
    ctx.lineTo(x + headR - 3 * s, headY + headR + 2 * s);
    ctx.lineTo(x - headR + 3 * s, headY + headR + 2 * s);
    ctx.lineTo(x - headR + 3 * s, headY + headR + 10 * s);
    ctx.lineTo(x - headR - 1 * s, headY + headR + 10 * s);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, headY + headR, headR + 1 * s, Math.PI, Math.PI * 2);
    ctx.lineTo(x + headR + 1 * s, headY + headR + 2 * s);
    ctx.lineTo(x + headR - 2 * s, headY + headR - 1 * s);
    ctx.lineTo(x - headR + 2 * s, headY + headR - 1 * s);
    ctx.lineTo(x - headR - 1 * s, headY + headR + 2 * s);
    ctx.closePath(); ctx.fill();
  }
  rect(x - 4 * s, headY + 2 * s, 3 * s, 1 * s, hairL);

  const eyeY = headY + headR + 1 * s;
  const eyeDX = 4 * s;
  const eyeSize = 1.5 * s;

  if (expr === 'angry') {
    rect(x - eyeDX - 3 * s, eyeY - 3 * s, 5 * s, 1 * s, C.INK);
    rect(x + eyeDX - 2 * s, eyeY - 3 * s, 5 * s, 1 * s, C.INK);
    rect(x - eyeDX, eyeY, eyeSize, eyeSize, C.INK);
    rect(x + eyeDX, eyeY, eyeSize, eyeSize, C.INK);
  } else if (expr === 'shock') {
    rect(x - eyeDX - 1 * s, eyeY - 1 * s, 3 * s, 3 * s, C.WHITE);
    rect(x - eyeDX, eyeY, eyeSize, eyeSize, C.INK);
    rect(x + eyeDX - 1 * s, eyeY - 1 * s, 3 * s, 3 * s, C.WHITE);
    rect(x + eyeDX, eyeY, eyeSize, eyeSize, C.INK);
  } else if (expr === 'sad') {
    rect(x - eyeDX, eyeY + 1 * s, eyeSize, eyeSize, C.INK);
    rect(x + eyeDX, eyeY + 1 * s, eyeSize, eyeSize, C.INK);
    rect(x - eyeDX - 3 * s, eyeY - 2 * s, 4 * s, 1 * s, C.INK);
    rect(x + eyeDX, eyeY - 2 * s, 4 * s, 1 * s, C.INK);
  } else if (expr === 'fake') {
    rect(x - eyeDX - 1 * s, eyeY, 3 * s, 1 * s, C.INK);
    rect(x + eyeDX - 1 * s, eyeY, 3 * s, 1 * s, C.INK);
  } else if (expr === 'nervous') {
    rect(x - eyeDX + 1 * s, eyeY, eyeSize, eyeSize, C.INK);
    rect(x + eyeDX + 1 * s, eyeY, eyeSize, eyeSize, C.INK);
  } else {
    rect(x - eyeDX, eyeY, eyeSize, eyeSize, C.INK);
    rect(x + eyeDX, eyeY, eyeSize, eyeSize, C.INK);
  }

  const mouthY = eyeY + 5 * s;
  if (expr === 'fake') {
    rect(x - 3 * s, mouthY, 6 * s, 1 * s, C.INK);
    rect(x - 4 * s, mouthY - 1 * s, 1 * s, 1 * s, C.INK);
    rect(x + 3 * s, mouthY - 1 * s, 1 * s, 1 * s, C.INK);
  } else if (expr === 'shock') {
    rect(x - 2 * s, mouthY, 4 * s, 3 * s, C.INK);
  } else if (expr === 'angry') {
    rect(x - 3 * s, mouthY + 1 * s, 6 * s, 1 * s, C.INK);
  } else if (expr === 'sad') {
    rect(x - 3 * s, mouthY + 1 * s, 6 * s, 1 * s, C.INK);
    rect(x - 4 * s, mouthY + 2 * s, 1 * s, 1 * s, C.INK);
    rect(x + 3 * s, mouthY + 2 * s, 1 * s, 1 * s, C.INK);
  } else {
    rect(x - 2 * s, mouthY, 4 * s, 1 * s, C.INK);
  }

  if (expr === 'nervous') {
    ctx.fillStyle = '#9cbacc';
    ctx.beginPath();
    ctx.arc(x + headR - 2 * s, headY + headR - 4 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  if (opts.glasses) {
    outline(x - eyeDX - 3 * s, eyeY - 2 * s, 6 * s, 5 * s, C.INK, 1);
    outline(x + eyeDX - 3 * s, eyeY - 2 * s, 6 * s, 5 * s, C.INK, 1);
    rect(x - 1 * s, eyeY, 2 * s, 1 * s, C.INK);
  }

  if (opts.phone) {
    rect(x + 14 * s, bodyY + 18 * s, 6 * s, 10 * s, C.PHONE);
    rect(x + 15 * s, bodyY + 19 * s, 4 * s, 7 * s, C.PHONE_SCREEN);
  }
  if (opts.folder) {
    rect(x - 22 * s, bodyY + 16 * s, 8 * s, 11 * s, C.DOC);
    outline(x - 22 * s, bodyY + 16 * s, 8 * s, 11 * s, C.DOC_D);
  }
}

// ================= 场景绘制 =================
function drawScene(stage) {
  const t = stage || 'room';
  if (t === 'room') drawRoom();
  else if (t === 'chat') drawChatBg();
  else if (t === 'transfer') drawTransferBg();
  else if (t === 'group') drawGroupBg();
  else if (t === 'web') drawWebBg();
  else if (t === 'office') drawOfficeBg();
  else if (t === 'rent') drawRentBg();
  else if (t === 'night') drawNightBg();
}

function drawRoom() {
  rect(0, 0, W, H, C.WALL);
  rect(0, 220, W, H - 220, C.FLOOR);
  for (let i = 0; i < 8; i++) rect(0, 220 + i * 18, W, 1, '#221e1a');
  rect(180, 200, 280, 8, C.WOOD);
  rect(190, 208, 8, 60, C.WOOD);
  rect(442, 208, 8, 60, C.WOOD);
  rect(400, 150, 4, 50, '#4a4440');
  rect(380, 140, 44, 10, '#5a5048');
  ctx.fillStyle = 'rgba(255,220,150,0.15)';
  ctx.beginPath(); ctx.arc(402, 150, 80, 0, Math.PI * 2); ctx.fill();
  rect(20, 210, 120, 50, '#3a3448');
  rect(20, 200, 120, 12, '#4a4458');
  rect(30, 196, 30, 8, '#5a5468');
  rect(60, 40, 60, 80, '#2a3448');
  outline(60, 40, 60, 80, '#1a2438');
  txt(90, 70, 'AI', 24, C.CLAUDE_L, 'center');
  rect(480, 40, 100, 80, C.NIGHT);
  outline(480, 40, 100, 80, '#2a2a30', 2);
  rect(530, 40, 2, 80, '#2a2a30');
  rect(480, 78, 100, 2, '#2a2a30');
  ctx.fillStyle = '#e8e0c8'; ctx.beginPath(); ctx.arc(540, 58, 8, 0, Math.PI * 2); ctx.fill();
}

function drawChatBg() {
  rect(0, 0, W, H, C.CHAT_BG);
  rect(0, 0, W, 36, '#2a2826');
  rect(0, 35, W, 1, '#3a3632');
}

function drawTransferBg() {
  rect(0, 0, W, H, '#1a1c20');
  rect(160, 20, 320, 320, '#0e1014');
  outline(160, 20, 320, 320, '#2a2c30', 2);
  rect(200, 40, 240, 30, '#1a1c20');
  txt(320, 48, '转账', 16, C.WHITE, 'center');
  rect(200, 100, 240, 60, '#1a1c20');
  txt(210, 108, '收款人', 11, C.GREY);
  txt(210, 126, '林浩', 16, C.WHITE);
  rect(200, 180, 240, 60, '#1a1c20');
  txt(210, 188, '金额', 11, C.GREY);
  txt(210, 206, '¥3000.00', 20, C.RED_L);
  rect(200, 280, 240, 36, C.RED);
  txt(320, 288, '确认转账', 14, C.WHITE, 'center');
}

function drawGroupBg() {
  rect(0, 0, W, H, C.CHAT_BG);
  rect(0, 0, W, 36, '#2a2826');
  txt(16, 8, '校园兼职群 (487)', 14, C.WHITE);
  for (let i = 0; i < 6; i++) {
    const x = 20 + (i % 3) * 100, y = 50 + Math.floor(i / 3) * 100;
    rect(x, y, 80, 80, '#2a2826');
    outline(x, y, 80, 80, '#3a3632');
    txt(x + 40, y + 30, '👤', 24, C.GREY, 'center');
  }
}

function drawWebBg() {
  rect(0, 0, W, H, '#1a1c20');
  rect(0, 0, W, 30, '#2a2c30');
  rect(10, 6, 200, 18, '#1a1c20');
  outline(10, 6, 200, 18, '#3a3c40');
  txt(16, 8, 'https://xx-danbao.xyz/...', 10, C.GREY);
  rect(100, 50, 440, 280, '#22242a');
  txt(320, 70, 'XX 担保交易平台', 18, C.WHITE, 'center');
  txt(320, 100, '资金托管 · 安全可靠', 11, C.GREY, 'center');
  rect(160, 130, 320, 30, '#1a1c20'); outline(160, 130, 320, 30, '#3a3c40');
  txt(170, 138, '手机号', 11, C.GREY);
  rect(160, 170, 320, 30, '#1a1c20'); outline(160, 170, 320, 30, '#3a3c40');
  txt(170, 178, '身份证号', 11, C.GREY);
  rect(160, 210, 320, 30, '#1a1c20'); outline(160, 210, 320, 30, '#3a3c40');
  txt(170, 218, '银行卡号', 11, C.GREY);
  rect(160, 250, 320, 30, '#1a1c20'); outline(160, 250, 320, 30, '#3a3c40');
  txt(170, 258, '短信验证码', 11, C.GREY);
  rect(160, 290, 320, 28, C.RED);
  txt(320, 296, '提交验证', 13, C.WHITE, 'center');
}

function drawOfficeBg() {
  rect(0, 0, W, H, '#2a2e34');
  rect(100, 220, 440, 20, C.WOOD);
  rect(120, 240, 20, 80, C.WOOD); rect(500, 240, 20, 80, C.WOOD);
  rect(0, 0, W, 120, '#3a3e44');
  rect(420, 30, 160, 100, '#e8e4d8');
  outline(420, 30, 160, 100, '#c8c4b8', 2);
  txt(500, 50, '内推', 16, C.INK, 'center');
  txt(500, 80, '¥4980', 14, C.RED, 'center');
  rect(40, 30, 120, 80, C.NIGHT);
  outline(40, 30, 120, 80, '#2a2a30', 2);
}

function drawRentBg() {
  rect(0, 0, W, H, '#2a2826');
  rect(0, 0, W, 200, '#3a3632');
  rect(240, 40, 100, 180, '#4a4038');
  outline(240, 40, 100, 180, '#2a2420', 2);
  ctx.fillStyle = C.GOLD; ctx.beginPath(); ctx.arc(325, 140, 4, 0, Math.PI * 2); ctx.fill();
  rect(0, 200, W, H - 200, C.FLOOR);
  for (let i = 0; i < 8; i++) rect(0, 200 + i * 20, W, 1, '#221e1a');
  rect(40, 220, 140, 60, '#3a3448');
  rect(40, 210, 140, 14, '#4a4458');
  rect(440, 220, 120, 8, C.WOOD);
  rect(450, 228, 8, 50, C.WOOD); rect(542, 228, 8, 50, C.WOOD);
}

function drawNightBg() {
  rect(0, 0, W, H, C.NIGHT);
  for (let i = 0; i < 40; i++) {
    const x = (i * 137 + 17) % W, y = (i * 89 + 7) % 200;
    rect(x, y, 1, 1, i % 3 ? '#e8e0c8' : '#6a7a8a');
  }
  ctx.fillStyle = '#f0e8d0'; ctx.beginPath(); ctx.arc(540, 60, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.NIGHT; ctx.beginPath(); ctx.arc(550, 52, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#12161e';
  for (let i = 0; i < 10; i++) {
    const bx = i * 70, bw = 50 + (i * 13) % 30, bh = 60 + (i * 37) % 100;
    rect(bx, H - bh, bw, bh, '#12161e');
    for (let wy = H - bh + 10; wy < H - 10; wy += 14) {
      for (let wx = bx + 6; wx < bx + bw - 6; wx += 10) {
        if ((wx + wy) % 37 < 20) rect(wx, wy, 3, 4, '#3a4a5a');
      }
    }
  }
}

// ================= 游戏界面 =================
function drawNode() {
  const node = getNode();
  const level = LEVELS[currentLevel];

  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, 180); ctx.clip();
  drawScene(node.stage);
  if (node.person && node.expr !== undefined) {
    drawPerson(node.person.x || 520, 180, 1, node.expr, {
      female: node.person.female,
      phone: node.person.phone,
      folder: node.person.folder,
    });
  }
  drawPerson(80, 180, 0.85, 'normal', { female: false, phone: node.stage === 'chat' || node.stage === 'group' });
  rect(0, 0, W, 22, 'rgba(22,19,19,0.75)');
  txt(12, 5, `${level.title}  ·  ${level.subtitle}`, 11, C.WHITE);
  txt(W - 12, 5, `第 ${currentLevel + 1} 关 / 5`, 11, C.GREY, 'right');
  ctx.restore();

  rect(0, 180, W, H - 180, C.CHAT_BG);
  rect(0, 180, W, 1, '#3a3632');

  rect(12, 188, 22, 22, C.RED_D);
  txt(23, 193, node.avatar || '?', 12, C.WHITE, 'center');
  txt(44, 186, node.who || '', 13, C.WHITE);
  txt(44, 202, '在线', 9, C.GREEN_L);

  let y = 216;
  const shown = node.msgs.slice(0, currentMsgIndex + 1);
  const rendered = [];
  for (const [who, text] of shown) {
    const isSys = who === 'sys' || who === 'nar';
    const size = 12;
    const maxW = isSys ? 540 : 400;
    const lines = wrap(text, size, maxW - 20);
    const h = lines.length * 16 + 10;
    rendered.push({ who, text, lines, h, isSys });
  }
  const totalH = rendered.reduce((s, r) => s + r.h + 6, 0);
  const viewTop = 214, viewBot = H - 110;
  if (totalH > viewBot - viewTop) y = viewBot - totalH;

  for (const r of rendered) {
    if (r.isSys) {
      for (const ln of r.lines) { txt(W / 2, y + 2, ln, 11, C.GREY, 'center'); y += 14; }
      y += 4;
    } else if (r.who === 'npc') {
      const bw = Math.max(...r.lines.map((l) => txtW(l, 12))) + 20;
      roundRect(44, y, bw, r.h, 5, C.BUBBLE_OTHER);
      r.lines.forEach((ln, i) => txt(54, y + 5 + i * 16, ln, 12, '#161313'));
      y += r.h + 6;
    } else {
      const bw = Math.max(...r.lines.map((l) => txtW(l, 12))) + 20;
      roundRect(W - 44 - bw, y, bw, r.h, 5, C.BUBBLE_ME);
      r.lines.forEach((ln, i) => txt(W - 44 - bw + 10, y + 5 + i * 16, ln, 12, '#161313'));
      y += r.h + 6;
    }
  }

  if (currentMsgIndex >= node.msgs.length - 1 && !choiceLock) {
    drawChoices(node.choices);
  } else if (currentMsgIndex < node.msgs.length - 1) {
    txt(W / 2, H - 30, '……', 16, C.GREY, 'center');
  }
}

// 升级：带安全/危险盾牌标识的选项
function drawChoices(choices) {
  choiceBoxes = [];
  const n = choices.length;
  const totalH = n * 34 + (n - 1) * 6;
  const startY = H - 16 - totalH;
  
  choices.forEach((c, i) => {
    const y = startY + i * 40;
    const box = [40, y, W - 80, 32];
    choiceBoxes.push(box);
    const hover = inBox(ptr.x, ptr.y, box);
    
    let borderCol = '#4a4440';
    let bgCol = hover ? '#3a3632' : '#2a2622';
    
    if (c.kind === 'safe') borderCol = hover ? '#a0d080' : C.GREEN_L;
    else if (c.kind === 'danger') borderCol = hover ? '#ff8080' : C.RED_L;
    else if (hover) borderCol = C.CLAUDE;
    
    rect(box[0], box[1], box[2], box[3], bgCol);
    outline(box[0], box[1], box[2], box[3], borderCol, hover ? 2 : 1);
    
    // 左侧 A/B/C
    rect(box[0] + 6, box[1] + 8, 16, 16, hover ? C.RED : '#4a4440');
    txt(box[0] + 14, box[1] + 9, String.fromCharCode(65 + i), 11, C.WHITE, 'center');
    
    // 文本
    const lines = wrap(c.text, 12, box[2] - 70);
    lines.slice(0, 1).forEach((ln) => txt(box[0] + 30, box[1] + 8, ln, 12, C.WHITE));
    
    // 右侧图标
    if (c.kind === 'safe') {
      // 绿色盾牌
      ctx.fillStyle = C.GREEN_L;
      ctx.beginPath();
      ctx.moveTo(box[0] + box[2] - 20, box[1] + 8);
      ctx.lineTo(box[0] + box[2] - 14, box[1] + 8);
      ctx.lineTo(box[0] + box[2] - 14, box[1] + 16);
      ctx.lineTo(box[0] + box[2] - 17, box[1] + 22);
      ctx.lineTo(box[0] + box[2] - 20, box[1] + 16);
      ctx.fill();
    } else if (c.kind === 'danger') {
      // 红色警告
      txt(box[0] + box[2] - 20, box[1] + 8, '⚠', 14, C.RED_L, 'center');
    }
  });
}

// ================= 结局与复盘 =================
function drawEnding() {
  const node = getNode();
  const isBad = node.ending === 'bad';
  drawScene(node.stage || 'room');
  ctx.fillStyle = 'rgba(22,19,19,0.88)'; ctx.fillRect(0, 0, W, H);

  if (node.person) {
    drawPerson(node.person.x || 520, 220, 1.1, isBad ? 'sad' : 'shock', {
      female: node.person.female, phone: node.person.phone, folder: node.person.folder,
    });
  }
  rect(0, 30, W, 3, isBad ? C.RED : C.GREEN);
  txt(W / 2, 50, node.endingTitle, 28, isBad ? C.RED_L : C.GREEN_L, 'center');
  txt(W / 2, 90, node.endingSub, 12, C.GREY_L, 'center');
  txt(W / 2, 116, `本关安全选择：${endStats.safe} 次    危险选择：${endStats.danger} 次`, 11, C.GREY, 'center');

  const bx = W / 2 - 100, by = 290;
  const hover = inBox(ptr.x, ptr.y, [bx, by, 200, 30]);
  rect(bx, by, 200, 30, hover ? C.RED : C.RED_D);
  outline(bx, by, 200, 30, C.RED_L);
  txt(W / 2, by + 8, '查看复盘 ▶', 13, C.WHITE, 'center');
}

let reviewScroll = 0;

function drawReview() {
  const level = LEVELS[currentLevel];
  const rv = level.review;
  
  rect(0, 0, W, H, '#1e1b18');
  
  // 顶部栏
  rect(0, 0, W, 36, '#3a1a1a');
  rect(0, 35, W, 1, '#5a2a2a');
  txt(16, 10, `${rv.title}`, 14, C.WHITE, 'bold');
  
  // 右上角返回
  const backHover = inBox(ptr.x, ptr.y, [W - 100, 0, 100, 36]);
  if (backHover) rect(W - 100, 0, 100, 36, '#5a2a2a');
  txt(W - 16, 12, '返回选关 ◀', 11, backHover ? C.WHITE : C.GREY_L, 'right');

  // 底部核心原则横幅
  rect(0, H - 36, W, 36, '#2a1212');
  rect(0, H - 36, W, 1, '#5a2a2a');
  txt(W / 2, H - 24, rv.principle, 12, C.GOLD, 'center');

  // 左右卡片
  let y = 55 - reviewScroll;
  const colW = 300, leftX = 20, rightX = W - 20 - colW;
  
  rect(leftX, y, colW, 24, '#3a1414'); outline(leftX, y, colW, 24, '#6a2020');
  txt(leftX + 10, y + 5, rv.leftTitle, 12, C.RED_L);
  rect(rightX, y, colW, 24, '#143a14'); outline(rightX, y, colW, 24, '#206a20');
  txt(rightX + 10, y + 5, rv.rightTitle, 12, C.GREEN_L);
  
  y += 34;
  const startY = y;
  let leftH = 0, rightH = 0;
  
  for (let i = 0; i < rv.signals.length; i++) {
    const [line, sig, fix] = rv.signals[i];
    
    // 左卡片
    const linesL = wrap(`⚠ ${line}`, 11, colW - 20);
    let curLeftH = linesL.length * 14 + 8;
    if (sig) curLeftH += 14;
    if (startY + leftH > 20 && startY + leftH < H - 50) {
      rect(leftX, startY + leftH, colW, curLeftH, '#221010');
      outline(leftX, startY + leftH, colW, curLeftH, '#4a1a1a');
      let ly = startY + leftH + 4;
      linesL.forEach(l => { txt(leftX + 10, ly, l, 11, C.WHITE); ly += 14; });
      if (sig) txt(leftX + 10, ly, sig, 10, C.GREY);
    }
    leftH += curLeftH + 8;
    
    // 右卡片
    const linesR = wrap(`✓ ${fix}`, 11, colW - 20);
    let curRightH = linesR.length * 14 + 8;
    if (startY + rightH > 20 && startY + rightH < H - 50) {
      rect(rightX, startY + rightH, colW, curRightH, '#102210');
      outline(rightX, startY + rightH, colW, curRightH, '#1a4a1a');
      let ry = startY + rightH + 4;
      linesR.forEach(l => { txt(rightX + 10, ry, l, 11, C.WHITE); ry += 14; });
    }
    rightH += curRightH + 8;
  }
  
  y = startY + Math.max(leftH, rightH) + 10;
  
  // 法律提示
  if (y > 20 && y < H - 50) {
    rect(20, y, W - 40, 20, '#3a3a20'); outline(20, y, W - 40, 20, '#6a6a40');
    txt(30, y + 4, '【法律提示】', 11, C.GOLD);
  }
  y += 26;
  
  for (const [law, text, rel] of rv.laws) {
    const lines = wrap(text, 10, W - 80);
    const h = lines.length * 12 + 16;
    if (y > 20 && y < H - 50) {
      txt(30, y, law, 11, C.WHITE, 'left', true); y += 14;
      for (const ln of lines) { txt(36, y, ln, 10, C.GREY_L); y += 12; }
    } else y += h;
    y += 4;
  }
  
  // 自保口诀
  y += 6;
  if (y > 20 && y < H - 50) {
    rect(20, y, W - 40, 20, '#3a2020'); outline(20, y, W - 40, 20, '#6a3030');
    txt(30, y + 4, '【自保口诀】', 11, C.RED_L);
  }
  y += 26;
  
  rv.tips.forEach((t, i) => {
    if (y > 20 && y < H - 50) {
      txt(30, y, `${i + 1}. ${t}`, 11, C.CLAUDE_L); y += 16;
    } else y += 16;
  });
  
  if (reviewScroll > 0) txt(W - 12, 40, '▲', 10, C.GREY, 'right');
  txt(W - 12, H - 46, '▼', 10, C.GREY_D, 'right');
}

function drawFinal() {
  drawNightBg();
  ctx.fillStyle = 'rgba(22,19,19,0.88)'; ctx.fillRect(0, 0, W, H);
  
  // 顶部栏
  rect(0, 0, W, 36, '#3a1a1a');
  rect(0, 35, W, 1, '#5a2a2a');
  txt(16, 10, FINAL_REVIEW.title, 14, C.WHITE, 'bold');
  
  const backHover = inBox(ptr.x, ptr.y, [W - 100, 0, 100, 36]);
  if (backHover) rect(W - 100, 0, 100, 36, '#5a2a2a');
  txt(W - 16, 12, '返回选关 ◀', 11, backHover ? C.WHITE : C.GREY_L, 'right');

  // 底部红底横幅（完美匹配说明书截图）
  rect(0, H - 40, W, 40, '#8b1a1a');
  rect(0, H - 40, W, 1, '#ff4444');
  txt(W / 2, H - 28, '天上不会掉馅饼，转账之前先核实', 14, C.WHITE, 'center', true);

  // 主体内容
  let y = 55;
  txt(W / 2, y, FINAL_REVIEW.text[0], 12, C.WHITE, 'center'); y += 30;
  
  // 流程图
  const boxW = 120, boxH = 70, gap = (W - 320 - boxW * 3) / 2;
  FINAL_REVIEW.steps.forEach((step, i) => {
    const bx = 20 + i * (boxW + gap);
    rect(bx, y, boxW, boxH, '#2a1010');
    outline(bx, y, boxW, boxH, C.RED);
    rect(bx + 10, y - 10, boxW - 20, 20, C.INK);
    outline(bx + 10, y - 10, boxW - 20, 20, C.GREY_D);
    txt(bx + boxW/2, y - 5, step.sub, 10, C.GREY, 'center');
    txt(bx + boxW/2, y + 15, step.title, 18, C.RED_L, 'center', true);
    const lines = wrap(step.desc, 10, boxW - 20);
    lines.forEach((ln, j) => txt(bx + boxW/2, y + 42 + j * 12, ln, 10, C.GREY_L, 'center'));
    
    if (i < 2) {
      const ax = bx + boxW + gap / 2, ay = y + boxH / 2;
      ctx.fillStyle = C.RED;
      ctx.beginPath(); ctx.moveTo(ax - 5, ay - 8); ctx.lineTo(ax + 5, ay); ctx.lineTo(ax - 5, ay + 8); ctx.fill();
    }
  });
  
  // 右侧绿色面板
  const rightX = 20 + 3 * (boxW + gap) + 10;
  const rightW = W - 20 - rightX;
  const panelH = 110;
  
  rect(rightX, y, rightW, panelH, '#102210');
  outline(rightX, y, rightW, panelH, C.GREEN_L);
  rect(rightX + 20, y - 10, rightW - 40, 20, C.INK);
  outline(rightX + 20, y - 10, rightW - 40, 20, '#206a20');
  txt(rightX + rightW / 2, y - 5, '正确应对', 10, C.GREEN_L, 'center');
  
  FINAL_REVIEW.rules.forEach((r, i) => {
    const lines = wrap(`✓ ${r}`, 11, rightW - 20);
    lines.forEach((ln, j) => {
      txt(rightX + 10, y + 15 + i * 26 + j * 14, ln, 11, C.WHITE);
    });
  });
  
  y += panelH + 25;
  
  // 底部电话及寄语
  txt(W / 2, y, `☎ 全国反诈专线：${FINAL_REVIEW.hotline}`, 14, C.GOLD, 'center', true); y += 24;
  txt(W / 2, y, FINAL_REVIEW.last, 12, C.RED_L, 'center', true);

  // 返回按钮（在红底横幅上方）
  const bx = W / 2 - 80, by = H - 75;
  const hover = inBox(ptr.x, ptr.y, [bx, by, 160, 24]);
  rect(bx, by, 160, 24, hover ? C.RED : C.RED_D);
  outline(bx, by, 160, 24, C.RED_L);
  txt(W / 2, by + 5, '重新开始', 12, C.WHITE, 'center');
}