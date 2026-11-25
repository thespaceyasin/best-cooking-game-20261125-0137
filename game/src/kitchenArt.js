// Warm Indonesian warung kitchen backdrop, handmade ceramic floor tiles, woven runner mat,
// street-side dining nook, blek kerupuk, potted pandan, lanterns, and warm ambient lighting.
import { PALETTE, STATIONS, VIEW } from './config.js';

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

function tileHash(row, col) {
  const n = Math.imul(row * 73856093 ^ col * 19349663, 0x27d4eb2d) >>> 0;
  return (n & 255) / 255;
}

function drawStreetWindow(ctx, x, y, w, h, day, time, hasMoon) {
  ctx.save();
  // Recessed outer timber frame + sill.
  roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 6);
  ctx.fillStyle = '#3d2111';
  ctx.fill();
  ctx.strokeStyle = '#6f3e22';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  roundRect(ctx, x, y, w, h, 4);
  ctx.clip();

  // Sky gradient by time of day.
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  if (day >= 3) {
    sky.addColorStop(0, '#0f1430');
    sky.addColorStop(0.55, '#221f48');
    sky.addColorStop(1, '#472a40');
  } else if (day === 2) {
    sky.addColorStop(0, '#b94228');
    sky.addColorStop(0.55, '#eb8434');
    sky.addColorStop(1, '#ffd46e');
  } else {
    sky.addColorStop(0, '#7ab8cf');
    sky.addColorStop(0.6, '#cbe3d8');
    sky.addColorStop(1, '#f8e5b8');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  if (day >= 3) {
    // Deterministic twinkling stars + crescent moon on right window.
    for (let sx = x + 16; sx < x + w - 16; sx += 29) {
      const sy = y + 8 + ((sx * 37) % 34);
      const tw = 0.55 + 0.45 * Math.sin(time * 2.2 + sx * 0.13);
      ctx.fillStyle = `rgba(255, 240, 178, ${tw})`;
      circle(ctx, sx, sy, (sx % 3 === 0) ? 1.8 : 1.1);
      ctx.fill();
    }
    if (hasMoon) {
      const mx = x + w - 42;
      const my = y + 22;
      ctx.fillStyle = '#ffe588';
      circle(ctx, mx, my, 11);
      ctx.fill();
      ctx.fillStyle = '#18193b';
      circle(ctx, mx + 4.5, my - 2.5, 9.5);
      ctx.fill();
    }
  } else if (day === 2) {
    // Glowing setting sun orb near street horizon.
    const sunX = x + w * 0.72;
    const sunY = y + h - 20;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 44);
    sunGlow.addColorStop(0, 'rgba(255, 245, 185, 0.95)');
    sunGlow.addColorStop(0.4, 'rgba(255, 194, 82, 0.45)');
    sunGlow.addColorStop(1, 'rgba(255, 140, 48, 0)');
    ctx.fillStyle = sunGlow;
    circle(ctx, sunX, sunY, 44);
    ctx.fill();
  } else {
    // Soft daytime puffy clouds.
    ctx.fillStyle = 'rgba(255, 253, 245, 0.78)';
    for (const cx of [x + w * 0.25, x + w * 0.7]) {
      circle(ctx, cx, y + 22, 11);
      circle(ctx, cx + 12, y + 20, 14);
      circle(ctx, cx + 25, y + 23, 10);
      ctx.fill();
    }
  }

  // Distant Indonesian shophouse / kampung rooftops & silhouettes.
  ctx.fillStyle = day >= 3 ? '#1a1529' : day === 2 ? '#59291a' : '#7c5d49';
  for (let rx = x; rx < x + w; rx += 74) {
    const rh = 18 + ((rx * 13) % 14);
    ctx.beginPath();
    ctx.moveTo(rx, y + h);
    ctx.lineTo(rx, y + h - rh);
    ctx.lineTo(rx + 36, y + h - rh - 12);
    ctx.lineTo(rx + 72, y + h - rh);
    ctx.lineTo(rx + 72, y + h);
    ctx.closePath();
    ctx.fill();

    // Warm lit street windows at night & dusk.
    if (day >= 2) {
      ctx.fillStyle = day >= 3 ? '#ffb94d' : '#ffdf88';
      ctx.fillRect(rx + 18, y + h - rh + 4, 9, 7);
      ctx.fillRect(rx + 42, y + h - rh + 4, 9, 7);
      ctx.fillStyle = day >= 3 ? '#1a1529' : '#59291a';
    }
  }

  // Dark palm leaf silhouette on window corner.
  ctx.fillStyle = day >= 3 ? '#121021' : day === 2 ? '#441e14' : '#35683d';
  for (const ang of [-0.7, -0.35, 0.05]) {
    ctx.save();
    ctx.translate(x + w - 4, y + h - 8);
    ctx.rotate(ang - Math.PI * 0.78);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(20, -6, 38, 2);
    ctx.quadraticCurveTo(20, 4, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // Draped warm glowing festoon string lights (lampu hias warung).
  const segs = Math.max(2, Math.round(w / 140));
  const segW = w / segs;
  for (let s = 0; s < segs; s += 1) {
    const x0 = x + s * segW;
    const x1 = x0 + segW;
    ctx.strokeStyle = '#2d1a10';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, y + 6);
    ctx.quadraticCurveTo((x0 + x1) / 2, y + 23, x1, y + 6);
    ctx.stroke();

    for (let b = 1; b <= 3; b += 1) {
      const t = b / 4;
      const bx = x0 + segW * t;
      const sag = 4 * t * (1 - t);
      const by = y + 6 + sag * 16 + 3;
      const bAlpha = day >= 3 ? 0.58 : day === 2 ? 0.42 : 0.25;
      const bGlow = ctx.createRadialGradient(bx, by, 1, bx, by, 13);
      bGlow.addColorStop(0, `rgba(255, 224, 118, ${bAlpha})`);
      bGlow.addColorStop(1, 'rgba(255, 190, 70, 0)');
      ctx.fillStyle = bGlow;
      circle(ctx, bx, by, 13);
      ctx.fill();
      ctx.fillStyle = '#ffe994';
      circle(ctx, bx, by, 3.1);
      ctx.fill();
    }
  }
  ctx.restore();

  // Vertical wooden window mullions + bright warm windowsill lip.
  ctx.fillStyle = '#4a2917';
  const divs = w > 500 ? 3 : 2;
  for (let d = 1; d < divs; d += 1) {
    ctx.fillRect(x + (w * d) / divs - 3, y, 6, h);
  }
  roundRect(ctx, x - 6, y + h, w + 12, 6, 2);
  ctx.fillStyle = '#6f3e22';
  ctx.fill();
  ctx.restore();
}

/** Street-front warung upper wall with open windows + handmade tiled kitchen floor. */
export function drawWarmFloor(ctx, state = { day: 1, time: 0 }) {
  const day = state.day || 1;
  const time = state.time || 0;

  // Timber-plaster upper warung wall behind windows.
  const wallGrad = ctx.createLinearGradient(0, 56, 0, 166);
  wallGrad.addColorStop(0, '#c8a675');
  wallGrad.addColorStop(0.55, '#dfc092');
  wallGrad.addColorStop(1, '#ecd3a9');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 56, VIEW.width, 110);

  // Dark-teak horizontal lintel beam & vertical framing columns.
  ctx.fillStyle = '#4a2917';
  ctx.fillRect(0, 56, VIEW.width, 6);
  for (const px of [14, 456, 1094, 1262]) {
    ctx.fillRect(px, 56, 10, 106);
  }

  // Two open street-front warung windows showing sky, stars/sun, rooftops & festoon lights.
  drawStreetWindow(ctx, 36, 63, 408, 76, day, time, false);
  drawStreetWindow(ctx, 480, 63, 602, 76, day, time, true);

  // Cozy right alcove with hanging braided red chilies & garlic bulbs.
  roundRect(ctx, 1114, 66, 140, 74, 6);
  ctx.fillStyle = '#9a6842';
  ctx.fill();
  ctx.strokeStyle = '#4a2917';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (const [hx, col] of [[1148, '#cc2f1f'], [1184, '#f2e8cf'], [1220, '#cc2f1f']]) {
    ctx.strokeStyle = '#4a2917';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx, 68);
    ctx.lineTo(hx, 114);
    ctx.stroke();
    for (let k = 0; k < 4; k += 1) {
      ctx.fillStyle = col;
      circle(ctx, hx + (k % 2 === 0 ? -4 : 4), 80 + k * 9, 4.5);
      ctx.fill();
    }
  }

  // Finer handmade terracotta/cream tiled floor below y=164 (48px tiles).
  const tile = 48;
  const startY = 164;
  const rows = 12;
  const cols = 27;
  const tilePalette = [PALETTE.floorA, PALETTE.floorB, PALETTE.floorC, PALETTE.floorD];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * tile;
      const y = startY + row * tile;
      const h = tileHash(row, col);
      const isAlt = (row + col) % 2 === 0;
      const baseColor = isAlt
        ? (h > 0.45 ? tilePalette[0] : tilePalette[3])
        : (h > 0.5 ? tilePalette[1] : tilePalette[2]);

      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, tile, tile);

      if ((row + col) % 2 === 0 && h > 0.35) {
        ctx.fillStyle = 'rgba(200, 75, 49, 0.055)';
        ctx.fillRect(x + 4, y + 4, tile - 8, tile - 8);
      }
      if (row % 2 === 0 && col % 2 === 0 && h > 0.45) {
        ctx.fillStyle = 'rgba(160, 72, 36, 0.1)';
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 5, y);
        ctx.lineTo(x, y + 5);
        ctx.lineTo(x - 5, y);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255, 250, 238, 0.24)';
      ctx.fillRect(x + 1, y + 1, tile - 2, 1.5);
      ctx.fillRect(x + 1, y + 1, 1.5, tile - 2);
      ctx.fillStyle = 'rgba(110, 70, 35, 0.07)';
      ctx.fillRect(x + 1, y + tile - 2, tile - 2, 1.5);

      if (h > 0.72) {
        ctx.fillStyle = 'rgba(130, 82, 44, 0.13)';
        circle(ctx, x + 12 + Math.floor(h * 22), y + 14 + Math.floor((h * 17) % 20), 1.6);
        ctx.fill();
      }
    }
  }

  // Recessed warm grout grid.
  ctx.strokeStyle = 'rgba(182, 142, 92, 0.62)';
  ctx.lineWidth = 1.2;
  for (let col = 0; col <= cols; col += 1) {
    ctx.beginPath();
    ctx.moveTo(col * tile, startY);
    ctx.lineTo(col * tile, VIEW.height);
    ctx.stroke();
  }
  for (let row = 0; row <= rows; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, startY + row * tile);
    ctx.lineTo(VIEW.width, startY + row * tile);
    ctx.stroke();
  }

  // Dark teak baseboard where the wall meets the floor + cast shadow.
  ctx.fillStyle = PALETTE.baseboard;
  ctx.fillRect(0, 158, VIEW.width, 8);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, 158, VIEW.width, 2);
  const baseShadow = ctx.createLinearGradient(0, 166, 0, 188);
  baseShadow.addColorStop(0, 'rgba(35, 23, 17, 0.24)');
  baseShadow.addColorStop(1, 'rgba(35, 23, 17, 0)');
  ctx.fillStyle = baseShadow;
  ctx.fillRect(0, 166, VIEW.width, 22);

  // Soft ambient-occlusion shadow gradients beneath the top counter & mid service island.
  const topAo = ctx.createLinearGradient(0, 266, 0, 294);
  topAo.addColorStop(0, 'rgba(28, 16, 9, 0.24)');
  topAo.addColorStop(1, 'rgba(28, 16, 9, 0)');
  ctx.fillStyle = topAo;
  ctx.fillRect(8, 266, 1106, 28);

  const midAo = ctx.createLinearGradient(0, 396, 0, 424);
  midAo.addColorStop(0, 'rgba(28, 16, 9, 0.24)');
  midAo.addColorStop(1, 'rgba(28, 16, 9, 0)');
  ctx.fillStyle = midAo;
  ctx.fillRect(468, 396, 646, 28);
}

/** Bold striped terracotta-and-cream warung awning clearly perched above the counter line. */
export function drawWarungAwning(ctx) {
  const y = 142;
  const stripeW = 32;
  ctx.save();
  ctx.fillStyle = 'rgba(35, 23, 17, 0.24)';
  ctx.fillRect(0, y + 13, VIEW.width, 7);

  for (let x = 0, idx = 0; x < VIEW.width; x += stripeW, idx += 1) {
    const isRed = idx % 2 === 0;
    ctx.fillStyle = isRed ? PALETTE.terracotta : PALETTE.cream;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + stripeW, y);
    ctx.lineTo(x + stripeW, y + 10);
    ctx.arc(x + stripeW / 2, y + 10, stripeW / 2, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isRed ? PALETTE.terracottaDark : '#d5be94';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.fillStyle = '#4a2917';
  ctx.fillRect(0, y - 3, VIEW.width, 4);
  ctx.restore();
}

/** Braided pandan/batik woven runner mat in the central cook corridor. */
export function drawKitchenMat(ctx) {
  const mx = 256;
  const my = 430;
  const mw = 836;
  const mh = 112;

  ctx.save();
  // Soft ground contact shadow under mat.
  roundRect(ctx, mx + 2, my + 3, mw, mh, 14);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.12)';
  ctx.fill();

  // Earthy woven pandan-olive border.
  roundRect(ctx, mx, my, mw, mh, 14);
  ctx.fillStyle = '#1e5737';
  ctx.fill();
  ctx.strokeStyle = '#123923';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Natural warm straw field.
  roundRect(ctx, mx + 9, my + 9, mw - 18, mh - 18, 10);
  ctx.fillStyle = '#c8955c';
  ctx.fill();

  // Warm terracotta inner trim.
  roundRect(ctx, mx + 14, my + 14, mw - 28, mh - 28, 7);
  ctx.strokeStyle = 'rgba(182, 70, 44, 0.72)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Subtle crosshatch reed weave + traditional batik corner ornaments clipped inside mat.
  ctx.save();
  roundRect(ctx, mx + 16, my + 16, mw - 32, mh - 32, 6);
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 246, 224, 0.13)';
  for (let x = mx - 40; x < mx + mw + 40; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, my + 16);
    ctx.lineTo(x + 7, my + 16);
    ctx.lineTo(x - 24, my + mh - 16);
    ctx.lineTo(x - 31, my + mh - 16);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(128, 74, 34, 0.08)';
  for (let x = mx - 40; x < mx + mw + 40; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, my + 16);
    ctx.lineTo(x + 6, my + 16);
    ctx.lineTo(x + 36, my + mh - 16);
    ctx.lineTo(x + 30, my + mh - 16);
    ctx.closePath();
    ctx.fill();
  }
  // Center + corner batik medallions.
  const cx = mx + mw / 2;
  const cy = my + mh / 2;
  for (const [dx, dy, rx, ry] of [
    [cx, cy, 56, 30],
    [mx + 56, cy, 24, 18],
    [mx + mw - 56, cy, 24, 18],
  ]) {
    ctx.fillStyle = 'rgba(30, 87, 55, 0.15)';
    ctx.beginPath();
    ctx.moveTo(dx, dy - ry);
    ctx.lineTo(dx + rx, dy);
    ctx.lineTo(dx, dy + ry);
    ctx.lineTo(dx - rx, dy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(182, 70, 44, 0.28)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  ctx.restore();

  // Left and right woven cotton fringes.
  ctx.strokeStyle = PALETTE.creamWarm;
  ctx.lineWidth = 1.8;
  for (let fy = my + 16; fy <= my + mh - 16; fy += 10) {
    ctx.beginPath();
    ctx.moveTo(mx - 7, fy);
    ctx.lineTo(mx, fy);
    ctx.moveTo(mx + mw, fy);
    ctx.lineTo(mx + mw + 7, fy);
    ctx.stroke();
  }
  ctx.restore();
}

/** Framed dark-teak chalkboard Menu sign and swaying bamboo hanging lanterns. */
export function drawWallProps(ctx, state) {
  // Chalkboard menu sign at (1120, 168, 144, 88).
  const mx = 1120;
  const my = 168;
  const mw = 144;
  const mh = 88;
  ctx.save();
  roundRect(ctx, mx + 2, my + 4, mw, mh, 9);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.22)';
  ctx.fill();

  roundRect(ctx, mx, my, mw, mh, 9);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner dark slate chalkboard.
  roundRect(ctx, mx + 6, my + 6, mw - 12, mh - 12, 6);
  ctx.fillStyle = '#243028';
  ctx.fill();
  ctx.strokeStyle = '#d4a359';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '800 13px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = PALETTE.goldBright;
  ctx.fillText('MENU WARUNG', mx + mw / 2, my + 24);

  ctx.fillStyle = 'rgba(244, 185, 66, 0.45)';
  ctx.fillRect(mx + 18, my + 28, mw - 36, 1.5);

  ctx.font = '700 11px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = '#fdf4df';
  ctx.fillText('NASGOR   12rb', mx + mw / 2, my + 45);
  ctx.fillText('MIEGOR   12rb', mx + mw / 2, my + 61);
  ctx.fillStyle = '#ffd185';
  ctx.fillText('SATE     16rb', mx + mw / 2, my + 77);
  ctx.restore();

  // Swaying bamboo hanging lanterns over the kitchen prep and wok areas.
  const lanterns = [
    { x: 472, y: 144, r: 9.5 },
    { x: 820, y: 144, r: 10.5 },
    { x: 1110, y: 144, r: 9.5 },
  ];
  for (let i = 0; i < lanterns.length; i += 1) {
    const l = lanterns[i];
    const sway = Math.sin(state.time * 1.1 + i * 1.4) * 2.5;
    const lx = l.x + sway;
    const ly = l.y + 15;
    ctx.save();
    // Warm glow halo.
    const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, l.r * 3.2);
    glow.addColorStop(0, 'rgba(255, 214, 107, 0.45)');
    glow.addColorStop(1, 'rgba(255, 214, 107, 0)');
    ctx.fillStyle = glow;
    circle(ctx, lx, ly, l.r * 3.2);
    ctx.fill();

    // Cord.
    ctx.strokeStyle = PALETTE.woodEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y - 2);
    ctx.lineTo(lx, ly - l.r);
    ctx.stroke();

    // Woven lantern body.
    ctx.fillStyle = PALETTE.terracotta;
    ctx.beginPath();
    ctx.ellipse(lx, ly, l.r * 0.95, l.r * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.goldBright;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner bright core.
    ctx.fillStyle = PALETTE.goldBright;
    circle(ctx, lx, ly, l.r * 0.45);
    ctx.fill();

    // Brass top & bottom caps + red tassel.
    ctx.fillStyle = PALETTE.woodEdge;
    ctx.fillRect(lx - 5, ly - l.r * 1.18, 10, 3);
    ctx.fillRect(lx - 4, ly + l.r * 1.05, 8, 3);
    ctx.strokeStyle = PALETTE.terracotta;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, ly + l.r * 1.15);
    ctx.lineTo(lx, ly + l.r * 1.6);
    ctx.stroke();
    ctx.restore();
  }
}

/** Soft ambient drop shadows under every active station so counters pop from the floor. */
export function drawStationShadows(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(35, 23, 17, 0.2)';
  for (const bin of STATIONS.bins) {
    roundRect(ctx, bin.x + 2, bin.y + 4, bin.w, bin.h, 8);
    ctx.fill();
  }
  for (const key of ['talenan', 'wajan', 'dispenser', 'piring', 'saji', 'trash']) {
    const st = STATIONS[key];
    roundRect(ctx, st.x + 3, st.y + 5, st.w, st.h, 9);
    ctx.fill();
  }
  ctx.restore();
}

/** Iconic Indonesian blue square blek kerupuk tin with circular glass window. */
function drawBlekKerupuk(ctx, x, y) {
  ctx.save();
  // Drop shadow.
  roundRect(ctx, x + 3, y + 4, 48, 56, 6);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.24)';
  ctx.fill();

  // Blue painted tin body.
  roundRect(ctx, x, y, 48, 56, 6);
  ctx.fillStyle = '#25608a';
  ctx.fill();
  ctx.strokeStyle = '#163d5a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ribbed tin lines.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  for (let ry = y + 8; ry <= y + 48; ry += 8) {
    ctx.beginPath();
    ctx.moveTo(x + 4, ry);
    ctx.lineTo(x + 44, ry);
    ctx.stroke();
  }

  // Silver lid on top.
  roundRect(ctx, x + 8, y - 6, 32, 9, 3);
  ctx.fillStyle = '#d3dce6';
  ctx.fill();
  ctx.strokeStyle = '#738294';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Circular front window showing crispy kerupuk.
  circle(ctx, x + 24, y + 30, 15);
  ctx.fillStyle = '#18374e';
  ctx.fill();
  ctx.strokeStyle = '#d3dce6';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#f4cf6a';
  circle(ctx, x + 20, y + 29, 6);
  ctx.fill();
  circle(ctx, x + 28, y + 32, 6);
  ctx.fill();
  ctx.fillStyle = '#e0a92e';
  circle(ctx, x + 24, y + 25, 5);
  ctx.fill();

  // Glass reflection glint.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + 24, y + 30, 10, -2.5, -1.3);
  ctx.stroke();
  ctx.restore();
}

/** Lush terracotta potted pandan / tropical kitchen corner plant. */
function drawPottedPlant(ctx, cx, cy) {
  ctx.save();
  // Ground shadow.
  ctx.fillStyle = 'rgba(35, 23, 17, 0.24)';
  ctx.beginPath();
  ctx.ellipse(cx + 3, cy + 28, 30, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Terracotta pot.
  ctx.fillStyle = PALETTE.terracotta;
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy - 2);
  ctx.lineTo(cx + 22, cy - 2);
  ctx.lineTo(cx + 16, cy + 28);
  ctx.lineTo(cx - 16, cy + 28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.terracottaDark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pot rim.
  roundRect(ctx, cx - 25, cy - 9, 50, 9, 4);
  ctx.fillStyle = PALETTE.terracottaLight;
  ctx.fill();
  ctx.strokeStyle = PALETTE.terracottaDark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Soil.
  ctx.fillStyle = '#3b2416';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 8, 19, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pandan / tropical leaves radiating cleanly with darker center midribs.
  const leaves = [
    { ang: -2.6, len: 34, w: 9, c: '#1a613a' },
    { ang: -2.1, len: 43, w: 10, c: '#277d4b' },
    { ang: -1.6, len: 48, w: 10.5, c: '#359c5f' },
    { ang: -1.15, len: 42, w: 10, c: '#277d4b' },
    { ang: -0.7, len: 34, w: 9, c: '#1a613a' },
  ];
  for (const lf of leaves) {
    ctx.save();
    ctx.translate(cx, cy - 10);
    ctx.rotate(lf.ang);
    ctx.fillStyle = lf.c;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(lf.len * 0.5, -lf.w, lf.len, 0);
    ctx.quadraticCurveTo(lf.len * 0.5, lf.w, 0, 0);
    ctx.fill();
    ctx.strokeStyle = '#124226';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(205, 245, 178, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(lf.len * 0.78, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** Continuous 2.5D dark-teak counter rails unifying top prep line and mid service island. */
export function drawCounterConnectors(ctx) {
  ctx.save();

  // Top kitchen counter deck behind bins, talenan, wajan, and dispenser.
  roundRect(ctx, 10, 170, 1098, 107, 12);
  ctx.fillStyle = 'rgba(24, 14, 8, 0.28)';
  ctx.fill();
  // 2.5D front vertical wood-slat apron.
  roundRect(ctx, 10, 166, 1098, 107, 12);
  ctx.fillStyle = '#3c1f0f';
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 224, 175, 0.08)';
  for (let px = 28; px < 1095; px += 32) {
    ctx.fillRect(px, 263, 2, 10);
  }
  // Countertop face.
  roundRect(ctx, 10, 156, 1098, 107, 12);
  ctx.fillStyle = '#5f371f';
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 236, 198, 0.16)';
  ctx.fillRect(22, 158, 1074, 2.5);

  // Beveled metallic exhaust hood canopy perched above WAJAN with rivets & warm fire reflection.
  roundRect(ctx, 704, 150, 232, 18, 6);
  const hoodGrad = ctx.createLinearGradient(704, 150, 704, 168);
  hoodGrad.addColorStop(0, '#6a7487');
  hoodGrad.addColorStop(0.6, '#485161');
  hoodGrad.addColorStop(1, '#2c323d');
  ctx.fillStyle = hoodGrad;
  ctx.fill();
  ctx.strokeStyle = '#1e232b';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 168, 72, 0.35)';
  ctx.fillRect(714, 164, 212, 3);
  ctx.fillStyle = '#adb8cc';
  for (let rx = 720; rx <= 920; rx += 40) {
    circle(ctx, rx, 156, 1.5);
    ctx.fill();
  }

  // Mid service island connecting PIRING and MEJA SAJI with 2.5D front apron.
  roundRect(ctx, 470, 307, 640, 102, 12);
  ctx.fillStyle = 'rgba(24, 14, 8, 0.28)';
  ctx.fill();
  roundRect(ctx, 470, 303, 640, 102, 12);
  ctx.fillStyle = '#3f2010';
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 224, 175, 0.08)';
  for (let px = 488; px < 1096; px += 32) {
    ctx.fillRect(px, 396, 2, 9);
  }
  roundRect(ctx, 470, 294, 640, 102, 12);
  ctx.fillStyle = '#6b3e22';
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 236, 198, 0.18)';
  ctx.fillRect(482, 296, 616, 2.5);

  ctx.restore();
}

/** Cozy bottom-half props (cobek & fresh herb basket, blek kerupuk, spice rack, potted pandan). */
export function drawForegroundProps(ctx) {
  ctx.save();

  // --- Right margin stand below BUMBU DAPUR: volcanic cobek sambal & herb bakul (x: 1126..1256, y: 416..504) ---
  roundRect(ctx, 1128, 426, 128, 84, 10);
  ctx.fillStyle = 'rgba(24, 14, 8, 0.24)';
  ctx.fill();
  roundRect(ctx, 1126, 422, 128, 84, 10);
  ctx.fillStyle = '#3f2010';
  ctx.fill();
  roundRect(ctx, 1126, 416, 128, 82, 10);
  ctx.fillStyle = PALETTE.woodTop;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Volcanic stone cobek mortar filled with crushed red sambal + stone ulekan pestle.
  circle(ctx, 1160, 456, 18);
  ctx.fillStyle = '#4a4e57';
  ctx.fill();
  ctx.strokeStyle = '#262930';
  ctx.lineWidth = 2;
  ctx.stroke();
  circle(ctx, 1160, 456, 12.5);
  ctx.fillStyle = '#b92619';
  ctx.fill();
  ctx.fillStyle = '#e0502f';
  circle(ctx, 1157, 453, 4);
  ctx.fill();
  ctx.save();
  ctx.translate(1164, 459);
  ctx.rotate(-0.55);
  roundRect(ctx, -4, -14, 8, 22, 4);
  ctx.fillStyle = '#6c727f';
  ctx.fill();
  ctx.strokeStyle = '#2d3138';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  // Woven bamboo bakul basket holding fresh chilies, shallots & green lime.
  circle(ctx, 1216, 458, 17);
  ctx.fillStyle = '#c88b45';
  ctx.fill();
  ctx.strokeStyle = '#73441b';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  circle(ctx, 1216, 458, 12.5);
  ctx.fillStyle = '#996028';
  ctx.fill();
  ctx.fillStyle = '#2f8f4b';
  circle(ctx, 1212, 454, 5);
  ctx.fill();
  ctx.fillStyle = '#cc2f1f';
  circle(ctx, 1220, 457, 4.5);
  ctx.fill();
  ctx.fillStyle = '#a465b5';
  circle(ctx, 1214, 463, 4.5);
  ctx.fill();

  // Iconic blue blek kerupuk tin perched cleanly beside the relocated TANGAN tray.
  drawBlekKerupuk(ctx, 384, 622);

  // Lush terracotta potted plant in the bottom-right corner.
  drawPottedPlant(ctx, 1216, 642);

  // Framed 2.5D spice rack on right wall margin (x: 1122..1260, y: 294..394).
  roundRect(ctx, 1126, 304, 134, 92, 10);
  ctx.fillStyle = 'rgba(24, 14, 8, 0.24)';
  ctx.fill();
  roundRect(ctx, 1122, 294, 134, 92, 10);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, 1130, 302, 118, 76, 6);
  ctx.fillStyle = '#331d12';
  ctx.fill();

  // 1) Dark kecap manis bottle with red cap & gold label.
  roundRect(ctx, 1139, 320, 18, 30, 4);
  ctx.fillStyle = '#1f1007';
  ctx.fill();
  ctx.strokeStyle = '#6c4932';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#c84b31';
  ctx.fillRect(1143, 311, 10, 9);
  ctx.fillStyle = PALETTE.goldBright;
  ctx.fillRect(1140, 330, 16, 8);

  // 2) Glass jar of red sambal ulek with brass lid.
  roundRect(ctx, 1165, 324, 20, 26, 5);
  ctx.fillStyle = '#c42b1c';
  ctx.fill();
  ctx.strokeStyle = '#ffdfd6';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#d49d46';
  ctx.fillRect(1167, 319, 16, 5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(1169, 328, 3, 18);

  // 3) Glass jar of fresh green & carrot acar pickles.
  roundRect(ctx, 1193, 324, 20, 26, 5);
  ctx.fillStyle = '#dbeec9';
  ctx.fill();
  ctx.strokeStyle = '#f5fff0';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#2d8a4b';
  circle(ctx, 1200, 336, 4);
  ctx.fill();
  ctx.fillStyle = '#f07b26';
  circle(ctx, 1206, 341, 3.5);
  ctx.fill();
  ctx.fillStyle = '#c88b4b';
  ctx.fillRect(1195, 319, 16, 5);

  // 4) Amber cooking oil bottle.
  roundRect(ctx, 1221, 318, 18, 32, 4);
  ctx.fillStyle = '#f4b942';
  ctx.fill();
  ctx.strokeStyle = '#fff5d6';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#3b2318';
  ctx.fillRect(1226, 311, 8, 7);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(1224, 323, 3, 22);

  // Wooden 2.5D shelf lip & label.
  ctx.fillStyle = '#8f5230';
  ctx.fillRect(1130, 350, 118, 7);
  ctx.textAlign = 'center';
  ctx.font = '800 10px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = PALETTE.creamWarm;
  ctx.fillText('BUMBU DAPUR', 1189, 371);

  ctx.restore();
}

/** Cool indigo twilight tint applied over floor/walls on Day 3 before warm glows & characters are drawn. */
export function drawNightBackdrop(ctx, state) {
  const day = state.day || 1;
  if (day < 3) return;
  ctx.save();
  ctx.fillStyle = 'rgba(14, 14, 38, 0.28)';
  ctx.fillRect(0, 56, VIEW.width, VIEW.height - 56);
  ctx.restore();
}

/** Day-driven atmospheric lighting: bright afternoon (Day 1), golden sunset (Day 2), dramatic night rush (Day 3). */
export function drawAmbientLighting(ctx, state) {
  ctx.save();
  const day = state.day || 1;
  const active = state.wok.cooking || state.wok.ready;

  if (day >= 3) {
    // Warm golden-amber pools cast beneath hanging lanterns, service pass & street-side diners.
    for (const [lx, ly, rad, alpha] of [
      [472, 198, 165, 0.22],
      [820, 225, 210, 0.2],
      [1110, 198, 160, 0.22],
      [760, 352, 200, 0.16],
      [560, 608, 220, 0.22],
      [810, 608, 240, 0.22],
      [1040, 608, 210, 0.2],
    ]) {
      const halo = ctx.createRadialGradient(lx, ly, 16, lx, ly, rad);
      halo.addColorStop(0, `rgba(255, 210, 98, ${alpha})`);
      halo.addColorStop(0.55, `rgba(255, 154, 52, ${alpha * 0.35})`);
      halo.addColorStop(1, 'rgba(255, 140, 40, 0)');
      ctx.fillStyle = halo;
      circle(ctx, lx, ly, rad);
      ctx.fill();
    }
  } else if (day === 2) {
    // Unmistakable Golden Sunset (Sore) oblique warm amber rays from upper-left.
    const sunset = ctx.createLinearGradient(0, 156, 1120, 680);
    sunset.addColorStop(0, 'rgba(255, 168, 64, 0.22)');
    sunset.addColorStop(0.55, 'rgba(232, 112, 46, 0.13)');
    sunset.addColorStop(1, 'rgba(72, 28, 38, 0.16)');
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 156, VIEW.width, VIEW.height - 156);
  } else {
    // Day 1 bright afternoon sunbeam from upper-left.
    const sun = ctx.createLinearGradient(0, 156, 760, 520);
    sun.addColorStop(0, 'rgba(255, 244, 200, 0.14)');
    sun.addColorStop(1, 'rgba(255, 244, 200, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 156, VIEW.width, VIEW.height - 156);
  }

  // Subtle warm hearth light around WAJAN without washing out status pills or gauges.
  const basePulse = day >= 3 ? 0.22 : 0.18;
  const pulse = active ? basePulse + Math.sin(state.time * 9) * 0.03 : 0.08;
  const wokGlow = ctx.createRadialGradient(814, 246, 18, 814, 246, active ? 215 : 150);
  wokGlow.addColorStop(0, `rgba(255, 190, 72, ${pulse})`);
  wokGlow.addColorStop(0.55, `rgba(255, 120, 34, ${pulse * 0.45})`);
  glowStopZero(wokGlow, 'rgba(255, 120, 34, 0)');
  ctx.fillStyle = wokGlow;
  ctx.fillRect(580, 145, 470, 260);

  // Subtle warm pool over TALENAN & MEJA SAJI.
  const prepGlow = ctx.createRadialGradient(580, 212, 10, 580, 212, 130);
  prepGlow.addColorStop(0, 'rgba(255, 228, 165, 0.14)');
  prepGlow.addColorStop(1, 'rgba(255, 228, 165, 0)');
  ctx.fillStyle = prepGlow;
  ctx.fillRect(440, 140, 280, 200);

  const sajiGlow = ctx.createRadialGradient(900, 346, 15, 900, 346, 220);
  sajiGlow.addColorStop(0, state.serveGlow > 0 ? 'rgba(255, 224, 120, 0.38)' : 'rgba(255, 224, 150, 0.12)');
  sajiGlow.addColorStop(1, 'rgba(255, 224, 150, 0)');
  ctx.fillStyle = sajiGlow;
  ctx.fillRect(680, 250, 440, 220);

  // Corner vignette framing the kitchen cleanly (richer at night).
  const vig = ctx.createRadialGradient(640, 360, 410, 640, 360, 820);
  vig.addColorStop(0, 'rgba(20, 12, 10, 0)');
  vig.addColorStop(1, day >= 3 ? 'rgba(12, 7, 16, 0.44)' : day === 2 ? 'rgba(32, 14, 12, 0.28)' : 'rgba(26, 16, 10, 0.2)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 56, VIEW.width, VIEW.height - 56);
  ctx.restore();
}

function glowStopZero(grad, color) {
  grad.addColorStop(1, color);
}
