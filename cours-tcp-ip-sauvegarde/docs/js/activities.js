/* Paquet Express — les activités (exercices).
   Chaque activité reçoit (step, ctx) et renvoie un élément HTML.
     ctx.mark(notion, ok)   compte une réponse (juste du premier coup ou non)
     ctx.finish(ok, html)   termine l'étape et affiche l'explication
     ctx.scene              l'illustration associée (ou null), p. ex. la carte
     ctx.setScene(el)       place un élément dans la zone d'illustration     */
(function () {
  'use strict';
  var RX = (window.RX = window.RX || {});
  var A = (RX.act = {});
  var h = RX.h, ico = RX.ico;

  function miniFb(el, ok, html) {
    el.className = 'mini-fb ' + (ok === 'info' ? 'info' : ok ? 'ok' : 'ko');
    el.innerHTML = RX.typo((ok === 'info' ? '' : ico(ok ? 'check' : 'x')) + '<span>' + html + '</span>');
    el.hidden = false;
  }

  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth; // relance l'animation
    el.classList.add('shake');
  }

  function sceneEv(ctx, ev) { if (ev && ctx.scene && ctx.scene.ev) ctx.scene.ev(ev); }

  /** Sous-contexte : les réponses comptent, mais la fin ne clôt pas l'étape. */
  function subCtx(ctx, onDone) {
    return { scene: ctx.scene, mark: ctx.mark, setScene: ctx.setScene, finish: onDone };
  }

  /* ================= QCM : une seule bonne réponse ================= */
  A.qcm = function (step, ctx) {
    var el = h('<div class="act act-qcm"><div class="opts' + (step.code ? ' code' : '') + '"></div></div>');
    var box = el.firstElementChild;
    var opts = RX.shuffle(step.options);
    var done = false;
    opts.forEach(function (o) {
      var b = h('<button class="opt" type="button"><span class="opt-t">' + o.t + '</span><span class="opt-m" aria-hidden="true"></span></button>');
      b.addEventListener('click', function () {
        if (done) return;
        done = true;
        Array.prototype.forEach.call(box.children, function (c, i) {
          c.disabled = true;
          if (opts[i].ok) { c.classList.add('is-ok'); c.querySelector('.opt-m').innerHTML = ico('check'); }
        });
        if (!o.ok) { b.classList.add('is-ko'); b.querySelector('.opt-m').innerHTML = ico('x'); shake(b); }
        else RX.fx.burst(b);
        ctx.mark(step.notion, o.ok);
        sceneEv(ctx, step.ev);
        ctx.finish(o.ok, (o.fb ? o.fb + ' ' : '') + (step.fb || ''));
      });
      box.appendChild(b);
    });
    return el;
  };

  /* ================= PICK : trouver toutes les bonnes réponses ================= */
  A.pick = function (step, ctx) {
    var need = step.options.filter(function (o) { return o.ok; }).length;
    var found = 0, wrong = 0;
    var el = h('<div class="act act-pick">' +
      '<p class="count"><b>0</b> / ' + need + ' trouvés</p>' +
      '<div class="chips"></div><p class="mini-fb" aria-live="polite"></p></div>');
    var count = el.querySelector('.count b'), chips = el.querySelector('.chips'), fb = el.querySelector('.mini-fb');
    RX.shuffle(step.options).forEach(function (o) {
      var b = h('<button class="chip" type="button">' + o.t + '</button>');
      b.addEventListener('click', function () {
        b.disabled = true;
        if (o.ok) {
          found++;
          b.classList.add('is-ok');
          count.textContent = found;
          sceneEv(ctx, o.ev);
          RX.fx.burst(b, 8);
          miniFb(fb, true, '<b>' + o.t + '.</b> ' + (o.fb || ''));
          if (found === need) {
            chips.classList.add('done');
            Array.prototype.forEach.call(chips.children, function (c) { c.disabled = true; });
            for (var i = 0; i < need; i++) ctx.mark(step.notion, i >= wrong);
            ctx.finish(null, step.fb || '');
          }
        } else {
          wrong++;
          b.classList.add('is-ko');
          shake(b);
          miniFb(fb, false, '<b>' + o.t + ' ?</b> ' + (o.fb || 'Non.'));
        }
      });
      chips.appendChild(b);
    });
    return el;
  };

  /* ================= SORT : classer des cartes (2 à 4 catégories) ================= */
  A.sort = function (step, ctx) {
    var cards = step.fixed ? step.cards.slice() : RX.shuffle(step.cards);
    var cats = step.cats, n = cats.length;
    var i = 0, busy = false, cardEl = null;
    var bins = {};
    var el = h('<div class="act act-sort n' + n + (ctx.scene ? ' compact' : '') + (step.mono ? ' mono' : '') + '">' +
      '<div class="deck"><p class="count"></p><div class="stack"></div></div>' +
      '<div class="cats"></div>' +
      '<p class="mini-fb" aria-live="polite"></p>' +
      '<button class="btn small next-card" type="button" hidden>Compris ' + ico('next') + '</button>' +
      '<div class="recap" hidden></div></div>');
    var stack = el.querySelector('.stack'), count = el.querySelector('.count'), fb = el.querySelector('.mini-fb');
    var catsEl = el.querySelector('.cats'), nextBtn = el.querySelector('.next-card'), recap = el.querySelector('.recap');
    var dirs = n === 2 ? ['left', 'right'] : n === 3 ? ['left', 'up', 'right'] : ['left', 'left', 'right', 'right'];

    cats.forEach(function (c, k) {
      bins[c.id] = [];
      var b = h('<button class="cat" type="button" data-cat="' + c.id + '">' + c.label + '</button>');
      b.addEventListener('click', function () { choose(k); });
      catsEl.appendChild(b);
    });
    if (n === 2) el.appendChild(h('<p class="swipe-hint">Astuce : tu peux aussi faire glisser la carte.</p>'));

    function show() {
      count.textContent = 'Carte ' + (i + 1) + ' / ' + cards.length;
      stack.innerHTML = '';
      cardEl = h('<div class="scard"><p>' + cards[i].t + '</p></div>');
      stack.appendChild(cardEl);
      stack.classList.toggle('last', i === cards.length - 1);
      if (n === 2) enableSwipe(cardEl);
    }

    function choose(k) {
      if (busy) return;
      busy = true;
      var c = cards[i], ok = c.cat === cats[k].id;
      var right = cats.filter(function (x) { return x.id === c.cat; })[0];
      var rightIdx = cats.indexOf(right);
      bins[c.cat].push({ t: c.t, ok: ok });
      ctx.mark(c.notion || step.notion, ok);
      sceneEv(ctx, c.ev);
      cardEl.style.transform = '';
      if (ok) {
        cardEl.classList.add('is-ok', 'fly-' + dirs[k]);
        RX.fx.burst(catsEl.children[k], 6);
        miniFb(fb, true, c.fb || 'Exact !');
        RX.wait(560, next);
      } else {
        cardEl.classList.add('is-ko');
        shake(cardEl);
        catsEl.children[k].classList.add('is-ko');
        catsEl.children[rightIdx].classList.add('is-ok');
        miniFb(fb, false, 'C’était <b>' + right.label + '</b>. ' + (c.fb || ''));
        catsEl.classList.add('locked');
        nextBtn.hidden = false;
        nextBtn.focus({ preventScroll: true });
      }
    }

    function next() {
      Array.prototype.forEach.call(catsEl.children, function (b) { b.classList.remove('is-ok', 'is-ko'); });
      catsEl.classList.remove('locked');
      nextBtn.hidden = true;
      i++;
      busy = false;
      if (i < cards.length) show(); else end();
    }
    nextBtn.addEventListener('click', next);

    function end() {
      busy = true;
      el.classList.add('ended');
      el.querySelector('.deck').hidden = true;
      catsEl.hidden = true;
      fb.hidden = true;
      var hint = el.querySelector('.swipe-hint');
      if (hint) hint.hidden = true;
      recap.innerHTML = RX.typo(cats.map(function (c) {
        return '<div class="bin"><h4>' + c.label + '</h4><ul>' + bins[c.id].map(function (x) {
          return '<li class="' + (x.ok ? '' : 'missed') + '">' + x.t + '</li>';
        }).join('') + '</ul></div>';
      }).join(''));
      recap.hidden = false;
      ctx.finish(null, step.fb || '');
    }

    function enableSwipe(card) {
      var x0 = 0, dx = 0, active = false;
      card.addEventListener('pointerdown', function (e) {
        if (busy) return;
        active = true; x0 = e.clientX; dx = 0;
        card.classList.add('drag');
        try { card.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
      });
      card.addEventListener('pointermove', function (e) {
        if (!active) return;
        dx = e.clientX - x0;
        card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 18) + 'deg)';
        catsEl.children[0].classList.toggle('aim', dx < -40);
        catsEl.children[1].classList.toggle('aim', dx > 40);
      });
      function release() {
        if (!active) return;
        active = false;
        card.classList.remove('drag');
        catsEl.children[0].classList.remove('aim');
        catsEl.children[1].classList.remove('aim');
        if (Math.abs(dx) > 80) choose(dx < 0 ? 0 : 1);
        else card.style.transform = '';
      }
      card.addEventListener('pointerup', release);
      card.addEventListener('pointercancel', release);
    }

    show();
    return el;
  };

  /* ================= MATCH : relier des paires ================= */
  A.match = function (step, ctx) {
    var pairs = step.pairs, left = RX.shuffle(pairs), right = RX.shuffle(pairs);
    var sel = null, done = 0, missed = {};
    var el = h('<div class="act act-match"><div class="cols"><div class="col col-a"></div><div class="col col-b"></div></div>' +
      '<p class="mini-fb" aria-live="polite"></p></div>');
    var fb = el.querySelector('.mini-fb');

    function add(col, p, side) {
      var b = h('<button class="m-item" type="button"><span class="m-tag" hidden></span><span>' + (side === 'a' ? p.a : p.b) + '</span></button>');
      b.addEventListener('click', function () { tap({ side: side, p: p, b: b }); });
      el.querySelector(col).appendChild(b);
    }
    left.forEach(function (p) { add('.col-a', p, 'a'); });
    right.forEach(function (p) { add('.col-b', p, 'b'); });

    function tap(x) {
      if (!sel || sel.side === x.side) {
        if (sel) sel.b.classList.remove('sel');
        if (sel && sel.b === x.b) { sel = null; return; }
        sel = x;
        x.b.classList.add('sel');
        return;
      }
      var a = sel.side === 'a' ? sel : x, b = sel.side === 'a' ? x : sel;
      sel.b.classList.remove('sel');
      sel = null;
      if (a.p === b.p) {
        var idx = pairs.indexOf(a.p);
        [a.b, b.b].forEach(function (btn) { btn.disabled = true; btn.classList.add('matched', 'k' + idx); });
        var tag = b.b.querySelector('.m-tag');
        tag.textContent = a.p.a;
        tag.hidden = false;
        sceneEv(ctx, a.p.ev);
        RX.fx.burst(b.b, 8);
        ctx.mark(a.p.notion || step.notion, !missed[idx]);
        miniFb(fb, true, '<b>' + a.p.a + '</b> : ' + a.p.b.charAt(0).toLowerCase() + a.p.b.slice(1) + '.');
        done++;
        if (done === pairs.length) ctx.finish(null, step.fb || '');
      } else {
        missed[pairs.indexOf(a.p)] = true;
        shake(a.b); shake(b.b);
        miniFb(fb, false, 'Ces deux-là ne vont pas ensemble. Essaie encore !');
      }
    }
    return el;
  };

  /* ================= ORDER : remettre des étapes dans l'ordre ================= */
  A.order = function (step, ctx) {
    var items = step.steps.map(function (t, i) { return { t: t, i: i }; });
    var pool = RX.shuffle(items);
    if (pool.every(function (x, i) { return x.i === i; })) pool.reverse();
    var k = 0, missedCur = false;
    var el = h('<div class="act act-order"><ol class="o-done"></ol><div class="o-pool"></div>' +
      '<p class="mini-fb" aria-live="polite"></p></div>');
    var doneEl = el.querySelector('.o-done'), poolEl = el.querySelector('.o-pool'), fb = el.querySelector('.mini-fb');
    miniFb(fb, 'info', 'Touche ce qui vient en premier.');

    pool.forEach(function (x) {
      var b = h('<button class="opt" type="button"><span class="opt-t">' + x.t + '</span></button>');
      b.addEventListener('click', function () {
        if (x.i === k) {
          b.remove();
          doneEl.appendChild(h('<li><span class="o-n">' + (k + 1) + '</span><span>' + x.t + '</span></li>'));
          ctx.mark(step.notion, !missedCur);
          missedCur = false;
          k++;
          if (k === items.length) { poolEl.hidden = true; fb.hidden = true; ctx.finish(null, step.fb || ''); }
          else miniFb(fb, 'info', k === items.length - 1 ? 'Et le dernier ?' : 'Et ensuite ?');
        } else {
          missedCur = true;
          shake(b);
          miniFb(fb, false, 'Pas encore celui-ci : il vient plus tard.');
        }
      });
      poolEl.appendChild(b);
    });
    return el;
  };

  /* ================= MAPLABEL : nommer les zones de la carte ================= */
  A.maplabel = function (step, ctx) {
    var m = ctx.scene, targets = step.targets, k = 0, missedCur = false, labels = {};
    var el = h('<div class="act act-label"><div class="chips"></div><p class="mini-fb" aria-live="polite"></p></div>');
    var chips = el.querySelector('.chips'), fb = el.querySelector('.mini-fb');
    m.set({ zones: 'hidden', labels: labels, blink: targets[0].id });
    RX.shuffle(targets).forEach(function (t) {
      var b = h('<button class="chip" type="button">' + t.t + '</button>');
      b.addEventListener('click', function () {
        var cur = targets[k];
        if (t === cur) {
          b.disabled = true;
          b.classList.add('is-ok');
          labels[cur.id] = RX.CARTE.zones.filter(function (z) { return z.id === cur.id; })[0].court;
          ctx.mark(cur.notion || step.notion, !missedCur);
          miniFb(fb, true, '<b>' + cur.t + '.</b> ' + (cur.fb || ''));
          missedCur = false;
          k++;
          m.set({ labels: labels, blink: k < targets.length ? targets[k].id : null });
          if (k === targets.length) { m.set({ zones: 'named', owners: true }); ctx.finish(null, step.fb || ''); }
        } else {
          missedCur = true;
          shake(b);
          miniFb(fb, false, 'Ce n’est pas « ' + t.t + ' ». Regarde bien les appareils de la zone qui clignote.');
        }
      });
      chips.appendChild(b);
    });
    return el;
  };

  /* ================= DNS : envoyer le bon nom, lire la réponse ================= */
  A.dns = function (step, ctx) {
    var missed = false, done = false, dns = ctx.scene;
    var el = h('<div class="act act-dns">' +
      '<div class="url-bar" role="group" aria-label="Adresse du site">' + ico('browser') + '<span class="url-parts"></span></div>' +
      '<p class="mini-fb" aria-live="polite"></p><div class="dns-after"></div></div>');
    var parts = el.querySelector('.url-parts'), fb = el.querySelector('.mini-fb'), after = el.querySelector('.dns-after');
    miniFb(fb, 'info', 'Touche la partie à envoyer au serveur DNS.');
    step.url.forEach(function (u) {
      var b = h('<button class="url-part" type="button">' + u.t + '</button>');
      b.addEventListener('click', function () {
        if (done) return;
        if (u.ok) {
          done = true;
          b.classList.add('is-ok');
          parts.classList.add('locked');
          ctx.mark(step.notion, !missed);
          miniFb(fb, true, '<b>' + u.t + '</b> : c’est le nom de domaine. Ton ordinateur l’envoie au serveur DNS…');
          RX.fx.burst(b, 8);
          if (dns) dns.play();
          RX.wait(2900, function () {
            after.appendChild(h('<h3 class="q q2">' + step.then.q + '</h3>'));
            after.appendChild(A.qcm(step.then, ctx));
            after.scrollIntoView({ behavior: RX.reduced ? 'auto' : 'smooth', block: 'nearest' });
          });
        } else {
          missed = true;
          b.classList.add('is-ko');
          shake(b);
          miniFb(fb, false, u.fb);
        }
      });
      parts.appendChild(b);
    });
    return el;
  };

  /* ================= ROUTE : jouer les routeurs (2 manches, une panne) ================= */
  A.route = function (step, ctx) {
    var m = ctx.scene, adj = RX.map.adj;
    var routers = ['rf', 'A', 'B', 'C', 'D', 'E', 'rh'];
    var names = { rf: 'le routeur du FAI', rh: 'le routeur de l’hébergeur' };
    function nom(id) { return names[id] || 'le routeur ' + id; }
    var round = 1, cur, path, missed, broken = [], busy = false;
    var el = h('<div class="act act-route">' +
      '<p class="count"><span class="rd">Manche 1 / 2</span> · <b class="hops">0</b> saut</p>' +
      '<p class="route-path"></p>' +
      '<p class="mini-fb" aria-live="polite"></p>' +
      '<button class="btn small next-round" type="button" hidden>Manche 2 : la panne ' + ico('next') + '</button></div>');
    var fb = el.querySelector('.mini-fb'), hops = el.querySelector('.hops'), rd = el.querySelector('.rd');
    var pathEl = el.querySelector('.route-path'), nextBtn = el.querySelector('.next-round');

    function label(id) { return id === 'rf' ? 'FAI' : id === 'rh' ? 'Hébergeur' : id; }
    function refresh() {
      var n = path.length - 1;
      hops.textContent = n;
      hops.nextSibling.textContent = n > 1 ? ' sauts' : ' saut';
      pathEl.innerHTML = path.map(function (id) { return '<span>' + label(id) + '</span>'; }).join(ico('next'));
      var cand = cur === step.to ? [] : (adj[cur] || []).filter(function (x) { return routers.indexOf(x) >= 0 && broken.indexOf(x) < 0 && path.indexOf(x) < 0; });
      var lit = [];
      for (var i = 1; i < path.length; i++) lit.push([path[i - 1], path[i]]);
      m.set({ cur: cur, cand: cand, lit: lit, broken: broken, flag: step.to });
    }
    function start() {
      cur = step.from; path = [cur]; missed = false; busy = false;
      m.set({ bip: cur, zones: 'named', dns: true });
      refresh();
      m.pick(routers, onPick);
    }
    function onPick(id) {
      if (busy || id === cur || cur === step.to) return;
      if (broken.indexOf(id) >= 0) {
        missed = true; m.shake(id);
        miniFb(fb, false, 'Le routeur ' + id + ' est en panne : il faut le contourner.');
        return;
      }
      if ((adj[cur] || []).indexOf(id) < 0) {
        missed = true; m.shake(id);
        miniFb(fb, false, 'Pas de liaison directe entre ' + nom(cur) + ' et ' + nom(id) + ' : un routeur ne peut transmettre qu’à un voisin.');
        return;
      }
      if (path.indexOf(id) >= 0) {
        missed = true; m.shake(id);
        miniFb(fb, false, 'Le paquet est déjà passé par là : inutile de tourner en rond !');
        return;
      }
      busy = true;
      fb.hidden = true;
      m.set({ cand: [] });
      m.go([id], {}, function () {
        busy = false;
        cur = id; path.push(id);
        refresh();
        if (id === step.to) roundDone();
      });
    }
    function roundDone() {
      ctx.mark(step.notion, !missed);
      m.pick(null);
      var n = path.length - 1;
      if (round === 1) {
        broken = [path[1]];
        miniFb(fb, true, 'Arrivé en ' + n + ' sauts ! Mais… <b>panne</b> : le routeur ' + path[1] + ' ne répond plus. Les paquets suivants doivent passer ailleurs.');
        m.set({ broken: broken });
        nextBtn.hidden = false;
        nextBtn.focus({ preventScroll: true });
      } else {
        miniFb(fb, true, 'Arrivé en ' + n + ' sauts, en contournant la panne !');
        m.set({ cand: [] });
        ctx.finish(null, step.fb || '');
      }
    }
    nextBtn.addEventListener('click', function () {
      nextBtn.hidden = true;
      round = 2;
      rd.textContent = 'Manche 2 / 2';
      fb.hidden = true;
      start();
    });
    miniFb(fb, 'info', 'Les routeurs qui clignotent sont les voisins du routeur où se trouve le paquet.');
    RX.wait(0, start);
    return el;
  };

  /* ================= TCP : remettre les morceaux dans l'ordre ================= */
  A.tcp = function (step, ctx) {
    var parts = step.parts, next = 1, missedOrder = false, arrived = {}, phase = 'order';
    var el = h('<div class="act act-tcp">' +
      '<p class="tcp-k">' + ico('laptop') + 'Arrivés dans ton navigateur</p>' +
      '<div class="tcp-in" aria-live="polite"></div>' +
      '<p class="tcp-k">' + ico('doc') + 'Le texte remis en ordre</p>' +
      '<ol class="tcp-slots">' + parts.map(function (p, i) { return '<li data-n="' + (i + 1) + '"><span class="tcp-no">' + (i + 1) + '</span><span class="tcp-tx"></span></li>'; }).join('') + '</ol>' +
      '<p class="mini-fb" aria-live="polite"></p><div class="tcp-after"></div></div>');
    var inEl = el.querySelector('.tcp-in'), slots = el.querySelectorAll('.tcp-slots li'), fb = el.querySelector('.mini-fb'), after = el.querySelector('.tcp-after');

    function card(n, resent) {
      var b = h('<button class="tcp-card' + (resent ? ' resent' : '') + '" type="button"><span class="tcp-no">n° ' + n + '</span><span>' + parts[n - 1] + '</span>' + (resent ? '<small>renvoyé</small>' : '') + '</button>');
      b.addEventListener('click', function () { place(n, b); });
      arrived[n] = true;
      inEl.appendChild(b);
    }
    function place(n, b) {
      if (phase !== 'order') return;
      if (n !== next && !arrived[next]) {
        miniFb(fb, 'info', 'Le n° ' + next + ' n’est pas encore arrivé… Patience !');
        return;
      }
      if (n !== next) {
        missedOrder = true;
        shake(b);
        miniFb(fb, false, 'Ce morceau porte le n° ' + n + ' : ce n’est pas encore son tour. Cherche le n° ' + next + '.');
        return;
      }
      b.remove();
      var slot = slots[n - 1];
      slot.classList.add('set');
      slot.querySelector('.tcp-tx').textContent = parts[n - 1];
      fb.hidden = true;
      next++;
      if (next > parts.length) return complete();
      if (next === step.manque && !arrived[step.manque]) missing();
    }
    function missing() {
      phase = 'q';
      slots[step.manque - 1].classList.add('hole');
      miniFb(fb, false, 'Le morceau <b>n° ' + step.manque + '</b> n’est jamais arrivé !');
      after.appendChild(h('<h3 class="q q2">' + step.then.q + '</h3>'));
      after.appendChild(A.qcm(step.then, subCtx(ctx, function (ok, html) {
        after.appendChild(h('<p class="mini-fb ' + (ok ? 'ok' : 'ko') + '">' + ico(ok ? 'check' : 'x') + '<span>' + html + '</span></p>'));
        RX.wait(1500, function () {
          slots[step.manque - 1].classList.remove('hole');
          card(step.manque, true);
          phase = 'order';
          miniFb(fb, 'info', 'Le n° ' + step.manque + ' vient d’arriver. Termine de remettre le texte en ordre.');
          inEl.scrollIntoView({ behavior: RX.reduced ? 'auto' : 'smooth', block: 'nearest' });
        });
      })));
      after.scrollIntoView({ behavior: RX.reduced ? 'auto' : 'smooth', block: 'nearest' });
    }
    function complete() {
      phase = 'done';
      ctx.mark(step.notion, !missedOrder);
      el.querySelector('.tcp-slots').classList.add('complete');
      after.innerHTML = '';
      miniFb(fb, true, 'Texte complet : « ' + parts.join(' ') + ' »');
      ctx.finish(null, step.fb || '');
    }
    // Arrivée des morceaux, un à un, dans le désordre
    step.arrivee.forEach(function (n, i) { RX.wait(300 + i * 450, function () { card(n); }); });
    miniFb(fb, 'info', 'Chaque morceau porte un numéro écrit par TCP.');
    return el;
  };

  /* ================= ENCAPS : préparer le paquet (mission finale) ================= */
  A.encaps = function (step, ctx) {
    var M = RX.MISSION, N = RX.NET, layers = [], stage = 0;
    var vis = RX.h('<figure class="scene scene-build" aria-live="polite"><p class="build-k">' + ico('nest') + 'Ton paquet</p><div class="build-pk"></div></figure>');
    if (ctx.setScene) ctx.setScene(vis);
    var el = h('<div class="act act-enc"><div class="enc-task"></div><p class="mini-fb" aria-live="polite"></p></div>');
    var task = el.querySelector('.enc-task'), fb = el.querySelector('.mini-fb'), pkBox = vis.querySelector('.build-pk');
    var COUCHE = {}; RX.COUCHES.forEach(function (c) { COUCHE[c.id] = c; });

    function draw(newest) {
      if (!layers.length) { pkBox.innerHTML = '<p class="build-empty">Pour l’instant, rien à envoyer…</p>'; return; }
      pkBox.innerHTML = RX.packetHtml(layers.map(function (l) { return l; }), { cls: 'pk-build' });
      var outer = pkBox.querySelector('.pk > .pk-l');
      if (newest && outer) outer.classList.add('new');
    }

    function askMessage() {
      task.innerHTML = '';
      task.appendChild(h('<p class="enc-k" style="--lc:' + COUCHE.app.c + '"><span>Couche Application</span>Le message</p>'));
      task.appendChild(h('<h3 class="q q2">Quel message ton navigateur doit-il envoyer au serveur ?</h3>'));
      var box = h('<div class="opts code"></div>');
      var missed = false, done = false;
      RX.shuffle(M.messages).forEach(function (o) {
        var b = h('<button class="opt enc-msg" type="button"><span class="opt-t"><code>' + o.t + '</code><small>' + o.g + '</small></span><span class="opt-m" aria-hidden="true"></span></button>');
        b.addEventListener('click', function () {
          if (done) return;
          if (o.ok) {
            done = true;
            b.classList.add('is-ok'); b.querySelector('.opt-m').innerHTML = ico('check');
            Array.prototype.forEach.call(box.children, function (c) { c.disabled = true; });
            ctx.mark(step.notion, !missed);
            miniFb(fb, true, o.fb);
            layers = [{ id: 'app', h: 'Message HTTP', u: 'message', f: [['', 'GET / HTTP/1.1'], ['', 'Host: ' + N.domaine]] }];
            draw(true);
            RX.wait(900, askOrder);
          } else {
            missed = true;
            b.classList.add('is-ko'); b.disabled = true; b.querySelector('.opt-m').innerHTML = ico('x');
            shake(b);
            miniFb(fb, false, o.fb);
          }
        });
        box.appendChild(b);
      });
      task.appendChild(box);
    }

    function askOrder() {
      var remaining = M.ordre.slice(stage);
      var want = remaining[0];
      if (remaining.length === 1) {
        // Il ne reste qu'une enveloppe : pas de question d'ordre.
        miniFb(fb, 'info', 'Il ne reste qu’une enveloppe : celle de la couche <b>Accès réseau</b>, pour le Wi-Fi.');
        return askField(want);
      }
      task.innerHTML = '';
      task.appendChild(h('<p class="enc-k" style="--lc:#B197FF"><span>On descend les couches</span>Quelle enveloppe ajouter maintenant ?</p>'));
      var chips = h('<div class="chips enc-chips"></div>');
      var missed = false, done = false;
      RX.shuffle(remaining).forEach(function (id) {
        var e = M.entetes[id];
        var b = h('<button class="chip enc-chip" type="button" style="--lc:' + COUCHE[id].c + '">' + e.nom + '<small>' + e.couche + '</small></button>');
        b.addEventListener('click', function () {
          if (done) return;
          if (id === want) {
            done = true;
            b.classList.add('is-ok');
            ctx.mark(step.notion, !missed);
            fb.hidden = true;
            RX.wait(350, function () { askField(id); });
          } else {
            missed = true;
            b.classList.add('is-ko'); b.disabled = true;
            shake(b);
            var prev = layers.length ? layers[0].id : 'app';
            miniFb(fb, false, 'Pas encore : on descend les couches dans l’ordre. Sous la couche ' + COUCHE[prev].nom + ' vient la couche ' + COUCHE[want].nom + '.');
          }
        });
        chips.appendChild(b);
      });
      task.appendChild(chips);
    }

    function askField(id) {
      var e = M.entetes[id];
      task.innerHTML = '';
      task.appendChild(h('<p class="enc-k" style="--lc:' + COUCHE[id].c + '"><span>Couche ' + e.couche + '</span>' + e.nom + '</p>'));
      if (e.fixes) task.appendChild(h('<p class="enc-fixed">' + e.fixes.map(function (f) { return '<span><em>' + f[0] + '</em><b>' + f[1] + '</b></span>'; }).join('') + '</p>'));
      task.appendChild(h('<h3 class="q q2">' + e.q + '</h3>'));
      if (id === 'int') task.appendChild(h('<details class="enc-help"><summary>' + ico('book') + 'Revoir la réponse du DNS</summary>' +
        '<table class="dns-table"><tbody><tr><td>www.pigeon-voyageur.example</td><td>203.0.113.42</td></tr><tr><td>mail.pigeon-voyageur.example</td><td>203.0.113.42</td></tr><tr><td>photos.pigeon-voyageur.example</td><td>203.0.113.17</td></tr></tbody></table></details>'));
      var box = h('<div class="opts' + (id === 'acc' ? '' : ' code') + ' enc-opts"></div>');
      var missed = false, done = false;
      RX.shuffle(e.options).forEach(function (o) {
        var b = h('<button class="opt" type="button"><span class="opt-t">' + o.t + '</span><span class="opt-m" aria-hidden="true"></span></button>');
        b.addEventListener('click', function () {
          if (done) return;
          if (o.ok) {
            done = true;
            b.classList.add('is-ok'); b.querySelector('.opt-m').innerHTML = ico('check');
            Array.prototype.forEach.call(box.children, function (c) { c.disabled = true; });
            ctx.mark(step.notion, !missed);
            miniFb(fb, true, o.fb);
            var f = (e.fixes || []).slice();
            f.push([e.champ, o.t, 'set']);
            (e.apres || []).forEach(function (x) { f.push(x); });
            if (id === 'acc') f = [['De', 'ton ordinateur'], ['Vers', 'routeur du gymnase', 'set']].concat(e.apres);
            layers.unshift({ id: id, h: e.nom, u: COUCHE[id].unite, f: f });
            draw(true);
            stage++;
            RX.wait(1000, stage < M.ordre.length ? askOrder : end);
          } else {
            missed = true;
            b.classList.add('is-ko'); b.disabled = true; b.querySelector('.opt-m').innerHTML = ico('x');
            shake(b);
            miniFb(fb, false, o.fb);
          }
        });
        box.appendChild(b);
      });
      task.appendChild(box);
    }

    function end() {
      task.innerHTML = '';
      task.appendChild(h('<div class="enc-done">' + ico('check') + '<div><p class="enc-done-t">Paquet prêt à partir !</p>' +
        '<p>4 couches, 4 en-têtes : direction le serveur <b>203.0.113.42</b>, port <b>80</b>, en passant d’abord par le <b>routeur du gymnase</b>.</p></div></div>'));
      fb.hidden = true;
      RX.fx.burst(vis, 14);
      ctx.finish(null, 'Message HTTP → segment TCP (port 80) → paquet IP (vers 203.0.113.42) → trame Wi-Fi (jusqu’au routeur du gymnase). C’est l’encapsulation !');
    }

    draw();
    askMessage();
    return el;
  };

  /* ================= JOURNEY : suivre le voyage sur la carte ================= */
  A.journey = function (step, ctx) {
    var m = ctx.scene, V = RX.VOYAGE, N = RX.NET, i = -1, busy = false;
    var pk = { med: 'wifi', src: N.pc, dst: N.web, rep: false };
    var el = h('<div class="act act-jr">' +
      '<div class="jr-card"><p class="jr-k"></p><h3 class="jr-t"></h3><p class="jr-d"></p><div class="jr-q"></div><p class="jr-after" hidden></p></div>' +
      '<div class="jr-pk" aria-live="polite"></div>' +
      '<button class="btn primary big jr-next" type="button">Envoyer le paquet ' + ico('next') + '</button></div>');
    var k = el.querySelector('.jr-k'), t = el.querySelector('.jr-t'), d = el.querySelector('.jr-d');
    var qBox = el.querySelector('.jr-q'), aft = el.querySelector('.jr-after'), pkEl = el.querySelector('.jr-pk'), btn = el.querySelector('.jr-next');
    var trail = [], lit = [];

    function badge() {
      var C = RX.CARTE.trames;
      var http = pk.rep ? 'HTTP/1.1 200 OK + page HTML' : 'GET / HTTP/1.1';
      var tcp = pk.rep ? 'port source 80' : 'port 51234 → 80';
      pkEl.innerHTML = RX.typo('<p class="jr-pk-k">' + (pk.rep ? 'La réponse' : 'Ton paquet') + '</p><div class="jr-pk-row">' +
        '<span class="l-acc">' + C[pk.med] + '</span>' +
        '<span class="l-int">IP <b class="' + (pk.flashSrc ? 'flash' : '') + '">' + pk.src + '</b> → <b class="' + (pk.flashDst ? 'flash' : '') + '">' + pk.dst + '</b></span>' +
        '<span class="l-tra">TCP · ' + tcp + '</span>' +
        '<span class="l-app">' + http + '</span></div>');
      pk.flashSrc = pk.flashDst = false;
    }

    function setInfo(f) {
      if (f.med) pk.med = f.med;
      if (f.src && f.src !== pk.src) { pk.src = f.src; pk.flashSrc = true; }
      if (f.dst && f.dst !== pk.dst) { pk.dst = f.dst; pk.flashDst = true; }
      if (f.reponse) pk.rep = true;
      badge();
    }

    function show(n) {
      i = n;
      var f = V[i];
      k.textContent = 'Étape ' + (i + 1) + ' / ' + V.length;
      t.textContent = f.t;
      d.innerHTML = RX.typo(f.d);
      qBox.innerHTML = '';
      aft.hidden = true;
      busy = true;
      btn.disabled = true;
      var seq = f.to || f.back;
      if (f.at) {
        if (!trail.length) trail = [f.at];
        m.set({ bip: f.at, hl: [f.at] });
        if (f.med) pk.med = f.med;
        setInfo(f);
        arrived(f);
      } else if (seq) {
        if (f.reponse && !pk.rep) setInfo({ reponse: true, src: f.src, dst: f.dst });
        if (f.avant) setInfo({ src: f.src, dst: f.dst });
        m.set({ hl: [] });
        m.go(seq, {
          onLeg: function (a, b) {
            var md = RX.map.medium(a, b);
            if (md) { pk.med = md; badge(); }
          },
          onStep: function (id) {
            lit.push([trail[trail.length - 1], id]);
            trail.push(id);
            m.set({ lit: lit.slice(-14), hl: [id] });
          },
          pause: 250
        }, function () {
          if (!f.q) setInfo({ src: f.src, dst: f.dst, reponse: f.reponse });
          arrived(f);
        });
      }
    }

    function arrived(f) {
      if (f.q) {
        qBox.appendChild(h('<h4 class="jr-qt">' + f.q.q + '</h4>'));
        qBox.appendChild(A.qcm({ type: 'qcm', notion: f.q.notion, options: f.q.options, code: f.q.code }, subCtx(ctx, function (ok, html) {
          if (html) qBox.appendChild(h('<p class="mini-fb ' + (ok ? 'ok' : 'ko') + '">' + ico(ok ? 'check' : 'x') + '<span>' + html + '</span></p>'));
          if (f.apres) { aft.innerHTML = RX.typo(f.apres); aft.hidden = false; }
          setInfo(f);
          ready();
        })));
        return;
      }
      if (f.page) {
        qBox.appendChild(h('<div class="mb jr-page"><div class="mb-bar"><i></i><i></i><i></i><span class="mb-url">http://' + N.domaine + '</span></div>' +
          '<div class="mb-page"><h3>Le pigeon voyageur</h3><p>Bien avant Internet, il transportait déjà des messages.</p><p>Il retrouve son chemin sur des centaines de kilomètres.</p></div></div>'));
        RX.fx.burst(qBox, 12);
        busy = false;
        btn.hidden = true;
        ctx.finish(null, 'Requête encapsulée, routée de routeur en routeur, livrée au port 80, puis réponse renvoyée dans l’autre sens : voilà TCP/IP en action.');
        return;
      }
      ready();
    }

    function ready() {
      busy = false;
      btn.disabled = false;
      btn.innerHTML = 'Étape suivante ' + ico('next');
      btn.focus({ preventScroll: true });
    }

    btn.addEventListener('click', function () {
      if (busy) return;
      if (i < V.length - 1) show(i + 1);
    });

    // Avant le départ : le paquet attend sur ton ordinateur.
    m.set({ bip: 'pc', zones: 'named', dns: true, ips: true, flag: 'web', hl: ['pc'] });
    k.textContent = 'Prêt ?';
    t.textContent = 'Le paquet est sur ton ordinateur';
    d.innerHTML = RX.typo('Appuie sur le bouton pour l’envoyer. À chaque étape, lis ce que fait l’appareil traversé.');
    badge();
    return el;
  };
})();
