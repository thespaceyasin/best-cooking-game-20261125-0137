// Warung Nasi Goreng: Rush Hour — every tuning number, colour, recipe and station
// in one place. The playfield is a fixed 1280x720 logical area; the renderer scales
// it to the window, so no rule below depends on the screen size.

export const VIEW = { width: 1280, height: 720 };
export const STEP = 1 / 60;

export const HUD = { height: 56 };
export const BOARD = { x: 16, y: 64, width: 1248, height: 88, slots: 4, gap: 8 };

export const COOK = { radius: 22, speed: 430, hands: 3 };
export const WALK = { x0: 24, y0: 272, x1: 1256, y1: 700 };

export const CHOPS_NEEDED = 3;
export const POUR_SECONDS = 1.2;
export const BURN_GRACE = 3;
export const PERFECT_WINDOW = 1.5;
export const COMBO_WINDOW = 8;
export const MAX_FAILS_PER_DAY = 3;

/** Ingredients you can pick up. chop: true means it must be chopped on the talenan first. */
export const INGREDIENTS = {
  nasi: { name: 'NASI', color: '#f5f0e1', chop: false },
  mie: { name: 'MIE', color: '#f2c94c', chop: false },
  telur: { name: 'TELUR', color: '#fff8e1', chop: false },
  ayam: { name: 'AYAM', color: '#e8a87c', chop: true },
  kecap: { name: 'KECAP', color: '#4a2c14', chop: false },
  cabai: { name: 'CABAI', color: '#c0392b', chop: true },
  bawang: { name: 'BAWANG', color: '#b388c7', chop: true },
  kerupuk: { name: 'KERUPUK', color: '#f7d774', chop: false },
};

/** The chopped form of a choppable ingredient (what the wok's recipes name). */
export function choppedId(id) {
  return INGREDIENTS[id] && INGREDIENTS[id].chop ? `${id}_c` : id;
}

/** Dishes. wok lists the exact ingredients the wok must hold (chopped ids where needed);
 *  drink dishes come from the dispenser instead of the wok. */
export const DISHES = {
  nasgor: { name: 'NASI GORENG', short: 'NASGOR', wok: ['nasi', 'telur', 'kecap'], price: 12000 },
  nasgor_pedas: { name: 'NASI GORENG PEDAS', short: 'NASGOR PEDAS', wok: ['nasi', 'telur', 'kecap', 'cabai_c'], price: 15000 },
  nasgor_spesial: { name: 'NASGOR SPESIAL', short: 'SPESIAL', wok: ['nasi', 'telur', 'ayam_c', 'kecap'], price: 18000 },
  miegor: { name: 'MIE GORENG', short: 'MIEGOR', wok: ['mie', 'telur', 'kecap'], price: 12000 },
  miegor_pedas: { name: 'MIE GORENG PEDAS', short: 'MIEGOR PEDAS', wok: ['mie', 'telur', 'kecap', 'cabai_c'], price: 15000 },
  sate: { name: 'SATE AYAM', short: 'SATE', wok: ['ayam_c', 'kecap', 'bawang_c'], price: 16000 },
  esteh: { name: 'ES TEH', short: 'ES TEH', drink: true, price: 5000 },
};

/** One day (shift) of the warung: quota to serve, clock, patience and spawn pace. */
export const DAYS = [
  { quota: 6, timeLimit: 180, patience: 48, spawn: 9, maxTickets: 2, cookTime: 4.5, pool: ['nasgor', 'miegor', 'esteh'] },
  { quota: 8, timeLimit: 180, patience: 40, spawn: 7.5, maxTickets: 3, cookTime: 4.0, pool: ['nasgor', 'miegor', 'nasgor_pedas', 'sate', 'esteh'] },
  { quota: 10, timeLimit: 180, patience: 32, spawn: 6, maxTickets: 4, cookTime: 3.5, pool: ['nasgor', 'miegor', 'nasgor_pedas', 'miegor_pedas', 'nasgor_spesial', 'sate', 'esteh'] },
];

/** Stations: id, label, rect, and the point the cook stands on to use it. */
export const STATIONS = {
  bins: [
    { id: 'nasi', x: 20, y: 168, w: 104, h: 40, stand: { x: 72, y: 282 } },
    { id: 'mie', x: 132, y: 168, w: 104, h: 40, stand: { x: 184, y: 282 } },
    { id: 'telur', x: 244, y: 168, w: 104, h: 40, stand: { x: 296, y: 282 } },
    { id: 'ayam', x: 356, y: 168, w: 104, h: 40, stand: { x: 408, y: 282 } },
    { id: 'kecap', x: 20, y: 216, w: 104, h: 40, stand: { x: 72, y: 282 } },
    { id: 'cabai', x: 132, y: 216, w: 104, h: 40, stand: { x: 184, y: 282 } },
    { id: 'bawang', x: 244, y: 216, w: 104, h: 40, stand: { x: 296, y: 282 } },
    { id: 'kerupuk', x: 356, y: 216, w: 104, h: 40, stand: { x: 408, y: 282 } },
  ],
  talenan: { id: 'talenan', label: 'TALENAN', x: 480, y: 168, w: 200, h: 88, stand: { x: 580, y: 282 } },
  wajan: { id: 'wajan', label: 'WAJAN', x: 700, y: 168, w: 240, h: 104, stand: { x: 820, y: 298 } },
  dispenser: { id: 'dispenser', label: 'ES TEH', x: 960, y: 168, w: 140, h: 88, stand: { x: 1030, y: 282 } },
  piring: { id: 'piring', label: 'PIRING', x: 480, y: 300, w: 200, h: 92, stand: { x: 580, y: 418 } },
  saji: { id: 'saji', label: 'MEJA SAJI', x: 700, y: 300, w: 400, h: 92, stand: { x: 900, y: 418 } },
  trash: { id: 'trash', label: 'SAMPAH', x: 20, y: 600, w: 130, h: 80, stand: { x: 85, y: 586 } },
};

export const PALETTE = {
  wall: '#f3e2c2',
  wallTrim: '#d9a05b',
  floorA: '#eccfa3',
  floorB: '#e0bd85',
  floorLine: '#d9b078',
  wood: '#8a5a33',
  woodTop: '#a9744f',
  woodEdge: '#6f4525',
  steel: '#3a3f4a',
  flame: '#ff9a2a',
  flameHot: '#ffc93c',
  paper: '#fffdf5',
  ticketRed: '#c0392b',
  ink: '#2b2118',
  muted: '#7a6a55',
  green: '#2e7d32',
  gold: '#f2c94c',
  red: '#c0392b',
  panel: '#fff8ea',
  panelEdge: '#d9a05b',
  cookSkin: '#f0c08c',
  cookHat: '#ffffff',
  cookApron: '#c0392b',
  cookShirt: '#fdfdfd',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'warung-nasi-goreng.best';
