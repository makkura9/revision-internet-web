/* Paquet Express — écrans (accueil, parcours, parties, bilan, projection)
   et fiche imprimable. */
(function () {
  'use strict';
  var RX = window.RX, h = RX.h, ico = RX.ico, esc = RX.esc;
  var P = RX.PARTIES, NOT = RX.NOTIONS;
  var app = document.getElementById('app');
  var state = RX.store.load();
  var lastPos = null;          // dernière position de Bip sur le parcours
  var celebrated = false;      // les confettis du bilan ne partent qu'une fois
  var cleanups = [];           // à exécuter en quittant un écran

  /* ---------- Calculs sur la progression ---------- */
  function res(p) { return state.res[p.id]; }
  function totalStars() { return P.reduce(function (s, p) { return s + (res(p) ? res(p).stars : 0); }, 0); }
  function doneCount() { return P.filter(res).length; }
  function nextIndex() { for (var i = 0; i < P.length; i++) if (!res(P[i])) return i; return P.length; }
  function rang(stars) {
    var r = RX.RANGS[0];
    RX.RANGS.forEach(function (x) { if (stars >= x.min) r = x; });
    return r.t;
  }
  function missedAll() {
    var seen = {}, out = [];
    P.forEach(function (p) {
      (res(p) ? res(p).missed : []).forEach(function (k) { if (!seen[k] && NOT[k]) { seen[k] = 1; out.push(k); } });
    });
    return out;
  }
  function countItems(steps) {
    return steps.reduce(function (n, s) {
      if (s.type === 'pick') return n + s.options.filter(function (o) { return o.ok; }).length;
      if (s.type === 'sort') return n + s.cards.length;
      if (s.type === 'match') return n + s.pairs.length;
      if (s.type === 'order') return n + s.steps.length;
      if (s.type === 'maplabel') return n + s.targets.length;
      if (s.type === 'dns' || s.type === 'route' || s.type === 'tcp') return n + 2;
      if (s.type === 'encaps') return n + 6;
      if (s.type === 'journey') return n + 2;
      return n + 1;
    }, 0);
  }

  function show(el, name, wide) {
    cleanups.forEach(function (f) { f(); });
    cleanups = [];
    app.innerHTML = '';
    app.appendChild(el);
    document.body.setAttribute('data-screen', name);
    document.body.classList.toggle('wide', !!wide);
    window.scrollTo(0, 0);
  }

  function modal(html, cls) {
    var d = h('<dialog class="modal ' + (cls || '') + '"><div class="modal-in">' + html + '</div></dialog>');
    document.body.appendChild(d);
    d.addEventListener('close', function () { d.remove(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    return d;
  }

  function prettyUrl() { return RX.siteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''); }
  /** Même adresse, autorisée à passer à la ligne après chaque « / ». */
  function prettyUrlHtml() { return esc(prettyUrl()).replace(/\//g, '/<wbr>'); }

  function qrModal() {
    modal('<h2>Scanne pour suivre le cours</h2>' + RX.qrSvg(RX.siteUrl(), 'big') +
      '<p class="mono-url">' + prettyUrlHtml() + '</p>' +
      '<button class="btn" type="button" data-close>Fermer</button>', 'modal-qr');
  }

  function memoHtml(keys, missedSet) {
    return '<dl>' + keys.map(function (k) {
      var rv = missedSet && missedSet[k];
      return '<div class="' + (rv ? 'revoir' : '') + '"><dt>' + NOT[k].t + (rv ? ' <span class="tag-revoir">à revoir</span>' : '') + '</dt><dd>' + NOT[k].d + '</dd></div>';
    }).join('') + '</dl>';
  }

  /* ================= ACCUEIL ================= */
  var ROUTE = 'M36 104C60 104 84 60 108 60S156 104 180 104S228 60 252 60S300 104 324 104';
  function heroSvg() {
    var stops = [['laptop', 'Toi', 36, 104], ['router', 'Routeur', 108, 60], ['book', 'DNS', 180, 104], ['globe', 'Internet', 252, 60], ['server', 'Serveur', 324, 104]];
    return '<svg class="hero" viewBox="0 0 360 160" role="img" aria-label="Le voyage de Bip : ton ordinateur, le routeur, le DNS, Internet, puis le serveur">' +
      '<path class="hero-route" d="' + ROUTE + '"/>' +
      stops.map(function (s, i) {
        return '<g class="hero-stop" style="--i:' + i + '"><circle cx="' + s[2] + '" cy="' + s[3] + '" r="23"/>' +
          '<use href="#i-' + s[0] + '" x="' + (s[2] - 15) + '" y="' + (s[3] - 15) + '" width="30" height="30"/>' +
          '<text x="' + s[2] + '" y="' + (s[3] + 41) + '">' + s[1] + '</text></g>';
      }).join('') +
      '<g class="hero-bip"' + (RX.reduced ? ' transform="translate(108 60)"' : '') + '><use href="#i-bip" x="-15" y="-55" width="30" height="30"/>' +
      (RX.reduced ? '' : '<animateMotion dur="10s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1;0;0" keyTimes="0;0.44;0.5;0.94;1" path="' + ROUTE + '"/>') +
      '</g></svg>';
  }

  function home() {
    var started = doneCount() > 0;
    var dur = P.reduce(function (s, p) { return s + p.duree; }, 0);
    var el = h('<section class="home">' +
      '<p class="kicker">' + esc(RX.SITE.classe) + ' · Cours</p>' +
      '<h1 class="logo"><span class="l1">Paquet</span><span class="l2">Express</span></h1>' +
      '<p class="tagline">TCP/IP : le voyage d’un paquet sur Internet</p>' +
      heroSvg() +
      '<p class="lead">Suis <b>Bip</b>, un paquet de données, du gymnase jusqu’au serveur Web : adresses IP, DNS, routeurs, TCP… puis <b>emballe-le toi-même</b> pour la mission finale.</p>' +
      '<form class="label-card start" novalidate>' +
        '<div class="lc-row"><span>Expéditeur</span><span>' + P.length + ' parties · ' + dur + ' min</span></div>' +
        '<label for="nom">Ton prénom</label>' +
        '<input id="nom" name="nom" type="text" maxlength="30" autocomplete="given-name" autocapitalize="words" placeholder="Pour ta fiche imprimable" value="' + esc(state.nom) + '">' +
        '<button class="btn primary big" type="submit">' + (started ? 'Reprendre' : 'C’est parti') + ' ' + ico('next') + '</button>' +
        (started ? '<p class="lc-prog">' + ico('star', 'star') + ' ' + totalStars() + ' / ' + (P.length * 3) + ' · ' + doneCount() + ' partie' + (doneCount() > 1 ? 's' : '') + ' sur ' + P.length + '</p>' : '') +
        '<div class="barcode" aria-hidden="true"></div>' +
      '</form>' +
      '<div class="home-foot">' +
        '<button class="link-btn" type="button" data-act="qr">' + ico('qr') + ' Afficher le QR code du site</button>' +
        '<a class="link-btn" href="#/projection">' + ico('screen') + ' Mode projection (pour le prof)</a>' +
        '<p class="note">Ta progression reste enregistrée sur cet appareil, nulle part ailleurs.</p>' +
      '</div></section>');
    el.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      state.nom = el.querySelector('#nom').value.trim().slice(0, 30);
      RX.store.save(state);
      location.hash = '#/parcours';
    });
    el.querySelector('[data-act="qr"]').addEventListener('click', qrModal);
    show(el, 'home');
  }

  /* ================= PARCOURS ================= */
  function hub() {
    var nxt = nextIndex(), all = nxt === P.length;
    var stations = P.map(function (p, i) {
      var r = res(p), b = state.bonus[p.id];
      return '<li class="station' + (r ? ' is-done' : '') + (i === nxt ? ' is-next' : '') + '" style="--c:' + p.c + '">' +
        '<a class="st-btn" href="#/p/' + p.id + '">' +
          '<span class="st-node">' + ico(p.icone) + (r ? '<span class="st-check">' + ico('check') + '</span>' : '') + '</span>' +
          '<span class="st-info"><span class="st-k">Partie ' + (i + 1) + ' · ' + p.duree + ' min' + (p.finale ? ' · mission finale' : '') + '</span>' +
          '<span class="st-t">' + p.titre + '</span><span class="st-s">' + p.sous + '</span>' +
          (r ? RX.starsHtml(r.stars) + '<span class="st-sc">' + r.e + ' / ' + r.t + '</span>' : '<span class="st-go">' + (i === nxt ? 'Commencer' : 'À faire') + '</span>') +
          (b ? '<span class="st-bonus">' + ico('target') + ' Défi relevé</span>' : '') +
          '</span></a></li>';
    }).join('');
    var el = h('<section class="hub">' +
      '<header class="top"><a class="brand" href="#/" aria-label="Retour à l’accueil"><span>Paquet</span><span>Express</span></a>' +
      '<div class="top-stars" aria-label="' + totalStars() + ' étoiles sur ' + (P.length * 3) + '">' + ico('star', 'star') + '<b>' + totalStars() + '</b> / ' + (P.length * 3) + '</div></header>' +
      '<h1 class="hub-title">' + (state.nom ? esc(state.nom) + ', voici ton parcours' : 'Ton parcours') + '</h1>' +
      '<p class="hub-sub">' + (all ? 'Tout le parcours est terminé. Imprime ta fiche, ou relève les défis bonus.' : 'Chaque partie commence par une <b>explication du prof</b>, puis c’est à toi de jouer. Avance au rythme de la classe.') + '</p>' +
      '<div class="route"><svg class="route-svg" aria-hidden="true"><path class="r-bg"/><path class="r-done"/></svg>' +
      '<ol class="stations">' + stations +
        '<li class="station finish' + (all ? ' is-next' : '') + '" style="--c:#FF5A36"><a class="st-btn" href="#/bilan">' +
        '<span class="st-node">' + ico('flag') + '</span>' +
        '<span class="st-info"><span class="st-k">Arrivée</span><span class="st-t">Bilan &amp; fiche</span>' +
        '<span class="st-s">Ce qu’il faut retenir, et ta fiche à imprimer</span></span></a></li>' +
      '</ol>' +
      '<div class="bip-marker" aria-hidden="true">' + ico('bip') + '</div></div></section>');
    show(el, 'hub');

    var route = el.querySelector('.route'), svg = el.querySelector('.route-svg');
    var bg = el.querySelector('.r-bg'), done = el.querySelector('.r-done'), bip = el.querySelector('.bip-marker');
    var lens = [], raf = 0;

    function layout(animate) {
      var rr = route.getBoundingClientRect();
      var pts = Array.prototype.map.call(el.querySelectorAll('.st-node'), function (n) {
        var r = n.getBoundingClientRect();
        return [r.left - rr.left + r.width / 2, r.top - rr.top + r.height / 2];
      });
      svg.setAttribute('viewBox', '0 0 ' + rr.width + ' ' + rr.height);
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      lens = [0];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], k = (b[1] - a[1]) * 0.95;
        d += 'C' + a[0] + ' ' + (a[1] + k) + ' ' + b[0] + ' ' + (b[1] - k) + ' ' + b[0] + ' ' + b[1];
        bg.setAttribute('d', d);
        lens.push(bg.getTotalLength());
      }
      done.setAttribute('d', d);
      var total = lens[lens.length - 1];
      done.style.strokeDasharray = total;
      var from = animate && lastPos !== null && lastPos !== nxt && !RX.reduced ? lastPos : nxt;
      cancelAnimationFrame(raf);
      place(lens[from]);
      done.style.strokeDashoffset = total - lens[from];
      if (from !== nxt) {
        var t0 = performance.now(), dur = 1300, l0 = lens[from], l1 = lens[nxt];
        raf = requestAnimationFrame(function step(now) {
          var t = Math.min((now - t0 - 350) / dur, 1);
          if (t > 0) {
            var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            var l = l0 + (l1 - l0) * e;
            place(l);
            done.style.strokeDashoffset = total - l;
          }
          if (t < 1) raf = requestAnimationFrame(step);
        });
      }
      lastPos = nxt;
    }
    function place(len) {
      var p = bg.getPointAtLength(len);
      bip.style.transform = 'translate(' + (p.x - 22) + 'px,' + (p.y - 84) + 'px)';
    }

    layout(true);
    var target = el.querySelectorAll('.station')[nxt];
    if (target && nxt > 0) setTimeout(function () { target.scrollIntoView({ block: 'center', behavior: RX.reduced ? 'auto' : 'smooth' }); }, 120);
    var rt;
    function onResize() { clearTimeout(rt); rt = setTimeout(function () { layout(false); }, 120); }
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (el.isConnected) layout(false); });
    cleanups.push(function () { window.removeEventListener('resize', onResize); cancelAnimationFrame(raf); });
  }

  /* ================= CARTES D'EXPLICATION ================= */
  /** Construit une carte d'explication et son illustration. */
  function slideEl(s, p, opts) {
    opts = opts || {};
    var scene = null, el;
    if (s.devine) {
      el = h('<article class="slide slide-q" style="--c:' + p.c + '">' +
        '<p class="slide-k">' + ico('bulb') + ' À ton avis ?</p>' +
        '<div class="slide-q-in"><span class="slide-q-bip">' + ico('bip') + '</span><h2 class="slide-q-t">' + s.t + '</h2></div>' +
        '<p class="slide-q-hint">' + (opts.proj ? 'Discutez-en, puis passez à la carte suivante.' : 'Réfléchis un instant… La réponse est sur la carte suivante.') + '</p></article>');
      return { el: el, scene: null };
    }
    el = h('<article class="slide' + (s.extra ? ' extra' : '') + (s.v ? ' has-v' : '') + (s.v && s.v.name === 'map' ? ' v-map' : '') + '" style="--c:' + p.c + ';--ct:' + p.ct + '">' +
      '<div class="slide-v"></div>' +
      '<div class="slide-txt"><p class="slide-k">' + (s.extra ? ico('target') + ' ' : '') + s.k + '</p><h2 class="slide-t">' + s.t + '</h2>' +
      s.p.map(function (x) { return '<p class="slide-p">' + x + '</p>'; }).join('') +
      (s.aside ? '<aside class="slide-aside">' + ico('bulb') + '<p><b>' + s.aside.t + '</b> ' + s.aside.p + '</p></aside>' : '') +
      '</div></article>');
    if (s.v) {
      scene = RX.scenes.make(s.v);
      el.querySelector('.slide-v').appendChild(scene.el);
    } else el.querySelector('.slide-v').remove();
    return { el: el, scene: scene };
  }

  /* ================= UNE PARTIE ================= */
  function partie(p, opts) {
    opts = opts || {};
    var idx = P.indexOf(p);
    var bonus = !!opts.bonus, steps = bonus ? p.bonus : p.steps, nSteps = steps.length;
    var cur = -1, earned = 0, total = 0, missed = {}, stepE = 0, stepT = 0, sceneCtl = null;
    var el = h('<section class="partie" style="--c:' + p.c + ';--ct:' + p.ct + '">' +
      '<header class="m-top"><a class="icon-btn" href="#/parcours" aria-label="Quitter et revenir au parcours">' + ico('x') + '</a>' +
      '<div class="m-mid"></div>' +
      '<button class="icon-btn memo-btn" type="button" aria-label="Mémo : ce qu’il faut retenir">' + ico('memo') + '</button></header>' +
      '<div class="m-body"></div><div class="m-bar" hidden></div></section>');
    var body = el.querySelector('.m-body'), bar = el.querySelector('.m-bar'), mid = el.querySelector('.m-mid');
    el.querySelector('.memo-btn').addEventListener('click', function () {
      modal('<p class="kicker dark">Partie ' + (idx + 1) + ' · ' + p.titre + '</p><h2>Mémo</h2><div class="memo-modal">' + memoHtml(p.memo) + '</div>' +
        '<button class="btn" type="button" data-close>Fermer</button>', 'modal-memo');
    });

    function stopScene() { if (sceneCtl && sceneCtl.destroy) sceneCtl.destroy(); sceneCtl = null; }

    function headerProgress(n) {
      mid.innerHTML = '<div class="m-prog" role="progressbar" aria-label="Progression" aria-valuemin="0" aria-valuemax="' + nSteps + '" aria-valuenow="' + Math.max(0, n) + '">' +
        steps.map(function (s, i) { return '<i class="' + (i < n ? 'on' : i === n ? 'cur' : '') + '"></i>'; }).join('') + '</div>' +
        '<div class="m-score" aria-label="Bonnes réponses du premier coup">' + ico('check') + '<b>' + earned + '</b></div>';
    }
    function headerSlides(i, n) {
      mid.innerHTML = '<p class="m-chip">' + ico('megaphone') + '<span>Point prof · ' + (i + 1) + ' / ' + n + '</span></p>';
    }
    function headerPlain(t) { mid.innerHTML = '<p class="m-chip plain"><span>' + t + '</span></p>'; }

    /* --- Introduction de la partie --- */
    function intro() {
      dropKey();
      stopScene();
      headerPlain('Partie ' + (idx + 1) + ' / ' + P.length);
      bar.hidden = true;
      body.innerHTML = '';
      document.body.classList.remove('wide');
      var node = h('<div class="intro">' +
        '<p class="kicker">Partie ' + (idx + 1) + ' / ' + P.length + ' · ' + p.duree + ' min</p>' +
        '<div class="intro-ico">' + ico(p.icone) + '</div>' +
        '<h1>' + p.titre + '</h1>' +
        '<div class="bubble"><span class="bubble-bip">' + ico('bip') + '</span><p>' + p.intro + '</p></div>' +
        '<div class="intro-steps"><p><span class="is-n">1</span><span><b>Le prof explique</b>' + p.slides.length + (p.slides.length > 1 ? ' cartes' : ' carte') + ' à suivre, environ ' + p.prof + ' min</span></p>' +
        '<p><span class="is-n">2</span><span><b>À toi de jouer</b>' + countItems(p.steps) + ' réponses à donner</span></p>' +
        (p.bonus.length ? '<p><span class="is-n">' + ico('target') + '</span><span><b>Défi bonus</b>si tu as fini avant les autres</span></p>' : '') + '</div>' +
        '<button class="btn primary big" type="button" data-go="slides">' + ico('megaphone') + ' Suivre l’explication</button>' +
        '<button class="link-btn" type="button" data-go="steps">Explication terminée ? Aller aux exercices ' + ico('next') + '</button>' +
        '</div>');
      node.querySelector('[data-go="slides"]').addEventListener('click', function () { slides(0); });
      node.querySelector('[data-go="steps"]').addEventListener('click', function () { step(0); });
      body.appendChild(node);
      window.scrollTo(0, 0);
    }

    /* --- Les cartes d'explication --- */
    function slides(i) {
      dropKey();
      stopScene();
      bar.hidden = true;
      var n = p.slides.length, s = p.slides[i];
      headerSlides(i, n);
      document.body.classList.add('wide');
      body.innerHTML = '';
      var built = slideEl(s, p);
      sceneCtl = built.scene;
      var wrap = h('<div class="slides"></div>');
      if (i === 0) wrap.appendChild(h('<p class="listen">' + ico('megaphone') + '<span><b>Écoute l’explication du prof.</b> Tu peux relire ces cartes quand tu veux.</span></p>'));
      wrap.appendChild(built.el);
      var nav = h('<nav class="slide-nav" aria-label="Cartes d’explication">' +
        '<button class="btn ghost small" type="button" data-d="-1"' + (i === 0 ? ' disabled' : '') + '>' + ico('back') + '<span>Précédente</span></button>' +
        '<span class="dots">' + p.slides.map(function (x, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('') + '</span>' +
        (i < n - 1
          ? '<button class="btn small" type="button" data-d="1"><span>Suivante</span>' + ico('next') + '</button>'
          : '<button class="btn primary small" type="button" data-d="go"><span>À toi de jouer</span>' + ico('next') + '</button>') +
        '</nav>');
      nav.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-d]');
        if (!b || b.disabled) return;
        var d = b.getAttribute('data-d');
        if (d === 'go') step(0); else slides(i + Number(d));
      });
      wrap.appendChild(nav);
      body.appendChild(wrap);
      window.scrollTo(0, 0);
      var onKey = function (e) {
        if (e.target.closest && e.target.closest('input, textarea')) return;
        if (e.key === 'ArrowRight' && i < n - 1) slides(i + 1);
        else if (e.key === 'ArrowLeft' && i > 0) slides(i - 1);
      };
      document.addEventListener('keydown', onKey);
      cleanups.push(function () { document.removeEventListener('keydown', onKey); });
      currentKey = onKey;
    }
    var currentKey = null;
    function dropKey() { if (currentKey) { document.removeEventListener('keydown', currentKey); currentKey = null; } }

    /* --- Un exercice --- */
    function sceneFor(st) {
      if (st.map) return RX.map.make({ state: st.map, cam: st.type === 'journey' ? { w: 440, h: 330 } : st.type === 'route' ? { box: [420, 16, 600, 452] } : null });
      if (st.type === 'dns') return RX.scenes.make({ name: 'dnschat', wait: true, table: st.table });
      if (st.scene) return RX.scenes.make(st.scene);
      return null;
    }

    function step(i) {
      dropKey();
      stopScene();
      cur = i; stepE = 0; stepT = 0;
      headerProgress(i);
      bar.hidden = true;
      bar.innerHTML = '';
      body.innerHTML = '';
      var st = steps[i];
      var scene = sceneFor(st);
      sceneCtl = scene;
      var wrap = h('<section class="step' + (bonus ? ' is-bonus' : '') + '"><div class="step-side"></div><div class="step-main"></div></section>');
      var side = wrap.querySelector('.step-side'), main = wrap.querySelector('.step-main');
      function setScene(node) {
        side.innerHTML = '';
        side.appendChild(node);
        wrap.classList.add('duo');
        document.body.classList.add('wide');
      }
      if (scene) setScene(scene.el); else { wrap.classList.remove('duo'); document.body.classList.remove('wide'); }
      if (st.map) wrap.classList.add('map-step');
      if (bonus) main.appendChild(h('<p class="bonus-k">' + ico('target') + ' Défi bonus · ' + (i + 1) + ' / ' + nSteps + '</p>'));
      main.appendChild(h('<h2 class="q" tabindex="-1">' + st.q + '</h2>'));
      var ctx = {
        scene: scene,
        setScene: setScene,
        mark: function (notion, ok) {
          total++; stepT++;
          if (ok) {
            earned++; stepE++;
            var sc = mid.querySelector('.m-score');
            if (sc) { sc.querySelector('b').textContent = earned; sc.classList.remove('bump'); void sc.offsetWidth; sc.classList.add('bump'); }
          } else missed[notion] = true;
        },
        finish: function (ok, html) { showBar(ok, html); }
      };
      main.appendChild(RX.act[st.type](st, ctx));
      body.appendChild(wrap);
      window.scrollTo(0, 0);
    }

    function showBar(ok, html) {
      var kind, title;
      if (ok === true) { kind = 'ok'; title = RX.pick(['Exact !', 'Bien joué !', 'Bien vu !', 'Parfait !']); }
      else if (ok === false) { kind = 'ko'; title = 'Pas tout à fait…'; }
      else {
        kind = stepE === stepT ? 'ok' : stepE >= stepT / 2 ? 'mid' : 'ko';
        title = stepE === stepT ? 'Sans faute !' : stepE + ' / ' + stepT + ' du premier coup';
      }
      var last = cur === nSteps - 1;
      bar.className = 'm-bar ' + kind;
      bar.innerHTML = RX.typo('<div class="bar-in"><p class="bar-t">' + ico(kind === 'ko' ? 'x' : 'check') + '<span>' + title + '</span></p>' +
        (html ? '<p class="bar-x">' + html + '</p>' : '') +
        '<button class="btn big" type="button">' + (last ? (bonus ? 'Terminer le défi' : 'Terminer la partie') : 'Continuer') + ' ' + ico('next') + '</button></div>');
      bar.hidden = false;
      var btn = bar.querySelector('button');
      btn.addEventListener('click', function () { if (last) outro(); else step(cur + 1); });
      setTimeout(function () {
        btn.focus({ preventScroll: true });
        var b = bar.getBoundingClientRect();
        if (b.bottom > window.innerHeight + 4) bar.scrollIntoView({ block: 'end', behavior: RX.reduced ? 'auto' : 'smooth' });
      }, 60);
    }

    /* --- Fin de partie --- */
    function outro() {
      dropKey();
      stopScene();
      bar.hidden = true;
      document.body.classList.remove('wide');
      var stars = RX.starsFor(earned, total);
      var missedKeys = Object.keys(missed);
      if (bonus) {
        var pb = state.bonus[p.id];
        if (!pb || earned >= pb.e) state.bonus[p.id] = { e: earned, t: total };
        RX.store.save(state);
        headerPlain('Défi bonus terminé');
        body.innerHTML = '';
        var nb = h('<div class="outro">' +
          '<div class="stamp bonus-stamp"><span class="stamp-k">Défi bonus</span>' + ico('target', 'stamp-ico') + '<span class="stamp-t">Relevé</span></div>' +
          '<p class="outro-score"><b>' + earned + '</b> / ' + total + ' <span>du premier coup</span></p>' +
          '<div class="outro-actions">' + nextLinks() + '</div></div>');
        bindReplay(nb);
        body.appendChild(nb);
        window.scrollTo(0, 0);
        return;
      }
      var prev = res(p), isBest = !prev || earned >= prev.e;
      if (isBest) state.res[p.id] = { e: earned, t: total, stars: stars, missed: missedKeys, n: (prev ? prev.n : 0) + 1 };
      else prev.n++;
      RX.store.save(state);
      headerPlain('Partie ' + (idx + 1) + ' terminée');
      var keys = p.memo.concat(missedKeys.filter(function (k) { return p.memo.indexOf(k) < 0 && NOT[k]; }));
      body.innerHTML = '';
      var node = h('<div class="outro">' +
        '<div class="stamp s' + stars + '"><span class="stamp-k">Partie ' + (idx + 1) + '</span>' + RX.starsHtml(stars) + '<span class="stamp-t">Validée</span></div>' +
        '<p class="outro-score"><b>' + earned + '</b> / ' + total + ' <span>du premier coup</span></p>' +
        (isBest ? '' : '<p class="note">Ton meilleur score reste ' + prev.e + ' / ' + prev.t + '.</p>') +
        '<div class="memo-card"><h2>À retenir</h2>' + memoHtml(keys, missed) + '</div>' +
        (p.bonus.length ? '<div class="wait-card">' + ico('target') + '<div><p class="wait-t">En avance sur la classe ?</p><p>Relève le défi bonus en attendant la suite.</p>' +
          '<button class="btn small" type="button" data-act="bonus">' + ico('target') + ' Défi bonus</button></div></div>' : '') +
        '<div class="outro-actions">' + nextLinks() + '</div></div>');
      var bb = node.querySelector('[data-act="bonus"]');
      if (bb) bb.addEventListener('click', function () { partie(p, { bonus: true }); });
      bindReplay(node);
      body.appendChild(node);
      window.scrollTo(0, 0);
      if (stars === 3) setTimeout(function () { RX.fx.confetti(70); }, 500);
    }

    function nextLinks() {
      var nextP = P[idx + 1], allDone = doneCount() === P.length;
      return (allDone || !nextP
        ? '<a class="btn primary big" href="#/bilan">Voir mon bilan ' + ico('next') + '</a>'
        : '<a class="btn primary big" href="#/p/' + nextP.id + '">Partie suivante : ' + nextP.titre + ' ' + ico('next') + '</a>' +
          '<p class="note center">Attends le signal du prof : la partie suivante commence par une explication.</p>') +
        '<div class="row"><button class="btn ghost" type="button" data-act="replay">' + ico('replay') + ' Rejouer</button>' +
        '<a class="btn ghost" href="#/parcours">' + ico('map') + ' Parcours</a></div>';
    }
    function bindReplay(node) {
      var r = node.querySelector('[data-act="replay"]');
      if (r) r.addEventListener('click', function () { partie(p, { bonus: bonus, direct: true }); });
    }

    show(el, 'partie');
    cleanups.push(stopScene);
    cleanups.push(dropKey);
    if (opts.direct || bonus) step(0); else intro();
  }

  /* ================= BILAN ================= */
  function totals() {
    var e = 0, t = 0;
    P.forEach(function (p) { if (res(p)) { e += res(p).e; t += res(p).t; } });
    return { e: e, t: t, pct: t ? Math.round((e / t) * 100) : 0 };
  }

  function bilan() {
    var stars = totalStars(), done = doneCount(), tt = totals(), revoir = missedAll();
    var missedSet = {};
    revoir.forEach(function (k) { missedSet[k] = 1; });
    var el = h('<section class="bilan">' +
      '<header class="top"><a class="icon-btn" href="#/parcours" aria-label="Retour au parcours">' + ico('back') + '</a>' +
      '<div class="top-stars">' + ico('star', 'star') + '<b>' + stars + '</b> / ' + (P.length * 3) + '</div></header>' +
      '<div class="ticket">' +
        '<div class="lc-row"><span>Bordereau de livraison</span><span>' + esc(RX.SITE.cours) + '</span></div>' +
        '<label class="tk-nom"><span>Prénom</span><input type="text" maxlength="30" placeholder="Ton prénom" value="' + esc(state.nom) + '" aria-label="Ton prénom"></label>' +
        '<p class="tk-rang">' + (done ? rang(stars) : 'Aucune partie terminée pour l’instant') + '</p>' +
        '<div class="tk-big"><div><b>' + stars + '</b><span>étoiles sur ' + (P.length * 3) + '</span></div>' +
        '<div><b>' + done + '</b><span>parties sur ' + P.length + '</span></div>' +
        '<div><b>' + tt.pct + ' %</b><span>du premier coup</span></div></div>' +
        '<ul class="tk-list">' + P.map(function (p, i) {
          var r = res(p);
          return '<li style="--c:' + p.c + '"><a href="#/p/' + p.id + '"><span class="tk-n">' + (i + 1) + '</span><span class="tk-t">' + p.titre + '</span>' +
            (r ? RX.starsHtml(r.stars) + '<span class="tk-s">' + r.e + '/' + r.t + '</span>' : '<span class="tk-todo">à faire</span>') + '</a></li>';
        }).join('') + '</ul>' +
        '<div class="barcode" aria-hidden="true"></div>' +
      '</div>' +
      (revoir.length
        ? '<div class="revoir-card"><h2>À revoir en priorité</h2><ul>' + revoir.map(function (k) { return '<li>' + NOT[k].t + '</li>'; }).join('') + '</ul></div>'
        : done === P.length ? '<div class="revoir-card bravo"><h2>Rien à revoir !</h2><p>Tout est juste du premier coup. Chapeau.</p></div>' : '') +
      '<button class="btn primary big" type="button" data-act="print">' + ico('print') + ' Imprimer ma fiche TCP/IP</button>' +
      '<p class="note">Pas d’imprimante ? Choisis « Enregistrer au format PDF » dans la fenêtre d’impression.</p>' +
      '<details class="memo-all" open><summary>Tout ce qu’il faut retenir</summary>' +
        P.map(function (p, i) {
          return '<section class="memo-g" style="--c:' + p.c + '"><h3><span>' + (i + 1) + '</span>' + p.titre + '</h3>' + memoHtml(p.memo, missedSet) + '</section>';
        }).join('') + '</details>' +
      '<div class="bilan-qr">' + RX.qrSvg(RX.siteUrl()) + '<div><p>Pour revenir plus tard</p><p class="mono-url">' + prettyUrlHtml() + '</p></div></div>' +
      '<button class="link-btn danger" type="button" data-act="reset">Effacer ma progression et tout recommencer</button>' +
      '</section>');
    el.querySelector('.tk-nom input').addEventListener('input', function (e) {
      state.nom = e.target.value.trim().slice(0, 30);
      RX.store.save(state);
    });
    el.querySelector('[data-act="print"]').addEventListener('click', function () { buildPrint(); window.print(); });
    el.querySelector('[data-act="reset"]').addEventListener('click', function () {
      var d = modal('<h2>Tout effacer ?</h2><p>Tes étoiles et tes scores seront supprimés de cet appareil.</p>' +
        '<div class="row"><button class="btn" type="button" data-close>Annuler</button><button class="btn primary" type="button" data-yes>Effacer</button></div>');
      d.querySelector('[data-yes]').addEventListener('click', function () {
        RX.store.clear();
        state = RX.store.load();
        lastPos = null;
        celebrated = false;
        d.close();
        location.hash = '#/';
      });
    });
    show(el, 'bilan');
    if (done === P.length && !celebrated) { celebrated = true; setTimeout(function () { RX.fx.confetti(140); }, 400); }
  }

  /* ================= MODE PROJECTION (pour le prof) ================= */
  function projMenu() {
    var el = h('<section class="proj-menu">' +
      '<header class="top"><a class="brand" href="#/" aria-label="Retour à l’accueil"><span>Paquet</span><span>Express</span></a>' +
      '<button class="btn ghost small" type="button" data-act="full">' + ico('full') + ' Plein écran</button></header>' +
      '<p class="kicker">Mode projection</p><h1 class="hub-title">Les points prof, en grand</h1>' +
      '<p class="hub-sub">Les cartes d’explication de chaque partie, en plein écran. Flèches du clavier ou clic pour avancer, Échap pour revenir ici.</p>' +
      '<div class="proj-grid">' +
        '<a class="proj-card join" href="#" data-act="qr"><span class="pc-n">' + ico('qr') + '</span><span><b>Faire venir les élèves</b><small>QR code et adresse du site</small></span></a>' +
        '<a class="proj-card" href="#/projection/carte" style="--c:#FF5A36"><span class="pc-n">' + ico('map') + '</span><span><b>La carte du voyage</b><small>Zones, propriétaires, adresses, trajet</small></span></a>' +
        P.map(function (p, i) {
          return '<a class="proj-card" href="#/projection/' + p.id + '" style="--c:' + p.c + '"><span class="pc-n">' + (i + 1) + '</span><span><b>' + p.titre + '</b><small>' + p.slides.length + (p.slides.length > 1 ? ' cartes · ' : ' carte · ') + p.prof + ' min · ' + p.sous + '</small></span></a>';
        }).join('') +
      '</div></section>');
    el.querySelector('[data-act="qr"]').addEventListener('click', function (e) { e.preventDefault(); qrModal(); });
    el.querySelector('[data-act="full"]').addEventListener('click', toggleFull);
    show(el, 'proj-menu', true);
  }

  function toggleFull() {
    var d = document;
    if (d.fullscreenElement) { if (d.exitFullscreen) d.exitFullscreen(); }
    else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(function () { /* refusé */ });
  }

  function projDeck(p, start) {
    var idx = P.indexOf(p), i = Math.max(0, Math.min(start || 0, p.slides.length - 1)), sceneCtl = null;
    var el = h('<section class="proj" style="--c:' + p.c + ';--ct:' + p.ct + '">' +
      '<header class="proj-top"><a class="icon-btn" href="#/projection" aria-label="Retour au menu de projection">' + ico('x') + '</a>' +
      '<p class="proj-title"><span>Partie ' + (idx + 1) + '</span>' + p.titre + '</p>' +
      '<p class="proj-count"></p>' +
      '<button class="icon-btn" type="button" data-act="full" aria-label="Plein écran">' + ico('full') + '</button></header>' +
      '<div class="proj-stage"></div>' +
      '<nav class="proj-nav"><button class="icon-btn" type="button" data-d="-1" aria-label="Carte précédente">' + ico('back') + '</button>' +
      '<span class="dots"></span>' +
      '<button class="icon-btn" type="button" data-d="1" aria-label="Carte suivante">' + ico('next') + '</button></nav></section>');
    var stage = el.querySelector('.proj-stage'), count = el.querySelector('.proj-count'), dots = el.querySelector('.dots');
    function render() {
      if (sceneCtl && sceneCtl.destroy) sceneCtl.destroy();
      stage.innerHTML = '';
      var built = slideEl(p.slides[i], p, { proj: true });
      sceneCtl = built.scene;
      stage.appendChild(built.el);
      count.textContent = (i + 1) + ' / ' + p.slides.length;
      dots.innerHTML = p.slides.map(function (x, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('');
      el.querySelector('[data-d="-1"]').disabled = i === 0;
      var nb = el.querySelector('[data-d="1"]');
      nb.disabled = false;
      nb.setAttribute('aria-label', i === p.slides.length - 1 ? 'Retour au menu' : 'Carte suivante');
    }
    function go(d) {
      if (i + d < 0) return;
      if (i + d >= p.slides.length) { location.hash = '#/projection'; return; }
      i += d; render();
    }
    el.querySelector('.proj-nav').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-d]');
      if (b && !b.disabled) go(Number(b.getAttribute('data-d')));
    });
    el.querySelector('[data-act="full"]').addEventListener('click', toggleFull);
    show(el, 'proj', true);
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'Escape' && !document.fullscreenElement) location.hash = '#/projection';
      else if (e.key === 'f' || e.key === 'F') toggleFull();
    }
    document.addEventListener('keydown', onKey);
    cleanups.push(function () { document.removeEventListener('keydown', onKey); if (sceneCtl && sceneCtl.destroy) sceneCtl.destroy(); });
    render();
  }

  function projMap() {
    var m = RX.map.make({ state: { zones: 'named', dns: true }, legend: true });
    var opts = [
      ['zones', 'Noms des zones', true], ['owners', 'Propriétaires', false], ['ips', 'Adresses IP', false], ['pub', 'Adresse publique du routeur', false]
    ];
    var el = h('<section class="proj proj-map" style="--c:#FF5A36;--ct:#FFE3DC">' +
      '<header class="proj-top"><a class="icon-btn" href="#/projection" aria-label="Retour au menu de projection">' + ico('x') + '</a>' +
      '<p class="proj-title"><span>Carte</span>Le voyage d’un paquet</p><p class="proj-count"></p>' +
      '<button class="icon-btn" type="button" data-act="full" aria-label="Plein écran">' + ico('full') + '</button></header>' +
      '<div class="proj-stage"></div>' +
      '<div class="proj-tools">' + opts.map(function (o) {
        return '<button class="tog' + (o[2] ? ' on' : '') + '" type="button" aria-pressed="' + o[2] + '" data-k="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '<button class="tog act" type="button" data-act="trip">' + ico('next') + ' Faire voyager Bip</button></div></section>');
    el.querySelector('.proj-stage').appendChild(m.el);
    el.querySelectorAll('.tog[data-k]').forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on); b.classList.toggle('on', on);
        var patch = {};
        var k = b.getAttribute('data-k');
        if (k === 'zones') patch.zones = on ? 'named' : 'hidden'; else patch[k] = on;
        m.set(patch);
      });
    });
    var busy = false;
    el.querySelector('[data-act="trip"]').addEventListener('click', function () {
      if (busy) return;
      busy = true;
      m.set({ bip: null, lit: [], hl: [] });
      m.set({ bip: 'pc', flag: 'web' });
      var seq = ['ap', 'sw', 'rg', 'rf', 'A', 'B', 'rh', 'web'], prev = 'pc', lit = [];
      m.go(seq, { pause: 120, onStep: function (id) { lit.push([prev, id]); prev = id; m.set({ lit: lit.slice(), hl: [id] }); } }, function () { busy = false; });
    });
    el.querySelector('[data-act="full"]').addEventListener('click', toggleFull);
    show(el, 'proj', true);
    function onKey(e) { if (e.key === 'Escape' && !document.fullscreenElement) location.hash = '#/projection'; }
    document.addEventListener('keydown', onKey);
    cleanups.push(function () { document.removeEventListener('keydown', onKey); m.destroy(); });
  }

  /* ================= FICHE IMPRIMABLE ================= */
  function plainStars(n) { return '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n); }

  function buildPrint() {
    var stars = totalStars(), done = doneCount(), tt = totals(), revoir = missedAll();
    var missedSet = {};
    revoir.forEach(function (k) { missedSet[k] = 1; });
    var url = RX.siteUrl();
    var date = new Date().toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' });
    var S = RX.SITE;
    var sheet = document.getElementById('print-sheet');
    sheet.innerHTML = RX.typo(
      '<article class="ps">' +
      '<header class="ps-head"><div class="ps-id">' +
        '<p class="ps-k">' + esc(S.classe) + ' · ' + esc(S.ecole) + '</p>' +
        '<h1>TCP/IP</h1><p class="ps-sub">' + esc(S.sousTitre) + ' · ma fiche · ' + esc(S.titre) + '</p>' +
        '<dl class="ps-meta"><div><dt>Prénom</dt><dd>' + (state.nom ? esc(state.nom) : '<span class="ps-blank"></span>') + '</dd></div>' +
        '<div><dt>Date</dt><dd>' + date + '</dd></div>' +
        '<div><dt>Résultat</dt><dd>' + (done ? stars + ' étoiles sur ' + (P.length * 3) + ' · ' + tt.e + ' / ' + tt.t + ' du premier coup' : 'aucune partie terminée') + '</dd></div>' +
        (revoir.length ? '<div><dt>À revoir</dt><dd>' + revoir.map(function (k) { return NOT[k].t; }).join(' · ') + '</dd></div>' : '') +
        '</dl>' +
      '</div><div class="ps-qr">' + RX.qrSvg(url) + '<p>Pour revenir au cours, scanne ce code ou va sur</p><p class="ps-url">' + prettyUrlHtml() + '</p></div></header>' +
      '<section class="ps-map"><h2>La carte du voyage</h2><div class="ps-map-in"></div>' +
        '<p class="ps-cap">Adresses fictives du cours. Le routeur du gymnase a deux adresses : <b>192.168.10.1</b> (privée, côté LAN) et <b>198.51.100.7</b> (publique, côté Internet, fournie par le FAI).</p></section>' +
      '<section class="ps-two"><div><h2>Les 4 couches</h2><table class="ps-ly"><thead><tr><th>Couche</th><th>Protocoles</th><th>Rôle</th></tr></thead><tbody>' +
        RX.COUCHES.map(function (c) { return '<tr><td><b>' + c.nom + '</b></td><td>' + c.proto + '</td><td>' + c.d + '</td></tr>'; }).join('') +
        '</tbody></table></div>' +
        '<div><h2>L’encapsulation</h2>' + RX.fullPacket({ cls: 'pk-print' }) + '</div></section>' +
      '<section class="ps-memo"><h2>L’essentiel à retenir</h2><div class="ps-cols">' +
      P.map(function (p, i) {
        return '<div class="ps-g"><h3>' + (i + 1) + ' · ' + p.titre + '</h3>' + p.memo.map(function (k) {
          var rv = missedSet[k];
          return '<p class="' + (rv ? 'rv' : '') + '"><b>' + NOT[k].t + (rv ? ' <span class="ps-tag">à revoir</span>' : '') + '</b> ' + NOT[k].d + '</p>';
        }).join('') + '</div>';
      }).join('') + '</div></section>' +
      '<section class="ps-res"><h2>Mes parties</h2><table><thead><tr><th>N°</th><th>Partie</th><th>Notions</th><th>Étoiles</th><th>Score</th></tr></thead><tbody>' +
      P.map(function (p, i) {
        var r = res(p);
        return '<tr><td>' + (i + 1) + '</td><td><b>' + p.titre + '</b></td><td>' + p.sous + '</td>' +
          (r ? '<td class="ps-st">' + plainStars(r.stars) + '</td><td>' + r.e + ' / ' + r.t + '</td>' : '<td colspan="2" class="ps-todo">à faire</td>') + '</tr>';
      }).join('') + '</tbody></table></section>' +
      '<footer class="ps-foot"><span>' + esc(S.titre) + ' · ' + esc(S.cours) + '</span><span>' + esc(prettyUrl()) + '</span></footer>' +
      '</article>');
    var m = RX.map.make({ state: 'all', layout: 'w', legend: true });
    sheet.querySelector('.ps-map-in').appendChild(m.el);
  }
  window.addEventListener('beforeprint', buildPrint);

  /* ================= NAVIGATION ================= */
  function route() {
    var path = location.hash.replace(/^#\/?/, '');
    if (path === 'parcours') return hub();
    if (path === 'bilan') return bilan();
    if (path === 'projection') return projMenu();
    if (path === 'projection/carte') return projMap();
    var pr = path.match(/^projection\/([a-z]+)(?:\/(\d+))?$/);
    if (pr) {
      var pp = P.filter(function (x) { return x.id === pr[1]; })[0];
      if (pp) return projDeck(pp, pr[2] ? Number(pr[2]) - 1 : 0);
    }
    var mm = path.match(/^p\/([a-z]+)(\/bonus)?$/);
    if (mm) {
      var found = P.filter(function (x) { return x.id === mm[1]; })[0];
      if (found) return partie(found, { bonus: !!mm[2] });
    }
    home();
  }
  window.addEventListener('hashchange', route);

  RX.fx.background(document.getElementById('bg'));
  route();
})();
