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

/** Handmade warm terracotta/cream tiled floor with subtle variation, grout, and baseboard. */
export function drawWarmFloor(ctx) {
  // Upper wall behind the top counter row.
  const wallGrad = ctx.createLinearGradient(0, 56, 0, 166);
  wallGrad.addColorStop(0, PALETTE.wallShade);
  wallGrad.addColorStop(0.55, PALETTE.wall);
  wallGrad.addColorStop(1, '#ecd3a9');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 56, VIEW.width, 110);

  // Subtle vertical wood wainscoting slats on upper wall.
  ctx.fillStyle = 'rgba(111, 69, 37, 0.08)';
  for (let x = 12; x < VIEW.width; x += 44) {
    ctx.fillRect(x, 56, 4, 108);
  }

  // Handmade tiled floor below y=164.
  const tile = 80;
  const startY = 164;
  const tilePalette = [PALETTE.floorA, PALETTE.floorB, PALETTE.floorC, PALETTE.floorD];

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 16; col += 1) {
      const x = col * tile;
      const y = startY + row * tile;
      const h = tileHash(row, col);
      const isAlt = (row + col) % 2 === 0;
      const baseColor = isAlt
        ? (h > 0.45 ? tilePalette[0] : tilePalette[3])
        : (h > 0.5 ? tilePalette[1] : tilePalette[2]);

      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, tile, tile);

      // Soft warm terracotta corner diamond inlay every 2x2 intersection.
      if ((row + col) % 2 === 0 && h > 0.3) {
        ctx.fillStyle = 'rgba(200, 75, 49, 0.06)';
        ctx.fillRect(x + 6, y + 6, tile - 12, tile - 12);
      }

      // Subtle ceramic top-left bevel highlight & bottom-right shadow.
      ctx.fillStyle = 'rgba(255, 250, 238, 0.28)';
      ctx.fillRect(x + 2, y + 2, tile - 4, 2);
      ctx.fillRect(x + 2, y + 2, 2, tile - 4);
      ctx.fillStyle = 'rgba(110, 70, 35, 0.07)';
      ctx.fillRect(x + 2, y + tile - 3, tile - 4, 2);

      // Tiny baked clay speckle on some tiles.
      if (h > 0.72) {
        ctx.fillStyle = 'rgba(130, 82, 44, 0.14)';
        circle(ctx, x + 22 + Math.floor(h * 34), y + 24 + Math.floor((h * 19) % 30), 2);
        ctx.fill();
      }
    }
  }

  // Recessed warm grout grid.
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 1.5;
  for (let col = 0; col <= 16; col += 1) {
    ctx.beginPath();
    ctx.moveTo(col * tile, startY);
    ctx.lineTo(col * tile, VIEW.height);
    ctx.stroke();
  }
  for (let row = 0; row <= 7; row += 1) {
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
  const baseShadow = ctx.createLinearGradient(0, 166, 0, 186);
  baseShadow.addColorStop(0, 'rgba(35, 23, 17, 0.22)');
  baseShadow.addColorStop(1, 'rgba(35, 23, 17, 0)');
  ctx.fillStyle = baseShadow;
  ctx.fillRect(0, 166, VIEW.width, 20);
}

/** Striped terracotta-and-cream warung awning rim along the upper service edge. */
export function drawWarungAwning(ctx) {
  const y = 150;
  const stripeW = 32;
  ctx.save();
  ctx.fillStyle = 'rgba(35, 23, 17, 0.22)';
  ctx.fillRect(0, y + 12, VIEW.width, 6);

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
  ctx.restore();
}

/** Braided pandan/batik woven runner mat in the central cook corridor. */
export function drawKitchenMat(ctx) {
  const mx = 276;
  const my = 428;
  const mw = 796;
  const mh = 142;

  ctx.save();
  // Ground shadow under mat.
  roundRect(ctx, mx + 3, my + 4, mw, mh, 14);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.16)';
  ctx.fill();

  // Outer woven pandan-green border.
  roundRect(ctx, mx, my, mw, mh, 14);
  ctx.fillStyle = PALETTE.green;
  ctx.fill();
  ctx.strokeStyle = '#144a2c';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner terracotta & warm straw field.
  roundRect(ctx, mx + 9, my + 9, mw - 18, mh - 18, 10);
  ctx.fillStyle = '#c58f55';
  ctx.fill();

  // Terracotta double trim line inside mat.
  roundRect(ctx, mx + 14, my + 14, mw - 28, mh - 28, 7);
  ctx.strokeStyle = PALETTE.terracotta;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Subtle woven diagonal reed stripes clipped inside mat.
  ctx.save();
  roundRect(ctx, mx + 16, my + 16, mw - 32, mh - 32, 6);
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 246, 224, 0.16)';
  for (let x = mx - 40; x < mx + mw + 40; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, my + 16);
    ctx.lineTo(x + 9, my + 16);
    ctx.lineTo(x - 24, my + mh - 16);
    ctx.lineTo(x - 33, my + mh - 16);
    ctx.closePath();
    ctx.fill();
  }
  // Center batik diamond medallion.
  const cx = mx + mw / 2;
  const cy = my + mh / 2;
  ctx.fillStyle = 'rgba(31, 111, 67, 0.16)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 34);
  ctx.lineTo(cx + 58, cy);
  ctx.lineTo(cx, cy + 34);
  ctx.lineTo(cx - 58, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 75, 49, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Left and right woven cotton fringes.
  ctx.strokeStyle = PALETTE.creamWarm;
  ctx.lineWidth = 2;
  for (let fy = my + 18; fy <= my + mh - 18; fy += 10) {
    ctx.beginPath();
    ctx.moveTo(mx - 8, fy);
    ctx.lineTo(mx, fy);
    ctx.moveTo(mx + mw, fy);
    ctx.lineTo(mx + mw + 8, fy);
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
    { x: 472, y: 150, r: 10 },
    { x: 820, y: 150, r: 12 },
    { x: 1110, y: 150, r: 10 },
  ];
  for (let i = 0; i < lanterns.length; i += 1) {
    const l = lanterns[i];
    const sway = Math.sin(state.time * 1.1 + i * 1.4) * 2.5;
    const lx = l.x + sway;
    const ly = l.y + 18;
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

  // Pandan / tropical leaves radiating cleanly.
  const leaves = [
    { ang: -2.5, len: 34, w: 9, c: '#1f6f43' },
    { ang: -2.0, len: 42, w: 10, c: '#2d8a55' },
    { ang: -1.55, len: 46, w: 10, c: '#38a165' },
    { ang: -1.1, len: 40, w: 10, c: '#2d8a55' },
    { ang: -0.65, len: 33, w: 9, c: '#1f6f43' },
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
    ctx.strokeStyle = '#144a2c';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** Cozy bottom-half props (supply crates, baskets, blek kerupuk, street dining counter, stools, plant). */
export function drawForegroundProps(ctx) {
  ctx.save();

  // --- Left wall corner: terracotta kendi water jug & herb planter (x: 24..116, y: 446..556) ---
  // Low wooden stand.
  roundRect(ctx, 22, 466, 86, 86, 10);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.2)';
  ctx.fill();
  roundRect(ctx, 18, 460, 86, 86, 10);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Clay kendi water pitcher on stand.
  circle(ctx, 48, 504, 17);
  ctx.fillStyle = '#b95932';
  ctx.fill();
  ctx.strokeStyle = '#732e16';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  circle(ctx, 48, 500, 7);
  ctx.fillStyle = '#732e16';
  ctx.fill();
  ctx.fillStyle = '#d97a4f';
  circle(ctx, 42, 496, 4);
  ctx.fill();

  // Small potted green scallion / daun bawang herb.
  circle(ctx, 82, 506, 13);
  ctx.fillStyle = '#c84b31';
  ctx.fill();
  ctx.strokeStyle = '#7c2414';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  for (const [lx, ly] of [[-4, -6], [3, -8], [5, -1], [-2, 3]]) {
    ctx.fillStyle = '#2d8a55';
    circle(ctx, 82 + lx, 506 + ly, 5.5);
    ctx.fill();
  }

  // --- Bottom-left warung supply corner beside SAMPAH (x: 170..436, y: 598..686) ---
  // Low wooden pallet/crate.
  roundRect(ctx, 174, 622, 186, 62, 8);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.2)';
  ctx.fill();
  roundRect(ctx, 170, 616, 186, 62, 8);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Wood plank slats.
  ctx.strokeStyle = 'rgba(71, 37, 18, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(174, 636);
  ctx.lineTo(352, 636);
  ctx.moveTo(174, 656);
  ctx.lineTo(352, 656);
  ctx.stroke();

  // Woven basket of fresh red chilies.
  circle(ctx, 206, 638, 22);
  ctx.fillStyle = '#c99352';
  ctx.fill();
  ctx.strokeStyle = '#7c5025';
  ctx.lineWidth = 2;
  ctx.stroke();
  const chiliOffs = [
    [-7, -5, -0.4],
    [4, -7, 0.3],
    [-4, 4, 0.2],
    [7, 5, -0.5],
    [0, -1, 0.6],
  ];
  for (const [ox, oy, rot] of chiliOffs) {
    ctx.save();
    ctx.translate(206 + ox, 638 + oy);
    ctx.rotate(rot);
    ctx.fillStyle = '#c83b28';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Woven basket of purple shallots & garlic.
  circle(ctx, 260, 638, 20);
  ctx.fillStyle = '#c99352';
  ctx.fill();
  ctx.strokeStyle = '#7c5025';
  ctx.lineWidth = 2;
  ctx.stroke();
  const onionPos = [
    [-6, -4, '#a66fb5'],
    [5, -4, '#b884c7'],
    [-3, 5, '#995da8'],
    [6, 5, '#f2e8d0'],
  ];
  for (const [ox, oy, c] of onionPos) {
    ctx.fillStyle = c;
    circle(ctx, 260 + ox, 638 + oy, 5.5);
    ctx.fill();
  }

  // Stacked classic Indonesian ayam-jago white ceramic bowls.
  for (let b = 0; b < 3; b += 1) {
    const bx = 316;
    const by = 648 - b * 7;
    ctx.fillStyle = '#fbf6ec';
    ctx.beginPath();
    ctx.ellipse(bx, by, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2d7a4d';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // Iconic blue blek kerupuk tin right beside the crate.
  drawBlekKerupuk(ctx, 372, 622);

  // --- Bottom-right customer warung dining bar & stools (x: 840..1260, y: 580..688) ---
  // Customer round wooden stools tucked in front of the dining bar.
  for (const sx of [908, 1020]) {
    ctx.fillStyle = 'rgba(35, 23, 17, 0.22)';
    circle(ctx, sx + 2, 608, 20);
    ctx.fill();
    ctx.fillStyle = PALETTE.woodLight;
    circle(ctx, sx, 604, 19);
    ctx.fill();
    ctx.strokeStyle = PALETTE.woodEdge;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(71, 37, 18, 0.35)';
    ctx.lineWidth = 1;
    circle(ctx, sx, 604, 12);
    ctx.stroke();
  }

  // Customer dining table / bar counter along the bottom right.
  roundRect(ctx, 848, 630, 326, 56, 10);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.22)';
  ctx.fill();
  roundRect(ctx, 844, 624, 326, 56, 10);
  ctx.fillStyle = PALETTE.woodTop;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Warm terracotta-and-cream batik table runner on the bar.
  roundRect(ctx, 864, 632, 286, 40, 6);
  ctx.fillStyle = PALETTE.terracotta;
  ctx.fill();
  ctx.strokeStyle = PALETTE.goldBright;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.creamWarm;
  for (let dx = 882; dx <= 1132; dx += 36) {
    ctx.beginPath();
    ctx.moveTo(dx, 646);
    ctx.lineTo(dx + 7, 652);
    ctx.lineTo(dx, 658);
    ctx.lineTo(dx - 7, 652);
    ctx.closePath();
    ctx.fill();
  }

  // Condiment caddy: tissue box, sambal jar, kecap bottle, and spoon cup.
  roundRect(ctx, 882, 637, 40, 26, 4);
  ctx.fillStyle = '#fff9ee';
  ctx.fill();
  ctx.strokeStyle = '#c88b4b';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#d9d0be';
  ctx.fillRect(892, 646, 20, 6);

  // Sambal jar.
  circle(ctx, 948, 650, 10);
  ctx.fillStyle = '#a8291b';
  ctx.fill();
  ctx.strokeStyle = '#fff5e0';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Mini kecap bottle.
  circle(ctx, 976, 650, 8);
  ctx.fillStyle = '#28170b';
  ctx.fill();
  ctx.strokeStyle = '#f4b942';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Empty customer cup & saucer awaiting service.
  circle(ctx, 1046, 650, 14);
  ctx.fillStyle = '#fbf6ec';
  ctx.fill();
  ctx.strokeStyle = '#2d7a4d';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  circle(ctx, 1046, 650, 8);
  ctx.fillStyle = '#d9b583';
  ctx.fill();

  // Lush terracotta potted plant in the bottom-right corner.
  drawPottedPlant(ctx, 1216, 642);

  // Decorative hanging chili/garlic braid & framed spice rack on right wall margin (x: 1134..1254, y: 296..392).
  roundRect(ctx, 1130, 300, 128, 92, 10);
  ctx.fillStyle = 'rgba(35, 23, 17, 0.16)';
  ctx.fill();
  roundRect(ctx, 1126, 296, 128, 92, 10);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, 1134, 304, 112, 76, 6);
  ctx.fillStyle = '#3b2318';
  ctx.fill();
  // Spice jars on shelf.
  const jarColors = ['#f4b942', '#c84b31', '#2f8f59', '#e5cba3'];
  for (let j = 0; j < 4; j += 1) {
    const jx = 1144 + j * 25;
    roundRect(ctx, jx, 318, 18, 30, 4);
    ctx.fillStyle = jarColors[j];
    ctx.fill();
    ctx.strokeStyle = '#fff5e0';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#c88b4b';
    ctx.fillRect(jx + 2, 314, 14, 5);
  }
  ctx.fillStyle = '#8f5230';
  ctx.fillRect(1134, 352, 112, 6);
  ctx.textAlign = 'center';
  ctx.font = '700 10px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = PALETTE.creamWarm;
  ctx.fillText('BUMBU DAPUR', 1190, 372);

  ctx.restore();
}

/** Warm overhead wok glow, prep spotlights, and gentle warm edge vignette. */
export function drawAmbientLighting(ctx, state) {
  ctx.save();
  // Warm wok fire & lantern glow centered over WAJAN (820, 215).
  const active = state.wok.cooking || state.wok.ready;
  const pulse = active ? 0.31 + Math.sin(state.time * 9) * 0.05 : 0.12;
  const wokGlow = ctx.createRadialGradient(820, 218, 22, 820, 224, active ? 250 : 180);
  wokGlow.addColorStop(0, `rgba(255, 198, 82, ${pulse})`);
  wokGlow.addColorStop(0.5, `rgba(255, 128, 38, ${pulse * 0.5})`);
  glowStopZero(wokGlow, 'rgba(255, 128, 38, 0)');
  ctx.fillStyle = wokGlow;
  ctx.fillRect(550, 140, 540, 300);

  // Subtle warm pool over TALENAN & MEJA SAJI.
  const prepGlow = ctx.createRadialGradient(580, 212, 10, 580, 212, 130);
  prepGlow.addColorStop(0, 'rgba(255, 228, 165, 0.11)');
  prepGlow.addColorStop(1, 'rgba(255, 228, 165, 0)');
  ctx.fillStyle = prepGlow;
  ctx.fillRect(440, 140, 280, 200);

  const sajiGlow = ctx.createRadialGradient(900, 346, 15, 900, 346, 200);
  sajiGlow.addColorStop(0, state.serveGlow > 0 ? 'rgba(255, 224, 120, 0.28)' : 'rgba(255, 224, 150, 0.09)');
  sajiGlow.addColorStop(1, 'rgba(255, 224, 150, 0)');
  ctx.fillStyle = sajiGlow;
  ctx.fillRect(690, 250, 420, 220);

  // Gentle warm evening corner vignette (keeps center crisp and readable).
  const vig = ctx.createRadialGradient(640, 360, 420, 640, 360, 820);
  vig.addColorStop(0, 'rgba(26, 16, 10, 0)');
  vig.addColorStop(1, 'rgba(26, 16, 10, 0.24)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 56, VIEW.width, VIEW.height - 56);
  ctx.restore();
}

function glowStopZero(grad, color) {
  grad.addColorStop(1, color);
}
