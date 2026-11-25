// The game's rules and state, with no drawing and no browser in it: the cook, the
// stations, the tickets, cooking, serving, days, score and losing. step() advances one
// fixed step and returns what happened as bit flags, so the caller can react (sounds,
// announcements) without the world knowing about screens or sound. Every random choice
// comes from the seeded random source, so the same seed plays the same game.

import { createRandom } from './random.js';
import {
  BOARD,
  BURN_GRACE,
  CHOPS_NEEDED,
  COMBO_WINDOW,
  COOK,
  DAYS,
  DISHES,
  INGREDIENTS,
  MAX_FAILS_PER_DAY,
  PERFECT_WINDOW,
  POUR_SECONDS,
  STATIONS,
  WALK,
  choppedId,
} from './config.js';

export const EVENT_CLICK = 1;
export const EVENT_PICKUP = 2;
export const EVENT_CHOP = 4;
export const EVENT_COOK_START = 8;
export const EVENT_READY = 16;
export const EVENT_PLATE = 32;
export const EVENT_SERVE = 64;
export const EVENT_PERFECT = 128;
export const EVENT_FAIL = 256;
export const EVENT_BURN = 512;
export const EVENT_POUR = 1024;
export const EVENT_ERROR = 2048;
export const EVENT_TRASH = 4096;
export const EVENT_DAY_CLEAR = 8192;
export const EVENT_WIN = 16384;
export const EVENT_OVER = 32768;

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  return a.every((item) => b.includes(item));
}

function matchRecipe(contents) {
  for (const [id, dish] of Object.entries(DISHES)) {
    if (dish.wok && sameSet(contents, dish.wok)) return id;
  }
  return null;
}

function isPartialRecipe(contents) {
  if (contents.length === 0) return true;
  return Object.values(DISHES).some((dish) => dish.wok && contents.every((item) => dish.wok.includes(item)));
}

export function createWorld(random) {
  const state = {
    day: 1,
    time: 0,
    timeLeft: 0,
    coins: 0,
    combo: 0,
    comboTimer: 0,
    failsToday: 0,
    failed: 0,
    served: 0,
    servedToday: 0,
    quota: 0,
    spawnTimer: 0,
    ticketSeq: 0,
    tickets: [],
    cook: { x: 640, y: 560, tx: null, ty: null, busy: 0, face: 1 },
    hands: [null, null, null],
    wok: { contents: [], cooking: false, progress: 0, dishId: null, ready: false, readyTimer: 0, burnt: false, invalid: false },
    board: { item: null, chops: 0 },
    plates: [null, null],
    serveSlots: [
      { item: null, timer: 0 },
      { item: null, timer: 0 },
    ],
    dispenser: { pouring: false, progress: 0 },
    particles: [],
    fx: [],
    floats: [],
    flash: 0,
    talenanFlash: 0,
    burnFlash: 0,
    serveGlow: 0,
    overReason: null,
    dayBonus: 0,
  };
  let pendingAction = null;
  let fxRand = createRandom(0x517cc1b7);

  function dayParams() {
    return DAYS[state.day - 1];
  }

  function reset(day) {
    state.day = day;
    fxRand = createRandom(((day * 2654435761) ^ 0x517cc1b7) >>> 0);
    if (day === 1) {
      // A fresh run: the title screen's attract mode and a restart both come
      // through here, so the run totals start over instead of keeping the
      // orders the attract mode let fail.
      state.coins = 0;
      state.served = 0;
      state.failed = 0;
    }
    const params = dayParams();
    state.time = 0;
    state.timeLeft = params.timeLimit;
    state.combo = 0;
    state.comboTimer = 0;
    state.failsToday = 0;
    state.servedToday = 0;
    state.quota = params.quota;
    state.spawnTimer = 2;
    state.tickets = [];
    state.cook.x = 640;
    state.cook.y = 560;
    state.cook.tx = null;
    state.cook.ty = null;
    state.cook.busy = 0;
    state.hands = [null, null, null];
    state.wok = { contents: [], cooking: false, progress: 0, dishId: null, ready: false, readyTimer: 0, burnt: false, invalid: false };
    state.board = { item: null, chops: 0 };
    state.plates = [null, null];
    state.serveSlots = [
      { item: null, timer: 0 },
      { item: null, timer: 0 },
    ];
    state.dispenser = { pouring: false, progress: 0 };
    state.particles = [];
    state.fx = [];
    state.floats = [];
    state.flash = 0;
    state.talenanFlash = 0;
    state.burnFlash = 0;
    state.serveGlow = 0;
    state.overReason = null;
    state.dayBonus = 0;
    pendingAction = null;
  }

  function nextDay() {
    reset(state.day + 1);
  }

  function addFloat(x, y, text, color, life = 1.4) {
    state.floats.push({ x, y, text, color, life, maxLife: life });
    if (state.floats.length > 24) state.floats.shift();
  }

  function addFx(entry) {
    state.fx.push(entry);
    if (state.fx.length > 140) state.fx.shift();
  }

  function emitChopBits(color) {
    state.talenanFlash = 1;
    for (let i = 0; i < 10; i += 1) {
      const ang = fxRand.range(-Math.PI * 0.92, -Math.PI * 0.08);
      const spd = fxRand.range(55, 130);
      addFx({
        kind: 'chop',
        x: 524 + fxRand.range(-10, 10),
        y: 218 + fxRand.range(-6, 6),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: fxRand.range(4.2, 6.8),
        grow: 0,
        life: fxRand.range(0.36, 0.58),
        maxLife: 0.58,
        color,
      });
    }
  }

  function emitSparkles(x, y, count, color = '#ffd86b') {
    for (let i = 0; i < count; i += 1) {
      const ang = (Math.PI * 2 * i) / count + fxRand.range(-0.2, 0.2);
      const spd = fxRand.range(28, 82);
      addFx({
        kind: 'sparkle',
        x: x + fxRand.range(-12, 12),
        y: y + fxRand.range(-8, 8),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 14,
        size: fxRand.range(4.5, 7.5),
        grow: -2,
        life: fxRand.range(0.4, 0.75),
        maxLife: 0.75,
        color,
      });
    }
  }

  function emitSmokePuff(x, y, count, color) {
    for (let i = 0; i < count; i += 1) {
      addFx({
        kind: 'smoke',
        x: x + fxRand.range(-36, 36),
        y: y + fxRand.range(-8, 8),
        vx: fxRand.range(-24, 24),
        vy: fxRand.range(-68, -28),
        size: fxRand.range(7, 13),
        grow: 18,
        life: fxRand.range(0.6, 1.05),
        maxLife: 1.05,
        color,
      });
    }
  }

  function addParticles(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      state.particles.push({
        x,
        y,
        vx: random.range(-speed, speed),
        vy: random.range(-speed * 1.4, -speed * 0.2),
        life: random.range(0.4, 0.9),
        maxLife: 0.9,
        size: random.range(2, 5),
        color,
      });
    }
    if (state.particles.length > 160) state.particles.splice(0, state.particles.length - 160);
  }

  function freeHand() {
    return state.hands.findIndex((item) => item === null);
  }

  function addToHand(item) {
    const slot = freeHand();
    if (slot === -1) return false;
    state.hands[slot] = item;
    return true;
  }

  function handHas(predicate) {
    return state.hands.findIndex((item) => item !== null && predicate(item));
  }

  function takeFromHand(index) {
    const item = state.hands[index];
    state.hands[index] = null;
    return item;
  }

  function spawnTicket() {
    const params = dayParams();
    let dishId = random.pick(params.pool);
    if (dishId === 'esteh' && random.next() < 0.5) {
      const mains = params.pool.filter((id) => id !== 'esteh');
      dishId = random.pick(mains);
    }
    const dish = DISHES[dishId];
    const extraKerupuk = !dish.drink && state.day > 1 && random.next() < (state.day === 2 ? 0.25 : 0.35);
    const patience = params.patience + random.range(-2, 2);
    state.tickets.push({
      id: state.ticketSeq,
      dishId,
      extraKerupuk,
      patience,
      patienceMax: patience,
      price: dish.price + (extraKerupuk ? 2000 : 0),
    });
    state.ticketSeq += 1;
  }

  function failTicket(ticket) {
    state.tickets = state.tickets.filter((other) => other !== ticket);
    state.failsToday += 1;
    state.failed += 1;
    state.combo = 0;
    state.comboTimer = 0;
    state.flash = 0.5;
    addFloat(640, 200, 'PESANAN GAGAL!', '#c0392b');
  }

  function serveTicket(ticket, item) {
    const patienceBonus = Math.round(((ticket.patience / ticket.patienceMax) * 3000) / 500) * 500;
    const perfectBonus = item.perfect ? 1000 : 0;
    if (state.comboTimer > 0) state.combo += 1;
    else state.combo = 1;
    state.comboTimer = COMBO_WINDOW;
    const mult = 1 + Math.min(state.combo - 1, 10) * 0.1;
    const total = Math.round((ticket.price + patienceBonus + perfectBonus) * mult);
    state.coins += total;
    state.served += 1;
    state.servedToday += 1;
    state.tickets = state.tickets.filter((other) => other !== ticket);
    const slot = state.serveSlots.find((entry) => entry.item === null);
    if (slot) {
      slot.item = item;
      slot.timer = 1.5;
    }
    state.serveGlow = 1;
    addFloat(900, 344, `+Rp${total.toLocaleString('id-ID')}`, '#8cff9e', 2.0);
    addParticles(900, 350, '#f2c94c', 14, 90);
    emitSparkles(900, 346, 12, '#ffd86b');
    return { total, perfect: Boolean(item.perfect) };
  }

  function stationAt(x, y) {
    for (const bin of STATIONS.bins) {
      if (x >= bin.x && x <= bin.x + bin.w && y >= bin.y && y <= bin.y + bin.h) return { type: 'bin', id: bin.id };
    }
    for (const key of ['talenan', 'wajan', 'dispenser', 'piring', 'saji', 'trash']) {
      const station = STATIONS[key];
      if (x >= station.x && x <= station.x + station.w && y >= station.y && y <= station.y + station.h) {
        return { type: key, id: key };
      }
    }
    return null;
  }

  function stationStand(station) {
    if (station.type === 'bin') return STATIONS.bins.find((bin) => bin.id === station.id).stand;
    return STATIONS[station.type].stand;
  }

  function stationCenter(station) {
    if (station.type === 'bin') {
      const bin = STATIONS.bins.find((entry) => entry.id === station.id);
      return { x: bin.x + bin.w / 2, y: bin.y + bin.h / 2 };
    }
    const entry = STATIONS[station.type];
    return { x: entry.x + entry.w / 2, y: entry.y + entry.h / 2 };
  }

  function executeStation(station) {
    const cook = state.cook;
    let events = 0;
    if (station.type === 'bin') {
      if (freeHand() === -1) {
        addFloat(cook.x, cook.y - 50, 'Tangan penuh!', '#c0392b');
        return EVENT_ERROR;
      }
      addToHand({ kind: 'ing', id: station.id });
      return EVENT_PICKUP;
    }
    if (station.type === 'talenan') {
      const board = state.board;
      if (board.item === null) {
        const index = handHas((item) => item.kind === 'ing' && INGREDIENTS[item.id].chop);
        if (index === -1) {
          addFloat(cook.x, cook.y - 50, 'Butuh bahan mentah!', '#c0392b');
          return EVENT_ERROR;
        }
        board.item = takeFromHand(index);
        board.chops = 0;
        return EVENT_PICKUP;
      }
      if (board.item.kind === 'ing') {
        board.chops += 1;
        addParticles(580, 210, '#e8a87c', 6, 60);
        emitChopBits(INGREDIENTS[board.item.id].color);
        events = EVENT_CHOP;
        if (board.chops >= CHOPS_NEEDED) {
          board.item = { kind: 'chopped', id: choppedId(board.item.id) };
        }
        return events;
      }
      const slot = freeHand();
      if (slot === -1) {
        addFloat(cook.x, cook.y - 50, 'Tangan penuh!', '#c0392b');
        return EVENT_ERROR;
      }
      state.hands[slot] = board.item;
      board.item = null;
      board.chops = 0;
      return EVENT_PICKUP;
    }
    if (station.type === 'wajan') {
      const wok = state.wok;
      if (wok.burnt) {
        wok.contents = [];
        wok.burnt = false;
        wok.invalid = false;
        addParticles(820, 200, '#555555', 16, 70);
        return EVENT_TRASH;
      }
      if (wok.ready) {
        const slot = freeHand();
        if (slot === -1) {
          addFloat(cook.x, cook.y - 50, 'Tangan penuh!', '#c0392b');
          return EVENT_ERROR;
        }
        const perfect = wok.readyTimer <= PERFECT_WINDOW;
        state.hands[slot] = { kind: 'cooked', dishId: wok.dishId, perfect };
        wok.contents = [];
        wok.ready = false;
        wok.readyTimer = 0;
        wok.dishId = null;
        return EVENT_PICKUP | (perfect ? EVENT_PERFECT : 0);
      }
      if (wok.invalid) {
        wok.contents = [];
        wok.invalid = false;
        addParticles(820, 200, '#555555', 10, 60);
        return EVENT_TRASH;
      }
      const index = handHas((item) => item.kind === 'ing' || item.kind === 'chopped');
      if (index === -1) return 0;
      const item = takeFromHand(index);
      wok.contents.push(item.id);
      const dishId = matchRecipe(wok.contents);
      if (dishId) {
        wok.cooking = true;
        wok.progress = 0;
        wok.dishId = dishId;
        return EVENT_COOK_START;
      }
      if (!isPartialRecipe(wok.contents)) wok.invalid = true;
      return EVENT_PICKUP;
    }
    if (station.type === 'dispenser') {
      if (state.dispenser.pouring) return 0;
      if (freeHand() === -1) {
        addFloat(cook.x, cook.y - 50, 'Tangan penuh!', '#c0392b');
        return EVENT_ERROR;
      }
      state.dispenser.pouring = true;
      state.dispenser.progress = 0;
      return EVENT_POUR;
    }
    if (station.type === 'piring') {
      const cookedIndex = handHas((item) => item.kind === 'cooked');
      if (cookedIndex !== -1) {
        const slot = state.plates.findIndex((plate) => plate === null);
        if (slot === -1) {
          addFloat(cook.x, cook.y - 50, 'Piring penuh!', '#c0392b');
          return EVENT_ERROR;
        }
        const cooked = takeFromHand(cookedIndex);
        state.plates[slot] = { dishId: cooked.dishId, kerupuk: false, perfect: cooked.perfect };
        emitSparkles(532 + slot * 96, 346, 6, '#ffd86b');
        return EVENT_PLATE;
      }
      const kerupukIndex = handHas((item) => item.kind === 'ing' && item.id === 'kerupuk');
      if (kerupukIndex !== -1) {
        const plate = state.plates.find((entry) => entry !== null && !entry.kerupuk);
        if (!plate) {
          addFloat(cook.x, cook.y - 50, 'Tidak ada piring!', '#c0392b');
          return EVENT_ERROR;
        }
        takeFromHand(kerupukIndex);
        plate.kerupuk = true;
        return EVENT_PLATE;
      }
      const plateIndex = state.plates.findIndex((plate) => plate !== null);
      if (plateIndex !== -1 && freeHand() !== -1) {
        const plate = state.plates[plateIndex];
        state.plates[plateIndex] = null;
        addToHand({ kind: 'plate', dishId: plate.dishId, kerupuk: plate.kerupuk, perfect: plate.perfect });
        return EVENT_PICKUP;
      }
      return 0;
    }
    if (station.type === 'saji') {
      const plateIndex = handHas((item) => item.kind === 'plate');
      const drinkIndex = handHas((item) => item.kind === 'drink');
      const index = plateIndex !== -1 ? plateIndex : drinkIndex;
      if (index === -1) return 0;
      const item = state.hands[index];
      const ticket =
        item.kind === 'plate'
          ? state.tickets.find((entry) => entry.dishId === item.dishId && entry.extraKerupuk === item.kerupuk)
          : state.tickets.find((entry) => entry.dishId === 'esteh');
      if (!ticket) {
        addFloat(cook.x, cook.y - 50, 'Tidak ada pesanan itu!', '#c0392b');
        return EVENT_ERROR;
      }
      takeFromHand(index);
      const result = serveTicket(ticket, item);
      return EVENT_SERVE | (result.perfect ? EVENT_PERFECT : 0);
    }
    if (station.type === 'trash') {
      for (let index = state.hands.length - 1; index >= 0; index -= 1) {
        if (state.hands[index] !== null) {
          state.hands[index] = null;
          return EVENT_TRASH;
        }
      }
      return 0;
    }
    return 0;
  }

  function handleClick(x, y) {
    const station = stationAt(x, y);
    const cook = state.cook;
    if (!station) {
      cook.tx = Math.min(WALK.x1, Math.max(WALK.x0, x));
      cook.ty = Math.min(WALK.y1, Math.max(WALK.y0, y));
      pendingAction = null;
      return EVENT_CLICK;
    }
    const stand = stationStand(station);
    const dx = stand.x - cook.x;
    const dy = stand.y - cook.y;
    if (Math.hypot(dx, dy) < 46) {
      return executeStation(station) | EVENT_CLICK;
    }
    cook.tx = stand.x;
    cook.ty = stand.y;
    pendingAction = station;
    return EVENT_CLICK;
  }

  function nearestStation() {
    const cook = state.cook;
    let best = null;
    let bestDist = 110;
    const candidates = [];
    for (const bin of STATIONS.bins) candidates.push({ type: 'bin', id: bin.id });
    for (const key of ['talenan', 'wajan', 'dispenser', 'piring', 'saji', 'trash']) candidates.push({ type: key, id: key });
    for (const station of candidates) {
      const stand = stationStand(station);
      const dist = Math.hypot(stand.x - cook.x, stand.y - cook.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = station;
      }
    }
    return best;
  }

  function step(dt, input) {
    let events = 0;
    state.time += dt;
    state.flash = Math.max(0, state.flash - dt);
    state.talenanFlash = Math.max(0, state.talenanFlash - dt * 4.5);
    state.burnFlash = Math.max(0, state.burnFlash - dt * 2.2);
    state.serveGlow = Math.max(0, state.serveGlow - dt * 2.0);
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }

    const cook = state.cook;
    if (cook.busy > 0) {
      cook.busy -= dt;
    } else if (input.mx !== 0 || input.my !== 0) {
      cook.tx = null;
      cook.ty = null;
      pendingAction = null;
      const len = Math.hypot(input.mx, input.my) || 1;
      cook.x = Math.min(WALK.x1, Math.max(WALK.x0, cook.x + (input.mx / len) * COOK.speed * dt));
      cook.y = Math.min(WALK.y1, Math.max(WALK.y0, cook.y + (input.my / len) * COOK.speed * dt));
      if (input.mx !== 0) cook.face = input.mx > 0 ? 1 : -1;
    } else if (cook.tx !== null && cook.ty !== null) {
      const dx = cook.tx - cook.x;
      const dy = cook.ty - cook.y;
      const dist = Math.hypot(dx, dy);
      const move = COOK.speed * dt;
      if (dist <= Math.max(move, 6)) {
        cook.x = cook.tx;
        cook.y = cook.ty;
        cook.tx = null;
        cook.ty = null;
        if (pendingAction) {
          const action = pendingAction;
          pendingAction = null;
          events |= executeStation(action);
        }
      } else {
        cook.x += (dx / dist) * move;
        cook.y += (dy / dist) * move;
        if (dx !== 0) cook.face = dx > 0 ? 1 : -1;
      }
    }

    if (input.click) events |= handleClick(input.click.x, input.click.y);
    if (input.use) {
      const station = nearestStation();
      if (station) events |= handleClick(stationCenter(station).x, stationCenter(station).y);
    }
    if (input.trash) {
      for (let index = state.hands.length - 1; index >= 0; index -= 1) {
        if (state.hands[index] !== null) {
          state.hands[index] = null;
          events |= EVENT_TRASH;
          break;
        }
      }
    }

    // Wok cooking.
    const wok = state.wok;
    if (wok.cooking) {
      wok.progress += dt / dayParams().cookTime;
      if (random.next() < dt * 14) {
        addParticles(820 + random.range(-30, 30), 190, '#bbbbbb', 1, 30);
      }
      if (fxRand.next() < dt * 16) {
        addFx({
          kind: 'steam',
          x: 814 + fxRand.range(-48, 48),
          y: 202 + fxRand.range(-6, 4),
          vx: fxRand.range(-12, 12),
          vy: fxRand.range(-54, -30),
          size: fxRand.range(8, 13),
          grow: 16,
          life: fxRand.range(0.65, 1.05),
          maxLife: 1.05,
          color: '#fff9ea',
        });
      }
      if (fxRand.next() < dt * 11) {
        addFx({
          kind: 'sizzle',
          x: 814 + fxRand.range(-56, 56),
          y: 212 + fxRand.range(-8, 6),
          vx: fxRand.range(-28, 28),
          vy: fxRand.range(-44, -18),
          size: fxRand.range(6.5, 9.5),
          grow: -2.5,
          life: fxRand.range(0.32, 0.52),
          maxLife: 0.52,
          color: '#ffe073',
        });
      }
      if (wok.progress >= 1) {
        wok.cooking = false;
        wok.ready = true;
        wok.readyTimer = 0;
        emitSparkles(820, 212, 8, '#ffd86b');
        events |= EVENT_READY;
      }
    } else if (wok.ready) {
      wok.readyTimer += dt;
      if (wok.readyTimer > BURN_GRACE) {
        wok.ready = false;
        wok.burnt = true;
        state.burnFlash = 1;
        state.flash = Math.max(state.flash, 0.45);
        addParticles(820, 190, '#444444', 18, 60);
        emitSmokePuff(820, 206, 14, '#3a3430');
        events |= EVENT_BURN;
      }
    }

    // Drink pouring.
    const dispenser = state.dispenser;
    if (dispenser.pouring) {
      dispenser.progress += dt / POUR_SECONDS;
      if (dispenser.progress >= 1) {
        dispenser.pouring = false;
        dispenser.progress = 0;
        if (addToHand({ kind: 'drink', dishId: 'esteh' })) events |= EVENT_PICKUP;
      }
    }

    // Served plates linger on the counter, then clear.
    for (const slot of state.serveSlots) {
      if (slot.item !== null) {
        slot.timer -= dt;
        if (slot.timer <= 0) slot.item = null;
      }
    }

    // Tickets: patience drains, the day clock runs, new orders arrive.
    state.timeLeft -= dt;
    for (const ticket of [...state.tickets]) {
      ticket.patience -= dt;
      if (ticket.patience <= 0) {
        failTicket(ticket);
        events |= EVENT_FAIL;
      }
    }
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      if (state.tickets.length < dayParams().maxTickets) spawnTicket();
      state.spawnTimer = dayParams().spawn + random.range(-1, 1);
    }

    // Particles and floating texts.
    for (const particle of state.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy -= 20 * dt;
      particle.life -= dt;
    }
    state.particles = state.particles.filter((particle) => particle.life > 0);
    for (const item of state.fx) {
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      if (item.kind === 'chop') item.vy += 260 * dt;
      item.size = Math.max(1, item.size + item.grow * dt);
      item.life -= dt;
    }
    state.fx = state.fx.filter((item) => item.life > 0);
    for (const float of state.floats) {
      float.y -= 26 * dt;
      float.life -= dt;
    }
    state.floats = state.floats.filter((float) => float.life > 0);

    // Day end: quota met, too many failed orders, or the clock ran out.
    if (state.servedToday >= state.quota) {
      state.dayBonus = Math.round(state.timeLeft) * 100;
      state.coins += state.dayBonus;
      if (state.day >= DAYS.length) events |= EVENT_WIN;
      else events |= EVENT_DAY_CLEAR;
    } else if (state.failsToday >= MAX_FAILS_PER_DAY) {
      state.overReason = 'fails';
      events |= EVENT_OVER;
    } else if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.overReason = 'time';
      events |= EVENT_OVER;
    }
    return events;
  }

  reset(1);
  return {
    state,
    reset,
    nextDay,
    step,
    handleClick,
    stationAt,
    stationCenter,
    nearestStation,
    dayParams,
    BOARD,
  };
}
