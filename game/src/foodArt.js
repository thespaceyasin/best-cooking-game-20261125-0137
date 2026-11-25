// Detailed Canvas 2D illustrations for ingredients, chopped prep, drinks, and plated Indonesian dishes.
import { DISHES } from './config.js';

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

/** Draw one ingredient icon centered at (x, y) at roughly size s pixels across. */
export function drawIngredientIcon(ctx, id, x, y, s) {
  const r = s / 2;
  ctx.save();
  ctx.translate(x, y);

  if (id === 'nasi') {
    // Steamed white rice mound with warm rim shadow & individual grain accents.
    ctx.fillStyle = '#ddd2b7';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.14, r * 0.96, r * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#99825c';
    ctx.lineWidth = Math.max(1, s * 0.05);
    ctx.stroke();

    ctx.fillStyle = '#fffdf7';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.06, r * 0.82, r * 0.56, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e5dac0';
    const grains = [
      [-0.4, -0.1],
      [-0.1, -0.28],
      [0.25, -0.18],
      [-0.22, 0.14],
      [0.16, 0.12],
      [0.42, 0.02],
    ];
    for (const [gx, gy] of grains) {
      ctx.fillRect(gx * r, gy * r, Math.max(1.5, s * 0.08), Math.max(1.2, s * 0.05));
    }
  } else if (id === 'mie') {
    // Golden wavy egg noodle nest.
    ctx.lineCap = 'round';
    for (let layer = 0; layer < 2; layer += 1) {
      ctx.strokeStyle = layer === 0 ? '#c4831b' : '#f7cf52';
      ctx.lineWidth = Math.max(2, s * (layer === 0 ? 0.13 : 0.085));
      for (let i = -1; i <= 1; i += 1) {
        const yOff = i * r * 0.42 + (layer === 0 ? 1 : 0);
        ctx.beginPath();
        ctx.moveTo(-r * 0.82, yOff);
        ctx.bezierCurveTo(-r * 0.3, yOff - r * 0.44, r * 0.3, yOff + r * 0.44, r * 0.82, yOff);
        ctx.stroke();
      }
    }
  } else if (id === 'telur') {
    // Sunny-side up egg with crispy edge & glossy yolk.
    ctx.fillStyle = '#f2e8cf';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.04, r * 0.92, r * 0.84, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c4a472';
    ctx.lineWidth = Math.max(1, s * 0.05);
    ctx.stroke();

    ctx.fillStyle = '#fffdf8';
    ctx.beginPath();
    ctx.ellipse(-r * 0.04, -r * 0.02, r * 0.78, r * 0.7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f49d24';
    circle(ctx, r * 0.06, r * 0.04, r * 0.42);
    ctx.fill();
    ctx.fillStyle = '#ffd257';
    circle(ctx, r * 0.02, 0, r * 0.28);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    circle(ctx, -r * 0.08, -r * 0.1, r * 0.1);
    ctx.fill();
  } else if (id === 'ayam') {
    // Glazed chicken drumstick with bone tip.
    ctx.strokeStyle = '#fff6e4';
    ctx.lineWidth = Math.max(2, s * 0.14);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.22, r * 0.22);
    ctx.lineTo(r * 0.74, r * 0.74);
    ctx.stroke();

    ctx.fillStyle = '#fff6e4';
    circle(ctx, r * 0.8, r * 0.66, r * 0.18);
    ctx.fill();
    circle(ctx, r * 0.66, r * 0.8, r * 0.18);
    ctx.fill();

    ctx.fillStyle = '#d46a38';
    ctx.beginPath();
    ctx.ellipse(-r * 0.14, -r * 0.12, r * 0.64, r * 0.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8b3917';
    ctx.lineWidth = Math.max(1, s * 0.05);
    ctx.stroke();

    ctx.fillStyle = '#eb8d54';
    circle(ctx, -r * 0.3, -r * 0.24, r * 0.24);
    ctx.fill();
  } else if (id === 'ayam_c' || id === 'cabai_c' || id === 'bawang_c') {
    const main = id === 'ayam_c' ? '#de7844' : id === 'cabai_c' ? '#d43a29' : '#ab72bd';
    const hi = id === 'ayam_c' ? '#f5ab78' : id === 'cabai_c' ? '#f56956' : '#d2a8e0';
    const edge = id === 'ayam_c' ? '#8c3d1a' : id === 'cabai_c' ? '#7d1b11' : '#6b3b7d';
    const pieces = [
      [-r * 0.56, -r * 0.42, 0.48],
      [r * 0.14, -r * 0.52, 0.44],
      [-r * 0.22, r * 0.14, 0.48],
      [r * 0.28, r * 0.18, 0.44],
    ];
    for (const [px, py, size] of pieces) {
      const ps = r * size;
      roundRect(ctx, px, py, ps, ps, ps * 0.28);
      ctx.fillStyle = main;
      ctx.fill();
      ctx.strokeStyle = edge;
      ctx.lineWidth = Math.max(1, s * 0.045);
      ctx.stroke();
      ctx.fillStyle = hi;
      ctx.fillRect(px + ps * 0.18, py + ps * 0.16, ps * 0.34, ps * 0.24);
    }
  } else if (id === 'kecap') {
    // Classic Indonesian kecap manis bottle with red-gold label.
    ctx.fillStyle = '#24140a';
    roundRect(ctx, -r * 0.44, -r * 0.68, r * 0.88, r * 1.44, r * 0.22);
    ctx.fill();
    ctx.strokeStyle = '#0e0703';
    ctx.lineWidth = Math.max(1, s * 0.045);
    ctx.stroke();

    // Bottle neck & gold cap.
    ctx.fillStyle = '#3c2414';
    ctx.fillRect(-r * 0.24, -r * 0.94, r * 0.48, r * 0.32);
    ctx.fillStyle = '#d93829';
    ctx.fillRect(-r * 0.26, -r * 1.02, r * 0.52, r * 0.16);

    // Label band.
    ctx.fillStyle = '#c84b31';
    ctx.fillRect(-r * 0.42, -r * 0.22, r * 0.84, r * 0.56);
    ctx.fillStyle = '#ffd447';
    ctx.fillRect(-r * 0.42, -r * 0.22, r * 0.84, r * 0.12);

    // Glass shine.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(-r * 0.28, -r * 0.54, r * 0.12, r * 1.1);
  } else if (id === 'cabai') {
    // Glossy red Indonesian chili pepper.
    ctx.fillStyle = '#cc2f1f';
    ctx.beginPath();
    ctx.moveTo(-r * 0.72, -r * 0.48);
    ctx.quadraticCurveTo(r * 0.22, -r * 0.96, r * 0.78, r * 0.48);
    ctx.quadraticCurveTo(r * 0.18, r * 0.76, -r * 0.58, r * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7d190f';
    ctx.lineWidth = Math.max(1, s * 0.045);
    ctx.stroke();

    // Highlight streak.
    ctx.strokeStyle = '#ff7b6b';
    ctx.lineWidth = Math.max(1.2, s * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.32, -r * 0.24);
    ctx.quadraticCurveTo(r * 0.15, -r * 0.36, r * 0.44, r * 0.15);
    ctx.stroke();

    // Fresh green stem.
    ctx.strokeStyle = '#278246';
    ctx.lineWidth = Math.max(2, s * 0.1);
    ctx.beginPath();
    ctx.moveTo(-r * 0.68, -r * 0.45);
    ctx.quadraticCurveTo(-r * 0.88, -r * 0.86, -r * 0.44, -r * 0.84);
    ctx.stroke();
  } else if (id === 'bawang') {
    // Purple shallot bulb with delicate ridges and green tip.
    ctx.fillStyle = '#a465b5';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.78);
    ctx.quadraticCurveTo(r * 0.86, -r * 0.18, r * 0.58, r * 0.58);
    ctx.quadraticCurveTo(0, r * 0.92, -r * 0.58, r * 0.58);
    ctx.quadraticCurveTo(-r * 0.86, -r * 0.18, 0, -r * 0.78);
    ctx.fill();
    ctx.strokeStyle = '#602e70';
    ctx.lineWidth = Math.max(1, s * 0.045);
    ctx.stroke();

    // Vertical skin stripe.
    ctx.strokeStyle = '#d39ee3';
    ctx.lineWidth = Math.max(1, s * 0.055);
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, -r * 0.45);
    ctx.quadraticCurveTo(-r * 0.34, r * 0.1, -r * 0.15, r * 0.55);
    ctx.stroke();

    ctx.strokeStyle = '#2e8a4e';
    ctx.lineWidth = Math.max(1.8, s * 0.09);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.78);
    ctx.lineTo(0, -r * 1.1);
    ctx.stroke();
  } else if (id === 'kerupuk') {
    // Crispy ruffled Indonesian prawn/tapioca cracker.
    ctx.fillStyle = '#f8d467';
    circle(ctx, 0, 0, r * 0.92);
    ctx.fill();
    ctx.strokeStyle = '#b97e1c';
    ctx.lineWidth = Math.max(1.2, s * 0.055);
    ctx.stroke();

    ctx.strokeStyle = '#df9e28';
    ctx.lineWidth = Math.max(1.2, s * 0.055);
    circle(ctx, 0, 0, r * 0.56);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.58, -r * 0.22);
    ctx.quadraticCurveTo(0, -r * 0.62, r * 0.58, -r * 0.22);
    ctx.stroke();

    ctx.fillStyle = '#fff5c4';
    circle(ctx, -r * 0.25, -r * 0.25, r * 0.14);
    ctx.fill();
  } else if (id === 'teh') {
    // Classic Indonesian ribbed gelas belimbing iced tea with ice, straw, lime wedge, and glint.
    ctx.strokeStyle = '#d94832';
    ctx.lineWidth = Math.max(1.8, s * 0.085);
    ctx.beginPath();
    ctx.moveTo(r * 0.24, -r * 0.98);
    ctx.lineTo(r * 0.04, r * 0.48);
    ctx.stroke();
    ctx.strokeStyle = '#fff5e4';
    ctx.lineWidth = Math.max(1, s * 0.04);
    ctx.beginPath();
    ctx.moveTo(r * 0.2, -r * 0.78);
    ctx.lineTo(r * 0.16, -r * 0.58);
    ctx.stroke();

    // Fresh lime slice perched on top-left rim.
    ctx.fillStyle = '#389e4b';
    circle(ctx, -r * 0.42, -r * 0.64, r * 0.28);
    ctx.fill();
    ctx.fillStyle = '#b9ee8b';
    circle(ctx, -r * 0.42, -r * 0.64, r * 0.19);
    ctx.fill();

    // Amber tea gradient body.
    const teaGrad = ctx.createLinearGradient(0, -r * 0.68, 0, r * 0.86);
    teaGrad.addColorStop(0, '#dc8629');
    teaGrad.addColorStop(0.55, '#b65b17');
    teaGrad.addColorStop(1, '#7d3409');
    ctx.fillStyle = teaGrad;
    ctx.beginPath();
    ctx.moveTo(-r * 0.56, -r * 0.68);
    ctx.lineTo(r * 0.56, -r * 0.68);
    ctx.lineTo(r * 0.42, r * 0.86);
    ctx.lineTo(-r * 0.42, r * 0.86);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff3d6';
    ctx.lineWidth = Math.max(1.3, s * 0.06);
    ctx.stroke();

    // Vertical fluted glass ribs.
    ctx.strokeStyle = 'rgba(255, 245, 224, 0.28)';
    ctx.lineWidth = Math.max(0.9, s * 0.03);
    for (const rx of [-0.22, 0.02, 0.24]) {
      ctx.beginPath();
      ctx.moveTo(r * rx, -r * 0.58);
      ctx.lineTo(r * rx * 0.78, r * 0.78);
      ctx.stroke();
    }

    // Highlight foam + sparkling translucent ice cubes.
    ctx.fillStyle = 'rgba(255, 224, 150, 0.45)';
    ctx.fillRect(-r * 0.44, -r * 0.64, r * 0.88, r * 0.2);
    ctx.fillStyle = 'rgba(220, 246, 255, 0.72)';
    roundRect(ctx, -r * 0.32, -r * 0.36, r * 0.3, r * 0.3, r * 0.07);
    ctx.fill();
    roundRect(ctx, r * 0.04, -r * 0.18, r * 0.28, r * 0.28, r * 0.07);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(-r * 0.38, -r * 0.5, r * 0.09, r * 1.12);
  } else if (id === 'es') {
    // Translucent sparkling ice cubes.
    ctx.fillStyle = '#bce6fa';
    ctx.strokeStyle = '#5da4cc';
    ctx.lineWidth = Math.max(1, s * 0.05);
    roundRect(ctx, -r * 0.64, -r * 0.46, r * 0.6, r * 0.6, r * 0.14);
    ctx.fill();
    ctx.stroke();
    roundRect(ctx, r * 0.02, r * 0.04, r * 0.6, r * 0.6, r * 0.14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(-r * 0.48, -r * 0.3, r * 0.22, r * 0.22);
    ctx.fillRect(r * 0.16, r * 0.18, r * 0.22, r * 0.22);
  }

  ctx.restore();
}

/** Draw a garnished ceramic plate or iced glass centered at (x, y) at size s. */
export function drawPlateIcon(ctx, dishId, kerupuk, x, y, s) {
  const r = s / 2;
  ctx.save();
  ctx.translate(x, y);

  if (dishId === 'esteh') {
    // Saucer coaster under glass.
    ctx.fillStyle = '#f8f2e4';
    circle(ctx, 0, r * 0.1, r * 0.78);
    ctx.fill();
    ctx.strokeStyle = '#2d7a4d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawIngredientIcon(ctx, 'teh', 0, -r * 0.04, s * 0.8);
    ctx.restore();
    return;
  }

  // Ceramic warung plate with bowl depth shadow, crisp emerald double rim & red accents.
  ctx.fillStyle = 'rgba(32, 18, 10, 0.2)';
  circle(ctx, 1, r * 0.08, r);
  ctx.fill();

  ctx.fillStyle = '#fffdf7';
  circle(ctx, 0, 0, r);
  ctx.fill();
  ctx.strokeStyle = '#bfae92';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.strokeStyle = '#1f7042';
  ctx.lineWidth = Math.max(1.8, s * 0.055);
  circle(ctx, 0, 0, r * 0.84);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(200, 75, 49, 0.55)';
  ctx.lineWidth = Math.max(1, s * 0.028);
  circle(ctx, 0, 0, r * 0.76);
  ctx.stroke();

  ctx.fillStyle = '#f2e6d0';
  circle(ctx, 0, 0, r * 0.71);
  ctx.fill();

  // Subtle rim highlight arc.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = Math.max(1.2, s * 0.038);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, -Math.PI * 0.85, -Math.PI * 0.35);
  ctx.stroke();

  const dish = DISHES[dishId];
  const isMie = dishId.includes('mie');
  const isSate = dishId.includes('sate');
  const isPedas = Boolean(dish && dish.name.includes('PEDAS'));
  const isSpesial = Boolean(dish && dish.name.includes('SPESIAL'));

  if (isSate) {
    // Rich peanut sauce puddle with kecap drizzle + 4 char-marked skewers + lontong & lime.
    ctx.fillStyle = '#8b431c';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.58, r * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331708';
    ctx.lineWidth = Math.max(1, s * 0.035);
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.04);
    ctx.quadraticCurveTo(0, r * 0.24, r * 0.32, r * 0.02);
    ctx.stroke();

    for (let k = -1; k <= 2; k += 1) {
      ctx.save();
      ctx.rotate(k * 0.21 - 0.1);
      ctx.strokeStyle = '#e7c687';
      ctx.lineWidth = Math.max(1.4, s * 0.042);
      ctx.beginPath();
      ctx.moveTo(0, r * 0.6);
      ctx.lineTo(0, -r * 0.58);
      ctx.stroke();

      for (const cy of [-0.32, -0.06, 0.2]) {
        ctx.fillStyle = '#d1692d';
        roundRect(ctx, -r * 0.12, cy * r - r * 0.08, r * 0.24, r * 0.18, r * 0.05);
        ctx.fill();
        // Grill char stripe.
        ctx.fillStyle = '#5e2309';
        ctx.fillRect(-r * 0.09, cy * r - r * 0.01, r * 0.18, r * 0.04);
      }
      ctx.restore();
    }

    // Sliced white lontong, shallots & lime wedge.
    ctx.fillStyle = '#f6f2e2';
    circle(ctx, -r * 0.38, -r * 0.2, r * 0.14);
    ctx.fill();
    ctx.fillStyle = '#b375c4';
    circle(ctx, -r * 0.36, r * 0.26, r * 0.12);
    ctx.fill();
    ctx.fillStyle = '#389e4b';
    circle(ctx, r * 0.38, r * 0.26, r * 0.15);
    ctx.fill();
    ctx.fillStyle = '#b9ee8b';
    circle(ctx, r * 0.38, r * 0.26, r * 0.09);
    ctx.fill();
  } else if (isMie) {
    // Glossy stir-fried noodles with layered golden ribbons, sawi, carrot strips & sunny egg.
    ctx.fillStyle = isPedas ? '#cf581f' : '#d99829';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.05, r * 0.64, r * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = 'round';
    for (let i = -2; i <= 1; i += 1) {
      ctx.strokeStyle = isPedas ? '#f29038' : '#ffd86b';
      ctx.lineWidth = Math.max(1.6, s * 0.058);
      ctx.beginPath();
      ctx.moveTo(-r * 0.46, i * r * 0.16);
      ctx.bezierCurveTo(-r * 0.14, i * r * 0.16 - r * 0.16, r * 0.14, i * r * 0.16 + r * 0.14, r * 0.46, i * r * 0.16);
      ctx.stroke();
    }

    // Emerald sawi leaves, carrot strips & chicken bits.
    ctx.fillStyle = '#278246';
    circle(ctx, -r * 0.3, -r * 0.28, r * 0.16);
    ctx.fill();
    circle(ctx, r * 0.32, -r * 0.2, r * 0.14);
    ctx.fill();
    ctx.fillStyle = '#eb5d2a';
    ctx.fillRect(-r * 0.14, -r * 0.34, r * 0.24, r * 0.08);
    ctx.fillStyle = '#fffdf8';
    circle(ctx, r * 0.04, r * 0.14, r * 0.22);
    ctx.fill();
    ctx.fillStyle = '#f49d24';
    circle(ctx, r * 0.06, r * 0.14, r * 0.13);
    ctx.fill();
  } else {
    // Caramelized Nasi Goreng dome + lacy telur ceplok + cucumber + tomato + scallions.
    ctx.fillStyle = isPedas ? '#c85e24' : '#db913a';
    ctx.beginPath();
    ctx.ellipse(-r * 0.04, r * 0.06, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isPedas ? '#e37e39' : '#f2b75a';
    ctx.beginPath();
    ctx.ellipse(-r * 0.06, -r * 0.03, r * 0.46, r * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle rice grain texture dots.
    ctx.fillStyle = 'rgba(255, 245, 214, 0.5)';
    for (const [gx, gy] of [[-0.2, 0.05], [-0.04, 0.22], [0.18, 0.14], [-0.26, -0.14]]) {
      ctx.fillRect(gx * r, gy * r, Math.max(1.5, s * 0.05), Math.max(1.2, s * 0.035));
    }

    // Crisp cucumber slices & red tomato wedge on upper-left rim.
    ctx.fillStyle = '#2d8a4b';
    circle(ctx, -r * 0.44, -r * 0.3, r * 0.16);
    ctx.fill();
    ctx.fillStyle = '#c4eea9';
    circle(ctx, -r * 0.44, -r * 0.3, r * 0.1);
    ctx.fill();

    ctx.fillStyle = '#d43a29';
    circle(ctx, -r * 0.48, r * 0.07, r * 0.15);
    ctx.fill();

    // Lacy telur ceplok on top (bigger on spesial, classic fried egg on regular/pedas).
    const eggR = isSpesial ? r * 0.29 : r * 0.24;
    ctx.fillStyle = '#efe0bf';
    circle(ctx, r * 0.12, -r * 0.12, eggR + r * 0.03);
    ctx.fill();
    ctx.fillStyle = '#fffdf8';
    circle(ctx, r * 0.11, -r * 0.13, eggR);
    ctx.fill();
    ctx.fillStyle = '#f49d24';
    circle(ctx, r * 0.13, -r * 0.12, eggR * 0.56);
    ctx.fill();
    ctx.fillStyle = '#ffd65a';
    circle(ctx, r * 0.11, -r * 0.14, eggR * 0.35);
    ctx.fill();

    if (isSpesial) {
      ctx.fillStyle = '#b85328';
      roundRect(ctx, -r * 0.28, r * 0.08, r * 0.32, r * 0.18, r * 0.06);
      ctx.fill();
    }
    ctx.fillStyle = '#2d8a4b';
    ctx.fillRect(-r * 0.18, -r * 0.26, r * 0.12, r * 0.08);
  }

  if (isPedas) {
    drawIngredientIcon(ctx, 'cabai', r * 0.34, -r * 0.26, s * 0.34);
  }
  if (kerupuk) {
    drawIngredientIcon(ctx, 'kerupuk', r * 0.5, r * 0.44, s * 0.46);
  }

  ctx.restore();
}

/** Draw a glossy kecap manis soy-sauce drizzle inside the wok before cooking starts. */
export function drawKecapSplash(ctx, x, y, s) {
  const r = s * 0.52;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#261207';
  ctx.beginPath();
  ctx.ellipse(0, 2, r * 0.9, r * 0.55, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5c2d12';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 214, 150, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.25, -r * 0.05, r * 0.35, r * 0.14, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw realistic sizzling stir-fry inside the cast-iron wok while cooking, ready, or burnt. */
export function drawWokCookingDish(ctx, dishId, progress, time, x, y, burnt) {
  ctx.save();
  const toss = burnt ? 0 : Math.sin(time * 22) * 1.4;
  ctx.translate(x, y + toss);

  if (burnt) {
    ctx.fillStyle = '#1b1412';
    ctx.beginPath();
    ctx.ellipse(0, 0, 56, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c83b28';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-24, -2);
    ctx.lineTo(-8, 3);
    ctx.lineTo(12, -3);
    ctx.lineTo(28, 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const p = Math.max(0, Math.min(1, progress || 0));
  const id = dishId || 'nasgor';
  const isMie = id.includes('mie');
  const isSate = id.includes('sate');
  const isPedas = id.includes('pedas');
  const isSpesial = id.includes('spesial');

  if (isSate) {
    // Rich sizzling peanut/kecap glaze + 4 fanned bamboo skewers.
    ctx.fillStyle = '#8b431c';
    ctx.beginPath();
    ctx.ellipse(0, 1, 56, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let k = -1; k <= 2; k += 1) {
      const sy = k * 5 - 3;
      ctx.strokeStyle = '#e7c682';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-44, sy);
      ctx.lineTo(40, sy);
      ctx.stroke();
      ctx.fillStyle = '#d46a32';
      for (const cx of [-22, -4, 14]) {
        roundRect(ctx, cx, sy - 3.5, 11, 7, 2.5);
        ctx.fill();
        ctx.fillStyle = '#5e2309';
        ctx.fillRect(cx + 4, sy - 3.5, 2.5, 7);
        ctx.fillStyle = '#d46a32';
      }
    }
    ctx.fillStyle = '#ab6bc0';
    circle(ctx, -30, 5, 3);
    ctx.fill();
    circle(ctx, 26, -4, 3);
    ctx.fill();
  } else if (isMie) {
    // Tangled golden/amber wok-tossed noodle ribbons + sawi + egg bits.
    ctx.fillStyle = isPedas ? '#c95a22' : '#d8992e';
    ctx.beginPath();
    ctx.ellipse(0, 1, 60, 15.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isPedas ? '#f28c38' : '#ffd55a';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    for (let row = -1; row <= 1; row += 1) {
      ctx.beginPath();
      ctx.moveTo(-45, row * 4.5);
      ctx.bezierCurveTo(-18, row * 4.5 - 6, 18, row * 4.5 + 6, 45, row * 4.5);
      ctx.stroke();
    }
    ctx.fillStyle = '#2d8a4e';
    for (const [gx, gy] of [[-24, -4], [14, -5], [-4, 5], [26, 3]]) {
      circle(ctx, gx, gy, 3.5);
      ctx.fill();
    }
    ctx.fillStyle = '#ffe073';
    circle(ctx, -10, -2, 3.5);
    ctx.fill();
    circle(ctx, 18, 1, 3);
    ctx.fill();
  } else {
    // Nasi Goreng mound caramelizing from pale rice/soy to rich amber-gold.
    const rCol = Math.round(238 - p * 22);
    const gCol = Math.round(202 - p * 46);
    const bCol = Math.round(138 - p * 74);
    ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
    ctx.beginPath();
    ctx.ellipse(0, 1, 60, 15.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isPedas ? '#d96f32' : '#e6a34a';
    ctx.beginPath();
    ctx.ellipse(-2, -1, 48, 11.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scrambled egg flecks & green scallions.
    ctx.fillStyle = '#ffd85c';
    for (const [ex, ey] of [[-26, -3], [-6, -4], [16, -2], [28, 3], [-14, 4]]) {
      circle(ctx, ex, ey, 3.2);
      ctx.fill();
    }
    ctx.fillStyle = '#2e8b4e';
    for (const [sx, sy] of [[-20, 2], [4, 3], [22, -4], [-34, 1]]) {
      ctx.fillRect(sx, sy, 4.5, 2.5);
    }
    if (isSpesial) {
      ctx.fillStyle = '#c85a2b';
      for (const [ax, ay] of [[-12, -1], [10, 1], [0, -5]]) {
        roundRect(ctx, ax, ay, 7, 5, 1.5);
        ctx.fill();
      }
    }
  }

  if (isPedas) {
    ctx.fillStyle = '#d42c1c';
    for (const [cx, cy] of [[-22, -2], [8, -4], [24, 2], [-4, 5]]) {
      circle(ctx, cx, cy, 2.8);
      ctx.fill();
    }
  }

  // Glossy oil sizzle sheen highlights.
  ctx.fillStyle = 'rgba(255, 245, 210, 0.45)';
  circle(ctx, -16 + Math.sin(time * 15) * 4, -4, 2);
  ctx.fill();
  circle(ctx, 12 + Math.cos(time * 13) * 4, 2, 1.8);
  ctx.fill();
  ctx.restore();
}

/** Delicate rising steam curls above a freshly plated hot dish. */
export function drawPlateSteam(ctx, x, y, time, scale = 1) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 252, 240, 0.78)';
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i += 1) {
    const sx = x + i * 8 * scale;
    const phase = time * 2.8 + i * 1.4;
    const drift = Math.sin(phase) * 2.6 * scale;
    ctx.beginPath();
    ctx.moveTo(sx, y + 3 * scale);
    ctx.quadraticCurveTo(sx + drift, y - 3 * scale, sx - drift * 0.6, y - 9 * scale);
    ctx.stroke();
  }
  ctx.restore();
}
