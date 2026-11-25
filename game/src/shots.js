// Deterministic staging for the four screenshots. A bot plays the real rules forward
// through the same handleClick path a player uses: it walks the cook to each
// station, waits for the action, and only then moves on. The same seed always
// stages the same kitchen, so a screenshot can be retaken and match. A stage
// that fails never leaves a blank screen: it falls back to a fresh day with one
// order on the board and records the error on window.__shotError.

import { DISHES, INGREDIENTS, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';

const DT = STEP;

export const SHOTS = ['cover', 'start', 'rush', 'end'];

function cookIdle(world) {
  const cook = world.state.cook;
  return cook.tx === null && cook.ty === null && cook.busy <= 0;
}

function dayEnded(world) {
  const state = world.state;
  return state.overReason !== null || state.servedToday >= state.quota;
}

/** Step the world until predicate() is true, or maxSeconds pass, or the day ends. */
function stepUntil(world, predicate, maxSeconds) {
  let steps = 0;
  const max = Math.ceil(maxSeconds / DT);
  while (!predicate() && steps < max && !dayEnded(world)) {
    world.step(DT, { mx: 0, my: 0 });
    steps += 1;
  }
  return predicate();
}

class Bot {
  constructor(world) {
    this.world = world;
  }

  get state() {
    return this.world.state;
  }

  handsHave(predicate) {
    return this.state.hands.some((item) => item !== null && predicate(item));
  }

  clickStation(type, id) {
    const center = this.world.stationCenter({ type, id: id || type });
    this.world.handleClick(center.x, center.y);
  }

  /** Click a station, wait for the cook to arrive and act, then check the result. */
  use(type, id, check, label) {
    this.clickStation(type, id);
    if (!stepUntil(this.world, () => cookIdle(this.world), 15)) {
      throw new Error(`bot: cook never reached ${label || type}`);
    }
    if (check && !check()) {
      throw new Error(`bot: ${label || type} did not take effect`);
    }
  }

  waitFor(predicate, maxSeconds, label) {
    if (!stepUntil(this.world, predicate, maxSeconds)) {
      throw new Error(`bot: timed out waiting for ${label}`);
    }
  }

  clearWokIfNeeded() {
    const wok = this.state.wok;
    if (wok.invalid || wok.burnt) {
      this.use('wajan', null, () => !this.state.wok.invalid && !this.state.wok.burnt, 'clear wok');
    }
  }

  chopOnBoard(base) {
    this.use('bin', base, () => this.handsHave((item) => item.kind === 'ing' && item.id === base), `pick ${base}`);
    this.use('talenan', null, () => this.state.board.item && this.state.board.item.id === base, `place ${base} on board`);
    for (let chop = 0; chop < 3; chop += 1) {
      this.use(
        'talenan',
        null,
        () => this.state.board.chops === chop + 1 || this.state.board.item.kind === 'chopped',
        `chop ${base} ${chop + 1}`,
      );
    }
  }

  addIngredientToWok(id) {
    const base = id.endsWith('_c') ? id.slice(0, -2) : id;
    if (INGREDIENTS[base].chop) {
      this.chopOnBoard(base);
      this.use('talenan', null, () => this.handsHave((item) => item.kind === 'chopped' && item.id === id), `pick chopped ${id}`);
    } else {
      this.use('bin', id, () => this.handsHave((item) => item.kind === 'ing' && item.id === id), `pick ${id}`);
    }
    this.clearWokIfNeeded();
    this.use('wajan', null, () => this.state.wok.contents.includes(id) || this.state.wok.cooking, `add ${id} to wok`);
  }

  /** Make and serve one ticket. Returns false if the order expired mid-make. */
  serveTicket(ticket) {
    const dish = DISHES[ticket.dishId];
    if (dish.drink) {
      this.use('dispenser', null, null, 'start pour');
      this.waitFor(() => this.handsHave((item) => item.kind === 'drink'), 5, 'drink poured');
    } else {
      for (const id of dish.wok) this.addIngredientToWok(id);
      this.waitFor(() => this.state.wok.cooking || this.state.wok.ready, 5, 'wok cooking');
      this.waitFor(() => this.state.wok.ready, 12, 'dish ready');
      this.use('wajan', null, () => this.handsHave((item) => item.kind === 'cooked'), 'take cooked dish');
      this.use('piring', null, () => this.state.plates.some((plate) => plate && plate.dishId === ticket.dishId), 'plate dish');
      if (ticket.extraKerupuk) {
        this.use('bin', 'kerupuk', () => this.handsHave((item) => item.kind === 'ing' && item.id === 'kerupuk'), 'pick kerupuk');
        this.use('piring', null, () => this.state.plates.some((plate) => plate && plate.dishId === ticket.dishId && plate.kerupuk), 'add kerupuk');
      }
      this.use('piring', null, () => this.handsHave((item) => item.kind === 'plate'), 'pick up plate');
    }
    if (!this.state.tickets.includes(ticket)) {
      // The order expired while it was being made: bin what was made and move on.
      this.use('trash', null, () => !this.handsHave((item) => item.kind === 'plate' || item.kind === 'drink'), 'bin stale dish');
      return false;
    }
    this.use('saji', null, () => !this.state.tickets.includes(ticket), 'serve');
    return true;
  }
}

function oldestTicket(bot) {
  return bot.state.tickets[0] || null;
}

/** Pick the live wok ticket with the most remaining patience, avoiding excludeTicket if possible. */
function pickFreshWokTicket(bot, excludeTicket = null) {
  const liveWok = bot.state.tickets
    .filter((ticket) => !DISHES[ticket.dishId].drink && ticket !== excludeTicket)
    .sort((a, b) => b.patience - a.patience);
  if (liveWok.length > 0) return liveWok[0];
  return bot.state.tickets.find((ticket) => !DISHES[ticket.dishId].drink) || null;
}

/** Serve drink orders until a wok ticket is on the board, then return the freshest one. */
function nextWokTicket(bot, excludeTicket = null) {
  let guard = 0;
  while (guard < 6) {
    const found = pickFreshWokTicket(bot, excludeTicket);
    if (found) return found;
    const ticket = oldestTicket(bot);
    if (!ticket) {
      bot.waitFor(() => bot.state.tickets.length >= 1, 12, 'next ticket');
      guard += 1;
      continue;
    }
    if (DISHES[ticket.dishId].drink) {
      bot.serveTicket(ticket);
      guard += 1;
      continue;
    }
    return ticket;
  }
  throw new Error('bot: too many drinks in a row');
}

/** Cook a fresh live wok dish and leave it plated on the counter, ready to serve. */
function plateNextWokDish(bot, excludeTicket = null) {
  const ticket = nextWokTicket(bot, excludeTicket);
  const dish = DISHES[ticket.dishId];
  for (const id of dish.wok) bot.addIngredientToWok(id);
  bot.waitFor(() => bot.state.wok.cooking || bot.state.wok.ready, 5, 'wok cooking');
  bot.waitFor(() => bot.state.wok.ready, 12, 'dish ready');
  bot.use('wajan', null, () => bot.handsHave((item) => item.kind === 'cooked'), 'take cooked dish');
  bot.use('piring', null, () => bot.state.plates.some((plate) => plate && plate.dishId === ticket.dishId), 'plate dish');
  if (ticket.extraKerupuk) {
    bot.use('bin', 'kerupuk', () => bot.handsHave((item) => item.kind === 'ing' && item.id === 'kerupuk'), 'pick kerupuk');
    bot.use('piring', null, () => bot.state.plates.some((plate) => plate && plate.dishId === ticket.dishId && plate.kerupuk), 'add kerupuk');
  }
  return ticket;
}

/** Pick the quickest live ticket (preferring drink, then no-chop wok dish) for fast combo serves. */
function pickQuickTicket(bot, excludeTicket = null) {
  const candidates = bot.state.tickets.filter((t) => t !== excludeTicket);
  const drink = candidates.find((t) => DISHES[t.dishId].drink);
  if (drink) return drink;
  const noChop = candidates
    .filter((t) => !DISHES[t.dishId].wok.some((id) => id.endsWith('_c')))
    .sort((a, b) => b.patience - a.patience);
  if (noChop.length > 0) return noChop[0];
  return candidates.sort((a, b) => b.patience - a.patience)[0] || null;
}

/** Cook a fast live dish into the cook's hand so it can be served immediately in <1s during peak action. */
function holdQuickPlate(bot, excludeTicket = null) {
  const ticket = pickQuickTicket(bot, excludeTicket);
  if (!ticket) return null;
  const dish = DISHES[ticket.dishId];
  if (dish.drink) {
    bot.use('dispenser', null, null, 'start pour');
    bot.waitFor(() => bot.handsHave((item) => item.kind === 'drink'), 5, 'drink poured');
    return ticket;
  }
  for (const id of dish.wok) bot.addIngredientToWok(id);
  bot.waitFor(() => bot.state.wok.cooking || bot.state.wok.ready, 5, 'wok cooking for hand');
  bot.waitFor(() => bot.state.wok.ready, 12, 'dish ready for hand');
  bot.use('wajan', null, () => bot.handsHave((item) => item.kind === 'cooked'), 'take cooked for hand');
  bot.use('piring', null, () => bot.state.plates.filter(Boolean).length >= 1, 'plate for hand');
  if (ticket.extraKerupuk) {
    bot.use('bin', 'kerupuk', () => bot.handsHave((item) => item.kind === 'ing' && item.id === 'kerupuk'), 'pick kerupuk for hand');
    bot.use('piring', null, () => bot.state.plates.some((plate) => plate && plate.dishId === ticket.dishId && plate.kerupuk), 'add kerupuk for hand');
  }
  // Pick up the newly plated dish (slot 1 if slot 0 already holds platedTicket).
  bot.use('piring', null, () => bot.handsHave((item) => item.kind === 'plate'), 'pick plate to hold');
  return ticket;
}

/** Stage peak action: active wok cooking + quick serve (+Rp + COMBO) + active talenan chop. */
function stageActionPeak(bot, platedTicket, heldTicket) {
  // Prep ayam on talenan with 1 chop first.
  bot.use('bin', 'ayam', () => bot.handsHave((item) => item.kind === 'ing' && item.id === 'ayam'), 'pick ayam for chop');
  bot.use('talenan', null, () => bot.state.board.item && bot.state.board.item.id === 'ayam', 'place ayam on board');
  bot.use('talenan', null, () => bot.state.board.chops === 1, 'chop ayam 1');

  // Start a wok dish cooking so WAJAN is actively sizzling.
  const cookTicket = nextWokTicket(bot, platedTicket);
  const dish = DISHES[cookTicket.dishId];
  for (const id of dish.wok) bot.addIngredientToWok(id);
  bot.waitFor(() => bot.state.wok.cooking, 3, 'wok actively cooking');

  // Serve the held dish if its ticket is still live -> triggers +Rp float, sparkles, serve slot & COMBO.
  if (heldTicket && bot.state.tickets.includes(heldTicket)) {
    bot.use('saji', null, () => !bot.state.tickets.includes(heldTicket), 'serve held dish for peak');
  }

  // Land chop #2 on talenan so talenanFlash + chop bits + active wok steam all appear together.
  if (bot.state.board.item && bot.state.board.item.kind === 'ing' && bot.state.board.chops < 2) {
    bot.use('talenan', null, () => bot.state.board.chops === 2, 'chop ayam 2');
  }
  stepUntil(bot.world, () => false, 0.12);
}

function stageCover(world) {
  const bot = new Bot(world);
  bot.waitFor(() => world.state.tickets.length >= 2, 16, 'two tickets for cover');
  const first = pickQuickTicket(bot);
  bot.serveTicket(first);
  bot.waitFor(() => world.state.tickets.length >= 2, 16, 'two tickets after first serve');
  const platedTicket = plateNextWokDish(bot);
  bot.waitFor(() => world.state.tickets.length >= 2, 16, 'two tickets before peak');
  const drinkTicket = world.state.tickets.find((t) => DISHES[t.dishId].drink && t !== platedTicket);
  let heldTicket = null;
  if (drinkTicket) {
    bot.use('dispenser', null, null, 'pour esteh for cover peak');
    bot.waitFor(() => bot.handsHave((item) => item.kind === 'drink'), 4, 'esteh poured');
    heldTicket = drinkTicket;
  }
  stageActionPeak(bot, platedTicket, heldTicket);
  if (!world.state.plates.some((plate) => plate && world.state.tickets.some((t) => t.dishId === plate.dishId && t.extraKerupuk === plate.kerupuk))) {
    throw new Error('cover: ready plate does not match a live ticket');
  }
}

function stageStart(world) {
  stepUntil(world, () => world.state.tickets.length >= 2, 12);
}

function stageRush(world) {
  const bot = new Bot(world);
  bot.waitFor(() => world.state.tickets.length >= 2, 14, 'two initial tickets');
  bot.serveTicket(pickQuickTicket(bot));
  bot.waitFor(() => world.state.tickets.length >= 3, 18, 'three tickets');
  const platedTicket = plateNextWokDish(bot);
  const drinkTicket = world.state.tickets.find((t) => DISHES[t.dishId].drink && t !== platedTicket);
  let heldTicket = null;
  if (drinkTicket) {
    bot.use('dispenser', null, null, 'pour esteh for rush combo');
    bot.waitFor(() => bot.handsHave((item) => item.kind === 'drink'), 4, 'esteh poured');
    heldTicket = drinkTicket;
  }
  stageActionPeak(bot, platedTicket, heldTicket);
  bot.waitFor(() => world.state.tickets.length >= 4, 12, 'four tickets');
  const hasMatchingPlate = world.state.plates.some(
    (plate) => plate && world.state.tickets.some((t) => t.dishId === plate.dishId && t.extraKerupuk === plate.kerupuk),
  );
  if (!hasMatchingPlate) {
    throw new Error('rush: ready plate does not match a live ticket');
  }
}

function stageEnd(world) {
  const bot = new Bot(world);
  bot.waitFor(() => world.state.tickets.length >= 1, 10, 'first ticket');
  bot.serveTicket(oldestTicket(bot));
  bot.waitFor(() => world.state.tickets.length >= 1, 12, 'second ticket for end');
  bot.serveTicket(oldestTicket(bot));
  stepUntil(world, () => world.state.overReason !== null, 200);
  world.state.floats = [];
}

/** A one-line summary of a staged state, for the node test and debugging. */
export function describeState(world) {
  const state = world.state;
  return {
    day: state.day,
    time: Math.round(state.time * 10) / 10,
    timeLeft: Math.round(state.timeLeft),
    coins: state.coins,
    served: state.served,
    servedToday: state.servedToday,
    failsToday: state.failsToday,
    tickets: state.tickets.map((ticket) => `${ticket.dishId}${ticket.extraKerupuk ? '+k' : ''}(${Math.round(ticket.patience)}s)`),
    wok: state.wok.contents.join(',') + (state.wok.cooking ? ' [cooking]' : state.wok.ready ? ' [ready]' : state.wok.burnt ? ' [burnt]' : state.wok.invalid ? ' [invalid]' : ''),
    board: state.board.item ? `${state.board.item.id} (${state.board.chops} chops)` : 'empty',
    plates: state.plates.map((plate) => (plate ? `${plate.dishId}${plate.kerupuk ? '+k' : ''}` : 'empty')),
    hands: state.hands.map((item) => (item ? `${item.kind}:${item.dishId || item.id}` : 'empty')),
    overReason: state.overReason,
  };
}

export function stageShot(name, seed = 1) {
  const random = createRandom(seed);
  const world = createWorld(random);
  const day = name === 'rush' ? 3 : 1;
  try {
    world.reset(day);
    if (name === 'cover') {
      stageCover(world);
      return { world, screen: 'play' };
    }
    if (name === 'start') {
      stageStart(world);
      return { world, screen: 'title' };
    }
    if (name === 'rush') {
      stageRush(world);
      return { world, screen: 'play' };
    }
    if (name === 'end') {
      stageEnd(world);
      return { world, screen: 'over' };
    }
  } catch (error) {
    // A failed stage must never leave a blank screenshot: fall back to a fresh
    // day with one order on the board.
    if (typeof window !== 'undefined') window.__shotError = String(error && error.message ? error.message : error);
    world.reset(day);
    stepUntil(world, () => world.state.tickets.length >= 1, 10);
    return { world, screen: 'play' };
  }
  throw new Error(`unknown shot: ${name}`);
}

// Test hooks: the node test stages each scene directly so a failure shows its
// real error instead of the fallback.
export { stageCover, stageStart, stageRush, stageEnd };
