// Warung signboard title screen and cohesive dark-teak/parchment modal overlays.
import { PALETTE, VIEW } from './config.js';
import { drawIngredientIcon, drawPlateIcon } from './foodArt.js';

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

function drawSignboardLantern(ctx, x, y, sway) {
  const lx = x + sway;
  ctx.save();
  // Warm radial lantern halo.
  const halo = ctx.createRadialGradient(lx, y + 48, 8, lx, y + 48, 96);
  halo.addColorStop(0, 'rgba(255, 206, 92, 0.5)');
  halo.addColorStop(1, 'rgba(255, 206, 92, 0)');
  ctx.fillStyle = halo;
  circle(ctx, lx, y + 48, 96);
  ctx.fill();

  // Cord from ceiling.
  ctx.strokeStyle = '#c88b4b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(lx, y + 10);
  ctx.stroke();

  // Red silk/bamboo warung lantern.
  ctx.fillStyle = PALETTE.terracotta;
  ctx.beginPath();
  ctx.ellipse(lx, y + 48, 28, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.goldBright;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Ribs.
  ctx.strokeStyle = 'rgba(255, 216, 107, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(lx, y + 48, 15, 35, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner bright warm flame glow.
  ctx.fillStyle = PALETTE.goldBright;
  circle(ctx, lx, y + 48, 12);
  ctx.fill();

  // Caps + tassel.
  ctx.fillStyle = '#3b2318';
  roundRect(ctx, lx - 14, y + 9, 28, 7, 3);
  ctx.fill();
  roundRect(ctx, lx - 12, y + 80, 24, 7, 3);
  ctx.fill();

  ctx.strokeStyle = PALETTE.terracotta;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(lx, y + 87);
  ctx.lineTo(lx, y + 114);
  ctx.stroke();
  ctx.restore();
}

/** Render the Warung Signboard title screen over the live kitchen backdrop. */
export function drawTitleScreen(ctx, state, best) {
  ctx.save();
  // Warm twilight veil so the kitchen still glows around the signboard.
  ctx.fillStyle = 'rgba(20, 11, 6, 0.64)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  // Flanking swaying warung lanterns.
  const sway = Math.sin(state.time * 1.1) * 4;
  drawSignboardLantern(ctx, 148, 132, sway);
  drawSignboardLantern(ctx, 1132, 132, -sway);

  // Hanging brass chains holding the main signboard.
  const sx = 230;
  const sy = 96;
  const sw = 820;
  const sh = 524;
  ctx.strokeStyle = '#d49d46';
  ctx.lineWidth = 5;
  for (const cx of [sx + 92, sx + sw - 92]) {
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, sy + 6);
    ctx.stroke();
    ctx.fillStyle = '#ffd86b';
    circle(ctx, cx, sy + 14, 7);
    ctx.fill();
  }

  // Signboard drop shadow.
  roundRect(ctx, sx + 6, sy + 10, sw, sh, 20);
  ctx.fillStyle = 'rgba(10, 5, 2, 0.55)';
  ctx.fill();

  // Outer carved dark-teak wooden sign frame.
  roundRect(ctx, sx, sy, sw, sh, 20);
  ctx.fillStyle = '#3d2215';
  ctx.fill();
  ctx.strokeStyle = '#e0a94f';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Inner warm cream parchment board.
  roundRect(ctx, sx + 16, sy + 16, sw - 32, sh - 32, 14);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.strokeStyle = '#b97e3f';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Terracotta top banner inside signboard.
  roundRect(ctx, sx + 30, sy + 28, sw - 60, 144, 12);
  ctx.fillStyle = '#2a170e';
  ctx.fill();
  ctx.strokeStyle = PALETTE.terracotta;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Corner batik diamonds on banner.
  for (const [dx, dy] of [
    [sx + 48, sy + 46],
    [sx + sw - 48, sy + 46],
    [sx + 48, sy + 154],
    [sx + sw - 48, sy + 154],
  ]) {
    ctx.fillStyle = PALETTE.goldBright;
    ctx.beginPath();
    ctx.moveTo(dx, dy - 7);
    ctx.lineTo(dx + 7, dy);
    ctx.lineTo(dx, dy + 7);
    ctx.lineTo(dx - 7, dy);
    ctx.closePath();
    ctx.fill();
  }

  // Subtitle pill badge above title.
  roundRect(ctx, VIEW.width / 2 - 122, sy + 40, 244, 28, 14);
  ctx.fillStyle = PALETTE.terracotta;
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '800 13px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = '#fff9ee';
  ctx.fillText('RUSH HOUR - DAPUR NUSANTARA', VIEW.width / 2, sy + 59);

  // Huge embossed display title.
  ctx.font = '900 50px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = '#140a05';
  ctx.fillText('WARUNG NASI GORENG', VIEW.width / 2 + 3, sy + 123);
  ctx.fillStyle = PALETTE.goldBright;
  ctx.fillText('WARUNG NASI GORENG', VIEW.width / 2, sy + 120);

  ctx.font = '700 15px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = '#f2dfc0';
  ctx.fillText('Masak pesanan secepatnya sebelum pelanggan pulang!', VIEW.width / 2, sy + 152);

  // Illustrated 4-step kitchen loop strip.
  const stepY = sy + 206;
  const steps = [
    { label: '1. AMBIL', sub: 'Pilih bahan', draw: (cx, cy) => drawIngredientIcon(ctx, 'cabai', cx, cy, 38) },
    { label: '2. CINCANG', sub: 'Talenan 3x', draw: (cx, cy) => drawIngredientIcon(ctx, 'ayam_c', cx, cy, 38) },
    {
      label: '3. MASAK',
      sub: 'Wajan panas',
      draw: (cx, cy) => {
        ctx.fillStyle = '#ff8c24';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy + 12);
        ctx.quadraticCurveTo(cx, cy - 6, cx + 14, cy + 12);
        ctx.fill();
        ctx.fillStyle = '#252a33';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 3, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        drawIngredientIcon(ctx, 'mie', cx, cy - 1, 24);
      },
    },
    { label: '4. SAJIKAN', sub: 'Meja saji', draw: (cx, cy) => drawPlateIcon(ctx, 'nasgor_spesial', true, cx, cy, 46) },
  ];

  for (let i = 0; i < steps.length; i += 1) {
    const cardW = 166;
    const gap = 18;
    const totalW = steps.length * cardW + (steps.length - 1) * gap;
    const cx = (VIEW.width - totalW) / 2 + i * (cardW + gap) + cardW / 2;

    roundRect(ctx, cx - cardW / 2, stepY, cardW, 118, 10);
    ctx.fillStyle = '#f5e4c3';
    ctx.fill();
    ctx.strokeStyle = '#d2a266';
    ctx.lineWidth = 2;
    ctx.stroke();

    circle(ctx, cx, stepY + 42, 26);
    ctx.fillStyle = '#fff9ee';
    ctx.fill();
    ctx.strokeStyle = '#c88b4b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    steps[i].draw(cx, stepY + 42);

    ctx.font = '800 14px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(steps[i].label, cx, stepY + 88);
    ctx.font = '600 12px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(steps[i].sub, cx, stepY + 106);

    if (i < steps.length - 1) {
      ctx.font = '900 18px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.fillStyle = PALETTE.terracotta;
      ctx.fillText('>', cx + cardW / 2 + gap / 2, stepY + 56);
    }
  }

  // Rules + controls summary.
  ctx.font = '700 16px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText('3 hari rush hour. 3 pesanan gagal dalam sehari dan warung tutup.', VIEW.width / 2, sy + 362);

  ctx.font = '600 14px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText('WASD / Klik: gerak & pakai   |   Spasi / E: aksi   |   Q: buang   |   P: jeda', VIEW.width / 2, sy + 388);

  // Best score pill.
  roundRect(ctx, VIEW.width / 2 - 135, sy + 404, 270, 32, 16);
  ctx.fillStyle = '#edd8b2';
  ctx.fill();
  ctx.strokeStyle = '#c89b5a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = '800 14px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = PALETTE.woodEdge;
  ctx.fillText(`Skor Terbaik: Rp${best.toLocaleString('id-ID')}`, VIEW.width / 2, sy + 425);

  // Bold CTA button.
  const bx = VIEW.width / 2 - 196;
  const by = sy + 448;
  const bw = 392;
  const bh = 50;
  roundRect(ctx, bx + 2, by + 4, bw, bh, 12);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.32)';
  ctx.fill();

  roundRect(ctx, bx, by, bw, bh, 12);
  ctx.fillStyle = PALETTE.terracotta;
  ctx.fill();
  ctx.strokeStyle = PALETTE.goldBright;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.font = '800 17px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = '#fffdf7';
  ctx.fillText('KLIK ATAU TEKAN SPASI UNTUK MULAI', VIEW.width / 2, by + 31);

  ctx.restore();
}

function drawStar5(ctx, cx, cy, outerR, innerR, filled) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outerR : innerR;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(ang) * r;
    const py = cy + Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? PALETTE.goldBright : '#e4d0aa';
  ctx.fill();
  ctx.strokeStyle = filled ? '#a86714' : '#b89a6d';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/** Render a cohesive carved-wood and parchment modal for paused, dayclear, game over, and win. */
export function drawOverlayModal(ctx, title, lines, prompt, accent, stats = null) {
  ctx.save();
  ctx.fillStyle = 'rgba(20, 11, 6, 0.64)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  const width = stats ? 700 : 660;
  const height = stats ? 436 : 186 + lines.length * 32;
  const x = (VIEW.width - width) / 2;
  const y = (VIEW.height - height) / 2;

  roundRect(ctx, x + 5, y + 8, width, height, 18);
  ctx.fillStyle = 'rgba(10, 5, 2, 0.48)';
  ctx.fill();

  roundRect(ctx, x, y, width, height, 18);
  ctx.fillStyle = '#3d2215';
  ctx.fill();
  ctx.strokeStyle = '#e0a94f';
  ctx.lineWidth = 3;
  ctx.stroke();

  roundRect(ctx, x + 12, y + 12, width - 24, height - 24, 12);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.strokeStyle = '#c89b5a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Header ribbon.
  roundRect(ctx, x + 28, y + 24, width - 56, 56, 10);
  ctx.fillStyle = accent;
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '900 32px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = '#fffdf7';
  ctx.fillText(title, VIEW.width / 2, y + 63);

  if (stats) {
    // 3-star warung shift rating row.
    for (let s = 0; s < 3; s += 1) {
      drawStar5(ctx, VIEW.width / 2 + (s - 1) * 58, y + 114, 21, 10, s < stats.stars);
    }

    // Reason / summary line.
    ctx.font = '700 17px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(lines[0] || '', VIEW.width / 2, y + 158);

    // 3 framed visual stat cards.
    const cardW = 192;
    const cardH = 114;
    const gap = 18;
    const startX = (VIEW.width - (3 * cardW + 2 * gap)) / 2;
    const cardY = y + 178;

    const cards = [
      {
        label: 'TERSAJI',
        value: stats.servedLabel ?? String(stats.served),
        color: PALETTE.green,
        draw: (cx, cy) => drawPlateIcon(ctx, 'nasgor_spesial', true, cx, cy, 42),
      },
      {
        label: 'GAGAL',
        value: String(stats.failed),
        color: PALETTE.terracotta,
        draw: (cx, cy) => drawIngredientIcon(ctx, 'cabai', cx, cy, 34),
      },
      {
        label: 'TOTAL KOIN',
        value: `Rp${stats.coins.toLocaleString('id-ID')}`,
        color: '#9c5d14',
        draw: (cx, cy) => {
          circle(ctx, cx, cy, 18);
          ctx.fillStyle = PALETTE.gold;
          ctx.fill();
          ctx.strokeStyle = '#a86714';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.font = '900 13px system-ui, -apple-system, "Segoe UI", sans-serif';
          ctx.fillStyle = PALETTE.ink;
          ctx.fillText('Rp', cx, cy + 4);
        },
      },
    ];

    cards.forEach((card, idx) => {
      const cx = startX + idx * (cardW + gap);
      roundRect(ctx, cx, cardY, cardW, cardH, 10);
      ctx.fillStyle = '#f5e4c3';
      ctx.fill();
      ctx.strokeStyle = '#d2a266';
      ctx.lineWidth = 2;
      ctx.stroke();

      card.draw(cx + cardW / 2, cardY + 34);

      ctx.font = '800 11px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText(card.label, cx + cardW / 2, cardY + 72);

      ctx.font = '900 22px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.fillStyle = card.color;
      ctx.fillText(card.value, cx + cardW / 2, cardY + 100);
    });

    // Tilted warung rubber stamp seal on top right.
    if (stats.stamp) {
      ctx.save();
      ctx.translate(x + width - 92, y + 124);
      ctx.rotate(-0.2);
      roundRect(ctx, -46, -18, 92, 36, 6);
      ctx.fillStyle = 'rgba(255, 248, 234, 0.88)';
      ctx.fill();
      ctx.strokeStyle = stats.stampColor || accent;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = '900 16px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.fillStyle = stats.stampColor || accent;
      ctx.fillText(stats.stamp, 0, 6);
      ctx.restore();
    }

    // Best score badge.
    roundRect(ctx, VIEW.width / 2 - 140, y + 308, 280, 32, 16);
    ctx.fillStyle = '#edd8b2';
    ctx.fill();
    ctx.strokeStyle = '#c89b5a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = '800 14px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillStyle = PALETTE.woodEdge;
    ctx.fillText(`Skor Terbaik: Rp${stats.best.toLocaleString('id-ID')}`, VIEW.width / 2, y + 329);
  } else {
    lines.forEach((line, index) => {
      ctx.font = index === 0 ? '700 17px system-ui, -apple-system, "Segoe UI", sans-serif' : '600 16px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.fillStyle = PALETTE.ink;
      ctx.fillText(line, VIEW.width / 2, y + 114 + index * 32);
    });
  }

  // Action button pill at bottom.
  const btnW = 360;
  const btnH = 44;
  const btnX = (VIEW.width - btnW) / 2;
  const btnY = y + height - 68;
  roundRect(ctx, btnX, btnY, btnW, btnH, 10);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.strokeStyle = PALETTE.goldBright;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '800 15px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = '#fffdf7';
  ctx.fillText(prompt, VIEW.width / 2, btnY + 27);

  ctx.restore();
}
