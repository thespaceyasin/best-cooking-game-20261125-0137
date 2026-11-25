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
function plateNextWokDish(bot) {
  const ticket = nextWokTicket(bot);
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

/** Start the next wok dish so the wok is actively cooking with steam/sizzle AND the talenan shows mid-chop work. */
function startNextDishPartially(bot, excludeTicket = null) {
  const ticket = nextWokTicket(bot, excludeTicket);
  const dish = DISHES[ticket.dishId];
  for (const id of dish.wok) bot.addIngredientToWok(id);
  bot.waitFor(() => bot.state.wok.cooking, 3, 'wok actively cooking');
  // Put an ingredient on the cutting board and chop twice so CINCANG 2/3 and chop bits show live.
  bot.use('bin', 'ayam', () => bot.handsHave((item) => item.kind === 'ing' && item.id === 'ayam'), 'pick ayam for chop');
  bot.use('talenan', null, () => bot.state.board.item && bot.state.board.item.id === 'ayam', 'place ayam on board');
  for (let chop = 0; chop < 2; chop += 1) {
    bot.use(
      'talenan',
      null,
      () => bot.state.board.chops === chop + 1,
      `chop ayam ${chop + 1}`,
    );
  }
  // Step briefly so steam & sizzle particles rise visibly while talenanFlash & chop bits are still mid-air.
  stepUntil(bot.world, () => false, 0.14);
}

function stageCover(world) {
  const bot = new Bot(world);
  bot.waitFor(() => world.state.tickets.length >= 1, 10, 'first ticket');
  bot.serveTicket(oldestTicket(bot));
  const platedTicket = plateNextWokDish(bot);
  startNextDishPartially(bot, platedTicket);
  if (!world.state.plates.some((plate) => plate && world.state.tickets.some((t) => t.dishId === plate.dishId && t.extraKerupuk === plate.kerupuk))) {
    throw new Error('cover: ready plate does not match a live ticket');
  }
}

function stageStart(world) {
  stepUntil(world, () => world.state.tickets.length >= 2, 12);
}

function stageRush(world) {
  // Day 3 rush: serve one order, wait for tickets to stack, plate a fresh live
  // wok order so it stays valid on the 4-ticket board, and cook the next dish.
  const bot = new Bot(world);
  bot.waitFor(() => world.state.tickets.length >= 1, 10, 'first ticket');
  bot.serveTicket(oldestTicket(bot));
  bot.waitFor(() => world.state.tickets.length >= 3, 20, 'three tickets');
  const platedTicket = plateNextWokDish(bot);
  startNextDishPartially(bot, platedTicket);
  bot.waitFor(() => world.state.tickets.length >= 4, 10, 'four tickets');
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
