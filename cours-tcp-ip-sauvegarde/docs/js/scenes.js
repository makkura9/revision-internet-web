/* Paquet Express — illustrations des cartes d'explication et des exercices.
   Chaque scène renvoie un contrôleur { el, play(), ev(nom) } :
     play()     (re)lance l'animation de la scène
     ev('nom')  ajoute la classe .on-nom (un élément s'allume)            */
(function () {
  'use strict';
  var RX = window.RX, N = RX.NET, ico = RX.ico;

  function figure(name, inner, label) {
    return RX.h('<figure class="scene scene-' + name + '" role="img" aria-label="' + label + '">' + inner + '</figure>');
  }
  function replayBtn() {
    return '<button class="scene-replay" type="button" aria-label="Rejouer l’animation">' + ico('replay') + '</button>';
  }
  /** Relance les animations CSS d'une scène en retirant puis remettant .play */
  function controller(el, onPlay) {
    var c = {
      el: el,
      play: function () {
        el.classList.remove('play');
        void el.offsetWidth;
        el.classList.add('play');
        if (onPlay) onPlay();
      },
      ev: function (name) { el.classList.add('on-' + name); }
    };
    var b = el.querySelector('.scene-replay');
    if (b) b.addEventListener('click', c.play);
    return c;
  }

  /* Un paquet emballé : couches imbriquées (réutilisé partout).
     layers : liste de { id: 'acc'|'int'|'tra'|'app', h: titre, f: [[nom, valeur]…] }
     de la plus extérieure à la plus intérieure.                          */
  RX.packetHtml = function (layers, opts) {
    opts = opts || {};
    var html = '';
    for (var i = layers.length - 1; i >= 0; i--) {
      var l = layers[i];
      var fields = (l.f || []).map(function (f) {
        return '<span class="pk-f' + (f[2] ? ' ' + f[2] : '') + '"><em>' + f[0] + '</em><b>' + f[1] + '</b></span>';
      }).join('');
      html = '<div class="pk-l l-' + l.id + (l.cls ? ' ' + l.cls : '') + '" style="--d:' + (layers.length - 1 - i) + '">' +
        '<div class="pk-h"><span class="pk-n">' + l.h + (l.u ? '<i>' + l.u + '</i>' : '') + '</span>' + (fields ? '<span class="pk-fs">' + fields + '</span>' : '') + '</div>' +
        html + '</div>';
    }
    return '<div class="pk' + (opts.cls ? ' ' + opts.cls : '') + '">' + html + '</div>';
  };

  /* Le paquet complet de la mission (sert aux schémas et à la fiche). */
  RX.fullPacket = function (opts) {
    opts = opts || {};
    return RX.packetHtml([
      { id: 'acc', h: 'En-tête Wi-Fi', u: 'trame', f: [['MAC source', N.macPc], ['MAC destination', N.macRg]] },
      { id: 'int', h: 'En-tête IP', u: 'paquet', f: [['IP source', N.pc], ['IP destination', N.web]] },
      { id: 'tra', h: 'En-tête TCP', u: 'segment', f: [['Port source', N.portSrc], ['Port destination', '80'], ['N°', '1']] },
      { id: 'app', h: 'Message HTTP', u: 'message', f: [['', 'GET / HTTP/1.1'], ['', 'Host: ' + N.domaine]] }
    ], opts);
  };

  var B = {};

  /* ---------- La carte ---------- */
  B.map = function (cfg) {
    var m = RX.map.make({ state: cfg.state || 'all', legend: cfg.legend });
    m.play = function () {
      var st = RX.map.PRESETS[cfg.state] || {};
      if (cfg.state === 'mission' && st.route) {
        m.set({ bip: null });
        m.set({ bip: 'pc' });
      }
    };
    m.ev = function () {};
    return m;
  };

  /* ---------- Le DNS : la question, l'annuaire, la réponse ---------- */
  B.dnschat = function (cfg) {
    var rows = (cfg && cfg.table) || [
      ['www.pigeon-voyageur.example', N.web],
      ['mail.pigeon-voyageur.example', N.web],
      ['photos.pigeon-voyageur.example', N.photos]
    ];
    var html = replayBtn() +
      '<div class="dns-who"><span class="dns-ava">' + ico('laptop') + '</span><span><b>Ton ordinateur</b><span class="mono">' + N.pc + '</span></span></div>' +
      '<p class="dns-msg m-q">Quelle est l’adresse IP de <span class="q-ph">…</span><b class="q-dom">' + N.domaine + '</b> ?</p>' +
      '<div class="dns-who r"><span><b>Serveur DNS du FAI</b><span class="mono">' + N.dns + '</span></span><span class="dns-ava">' + ico('book') + '</span></div>' +
      '<div class="dns-book"><p class="dns-book-t">' + ico('book') + 'L’annuaire du serveur DNS</p><table class="dns-table"><thead><tr><th>Nom de domaine</th><th>Adresse IP</th></tr></thead><tbody>' +
      rows.map(function (r, i) { return '<tr class="r' + i + '"><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<p class="dns-msg m-a">C’est <b>' + N.web + '</b> !</p>';
    var el = figure('dnschat', html, 'Dialogue entre ton ordinateur et le serveur DNS : la question, l’annuaire, puis la réponse 203.0.113.42');
    var c = controller(el);
    if (!cfg || !cfg.wait) RX.wait(250, c.play);
    return c;
  };

  /* ---------- Adresses privées et adresse publique ---------- */
  B.natview = function () {
    function dev(id, x, y, ip) {
      return '<use href="#i-' + id + '" x="' + (x - 17) + '" y="' + (y - 17) + '" width="34" height="34"/>' +
        '<text class="nv-ip" x="' + x + '" y="' + (y + 31) + '">' + ip + '</text>';
    }
    var rx = 212, ry = 172;
    var svg = '<svg viewBox="0 0 360 252">' +
      '<rect class="nv-lan" x="6" y="22" width="' + rx + '" height="222" rx="16"/>' +
      '<rect class="nv-tab" x="16" y="10" width="114" height="24" rx="12"/><text class="nv-tab-t" x="73" y="26.500">LAN du gymnase</text>' +
      '<text class="nv-k" x="104" y="58">Adresses privées</text>' +
      '<path class="nv-l" d="M48 92L' + rx + ' ' + ry + 'M150 92L' + rx + ' ' + ry + 'M48 172L' + rx + ' ' + ry + '"/>' +
      '<path class="nv-l nv-out" d="M' + rx + ' ' + ry + 'H300"/>' +
      dev('laptop', 48, 90, N.pc) + dev('phone', 150, 90, '192.168.10.45') + dev('laptop', 48, 170, N.pc2) +
      '<g class="nv-r"><circle cx="' + rx + '" cy="' + ry + '" r="23"/><use href="#i-router" x="' + (rx - 23) + '" y="' + (ry - 23) + '" width="46" height="46"/></g>' +
      '<text class="nv-name" x="' + (rx + 30) + '" y="132">Routeur</text><text class="nv-name" x="' + (rx + 30) + '" y="146">du gymnase</text>' +
      '<g class="nv-tag t-priv"><rect x="' + (rx - 100) + '" y="204" width="96" height="22" rx="11"/><text x="' + (rx - 52) + '" y="219">' + N.rgLan + '</text></g>' +
      '<text class="nv-k2" x="' + (rx - 52) + '" y="240">côté LAN</text>' +
      '<g class="nv-tag t-pub"><rect x="' + (rx + 6) + '" y="204" width="104" height="22" rx="11"/><text x="' + (rx + 58) + '" y="219">' + N.rgPub + '</text></g>' +
      '<text class="nv-k2" x="' + (rx + 58) + '" y="240">côté Internet</text>' +
      '<use href="#i-globe" x="298" y="150" width="44" height="44"/>' +
      '<text class="nv-name" x="320" y="140">Internet</text>' +
      '<text class="nv-k" x="292" y="58">Adresse publique</text><text class="nv-k2" x="292" y="72">fournie par le FAI</text>' +
      '</svg>';
    var el = figure('natview', svg, 'Le LAN du gymnase avec ses adresses privées ; le routeur du gymnase a une adresse privée côté LAN (192.168.10.1) et une adresse publique côté Internet (198.51.100.7)');
    return controller(el);
  };

  /* ---------- Une page découpée en paquets ---------- */
  B.split = function () {
    var pk = '';
    for (var i = 0; i < 15; i++) {
      var x = 150 + (i % 5) * 41, y = 34 + Math.floor(i / 5) * 46;
      pk += '<g class="sp-p" style="--i:' + i + '"><rect class="sp-b" x="' + x + '" y="' + y + '" width="34" height="34" rx="6"/>' +
        '<rect class="sp-h" x="' + x + '" y="' + y + '" width="34" height="10" rx="3"/>' +
        '<text x="' + (x + 17) + '" y="' + (y + 27) + '">' + (i + 1) + '</text></g>';
    }
    var svg = '<svg viewBox="0 0 360 200">' + replaySvg() +
      '<use class="sp-doc" href="#i-doc" x="14" y="48" width="84" height="84"/>' +
      '<text class="sp-t" x="56" y="152">Page Web</text><text class="sp-s" x="56" y="168">2 Mo</text>' +
      '<path class="sp-arrow" d="M106 90h28m-8-7 8 7-8 7"/>' +
      pk +
      '<text class="sp-more" x="252" y="186">… et plus de 1000 autres</text>' +
      '</svg>';
    var el = figure('split', svg, 'Une page Web de 2 Mo découpée en plus d’un millier de petits paquets numérotés, chacun avec son étiquette');
    var c = controller(el);
    RX.wait(150, c.play);
    return c;
  };
  function replaySvg() { return ''; }

  /* ---------- La table de routage d'un routeur ---------- */
  B.table = function () {
    var html = replayBtn() +
      '<div class="rt-in"><span class="rt-pk">' + ico('mail') + '<span>Paquet pour <b>' + N.web + '</b></span></span></div>' +
      '<div class="rt-box"><div class="rt-head"><span class="rt-ico">' + ico('router') + '</span><span><b>Routeur A</b><small>sa table de routage</small></span></div>' +
      '<table class="rt-table"><thead><tr><th>Destination</th><th>Envoyer vers</th></tr></thead><tbody>' +
      '<tr class="rt-hit"><td>203.0.113.…</td><td>routeur B</td></tr>' +
      '<tr><td>198.51.100.…</td><td>routeur du FAI</td></tr>' +
      '<tr><td>autres adresses</td><td>routeur C</td></tr>' +
      '</tbody></table></div>' +
      '<p class="rt-out">' + ico('next') + '<span>Direction <b>routeur B</b>, puis le routeur B fera de même.</span></p>';
    var el = figure('table', html, 'Un paquet pour 203.0.113.42 arrive au routeur A : sa table de routage indique de l’envoyer au routeur B');
    var c = controller(el);
    RX.wait(200, c.play);
    return c;
  };

  /* ---------- Accusés de réception (TCP) ---------- */
  B.acks = function () {
    var lines = [
      // [y, sens (1 : serveur → toi), texte, classe]
      [46, 1, 'n° 1', ''],
      [72, -1, 'reçu : n° 1', 'ack'],
      [100, 1, 'n° 2', 'lost'],
      [126, 1, 'n° 3', ''],
      [152, -1, 'reçu : n° 3, il manque le 2 !', 'ack warn'],
      [180, 1, 'n° 2 (renvoyé)', 'resend'],
      [206, -1, 'reçu : tout est là', 'ack ok']
    ];
    var xl = 70, xr = 290;
    var svg = '<svg viewBox="0 0 360 226">' +
      '<text class="ak-who" x="' + xl + '" y="16">Serveur</text><text class="ak-who" x="' + xr + '" y="16">Ton ordinateur</text>' +
      '<path class="ak-life" d="M' + xl + ' 24V220M' + xr + ' 24V220"/>' +
      lines.map(function (l, i) {
        var y = l[0], to = l[1] > 0 ? xr - 6 : xl + 6, from = l[1] > 0 ? xl : xr;
        var lost = l[3].indexOf('lost') >= 0;
        var end = lost ? (xl + xr) / 2 + 10 : to;
        var head = lost ? '' : (l[1] > 0
          ? '<path class="ak-head" d="M' + to + ' ' + y + 'l-9-5v10z"/>'
          : '<path class="ak-head" d="M' + to + ' ' + y + 'l9-5v10z"/>');
        return '<g class="ak-m ' + l[3] + '" style="--i:' + i + '">' +
          '<path class="ak-line" d="M' + from + ' ' + y + 'H' + end + '"/>' + head +
          (lost ? '<path class="ak-x" d="M' + (end - 6) + ' ' + (y - 6) + 'l12 12m0-12l-12 12"/>' : '') +
          '<text class="ak-t" x="' + (xl + xr) / 2 + '" y="' + (y - 5) + '">' + l[2] + '</text></g>';
      }).join('') +
      '</svg>';
    var el = figure('acks', replayBtn() + svg, 'Échange TCP : le serveur envoie les paquets 1, 2 et 3 ; le 2 se perd ; ton ordinateur signale qu’il manque, le serveur le renvoie');
    var c = controller(el);
    RX.wait(200, c.play);
    return c;
  };

  /* ---------- Les ports : les portes du serveur ---------- */
  B.ports = function (cfg) {
    var doors = [['25', 'Messagerie', 'mail'], ['80', 'Site Web', 'browser'], ['443', 'Site Web', 'browser']];
    var svg = '<svg viewBox="0 0 360 214">' +
      '<rect class="po-bld" x="126" y="30" width="226" height="172" rx="14"/>' +
      '<rect class="po-roof" x="126" y="30" width="226" height="34" rx="14"/>' +
      '<text class="po-t" x="239" y="52">Serveur ' + N.web + '</text>' +
      doors.map(function (d, i) {
        var x = 136 + i * 70;
        return '<g class="po-door d' + d[0] + '"><rect class="po-d" x="' + x + '" y="96" width="64" height="106" rx="6"/>' +
          '<rect class="po-num" x="' + (x + 12) + '" y="104" width="40" height="20" rx="10"/><text class="po-n" x="' + (x + 32) + '" y="118.500">' + d[0] + '</text>' +
          '<use href="#i-' + d[2] + '" x="' + (x + 16) + '" y="132" width="32" height="32"/>' +
          '<text class="po-l" x="' + (x + 32) + '" y="180">' + d[1] + '</text>' +
          (d[0] === '443' ? '<text class="po-l s" x="' + (x + 32) + '" y="193">sécurisé</text>' : '') + '</g>';
      }).join('') +
      '<g class="po-pk"><rect x="6" y="122" width="112" height="44" rx="10"/>' +
      '<text class="po-pk1" x="62" y="140">→ ' + N.web + '</text><text class="po-pk2" x="62" y="157">port 80</text></g>' +
      '</svg>';
    var el = figure('ports', (cfg && cfg.still ? '' : replayBtn()) + svg, 'Le serveur 203.0.113.42 et ses portes numérotées : 25 pour la messagerie, 80 pour le site Web, 443 pour le site Web sécurisé. Un paquet pour le port 80 entre par la porte 80.');
    if (cfg && cfg.still) el.classList.add('still');
    var c = controller(el);
    if (!cfg || !cfg.still) RX.wait(200, c.play);
    return c;
  };

  /* ---------- La poignée de main TCP ---------- */
  B.handshake = function () {
    var xl = 70, xr = 290;
    var msgs = [[54, 1, 'SYN', '« On peut se parler ? »'], [94, -1, 'SYN-ACK', '« Oui, je suis prêt ! »'], [134, 1, 'ACK', '« C’est parti ! »']];
    var svg = '<svg viewBox="0 0 360 186">' +
      '<text class="ak-who" x="' + xl + '" y="16">Ton ordinateur</text><text class="ak-who" x="' + xr + '" y="16">Serveur</text>' +
      '<path class="ak-life" d="M' + xl + ' 24V180M' + xr + ' 24V180"/>' +
      msgs.map(function (m, i) {
        var y = m[0], from = m[1] > 0 ? xl : xr, to = m[1] > 0 ? xr - 6 : xl + 6;
        var head = m[1] > 0 ? '<path class="ak-head" d="M' + to + ' ' + y + 'l-9-5v10z"/>' : '<path class="ak-head" d="M' + to + ' ' + y + 'l9-5v10z"/>';
        return '<g class="ak-m hs" style="--i:' + i + '"><path class="ak-line" d="M' + from + ' ' + y + 'H' + to + '"/>' + head +
          '<text class="ak-t b" x="180" y="' + (y - 6) + '">' + m[2] + '</text><text class="ak-t" x="180" y="' + (y + 15) + '">' + m[3] + '</text></g>';
      }).join('') +
      '<g class="ak-m hs data" style="--i:3"><path class="ak-line" d="M' + (xl + 6) + ' 166H' + (xr - 6) + '"/><path class="ak-head" d="M' + (xr - 6) + ' 166l-9-5v10zM' + (xl + 6) + ' 166l9-5v10z"/>' +
      '<text class="ak-t" x="180" y="160">les données circulent</text></g>' +
      '</svg>';
    var el = figure('handshake', replayBtn() + svg, 'La poignée de main TCP : SYN, SYN-ACK, ACK, puis les données circulent');
    var c = controller(el);
    RX.wait(200, c.play);
    return c;
  };

  /* ---------- Les 4 couches ---------- */
  B.layers = function () {
    var html = '<div class="ly">' + RX.COUCHES.map(function (c, i) {
      return '<div class="ly-row l-' + c.id + '" style="--i:' + i + '">' +
        '<span class="ly-n"><b>' + c.nom + '</b><small>' + c.metier + '</small></span>' +
        '<span class="ly-p">' + c.proto + '</span>' +
        '<span class="ly-d">' + c.d + '</span></div>';
    }).join('') + '</div>' +
      '<p class="ly-foot"><span>' + ico('laptop') + 'Le programme (navigateur)</span><span>Le câble, les ondes ' + ico('ap') + '</span></p>';
    var el = figure('layers', replayBtn() + html, 'Les 4 couches du modèle TCP/IP : Application, Transport, Internet, Accès réseau');
    var c = controller(el);
    RX.wait(150, c.play);
    return c;
  };

  /* ---------- L'encapsulation, couche après couche ---------- */
  B.encaps = function () {
    var html = replayBtn() + RX.fullPacket({ cls: 'pk-anim' }) +
      '<p class="enc-steps"><span class="l-app">message</span>→<span class="l-tra">segment</span>→<span class="l-int">paquet</span>→<span class="l-acc">trame</span></p>';
    var el = figure('encaps', html, 'Encapsulation : le message HTTP est emballé dans un segment TCP, lui-même dans un paquet IP, lui-même dans une trame Wi-Fi');
    var c = controller(el);
    RX.wait(150, c.play);
    return c;
  };

  /* ---------- Au routeur : nouvelle trame ; au serveur : on déballe tout ---------- */
  B.decaps = function () {
    function mini(outer, cls) {
      return RX.packetHtml([
        { id: 'acc', h: outer, cls: cls || '' },
        { id: 'int', h: 'IP → ' + N.web },
        { id: 'tra', h: 'TCP → port 80' },
        { id: 'app', h: 'HTTP · GET /' }
      ], { cls: 'pk-mini' });
    }
    var html = replayBtn() +
      '<div class="dc-row"><p class="dc-k">' + ico('router') + 'À chaque routeur</p>' +
      '<div class="dc-flow">' + mini('Trame Ethernet', 'old') +
      '<span class="dc-op"><b>retire la trame</b><small>lit l’IP de destination</small></span>' +
      mini('Trame · fibre optique', 'new') + '</div></div>' +
      '<div class="dc-row"><p class="dc-k">' + ico('server') + 'Au serveur</p>' +
      '<ol class="dc-open"><li class="l-acc">Trame</li><li class="l-int">IP</li><li class="l-tra">TCP</li><li class="l-app">HTTP</li></ol></div>';
    var el = figure('decaps', html, 'À chaque routeur, la trame est retirée puis remplacée par une nouvelle ; au serveur, les enveloppes sont retirées une à une jusqu’au message HTTP');
    var c = controller(el);
    RX.wait(150, c.play);
    return c;
  };

  RX.scenes = {
    make: function (cfg) {
      var s = B[cfg.name](cfg);
      if (cfg.ev) s.ev(cfg.ev);
      return s;
    }
  };
})();
