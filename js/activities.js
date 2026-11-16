/* Requête Express — les mini-jeux.
   Chaque activité reçoit (step, ctx) et renvoie un élément HTML.
     ctx.mark(notion, ok)   compte une réponse (juste du premier coup ou non)
     ctx.finish(ok, html)   termine l'étape et affiche l'explication
     ctx.scene              l'illustration associée (ou null)               */
(function () {
  'use strict';
  var RX = (window.RX = window.RX || {});
  var A = (RX.act = {});
  var h = RX.h;

  function miniFb(el, ok, html) {
    el.className = 'mini-fb ' + (ok ? 'ok' : 'ko');
    el.innerHTML = RX.typo(RX.ico(ok ? 'check' : 'x') + '<span>' + html + '</span>');
  }

  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth; // relance l'animation
    el.classList.add('shake');
  }

  function sceneEv(ctx, ev) { if (ev && ctx.scene) ctx.scene.ev(ev); }

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
          if (opts[i].ok) { c.classList.add('is-ok'); c.querySelector('.opt-m').innerHTML = RX.ico('check'); }
        });
        if (!o.ok) { b.classList.add('is-ko'); b.querySelector('.opt-m').innerHTML = RX.ico('x'); shake(b); }
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

  /* ================= SORT : classer des cartes (boutons ou glisser) ================= */
  A.sort = function (step, ctx) {
    var cards = step.fixed ? step.cards.slice() : RX.shuffle(step.cards);
    var cats = step.cats, n = cats.length;
    var i = 0, busy = false, cardEl = null;
    var bins = {};
    var el = h('<div class="act act-sort n' + n + (ctx.scene ? ' compact' : '') + '">' +
      '<div class="deck"><p class="count"></p><div class="stack"></div></div>' +
      '<div class="cats"></div>' +
      '<p class="mini-fb" aria-live="polite"></p>' +
      '<button class="btn small next-card" type="button" hidden>Compris ' + RX.ico('next') + '</button>' +
      '<div class="recap" hidden></div></div>');
    var stack = el.querySelector('.stack'), count = el.querySelector('.count'), fb = el.querySelector('.mini-fb');
    var catsEl = el.querySelector('.cats'), nextBtn = el.querySelector('.next-card'), recap = el.querySelector('.recap');
    var dirs = n === 2 ? ['left', 'right'] : ['left', 'up', 'right'];

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
        setTimeout(next, RX.reduced ? 250 : 520);
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
      if (step.end === 'compare' && ctx.scene) {
        var sw = ctx.scene.el.querySelector('.lab-switch');
        if (sw) sw.hidden = false;
      }
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

  /* ================= ACRONYM : retrouver les mots d'un sigle ================= */
  A.acronym = function (step, ctx) {
    var k = 0, missed = false;
    var el = h('<div class="act act-acro">' +
      '<div class="tiles">' + step.slots.map(function (s) {
        return '<div class="tile"><b>' + s.l + '</b><span>?</span></div>';
      }).join('') + '</div>' +
      '<div class="choices"></div>' +
      '<p class="reveal" hidden>' + (step.reveal || '') + '</p></div>');
    var tiles = el.querySelectorAll('.tile'), choices = el.querySelector('.choices');

    function show() {
      var slot = step.slots[k];
      Array.prototype.forEach.call(tiles, function (t, i) { t.classList.toggle('cur', i === k); });
      choices.innerHTML = '';
      RX.shuffle(slot.choices).forEach(function (c) {
        var b = h('<button class="chip" type="button">' + c + '</button>');
        b.addEventListener('click', function () {
          if (c === slot.ok) {
            var t = tiles[k];
            t.classList.remove('cur');
            t.classList.add('done');
            t.querySelector('span').textContent = c;
            RX.fx.burst(t, 6);
            k++;
            if (k < step.slots.length) show(); else end();
          } else {
            missed = true;
            b.disabled = true;
            b.classList.add('is-ko');
            shake(b);
          }
        });
        choices.appendChild(b);
      });
    }

    function end() {
      choices.hidden = true;
      el.querySelector('.reveal').hidden = false;
      ctx.mark(step.notion, !missed);
      ctx.finish(!missed, step.fb || '');
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
    fb.className = 'mini-fb info';
    fb.textContent = 'Touche l’étape qui vient en premier.';

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
          else { fb.className = 'mini-fb info'; fb.textContent = k === items.length - 1 ? 'Et la dernière ?' : 'Et ensuite ?'; }
        } else {
          missedCur = true;
          shake(b);
          miniFb(fb, false, 'Pas encore celle-ci : il se passe autre chose avant.');
        }
      });
      poolEl.appendChild(b);
    });
    return el;
  };

  /* ================= LABEL : légender le schéma, cible après cible ================= */
  A.label = function (step, ctx) {
    var targets = step.targets, k = 0, missedCur = false;
    var el = h('<div class="act act-label"><div class="chips"></div><p class="mini-fb" aria-live="polite"></p></div>');
    var chips = el.querySelector('.chips'), fb = el.querySelector('.mini-fb');
    if (ctx.scene) ctx.scene.hl(targets[0].id);
    RX.shuffle(targets).forEach(function (t) {
      var b = h('<button class="chip" type="button">' + t.t + '</button>');
      b.addEventListener('click', function () {
        var cur = targets[k];
        if (t === cur) {
          b.disabled = true;
          b.classList.add('is-ok');
          if (ctx.scene) ctx.scene.label(cur.id, cur.t);
          ctx.mark(cur.notion || step.notion, !missedCur);
          miniFb(fb, true, cur.fb || 'Exact !');
          missedCur = false;
          k++;
          if (k < targets.length) {
            if (ctx.scene) ctx.scene.hl(targets[k].id);
          } else {
            if (ctx.scene) { ctx.scene.hl(null); ctx.scene.ev('play'); }
            ctx.finish(null, step.fb || '');
          }
        } else {
          missedCur = true;
          shake(b);
          miniFb(fb, false, 'Ce n’est pas « ' + t.t + ' ». Regarde bien ce qui clignote.');
        }
      });
      chips.appendChild(b);
    });
    return el;
  };

  /* ================= HYPER : un mini-Web à explorer ================= */
  A.hyper = function (step, ctx) {
    var cur = step.start, clicks = 0, reached = false;
    var el = h('<div class="act act-hyper">' +
      '<div class="mb"><div class="mb-bar"><i></i><i></i><i></i><span class="mb-url"></span></div>' +
      '<div class="mb-page hy-page"></div></div>' +
      '<div class="hy-after"></div></div>');
    var page = el.querySelector('.hy-page'), url = el.querySelector('.mb-url'), after = el.querySelector('.hy-after');

    function go(id, animate) {
      cur = id;
      var p = step.pages[id];
      url.textContent = 'mini-web.ch/' + id;
      page.innerHTML = RX.typo('<h3>' + p.titre + '</h3><p>' + p.html + '</p>');
      page.querySelectorAll('a[data-go]').forEach(function (a) {
        a.setAttribute('href', '#');
        a.setAttribute('role', 'button');
        a.addEventListener('click', function (e) {
          e.preventDefault();
          if (reached) return;
          clicks++;
          go(a.getAttribute('data-go'), true);
        });
      });
      if (animate) { page.classList.remove('load'); void page.offsetWidth; page.classList.add('load'); }
      if (id === step.goal && !reached) {
        reached = true;
        page.classList.add('goal');
        RX.fx.burst(el.querySelector('.mb'), 12);
        after.appendChild(h('<p class="hy-ok">' + RX.ico('check') + '<span>Page trouvée en ' + clicks + ' clic' + (clicks > 1 ? 's' : '') + ' !</span></p>'));
        after.appendChild(h('<h3 class="q q2">' + step.then.q + '</h3>'));
        after.appendChild(A.qcm(step.then, ctx));
        setTimeout(function () { after.scrollIntoView({ behavior: RX.reduced ? 'auto' : 'smooth', block: 'nearest' }); }, 250);
      }
    }
    go(cur, false);
    return el;
  };

  /* ================= RANK : jouer le moteur de recherche ================= */
  A.rank = function (step, ctx) {
    var done = false;
    var el = h('<div class="act act-rank">' +
      '<div class="serp-bar">' + RX.ico('search') + '<span>' + step.query + '</span></div>' +
      '<div class="serp"></div></div>');
    var serp = el.querySelector('.serp');
    function meter(v, max) {
      var out = '<span class="meter" aria-hidden="true">';
      for (var i = 0; i < max; i++) out += '<i class="' + (i < v ? 'on' : '') + '"></i>';
      return out + '</span>';
    }
    var labels = ['nulle', 'faible', 'moyenne', 'forte'];
    RX.shuffle(step.results).forEach(function (r) {
      var b = h('<button class="res" type="button">' +
        '<span class="res-rank" aria-hidden="true"></span>' +
        '<span class="res-url">' + r.url + '</span>' +
        '<span class="res-t">' + r.titre + '</span>' +
        '<span class="res-crit">' +
          '<span><em>Pertinence</em>' + meter(r.pert, 3) + '<small>' + labels[r.pert] + '</small></span>' +
          '<span><em>Popularité</em><b>' + r.liens + '</b><small>lien' + (r.liens > 1 ? 's' : '') + '</small></span>' +
          '<span><em>Confiance</em>' + meter(r.conf, 3) + '<small>' + labels[r.conf] + '</small></span>' +
        '</span></button>');
      b.addEventListener('click', function () {
        if (done) return;
        done = true;
        serp.classList.add('locked');
        Array.prototype.forEach.call(serp.children, function (c) { c.disabled = true; });
        var win = Array.prototype.filter.call(serp.children, function (c) { return c._r.ok; })[0];
        win.classList.add('is-ok');
        win.querySelector('.res-rank').textContent = 'N° 1';
        if (!r.ok) { b.classList.add('is-ko'); shake(b); } else RX.fx.burst(b, 12);
        if (win !== serp.firstElementChild) serp.insertBefore(win, serp.firstElementChild);
        ctx.mark(step.notion, r.ok);
        ctx.finish(r.ok, (r.fb ? r.fb + ' ' : '') + (step.fb || ''));
      });
      b._r = r;
      serp.appendChild(b);
    });
    return el;
  };
})();
