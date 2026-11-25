// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between six screens: title, play,
// paused, day clear, game over and win. A click or a one-shot key (use, trash)
// is spent on exactly one world step, so it is never counted twice and never
// lost on a fast display.
//
// ?seed=N fixes the random order. ?shot=cover|start|rush|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import {
  createWorld,
  EVENT_BURN,
  EVENT_CHOP,
  EVENT_CLICK,
  EVENT_COOK_START,
  EVENT_DAY_CLEAR,
  EVENT_ERROR,
  EVENT_FAIL,
  EVENT_OVER,
  EVENT_PERFECT,
  EVENT_PICKUP,
  EVENT_PLATE,
  EVENT_POUR,
  EVENT_READY,
  EVENT_SERVE,
  EVENT_TRASH,
  EVENT_WIN,
} from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_RESTART,
  ACTION_TRASH,
  ACTION_USE,
  createInput,
} from './input.js';
import { createAudio } from './audio.js';
import {
  createRenderer,
  HUD_BUTTONS,
  SCREEN_DAYCLEAR,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WIN,
} from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function inRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

if (shot) {
  // A staged scene: paint it twice, then tell the screenshot runner it is ready.
  const scene = stageShot(shot, seed);
  let painted = 0;
  function paint() {
    renderer.draw(scene.world.state, scene.screen, 0, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
} else {
  runGame();
}

function runGame() {
  const world = createWorld(createRandom(seed));
  const audio = createAudio();
  const input = createInput(canvas, () => audio.unlock());
  let screen = SCREEN_TITLE;
  let best = readBest();
  let muted = false;
  let accumulator = 0;
  let last = performance.now();
  // One-shot input (a click, a use, a trash) waiting for its next world step.
  // It survives a frame with no step, so input on a fast display is delayed
  // by a frame, never lost.
  let pendingOneShot = null;

  // Screen readers (and anyone watching the page's text) hear the screen changes and each serve or fail.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset(1);
    accumulator = 0;
    pendingOneShot = null;
    screen = SCREEN_PLAY;
    announce('Bermain. Sajikan pesanan sebelum pelanggan pergi.');
  }

  function endGame(win) {
    screen = win ? SCREEN_WIN : SCREEN_OVER;
    audio.sizzleStop();
    if (world.state.coins > best) {
      best = world.state.coins;
      saveBest(best);
    }
    announce(
      win
        ? `Juara warung! Koin Rp${world.state.coins.toLocaleString('id-ID')}.`
        : `Warung tutup. Koin Rp${world.state.coins.toLocaleString('id-ID')}. Terbaik Rp${best.toLocaleString('id-ID')}.`,
    );
  }

  function playEvents(events) {
    if (events & EVENT_CLICK) audio.click();
    if (events & EVENT_PICKUP) audio.grab();
    if (events & EVENT_CHOP) audio.chop();
    if (events & EVENT_COOK_START) audio.sizzleStart();
    if (events & EVENT_READY) {
      audio.ready();
      audio.sizzleStop();
    }
    if (events & EVENT_PLATE) audio.plate();
    if (events & EVENT_SERVE) {
      audio.serve();
      announce(`Pesanan tersaji. Koin Rp${world.state.coins.toLocaleString('id-ID')}.`);
    }
    if (events & EVENT_PERFECT) audio.perfect();
    if (events & EVENT_FAIL) {
      audio.fail();
      announce(`Pesanan gagal. ${world.state.failsToday} dari 3 gagal hari ini.`);
    }
    if (events & EVENT_BURN) {
      audio.burn();
      audio.sizzleStop();
    }
    if (events & EVENT_POUR) audio.pour();
    if (events & EVENT_ERROR) audio.error();
    if (events & EVENT_TRASH) audio.click();
    if (events & EVENT_DAY_CLEAR) {
      audio.dayClear();
      audio.sizzleStop();
    }
  }

  function stepTitle() {
    const events = world.step(STEP, { mx: 0, my: 0 });
    if (events & (EVENT_DAY_CLEAR | EVENT_OVER | EVENT_WIN)) world.reset(1);
  }

  function stepPlay(oneShot) {
    const direction = input.direction();
    const events = world.step(STEP, {
      mx: direction.mx,
      my: direction.my,
      click: oneShot ? oneShot.click : null,
      use: oneShot ? oneShot.use : false,
      trash: oneShot ? oneShot.trash : false,
    });
    playEvents(events);
    if (events & EVENT_WIN) endGame(true);
    else if (events & EVENT_OVER) endGame(false);
    else if (events & EVENT_DAY_CLEAR) {
      screen = SCREEN_DAYCLEAR;
      announce(`Hari ${world.state.day} selesai! Bonus Rp${world.state.dayBonus.toLocaleString('id-ID')}.`);
    }
  }

  /** Merge this frame's one-shot input into the pending one, so a click and a
   *  key press from different frames can share one step. */
  function mergeOneShot(click, actions) {
    const incoming = {
      click: click || null,
      use: Boolean(actions & ACTION_USE),
      trash: Boolean(actions & ACTION_TRASH),
    };
    if (!incoming.click && !incoming.use && !incoming.trash) return;
    pendingOneShot = {
      click: incoming.click || (pendingOneShot ? pendingOneShot.click : null),
      use: incoming.use || (pendingOneShot ? pendingOneShot.use : false),
      trash: incoming.trash || (pendingOneShot ? pendingOneShot.trash : false),
    };
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const click = input.takeClick();
    const actions = input.takeActions();

    if (actions & ACTION_MUTE) {
      muted = !muted;
      audio.setMuted(muted);
    }

    // Screen transitions spend the click or the key press; the world never sees it.
    if (screen === SCREEN_TITLE) {
      if (click || actions & ACTION_CONFIRM) startGame();
    } else if (screen === SCREEN_PAUSED) {
      if (actions & (ACTION_PAUSE | ACTION_CONFIRM) || click) {
        screen = SCREEN_PLAY;
        if (world.state.wok.cooking) audio.sizzleStart();
        announce('Bermain.');
      } else if (actions & ACTION_RESTART) startGame();
    } else if (screen === SCREEN_DAYCLEAR) {
      if (click || actions & ACTION_CONFIRM) {
        world.nextDay();
        accumulator = 0;
        screen = SCREEN_PLAY;
        announce(`Hari ${world.state.day}. Kuota ${world.state.quota} pesanan.`);
      }
    } else if (screen === SCREEN_OVER || screen === SCREEN_WIN) {
      if (click || actions & (ACTION_CONFIRM | ACTION_RESTART)) startGame();
    } else if (screen === SCREEN_PLAY) {
      if (actions & ACTION_RESTART) {
        startGame();
      } else if (actions & ACTION_PAUSE) {
        screen = SCREEN_PAUSED;
        audio.sizzleStop();
        announce('Jeda.');
      } else if (click && inRect(click.x, click.y, HUD_BUTTONS.mute)) {
        muted = !muted;
        audio.setMuted(muted);
        mergeOneShot(null, actions);
      } else if (click && inRect(click.x, click.y, HUD_BUTTONS.pause)) {
        screen = SCREEN_PAUSED;
        audio.sizzleStop();
        announce('Jeda.');
      } else {
        mergeOneShot(click, actions);
      }
    }

    if (screen === SCREEN_TITLE) {
      while (accumulator >= STEP) {
        stepTitle();
        accumulator -= STEP;
      }
    } else if (screen === SCREEN_PLAY) {
      let first = true;
      while (accumulator >= STEP) {
        const oneShot = first ? pendingOneShot : null;
        pendingOneShot = null;
        stepPlay(oneShot);
        first = false;
        accumulator -= STEP;
        if (screen !== SCREEN_PLAY) break;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, muted);
  }

  // Leaving the tab pauses a running game rather than letting orders fail unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      audio.sizzleStop();
      announce('Jeda.');
    }
  });

  announce('Warung Nasi Goreng: Rush Hour. Klik atau tekan Spasi untuk mulai.');
  requestAnimationFrame(frame);
}
