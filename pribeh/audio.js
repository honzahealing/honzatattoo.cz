/* =====================================================================
   audio.js - zvuk příběhu: generativní chill-out jazz (Web Audio) a hlasy postav
   (Web Speech API). Bez externích souborů. Zapíná se tlačítkem v hlavičce.

   Stavba:
   1) hudební jádro createEngine(ctx): syntéza a plánování, funguje i na
      OfflineAudioContext (kvůli měření), vystaveno jako ST.audioLab
   2) hlasy (speechSynthesis, cs-CZ) a ducking hudby
   3) tlačítko zvuku, stav, localStorage, viditelnost stránky
   ===================================================================== */
(function () {
'use strict';

var ST = window.ST || (window.ST = {});
var AC = window.AudioContext || window.webkitAudioContext;

/* ---------- konstanty ---------- */
var BPM = 73, BEAT = 60 / BPM;      // tempo (čtvrťová doba v s)
var SWING = 2 / 3;                  // druhá osmina swingu (poměr 2:1)
var MASTER = 0.22;                  // celková hlasitost
var LOOKAHEAD = 0.2, TICK = 25;     // plánování 0,2 s dopředu, interval 25 ms
var PREF_KEY = 'pribehZvuk';

/* ---------- pomocné funkce ---------- */
function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function mulberry(a) {              // seedovaný generátor (opakovatelné měření)
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---------- harmonie: ii-V-I-vi v C, 2 takty na akord ----------
   v: rootless voicingy (MIDI, C3..A4), vars: varianty (tritonová substituce,
   6/9, 11), pc: tónina kořene, w: tóny pro baso (třetí, kvinta, septima, nona),
   pent: pentatonika pro melodické fráze */
var CHORDS = [
  { name: 'Dm9', root: 2, v: [53, 57, 60, 64], w: [3, 7, 10, 2], pent: [2, 5, 7, 9, 0],
    vars: [{ v: [53, 57, 60, 64] }, { v: [53, 57, 60, 64] }, { v: [57, 60, 64, 67], name: 'Dm11' }] },
  { name: 'G13', root: 7, v: [53, 57, 59, 64], w: [4, 7, 10, 2], pent: [7, 9, 11, 2, 4],
    vars: [{ v: [53, 57, 59, 64] }, { v: [53, 57, 59, 64] },
           { v: [53, 58, 59, 63], root: 1, w: [4, 7, 10, 3], pent: [1, 3, 5, 8, 10], name: 'Db13' }] },
  { name: 'Cmaj9', root: 0, v: [52, 55, 59, 62], w: [4, 7, 11, 2], pent: [0, 2, 4, 7, 9],
    vars: [{ v: [52, 55, 59, 62] }, { v: [52, 55, 59, 62] }, { v: [52, 55, 57, 62], name: 'C6/9' }] },
  { name: 'Am9', root: 9, v: [55, 59, 60, 64], w: [3, 7, 10, 2], pent: [9, 0, 2, 4, 7],
    vars: [{ v: [55, 59, 60, 64] }, { v: [55, 59, 60, 64] }, { v: [55, 60, 62, 64], name: 'Am11' }] }
];

/* ---------- generované buffery ---------- */
function makeNoise(ctx, sec) {      // bílý šum
  var n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function makeIR(ctx, sec, rnd) {    // impulz dozvuku: doznívající šum, s časem tmavší
  var n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (var ch = 0; ch < 2; ch++) {
    var d = b.getChannelData(ch), lp = 0;
    for (var i = 0; i < n; i++) {
      var t = i / n, k = 0.9 - 0.8 * t;            // jednopólový filtr: výšky mizí dřív
      lp = lp * k + (rnd() * 2 - 1) * (1 - k);
      d[i] = lp * Math.pow(1 - t, 2.2) * Math.exp(-t * 2.5) * 3.2;
    }
  }
  return b;
}
function makeClickBuf(ctx) {        // krátké lupnutí jehly
  var n = Math.floor(ctx.sampleRate * 0.006), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.18));
  return b;
}

/* =====================================================================
   HUDEBNÍ JÁDRO
   ===================================================================== */
function createEngine(ctx, seed) {
  var rnd = mulberry(seed || 7), E = { ctx: ctx };
  var noise = makeNoise(ctx, 3), click = makeClickBuf(ctx);
  var hasPan = typeof ctx.createStereoPanner === 'function';

  /* --- graf: zdroje -> musicIn -> story -> speech -> vis -> sum -> lp -> comp -> out --- */
  var out = ctx.createGain(); out.gain.value = 0;
  var comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 3;
  comp.attack.value = 0.012; comp.release.value = 0.28;
  var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000; lp.Q.value = 0.5;
  var sum = ctx.createGain();
  sum.connect(lp); lp.connect(comp); comp.connect(out); out.connect(ctx.destination);

  var musicIn = ctx.createGain();
  var storyG = ctx.createGain(), speechG = ctx.createGain(), visG = ctx.createGain();
  musicIn.connect(storyG); storyG.connect(speechG); speechG.connect(visG); visG.connect(sum);

  var conv = ctx.createConvolver(); conv.buffer = makeIR(ctx, 2.6, rnd);
  var wet = ctx.createGain(); wet.gain.value = 0.55;
  conv.connect(wet); wet.connect(musicIn);

  /* sběrnice nástroje: úroveň, odeslání do dozvuku, volitelné autopan tremolo */
  function bus(level, send, pan) {
    var g = ctx.createGain(); g.gain.value = level;
    var tail = g;
    if (pan && hasPan) { tail = ctx.createStereoPanner(); g.connect(tail); }
    tail.connect(musicIn);
    var s = ctx.createGain(); s.gain.value = send; tail.connect(s); s.connect(conv);
    g.node = pan && hasPan ? tail : null;
    return g;
  }
  var bPiano = bus(1, 0.38, true), bVibes = bus(1, 0.55), bBass = bus(0.9, 0.04),
      bBrush = bus(1, 0.22), bRide = bus(1, 0.35, true);
  if (bPiano.node) {                 // stereo tremolo piana ~4 Hz
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 4.1; lg.gain.value = 0.2; lfo.connect(lg); lg.connect(bPiano.node.pan); lfo.start();
  }
  var vibTrem = ctx.createGain(); vibTrem.gain.value = 0.75;          // motor vibrafonu
  var vlfo = ctx.createOscillator(), vlg = ctx.createGain();
  vlfo.frequency.value = 4.6; vlg.gain.value = 0.22; vlfo.connect(vlg); vlg.connect(vibTrem.gain); vlfo.start();
  vibTrem.connect(bVibes);

  /* vinyl: tichý šum s lowpassem, klikání se plánuje zvlášť */
  var vSrc = ctx.createBufferSource(); vSrc.buffer = noise; vSrc.loop = true;
  var vhp = ctx.createBiquadFilter(); vhp.type = 'highpass'; vhp.frequency.value = 600;
  var vlp = ctx.createBiquadFilter(); vlp.type = 'lowpass'; vlp.frequency.value = 2800;
  var vg = ctx.createGain(); vg.gain.value = 0.014;
  vSrc.connect(vhp); vhp.connect(vlp); vlp.connect(vg); vg.connect(sum); vSrc.start();
  var clickBus = ctx.createGain(); clickBus.gain.value = 1; clickBus.connect(sum);

  /* bzučení tetovacího strojku: 100 Hz + harmonické, jemná modulace, jen v detailu */
  var humG = ctx.createGain(); humG.gain.value = 0;
  var humLp = ctx.createBiquadFilter(); humLp.type = 'lowpass'; humLp.frequency.value = 900;
  var humMod = ctx.createOscillator(), humModG = ctx.createGain();
  humMod.frequency.value = 6.5; humModG.gain.value = 2.2; humMod.start();
  [[1, 'triangle', 1], [2, 'sine', 0.55], [3, 'sine', 0.3], [5, 'sine', 0.1]].forEach(function (h) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = h[1]; o.frequency.value = 102 * h[0]; g.gain.value = h[2] * 0.5;
    humMod.connect(humModG); humModG.connect(o.frequency);
    o.connect(g); g.connect(humLp); o.start();
  });
  humLp.connect(humG); humG.connect(sum);

  /* --- hlasy nástrojů --- */

  /* Rhodes: FM, nosná sinus + modulátor 1:1; index rychle klesá (cink), obálka pomalá */
  function rhodes(t, midi, vel, dur, dest) {
    var f = mtof(midi), car = ctx.createOscillator(), mod = ctx.createOscillator();
    var mg = ctx.createGain(), env = ctx.createGain();
    car.frequency.value = f; mod.frequency.value = f;
    var idx = (0.6 + 2.1 * vel) * (midi > 66 ? 0.7 : 1);
    mg.gain.setValueAtTime(f * idx, t);
    mg.gain.setTargetAtTime(f * 0.3, t, 0.12);
    mg.gain.setTargetAtTime(f * 0.08, t + 0.6, 1.2);
    mod.connect(mg); mg.connect(car.frequency); car.connect(env); env.connect(dest);
    var tau = clamp(1.5 - (midi - 48) * 0.03, 0.7, 1.6);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vel * 0.2, t + 0.012);
    env.gain.setTargetAtTime(0, t + 0.014, tau);
    env.gain.setTargetAtTime(0, t + dur, 0.2);
    car.start(t); mod.start(t); car.stop(t + dur + 1.2); mod.stop(t + dur + 1.2);
    car.onended = function () { try { env.disconnect(); mg.disconnect(); } catch (e) {} };
  }

  /* vibrafon: sinus + zvonivý podtón 4f, krátký úder, měkké doznění */
  function vibes(t, midi, vel, dur) {
    var f = mtof(midi), o = ctx.createOscillator(), o2 = ctx.createOscillator();
    var g = ctx.createGain(), g2 = ctx.createGain();
    o.frequency.value = f; o2.frequency.value = f * 3.97; o2.type = 'sine';
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel * 0.15, t + 0.004);
    g.gain.setTargetAtTime(0, t + 0.006, 0.7);
    g.gain.setTargetAtTime(0, t + dur, 0.15);
    g2.gain.setValueAtTime(vel * 0.03, t); g2.gain.setTargetAtTime(0, t, 0.05);
    o.connect(g); o2.connect(g2); g.connect(vibTrem); g2.connect(vibTrem);
    o.start(t); o2.start(t); o.stop(t + dur + 1); o2.stop(t + 0.5);
    o.onended = function () { try { g.disconnect(); g2.disconnect(); } catch (e) {} };
  }

  /* kontrabas: sinus + trojúhelník, lowpass, krátké legato, měkký atak */
  function bass(t, midi, vel, dur) {
    var f = mtof(midi), o = ctx.createOscillator(), o2 = ctx.createOscillator();
    var g2 = ctx.createGain(), fl = ctx.createBiquadFilter(), env = ctx.createGain();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f; g2.gain.value = 0.35;
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(700, t); fl.frequency.setTargetAtTime(380, t, 0.15); fl.Q.value = 0.7;
    o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(env); env.connect(bBass);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vel * 0.2, t + 0.018);
    env.gain.setTargetAtTime(vel * 0.13, t + 0.05, 0.25);
    env.gain.setTargetAtTime(0, t + dur, 0.05);
    o.start(t); o2.start(t); o.stop(t + dur + 0.4); o2.stop(t + dur + 0.4);
    o.onended = function () { try { env.disconnect(); fl.disconnect(); } catch (e) {} };
  }

  /* metličky: swish = pásmově filtrovaný šum s pomalým nástupem */
  function swish(t, vel, len) {
    var s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 0.7;
    hp.type = 'highpass'; hp.frequency.value = 1300;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel * 0.34, t + len * 0.28);
    g.gain.setTargetAtTime(0, t + len * 0.3, len * 0.2);
    s.connect(bp); bp.connect(hp); hp.connect(g); g.connect(bBrush);
    s.start(t, rnd() * 2, len * 1.5);
    s.onended = function () { try { g.disconnect(); } catch (e) {} };
  }
  /* ride: vysokofrekvenční šum + dva nepatrné kovové podtóny, krátká obálka */
  function ride(t, vel) {
    var s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 7500; bp.Q.value = 1.6;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel * 0.15, t + 0.004);
    g.gain.setTargetAtTime(0, t + 0.006, 0.07);
    s.connect(bp); bp.connect(g); g.connect(bRide);
    s.start(t, rnd() * 2, 0.5);
    [4380, 6190].forEach(function (fr) {
      var o = ctx.createOscillator(), og = ctx.createGain();
      o.frequency.value = fr; og.gain.setValueAtTime(vel * 0.012, t); og.gain.setTargetAtTime(0, t, 0.09);
      o.connect(og); og.connect(bRide); o.start(t); o.stop(t + 0.5);
    });
    s.onended = function () { try { g.disconnect(); } catch (e) {} };
  }
  function crackle(t, vel) {
    var s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = click; hp.type = 'highpass'; hp.frequency.value = 1200; g.gain.value = vel;
    s.playbackRate.value = 0.7 + rnd() * 0.8;
    s.connect(hp); hp.connect(g); g.connect(clickBus); s.start(t);
  }

  /* --- hudební logika po osminách --- */
  var t0 = ctx.currentTime + 0.15;           // čas osminy 0
  var n = 0;                                  // další osmina k naplánování
  var plan = {};                              // zvolené varianty akordů
  var pending = [];                           // naplánované tóny frází {n, midi, dur, inst}
  var nextClick = t0 + 1;

  function stepTime(k) { return t0 + (Math.floor(k / 2) + ((k & 1) ? SWING : 0)) * BEAT; }

  function chordAt(idx) {                     // akord s variantou, zvolenou jednou pro každý výskyt
    if (!plan[idx]) {
      var base = CHORDS[idx % 4], v = base.vars[Math.floor(rnd() * 3)];
      if (idx % 4 === 1 && rnd() > 0.35) v = base.vars[0];     // tritonová substituce jen občas
      plan[idx] = { name: v.name || base.name, v: v.v, root: v.root != null ? v.root : base.root,
                    w: v.w || base.w, pent: v.pent || base.pent };
      delete plan[idx - 6];
    }
    return plan[idx];
  }
  function nearest(pc, ref) {                 // MIDI s třídou výšky pc nejblíž ref
    var m = 24 + pc; while (m < ref - 6) m += 12; while (m > ref + 6) m -= 12; return m;
  }
  function strum(t, notes, vel, inst) {       // rozprostřený akord, humanizace síly i času
    var sp = 0.010 + rnd() * 0.015;
    for (var i = 0; i < notes.length; i++) {
      var tt = t + i * sp + (rnd() - 0.5) * 0.008, vv = vel * (0.85 + rnd() * 0.3) * (i === notes.length - 1 ? 1.08 : 1);
      rhodes(tt, notes[i], clamp(vv, 0.1, 1), 3.4, bPiano);
    }
  }
  function makePhrase(idx, startN) {          // krátká fráze v pentatonice nad akordem
    var ch = chordAt(idx), scale = [], m, i;
    for (m = 66; m <= 84; m++) if (ch.pent.indexOf(m % 12) >= 0) scale.push(m);
    var pos = Math.floor(rnd() * (scale.length - 4)) + 2, len = 3 + Math.floor(rnd() * 4);
    var inst = rnd() < 0.55 ? 'v' : 'p', k = startN;
    for (i = 0; i < len; i++) {
      pending.push({ n: k, midi: scale[clamp(pos, 0, scale.length - 1)], dur: i === len - 1 ? 2.6 : 0.7, inst: inst, last: i === len - 1 });
      k += [1, 1, 2, 2, 3][Math.floor(rnd() * 5)];
      pos += [-2, -1, -1, 1, 1, 2, 3][Math.floor(rnd() * 7)];
    }
  }

  function playStep(k, t) {
    var bar = Math.floor(k / 8), pos = k % 8, cyc = k % 16;
    var idx = Math.floor(k / 16), ch = chordAt(idx), nx = chordAt(idx + 1);
    var beat = pos >> 1, off = pos & 1, i;

    /* piano: hlavní akord na první době, k tomu občasné lehké comping údery */
    if (cyc === 0) strum(t, ch.v, 0.85, 'p');
    else if ((cyc === 3 && rnd() < 0.5) || (cyc === 11 && rnd() < 0.4) || (cyc === 8 && rnd() < 0.3) || (cyc === 14 && rnd() < 0.25))
      strum(t, ch.v.slice(1 + (rnd() < 0.5 ? 1 : 0)), 0.45 + rnd() * 0.15, 'p');

    /* melodie: asi každý třetí akord, řídce, až v druhé polovině frází */
    if (cyc === 0 && idx > 0 && rnd() < 0.38) makePhrase(idx, k + 5 + Math.floor(rnd() * 5));
    for (i = pending.length - 1; i >= 0; i--) if (pending[i].n <= k) {
      var p = pending.splice(i, 1)[0], tt = stepTime(p.n) + (rnd() - 0.5) * 0.012;
      if (p.n < k - 1) continue;
      var vel = 0.55 + rnd() * 0.25;
      if (p.inst === 'v') vibes(tt, p.midi, vel, p.dur); else rhodes(tt, p.midi, vel * 0.9, p.dur + 1.5, bPiano);
    }

    /* kontrabas: walking po čtvrťových dobách, poslední doba je chromatický přechod */
    if (!off) {
      var b8 = (bar % 2) * 4 + beat, base = nearest(ch.root, 36), mid;
      var w = ch.w;
      if (b8 === 7) {
        var nr = nearest(nx.root, base);
        mid = nr + (rnd() < 0.5 ? -1 : 1);
      } else {
        var offs = [0, w[0], w[1], w[2], w[1], w[0], w[3], 0][b8];
        mid = base + offs; if (mid > 47) mid -= 12; if (mid < 28) mid += 12;
      }
      bass(t + (rnd() - 0.5) * 0.01, clamp(mid, 28, 50), 0.85 + rnd() * 0.2, BEAT * 0.93);
    }

    /* metličky: swish na 2 a 4, ride v swingu (ding, ding-a-ding) */
    if (!off && (beat === 1 || beat === 3)) swish(t, 0.8 + rnd() * 0.3, BEAT * 0.95);
    if (!off && beat === 0 && rnd() < 0.4) swish(t, 0.3, BEAT * 1.1);
    if ([0, 2, 3, 4, 6, 7].indexOf(pos) >= 0)
      ride(t + (rnd() - 0.5) * 0.008, pos === 3 || pos === 7 ? 0.55 : (pos === 2 || pos === 6 ? 0.8 : 0.9) * (0.85 + rnd() * 0.3));
  }

  /* naplánuje vše do času until (lookahead scheduler volá s currentTime + 0,2 s) */
  E.advance = function (until, now) {
    var t;
    while ((t = stepTime(n)) < until) {
      if (now == null || t >= now - 0.03) playStep(n, t);   // po pauze pozdní události přeskočíme
      n++;
    }
    while (nextClick < until) {                              // vinylové klikání, ~1,3 za sekundu
      if (now == null || nextClick >= now) crackle(nextClick, 0.03 + rnd() * 0.07);
      nextClick += -Math.log(1 - rnd()) / 1.3;
    }
  };

  /* reakce na příběh a řeč (plynulé přechody přes setTargetAtTime) */
  E.react = function (T, at) {
    var detail = T > 7.8 && T < 10.8, hum = T > 8.1 && T < 9.5;
    storyG.gain.setTargetAtTime(detail ? 0.65 : 1, at, 0.8);
    humG.gain.setTargetAtTime(hum ? 0.05 : 0, at, 0.5);
  };
  E.duck = function (on, at) { speechG.gain.setTargetAtTime(on ? 0.6 : 1, at, on ? 0.2 : 0.7); };
  E.fade = function (to, sec, at) {                        // lineární fade hlavní hlasitosti
    var g = out.gain; g.cancelScheduledValues(at); g.setValueAtTime(g.value, at);
    g.linearRampToValueAtTime(to, at + sec);
  };
  E.setHidden = function (hid, at) { visG.gain.setTargetAtTime(hid ? 0 : 1, at, 0.15); };
  E.out = out; E.humGain = humG; E.storyGain = storyG;
  E.chordAt = chordAt;
  return E;
}

/* měřicí zpřístupnění (OfflineAudioContext v testu) */
ST.audioLab = { createEngine: createEngine, MASTER: MASTER, BPM: BPM, CHORDS: CHORDS };

/* =====================================================================
   HLASY (Web Speech API)
   ===================================================================== */
var synth = (typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined') ? window.speechSynthesis : null;
var V = ST.voices = { supported: !!synth, count: 0, c: null, h: null, calls: 0, last: '', list: [] };
var voiceC = null, voiceH = null, pitchC = 1, pitchH = 1, rateC = 1, rateH = 1;
var duckTimer = 0;

function refreshVoices() {
  if (!synth) return;
  var all = [];
  try { all = synth.getVoices() || []; } catch (e) {}
  var cs = all.filter(function (v) { return /^cs([-_]|$)/i.test(v.lang || ''); });
  // prirozene (neuronove) hlasy maji prednost: Edge "Online (Natural)", Apple "Enhanced/Premium", Google
  var q = function (v) { return /natural|online|neural/i.test(v.name) ? 3 : /premium|enhanced|vylepšen/i.test(v.name) ? 2 : /google/i.test(v.name) ? 1 : 0; };
  cs.sort(function (a, b) { return q(b) - q(a); });
  var fem = /vlasta|zuzana|iveta|eli[sš]ka|alena|lenka|jana|google|female|žena|zena/i, mal = /jakub|anton[ií]n|tom[aá][sš]|vlastimil|male|muž|muz/i;
  var f = cs.filter(function (v) { return fem.test(v.name); })[0];
  var m = cs.filter(function (v) { return mal.test(v.name) && !/female/i.test(v.name); })[0];
  voiceC = voiceH = null; pitchC = 1; pitchH = 1; rateC = rateH = 1;
  if (cs.length) {
    voiceC = f || cs.filter(function (v) { return v !== m; })[0] || cs[0];
    voiceH = m || cs.filter(function (v) { return v !== voiceC; })[0] || voiceC;
    if (voiceC === voiceH) { pitchC = 1.15; pitchH = 0.85; rateC = 1.0; rateH = 0.95; }   // jen jeden hlas: rozliš výškou
  }
  V.count = cs.length; V.c = voiceC ? voiceC.name : null; V.h = voiceH ? voiceH.name : null;
  V.list = cs.map(function (v) { return v.name; });
}
if (synth) {
  refreshVoices();
  try { synth.addEventListener('voiceschanged', refreshVoices); } catch (e) { synth.onvoiceschanged = refreshVoices; }
  var tries = 0, poll = setInterval(function () { refreshVoices(); if (V.count || ++tries > 12) clearInterval(poll); }, 500);
}

function unduck() {
  clearTimeout(duckTimer);
  if (S.eng) S.eng.duck(false, S.ctx.currentTime);
}
function speak(kdo, text) {
  if (!synth || !S.on || !text) return;
  V.calls++; V.last = kdo + ': ' + text;
  var voice = kdo === 'h' ? voiceH : voiceC;
  if (!voice) return;                                       // bez českého hlasu nečteme, hudba hraje dál
  try {
    synth.cancel();                                         // nová replika ukončí předchozí
    var u = new window.SpeechSynthesisUtterance(text);
    u.lang = 'cs-CZ'; u.voice = voice;
    u.pitch = kdo === 'h' ? pitchH : pitchC; u.rate = kdo === 'h' ? rateH : rateC; u.volume = 1;
    u.onstart = function () { if (S.eng) S.eng.duck(true, S.ctx.currentTime); };
    u.onend = u.onerror = unduck;
    if (S.eng) S.eng.duck(true, S.ctx.currentTime);
    clearTimeout(duckTimer);
    duckTimer = setTimeout(unduck, 1500 + text.length * 95);   // pojistka: některé prohlížeče onend nevolají
    synth.speak(u);
  } catch (e) { unduck(); }
}
function primeSpeech() {            // Safari / iOS: první speak musí být v gestu uživatele
  if (!synth) return;
  try { var u = new window.SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'cs-CZ'; synth.speak(u); } catch (e) {}
}
function stopSpeech() { try { if (synth) synth.cancel(); } catch (e) {} unduck(); }

if (typeof ST.onSay === 'function') ST.onSay(function (kdo, text) { speak(kdo, text); });

/* =====================================================================
   OVLÁDÁNÍ: stav, tlačítko, scheduler
   ===================================================================== */
var S = { ctx: null, eng: null, on: false, want: false, timer: 0, btn: null, offTimer: 0 };

function loadPref() { try { return localStorage.getItem(PREF_KEY) === '1'; } catch (e) { return false; } }
function savePref(v) { try { localStorage.setItem(PREF_KEY, v ? '1' : '0'); } catch (e) {} }

function tick() {
  if (!S.eng) return;
  var now = S.ctx.currentTime;
  S.eng.advance(now + LOOKAHEAD, now);
  S.eng.react(typeof ST.T === 'number' ? ST.T : 0, now);
}
function startTimer() { if (!S.timer) S.timer = setInterval(tick, TICK); }
function stopTimer() { clearInterval(S.timer); S.timer = 0; }

/* vykreslení stavu tlačítka; pending = uloženo zapnuto, čeká na první gesto */
function paint(pending) {
  var b = S.btn; if (!b) return;
  var pressed = S.on || pending;
  b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  b.setAttribute('aria-label', 'Zvuk: ' + (S.on ? 'zapnuto' : pending ? 'zapnuto, spustí se po prvním doteku' : 'vypnuto'));
  b.querySelector('.snd-st').textContent = pressed ? 'zap' : 'vyp';
}

function turnOn() {
  if (!AC) { paint(false); return; }
  try {
    if (!S.ctx) { S.ctx = new AC(); S.eng = createEngine(S.ctx, Date.now() & 0xffff); }
    clearTimeout(S.offTimer);
    var ctx = S.ctx, eng = S.eng;
    S.on = true; S.want = true; savePref(true); paint(false);
    primeSpeech();
    var go = function () {
      if (!S.on) return;
      if (ctx.state !== 'running') { fail(); return; }       // zvuk zablokovaný (např. iframe)
      eng.fade(MASTER, 3, ctx.currentTime); startTimer(); tick();
    };
    var r = ctx.resume && ctx.resume();
    if (r && r.then) r.then(go, fail); else go();
    setTimeout(function () { if (S.on && ctx.state !== 'running') fail(); }, 1200);
  } catch (e) { fail(); }
}
function fail() { S.on = false; stopTimer(); stopSpeech(); paint(false); }   // preference se nemaže

function turnOff() {
  S.on = false; S.want = false; savePref(false); paint(false); stopSpeech();
  if (!S.ctx) return;
  var ctx = S.ctx; S.eng.fade(0, 1.5, ctx.currentTime);
  clearTimeout(S.offTimer);
  S.offTimer = setTimeout(function () {
    if (S.on) return;
    stopTimer(); try { ctx.suspend(); } catch (e) {}
  }, 1700);
}

/* stránka skrytá: ztišit a zastavit scheduler; po návratu plynule vrátit */
document.addEventListener('visibilitychange', function () {
  if (!S.on || !S.ctx) return;
  var now = S.ctx.currentTime;
  if (document.hidden) { S.eng.setHidden(true, now); stopTimer(); stopSpeech(); }
  else { try { S.ctx.resume(); } catch (e) {} S.eng.setHidden(false, S.ctx.currentTime); startTimer(); }
});

/* ---------- tlačítko v hlavičce ---------- */
var CSS =
'.snd{margin-left:auto;margin-right:clamp(12px,2.4vw,28px);display:inline-flex;align-items:center;gap:8px;background:none;border:0;' +
'border-bottom:1px solid var(--gold);padding:0 0 3px;cursor:pointer;color:var(--line);opacity:.8;' +
'font:500 .7rem/1.2 var(--font-body,"Outfit",system-ui,sans-serif);letter-spacing:.22em;text-transform:uppercase;transition:color .3s,opacity .3s,border-color .3s}' +
'.snd:hover{opacity:1;color:var(--gold-light)}' +
'.snd[aria-pressed="true"]{color:var(--gold-light);opacity:1}' +
'.snd svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}' +
'.snd .snd-x{stroke:var(--gold);opacity:1;transition:opacity .3s}' +
'.snd[aria-pressed="true"] .snd-x{opacity:0}' +
'.snd .snd-w{stroke:var(--gold);opacity:0;transition:opacity .3s}' +
'.snd[aria-pressed="true"] .snd-w{opacity:1}' +
'.snd-st{font-size:.56rem;letter-spacing:.18em;color:var(--gold);min-width:2.1em}' +
'@media (max-width:520px){.snd{gap:6px;letter-spacing:.16em;margin-right:12px}.snd-st{display:none}}' +
'@media (max-width:370px){.snd-t{display:none}}';

function buildButton() {
  var head = document.querySelector('header.top');
  if (!head || S.btn) return;
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'snd'; b.setAttribute('aria-pressed', 'false');
  b.innerHTML =
    '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 14.5V4.5l8-1.8v9.6"/><circle cx="5" cy="14.5" r="2"/><circle cx="13" cy="12.3" r="2"/>' +
    '<path class="snd-w" d="M17.2 6.2q1.4 1.8 0 3.6"/><path class="snd-x" d="M2.5 2.5l15 15"/></svg>' +
    '<span class="snd-t">Zvuk</span><span class="snd-st">vyp</span>';
  var cta = head.querySelector('.top-cta');
  if (cta) head.insertBefore(b, cta); else head.appendChild(b);
  S.btn = b;
  b.addEventListener('click', function () {
    if (S.pendingStart) { S.pendingStart(); return; }     // uloženo zapnuto: první klik zvuk jen spustí
    if (S.on) turnOff(); else turnOn();
  });
  paint(false);

  /* hudba hraje rovnou: zvuk je zapnutý, dokud ho návštěvník sám nevypne.
     Prohlížeč pustí zvuk až po prvním doteku, kliknutí nebo klávese (pravidlo všech prohlížečů),
     proto ho zkusíme spustit hned a pak při každém takovém gestu, dokud se nerozehraje. */
  var off = false; try { off = localStorage.getItem(PREF_KEY) === '0'; } catch (e) {}
  if (!off && AC) {
    S.want = true; paint(true);
    var evs = ['pointerdown', 'mousedown', 'touchstart', 'touchend', 'keydown', 'click', 'wheel'];
    var done = function () {
      evs.forEach(function (e) { document.removeEventListener(e, onGesture, true); });
      S.pendingStart = null; hideHint();
    };
    var lastTry = 0;
    var tryStart = function () {
      if (S.on && S.ctx && S.ctx.state === 'running') { done(); return; }
      var now = Date.now(); if (now - lastTry < 600) return; lastTry = now;
      turnOn();
      var c = S.ctx; if (!c) return;
      var chk = function () { if (c.state === 'running') done(); else paint(true); };
      setTimeout(chk, 60); setTimeout(chk, 1300);
    };
    var onGesture = function (e) { if (S.btn && S.btn.contains(e.target)) return; tryStart(); };
    S.pendingStart = function () { tryStart(); };
    evs.forEach(function (e) { document.addEventListener(e, onGesture, { capture: true, passive: true }); });
    /* pokus hned po načtení (projde, když už stránku návštěvník dřív poslouchal) */
    try {
      if (!S.ctx) { S.ctx = new AC(); S.eng = createEngine(S.ctx, Date.now() & 0xffff); }
      var r0 = S.ctx.resume && S.ctx.resume();
      if (r0 && r0.then) r0.then(function () { if (S.ctx.state === 'running') tryStart(); }, function () {});
    } catch (e) {}
    showHint();
  }
}
/* nenápadná výzva v úvodu: dokud zvuk nehraje */
var hintEl = null;
function showHint() {
  var stg = document.getElementById('stage'); if (!stg || hintEl) return;
  var st = document.createElement('style');
  st.textContent = '.snd-hint{position:absolute;left:50%;bottom:calc(120px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9;display:flex;align-items:center;gap:10px;' +
    'padding:10px 18px;border-radius:30px;background:rgba(12,13,17,.78);border:1px solid rgba(200,164,92,.45);color:var(--gold-light);font:500 .66rem/1 var(--font-body,"Outfit",sans-serif);' +
    'letter-spacing:.2em;text-transform:uppercase;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 10px 30px rgba(0,0,0,.5);transition:opacity .6s;animation:sndPulse 2.6s ease-in-out infinite}' +
    '.snd-hint i{width:8px;height:8px;border-radius:50%;background:var(--gold);box-shadow:0 0 12px var(--gold)}' +
    '@keyframes sndPulse{0%,100%{box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 0 rgba(200,164,92,.35)}50%{box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 8px rgba(200,164,92,0)}}' +
    '@media (prefers-reduced-motion:reduce){.snd-hint{animation:none}}';
  document.head.appendChild(st);
  hintEl = document.createElement('button'); hintEl.type = 'button'; hintEl.className = 'snd-hint';
  hintEl.innerHTML = '<i></i>Klepněte kamkoli a hraje hudba';
  hintEl.addEventListener('click', function () { if (S.pendingStart) S.pendingStart(); });
  stg.appendChild(hintEl);
  var loop = function () { if (!hintEl) return; var T = typeof ST.T === 'number' ? ST.T : 0; hintEl.style.opacity = T > .6 ? 0 : 1; hintEl.style.pointerEvents = T > .6 ? 'none' : 'auto'; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
function hideHint() { if (!hintEl) return; var h = hintEl; hintEl = null; h.style.opacity = 0; setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, 700); }

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildButton);
else buildButton();

})();
