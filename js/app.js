/* Requête Express — écrans (accueil, carte, mission, bilan) et synthèse imprimable */
(function () {
  'use strict';
  var RX = window.RX, h = RX.h, ico = RX.ico, esc = RX.esc;
  var M = RX.MISSIONS, N = RX.NOTIONS;
  var app = document.getElementById('app');
  var state = RX.store.load();
  var lastPos = null;          // dernière position de Bip sur la carte
  var celebrated = false;      // les confettis du bilan ne partent qu'une fois
  var cleanups = [];           // à exécuter en quittant un écran

  /* ---------- Calculs sur la progression ---------- */
  function res(m) { return state.res[m.id]; }
  function totalStars() { return M.reduce(function (s, m) { return s + (res(m) ? res(m).stars : 0); }, 0); }
  function doneCount() { return M.filter(res).length; }
  function nextIndex() { for (var i = 0; i < M.length; i++) if (!res(M[i])) return i; return M.length; }
  function rang(stars) {
    var r = RX.RANGS[0];
    RX.RANGS.forEach(function (x) { if (stars >= x.min) r = x; });
    return r.t;
  }
  function missedAll() {
    var seen = {}, out = [];
    M.forEach(function (m) {
      (res(m) ? res(m).missed : []).forEach(function (k) { if (!seen[k] && N[k]) { seen[k] = 1; out.push(k); } });
    });
    return out;
  }
  function countItems(m) {
    return m.steps.reduce(function (n, s) {
      if (s.type === 'pick') return n + s.options.filter(function (o) { return o.ok; }).length;
      if (s.type === 'sort') return n + s.cards.length;
      if (s.type === 'match') return n + s.pairs.length;
      if (s.type === 'order') return n + s.steps.length;
      if (s.type === 'label') return n + s.targets.length;
      return n + 1;
    }, 0);
  }

  function show(el, name) {
    cleanups.forEach(function (f) { f(); });
    cleanups = [];
    app.innerHTML = '';
    app.appendChild(el);
    document.body.setAttribute('data-screen', name);
    window.scrollTo(0, 0);
  }

  function modal(html) {
    var d = h('<dialog class="modal"><div class="modal-in">' + html + '</div></dialog>');
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
    modal('<h2>Scanne pour jouer</h2>' + RX.qrSvg(RX.siteUrl(), 'big') +
      '<p class="mono-url">' + prettyUrlHtml() + '</p>' +
      '<button class="btn" type="button" data-close>Fermer</button>');
  }

  /* ================= ACCUEIL ================= */
  var ROUTE = 'M36 104C60 104 84 60 108 60S156 104 180 104S228 60 252 60S300 104 324 104';
  function heroSvg() {
    var stops = [['phone', 'Toi', 36, 104], ['box', 'Box', 108, 60], ['antenna', 'FAI', 180, 104], ['globe', 'Internet', 252, 60], ['server', 'Serveur', 324, 104]];
    return '<svg class="hero" viewBox="0 0 360 160" role="img" aria-label="Le trajet de Bip : toi, la box, le FAI, Internet, puis le serveur">' +
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
    var el = h('<section class="home">' +
      '<p class="kicker">' + esc(RX.SITE.classe) + ' · Révision</p>' +
      '<h1 class="logo"><span class="l1">Requête</span><span class="l2">Express</span></h1>' +
      '<p class="tagline">Internet &amp; Web : 7 missions pour tout réviser</p>' +
      heroSvg() +
      '<p class="lead">Accompagne <b>Bip</b>, un petit paquet de données, de ton téléphone jusqu’au serveur Web… et retour.</p>' +
      '<form class="label-card start" novalidate>' +
        '<div class="lc-row"><span>Expéditeur</span><span>7 étapes · env. 20 min</span></div>' +
        '<label for="nom">Ton prénom</label>' +
        '<input id="nom" name="nom" type="text" maxlength="30" autocomplete="given-name" autocapitalize="words" placeholder="Pour ta synthèse imprimable" value="' + esc(state.nom) + '">' +
        '<button class="btn primary big" type="submit">' + (started ? 'Reprendre' : 'C’est parti') + ' ' + ico('next') + '</button>' +
        (started ? '<p class="lc-prog">' + ico('star', 'star') + ' ' + totalStars() + ' / ' + (M.length * 3) + ' · ' + doneCount() + ' mission' + (doneCount() > 1 ? 's' : '') + ' sur ' + M.length + '</p>' : '') +
        '<div class="barcode" aria-hidden="true"></div>' +
      '</form>' +
      '<div class="home-foot">' +
        '<button class="link-btn" type="button" data-act="qr">' + ico('qr') + ' Afficher le QR code du site</button>' +
        '<p class="note">Ta progression reste enregistrée sur cet appareil, nulle part ailleurs.</p>' +
      '</div></section>');
    el.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      state.nom = el.querySelector('#nom').value.trim().slice(0, 30);
      RX.store.save(state);
      location.hash = '#/carte';
    });
    el.querySelector('[data-act="qr"]').addEventListener('click', qrModal);
    show(el, 'home');
  }

  /* ================= CARTE DES MISSIONS ================= */
  function hub() {
    var nxt = nextIndex(), all = nxt === M.length;
    var stations = M.map(function (m, i) {
      var r = res(m);
      return '<li class="station' + (r ? ' is-done' : '') + (i === nxt ? ' is-next' : '') + '" style="--c:' + m.c + '">' +
        '<a class="st-btn" href="#/m/' + m.id + '">' +
          '<span class="st-node">' + ico(m.icone) + (r ? '<span class="st-check">' + ico('check') + '</span>' : '') + '</span>' +
          '<span class="st-info"><span class="st-k">Mission ' + (i + 1) + ' · ' + m.lieu + '</span>' +
          '<span class="st-t">' + m.titre + '</span><span class="st-s">' + m.sous + '</span>' +
          (r ? RX.starsHtml(r.stars) + '<span class="st-sc">' + r.e + ' / ' + r.t + '</span>' : '<span class="st-go">' + (i === nxt ? 'Jouer' : 'À faire') + '</span>') +
          '</span></a></li>';
    }).join('');
    var el = h('<section class="hub">' +
      '<header class="top"><a class="brand" href="#/" aria-label="Retour à l’accueil"><span>Requête</span><span>Express</span></a>' +
      '<div class="top-stars" aria-label="' + totalStars() + ' étoiles sur ' + (M.length * 3) + '">' + ico('star', 'star') + '<b>' + totalStars() + '</b> / ' + (M.length * 3) + '</div></header>' +
      '<h1 class="hub-title">' + (state.nom ? esc(state.nom) + ', voici ta feuille de route' : 'Ta feuille de route') + '</h1>' +
      '<p class="hub-sub">' + (all ? 'Toutes les missions sont livrées. Rejoue-les pour décrocher les étoiles manquantes, ou imprime ta synthèse.' : 'Chaque mission est une étape du trajet. Tu peux les faire dans l’ordre… ou pas.') + '</p>' +
      '<div class="route"><svg class="route-svg" aria-hidden="true"><path class="r-bg"/><path class="r-done"/></svg>' +
      '<ol class="stations">' + stations +
        '<li class="station finish' + (all ? ' is-next' : '') + '" style="--c:#FF5A36"><a class="st-btn" href="#/bilan">' +
        '<span class="st-node">' + ico('flag') + '</span>' +
        '<span class="st-info"><span class="st-k">Arrivée</span><span class="st-t">Bilan &amp; synthèse</span>' +
        '<span class="st-s">Imprime ta synthèse pour réviser à la maison</span></span></a></li>' +
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

  /* ================= UNE MISSION ================= */
  function mission(m) {
    var idx = M.indexOf(m), nSteps = m.steps.length;
    var cur = -1, earned = 0, total = 0, missed = {}, stepE = 0, stepT = 0;
    var el = h('<section class="mission" style="--c:' + m.c + ';--ct:' + m.ct + '">' +
      '<header class="m-top"><a class="icon-btn" href="#/carte" aria-label="Quitter la mission et revenir à la carte">' + ico('x') + '</a>' +
      '<div class="m-prog" role="progressbar" aria-label="Progression dans la mission" aria-valuemin="0" aria-valuemax="' + nSteps + '" aria-valuenow="0">' +
      m.steps.map(function () { return '<i></i>'; }).join('') + '</div>' +
      '<div class="m-score" aria-label="Bonnes réponses du premier coup">' + ico('check') + '<b>0</b></div></header>' +
      '<div class="m-body"></div><div class="m-bar" hidden></div></section>');
    var body = el.querySelector('.m-body'), bar = el.querySelector('.m-bar');
    var prog = el.querySelector('.m-prog'), score = el.querySelector('.m-score b');

    function setProg(n) {
      prog.setAttribute('aria-valuenow', Math.max(0, n));
      Array.prototype.forEach.call(prog.children, function (s, i) {
        s.className = i < n ? 'on' : i === n ? 'cur' : '';
      });
    }

    function intro() {
      setProg(-1);
      body.innerHTML = '';
      var node = h('<div class="intro">' +
        '<p class="kicker">Mission ' + (idx + 1) + ' / ' + M.length + ' · ' + m.lieu + '</p>' +
        '<div class="intro-ico">' + ico(m.icone) + '</div>' +
        '<h1>' + m.titre + '</h1>' +
        '<div class="bubble"><span class="bubble-bip">' + ico('bip') + '</span><p>' + m.intro + '</p></div>' +
        '<button class="btn primary big" type="button">Démarrer ' + ico('next') + '</button>' +
        '<p class="note">' + countItems(m) + ' réponses à donner · vise les 3 étoiles</p></div>');
      node.querySelector('button').addEventListener('click', function () { step(0); });
      body.appendChild(node);
    }

    function step(i) {
      cur = i; stepE = 0; stepT = 0;
      setProg(i);
      bar.hidden = true;
      bar.innerHTML = '';
      body.innerHTML = '';
      var st = m.steps[i];
      var wrap = h('<section class="step"></section>');
      var scene = st.scene ? RX.scenes.make(st.scene) : null;
      if (scene) wrap.appendChild(scene.el);
      wrap.appendChild(h('<h2 class="q">' + st.q + '</h2>'));
      var ctx = {
        scene: scene,
        mark: function (notion, ok) {
          total++; stepT++;
          if (ok) { earned++; stepE++; score.textContent = earned; score.parentNode.classList.remove('bump'); void score.offsetWidth; score.parentNode.classList.add('bump'); }
          else missed[notion] = true;
        },
        finish: function (ok, html) { showBar(ok, html); }
      };
      wrap.appendChild(RX.act[st.type](st, ctx));
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
        '<button class="btn big" type="button">' + (last ? 'Terminer la mission' : 'Continuer') + ' ' + ico('next') + '</button></div>');
      bar.hidden = false;
      var btn = bar.querySelector('button');
      btn.addEventListener('click', function () { if (last) outro(); else step(cur + 1); });
      setTimeout(function () {
        btn.focus({ preventScroll: true });
        var b = bar.getBoundingClientRect();
        if (b.bottom > window.innerHeight + 4) bar.scrollIntoView({ block: 'end', behavior: RX.reduced ? 'auto' : 'smooth' });
      }, 60);
    }

    function outro() {
      setProg(nSteps);
      bar.hidden = true;
      var stars = RX.starsFor(earned, total);
      var prev = res(m), isBest = !prev || earned >= prev.e;
      var missedKeys = Object.keys(missed);
      if (isBest) state.res[m.id] = { e: earned, t: total, stars: stars, missed: missedKeys, n: (prev ? prev.n : 0) + 1 };
      else prev.n++;
      RX.store.save(state);

      var keys = m.memo.concat(missedKeys.filter(function (k) { return m.memo.indexOf(k) < 0 && N[k]; }));
      var nextM = M[idx + 1], allDone = doneCount() === M.length;
      body.innerHTML = '';
      var node = h('<div class="outro">' +
        '<div class="stamp s' + stars + '"><span class="stamp-k">Mission ' + (idx + 1) + '</span>' + RX.starsHtml(stars) + '<span class="stamp-t">Livrée</span></div>' +
        '<p class="outro-score"><b>' + earned + '</b> / ' + total + ' <span>du premier coup</span></p>' +
        (isBest ? '' : '<p class="note">Ton meilleur score reste ' + prev.e + ' / ' + prev.t + '.</p>') +
        '<div class="memo-card"><h2>À retenir</h2><dl>' + keys.map(function (k) {
          return '<div class="' + (missed[k] ? 'revoir' : '') + '"><dt>' + N[k].t + (missed[k] ? ' <span class="tag-revoir">à revoir</span>' : '') + '</dt><dd>' + N[k].d + '</dd></div>';
        }).join('') + '</dl></div>' +
        '<div class="outro-actions">' +
          (allDone || !nextM
            ? '<a class="btn primary big" href="#/bilan">Voir mon bilan ' + ico('next') + '</a>'
            : '<a class="btn primary big" href="#/m/' + nextM.id + '">Mission suivante ' + ico('next') + '</a>') +
          '<div class="row"><button class="btn ghost" type="button" data-act="replay">' + ico('replay') + ' Rejouer</button>' +
          '<a class="btn ghost" href="#/carte">' + ico('map') + ' Carte</a></div>' +
        '</div></div>');
      node.querySelector('[data-act="replay"]').addEventListener('click', function () { mission(m); });
      body.appendChild(node);
      window.scrollTo(0, 0);
      if (stars === 3) setTimeout(function () { RX.fx.confetti(70); }, 500);
    }

    show(el, 'mission');
    intro();
  }

  /* ================= BILAN ================= */
  function memoHtml(missedSet) {
    return M.map(function (m, i) {
      return '<section class="memo-g" style="--c:' + m.c + '"><h3><span>' + (i + 1) + '</span>' + m.titre + '</h3><dl>' +
        m.memo.map(function (k) {
          var rv = missedSet[k];
          return '<div class="' + (rv ? 'revoir' : '') + '"><dt>' + N[k].t + (rv ? ' <span class="tag-revoir">à revoir</span>' : '') + '</dt><dd>' + N[k].d + '</dd></div>';
        }).join('') + '</dl></section>';
    }).join('');
  }

  function totals() {
    var e = 0, t = 0;
    M.forEach(function (m) { if (res(m)) { e += res(m).e; t += res(m).t; } });
    return { e: e, t: t, pct: t ? Math.round((e / t) * 100) : 0 };
  }

  function bilan() {
    var stars = totalStars(), done = doneCount(), tt = totals(), revoir = missedAll();
    var missedSet = {};
    revoir.forEach(function (k) { missedSet[k] = 1; });
    var el = h('<section class="bilan">' +
      '<header class="top"><a class="icon-btn" href="#/carte" aria-label="Retour à la carte">' + ico('back') + '</a>' +
      '<div class="top-stars">' + ico('star', 'star') + '<b>' + stars + '</b> / ' + (M.length * 3) + '</div></header>' +
      '<div class="ticket">' +
        '<div class="lc-row"><span>Bordereau de livraison</span><span>' + esc(RX.SITE.cours) + '</span></div>' +
        '<label class="tk-nom"><span>Prénom</span><input type="text" maxlength="30" placeholder="Ton prénom" value="' + esc(state.nom) + '" aria-label="Ton prénom"></label>' +
        '<p class="tk-rang">' + (done ? rang(stars) : 'Aucune mission livrée pour l’instant') + '</p>' +
        '<div class="tk-big"><div><b>' + stars + '</b><span>étoiles sur ' + (M.length * 3) + '</span></div>' +
        '<div><b>' + done + '</b><span>missions sur ' + M.length + '</span></div>' +
        '<div><b>' + tt.pct + ' %</b><span>du premier coup</span></div></div>' +
        '<ul class="tk-list">' + M.map(function (m, i) {
          var r = res(m);
          return '<li style="--c:' + m.c + '"><a href="#/m/' + m.id + '"><span class="tk-n">' + (i + 1) + '</span><span class="tk-t">' + m.titre + '</span>' +
            (r ? RX.starsHtml(r.stars) + '<span class="tk-s">' + r.e + '/' + r.t + '</span>' : '<span class="tk-todo">à faire</span>') + '</a></li>';
        }).join('') + '</ul>' +
        '<div class="barcode" aria-hidden="true"></div>' +
      '</div>' +
      (revoir.length
        ? '<div class="revoir-card"><h2>À revoir en priorité</h2><ul>' + revoir.map(function (k) { return '<li>' + N[k].t + '</li>'; }).join('') + '</ul></div>'
        : done === M.length ? '<div class="revoir-card bravo"><h2>Rien à revoir !</h2><p>Tout est juste du premier coup. Chapeau.</p></div>' : '') +
      '<button class="btn primary big" type="button" data-act="print">' + ico('print') + ' Imprimer ma synthèse</button>' +
      '<p class="note">Pas d’imprimante ? Choisis « Enregistrer au format PDF » dans la fenêtre d’impression.</p>' +
      '<details class="memo-all"><summary>Relire tout le mémo</summary>' + memoHtml(missedSet) + '</details>' +
      '<div class="bilan-qr">' + RX.qrSvg(RX.siteUrl()) + '<div><p>Pour rejouer plus tard</p><p class="mono-url">' + prettyUrlHtml() + '</p></div></div>' +
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
    if (done === M.length && !celebrated) { celebrated = true; setTimeout(function () { RX.fx.confetti(140); }, 400); }
  }

  /* ================= SYNTHÈSE IMPRIMABLE ================= */
  function plainStars(n) { return '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n); }

  /** Schéma récapitulatif : le trajet d'une requête, du navigateur au serveur. */
  function trajetSvg() {
    var stops = [
      ['laptop', 'Client Web', 'ton navigateur', '(Chrome, Safari, Firefox…)'],
      ['box', 'Box', 'modem-routeur, switch,', 'point d’accès Wi-Fi'],
      ['antenna', 'FAI', 'fournisseur d’accès', 'et son réseau étendu'],
      ['globe', 'Internet', 'WAN public :', 'le réseau de réseaux'],
      ['server', 'Serveur Web', 'stocke et fournit', 'les pages (HTML, CSS)']
    ];
    var xs = [72, 216, 360, 504, 648];
    function tag(x, y, w, t) {
      return '<rect class="pt-bg" x="' + (x - w / 2) + '" y="' + (y - 9) + '" width="' + w + '" height="18"/><text class="pt-lab" x="' + x + '" y="' + (y + 4.500) + '">' + t + '</text>';
    }
    function brace(x1, x2, t) {
      return '<path class="pt-line" d="M' + x1 + ' 168v8H' + x2 + 'v-8"/>' + tag((x1 + x2) / 2, 176, t.length * 7.200 + 18, t);
    }
    return '<svg class="ps-trajet" viewBox="0 0 720 190" role="img" aria-label="Schéma du trajet d’une requête, du client Web au serveur Web">' +
      '<path class="pt-line" d="M72 14H636"/><path class="pt-head" d="M650 14l-15-7v14z"/>' + tag(360, 14, 132, '1 · Requête HTTP') +
      '<path class="pt-line" d="M648 38H84"/><path class="pt-head" d="M70 38l15-7v14z"/>' + tag(360, 38, 104, '2 · Réponse') +
      '<path class="pt-line pt-dash" d="M100 82H188"/><path class="pt-line" d="M244 82H332M388 82H476M532 82H620"/>' +
      stops.map(function (st, i) {
        var x = xs[i];
        return '<use href="#i-' + st[0] + '" x="' + (x - 24) + '" y="58" width="48" height="48"/>' +
          '<text class="pt-name" x="' + x + '" y="126">' + st[1] + '</text>' +
          '<text class="pt-desc" x="' + x + '" y="142">' + st[2] + '</text>' +
          '<text class="pt-desc" x="' + x + '" y="156">' + st[3] + '</text>';
      }).join('') +
      brace(14, 274, 'LAN : réseau local') + brace(302, 562, 'WAN : réseaux étendus') +
      '</svg>';
  }

  function buildPrint() {
    var stars = totalStars(), done = doneCount(), tt = totals(), revoir = missedAll();
    var missedSet = {};
    revoir.forEach(function (k) { missedSet[k] = 1; });
    var url = RX.siteUrl();
    var date = new Date().toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' });
    var S = RX.SITE;
    document.getElementById('print-sheet').innerHTML = RX.typo(
      '<article class="ps">' +
      '<header class="ps-head"><div class="ps-id">' +
        '<p class="ps-k">' + esc(S.classe) + ' · ' + esc(S.ecole) + '</p>' +
        '<h1>' + esc(S.cours) + '</h1><p class="ps-sub">Ma synthèse de révision · ' + esc(S.titre) + '</p>' +
        '<dl class="ps-meta"><div><dt>Prénom</dt><dd>' + (state.nom ? esc(state.nom) : '<span class="ps-blank"></span>') + '</dd></div>' +
        '<div><dt>Date</dt><dd>' + date + '</dd></div>' +
        '<div><dt>Résultat</dt><dd>' + (done ? stars + ' étoiles sur ' + (M.length * 3) + ' · ' + tt.e + ' / ' + tt.t + ' du premier coup' : 'aucune mission terminée') + '</dd></div>' +
        (done ? '<div><dt>Niveau</dt><dd>' + rang(stars) + '</dd></div>' : '') + '</dl>' +
      '</div><div class="ps-qr">' + RX.qrSvg(url) + '<p>Pour rejouer, scanne ce code ou va sur</p><p class="ps-url">' + prettyUrlHtml() + '</p></div></header>' +

      '<section class="ps-res"><h2>Mes missions</h2><table><thead><tr><th>N°</th><th>Mission</th><th>Notions</th><th>Étoiles</th><th>Score</th></tr></thead><tbody>' +
      M.map(function (m, i) {
        var r = res(m);
        return '<tr><td>' + (i + 1) + '</td><td><b>' + m.titre + '</b></td><td>' + m.sous + '</td>' +
          (r ? '<td class="ps-st">' + plainStars(r.stars) + '</td><td>' + r.e + ' / ' + r.t + '</td>' : '<td colspan="2" class="ps-todo">à faire</td>') + '</tr>';
      }).join('') + '</tbody></table></section>' +

      '<section class="ps-rv"><h2>À revoir en priorité</h2>' +
      (revoir.length
        ? '<p>' + revoir.map(function (k) { return '<span>' + N[k].t + '</span>'; }).join('') + '</p>'
        : '<p class="ps-none">' + (done === M.length ? 'Rien à signaler : tout était juste du premier coup.' : done ? 'Aucune erreur jusqu’ici. Termine les missions restantes pour compléter ce bilan.' : 'Joue les missions pour remplir cette partie.') + '</p>') +
      '</section>' +

      '<section class="ps-tj"><h2>Le trajet d’une requête</h2>' + trajetSvg() + '</section>' +

      '<section class="ps-memo"><h2>L’essentiel à retenir</h2><div class="ps-cols">' +
      M.map(function (m, i) {
        return '<div class="ps-g"><h3>' + (i + 1) + ' · ' + m.titre + '</h3>' + m.memo.map(function (k) {
          var rv = missedSet[k];
          return '<p class="' + (rv ? 'rv' : '') + '"><b>' + N[k].t + (rv ? ' <span class="ps-tag">à revoir</span>' : '') + '</b> ' + N[k].d + '</p>';
        }).join('') + '</div>';
      }).join('') + '</div></section>' +
      '<section class="ps-notes"><h2>Mes notes</h2><div class="ps-lines"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></section>' +
      '<footer class="ps-foot"><span>' + esc(S.titre) + ' · ' + esc(S.cours) + '</span><span>' + esc(prettyUrl()) + '</span></footer>' +
      '</article>');
  }
  window.addEventListener('beforeprint', buildPrint);

  /* ================= NAVIGATION ================= */
  function route() {
    var path = location.hash.replace(/^#\/?/, '');
    if (path === 'carte') return hub();
    if (path === 'bilan') return bilan();
    var mm = path.match(/^m\/([a-z0-9]+)$/);
    if (mm) {
      var found = M.filter(function (x) { return x.id === mm[1]; })[0];
      if (found) return mission(found);
    }
    home();
  }
  window.addEventListener('hashchange', route);

  RX.fx.background(document.getElementById('bg'));
  route();
})();
