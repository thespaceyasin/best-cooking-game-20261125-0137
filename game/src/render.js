// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the
// backdrop colour. Every ingredient, dish, prop and station is drawn with canvas paths:
// no image files, no network.
import { BOARD, BURN_GRACE, CHOPS_NEEDED, DISHES, INGREDIENTS, PALETTE, STATIONS, VIEW } from './config.js';
import { drawCustomerCounter } from './customers.js';
import { drawIngredientIcon, drawKecapSplash, drawPlateIcon, drawPlateSteam, drawWokCookingDish } from './foodArt.js';
import {
  drawAmbientLighting,
  drawCounterConnectors,
  drawForegroundProps,
  drawKitchenMat,
  drawNightBackdrop,
  drawStationShadows,
  drawWallProps,
  drawWarmFloor,
  drawWarungAwning,
} from './kitchenArt.js';
import { drawOverlayModal, drawTitleScreen } from './signboard.js';

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

function drawFourPointStar(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.2, y - r * 0.2, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.2, y + r * 0.2, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.2, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.2, y - r * 0.2, x, y - r);
  ctx.closePath();
  ctx.fill();
}

function drawStationBevel(ctx, x, y, w, h, r, frontColor = '#3f2010') {
  roundRect(ctx, x, y + 4, w, h, r);
  ctx.fillStyle = frontColor;
  ctx.fill();
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
    const key = `800|${size}`;
    if (!fonts.has(key)) fonts.set(key, `800 ${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.lineWidth = 4;
    context.strokeStyle = 'rgba(26, 16, 10, 0.85)';
    context.strokeText(value, x, y);
    context.fillStyle = color;
    context.fillText(value, x, y);
  }

  function bar(x, y, w, h, frac, fill, back = 'rgba(35, 23, 17, 0.22)') {
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
    if (frac > 0.5) return PALETTE.greenLight;
    if (frac > 0.25) return '#e69b24';
    return PALETTE.red;
  }

  function ctxEllipse(x, y, rx, ry) {
    context.beginPath();
    context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    context.fill();
  }

  function ticketIcons(ticket) {
    const dish = DISHES[ticket.dishId];
    const ids = dish.drink ? ['teh', 'es'] : dish.wok.map(baseId);
    if (ticket.extraKerupuk) ids.push('kerupuk');
    return ids;
  }

  function drawBoard(state) {
    roundRect(context, BOARD.x, BOARD.y + 3, BOARD.width, BOARD.height, 10);
    context.fillStyle = 'rgba(35, 23, 17, 0.16)';
    context.fill();

    roundRect(context, BOARD.x, BOARD.y, BOARD.width, BOARD.height, 10);
    context.fillStyle = PALETTE.panel;
    context.fill();
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 2.5;
    context.stroke();

    // Header pill tab for PAPAN PESANAN.
    roundRect(context, BOARD.x + 12, BOARD.y + 5, 132, 18, 5);
    context.fillStyle = PALETTE.wood;
    context.fill();
    text('PAPAN PESANAN', BOARD.x + 78, BOARD.y + 18, 11, PALETTE.goldBright, 'center', 800);

    const slotW = (BOARD.width - 28 - (BOARD.slots - 1) * BOARD.gap) / BOARD.slots;
    for (let i = 0; i < BOARD.slots; i += 1) {
      const x = BOARD.x + 14 + i * (slotW + BOARD.gap);
      const y = BOARD.y + 27;
      const ticket = state.tickets[i];

      roundRect(context, x, y, slotW, 56, 7);
      context.fillStyle = ticket ? PALETTE.paper : 'rgba(111, 69, 37, 0.08)';
      context.fill();
      context.strokeStyle = ticket ? '#d4be96' : 'rgba(111, 69, 37, 0.14)';
      context.lineWidth = 1.5;
      context.stroke();
      if (!ticket) continue;

      const dish = DISHES[ticket.dishId];
      const frac = Math.max(0, ticket.patience / ticket.patienceMax);
      const flashing = frac < 0.25 && Math.sin(state.time * 10) > 0;
      const wok = state.wok;
      const wokMatches =
        !dish.drink && wok.contents.length > 0 && wok.contents.every((item) => dish.wok.includes(item));

      if (wokMatches) {
        context.strokeStyle = PALETTE.greenLight;
        context.lineWidth = 3;
        roundRect(context, x, y, slotW, 56, 7);
        context.stroke();
      } else if (frac < 0.25) {
        context.strokeStyle = flashing ? PALETTE.red : 'rgba(200, 75, 49, 0.55)';
        context.lineWidth = 2.5;
        roundRect(context, x, y, slotW, 56, 7);
        context.stroke();
      }

      // Small terracotta clip pin at top center of each ticket.
      roundRect(context, x + slotW / 2 - 14, y - 3, 28, 6, 3);
      context.fillStyle = wokMatches ? PALETTE.greenLight : PALETTE.terracotta;
      context.fill();

      if (frac < 0.25) {
        circle(context, x + slotW - 14, y + 34, 8);
        context.fillStyle = PALETTE.red;
        context.fill();
        text('!', x + slotW - 14, y + 38, 11, '#ffffff', 'center', 900);
      }

      text(dish.short, x + 10, y + 18, 14, flashing ? PALETTE.red : PALETTE.ink, 'left', 800);
      text(`Rp${ticket.price.toLocaleString('id-ID')}`, x + slotW - 10, y + 18, 12, PALETTE.wood, 'right', 700);

      const icons = ticketIcons(ticket);
      icons.forEach((id, index) => {
        const ix = x + 22 + index * 27;
        const iy = y + 35;
        drawIngredientIcon(context, id, ix, iy, 20);
        const inWok = !dish.drink && wok.contents.includes(id) && dish.wok.includes(id);
        const inWokChopped = !dish.drink && wok.contents.includes(`${id}_c`) && dish.wok.includes(`${id}_c`);
        const onPlate = state.plates.some((plate) => plate && plate.dishId === ticket.dishId && (id !== 'kerupuk' || plate.kerupuk));
        if (inWok || inWokChopped || onPlate || (dish.drink && state.hands.some((h) => h && h.kind === 'drink'))) {
          circle(context, ix + 6, iy + 5, 6);
          context.fillStyle = PALETTE.greenLight;
          context.fill();
          context.strokeStyle = '#ffffff';
          context.lineWidth = 1.8;
          context.beginPath();
          context.moveTo(ix + 3, iy + 5);
          context.lineTo(ix + 5.5, iy + 7.5);
          context.lineTo(ix + 9, iy + 2.5);
          context.stroke();
        }
      });

      bar(x + 8, y + 47, slotW - 16, 6, frac, patienceColor(frac));
    }
  }

  function drawActiveHighlight(st, state, radius = 10) {
    if (!st.stand) return;
    if (Math.hypot(state.cook.x - st.stand.x, state.cook.y - st.stand.y) > 50) return;
    context.save();
    roundRect(context, st.x - 3, st.y - 3, st.w + 6, st.h + 6, radius + 2);
    context.strokeStyle = 'rgba(255, 216, 107, 0.85)';
    context.lineWidth = 2.5;
    context.stroke();
    context.restore();
  }

  function drawBins() {
    // Cohesive dark-teak prep bench backing behind the 8 ingredient bins.
    drawStationBevel(context, 14, 162, 452, 100, 10);
    roundRect(context, 14, 162, 452, 100, 10);
    context.fillStyle = '#4f2b17';
    context.fill();
    context.strokeStyle = PALETTE.woodEdge;
    context.lineWidth = 2;
    context.stroke();

    // Section badge pill neatly aligned above the bench.
    roundRect(context, 20, 154, 58, 15, 4);
    context.fillStyle = PALETTE.terracotta;
    context.fill();
    text('BAHAN', 49, 165, 10, '#fff9ec', 'center', 800);

    for (const bin of STATIONS.bins) {
      drawStationBevel(context, bin.x, bin.y, bin.w, bin.h, 8, '#3d2010');
      roundRect(context, bin.x, bin.y, bin.w, bin.h, 8);
      context.fillStyle = PALETTE.woodTop;
      context.fill();
      context.strokeStyle = PALETTE.woodEdge;
      context.lineWidth = 2;
      context.stroke();

      // Warm top inner highlight.
      context.fillStyle = 'rgba(255, 240, 210, 0.2)';
      context.fillRect(bin.x + 4, bin.y + 2, bin.w - 8, 2.5);

      // Ceramic bowl recess behind ingredient icon.
      circle(context, bin.x + 21, bin.y + bin.h / 2, 15);
      context.fillStyle = '#532d18';
      context.fill();
      context.strokeStyle = '#c88b4b';
      context.lineWidth = 1;
      context.stroke();

      drawIngredientIcon(context, bin.id, bin.x + 21, bin.y + bin.h / 2, 24);
      text(INGREDIENTS[bin.id].name, bin.x + 40, bin.y + 19, 12, '#fff9ec', 'left', 800);
      if (INGREDIENTS[bin.id].chop) {
        text('cincang dulu', bin.x + 40, bin.y + 33, 9, PALETTE.goldBright, 'left', 700);
      } else {
        text('siap pakai', bin.x + 40, bin.y + 33, 9, '#e7caa0', 'left', 600);
      }
    }
  }

  function drawTalenan(state) {
    const st = STATIONS.talenan;
    // Outer teak counter frame with 2.5D front thickness.
    drawStationBevel(context, st.x, st.y, st.w, st.h, 9);
    roundRect(context, st.x, st.y, st.w, st.h, 9);
    context.fillStyle = PALETTE.wood;
    context.fill();
    context.strokeStyle = PALETTE.woodEdge;
    context.lineWidth = 2.5;
    context.stroke();
    drawActiveHighlight(st, state, 9);

    // Inner light-maple butcher block cutting surface.
    roundRect(context, st.x + 6, st.y + 22, st.w - 12, st.h - 28, 6);
    context.fillStyle = '#e5be8a';
    context.fill();
    context.strokeStyle = '#b48049';
    context.lineWidth = 1.5;
    context.stroke();

    // Subtle knife score marks on empty/active board.
    context.strokeStyle = 'rgba(130, 82, 38, 0.22)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(st.x + 24, st.y + 42);
    context.lineTo(st.x + 58, st.y + 66);
    context.moveTo(st.x + 34, st.y + 38);
    context.lineTo(st.x + 66, st.y + 62);
    context.stroke();

    // Resting chef knife silhouette on far right edge when idle.
    const board = state.board;
    if (!board.item) {
      context.fillStyle = '#d8dee8';
      context.fillRect(st.x + st.w - 42, st.y + 30, 24, 9);
      context.fillStyle = '#3b2318';
      context.fillRect(st.x + st.w - 19, st.y + 32, 10, 5);
    }

    // Header badge.
    text(st.label, st.x + 10, st.y + 16, 12, PALETTE.goldBright, 'left', 800);

    // Thud flash impact ring + diagonal blade slash when chopping.
    if (state.talenanFlash > 0) {
      context.save();
      context.globalAlpha = state.talenanFlash * 0.75;
      circle(context, st.x + 44, st.y + 54, 24 + (1 - state.talenanFlash) * 10);
      context.strokeStyle = '#fff9e6';
      context.lineWidth = 3;
      context.stroke();
      context.beginPath();
      context.moveTo(st.x + 26, st.y + 36);
      context.lineTo(st.x + 62, st.y + 72);
      context.stroke();
      context.restore();
    }

    if (board.item) {
      drawIngredientIcon(context, board.item.id, st.x + 44, st.y + 54, 38);
      if (board.item.kind === 'ing') {
        bar(st.x + 88, st.y + 39, 98, 12, board.chops / CHOPS_NEEDED, PALETTE.terracotta, 'rgba(35, 23, 17, 0.25)');
        text(`CINCANG ${board.chops}/${CHOPS_NEEDED}`, st.x + 137, st.y + 70, 12, PALETTE.ink, 'center', 800);
      } else {
        roundRect(context, st.x + 86, st.y + 40, 100, 28, 7);
        context.fillStyle = PALETTE.green;
        context.fill();
        context.strokeStyle = '#fff8ea';
        context.lineWidth = 1.5;
        context.stroke();
        text('SIAP MASAK', st.x + 136, st.y + 59, 12, '#fffdf7', 'center', 800);
      }
    } else {
      text('Cincang ayam,', st.x + 14, st.y + 50, 11, PALETTE.woodEdge, 'left', 700);
      text('cabai & bawang', st.x + 14, st.y + 66, 11, PALETTE.woodEdge, 'left', 700);
    }
  }

  function drawWajan(state) {
    const st = STATIONS.wajan;
    const wok = state.wok;

    // Full cast-iron and warm-espresso 2.5D stove hearth panel.
    drawStationBevel(context, st.x, st.y, st.w, st.h, 10, '#18120e');
    roundRect(context, st.x, st.y, st.w, st.h, 10);
    context.fillStyle = '#2d241f';
    context.fill();
    context.strokeStyle = '#7a4424';
    context.lineWidth = 2.5;
    context.stroke();
    drawActiveHighlight(st, state, 10);

    // Dark top status strip.
    roundRect(context, st.x + 3, st.y + 3, st.w - 6, 24, 7);
    context.fillStyle = '#1b130f';
    context.fill();

    text(st.label, st.x + 12, st.y + 20, 12, PALETTE.goldBright, 'left', 800);

    // High-contrast status pill at top right of wajan.
    let statusText = '';
    let pillBg = '';
    let pillFg = '#ffffff';
    if (wok.cooking) {
      statusText = 'MEMASAK...';
      pillBg = PALETTE.terracotta;
      pillFg = '#fff8e6';
    } else if (wok.ready) {
      const blink = Math.sin(state.time * 8) > 0;
      statusText = 'ANGKAT!';
      pillBg = blink ? PALETTE.greenLight : PALETTE.gold;
      pillFg = blink ? '#ffffff' : PALETTE.ink;
    } else if (wok.burnt) {
      statusText = 'GOSONG!';
      pillBg = '#a82218';
      pillFg = '#ffffff';
    } else if (wok.invalid) {
      statusText = 'BUKAN RESEP!';
      pillBg = '#a82218';
      pillFg = '#ffffff';
    } else if (wok.contents.length > 0) {
      statusText = 'Tambah bahan';
      pillBg = '#495264';
      pillFg = '#fff8ea';
    }

    if (statusText) {
      const pw = statusText.length > 10 ? 116 : 96;
      const px = st.x + st.w - pw - 6;
      const py = st.y + 5;
      roundRect(context, px, py, pw, 20, 6);
      context.fillStyle = pillBg;
      context.fill();
      text(statusText, px + pw / 2, py + 14, 11, pillFg, 'center', 800);
    }

    // Cast-iron burner grate deck.
    roundRect(context, st.x + 8, st.y + 66, st.w - 16, 15, 5);
    context.fillStyle = PALETTE.steel;
    context.fill();
    context.strokeStyle = PALETTE.steelLight;
    context.lineWidth = 1.2;
    context.stroke();

    // Roaring wok-hei flames + blue gas inner core while cooking/ready.
    const flick = Math.sin(state.time * 12) * 3.5 + Math.sin(state.time * 25) * 2;
    if (wok.cooking || wok.ready) {
      // Side wok-hei licks curling dramatically around the rim.
      context.fillStyle = 'rgba(255, 134, 24, 0.88)';
      context.beginPath();
      context.moveTo(st.x + 34, st.y + 52);
      context.quadraticCurveTo(st.x + 17, st.y + 30 + flick * 0.6, st.x + 42, st.y + 27 + flick * 0.4);
      context.quadraticCurveTo(st.x + 38, st.y + 44, st.x + 48, st.y + 52);
      context.fill();

      context.beginPath();
      context.moveTo(st.x + 190, st.y + 52);
      context.quadraticCurveTo(st.x + 207, st.y + 30 - flick * 0.6, st.x + 182, st.y + 27 - flick * 0.4);
      context.quadraticCurveTo(st.x + 186, st.y + 44, st.x + 176, st.y + 52);
      context.fill();

      context.fillStyle = PALETTE.flame;
      context.beginPath();
      context.moveTo(st.x + 42, st.y + 74);
      context.quadraticCurveTo(st.x + 112, st.y + 32 + flick, st.x + 186, st.y + 74);
      context.quadraticCurveTo(st.x + 112, st.y + 64, st.x + 42, st.y + 74);
      context.fill();
      context.fillStyle = PALETTE.flameHot;
      context.beginPath();
      context.moveTo(st.x + 70, st.y + 74);
      context.quadraticCurveTo(st.x + 112, st.y + 46 + flick, st.x + 154, st.y + 74);
      context.quadraticCurveTo(st.x + 112, st.y + 66, st.x + 70, st.y + 74);
      context.fill();

      // Blue-hot gas burner core.
      context.fillStyle = 'rgba(116, 208, 255, 0.72)';
      context.beginPath();
      context.moveTo(st.x + 90, st.y + 74);
      context.quadraticCurveTo(st.x + 112, st.y + 58 + flick * 0.4, st.x + 134, st.y + 74);
      context.fill();
    }

    // Wooden wok handle extending right-down.
    context.save();
    context.strokeStyle = '#9a5b32';
    context.lineWidth = 8;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(st.x + 182, st.y + 50);
    context.lineTo(st.x + 214, st.y + 62);
    context.stroke();
    context.restore();

    // Cast-iron wok bowl.
    context.fillStyle = '#1b1e25';
    ctxEllipse(st.x + 112, st.y + 49, 82, 21);
    context.fillStyle = '#474f5e';
    ctxEllipse(st.x + 112, st.y + 47, 76, 18);
    context.fillStyle = wok.burnt ? '#201816' : '#282c36';
    ctxEllipse(st.x + 112, st.y + 45, 68, 14);

    // Rim specular highlight.
    context.strokeStyle = 'rgba(255, 224, 175, 0.42)';
    context.lineWidth = 1.5;
    context.beginPath();
    context.ellipse(st.x + 112, st.y + 45, 69, 14, 0, Math.PI * 1.1, Math.PI * 1.9);
    context.stroke();

    // Contents inside wok: real sizzling stir-fry once cooking/ready/burnt, or raw prepped bits.
    if (wok.cooking || wok.ready || wok.burnt) {
      drawWokCookingDish(context, wok.dishId, wok.progress, state.time, st.x + 112, st.y + 46, wok.burnt);
    } else {
      wok.contents.forEach((id, index) => {
        const ix = st.x + 62 + index * 32;
        const iy = st.y + 45;
        if (id === 'kecap') drawKecapSplash(context, ix, iy, 24);
        else drawIngredientIcon(context, id, ix, iy, 24);
      });
    }

    // Clear 3-zone horizontal Doneness Gauge on the lower stove deck (Masak -> Angkat -> Gosong).
    const gx = st.x + 14;
    const gy = st.y + 84;
    const gw = st.w - 28;
    const gh = 13;
    roundRect(context, gx, gy, gw, gh, 6);
    context.fillStyle = '#14171c';
    context.fill();
    context.strokeStyle = '#5c6678';
    context.lineWidth = 1.2;
    context.stroke();

    // Zone markers: 0..72% cooking orange, 72..90% emerald/gold sweet spot, 90..100% burn red danger.
    const sweetX = gx + gw * 0.72;
    const burnX = gx + gw * 0.90;
    context.fillStyle = 'rgba(47, 143, 89, 0.35)';
    context.fillRect(sweetX, gy + 2, burnX - sweetX, gh - 4);
    context.fillStyle = 'rgba(200, 75, 49, 0.38)';
    context.fillRect(burnX, gy + 2, gx + gw - burnX - 2, gh - 4);

    if (wok.cooking || wok.ready || wok.burnt) {
      let totalFrac = 0;
      let fillCol = PALETTE.flameHot;
      if (wok.burnt) {
        totalFrac = 1;
        fillCol = '#ef4444';
      } else if (wok.ready) {
        const burnFrac = Math.min(1, wok.readyTimer / BURN_GRACE);
        totalFrac = 0.72 + burnFrac * 0.28;
        fillCol = burnFrac > 0.65 ? '#ef4444' : '#34d399';
      } else {
        totalFrac = Math.min(0.72, Math.max(0.08, wok.progress * 0.72));
        fillCol = wok.progress > 0.7 ? PALETTE.flameHot : '#ff9824';
      }
      const fillW = Math.max(8, (gw - 4) * totalFrac);
      roundRect(context, gx + 2, gy + 2, fillW, gh - 4, 4);
      context.fillStyle = fillCol;
      context.fill();

      // Bright pointer tick at exact fill head.
      context.fillStyle = '#ffffff';
      roundRect(context, gx + fillW - 1, gy, 4, gh, 2);
      context.fill();
    }

    // Sweet spot divider lines.
    context.fillStyle = '#fff5d6';
    context.fillRect(sweetX, gy + 1, 1.5, gh - 2);
    context.fillRect(burnX, gy + 1, 1.5, gh - 2);
  }

  function drawDispenser(state) {
    const st = STATIONS.dispenser;
    drawStationBevel(context, st.x, st.y, st.w, st.h, 9, '#16323e');
    roundRect(context, st.x, st.y, st.w, st.h, 9);
    context.fillStyle = '#2d5c6e';
    context.fill();
    context.strokeStyle = '#183744';
    context.lineWidth = 2.5;
    context.stroke();
    drawActiveHighlight(st, state, 9);

    // Top inner frost panel.
    roundRect(context, st.x + 6, st.y + 21, st.w - 12, st.h - 38, 6);
    context.fillStyle = '#8cc5db';
    context.fill();

    text(st.label, st.x + 10, st.y + 16, 12, PALETTE.goldBright, 'left', 800);

    // Glass iced-tea urn barrel with steel lid, spigot, & ice cubes.
    roundRect(context, st.x + 16, st.y + 27, 36, 33, 5);
    context.fillStyle = '#a85212';
    context.fill();
    context.strokeStyle = '#fff6e4';
    context.lineWidth = 1.5;
    context.stroke();
    // Lid & tea level highlight.
    roundRect(context, st.x + 19, st.y + 23, 30, 6, 3);
    context.fillStyle = '#3c4554';
    context.fill();
    context.fillStyle = 'rgba(255, 232, 180, 0.32)';
    context.fillRect(st.x + 19, st.y + 30, 30, 7);
    context.fillStyle = 'rgba(220, 246, 255, 0.65)';
    context.fillRect(st.x + 21, st.y + 42, 7, 7);
    context.fillRect(st.x + 38, st.y + 40, 7, 7);
    // Brass spigot tap.
    context.fillStyle = PALETTE.gold;
    context.fillRect(st.x + 52, st.y + 44, 12, 4);
    context.fillRect(st.x + 60, st.y + 44, 4, 8);

    // Tall frosted glass ready beneath tap.
    drawIngredientIcon(context, 'teh', st.x + 92, st.y + 46, 36);

    if (state.dispenser.pouring) {
      bar(st.x + 114, st.y + 36, 16, 24, state.dispenser.progress, PALETTE.goldBright, 'rgba(20, 40, 50, 0.35)');
      text('Menuang...', st.x + st.w / 2, st.y + 82, 10, '#fff8ea', 'center', 700);
    } else {
      text('Klik untuk tuang', st.x + st.w / 2, st.y + 82, 10, '#fff8ea', 'center', 700);
    }
  }

  function drawPiring(state) {
    const st = STATIONS.piring;
    drawStationBevel(context, st.x, st.y, st.w, st.h, 9);
    roundRect(context, st.x, st.y, st.w, st.h, 9);
    context.fillStyle = PALETTE.woodTop;
    context.fill();
    context.strokeStyle = PALETTE.woodEdge;
    context.lineWidth = 2.5;
    context.stroke();
    drawActiveHighlight(st, state, 9);

    // Top highlight strip.
    context.fillStyle = 'rgba(255, 240, 210, 0.18)';
    context.fillRect(st.x + 6, st.y + 3, st.w - 12, 3);

    // Header pill tab perched cleanly at top-left edge so enlarged plates never overlap text.
    roundRect(context, st.x + 10, st.y - 6, 56, 15, 4);
    context.fillStyle = '#231711';
    context.fill();
    context.strokeStyle = '#c88b4b';
    context.lineWidth = 1;
    context.stroke();
    text(st.label, st.x + 38, st.y + 5, 10, PALETTE.goldBright, 'center', 800);

    state.plates.forEach((plate, index) => {
      const cx = st.x + 54 + index * 92;
      const cy = st.y + 43;
      context.fillStyle = 'rgba(35, 23, 17, 0.24)';
      circle(context, cx, cy + 3, 28);
      context.fill();

      if (plate) {
        // Warm glow ring under ready plate.
        const glow = context.createRadialGradient(cx, cy, 14, cx, cy, 38);
        glow.addColorStop(0, 'rgba(255, 218, 107, 0.72)');
        glow.addColorStop(1, 'rgba(255, 218, 107, 0)');
        context.fillStyle = glow;
        circle(context, cx, cy, 38);
        context.fill();

        drawPlateIcon(context, plate.dishId, plate.kerupuk, cx, cy, 58);
        drawPlateSteam(context, cx + 6, cy - 22, state.time, 0.9);

        // High-contrast label pill cleanly below the plate.
        const shortName = DISHES[plate.dishId].short;
        const pw = Math.min(88, Math.max(58, shortName.length * 7 + 14));
        roundRect(context, cx - pw / 2, st.y + 73, pw, 16, 5);
        context.fillStyle = '#231711';
        context.fill();
        context.strokeStyle = PALETTE.goldBright;
        context.lineWidth = 1;
        context.stroke();
        text(shortName, cx, st.y + 85, 10, '#fff9ec', 'center', 800);
      } else {
        context.strokeStyle = 'rgba(255, 246, 224, 0.5)';
        context.lineWidth = 1.5;
        context.setLineDash([4, 4]);
        circle(context, cx, cy, 26);
        context.stroke();
        context.setLineDash([]);
      }
    });
  }

  function drawSaji(state) {
    const st = STATIONS.saji;
    drawStationBevel(context, st.x, st.y, st.w, st.h, 9);
    roundRect(context, st.x, st.y, st.w, st.h, 9);
    context.fillStyle = '#9c562c';
    context.fill();
    context.strokeStyle = PALETTE.woodEdge;
    context.lineWidth = 2.5;
    context.stroke();
    drawActiveHighlight(st, state, 9);

    // Terracotta service pass mat strip.
    roundRect(context, st.x + 8, st.y + 16, st.w - 16, st.h - 34, 6);
    context.fillStyle = '#b46b3c';
    context.fill();

    // Header pill tab perched cleanly at top-left edge.
    roundRect(context, st.x + 10, st.y - 6, 80, 15, 4);
    context.fillStyle = '#231711';
    context.fill();
    context.strokeStyle = '#c88b4b';
    context.lineWidth = 1;
    context.stroke();
    text(st.label, st.x + 50, st.y + 5, 10, PALETTE.goldBright, 'center', 800);

    // Polished brass service bell on wooden base.
    const bx = st.x + st.w - 36;
    const by = st.y + 50;
    context.fillStyle = 'rgba(35, 23, 17, 0.25)';
    ctxEllipse(bx, by + 6, 17, 5);
    context.fillStyle = '#3b2318';
    roundRect(context, bx - 16, by + 2, 32, 6, 2);
    context.fill();
    context.fillStyle = PALETTE.gold;
    context.beginPath();
    context.arc(bx, by + 2, 13, Math.PI, 0);
    context.fill();
    context.fillStyle = '#fff2b0';
    circle(context, bx - 4, by - 5, 3);
    context.fill();
    context.fillStyle = '#8b5a2b';
    circle(context, bx, by - 12, 3);
    context.fill();

    state.serveSlots.forEach((slot, index) => {
      const cx = st.x + 90 + index * 130;
      const cy = st.y + 46;
      if (slot.item) {
        if (slot.item.kind === 'drink') drawIngredientIcon(context, 'teh', cx, cy, 48);
        else {
          drawPlateIcon(context, slot.item.dishId, slot.item.kerupuk, cx, cy, 62);
          drawPlateSteam(context, cx, cy - 26, state.time, 0.9);
        }
        circle(context, cx + 22, cy + 14, 10.5);
        context.fillStyle = PALETTE.greenLight;
        context.fill();
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx + 17, cy + 14);
        context.lineTo(cx + 21, cy + 18);
        context.lineTo(cx + 27, cy + 10);
        context.stroke();
      } else {
        context.strokeStyle = 'rgba(255, 246, 224, 0.55)';
        context.lineWidth = 1.5;
        context.setLineDash([4, 4]);
        circle(context, cx, cy, 26);
        context.stroke();
        context.setLineDash([]);
      }
    });

    text('Sajikan piring yang cocok dengan pesanan', st.x + 12, st.y + 86, 11, '#fff2d8', 'left', 700);
  }

  function drawTrash() {
    const st = STATIONS.trash;
    drawStationBevel(context, st.x, st.y, st.w, st.h, 9, '#1b1f26');
    roundRect(context, st.x, st.y, st.w, st.h, 9);
    context.fillStyle = '#363c48';
    context.fill();
    context.strokeStyle = '#1f232b';
    context.lineWidth = 2.5;
    context.stroke();

    // Top pedal-bin lid band.
    roundRect(context, st.x + 4, st.y + 4, st.w - 8, 12, 5);
    context.fillStyle = '#535c6e';
    context.fill();

    text(st.label, st.x + st.w / 2, st.y + 34, 12, '#fff5e4', 'center', 800);
    text('Buang bahan', st.x + st.w / 2, st.y + 52, 10, '#cfd6e4', 'center', 600);
    text('(Q)', st.x + st.w / 2, st.y + 68, 10, PALETTE.goldBright, 'center', 700);
  }

  function drawCook(state) {
    const cook = state.cook;
    const moving = cook.tx !== null && cook.ty !== null;
    const bob = moving ? Math.sin(state.time * 16) * 2 : 0;

    // Ground shadow.
    context.fillStyle = 'rgba(35, 23, 17, 0.24)';
    ctxEllipse(cook.x, cook.y + 21, 24, 8);

    // Body: cream shirt + terracotta warung apron with outline + sleeves & tool.
    context.fillStyle = PALETTE.cookShirt;
    roundRect(context, cook.x - 19, cook.y - 6 + bob, 38, 25, 10);
    context.fill();
    context.strokeStyle = PALETTE.ink;
    context.lineWidth = 1.8;
    context.stroke();

    // Expressive arms/hands and wooden spatula or chopping knife.
    const nearTalenan = Math.hypot(cook.x - STATIONS.talenan.stand.x, cook.y - STATIONS.talenan.stand.y) < 60;
    context.fillStyle = PALETTE.cookSkin;
    circle(context, cook.x - 21, cook.y + 8 + bob, 5);
    context.fill();
    context.stroke();
    circle(context, cook.x + 21, cook.y + 8 + bob, 5);
    context.fill();
    context.stroke();

    if (nearTalenan) {
      // Chef cleaver held in right hand.
      context.save();
      context.translate(cook.x + 22, cook.y + 6 + bob);
      context.rotate(state.talenanFlash > 0 ? -0.9 : -0.4);
      context.fillStyle = '#dce3ec';
      roundRect(context, -2, -16, 10, 14, 2);
      context.fill();
      context.strokeStyle = '#6e7b8b';
      context.lineWidth = 1;
      context.stroke();
      context.fillStyle = '#472512';
      context.fillRect(0, -3, 5, 7);
      context.restore();
    } else {
      // Wooden warung sodet (spatula) in right hand.
      context.save();
      context.translate(cook.x + 22, cook.y + 7 + bob);
      context.rotate(0.45);
      context.fillStyle = '#b97a42';
      context.fillRect(-1.5, -14, 3, 14);
      roundRect(context, -4, -20, 8, 7, 1.5);
      context.fill();
      context.restore();
    }

    context.fillStyle = PALETTE.cookApron;
    roundRect(context, cook.x - 13, cook.y - 1 + bob, 26, 20, 7);
    context.fill();

    // Red neckerchief & apron pocket accent.
    context.fillStyle = '#ffd447';
    context.beginPath();
    context.moveTo(cook.x - 7, cook.y - 5 + bob);
    context.lineTo(cook.x, cook.y + 3 + bob);
    context.lineTo(cook.x + 7, cook.y - 5 + bob);
    context.closePath();
    context.fill();
    context.fillStyle = '#9a311c';
    roundRect(context, cook.x - 7, cook.y + 8 + bob, 14, 7, 2);
    context.fill();

    // Head + pleated chef toque (compact height so it never clips TALENAN items).
    context.fillStyle = PALETTE.cookSkin;
    circle(context, cook.x, cook.y - 18 + bob, 14);
    context.fill();
    context.strokeStyle = PALETTE.ink;
    context.lineWidth = 1.5;
    context.stroke();

    // Chef hat band & puff.
    context.fillStyle = PALETTE.cookHat;
    roundRect(context, cook.x - 15, cook.y - 34 + bob, 30, 11, 5);
    context.fill();
    context.strokeStyle = '#c8b493';
    context.lineWidth = 1.2;
    context.stroke();
    circle(context, cook.x - 8, cook.y - 35 + bob, 6.5);
    context.fill();
    circle(context, cook.x + 8, cook.y - 35 + bob, 6.5);
    context.fill();
    circle(context, cook.x, cook.y - 38 + bob, 7.5);
    context.fill();

    // Rosy cheeks + eyes with catchlights + smile.
    context.fillStyle = 'rgba(217, 91, 67, 0.35)';
    circle(context, cook.x - 8, cook.y - 15 + bob, 2.8);
    context.fill();
    circle(context, cook.x + 8, cook.y - 15 + bob, 2.8);
    context.fill();

    context.fillStyle = PALETTE.ink;
    circle(context, cook.x - 4.5 + cook.face * 1.5, cook.y - 20 + bob, 2.0);
    context.fill();
    circle(context, cook.x + 4.5 + cook.face * 1.5, cook.y - 20 + bob, 2.0);
    context.fill();
    context.fillStyle = '#ffffff';
    circle(context, cook.x - 5.1 + cook.face * 1.5, cook.y - 20.6 + bob, 0.65);
    context.fill();
    circle(context, cook.x + 3.9 + cook.face * 1.5, cook.y - 20.6 + bob, 0.65);
    context.fill();

    context.strokeStyle = PALETTE.ink;
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(cook.x + cook.face * 1.5, cook.y - 14 + bob, 3.8, 0.15 * Math.PI, 0.85 * Math.PI);
    context.stroke();

    // Draw ONLY carried items neatly beside the cook without overlapping counters below.
    const carried = state.hands.filter((item) => item !== null);
    carried.forEach((item, index) => {
      const offsets = [
        [-28, -9],
        [28, -9],
        [0, -54],
      ];
      const [ox, oy] = offsets[index] || [0, -54];
      const hx = cook.x + ox;
      const hy = cook.y + oy + bob;
      context.fillStyle = 'rgba(255, 248, 234, 0.94)';
      circle(context, hx, hy, 14);
      context.fill();
      context.strokeStyle = PALETTE.panelEdge;
      context.lineWidth = 2;
      context.stroke();

      if (item.kind === 'ing' || item.kind === 'chopped') drawIngredientIcon(context, item.id, hx, hy, 20);
      else if (item.kind === 'cooked') drawPlateIcon(context, item.dishId, false, hx, hy, 24);
      else if (item.kind === 'plate') drawPlateIcon(context, item.dishId, item.kerupuk, hx, hy, 24);
      else if (item.kind === 'drink') drawIngredientIcon(context, 'teh', hx, hy, 22);
    });
  }

  function drawHandTray(state) {
    // Clean 3-slot hand inventory tray anchored cleanly between SAMPAH and BLEK KERUPUK.
    const tx = 166;
    const ty = 636;
    const tw = 204;
    const th = 46;
    context.save();
    roundRect(context, tx + 2, ty + 3, tw, th, 10);
    context.fillStyle = 'rgba(20, 11, 6, 0.28)';
    context.fill();

    roundRect(context, tx, ty, tw, th, 10);
    context.fillStyle = '#3b2318';
    context.fill();
    context.strokeStyle = '#c88b4b';
    context.lineWidth = 2;
    context.stroke();

    text('TANGAN', tx + 32, ty + 27, 10, PALETTE.goldBright, 'center', 800);

    state.hands.forEach((item, index) => {
      const sx = tx + 80 + index * 44;
      const sy = ty + 23;
      circle(context, sx, sy, 16);
      context.fillStyle = item ? '#fff8ea' : 'rgba(255, 248, 234, 0.14)';
      context.fill();
      context.strokeStyle = item ? PALETTE.goldBright : 'rgba(255, 216, 107, 0.35)';
      context.lineWidth = 1.5;
      context.stroke();

      if (!item) return;
      if (item.kind === 'ing' || item.kind === 'chopped') drawIngredientIcon(context, item.id, sx, sy, 20);
      else if (item.kind === 'cooked') drawPlateIcon(context, item.dishId, false, sx, sy, 24);
      else if (item.kind === 'plate') drawPlateIcon(context, item.dishId, item.kerupuk, sx, sy, 24);
      else if (item.kind === 'drink') drawIngredientIcon(context, 'teh', sx, sy, 22);
    });
    context.restore();
  }

  function drawParticles(state, showFloats) {
    // Render deterministic visual FX particles (steam, smoke, chop bits, sizzle, sparkle).
    for (const item of state.fx) {
      const alpha = Math.max(0, Math.min(1, item.life / item.maxLife));
      context.save();
      if (item.kind === 'steam') {
        context.globalAlpha = alpha * 0.58;
        context.fillStyle = item.color;
        circle(context, item.x, item.y, item.size);
        context.fill();
      } else if (item.kind === 'smoke') {
        context.globalAlpha = alpha * 0.62;
        context.fillStyle = item.color;
        circle(context, item.x, item.y, item.size);
        context.fill();
      } else if (item.kind === 'sizzle' || item.kind === 'sparkle') {
        context.globalAlpha = alpha;
        context.fillStyle = item.color;
        drawFourPointStar(context, item.x, item.y, item.size);
        context.fillStyle = '#ffffff';
        circle(context, item.x, item.y, item.size * 0.24);
        context.fill();
      } else {
        context.globalAlpha = alpha;
        context.fillStyle = item.color;
        roundRect(context, item.x - item.size / 2, item.y - item.size / 2, item.size, item.size, 1.5);
        context.fill();
        context.strokeStyle = 'rgba(35, 23, 17, 0.55)';
        context.lineWidth = 1;
        context.stroke();
      }
      context.restore();
    }

    for (const particle of state.particles) {
      context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      context.fillStyle = particle.color;
      circle(context, particle.x, particle.y, particle.size);
      context.fill();
    }
    context.globalAlpha = 1;

    if (showFloats) {
      for (const float of state.floats) {
        const denom = float.maxLife || 1.4;
        context.globalAlpha = Math.max(0, Math.min(1, (float.life / denom) * 1.6));
        shadowText(float.text, float.x, float.y, 22, float.color, 'center');
      }
      context.globalAlpha = 1;
    }

    if (state.flash > 0 || state.burnFlash > 0) {
      const a = Math.max(state.flash * 0.3, state.burnFlash * 0.25);
      context.fillStyle = `rgba(200, 50, 35, ${a})`;
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
    context.fillStyle = '#231711';
    context.fillRect(0, 0, VIEW.width, 56);
    context.fillStyle = '#b97e3f';
    context.fillRect(0, 54, VIEW.width, 2);

    text('WARUNG NASI GORENG', 16, 25, 20, PALETTE.goldBright, 'left', 800);
    text('RUSH HOUR', 16, 44, 11, '#f0d8b2', 'left', 700);

    // Day & quota pill with time-of-day icon (sun on Day 1-2, crescent moon on Day 3).
    roundRect(context, 304, 11, 240, 34, 8);
    context.fillStyle = '#382419';
    context.fill();
    context.strokeStyle = '#6d4429';
    context.lineWidth = 1;
    context.stroke();
    if (state.day >= 3) {
      circle(context, 322, 28, 7);
      context.fillStyle = PALETTE.goldBright;
      context.fill();
      circle(context, 325, 26, 6);
      context.fillStyle = '#382419';
      context.fill();
    } else {
      circle(context, 322, 28, 6.5);
      context.fillStyle = state.day === 2 ? '#ff9442' : PALETTE.goldBright;
      context.fill();
    }
    text(dayLabel(state.day) + '/3', 336, 34, 15, '#fff9ec', 'left', 800);
    text(`Pesanan ${state.servedToday}/${state.quota}`, 430, 34, 14, '#f2dfc0', 'left', 700);

    // Shift timer bar & clock.
    const timeLeft = state.timeLeft;
    bar(566, 15, 166, 13, timeLeft / 180, timeLeft < 30 ? PALETTE.red : PALETTE.goldBright, 'rgba(255,255,255,0.14)');
    text(formatClock(timeLeft), 649, 46, 14, '#fff9ec', 'center', 800);

    // Coins badge (star-emblem gold coin + Rp amount).
    circle(context, 768, 28, 11);
    context.fillStyle = PALETTE.gold;
    context.fill();
    context.strokeStyle = '#b47718';
    context.lineWidth = 1.5;
    context.stroke();
    context.fillStyle = '#fff5c4';
    drawFourPointStar(context, 768, 28, 6);
    text(coinsLabel(state.coins), 786, 34, 18, PALETTE.goldBright, 'left', 800);

    if (state.combo > 1) {
      roundRect(context, 906, 11, 134, 34, 9);
      context.fillStyle = PALETTE.terracotta;
      context.fill();
      context.strokeStyle = PALETTE.goldBright;
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = PALETTE.goldBright;
      drawFourPointStar(context, 924, 28, 7);
      text(`COMBO x${state.combo}`, 980, 33, 14, '#fff9ec', 'center', 900);
    }

    // Fails: 3 chilies.
    for (let i = 0; i < 3; i += 1) {
      const fx = 1062 + i * 26;
      if (i < state.failsToday) {
        drawIngredientIcon(context, 'cabai', fx, 28, 22);
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2.5;
        context.beginPath();
        context.moveTo(fx - 7, 21);
        context.lineTo(fx + 7, 35);
        context.moveTo(fx + 7, 21);
        context.lineTo(fx - 7, 35);
        context.stroke();
      } else {
        context.save();
        context.globalAlpha = 0.38;
        drawIngredientIcon(context, 'cabai', fx, 28, 20);
        context.restore();
      }
    }

    // Mute + pause buttons (preserve exact HUD_BUTTONS hitboxes).
    for (const rect of Object.values(HUD_BUTTONS)) {
      roundRect(context, rect.x, rect.y, rect.w, rect.h, 8);
      context.fillStyle = '#3d281c';
      context.fill();
      context.strokeStyle = '#b97e3f';
      context.lineWidth = 1.5;
      context.stroke();
    }
    text(muted ? 'BISU' : 'SUARA', HUD_BUTTONS.mute.x + 26, HUD_BUTTONS.mute.y + 23, 11, '#fff6e4', 'center', 800);
    text('JEDA', HUD_BUTTONS.pause.x + 26, HUD_BUTTONS.pause.y + 23, 11, '#fff6e4', 'center', 800);
  }

  function draw(state, screen, best, muted) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);

    drawWarmFloor(context);
    drawKitchenMat(context);
    drawNightBackdrop(context, state);
    drawWarungAwning(context);
    drawBoard(state);
    drawCounterConnectors(context);
    drawStationShadows(context);
    drawWallProps(context, state);
    drawForegroundProps(context);
    drawBins();
    drawTalenan(state);
    drawWajan(state);
    drawDispenser(state);
    drawPiring(state);
    drawSaji(state);
    drawTrash();
    drawHandTray(state);
    drawCustomerCounter(context, state);
    drawCook(state);
    drawAmbientLighting(context, state);
    drawParticles(state, screen === SCREEN_PLAY);
    drawHUD(state, muted);

    // Subtle dark-teak bottom controls bar.
    roundRect(context, 310, 695, 660, 21, 7);
    context.fillStyle = 'rgba(35, 23, 17, 0.78)';
    context.fill();
    text(
      'Klik: jalan & pakai  |  WASD: gerak  |  Spasi/E: pakai  |  Q: buang  |  P: jeda  |  M: suara',
      640,
      710,
      11,
      '#f6e7cb',
      'center',
      600,
    );

    const displayBest = Math.max(best, state.coins);
    if (screen === SCREEN_TITLE) {
      drawTitleScreen(context, state, best);
    } else if (screen === SCREEN_PAUSED) {
      drawOverlayModal(context, 'JEDA', ['Warung sedang istirahat sejenak.'], 'SPASI / P UNTUK LANJUT', PALETTE.wood);
    } else if (screen === SCREEN_DAYCLEAR) {
      const stars = state.failsToday === 0 ? 3 : state.failsToday === 1 ? 2 : 1;
      drawOverlayModal(
        context,
        `HARI ${state.day} SELESAI!`,
        [`Bonus sisa waktu: Rp${state.dayBonus.toLocaleString('id-ID')}`],
        'KLIK UNTUK LANJUT KE HARI BERIKUTNYA',
        PALETTE.green,
        {
          served: state.servedToday,
          servedLabel: `${state.servedToday}/${state.quota}`,
          failed: state.failsToday,
          coins: state.coins,
          best: displayBest,
          stars,
          stamp: 'SELESAI!',
          stampColor: PALETTE.green,
        },
      );
    } else if (screen === SCREEN_OVER) {
      const reason = state.overReason === 'time' ? 'Waktu shift habis sebelum kuota terpenuhi.' : 'Terlalu banyak pesanan gagal.';
      const stars = state.served >= 6 ? 2 : state.served >= 2 ? 1 : 0;
      drawOverlayModal(
        context,
        'WARUNG TUTUP!',
        [reason],
        'TEKAN R / KLIK UNTUK MAIN LAGI',
        PALETTE.terracotta,
        {
          served: state.served,
          failed: state.failed,
          coins: state.coins,
          best: displayBest,
          stars,
          stamp: 'TUTUP',
          stampColor: PALETTE.terracotta,
        },
      );
    } else if (screen === SCREEN_WIN) {
      const stars = state.failed === 0 ? 3 : state.failed <= 2 ? 2 : 1;
      drawOverlayModal(
        context,
        'JUARA WARUNG!',
        ['Tiga hari penuh terlewati, semua pelanggan pulang kenyang.'],
        'TEKAN R / KLIK UNTUK MAIN LAGI',
        PALETTE.green,
        {
          served: state.served,
          failed: state.failed,
          coins: state.coins,
          best: displayBest,
          stars,
          stamp: 'JUARA!',
          stampColor: PALETTE.green,
        },
      );
    }
  }

  return { draw, view };
}
