// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the
// backdrop colour. Every ingredient, dish and station is drawn with canvas paths:
// no image files, no network. Text that holds a number is rebuilt only when the
// number changes, so a frame allocates nothing.
import { BOARD, CHOPS_NEEDED, DISHES, INGREDIENTS, PALETTE, STATIONS, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_DAYCLEAR = 'dayclear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

/** Clickable HUD buttons (logical coordinates), read by main.js. */
export const HUD_BUTTONS = {
  mute: { x: 1150, y: 10, w: 52, h: 36 },
  pause: { x: 1210, y: 10, w: 52, h: 36 },
};

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function baseId(id) {
  return id.endsWith('_c') ? id.slice(0, -2) : id;
}

/** One ingredient's glyph, centred at (x, y), about s pixels across. */
export function drawIngredientIcon(ctx, id, x, y, s) {
  const r = s / 2;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'nasi') {
    ctx.fillStyle = '#e8e0c8';
    ctx.beginPath();
    ctx.ellipse(0, 2, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.ellipse(0, -1, r * 0.8, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9cfae';
    for (let i = 0; i < 5; i += 1) {
      ctx.fillRect(-r * 0.5 + i * r * 0.25, -r * 0.3 + (i % 2) * r * 0.2, 2, 2);
    }
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = Math.max(2, s * 0.09);
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, i * r * 0.45);
      ctx.bezierCurveTo(-r * 0.3, i * r * 0.45 - r * 0.4, r * 0.3, i * r * 0.45 + r * 0.4, r * 0.8, i * r * 0.45);
      ctx.stroke();
    }
  } else if (id === 'telur') {
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a93c';
    circle(ctx, 0, r * 0.1, r * 0.42);
    ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = '#d97b4f';
    circle(ctx, -r * 0.2, -r * 0.1, r * 0.62);
    ctx.fill();
    ctx.fillStyle = '#b85c33';
    circle(ctx, -r * 0.35, -r * 0.25, r * 0.3);
    ctx.fill();
    ctx.strokeStyle = '#fff8e1';
    ctx.lineWidth = Math.max(2, s * 0.1);
    ctx.beginPath();
    ctx.moveTo(r * 0.35, r * 0.35);
    ctx.lineTo(r * 0.8, r * 0.8);
    ctx.stroke();
    ctx.fillStyle = '#fff8e1';
    circle(ctx, r * 0.85, r * 0.85, r * 0.22);
    ctx.fill();
  } else if (id === 'ayam_c' || id === 'cabai_c' || id === 'bawang_c') {
    const color = id === 'ayam_c' ? '#d97b4f' : id === 'cabai_c' ? '#c0392b' : '#b388c7';
    ctx.fillStyle = color;
    const offs = [
      [-r * 0.45, -r * 0.3],
      [r * 0.3, -r * 0.45],
      [-r * 0.1, r * 0.3],
      [r * 0.5, r * 0.35],
    ];
    for (const [ox, oy] of offs) ctx.fillRect(ox, oy, r * 0.55, r * 0.55);
  } else if (id === 'kecap') {
    ctx.fillStyle = '#2c1a0c';
    roundRect(ctx, -r * 0.4, -r * 0.7, r * 0.8, r * 1.4, r * 0.2);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-r * 0.4, -r * 0.15, r * 0.8, r * 0.5);
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(-r * 0.25, -r, r * 0.5, r * 0.35);
  } else if (id === 'cabai') {
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.5);
    ctx.quadraticCurveTo(r * 0.2, -r, r * 0.75, r * 0.45);
    ctx.quadraticCurveTo(r * 0.2, r * 0.75, -r * 0.55, r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = Math.max(2, s * 0.09);
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.5);
    ctx.quadraticCurveTo(-r * 0.9, -r * 0.9, -r * 0.45, -r * 0.85);
    ctx.stroke();
  } else if (id === 'bawang') {
    ctx.fillStyle = '#b388c7';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.quadraticCurveTo(r * 0.85, -r * 0.2, r * 0.55, r * 0.55);
    ctx.quadraticCurveTo(0, r * 0.9, -r * 0.55, r * 0.55);
    ctx.quadraticCurveTo(-r * 0.85, -r * 0.2, 0, -r * 0.8);
    ctx.fill();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = Math.max(2, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(0, -r * 1.15);
    ctx.stroke();
  } else if (id === 'kerupuk') {
    ctx.fillStyle = '#f7d774';
    circle(ctx, 0, 0, r * 0.9);
    ctx.fill();
    ctx.strokeStyle = '#e0a92e';
    ctx.lineWidth = Math.max(1.5, s * 0.06);
    circle(ctx, 0, 0, r * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.2);
    ctx.quadraticCurveTo(0, -r * 0.6, r * 0.6, -r * 0.2);
    ctx.stroke();
  } else if (id === 'teh') {
    ctx.fillStyle = 'rgba(200, 120, 40, 0.9)';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.7);
    ctx.lineTo(r * 0.55, -r * 0.7);
    ctx.lineTo(r * 0.4, r * 0.8);
    ctx.lineTo(-r * 0.4, r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = Math.max(1.5, s * 0.06);
    ctx.stroke();
  } else if (id === 'es') {
    ctx.fillStyle = '#a8d8f0';
    ctx.fillRect(-r * 0.6, -r * 0.4, r * 0.55, r * 0.55);
    ctx.fillRect(r * 0.05, r * 0.1, r * 0.55, r * 0.55);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(-r * 0.45, -r * 0.25, r * 0.2, r * 0.2);
  }
  ctx.restore();
}

/** A plate carrying a dish, centred at (x, y), about s pixels across. */
function drawPlateIcon(ctx, dishId, kerupuk, x, y, s) {
  const r = s / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fdfdfd';
  circle(ctx, 0, 0, r);
  ctx.fill();
  ctx.strokeStyle = '#d9d9d9';
  ctx.lineWidth = 1.5;
  circle(ctx, 0, 0, r * 0.72);
  ctx.stroke();
  if (dishId === 'esteh') {
    drawIngredientIcon(ctx, 'teh', 0, 0, s * 0.7);
  } else {
    const dish = DISHES[dishId];
    const colors = { nasgor: '#e8a34c', miegor: '#f2c94c', sate: '#b85c33' };
    const key = dishId.includes('mie') ? 'miegor' : dishId.includes('sate') ? 'sate' : 'nasgor';
    ctx.fillStyle = colors[key];
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.62, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(-r * 0.3, -r * 0.45, r * 0.6, r * 0.14);
    if (dish && dish.name.includes('PEDAS')) {
      drawIngredientIcon(ctx, 'cabai', r * 0.3, -r * 0.25, s * 0.3);
    }
  }
  if (kerupuk) drawIngredientIcon(ctx, 'kerupuk', r * 0.55, r * 0.45, s * 0.45);
  ctx.restore();
}

function cachedLabel(prefix) {
  let value = -1;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const fonts = new Map();
  const coinsLabel = cachedLabel('Rp ');
  const dayLabel = cachedLabel('HARI ');
  const servedLabel = cachedLabel('');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / VIEW.width, height / VIEW.height);
    view.x = (width - VIEW.width * view.scale) / 2;
    view.y = (height - VIEW.height * view.scale) / 2;
  }
  resize();
  window.addEventListener('resize', resize);

  function text(value, x, y, size, color, align = 'left', weight = 700) {
    const key = `${weight}|${size}`;
    if (!fonts.has(key)) fonts.set(key, `${weight} ${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function shadowText(value, x, y, size, color, align = 'left') {
    context.font = `${700} ${size}px ${FONT}`;
    context.textAlign = align;
    context.fillStyle = 'rgba(0,0,0,0.35)';
    context.fillText(value, x + 2, y + 2);
    context.fillStyle = color;
    context.fillText(value, x, y);
  }

  function bar(x, y, w, h, frac, fill, back = 'rgba(0,0,0,0.25)') {
    roundRect(context, x, y, w, h, h / 2);
    context.fillStyle = back;
    context.fill();
    if (frac > 0) {
      roundRect(context, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
      context.fillStyle = fill;
      context.fill();
    }
  }

  function patienceColor(frac) {
    if (frac > 0.5) return '#2e7d32';
    if (frac > 0.25) return '#e0a92e';
    return '#c0392b';
  }

  function drawFloor(state) {
    context.fillStyle = PALETTE.wall;
    context.fillRect(0, 0, VIEW.width, 164);
    context.fillStyle = PALETTE.wallTrim;
    context.fillRect(0, 160, VIEW.width, 4);
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 16; col += 1) {
        context.fillStyle = (row + col) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
        context.fillRect(col * 80, 164 + row * 80, 80, 80);
      }
    }
    context.strokeStyle = PALETTE.floorLine;
    context.lineWidth = 1;
    for (let col = 0; col <= 16; col += 1) {
      context.beginPath();
      context.moveTo(col * 80, 164);
      context.lineTo(col * 80, 720);
      context.stroke();
    }
    for (let row = 0; row <= 7; row += 1) {
      context.beginPath();
      context.moveTo(0, 164 + row * 80);
      context.lineTo(1280, 164 + row * 80);
      context.stroke();
    }
    // Wall decor: a menu poster and a hanging lamp.
    context.fillStyle = '#fff8ea';
    roundRect(context, 1120, 168, 144, 88, 8);
    context.fill();
    context.strokeStyle = PALETTE.wood;
    context.lineWidth = 3;
    roundRect(context, 1120, 168, 144, 88, 8);
    context.stroke();
    text('MENU', 1192, 192, 15, PALETTE.ticketRed, 'center');
    text('NASGOR 12rb', 1192, 214, 12, PALETTE.ink, 'center', 600);
    text('MIEGOR 12rb', 1192, 232, 12, PALETTE.ink, 'center', 600);
    text('SATE 16rb', 1192, 250, 12, PALETTE.ink, 'center', 600);
    const sway = Math.sin(state.time * 0.8) * 3;
    context.strokeStyle = '#6f4525';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(640 + sway, 0);
    context.lineTo(640 + sway, 26);
    context.stroke();
    context.fillStyle = '#ffc93c';
    circle(context, 640 + sway, 34, 10);
    context.fill();
    context.fillStyle = 'rgba(255,201,60,0.25)';
    circle(context, 640 + sway, 34, 18);
    context.fill();
  }

  function ticketIcons(ticket) {
    const dish = DISHES[ticket.dishId];
    const ids = dish.drink ? ['teh', 'es'] : dish.wok.map(baseId);
    if (ticket.extraKerupuk) ids.push('kerupuk');
    return ids;
  }

  function drawBoard(state) {
    roundRect(context, BOARD.x, BOARD.y, BOARD.width, BOARD.height, 10);
    context.fillStyle = PALETTE.panel;
    context.fill();
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 2;
    roundRect(context, BOARD.x, BOARD.y, BOARD.width, BOARD.height, 10);
    context.stroke();
    text('PAPAN PESANAN', BOARD.x + 14, BOARD.y + 22, 13, PALETTE.muted, 'left', 800);
    const slotW = (BOARD.width - 28 - (BOARD.slots - 1) * BOARD.gap) / BOARD.slots;
    for (let i = 0; i < BOARD.slots; i += 1) {
      const x = BOARD.x + 14 + i * (slotW + BOARD.gap);
      const y = BOARD.y + 28;
      const ticket = state.tickets[i];
      roundRect(context, x, y, slotW, 56, 6);
      context.fillStyle = ticket ? PALETTE.paper : 'rgba(0,0,0,0.06)';
      context.fill();
      context.strokeStyle = ticket ? '#e0d6bd' : 'rgba(0,0,0,0.08)';
      context.lineWidth = 1;
      roundRect(context, x, y, slotW, 56, 6);
      context.stroke();
      if (!ticket) continue;
      const dish = DISHES[ticket.dishId];
      const frac = Math.max(0, ticket.patience / ticket.patienceMax);
      const flashing = frac < 0.25 && Math.sin(state.time * 10) > 0;
      // Wok match: this ticket's recipe is what the wok holds.
      const wok = state.wok;
      const wokMatches =
        !dish.drink && wok.contents.length > 0 && wok.contents.every((item) => dish.wok.includes(item));
      if (wokMatches) {
        context.strokeStyle = '#2e7d32';
        context.lineWidth = 3;
        roundRect(context, x, y, slotW, 56, 6);
        context.stroke();
      }
      text(dish.short, x + 8, y + 18, 14, flashing ? '#c0392b' : PALETTE.ink, 'left', 800);
      text(`Rp${ticket.price.toLocaleString('id-ID')}`, x + slotW - 8, y + 18, 12, '#7a5a3a', 'right', 700);
      const icons = ticketIcons(ticket);
      icons.forEach((id, index) => {
        const ix = x + 20 + index * 26;
        const iy = y + 36;
        drawIngredientIcon(context, id, ix, iy, 20);
        const inWok = !dish.drink && wok.contents.includes(id) && dish.wok.includes(id);
        const inWokChopped = !dish.drink && wok.contents.includes(`${id}_c`) && dish.wok.includes(`${id}_c`);
        const onPlate = state.plates.some((plate) => plate && plate.dishId === ticket.dishId && (id !== 'kerupuk' || plate.kerupuk));
        if (inWok || inWokChopped || onPlate || (dish.drink && state.hands.some((h) => h && h.kind === 'drink'))) {
          context.strokeStyle = '#2e7d32';
          context.lineWidth = 2.5;
          context.beginPath();
          context.moveTo(ix - 5, iy + 1);
          context.lineTo(ix - 1, iy + 5);
          context.lineTo(ix + 6, iy - 5);
          context.stroke();
        }
      });
      bar(x + 8, y + 48, slotW - 16, 6, frac, patienceColor(frac));
    }
  }

  function drawBins() {
    for (const bin of STATIONS.bins) {
      roundRect(context, bin.x, bin.y, bin.w, bin.h, 8);
      context.fillStyle = PALETTE.woodTop;
      context.fill();
      context.strokeStyle = PALETTE.woodEdge;
      context.lineWidth = 2;
      roundRect(context, bin.x, bin.y, bin.w, bin.h, 8);
      context.stroke();
      drawIngredientIcon(context, bin.id, bin.x + 20, bin.y + bin.h / 2, 26);
      text(INGREDIENTS[bin.id].name, bin.x + 38, bin.y + 20, 13, '#fff8ea', 'left', 800);
      if (INGREDIENTS[bin.id].chop) text('cincang dulu', bin.x + 38, bin.y + 35, 9, '#ffd9a0', 'left', 600);
    }
    text('BAHAN', 20, 164, 11, PALETTE.muted, 'left', 800);
  }

  function drawTalenan(state) {
    const st = STATIONS.talenan;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.fillStyle = '#c89b6a';
    context.fill();
    context.strokeStyle = PALETTE.woodEdge;
    context.lineWidth = 2;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.stroke();
    text(st.label, st.x + 10, st.y + 18, 12, '#6f4525', 'left', 800);
    const board = state.board;
    if (board.item) {
      drawIngredientIcon(context, board.item.id, st.x + 60, st.y + 52, 44);
      if (board.item.kind === 'ing') {
        bar(st.x + 100, st.y + 44, 80, 10, board.chops / CHOPS_NEEDED, '#c0392b');
        text(`CINCANG ${board.chops}/${CHOPS_NEEDED}`, st.x + 100, st.y + 68, 11, '#6f4525', 'left', 700);
      } else {
        text('SUDAH DICINCANG', st.x + 100, st.y + 56, 11, '#2e7d32', 'left', 700);
      }
    } else {
      text('Klik bahan mentah, lalu cincang', st.x + 10, st.y + 56, 11, '#8a6a45', 'left', 600);
    }
  }

  function drawWajan(state) {
    const st = STATIONS.wajan;
    const wok = state.wok;
    // Label and status live in the free strip above the bowl.
    text(st.label, st.x + 10, st.y + 16, 12, '#fdfdfd', 'left', 800);
    if (wok.cooking) {
      text('MEMASAK...', st.x + st.w - 10, st.y + 16, 11, '#ffd9a0', 'right', 700);
    } else if (wok.ready) {
      const blink = Math.sin(state.time * 8) > 0;
      text('ANGKAT!', st.x + st.w - 10, st.y + 16, 14, blink ? '#ffc93c' : '#ffffff', 'right', 800);
    } else if (wok.burnt) {
      text('GOSONG!', st.x + st.w - 10, st.y + 16, 12, '#ff8a7a', 'right', 700);
    } else if (wok.invalid) {
      text('BUKAN RESEP!', st.x + st.w - 10, st.y + 16, 12, '#ff8a7a', 'right', 700);
    } else if (wok.contents.length > 0) {
      text('Tambah bahan...', st.x + st.w - 10, st.y + 16, 11, '#cfd6e4', 'right', 600);
    }
    // Progress: a vertical bar in the free strip at the right of the bowl.
    if (wok.cooking) {
      roundRect(context, st.x + st.w - 16, st.y + 28, 10, 46, 5);
      context.fillStyle = 'rgba(0,0,0,0.3)';
      context.fill();
      const fillH = Math.max(5, 46 * Math.min(1, wok.progress));
      roundRect(context, st.x + st.w - 16, st.y + 28 + 46 - fillH, 10, fillH, 5);
      context.fillStyle = '#ff9a2a';
      context.fill();
    }
    // Stove.
    roundRect(context, st.x, st.y + 78, st.w, 26, 8);
    context.fillStyle = PALETTE.steel;
    context.fill();
    // Flame under the bowl, peeking out below its rim.
    const flick = Math.sin(state.time * 11) * 4 + Math.sin(state.time * 23) * 2;
    if (wok.cooking || wok.ready) {
      context.fillStyle = PALETTE.flame;
      context.beginPath();
      context.moveTo(st.x + 40, st.y + 78);
      context.quadraticCurveTo(st.x + 120, st.y + 36 + flick, st.x + 200, st.y + 78);
      context.quadraticCurveTo(st.x + 120, st.y + 66, st.x + 40, st.y + 78);
      context.fill();
      context.fillStyle = PALETTE.flameHot;
      context.beginPath();
      context.moveTo(st.x + 78, st.y + 78);
      context.quadraticCurveTo(st.x + 120, st.y + 52 + flick, st.x + 162, st.y + 78);
      context.quadraticCurveTo(st.x + 120, st.y + 70, st.x + 78, st.y + 78);
      context.fill();
    }
    // Wok bowl.
    context.fillStyle = '#23262e';
    ctxEllipse(st.x + 120, st.y + 48, 86, 22);
    context.fillStyle = '#4a4f5c';
    ctxEllipse(st.x + 120, st.y + 46, 78, 19);
    context.fillStyle = '#2c2f38';
    ctxEllipse(st.x + 120, st.y + 44, 70, 15);
    // Contents.
    wok.contents.forEach((id, index) => {
      drawIngredientIcon(context, id, st.x + 62 + index * 30, st.y + 44, 24);
    });
  }

  function ctxEllipse(x, y, rx, ry) {
    context.beginPath();
    context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    context.fill();
  }

  function drawDispenser(state) {
    const st = STATIONS.dispenser;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.fillStyle = '#7fb3d5';
    context.fill();
    context.strokeStyle = '#4a7ba6';
    context.lineWidth = 2;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.stroke();
    text(st.label, st.x + 10, st.y + 18, 12, '#123a56', 'left', 800);
    drawIngredientIcon(context, 'teh', st.x + 30, st.y + 52, 34);
    drawIngredientIcon(context, 'es', st.x + 72, st.y + 52, 26);
    if (state.dispenser.pouring) {
      bar(st.x + 96, st.y + 46, 34, 12, state.dispenser.progress, '#ffc93c');
    } else {
      text('Klik untuk tuang', st.x + st.w / 2, st.y + 82, 10, '#123a56', 'center', 600);
    }
  }

  function drawPiring(state) {
    const st = STATIONS.piring;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.fillStyle = PALETTE.woodTop;
    context.fill();
    context.strokeStyle = PALETTE.woodEdge;
    context.lineWidth = 2;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.stroke();
    text(st.label, st.x + 10, st.y + 18, 12, '#fff8ea', 'left', 800);
    state.plates.forEach((plate, index) => {
      const cx = st.x + 52 + index * 96;
      const cy = st.y + 56;
      context.fillStyle = 'rgba(0,0,0,0.12)';
      circle(context, cx, cy + 4, 30);
      context.fill();
      if (plate) {
        drawPlateIcon(context, plate.dishId, plate.kerupuk, cx, cy, 52);
        text(DISHES[plate.dishId].short, cx, st.y + 86, 10, '#fff8ea', 'center', 700);
      } else {
        context.strokeStyle = 'rgba(255,255,255,0.5)';
        context.setLineDash([4, 4]);
        circle(context, cx, cy, 26);
        context.stroke();
        context.setLineDash([]);
      }
    });
  }

  function drawSaji(state) {
    const st = STATIONS.saji;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.fillStyle = '#b0713e';
    context.fill();
    context.strokeStyle = PALETTE.woodEdge;
    context.lineWidth = 2;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.stroke();
    text(st.label, st.x + 10, st.y + 18, 12, '#fff8ea', 'left', 800);
    // Service bell.
    context.fillStyle = '#f2c94c';
    context.beginPath();
    context.arc(st.x + st.w - 34, st.y + 46, 14, Math.PI, 0);
    context.fill();
    context.fillRect(st.x + st.w - 48, st.y + 46, 28, 4);
    state.serveSlots.forEach((slot, index) => {
      const cx = st.x + 90 + index * 130;
      const cy = st.y + 56;
      if (slot.item) {
        if (slot.item.kind === 'drink') drawIngredientIcon(context, 'teh', cx, cy, 40);
        else drawPlateIcon(context, slot.item.dishId, slot.item.kerupuk, cx, cy, 52);
        context.strokeStyle = '#2e7d32';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(cx - 8, cy + 2);
        context.lineTo(cx - 2, cy + 8);
        context.lineTo(cx + 10, cy - 8);
        context.stroke();
      } else {
        context.strokeStyle = 'rgba(255,255,255,0.5)';
        context.setLineDash([4, 4]);
        circle(context, cx, cy, 26);
        context.stroke();
        context.setLineDash([]);
      }
    });
    text('Sajikan piring yang cocok dengan pesanan', st.x + 10, st.y + 86, 11, '#ffe9c4', 'left', 600);
  }

  function drawTrash() {
    const st = STATIONS.trash;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.fillStyle = '#4a4f5c';
    context.fill();
    context.strokeStyle = '#2c2f38';
    context.lineWidth = 2;
    roundRect(context, st.x, st.y, st.w, st.h, 8);
    context.stroke();
    text(st.label, st.x + st.w / 2, st.y + 26, 12, '#eef1f5', 'center', 800);
    text('Buang bahan', st.x + st.w / 2, st.y + 48, 10, '#b9c0cc', 'center', 600);
    text('(Q)', st.x + st.w / 2, st.y + 66, 10, '#b9c0cc', 'center', 600);
  }

  function drawCook(state) {
    const cook = state.cook;
    context.fillStyle = 'rgba(0,0,0,0.18)';
    ctxEllipse(cook.x, cook.y + 20, 24, 7);
    // Body: apron over shirt.
    context.fillStyle = PALETTE.cookShirt;
    roundRect(context, cook.x - 20, cook.y - 6, 40, 26, 10);
    context.fill();
    context.fillStyle = PALETTE.cookApron;
    roundRect(context, cook.x - 14, cook.y - 2, 28, 22, 8);
    context.fill();
    // Head + hat.
    context.fillStyle = PALETTE.cookSkin;
    circle(context, cook.x, cook.y - 20, 15);
    context.fill();
    context.fillStyle = PALETTE.cookHat;
    roundRect(context, cook.x - 17, cook.y - 40, 34, 14, 7);
    context.fill();
    circle(context, cook.x - 10, cook.y - 40, 8);
    context.fill();
    circle(context, cook.x + 10, cook.y - 40, 8);
    context.fill();
    circle(context, cook.x, cook.y - 44, 9);
    context.fill();
    // Face.
    context.fillStyle = '#2b2118';
    circle(context, cook.x - 5 * cook.face, cook.y - 22, 1.8);
    context.fill();
    circle(context, cook.x + 5 * cook.face, cook.y - 22, 1.8);
    context.fill();
    context.strokeStyle = '#2b2118';
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(cook.x + 2 * cook.face, cook.y - 15, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    context.stroke();
    // Hands: carried items above the cook.
    state.hands.forEach((item, index) => {
      const hx = cook.x - 34 + index * 34;
      const hy = cook.y - 62;
      context.fillStyle = 'rgba(255,248,234,0.9)';
      circle(context, hx, hy, 15);
      context.fill();
      context.strokeStyle = '#d9a05b';
      context.lineWidth = 1.5;
      circle(context, hx, hy, 15);
      context.stroke();
      if (!item) return;
      if (item.kind === 'ing' || item.kind === 'chopped') drawIngredientIcon(context, item.id, hx, hy, 22);
      else if (item.kind === 'cooked') drawPlateIcon(context, item.dishId, false, hx, hy, 26);
      else if (item.kind === 'plate') drawPlateIcon(context, item.dishId, item.kerupuk, hx, hy, 26);
      else if (item.kind === 'drink') drawIngredientIcon(context, 'teh', hx, hy, 24);
    });
    if (state.cook.busy > 0) {
      text('...', cook.x, cook.y - 78, 14, PALETTE.ink, 'center', 800);
    }
  }

  function drawParticles(state) {
    for (const particle of state.particles) {
      context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      context.fillStyle = particle.color;
      circle(context, particle.x, particle.y, particle.size);
      context.fill();
    }
    context.globalAlpha = 1;
    for (const float of state.floats) {
      context.globalAlpha = Math.max(0, Math.min(1, float.life));
      shadowText(float.text, float.x, float.y, 20, float.color, 'center');
    }
    context.globalAlpha = 1;
    if (state.flash > 0) {
      context.fillStyle = `rgba(192,57,43,${state.flash * 0.35})`;
      context.fillRect(0, 0, VIEW.width, VIEW.height);
    }
  }

  function formatClock(seconds) {
    const total = Math.max(0, Math.ceil(seconds));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function drawHUD(state, muted) {
    context.fillStyle = '#2b2118';
    context.fillRect(0, 0, VIEW.width, 56);
    text('WARUNG NASI GORENG', 16, 24, 20, '#ffc93c', 'left', 800);
    text('RUSH HOUR', 16, 44, 11, '#f7e8c9', 'left', 700);
    text(dayLabel(state.day) + '/3', 330, 34, 16, '#fdfdfd', 'left', 800);
    text(`Pesanan ${state.servedToday}/${state.quota}`, 440, 34, 14, '#fdfdfd', 'left', 700);
    const params = state.timeLeft;
    bar(580, 18, 150, 12, params / 180, params < 30 ? '#c0392b' : '#ffc93c');
    text(formatClock(params), 655, 48, 14, '#fdfdfd', 'center', 700);
    text(coinsLabel(state.coins), 770, 34, 18, '#f2c94c', 'left', 800);
    if (state.combo > 1) {
      text(`COMBO x${(1 + Math.min(state.combo - 1, 10) * 0.1).toFixed(1)}`, 950, 34, 15, '#ff9a2a', 'left', 800);
    }
    // Fails: three chillies, filled red as orders fail.
    for (let i = 0; i < 3; i += 1) {
      const fx = 1060 + i * 26;
      drawIngredientIcon(context, 'cabai', fx, 28, 20);
      if (i < state.failsToday) {
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(fx - 8, 20);
        context.lineTo(fx + 8, 36);
        context.moveTo(fx + 8, 20);
        context.lineTo(fx - 8, 36);
        context.stroke();
      } else {
        context.globalAlpha = 0.35;
        drawIngredientIcon(context, 'cabai', fx, 28, 20);
        context.globalAlpha = 1;
      }
    }
    // Mute + pause buttons.
    for (const [key, rect] of Object.entries(HUD_BUTTONS)) {
      roundRect(context, rect.x, rect.y, rect.w, rect.h, 8);
      context.fillStyle = '#4a4f5c';
      context.fill();
      context.strokeStyle = '#8b93a3';
      context.lineWidth = 1.5;
      roundRect(context, rect.x, rect.y, rect.w, rect.h, 8);
      context.stroke();
    }
    text(muted ? 'BISU' : 'SUARA', HUD_BUTTONS.mute.x + 26, HUD_BUTTONS.mute.y + 24, 11, '#eef1f5', 'center', 800);
    text('JEDA', HUD_BUTTONS.pause.x + 26, HUD_BUTTONS.pause.y + 24, 11, '#eef1f5', 'center', 800);
  }

  function panel(title, lines, prompt, accent) {
    context.fillStyle = 'rgba(20,12,6,0.55)';
    context.fillRect(0, 0, VIEW.width, VIEW.height);
    const width = 640;
    const height = 150 + lines.length * 30;
    const x = (VIEW.width - width) / 2;
    const y = (VIEW.height - height) / 2;
    roundRect(context, x, y, width, height, 14);
    context.fillStyle = '#fff8ea';
    context.fill();
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 3;
    roundRect(context, x, y, width, height, 14);
    context.stroke();
    text(title, VIEW.width / 2, y + 52, 34, accent, 'center', 800);
    lines.forEach((line, index) => {
      text(line, VIEW.width / 2, y + 96 + index * 30, 16, PALETTE.ink, 'center', 600);
    });
    // The prompt is always shown: the overlay screens freeze the world, so a
    // time-based blink could freeze it invisible in a screenshot.
    text(prompt, VIEW.width / 2, y + height - 24, 15, PALETTE.ticketRed, 'center', 800);
  }

  function draw(state, screen, best, muted) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#1a120a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawFloor(state);
    drawBoard(state);
    drawBins();
    drawTalenan(state);
    drawWajan(state);
    drawDispenser(state);
    drawPiring(state);
    drawSaji(state);
    drawTrash();
    drawCook(state);
    drawParticles(state);
    drawHUD(state, muted);
    text('Klik: jalan & pakai  •  WASD: gerak  •  Spasi/E: pakai  •  Q: buang  •  P: jeda  •  M: suara', 640, 714, 12, '#8a7a5a', 'center', 600);
    if (screen === SCREEN_TITLE) {
      panel(
        'WARUNG NASI GORENG',
        ['RUSH HOUR — masak pesanan secepatnya, jangan sampai pelanggan pergi!', 'Ambil bahan, cincang, masak di wajan, sajikan di meja saji.', '3 hari. 3 pesanan gagal dalam sehari dan warung tutup.'],
        'KLIK ATAU SPASI UNTUK MULAI',
        '#c0392b',
      );
      text(`Skor terbaik: Rp${best.toLocaleString('id-ID')}`, 640, 500, 15, '#7a5a3a', 'center', 700);
    } else if (screen === SCREEN_PAUSED) {
      panel('JEDA', ['Warung sedang istirahat sejenak.'], 'SPASI / P UNTUK LANJUT', '#2b2118');
    } else if (screen === SCREEN_DAYCLEAR) {
      panel(
        `HARI ${state.day} SELESAI!`,
        [`Pesanan tersaji: ${state.servedToday}/${state.quota}`, `Bonus sisa waktu: Rp${state.dayBonus.toLocaleString('id-ID')}`, `Total koin: Rp${state.coins.toLocaleString('id-ID')}`],
        'KLIK UNTUK LANJUT KE HARI BERIKUTNYA',
        '#2e7d32',
      );
    } else if (screen === SCREEN_OVER) {
      const reason = state.overReason === 'time' ? 'Waktu shift habis sebelum kuota terpenuhi.' : 'Terlalu banyak pesanan gagal.';
      panel(
        'WARUNG TUTUP!',
        [reason, `Pesanan tersaji: ${state.served}`, `Pesanan gagal: ${state.failed}`, `Koin: Rp${state.coins.toLocaleString('id-ID')}  •  Terbaik: Rp${best.toLocaleString('id-ID')}`],
        'TEKAN R / KLIK UNTUK MAIN LAGI',
        '#c0392b',
      );
    } else if (screen === SCREEN_WIN) {
      panel(
        'JUARA WARUNG!',
        ['Tiga hari penuh terlewati, semua pelanggan pulang kenyang.', `Pesanan tersaji: ${state.served}`, `Pesanan gagal: ${state.failed}`, `Koin: Rp${state.coins.toLocaleString('id-ID')}  •  Terbaik: Rp${best.toLocaleString('id-ID')}`],
        'TEKAN R / KLIK UNTUK MAIN LAGI',
        '#2e7d32',
      );
    }
  }

  return { draw, view };
}
