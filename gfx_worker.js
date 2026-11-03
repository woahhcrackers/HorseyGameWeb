// Graphics worker: owns the page's canvas (as an OffscreenCanvas) and replays the command buffers the engine thread
// posts (rt/web/gfx_remote.c) through horseygame_gfx.wasm (rt/gfxworker/gfx_worker.c). Messages in: {init, canvas, env},
// {cmds: ArrayBuffer}. Out: {log}, {done: frame, q: occlusion results}, {rb: seq, addr, data}, {lost}, {fatal}.
'use strict';
let G = null, running = false, inPtr = 0, inCap = 0, lastSeq = 0;
const queue = [], st = { t0: performance.now(), busy: 0, lat: 0, nlat: 0 };   // st: share of wall time spent replaying (reported each second)
const hop = (() => { const ch = new MessageChannel(); let q = []; ch.port1.onmessage = () => { const f = q; q = []; for (const g of f) g(); }; return f => { q.push(f); if (q.length === 1) ch.port2.postMessage(0); }; })();
const fatal = err => { postMessage({ fatal: String((err && err.stack) || err) }); queue.length = 0; };

self.onmessage = e => {
  const d = e.data;
  if (d.init) { start(d).catch(fatal); return; }
  if (d.glcheck) { if (G) G._gfxw_glcheck(d.glcheck | 0); return; }        // debug: glGetError after every GL call of the next n frames ([gl] error lines)
  if (d.readtex) {                                                       // debug: {readtex: [gl texture, w, h, isFloat, name]} -> {img: {name, w, h, data}} (rows top-down)
    if (G) { const [tex, w, h, fl, name] = d.readtex; const p = G._gfxw_readtex(tex, w, h, fl) >>> 0;
      if (!p) postMessage({ log: `[gfx worker] readtex ${tex}: not a complete colour attachment` });
      else { const src = G.HEAPU8.subarray(p, p + w * h * 4), out = new Uint8Array(w * h * 4); for (let y = 0; y < h; y++) out.set(src.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
        G._free(p); postMessage({ img: { name, w, h, data: out } }, [out.buffer]); } }
    return; }
  if (d.passlog) { if (G) G['__passlog'] = d.passlog | 0; return; }
  if (d.skipshader !== undefined) { if (G) { G['__skipshader'] = String(d.skipshader); G['__skipver'] = (G['__skipver'] | 0) + 1; } return; }
  if (d.glsl) {
    if (G) { const h = String(d.glsl), p = G._malloc(h.length + 1); for (let i = 0; i < h.length; i++) G.HEAPU8[p + i] = h.charCodeAt(i) & 255; G.HEAPU8[p + h.length] = 0;
      const r = G._gfxw_glsl(p) >>> 0; G._free(p); let s = ''; if (r) { let e = r; while (G.HEAPU8[e]) e++; s = new TextDecoder().decode(G.HEAPU8.slice(r, e)); }
      postMessage({ log: '[glsl ' + h + ']\n' + (s || '(not found)') }); }
    return; }   // debug: log the next n frames' passes (gfx_host_passlog)
  queue.push(d);
  if (G) pump();
};

async function start(d) {
  importScripts('horseygame_gfx.js');
  let pairs = null;
  if (!d.noprelink) {
    const seen = new Set(), list = [];
    const take = arr => { for (const e of arr || []) if (typeof e === 'string' && !seen.has(e)) { seen.add(e); list.push(e); } };
    try { const r = await fetch('programs.json'); if (r.ok) take(await r.json()); } catch (e) {}
    take(d.learned);
    if (list.length) { pairs = new Map(); const add = (k, v) => { let a = pairs.get(k); if (!a) pairs.set(k, a = []); a.push(v); };
      for (const e of list) { const [v, p] = e.split(':'); if (!v || !p) continue; add('v' + v, p); if (p !== '-') add('p' + p, v); } }
  }
  G = await HorseygameGfx({
    canvas: d.canvas, rxcwPairs: pairs,
    preRun: [m => { for (const k in (d.env || {})) m.ENV[k] = d.env[k]; }],
    print: s => postMessage({ log: s }), printErr: s => postMessage({ log: s }),
  });
  postMessage({ log: '[gfx worker] ready' + (pairs ? ` (pre-link list: ${pairs.size} shaders)` : '') });
  pump();
}

function pump() {
  if (running || !G) return;
  running = true;
  try {
    while (queue.length) {
      const m = queue[0];
      if (m.cmds || m.pos !== undefined) {                    // (a buffer resumed after a yield has cmds = null)
        if (m.pos === undefined) {
          if (m.t) { st.lat += T0 + performance.now() - m.t; st.nlat++; }
          if (m.seq !== undefined) { if (m.seq !== lastSeq + 1) postMessage({ log: `[gfx worker] buffer ${m.seq} arrived after ${lastSeq}` }); lastSeq = m.seq; }
          const n = m.cmds.byteLength;
          if (n > inCap) { if (inPtr) G._free(inPtr); inCap = Math.max(n, inCap * 2, 1 << 20); inPtr = G._malloc(inCap) >>> 0; }
          G.HEAPU8.set(new Uint8Array(m.cmds), inPtr); m.pos = 0; m.n = n >> 2; m.cmds = null;
        }
        const t0 = performance.now(), r = G._gfxw_run(inPtr, m.n, m.pos), t1 = performance.now();
        st.busy += t1 - t0; if (t1 - st.t0 > 1000) { postMessage({ wstat: { busy: st.busy / (t1 - st.t0), lat: st.nlat ? st.lat / st.nlat : 0 } }); st.t0 = t1; st.busy = 0; st.lat = 0; st.nlat = 0; }
        if (r >= 0) { m.pos = r; running = false; hop(pump); return; }   // a task boundary between shader-variant compiles
      }
      queue.shift();
    }
  } catch (err) { fatal(err); }
  running = false;
  idlePoll(0);
}
// occlusion queries still outstanding after the queue ran dry: poll every ~2 ms for up to 20 ms (results must reach the
// engine thread before it starts its next frame); readbacks: until they have all landed
let pollTimer = 0, pollUntil = 0;
function idlePoll(t) {
  if (!G) return;
  if (!t) { pollUntil = performance.now() + 20; if (pollTimer) return; }
  pollTimer = 0;
  if (running || queue.length) return;
  const live = G._gfxw_poll();
  if ((live & 2) || (live && performance.now() < pollUntil)) pollTimer = self.scheduler && scheduler.postTask ? (scheduler.postTask(() => idlePoll(1), { delay: 2 }), 1) : setTimeout(() => idlePoll(1), 2);
}
