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
    // Tall frosted glass of iced amber sweet tea with straw.
    ctx.strokeStyle = '#d94832';
    ctx.lineWidth = Math.max(1.5, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(r * 0.18, -r * 0.95);
    ctx.lineTo(r * 0.05, r * 0.4);
    ctx.stroke();

    ctx.fillStyle = '#b9641b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.56, -r * 0.68);
    ctx.lineTo(r * 0.56, -r * 0.68);
    ctx.lineTo(r * 0.42, r * 0.84);
    ctx.lineTo(-r * 0.42, r * 0.84);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff3d6';
    ctx.lineWidth = Math.max(1.2, s * 0.06);
    ctx.stroke();

    // Highlight & foam.
    ctx.fillStyle = 'rgba(255, 224, 150, 0.45)';
    ctx.fillRect(-r * 0.44, -r * 0.64, r * 0.88, r * 0.22);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillRect(-r * 0.28, -r * 0.3, r * 0.26, r * 0.26);
    ctx.fillRect(r * 0.04, -r * 0.12, r * 0.24, r * 0.24);
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

  // Ceramic warung plate with classic green/terracotta rim stripe.
  ctx.fillStyle = '#fffdf7';
  circle(ctx, 0, 0, r);
  ctx.fill();
  ctx.strokeStyle = '#bfae92';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = '#277a4b';
  ctx.lineWidth = Math.max(1.5, s * 0.045);
  circle(ctx, 0, 0, r * 0.8);
  ctx.stroke();

  ctx.fillStyle = '#f4ebd9';
  circle(ctx, 0, 0, r * 0.7);
  ctx.fill();

  const dish = DISHES[dishId];
  const isMie = dishId.includes('mie');
  const isSate = dishId.includes('sate');
  const isPedas = Boolean(dish && dish.name.includes('PEDAS'));
  const isSpesial = Boolean(dish && dish.name.includes('SPESIAL'));

  if (isSate) {
    // Peanut sauce puddle + 4 fanned grilled chicken skewers + lime wedge.
    ctx.fillStyle = '#9c5223';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.56, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let k = -1; k <= 2; k += 1) {
      ctx.save();
      ctx.rotate(k * 0.22 - 0.1);
      ctx.strokeStyle = '#e5c687';
      ctx.lineWidth = Math.max(1.2, s * 0.04);
      ctx.beginPath();
      ctx.moveTo(0, r * 0.58);
      ctx.lineTo(0, -r * 0.56);
      ctx.stroke();

      ctx.fillStyle = '#d16f33';
      for (const cy of [-0.3, -0.05, 0.2]) {
        roundRect(ctx, -r * 0.11, cy * r - r * 0.08, r * 0.22, r * 0.18, r * 0.05);
        ctx.fill();
      }
      ctx.restore();
    }

    // Fresh shallot & lime garnish.
    ctx.fillStyle = '#b375c4';
    circle(ctx, -r * 0.34, r * 0.25, r * 0.12);
    ctx.fill();
    ctx.fillStyle = '#47a64a';
    circle(ctx, r * 0.36, r * 0.26, r * 0.14);
    ctx.fill();
  } else if (isMie) {
    // Glossy stir-fried noodles with green sawi leaves & carrot strips.
    ctx.fillStyle = isPedas ? '#d96426' : '#e6ab35';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.04, r * 0.62, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isPedas ? '#f29038' : '#ffd86b';
    ctx.lineWidth = Math.max(1.5, s * 0.06);
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, i * r * 0.2);
      ctx.quadraticCurveTo(0, i * r * 0.2 - r * 0.18, r * 0.45, i * r * 0.2);
      ctx.stroke();
    }

    // Leafy green sawi & fried shallots.
    ctx.fillStyle = '#2c8a4b';
    circle(ctx, -r * 0.28, -r * 0.28, r * 0.15);
    ctx.fill();
    circle(ctx, r * 0.3, -r * 0.22, r * 0.13);
    ctx.fill();
    ctx.fillStyle = '#d94d26';
    ctx.fillRect(-r * 0.08, -r * 0.32, r * 0.24, r * 0.08);
    // Sunny egg yolk accent on noodles.
    ctx.fillStyle = '#ffd257';
    circle(ctx, r * 0.04, r * 0.14, r * 0.14);
    ctx.fill();
  } else {
    // Caramelized Nasi Goreng dome + cucumber slices + tomato + egg / chicken topping.
    ctx.fillStyle = isPedas ? '#cc662b' : '#df9842';
    ctx.beginPath();
    ctx.ellipse(-r * 0.04, r * 0.04, r * 0.58, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isPedas ? '#e3803b' : '#f0b65b';
    ctx.beginPath();
    ctx.ellipse(-r * 0.06, -r * 0.04, r * 0.44, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fresh cucumber slices on rim.
    ctx.fillStyle = '#389950';
    circle(ctx, -r * 0.44, -r * 0.3, r * 0.16);
    ctx.fill();
    ctx.fillStyle = '#bfe8a9';
    circle(ctx, -r * 0.44, -r * 0.3, r * 0.1);
    ctx.fill();

    // Tomato wedge.
    ctx.fillStyle = '#d43a29';
    circle(ctx, -r * 0.48, r * 0.06, r * 0.14);
    ctx.fill();

    // Sunny-side egg or chicken garnish on top.
    if (isSpesial) {
      ctx.fillStyle = '#fffdf7';
      circle(ctx, r * 0.12, -r * 0.14, r * 0.26);
      ctx.fill();
      ctx.fillStyle = '#f49d24';
      circle(ctx, r * 0.14, -r * 0.12, r * 0.14);
      ctx.fill();
      ctx.fillStyle = '#b85328';
      roundRect(ctx, -r * 0.28, r * 0.06, r * 0.3, r * 0.18, r * 0.06);
      ctx.fill();
    } else {
      ctx.fillStyle = '#2d8247';
      ctx.fillRect(-r * 0.12, -r * 0.24, r * 0.14, r * 0.1);
      ctx.fillStyle = '#ffd257';
      circle(ctx, r * 0.14, -r * 0.08, r * 0.14);
      ctx.fill();
    }
  }

  if (isPedas) {
    drawIngredientIcon(ctx, 'cabai', r * 0.34, -r * 0.26, s * 0.32);
  }
  if (kerupuk) {
    drawIngredientIcon(ctx, 'kerupuk', r * 0.5, r * 0.44, s * 0.44);
  }

  ctx.restore();
}
