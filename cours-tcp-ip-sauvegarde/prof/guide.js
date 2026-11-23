/* Guide du professeur — les corrigés sont générés à partir de docs/js/data.js,
   le contenu même du site : aucune divergence possible entre le site et le guide. */
(function () {
  'use strict';
  var RX = window.RX, P = RX.PARTIES, NOT = RX.NOTIONS, NET = RX.NET;
  var SITE = RX.SITE.url;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(html) { return RX.h(html); }
  function strip(s) { return String(s).replace(/<br\s*\/?>/g, ' · '); }
  var OK = '<span class="ok-m">✔</span>', KO = '<span class="ko-m">✘</span>';
  var TYPES = {
    qcm: 'QCM', pick: 'Trouver toutes les bonnes réponses', sort: 'Classer des cartes', match: 'Relier des paires',
    order: 'Remettre dans l’ordre', maplabel: 'Légender la carte', dns: 'Interroger le DNS', route: 'Jeu : joue les routeurs',
    tcp: 'Remettre les morceaux en ordre', encaps: 'Mission finale : construire le paquet', journey: 'Mission finale : le voyage'
  };

  /* ---------- Corrigé d'un QCM (aussi utilisé dans les étapes composées) ---------- */
  function qcmHtml(st) {
    var good = st.options.filter(function (o) { return o.ok; });
    var bad = st.options.filter(function (o) { return !o.ok; });
    return '<ul class="ans">' + good.concat(bad).map(function (o) {
      return '<li class="' + (o.ok ? 'is-ok' : 'is-ko') + '">' + (o.ok ? OK : KO) + '<span><span class="' + (st.code ? 'mono' : '') + '">' + strip(o.t) + '</span>' +
        (o.fb ? '<small>' + o.fb + '</small>' : '') + '</span></li>';
    }).join('') + '</ul>' + (st.fb ? '<p class="expl"><b>Explication affichée :</b> ' + st.fb + '</p>' : '');
  }

  function stepHtml(st, num, bonus) {
    var head = '<div class="ex-h"><span class="ex-n">' + (bonus ? 'Bonus ' : 'Ex. ') + num + '</span><span class="ex-t">' + TYPES[st.type] + '</span>' +
      (st.notion && NOT[st.notion] ? '<span class="ex-notion">Notion : ' + NOT[st.notion].t + '</span>' : '') + '</div>';
    var q = st.q ? '<p class="ex-q">' + st.q.replace(/<\/?em>/g, '') + '</p>' : '';
    var body = '';
    switch (st.type) {
      case 'qcm': body = qcmHtml(st); break;
      case 'pick': body = qcmHtml(st); break;
      case 'sort':
        body = '<table class="t-sort"><thead><tr><th>Carte</th><th>Bonne catégorie</th><th>Explication affichée</th></tr></thead><tbody>' +
          st.cards.map(function (c) {
            var cat = st.cats.filter(function (x) { return x.id === c.cat; })[0];
            return '<tr><td class="' + (st.mono ? 'mono' : '') + '">' + c.t + '</td><td><b>' + cat.label + '</b></td><td>' + (c.fb || '') + '</td></tr>';
          }).join('') + '</tbody></table>' + (st.fb ? '<p class="expl"><b>Bilan affiché :</b> ' + st.fb + '</p>' : '');
        break;
      case 'match':
        body = '<table class="t-sort"><tbody>' + st.pairs.map(function (p) {
          return '<tr><td><b>' + p.a + '</b></td><td>↔</td><td>' + p.b + '</td></tr>';
        }).join('') + '</tbody></table>' + (st.fb ? '<p class="expl"><b>Bilan affiché :</b> ' + st.fb + '</p>' : '');
        break;
      case 'order':
        body = '<ol class="t-order">' + st.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
          (st.fb ? '<p class="expl"><b>Bilan affiché :</b> ' + st.fb + '</p>' : '');
        break;
      case 'maplabel':
        body = '<p>Les zones clignotent l’une après l’autre ; l’élève choisit leur nom.</p><table class="t-sort"><tbody>' + st.targets.map(function (t) {
          return '<tr><td><b>' + t.t + '</b></td><td>' + t.fb + '</td></tr>';
        }).join('') + '</tbody></table>' + (st.fb ? '<p class="expl"><b>Bilan affiché :</b> ' + st.fb + '</p>' : '');
        break;
      case 'dns':
        body = '<p><b>Étape 1.</b> L’adresse <span class="mono">http://www.pigeon-voyageur.example/oiseaux.html</span> est découpée en trois parties ; l’élève touche celle qu’il faut envoyer au serveur DNS.</p>' +
          '<ul class="ans">' + st.url.map(function (u) {
            return '<li class="' + (u.ok ? 'is-ok' : 'is-ko') + '">' + (u.ok ? OK : KO) + '<span><span class="mono">' + u.t + '</span>' + (u.fb ? '<small>' + u.fb + '</small>' : '<small>C’est le nom de domaine : c’est lui que le DNS traduit.</small>') + '</span></li>';
          }).join('') + '</ul>' +
          '<p><b>Étape 2.</b> Le dialogue avec le serveur DNS s’anime : question, recherche dans l’annuaire (ci-dessous), réponse <span class="mono">203.0.113.42</span>.</p>' +
          '<table class="t-sort dns-t"><thead><tr><th>Nom de domaine</th><th>Adresse IP</th></tr></thead><tbody>' + st.table.map(function (r) { return '<tr><td class="mono">' + r[0] + '</td><td class="mono">' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>' +
          '<p><b>Étape 3.</b> ' + st.then.q + '</p>' + qcmHtml(st.then);
        break;
      case 'route':
        body = '<p>Le paquet part du <b>routeur du FAI</b> ; l’élève touche successivement des routeurs <b>voisins</b> (ceux qui clignotent) jusqu’au <b>routeur de l’hébergeur</b>. Tout chemin valide est accepté, par exemple FAI → A → B → hébergeur, FAI → C → D → hébergeur ou FAI → C → E → hébergeur (3 sauts).</p>' +
          '<p><b>Manche 2 :</b> le premier routeur emprunté à la manche 1 tombe en <b>panne</b> ; l’élève doit le contourner (si la manche 1 est passée par A, il faut passer par C, et inversement).</p>' +
          '<p><b>Comptent comme erreurs :</b> toucher un routeur non voisin, un routeur déjà traversé, ou le routeur en panne. Une réponse par manche (2 en tout).</p>' +
          (st.fb ? '<p class="expl"><b>Bilan affiché :</b> ' + st.fb + '</p>' : '');
        break;
      case 'tcp':
        body = '<p>Les morceaux arrivent un à un dans le désordre : n° ' + st.arrivee.join(', n° ') + ' ; le n° ' + st.manque + ' manque. L’élève les range dans l’ordre en commençant par le n° 1 :</p>' +
          '<ol class="t-order">' + st.parts.map(function (p, i) { return '<li>' + p + (i + 1 === st.manque ? ' <i>(manquant, puis renvoyé)</i>' : '') + '</li>'; }).join('') + '</ol>' +
          '<p>Après le n° 2, la case n° 3 reste vide et la question suivante apparaît :</p><p class="ex-q">' + st.then.q + '</p>' + qcmHtml(st.then) +
          '<p>Le n° 3 arrive alors (« renvoyé ») et l’élève termine le rangement. Deux réponses comptent : le rangement sans erreur, et la question.</p>' +
          (st.fb ? '<p class="expl"><b>Bilan affiché :</b> ' + st.fb + '</p>' : '');
        break;
      case 'encaps': body = encapsHtml(); break;
      case 'journey': body = journeyHtml(); break;
    }
    return '<div class="ex' + (bonus ? ' is-bonus' : '') + '">' + head + q + body + '</div>';
  }

  /* ---------- Mission finale : construire le paquet ---------- */
  function encapsHtml() {
    var M = RX.MISSION, C = {};
    RX.COUCHES.forEach(function (c) { C[c.id] = c; });
    var out = '<p>Six décisions, chacune corrigée immédiatement (une réponse comptée par décision) :</p><ol class="enc-sol">';
    out += '<li><b>Le message (couche Application).</b> Quel message le navigateur envoie-t-il ?' + qcmHtml({ options: M.messages.map(function (m) { return { t: m.t + ' — ' + m.g, ok: m.ok, fb: m.fb }; }), code: true }) + '</li>';
    M.ordre.forEach(function (id, k) {
      var e = M.entetes[id];
      if (k < M.ordre.length - 1) {
        var rest = M.ordre.slice(k).map(function (x) { return M.entetes[x].nom; });
        out += '<li><b>Quelle enveloppe ajouter maintenant ?</b> Choix proposés : ' + rest.join(', ') + '. Réponse : <b>' + e.nom + '</b> (couche ' + e.couche + ') : on descend les couches dans l’ordre.</li>';
      } else {
        out += '<li class="note-li">(Il ne reste qu’une enveloppe, ' + e.nom + ', ajoutée sans question d’ordre.)</li>';
      }
      out += '<li><b>' + e.nom + ' : ' + e.q.charAt(0).toLowerCase() + e.q.slice(1) + '</b>' +
        (e.fixes ? ' <span class="muted">(déjà rempli : ' + e.fixes.map(function (f) { return f[0] + ' ' + f[1]; }).join(', ') + ')</span>' : '') +
        qcmHtml({ options: e.options, code: id !== 'acc' }) + '</li>';
    });
    out += '</ol><p><b>Le paquet terminé :</b></p>' + RX.fullPacket({ cls: 'pk-guide' }) +
      '<p class="muted">L’en-tête Wi-Fi indique aussi « De : ton ordinateur — Vers : routeur du gymnase ». Le numéro TCP « 1 » est une simplification (voir « Précisions scientifiques »).</p>';
    return out;
  }

  /* ---------- Mission finale : le voyage ---------- */
  function journeyHtml() {
    var V = RX.VOYAGE, N = NET;
    var rows = V.map(function (f, i) {
      var where = f.at ? f.at : (f.to || f.back).join(' → ');
      var q = f.q ? '<div class="jq"><b>Question :</b> ' + f.q.q + qcmHtml({ options: f.q.options, code: f.q.code }) + '<p><b>Puis :</b> ' + f.apres + '</p></div>' : '';
      return '<tr><td class="c-n">' + (i + 1) + '</td><td><b>' + f.t + '</b><div class="muted mono small">' + nodes(where) + '</div></td><td>' + f.d + q + '</td></tr>';
    }).join('');
    function nodes(s) {
      var names = { pc: 'ordinateur', ap: 'point d’accès', sw: 'switch', rg: 'routeur du gymnase', rf: 'routeur du FAI', rh: 'routeur de l’hébergeur', web: 'serveur Web' };
      return s.split(' → ').map(function (x) { return names[x] || 'routeur ' + x; }).join(' → ');
    }
    return '<p>L’élève avance étape par étape (bouton « Étape suivante ») ; Bip se déplace sur la carte et l’étiquette du paquet se met à jour (type de trame, adresses IP, port, message). Deux questions comptent.</p>' +
      '<table class="t-jr"><thead><tr><th>N°</th><th>Étape</th><th>Ce qu’affiche le site</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p><b>Évolution de l’étiquette.</b> Trame : Wi-Fi (ordinateur → point d’accès), Ethernet (jusqu’au routeur du gymnase), « fibre optique » sur les liaisons entre routeurs, Ethernet jusqu’au serveur. Adresse source : <span class="mono">' + N.pc + '</span> puis <span class="mono">' + N.rgPub + '</span> après le routeur du gymnase. Destination : <span class="mono">' + N.web + '</span> pendant tout l’aller. Au retour : <span class="mono">' + N.web + ' → ' + N.rgPub + '</span>, puis <span class="mono">→ ' + N.pc + '</span> après le routeur du gymnase. Le retour passe par un autre chemin (D, C) que l’aller (A, B).</p>';
  }

  /* ---------- Une partie complète ---------- */
  function partHtml(p, i) {
    var slides = p.slides.map(function (s, k) {
      return '<li>' + (s.devine ? '<span class="dv">À ton avis ?</span> ' + s.t : '<b>' + s.t + '</b>' + (s.extra ? ' <span class="muted">(pour aller plus loin, facultative)</span>' : '')) + '</li>';
    }).join('');
    var ex = p.steps.map(function (st, k) { return stepHtml(st, k + 1, false); }).join('');
    var bonus = p.bonus.map(function (st, k) { return stepHtml(st, k + 1, true); }).join('');
    var sec = el('<section class="page partie-g" style="--c:' + p.c + ';--ct:' + p.ct + '">' +
      '<header class="pg-h"><span class="pg-n">' + (i + 1) + '</span><div><p class="g-kicker">Partie ' + (i + 1) + ' sur ' + P.length + (p.finale ? ' · mission finale' : '') + '</p>' +
      '<h2>' + p.titre + '</h2><p class="pg-sub">' + p.sous + '</p></div>' +
      '<p class="pg-time"><b>' + p.duree + ' min</b><span>point prof ' + p.prof + ' min · élèves ' + (p.duree - p.prof - (i === 0 ? 1 : 0)) + ' min' + (i === 0 ? ' · accueil 1 min' : '') + '</span></p></header>' +
      '<div class="two pg-top"><div><h3 class="g-h3">Les cartes du point prof</h3><ol class="slides-l">' + slides + '</ol><div class="notes"></div></div>' +
      '<div><h3 class="g-h3">À retenir (mémo de la partie)</h3><div class="memo-p">' + p.memo.map(function (k) { return '<p><b>' + NOT[k].t + '.</b> ' + NOT[k].d + '</p>'; }).join('') + '</div></div></div>' +
      '<h3 class="g-h3 corr">Corrigé des exercices</h3>' + ex +
      (bonus ? '<h3 class="g-h3 corr bonus">Défi bonus</h3>' + bonus : '') +
      '</section>');
    var tpl = document.getElementById('notes-' + p.id);
    if (tpl) sec.querySelector('.notes').appendChild(tpl.content.cloneNode(true));
    return sec;
  }

  /* ---------- Montage ---------- */
  function fig(name) {
    if (name === 'qr') return el(RX.qrSvg(SITE, 'g-qr'));
    var st = name === 'map-mission' ? 'mission' : 'all';
    var m = RX.map.make({ state: st, layout: 'w', legend: true });
    return m.el;
  }

  function build(spriteHtml) {
    if (spriteHtml) document.body.insertAdjacentHTML('afterbegin', spriteHtml);
    $$('[data-site-url]').forEach(function (n) { n.textContent = SITE.replace(/^https?:\/\//, '').replace(/\/$/, ''); });
    $$('[data-fig]').forEach(function (n) { n.appendChild(fig(n.getAttribute('data-fig'))); });
    var host = $('[data-parties]');
    P.forEach(function (p, i) { host.parentNode.insertBefore(partHtml(p, i), host); });
    host.remove();
    $('[data-memo]').innerHTML = RX.typo(P.map(function (p, i) {
      return '<div class="mm"><h4>' + (i + 1) + ' · ' + p.titre + '</h4>' + p.memo.map(function (k) { return '<p><b>' + NOT[k].t + '.</b> ' + NOT[k].d + '</p>'; }).join('') + '</div>';
    }).join(''));
    // Typographie française partout
    $$('.page p, .page li, .page td, .page dd, .page h4, .cover p').forEach(function (n) {
      if (!n.querySelector('svg')) n.innerHTML = RX.typo(n.innerHTML);
    });
    var done = function () { requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(function () { window.__guideReady = true; }, 600); }); }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(done); else done();
  }

  fetch('../docs/index.html').then(function (r) { return r.text(); }).then(function (t) {
    var m = t.match(/<svg class="sprite"[\s\S]*?<\/svg>/);
    build(m ? m[0] : '');
  }).catch(function () { build(''); });
})();
