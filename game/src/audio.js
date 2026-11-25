// All sound is synthesised with WebAudio: short oscillator blips and filtered noise,
// no audio files. The context is created on the first user gesture (browsers require
// it) and every call is guarded, so a silent browser never breaks the game.

const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51]; // C5 pentatonic up
const MELODY = [0, 2, 4, 3, 2, 4, 5, 4, 0, 2, 4, 6, 5, 4, 2, 0];

export function createAudio() {
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let muted = false;
  let sizzle = null;
  let musicTimer = null;
  let musicStep = 0;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      const len = ctx.sampleRate;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    } catch {
      return false;
    }
    return true;
  }

  function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, filterFreq, type = 'bandpass', when = 0) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + when;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  function sizzleStart() {
    if (!ctx || muted || sizzle) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3200;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start();
    sizzle = { src, gain };
  }

  function sizzleStop() {
    if (!sizzle) return;
    try {
      sizzle.gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      sizzle.src.stop(ctx.currentTime + 0.1);
    } catch {
      // already stopped
    }
    sizzle = null;
  }

  function musicTick() {
    if (!ctx || muted) return;
    const idx = MELODY[musicStep % MELODY.length];
    const freq = NOTES[idx % NOTES.length];
    tone(freq, 0.5, 'triangle', 0.05);
    if (musicStep % 4 === 0) tone(freq / 2, 0.7, 'sine', 0.04);
    musicStep += 1;
  }

  return {
    /** Call from any user gesture; creates the context and starts the music loop. */
    unlock() {
      if (!ensure()) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (!musicTimer) musicTimer = window.setInterval(musicTick, 340);
    },
    setMuted(value) {
      muted = value;
      if (muted) sizzleStop();
      if (master) master.gain.value = muted ? 0 : 0.5;
    },
    isMuted() {
      return muted;
    },
    click() {
      tone(660, 0.06, 'square', 0.06);
    },
    grab() {
      tone(520, 0.07, 'sine', 0.1, 0, 780);
    },
    chop() {
      noise(0.09, 0.16, 900);
      tone(180, 0.08, 'triangle', 0.12, 0, 90);
    },
    pour() {
      noise(0.5, 0.08, 1400, 'bandpass');
    },
    ready() {
      tone(880, 0.12, 'sine', 0.12);
      tone(1174.66, 0.2, 'sine', 0.12, 0.1);
    },
    plate() {
      tone(740, 0.08, 'triangle', 0.1);
      tone(988, 0.14, 'triangle', 0.1, 0.07);
    },
    serve() {
      tone(523.25, 0.1, 'triangle', 0.12);
      tone(659.25, 0.1, 'triangle', 0.12, 0.08);
      tone(783.99, 0.18, 'triangle', 0.12, 0.16);
    },
    perfect() {
      tone(1046.5, 0.1, 'sine', 0.12);
      tone(1318.51, 0.1, 'sine', 0.12, 0.07);
      tone(1567.98, 0.22, 'sine', 0.12, 0.14);
    },
    fail() {
      tone(220, 0.35, 'sawtooth', 0.09, 0, 110);
    },
    burn() {
      noise(0.4, 0.12, 300, 'lowpass');
      tone(160, 0.4, 'sawtooth', 0.07, 0, 70);
    },
    error() {
      tone(140, 0.12, 'square', 0.07);
    },
    dayClear() {
      tone(523.25, 0.14, 'triangle', 0.12);
      tone(659.25, 0.14, 'triangle', 0.12, 0.12);
      tone(783.99, 0.14, 'triangle', 0.12, 0.24);
      tone(1046.5, 0.3, 'triangle', 0.12, 0.36);
    },
    sizzleStart,
    sizzleStop,
  };
}
