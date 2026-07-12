// ============================================================
// 決定論RNG (設計書a 第5章§5.11)
// 派生シード = hash(worldSeed, systemId, position, day)
// ============================================================

export function hashStr(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 派生シードRNGを作る: deriveRng(worldSeed, 'coins', day)
export function deriveRng(worldSeed, systemId, ...keys) {
  return mulberry32(hashStr(`${worldSeed}:${systemId}:${keys.join(':')}`));
}

export function pickR(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
export function weightedPick(rng, entries, weightFn) {
  const total = entries.reduce((a, e) => a + weightFn(e), 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (const e of entries) { r -= weightFn(e); if (r <= 0) return e; }
  return entries[entries.length - 1];
}
