/* Paquet Express — la carte du réseau.
   Un seul dessin, deux mises en page : « w » (large, à l'horizontale) et
   « t » (étroite, à la verticale, pour les téléphones). La mise en page est
   choisie selon la largeur disponible et recalculée si elle change.

   const m = RX.map.make({ state: 'ips' })   // ou un objet d'état
   m.set({ hl: ['rg'] })                      // modifie l'état
   m.go(['ap', 'sw'], { onStep }, done)       // fait voyager Bip
   m.pick(ids, fn)                            // rend des nœuds cliquables   */
(function () {
  'use strict';
  var RX = window.RX, C = RX.CARTE;

  var byId = {}, zoneById = {}, adj = {}, med = {};
  C.nodes.forEach(function (n) { byId[n.id] = n; });
  C.zones.forEach(function (z) { zoneById[z.id] = z; });
  C.edges.forEach(function (e) {
    (adj[e[0]] = adj[e[0]] || []).push(e[1]);
    (adj[e[1]] = adj[e[1]] || []).push(e[0]);
    med[e[0] + '>' + e[1]] = med[e[1] + '>' + e[0]] = e[2];
  });

  RX.map = {};
  RX.map.adj = adj;
  RX.map.medium = function (a, b) { return med[a + '>' + b]; };

  /* États prêts à l'emploi (voir data.js : v: { name: 'map', state: '…' }) */
  var PRESETS = {
    mission: { zones: 'hidden', dns: false, bip: 'pc', flag: 'web', route: ['pc', 'ap', 'sw', 'rg', 'rf', 'A', 'B', 'rh', 'web'] },
    zones: { zones: 'hidden', dns: false },
    routeur: { zones: 'named', dns: false, hl: ['rg'] },
    ips: { zones: 'named', dns: true, ips: true, hl: ['pc', 'rg', 'dns', 'web', 'photos'] },
    paths: { zones: 'named', dns: true, path1: ['rf', 'A', 'B', 'rh'], path2: ['rf', 'C', 'D', 'rh'], broken: ['B'] },
    route: { zones: 'named', dns: true },
    journey: { zones: 'named', dns: true, ips: true },
    all: { zones: 'named', dns: true, ips: true, owners: true, pub: true }
  };
  RX.map.PRESETS = PRESETS;

  // Tailles (en unités du viewBox) pour chaque mise en page
  var SZ = {
    w: { ico: 46, r: 29, name: 18.5, ip: 16.5, lh: 21, gap: 9, tag: 14, pillH: 31, bip: 44, letter: 16 },
    t: { ico: 30, r: 19, name: 11.5, ip: 10.5, lh: 13, gap: 6, tag: 10, pillH: 22, bip: 30, letter: 11 }
  };

  function esc(s) { return RX.esc(s); }

  /* Texte d'un nœud (nom sur une ou deux lignes, adresse IP, adresse publique),
     placé dessous (b), dessus (a), à gauche (l) ou à droite (r). */
  function labelSvg(n, L, s) {
    var side = (L === 't' ? n.lt : n.lw) || 'b';
    var rows = [];
    if (!n.letter) n.nom.split('\n').forEach(function (l) { rows.push({ c: 'mn-name', t: l, h: s.lh }); });
    if (n.ip) rows.push({ c: 'mn-ip', t: n.ip, h: s.ip + 4 });
    if (n.pub) rows.push({ c: 'mn-pub', t: n.pub, h: s.ip + 4 });
    if (!rows.length) return '';
    if (side === 'a') rows = rows.filter(function (r) { return r.c !== 'mn-name'; }).concat(rows.filter(function (r) { return r.c === 'mn-name'; }));
    var H = rows.reduce(function (a, r) { return a + r.h; }, 0);
    var x = 0, y0, anchor = 'middle';
    if (side === 'b') y0 = s.r + s.gap + s.name * 0.78;
    else if (side === 'a') y0 = -(s.r + s.gap) - H + s.name * 0.78;
    else { y0 = -H / 2 + s.name * 0.78; x = side === 'l' ? -(s.r + 8) : s.r + 8; anchor = side === 'l' ? 'end' : 'start'; }
    var y = y0, out = '';
    rows.forEach(function (r) {
      if (r.c !== 'mn-name') {
        // fond derrière l'adresse : aucun câble ne la traverse
        var w = r.t.length * s.ip * 0.62 + 8, bx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w + 4 : x - 4;
        out += '<rect class="' + r.c + '-bg" x="' + bx.toFixed(1) + '" y="' + (y - s.ip * 0.86).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (s.ip * 1.18).toFixed(1) + '" rx="' + (s.ip * 0.3).toFixed(1) + '"/>';
      }
      out += '<text class="' + r.c + '" text-anchor="' + anchor + '" x="' + x + '" y="' + y.toFixed(1) + '">' + esc(r.t) + '</text>';
      y += r.h;
    });
    return out;
  }

  function nodeSvg(n, L) {
    var s = SZ[L], p = n[L];
    if (!p) return '';
    var shape = n.router
      ? '<circle class="mn-bg" r="' + s.r + '"/>'
      : '<rect class="mn-bg" x="' + -s.r + '" y="' + -s.r + '" width="' + s.r * 2 + '" height="' + s.r * 2 + '" rx="' + s.r * 0.42 + '"/>';
    var ico = n.ico === 'router' ? s.r * 2 : s.ico;
    var out = '<g class="mn zn-' + n.zone + (n.deco ? ' deco' : '') + (n.router ? ' is-router' : '') + '" data-id="' + n.id + '" transform="translate(' + p[0] + ' ' + p[1] + ')"><g class="mn-in">' +
      '<circle class="mn-ring" r="' + (s.r + 7) + '"/>' + shape +
      '<use href="#i-' + n.ico + '" x="' + -ico / 2 + '" y="' + -ico / 2 + '" width="' + ico + '" height="' + ico + '"/>';
    if (n.letter) {
      out += '<g class="mn-letter"><circle cx="' + s.r * 0.78 + '" cy="' + -s.r * 0.78 + '" r="' + s.letter * 0.78 + '"/>' +
        '<text x="' + s.r * 0.78 + '" y="' + (-s.r * 0.78 + s.letter * 0.36) + '" text-anchor="middle">' + n.nom + '</text></g>';
    }
    if (n.tag) {
      var tw = n.tag.length * s.tag * 0.62 + s.tag * 0.9;
      out += '<g class="mn-tag"><rect x="' + (-tw / 2) + '" y="' + (-s.r - s.tag * 0.75) + '" width="' + tw + '" height="' + s.tag * 1.35 + '" rx="' + s.tag * 0.67 + '"/>' +
        '<text x="0" y="' + (-s.r + s.tag * 0.22) + '" text-anchor="middle">' + n.tag + '</text></g>';
    }
    out += '<g class="mn-x"><path d="M' + -s.r * 0.6 + ' ' + -s.r * 0.6 + 'L' + s.r * 0.6 + ' ' + s.r * 0.6 + 'M' + s.r * 0.6 + ' ' + -s.r * 0.6 + 'L' + -s.r * 0.6 + ' ' + s.r * 0.6 + '"/></g>';
    out += labelSvg(n, L, s) + '</g></g>';
    return out;
  }

  function zoneSvg(z, L) {
    var s = SZ[L], r = z[L];
    return '<g class="mz z-' + z.id + '" data-id="' + z.id + '">' +
      '<rect class="mz-bg" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="' + (L === 'w' ? 22 : 16) + '"/>' +
      '<g class="mz-tag" transform="translate(' + (r[0] + (L === 'w' ? 12 : 9)) + ' ' + (r[1] - s.pillH / 2) + ')">' +
        '<rect class="mz-pill" height="' + s.pillH + '" rx="' + s.pillH / 2 + '" width="40"/>' +
        '<text class="mz-name" x="' + s.pillH * 0.45 + '" y="' + s.pillH * 0.68 + '"></text>' +
      '</g>' +
      '<text class="mz-own" x="' + (r[0] + (L === 'w' ? 16 : 12)) + '" y="' + (r[1] + s.pillH + (L === 'w' ? 12 : 8)) + '"></text>' +
      '</g>';
  }

  function edgeSvg(e, L) {
    var a = byId[e[0]][L], b = byId[e[1]][L];
    if (!a || !b) return '';
    return '<line class="me me-' + e[2] + '" data-e="' + e[0] + '>' + e[1] + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>';
  }

  function pathD(ids, L) {
    return ids.map(function (id, i) { var p = byId[id][L]; return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join('');
  }

  function build(L) {
    var s = SZ[L];
    return '<svg class="map-svg lay-' + L + '" viewBox="' + C.viewBox[L] + '" aria-hidden="true">' +
      '<g class="m-zones">' + C.zones.map(function (z) { return zoneSvg(z, L); }).join('') + '</g>' +
      '<g class="m-edges">' + C.edges.map(function (e) { return edgeSvg(e, L); }).join('') + '</g>' +
      '<g class="m-paths"><path class="mp mp-route"/><path class="mp mp-1"/><path class="mp mp-2"/><path class="mp mp-trail"/></g>' +
      '<g class="m-nodes">' + C.nodes.map(function (n) { return nodeSvg(n, L); }).join('') + '</g>' +
      '<g class="m-flag" hidden><use href="#i-flag" x="' + -s.bip * 0.15 + '" y="' + -s.bip * 1.05 + '" width="' + s.bip * 0.85 + '" height="' + s.bip * 0.85 + '"/></g>' +
      '<g class="m-bip" hidden><g class="m-bip-in"><use href="#i-bip" x="' + -s.bip / 2 + '" y="' + -s.bip / 2 + '" width="' + s.bip + '" height="' + s.bip + '"/></g></g>' +
      '</svg>';
  }

  RX.map.make = function (opts) {
    opts = opts || {};
    var st = {};
    var fig = RX.h('<figure class="scene scene-map map" role="img" aria-label="' + (opts.label || 'Carte du réseau : le LAN du gymnase, le WAN du FAI, Internet et le centre de données de l’hébergeur') + '">' +
      '<div class="map-wrap"></div>' +
      (opts.legend === false ? '' : '<p class="map-legend"><span class="lg lg-wifi">Wi-Fi</span><span class="lg lg-cable">Câble Ethernet</span><span class="lg lg-fibre">Fibre optique</span></p>') +
      '<div class="map-cap" hidden></div></figure>');
    var wrap = fig.querySelector('.map-wrap'), cap = fig.querySelector('.map-cap');
    var L = opts.layout || 'w', svg = null, bipAt = null, bipXY = null, raf = 0, picker = null, ro = null, measured = false;
    var cam = null;   // sur petit écran : fenêtre de la carte large qui suit Bip (opts.cam)

    function q(sel) { return svg.querySelectorAll(sel); }
    function nodeEl(id) { return svg.querySelector('.mn[data-id="' + id + '"]'); }
    function xy(id) { var n = byId[id]; return n && n[L] ? n[L] : null; }
    function bipOffset() { return SZ[L].r + SZ[L].bip * 0.5 - 2; }

    function render() {
      var w = fig.clientWidth || wrap.clientWidth || 600;
      var narrow = w < 560;
      var camOn = narrow && !!opts.cam && !opts.layout;
      var want = opts.layout || (narrow && !camOn ? 't' : 'w');
      if (measured && want === L && camOn === !!cam && svg) return;
      measured = true;
      L = want;
      cam = camOn ? opts.cam : null;
      // Une animation en cours continue : elle relit les positions à chaque image.
      wrap.innerHTML = build(L);
      svg = wrap.firstElementChild;
      fig.setAttribute('data-layout', cam ? 'cam' : L);
      apply();
      if (bipAt) placeBip(xy(bipAt)[0], xy(bipAt)[1] - bipOffset());
      applyCam();
      if (picker) bindPick();
    }

    /** Recadre la carte large autour d'un point (ou sur une zone fixe). */
    function applyCam(x, y) {
      if (!cam || !svg) return;
      var vb = C.viewBox.w.split(' ').map(Number), box;
      if (cam.box) box = cam.box;
      else {
        var cx = x !== undefined ? x : bipXY ? bipXY[0] : vb[2] / 2;
        var cy = y !== undefined ? y : bipXY ? bipXY[1] : vb[3] / 2;
        box = [Math.max(0, Math.min(vb[2] - cam.w, cx - cam.w / 2)), Math.max(0, Math.min(vb[3] - cam.h, cy - cam.h / 2 + 30)), cam.w, cam.h];
      }
      svg.setAttribute('viewBox', box.map(function (v) { return v.toFixed(1); }).join(' '));
    }

    function sizePills() {
      q('.mz').forEach(function (g) {
        var t = g.querySelector('.mz-name'), r = g.querySelector('.mz-pill');
        var len = 0;
        try { len = t.getComputedTextLength(); } catch (e) { len = 0; }
        if (!len) len = t.textContent.length * SZ[L].name * 0.58;
        var w = len + SZ[L].pillH * 0.9;
        r.setAttribute('width', Math.max(w, SZ[L].pillH));
      });
    }

    function apply() {
      if (!svg) return;
      svg.classList.toggle('show-ip', !!st.ips);
      svg.classList.toggle('show-own', !!st.owners);
      svg.classList.toggle('show-pub', !!st.pub);
      svg.classList.toggle('no-dns', !st.dns);
      q('.mz').forEach(function (g) {
        var id = g.getAttribute('data-id'), z = zoneById[id];
        var lab = (st.labels && st.labels[id]) || (st.zones === 'hidden' ? '?' : z.court);
        g.querySelector('.mz-name').textContent = lab;
        g.querySelector('.mz-own').textContent = (z.type) + ' · ' + z.proprio;
        g.classList.toggle('blink', st.blink === id);
        g.classList.toggle('unknown', lab === '?');
        g.classList.toggle('dim', !!(st.focus && st.focus !== id));
      });
      sizePills();
      var hl = st.hl || [], dim = st.dim || [], broken = st.broken || [];
      q('.mn').forEach(function (g) {
        var id = g.getAttribute('data-id');
        g.classList.toggle('hl', hl.indexOf(id) >= 0);
        g.classList.toggle('dimmed', dim.indexOf(id) >= 0);
        g.classList.toggle('broken', broken.indexOf(id) >= 0);
        g.classList.toggle('cur', st.cur === id);
        g.classList.toggle('cand', !!(st.cand && st.cand.indexOf(id) >= 0));
        g.classList.toggle('wrong', st.wrong === id);
      });
      var mp = svg.querySelector('.mp-route'), p1 = svg.querySelector('.mp-1'), p2 = svg.querySelector('.mp-2'), tr = svg.querySelector('.mp-trail');
      mp.setAttribute('d', st.route ? pathD(st.route, L) : '');
      p1.setAttribute('d', st.path1 ? pathD(st.path1, L) : '');
      p2.setAttribute('d', st.path2 ? pathD(st.path2, L) : '');
      tr.setAttribute('d', st.trail && st.trail.length > 1 ? pathD(st.trail, L) : '');
      q('.me').forEach(function (e) {
        var k = e.getAttribute('data-e').split('>');
        var on = st.lit && st.lit.some(function (x) { return (x[0] === k[0] && x[1] === k[1]) || (x[0] === k[1] && x[1] === k[0]); });
        e.classList.toggle('lit', !!on);
      });
      var flag = svg.querySelector('.m-flag');
      if (st.flag && xy(st.flag)) {
        var f = xy(st.flag);
        flag.setAttribute('transform', 'translate(' + (f[0] + SZ[L].r * 0.55) + ' ' + (f[1] - SZ[L].r * 0.6) + ')');
        flag.removeAttribute('hidden');
      } else flag.setAttribute('hidden', '');
      if (st.bip !== undefined && st.bip !== bipAt) {
        bipAt = st.bip;
        if (bipAt && xy(bipAt)) placeBip(xy(bipAt)[0], xy(bipAt)[1] - bipOffset());
      }
      svg.querySelector('.m-bip').toggleAttribute('hidden', !bipAt);
    }

    function placeBip(x, y) {
      bipXY = [x, y];
      var b = svg.querySelector('.m-bip');
      b.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      b.removeAttribute('hidden');
      if (cam && !cam.box) applyCam(x, y);
    }

    var ctrl = {
      el: fig,
      get layout() { return L; },
      set: function (patch) {
        if (typeof patch === 'string') patch = PRESETS[patch] || {};
        Object.keys(patch).forEach(function (k) { st[k] = patch[k]; });
        apply();
        return ctrl;
      },
      reset: function (s) {
        st = {};
        bipAt = null;
        return ctrl.set(s || {});
      },
      state: function () { return st; },
      neighbors: function (id) { return adj[id] || []; },

      /** Fait voyager Bip de nœud en nœud. opts.onStep(id, i) à chaque arrivée. */
      go: function (seq, o, done) {
        o = o || {};
        cancelAnimationFrame(raf);
        var i = 0;
        var from = bipAt || seq[0];
        if (!bipAt) { bipAt = st.bip = seq[0]; i = 1; apply(); placeBip(xy(bipAt)[0], xy(bipAt)[1] - bipOffset()); }
        (function leg() {
          if (i >= seq.length) { if (done) done(); return; }
          var to = seq[i], a = xy(from), b = xy(to), off = bipOffset();
          var dist = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
          var scale = L === 'w' ? 1 : 2.4;
          var dur = RX.reduced ? 1 : Math.max(420, Math.min(1100, dist * scale * 4.2)) * (o.speed || 1);
          var t0 = performance.now();
          if (o.onLeg) o.onLeg(from, to, i);
          raf = requestAnimationFrame(function step(now) {
            var t = Math.min((now - t0) / dur, 1), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            var aa = xy(from), bb = xy(to); // la mise en page a pu changer en route
            placeBip(aa[0] + (bb[0] - aa[0]) * e, aa[1] - off + (bb[1] - aa[1]) * e);
            if (t < 1) { raf = requestAnimationFrame(step); return; }
            bipAt = st.bip = to; from = to;
            if (o.onStep) o.onStep(to, i);
            i++;
            if (o.pause && i < seq.length) RX.wait(o.pause, leg); else leg();
          });
        })();
      },

      /** Rend cliquables les nœuds « ids » ; fn(id) au clic ou au clavier. */
      pick: function (ids, fn) {
        picker = ids ? { ids: ids, fn: fn } : null;
        bindPick();
      },

      caption: function (html, cls) {
        if (!html) { cap.hidden = true; cap.innerHTML = ''; return; }
        cap.className = 'map-cap' + (cls ? ' ' + cls : '');
        cap.innerHTML = RX.typo(html);
        cap.hidden = false;
      },

      shake: function (id) {
        var g = nodeEl(id);
        if (!g) return;
        g.classList.remove('shake-n'); void g.getBoundingClientRect(); g.classList.add('shake-n');
      },

      destroy: function () { cancelAnimationFrame(raf); if (ro) ro.disconnect(); }
    };

    function bindPick() {
      q('.mn').forEach(function (g) {
        var id = g.getAttribute('data-id');
        var on = !!(picker && picker.ids.indexOf(id) >= 0);
        g.classList.toggle('pickable', on);
        if (on) {
          g.setAttribute('tabindex', '0');
          g.setAttribute('role', 'button');
          g.setAttribute('aria-label', 'Routeur ' + byId[id].nom.replace('\n', ' '));
          if (!g._bound) {
            g._bound = true;
            g.addEventListener('click', function () { if (picker && picker.ids.indexOf(id) >= 0) picker.fn(id); });
            g.addEventListener('keydown', function (e) {
              if ((e.key === 'Enter' || e.key === ' ') && picker && picker.ids.indexOf(id) >= 0) { e.preventDefault(); picker.fn(id); }
            });
          }
        } else {
          g.removeAttribute('tabindex');
          g.removeAttribute('role');
          g.removeAttribute('aria-label');
        }
      });
      svg.setAttribute('aria-hidden', picker ? 'false' : 'true');
    }

    // État initial
    if (typeof opts.state === 'string') st = JSON.parse(JSON.stringify(PRESETS[opts.state] || {}));
    else if (opts.state) st = JSON.parse(JSON.stringify(opts.state));

    // La mise en page ne peut être choisie qu'une fois la carte dans la page.
    function ready() {
      if (!fig.isConnected) { requestAnimationFrame(ready); return; }
      render();
      if ('ResizeObserver' in window) {
        ro = new ResizeObserver(function () { render(); });
        ro.observe(fig);
      } else window.addEventListener('resize', render);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (svg) sizePills(); });
    }
    // Rendu provisoire (avant insertion), remplacé dès que la largeur est connue.
    wrap.innerHTML = build(L);
    svg = wrap.firstElementChild;
    fig.setAttribute('data-layout', L);
    apply();
    requestAnimationFrame(ready);
    return ctrl;
  };
})();
