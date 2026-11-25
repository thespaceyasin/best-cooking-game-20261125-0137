// Street-front customer counter with seated warung diners whose outfits, expressions,
// speech bubbles, and urgency cues react live to the active order tickets.
import { PALETTE } from './config.js';
import { drawPlateIcon } from './foodArt.js';

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

const CUSTOMER_STYLES = [
  { shirt: '#2b4c7e', accent: '#f4b942', skin: '#e8b384', hair: '#211814', head: 'cap' },
  { shirt: '#b83c2a', accent: '#fff4d8', skin: '#f1c292', hair: '#2b1d16', head: 'hijab' },
  { shirt: '#216b44', accent: '#ffd66b', skin: '#df9f6c', hair: '#1d1613', head: 'peci' },
  { shirt: '#7d4473', accent: '#f7d294', skin: '#efc090', hair: '#302019', head: 'bun' },
  { shirt: '#c97a2b', accent: '#fff6e0', skin: '#e6ae7d', hair: '#1c1512', head: 'part' },
];

function drawSingleCustomer(ctx, ticket, slotIndex, time) {
  const cx = 534 + slotIndex * 160;
  const style = CUSTOMER_STYLES[ticket.id % CUSTOMER_STYLES.length];
  const frac = Math.max(0, Math.min(1, ticket.patience / ticket.patienceMax));
  const urgent = frac < 0.25;
  const bob = Math.sin(time * (urgent ? 8 : 2.6) + slotIndex * 1.3) * (urgent ? 2 : 1.2);
  const cy = 588 + bob;

  ctx.save();

  // Shoulders & shirt seated behind the counter edge.
  ctx.fillStyle = style.shirt;
  roundRect(ctx, cx - 22, cy + 12, 44, 28, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Collar / batik stripe detail.
  ctx.fillStyle = style.accent;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 13);
  ctx.lineTo(cx, cy + 23);
  ctx.lineTo(cx + 8, cy + 13);
  ctx.closePath();
  ctx.fill();

  // Hijab drape behind head if applicable.
  if (style.head === 'hijab') {
    ctx.fillStyle = style.accent;
    roundRect(ctx, cx - 19, cy - 17, 38, 36, 15);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  // Head.
  ctx.fillStyle = urgent ? '#f4a38c' : style.skin;
  circle(ctx, cx, cy, 15);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Hair or headwear.
  if (style.head === 'peci') {
    ctx.fillStyle = '#1d1b1a';
    roundRect(ctx, cx - 13, cy - 20, 26, 11, 4);
    ctx.fill();
    ctx.strokeStyle = PALETTE.goldBright;
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (style.head === 'cap') {
    ctx.fillStyle = style.accent;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 15, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(cx - 15, cy - 5, 22, 3);
  } else if (style.head === 'bun') {
    ctx.fillStyle = style.hair;
    circle(ctx, cx, cy - 17, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 15, Math.PI, 0);
    ctx.fill();
  } else if (style.head === 'part') {
    ctx.fillStyle = style.hair;
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 15, Math.PI * 1.05, -0.05);
    ctx.fill();
  }

  // Eyes and eyebrows reacting to patience.
  ctx.fillStyle = PALETTE.ink;
  circle(ctx, cx - 5, cy - 1, 1.9);
  ctx.fill();
  circle(ctx, cx + 5, cy - 1, 1.9);
  ctx.fill();

  if (urgent) {
    // Furrowed angry brows + open frown + sweat drop.
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 7);
    ctx.lineTo(cx - 2, cy - 4);
    ctx.moveTo(cx + 8, cy - 7);
    ctx.lineTo(cx + 2, cy - 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy + 9, 4.5, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Sweat drop.
    ctx.fillStyle = '#7ad4ff';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 9);
    ctx.quadraticCurveTo(cx - 19, cy - 2, cx - 15, cy - 1);
    ctx.quadraticCurveTo(cx - 11, cy - 2, cx - 15, cy - 9);
    ctx.fill();
  } else if (frac < 0.5) {
    // Impatient flat mouth & raised brow.
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 6);
    ctx.lineTo(cx + 5, cy + 5.5);
    ctx.moveTo(cx - 8, cy - 6);
    ctx.lineTo(cx - 2, cy - 6);
    ctx.moveTo(cx + 2, cy - 7);
    ctx.lineTo(cx + 8, cy - 6);
    ctx.stroke();
  } else {
    // Cheerful smile.
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // Order speech bubble to upper-right of customer.
  const bx = cx + 38;
  const by = cy - 24;
  const br = 20;

  ctx.fillStyle = 'rgba(20, 11, 6, 0.22)';
  circle(ctx, bx + 2, by + 3, br);
  ctx.fill();

  // Speech tail.
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.moveTo(bx - 12, by + 11);
  ctx.lineTo(cx + 12, cy - 3);
  ctx.lineTo(bx - 4, by + 17);
  ctx.closePath();
  ctx.fill();

  circle(ctx, bx, by, br);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.strokeStyle = '#c89b5a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Patience ring arc around speech bubble.
  const ringColor = frac > 0.5 ? PALETTE.greenLight : frac > 0.25 ? '#e69b24' : PALETTE.red;
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(bx, by, br - 1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
  ctx.stroke();

  drawPlateIcon(ctx, ticket.dishId, ticket.extraKerupuk, bx, by, 28);

  // Pulsing urgency exclamation badge.
  if (urgent) {
    const pulse = 0.88 + Math.sin(time * 12) * 0.12;
    ctx.save();
    ctx.translate(cx - 22, cy - 19);
    ctx.scale(pulse, pulse);
    circle(ctx, 0, 0, 10);
    ctx.fillStyle = PALETTE.red;
    ctx.fill();
    ctx.strokeStyle = '#fff9ee';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.font = '900 13px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 1);
    ctx.restore();
  }

  ctx.restore();
}

/** Render the street-front dining bar, 4 wooden stools, seated diners, and serve celebration. */
export function drawCustomerCounter(ctx, state) {
  ctx.save();

  // Four round teak warung stools aligned with ticket slots.
  for (let i = 0; i < 4; i += 1) {
    const sx = 534 + i * 160;
    const sy = 602;
    ctx.fillStyle = 'rgba(35, 23, 17, 0.24)';
    circle(ctx, sx + 2, sy + 4, 19);
    ctx.fill();
    ctx.fillStyle = PALETTE.woodLight;
    circle(ctx, sx, sy, 18);
    ctx.fill();
    ctx.strokeStyle = PALETTE.woodEdge;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(71, 37, 18, 0.35)';
    ctx.lineWidth = 1;
    circle(ctx, sx, sy, 11);
    ctx.stroke();
  }

  // Seated diners behind the bar matching active tickets.
  for (let i = 0; i < Math.min(4, state.tickets.length); i += 1) {
    drawSingleCustomer(ctx, state.tickets[i], i, state.time);
  }

  // Continuous front dining counter overlapping customer waists cleanly.
  const bx = 446;
  const by = 620;
  const bw = 720;
  const bh = 64;

  roundRect(ctx, bx + 4, by + 5, bw, bh, 11);
  ctx.fillStyle = 'rgba(20, 11, 6, 0.28)';
  ctx.fill();

  roundRect(ctx, bx, by, bw, bh, 11);
  ctx.fillStyle = PALETTE.woodTop;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Warm terracotta-and-gold batik table runner across the counter.
  roundRect(ctx, bx + 16, by + 10, bw - 32, bh - 20, 7);
  ctx.fillStyle = PALETTE.terracotta;
  ctx.fill();
  ctx.strokeStyle = PALETTE.goldBright;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 244, 216, 0.55)';
  for (let dx = bx + 44; dx <= bx + bw - 44; dx += 52) {
    ctx.beginPath();
    ctx.moveTo(dx, by + 26);
    ctx.lineTo(dx + 6, by + 32);
    ctx.lineTo(dx, by + 38);
    ctx.lineTo(dx - 6, by + 32);
    ctx.closePath();
    ctx.fill();
  }

  // Condiment caddies placed neatly between seating spots.
  for (const cx of [614, 934]) {
    roundRect(ctx, cx - 22, by + 17, 36, 24, 4);
    ctx.fillStyle = '#fff9ee';
    ctx.fill();
    ctx.strokeStyle = '#c88b4b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#d9cdb8';
    ctx.fillRect(cx - 12, by + 26, 16, 5);

    circle(ctx, cx + 26, by + 29, 8.5);
    ctx.fillStyle = '#a8291b';
    ctx.fill();
    ctx.strokeStyle = '#fff5e0';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    circle(ctx, cx + 44, by + 29, 7.5);
    ctx.fillStyle = '#24140a';
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Celebratory warm glow flash and rising golden stars across the counter when a dish is served.
  if (state.serveGlow > 0) {
    ctx.globalAlpha = Math.min(1, state.serveGlow) * 0.55;
    roundRect(ctx, bx + 4, by + 4, bw - 8, bh - 8, 9);
    ctx.strokeStyle = PALETTE.goldBright;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = PALETTE.goldBright;
    for (let s = 0; s < 3; s += 1) {
      const sx = bx + 110 + s * 240;
      const sy = by - 8 - (1 - state.serveGlow) * 18;
      circle(ctx, sx, sy, 3.5);
      ctx.fill();
    }
  }

  ctx.restore();
}
