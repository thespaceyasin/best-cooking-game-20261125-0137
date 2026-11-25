// A tiny seeded random source (mulberry32): the same seed always gives the same
// stream, so a screenshot staged with ?seed=N is the same frame every time.

export function createRandom(seed) {
  let a = seed >>> 0;
  function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    /** A float in [min, max). */
    range(min, max) {
      return min + next() * (max - min);
    },
    /** An integer in [min, max). */
    int(min, max) {
      return min + Math.floor(next() * (max - min));
    },
    /** One element of an array. */
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
  };
}
