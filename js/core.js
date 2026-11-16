/* Requête Express — outils communs et sauvegarde locale */
(function () {
  'use strict';
  var RX = (window.RX = window.RX || {});

  /** Typographie française : espaces insécables avant ? ! : ; » et après «,
      pour qu'un signe ne se retrouve jamais seul en début de ligne.
      (\u2060 est un « gluon » invisible qui interdit le retour à la ligne.) */
  RX.typo = function (s) {
    return String(s)
      .replace(/ ([?!:;»])/g, '\u00a0$1')
      .replace(/« /g, '«\u00a0')
      .replace(/\b(Wi|e)-(Fi|mail)\b/g, '$1-\u2060$2'); // pas de coupure dans Wi-Fi ni e-mail
  };

  /** Crée un élément à partir d'une chaîne HTML. */
  RX.h = function (html) {
    var t = document.createElement('template');
    t.innerHTML = RX.typo(html.trim());
    return t.content.firstElementChild;
  };

  /** Icône de la bibliothèque (voir le <svg class="sprite"> dans index.html). */
  RX.ico = function (id, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>';
  };

  RX.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  RX.shuffle = function (list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  RX.pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };

  RX.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Étoiles obtenues pour un score (1 à 3 dès que la mission est terminée). */
  RX.starsFor = function (earned, total) {
    var p = total ? earned / total : 0;
    return p >= 0.9 ? 3 : p >= 0.65 ? 2 : 1;
  };

  RX.starsHtml = function (n, max) {
    var out = '<span class="stars" role="img" aria-label="' + n + ' étoile' + (n > 1 ? 's' : '') + ' sur ' + (max || 3) + '">';
    for (var i = 0; i < (max || 3); i++) out += RX.ico('star', 'star' + (i < n ? '' : ' off'));
    return out + '</span>';
  };

  /* ---------- Sauvegarde (uniquement sur l'appareil de l'élève) ---------- */
  var KEY = 'requete-express-v1';
  RX.store = {
    load: function () {
      try {
        var s = JSON.parse(localStorage.getItem(KEY));
        if (s && s.v === 1 && s.res) return s;
      } catch (e) { /* stockage indisponible : on repart de zéro */ }
      return { v: 1, nom: '', res: {} };
    },
    save: function (s) {
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* navigation privée */ }
    },
    clear: function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* rien à effacer */ }
    }
  };

  /** Adresse publique du site : sert au lien et au QR code de la synthèse. */
  RX.siteUrl = function () {
    var l = window.location;
    var local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(l.hostname) || l.hostname === '';
    if (/^https?:$/.test(l.protocol) && !local) {
      return l.origin + l.pathname.replace(/index\.html$/, '');
    }
    return RX.SITE.url;
  };

  /** QR code en SVG (net à l'impression). */
  RX.qrSvg = function (text, cls) {
    var qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount(), q = 2, size = n + q * 2, d = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + (c + q) + ' ' + (r + q) + 'h1v1h-1z';
      }
    }
    return '<svg class="qr ' + (cls || '') + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="QR code vers ' + RX.esc(text) + '" shape-rendering="crispEdges">' +
      '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  };
})();
