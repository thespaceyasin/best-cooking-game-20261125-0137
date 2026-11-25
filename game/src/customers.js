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
  const cy = 584 + bob;

  ctx.save();

  // Shoulders & batik shirt seated behind the counter edge.
  ctx.fillStyle = style.shirt;
  roundRect(ctx, cx - 25, cy + 12, 50, 32, 13);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.9;
  ctx.stroke();

  // Subtle batik shoulder pattern accents.
  ctx.fillStyle = 'rgba(255, 248, 234, 0.22)';
  circle(ctx, cx - 14, cy + 25, 3);
  ctx.fill();
  circle(ctx, cx + 14, cy + 25, 3);
  ctx.fill();

  // Collar / batik stripe detail.
  ctx.fillStyle = style.accent;
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy + 13);
  ctx.lineTo(cx, cy + 25);
  ctx.lineTo(cx + 9, cy + 13);
  ctx.closePath();
  ctx.fill();

  // Hijab drape behind head if applicable.
  if (style.head === 'hijab') {
    ctx.fillStyle = style.accent;
    roundRect(ctx, cx - 21, cy - 19, 42, 40, 17);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.7;
    ctx.stroke();
  }

  // Head.
  ctx.fillStyle = urgent ? '#f4a38c' : style.skin;
  circle(ctx, cx, cy, 17);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.7;
  ctx.stroke();

  // Subtle rosy cheek shading.
  ctx.fillStyle = 'rgba(218, 92, 68, 0.25)';
  circle(ctx, cx - 9, cy + 3, 3);
  ctx.fill();
  circle(ctx, cx + 9, cy + 3, 3);
  ctx.fill();

  // Hair or headwear.
  if (style.head === 'peci') {
    ctx.fillStyle = '#1d1b1a';
    roundRect(ctx, cx - 15, cy - 22, 30, 12, 4);
    ctx.fill();
    ctx.strokeStyle = PALETTE.goldBright;
    ctx.lineWidth = 1.1;
    ctx.stroke();
  } else if (style.head === 'cap') {
    ctx.fillStyle = style.accent;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 17, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(cx - 17, cy - 5, 25, 3.5);
  } else if (style.head === 'bun') {
    ctx.fillStyle = style.hair;
    circle(ctx, cx, cy - 19, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 17, Math.PI, 0);
    ctx.fill();
  } else if (style.head === 'part') {
    ctx.fillStyle = style.hair;
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 17, Math.PI * 1.05, -0.05);
    ctx.fill();
  }

  // Eyes with catchlights and eyebrows reacting to patience.
  ctx.fillStyle = PALETTE.ink;
  circle(ctx, cx - 5.5, cy - 1, 2.2);
  ctx.fill();
  circle(ctx, cx + 5.5, cy - 1, 2.2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  circle(ctx, cx - 6.1, cy - 1.7, 0.7);
  ctx.fill();
  circle(ctx, cx + 4.9, cy - 1.7, 0.7);
  ctx.fill();

  if (urgent) {
    // Furrowed angry brows + open frown + sweat drop.
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 8);
    ctx.lineTo(cx - 2, cy - 4.5);
    ctx.moveTo(cx + 9, cy - 8);
    ctx.lineTo(cx + 2, cy - 4.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy + 10, 4.8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Sweat drop.
    ctx.fillStyle = '#7ad4ff';
    ctx.beginPath();
    ctx.moveTo(cx - 17, cy - 10);
    ctx.quadraticCurveTo(cx - 21, cy - 2, cx - 17, cy - 1);
    ctx.quadraticCurveTo(cx - 13, cy - 2, cx - 17, cy - 10);
    ctx.fill();
  } else if (frac < 0.5) {
    // Impatient flat mouth & raised brow.
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 6.5);
    ctx.lineTo(cx + 5, cy + 6);
    ctx.moveTo(cx - 9, cy - 6.5);
    ctx.lineTo(cx - 2, cy - 6.5);
    ctx.moveTo(cx + 2, cy - 7.5);
    ctx.lineTo(cx + 9, cy - 6.5);
    ctx.stroke();
  } else {
    // Cheerful smile.
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(cx, cy + 3.5, 4.8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // Diner hands resting visibly on the counter edge.
  const tap = frac < 0.5 ? Math.abs(Math.sin(time * (urgent ? 10 : 5) + slotIndex)) * 2.5 : 0;
  ctx.fillStyle = urgent ? '#f4a38c' : style.skin;
  circle(ctx, cx - 18, 622 - tap, 5);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  circle(ctx, cx + 18, 622, 5);
  ctx.fill();
  ctx.stroke();

  // Order speech bubble to upper-right of customer.
  const bx = cx + 41;
  const by = cy - 26;
  const br = 22;

  ctx.fillStyle = 'rgba(20, 11, 6, 0.24)';
  circle(ctx, bx + 2, by + 3, br);
  ctx.fill();

  // Speech tail.
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.moveTo(bx - 13, by + 12);
  ctx.lineTo(cx + 13, cy - 4);
  ctx.lineTo(bx - 4, by + 19);
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
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(bx, by, br - 1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
  ctx.stroke();

  drawPlateIcon(ctx, ticket.dishId, ticket.extraKerupuk, bx, by, 32);

  // Pulsing urgency exclamation badge.
  if (urgent) {
    const pulse = 0.88 + Math.sin(time * 12) * 0.12;
    ctx.save();
    ctx.translate(cx - 24, cy - 20);
    ctx.scale(pulse, pulse);
    circle(ctx, 0, 0, 10.5);
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

  // Continuous 2.5D front dining counter overlapping customer waists cleanly.
  const bx = 446;
  const by = 620;
  const bw = 720;
  const bh = 62;

  roundRect(ctx, bx + 4, by + 13, bw, bh, 11);
  ctx.fillStyle = 'rgba(20, 11, 6, 0.3)';
  ctx.fill();

  // 2.5D vertical wood-slat front apron.
  roundRect(ctx, bx, by + 10, bw, bh, 11);
  ctx.fillStyle = '#3f2010';
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 224, 175, 0.08)';
  for (let px = bx + 28; px < bx + bw - 20; px += 36) {
    ctx.fillRect(px, by + bh - 2, 2, 10);
  }

  roundRect(ctx, bx, by, bw, bh, 11);
  ctx.fillStyle = PALETTE.woodTop;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Beveled top rim highlight.
  ctx.fillStyle = 'rgba(255, 238, 200, 0.22)';
  ctx.fillRect(bx + 12, by + 2, bw - 24, 2.5);

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
    ctx.moveTo(dx, by + 25);
    ctx.lineTo(dx + 6, by + 31);
    ctx.lineTo(dx, by + 37);
    ctx.lineTo(dx - 6, by + 31);
    ctx.closePath();
    ctx.fill();
  }

  // Authentic warung condiments between seating spots (wooden cutlery cup, sambal bowl, kecap bottle).
  for (const cx of [614, 934]) {
    // Wooden cutlery cup holding gleaming spoons.
    roundRect(ctx, cx - 22, by + 19, 20, 22, 5);
    ctx.fillStyle = '#5a321a';
    ctx.fill();
    ctx.strokeStyle = PALETTE.woodEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#d9e2ec';
    circle(ctx, cx - 15, by + 17, 3.5);
    ctx.fill();
    circle(ctx, cx - 8, by + 16, 3.5);
    ctx.fill();

    // Ceramic sambal bowl with glossy red chili & spoon handle.
    circle(ctx, cx + 14, by + 30, 10.5);
    ctx.fillStyle = '#fff5e0';
    ctx.fill();
    ctx.strokeStyle = '#b48b56';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    circle(ctx, cx + 14, by + 30, 7.5);
    ctx.fillStyle = '#b82417';
    ctx.fill();
    ctx.strokeStyle = '#d9e2ec';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 15, by + 29);
    ctx.lineTo(cx + 22, by + 20);
    ctx.stroke();

    // Mini dark kecap manis bottle with red cap & gold label.
    roundRect(ctx, cx + 32, by + 18, 13, 22, 4);
    ctx.fillStyle = '#24140a';
    ctx.fill();
    ctx.strokeStyle = '#0f0703';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#c84b31';
    ctx.fillRect(cx + 35, by + 13, 7, 6);
    ctx.fillStyle = PALETTE.goldBright;
    ctx.fillRect(cx + 33, by + 25, 11, 6);
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
