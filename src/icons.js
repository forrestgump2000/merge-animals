// Pixel-art icons drawn from tiny text grids (Minecraft item style).
const ART = {
  coin: {
    pal: { k: '#5a3a00', y: '#ffd700', o: '#e0a800', w: '#fff6b0' },
    rows: [
      '..kkkkkk..',
      '.kyyyyyyk.',
      'kywwyyyyok',
      'kywyyyyyok',
      'kyyyoyyyok',
      'kyyyoyyyok',
      'kyyyyyyyok',
      'kyyyyyyook',
      '.kooooook.',
      '..kkkkkk..',
    ],
  },
  worm: {
    pal: { p: '#ff8fb1', d: '#d9577f', k: '#4a1a2a' },
    rows: [
      '..........',
      '.......pp.',
      '......pkdp',
      '.....pd...',
      '..pp.p....',
      '.pddpd....',
      'pd..pd....',
      'p...dp....',
      '.....d....',
      '..........',
    ],
  },
  shrimp: {
    pal: { o: '#ff8a5b', d: '#d9603a', k: '#3a1a10', w: '#ffd2b8' },
    rows: [
      '..........',
      '...dd.....',
      '..doood...',
      '.dwoooood.',
      '.dwoooookd',
      '..dwooooo.',
      '...ddwooo.',
      '......doo.',
      '.....ddod.',
      '....d..d..',
    ],
  },
  squid: {
    pal: { p: '#c77dff', d: '#8a4fcf', w: '#ffffff', k: '#1a1a1a' },
    rows: [
      '...pppp...',
      '..pppppp..',
      '..pppppp..',
      '..pwkpwk..',
      '..pppppp..',
      '..dpdpdp..',
      '..d.d.d.d.',
      '.d..d..d..',
      '.d.d...d..',
      '..d....d..',
    ],
  },
  golden: {
    pal: { y: '#ffd700', o: '#e0a800', w: '#fff6b0', g: '#9a9a9a', k: '#5a3a00' },
    rows: [
      '.......g..',
      '......g...',
      '.....g....',
      '...yyy....',
      '..ywwyy...',
      '.ywyyyoy..',
      '.yyyyyoy..',
      '..yyyoy...',
      '...ooy..k.',
      '....yyykk.',
    ],
  },
  chum: {
    pal: { r: '#c0392b', d: '#7a1f17', b: '#8b5a2b', k: '#4a2e12', w: '#e6e6e6' },
    rows: [
      '..........',
      '..rr.dr...',
      '.rdrrrdr..',
      '..rdrrr...',
      '.kkkkkkkk.',
      '.kbbbbbbk.',
      '.kbwbbbbk.',
      '.kbbbbwbk.',
      '.kbbbbbbk.',
      '.kkkkkkkk.',
    ],
  },
};

const cache = {};
export function pixelIcon(id) {
  if (cache[id]) return cache[id];
  const art = ART[id] || ART.worm;
  const n = art.rows.length;
  const s = 4;
  const c = document.createElement('canvas');
  c.width = c.height = n * s;
  const g = c.getContext('2d');
  art.rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    g.fillStyle = art.pal[ch];
    g.fillRect(x * s, y * s, s, s);
  }));
  return (cache[id] = c.toDataURL());
}
