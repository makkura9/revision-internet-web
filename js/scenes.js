/* Requête Express — illustrations animées des missions.
   Chaque scène est un petit dessin (SVG ou HTML) piloté par des classes CSS :
     scene.ev('nom')      ajoute la classe .on-nom   (un élément s'allume)
     scene.state('nom')   change data-state          (changement de plan)
     scene.hl(id)         fait clignoter une cible   (schéma à légender)
     scene.label(id, t)   écrit une légende                                */
(function () {
  'use strict';
  var RX = (window.RX = window.RX || {});

  function controller(el) {
    return {
      el: el,
      ev: function (name) { el.classList.add('on-' + name); },
      state: function (s) { el.setAttribute('data-state', s); },
      hl: function (id) {
        el.querySelectorAll('.hl').forEach(function (n) { n.classList.remove('hl'); });
        var t = id && el.querySelector('[data-t="' + id + '"]');
        if (t) t.classList.add('hl');
      },
      label: function (id, text) {
        var t = el.querySelector('[data-t="' + id + '"]');
        var l = el.querySelector('[data-l="' + id + '"]');
        if (l) l.textContent = text;
        if (t) t.classList.add('set');
      }
    };
  }

  function figure(name, inner, label) {
    return RX.h('<figure class="scene scene-' + name + '" role="img" aria-label="' + label + '">' + inner + '</figure>');
  }

  var B = {};

  /* ---------- Mission 1 : un réseau qui se construit ---------- */
  B.net = function () {
    var links = [
      ['cable', 'M94 104H276'],
      ['wave', 'M84 80Q112 44 160 38'],
      ['wave', 'M200 38Q248 44 276 80'],
      ['cable', 'M84 126Q110 160 157 166'],
      ['cable', 'M203 166Q250 160 276 128']
    ];
    var svg = '<svg viewBox="0 0 360 200">' +
      '<g class="net-links">' + links.map(function (l) {
        return '<path class="lk ' + l[0] + '" pathLength="1" d="' + l[1] + '"/>';
      }).join('') + '</g>' +
      '<g class="net-packets">' + links.map(function (l, i) {
        return '<rect class="pk" x="-5" y="-5" width="10" height="10" rx="3">' +
          '<animateMotion dur="' + (1.9 + i * 0.35) + 's" begin="' + (i * 0.4) + 's" repeatCount="indefinite" ' +
          (i % 2 ? 'keyPoints="1;0" keyTimes="0;1" calcMode="linear" ' : '') + 'path="' + l[1] + '"/></rect>';
      }).join('') + '</g>' +
      '<g class="net-dev net-main"><use href="#i-laptop" x="34" y="76" width="56" height="56"/></g>' +
      '<g class="net-dev net-other" style="--i:0"><use href="#i-phone" x="152" y="10" width="56" height="56"/></g>' +
      '<g class="net-dev net-other" style="--i:1"><use href="#i-server" x="270" y="76" width="56" height="56"/></g>' +
      '<g class="net-dev net-other" style="--i:2"><use href="#i-printer" x="152" y="136" width="56" height="56"/></g>' +
      '<g class="net-q"><circle cx="98" cy="68" r="13"/><text x="98" y="73.500">?</text></g>' +
      '<g class="net-talk t1"><rect x="14" y="142" width="66" height="26" rx="13"/><text x="47" y="159.500">Prêt ?</text></g>' +
      '<g class="net-talk t2"><rect x="282" y="40" width="66" height="26" rx="13"/><text x="315" y="57.500">Reçu !</text></g>' +
      '</svg>';
    return figure('net', svg, 'Un ordinateur isolé qui devient un réseau au fil de tes réponses');
  };

  /* ---------- Mission 2 : du LAN à Internet, en dézoomant ---------- */
  B.zoom = function () {
    var hubs = [[120, 100], [240, 92], [182, 34]];
    var lans = [
      [44, 80, 0], [134, 152, 0],
      [300, 40, 1], [312, 128, 1], [232, 160, 1],
      [118, 26, 2], [250, 22, 2]
    ];
    var home = [52, 140];
    var s = '<svg viewBox="0 0 360 190"><g class="zw">';
    s += '<g class="z-wan">';
    s += '<path class="zb" d="M120 100L240 92M120 100L182 34M240 92L182 34"/>';
    s += '<path class="zl" d="M' + home[0] + ' ' + home[1] + 'L120 100' + lans.map(function (l) {
      return 'M' + l[0] + ' ' + l[1] + 'L' + hubs[l[2]][0] + ' ' + hubs[l[2]][1];
    }).join('') + '"/></g>';
    s += '<g class="z-hubs">' + hubs.map(function (h) {
      return '<rect class="zh" x="' + (h[0] - 7) + '" y="' + (h[1] - 7) + '" width="14" height="14" rx="3" transform="rotate(45 ' + h[0] + ' ' + h[1] + ')"/>';
    }).join('') + '</g>';
    function lan(x, y, cls) {
      return '<g class="z-lan ' + (cls || '') + '"><circle class="zc" cx="' + x + '" cy="' + y + '" r="17"/>' +
        '<g class="z-dots"><circle cx="' + (x - 6) + '" cy="' + (y - 3) + '" r="2.600"/><circle cx="' + (x + 6) + '" cy="' + (y - 3) + '" r="2.600"/><circle cx="' + x + '" cy="' + (y + 6) + '" r="2.600"/></g></g>';
    }
    s += lans.map(function (l) { return lan(l[0], l[1]); }).join('');
    s += lan(home[0], home[1], 'z-home');
    // L'intérieur de la maison, visible seulement en gros plan
    s += '<g class="z-detail">' +
      '<path class="zd-l" d="M52 140.500L43.500 130.500M52 140.500L61 131.500M52 140.500L52 151.500"/>' +
      '<rect class="zd-box" x="47" y="138" width="10" height="5" rx="1.500"/>' +
      '<rect class="zd-dev" x="39.500" y="127.500" width="8" height="5.500" rx="1"/>' +
      '<rect class="zd-dev" x="59" y="127.500" width="4.500" height="7.500" rx="1"/>' +
      '<rect class="zd-dev" x="48" y="149.500" width="8" height="5.500" rx="1"/>' +
      '</g>';
    s += '</g></svg>';
    s += '<div class="zoom-caps"><p class="zoom-cap c-lan"><b>LAN</b> le réseau local de la maison</p>' +
      '<p class="zoom-cap c-wan"><b>WAN</b> il relie les LAN entre eux</p>' +
      '<p class="zoom-cap c-internet"><b>Internet</b> un réseau de réseaux</p></div>';
    return figure('zoom', s, 'Vue qui dézoome : un réseau local, puis les réseaux étendus, puis Internet');
  };

  /* ---------- Mission 3 : la box vue de l'intérieur ---------- */
  B.box = function () {
    var svg = '<svg viewBox="0 0 360 210">' +
      '<g class="bx-net"><use href="#i-cloud" x="34" y="0" width="100" height="66"/><text class="bx-t" x="84" y="45">Internet</text></g>' +
      '<path class="bx-link l-modem" d="M84 84V59"/>' +
      '<text class="bx-s s-modem" x="94" y="74">WAN de l’opérateur</text>' +
      '<path class="bx-ant" d="M262 74l-7-22M296 74l7-22"/>' +
      '<rect class="bx-body" x="28" y="74" width="304" height="62" rx="16"/>' +
      '<g class="bx-mod m-modem"><rect x="40" y="84" width="88" height="42" rx="9"/><text class="q" x="84" y="113">?</text>' +
      '<text class="nm" x="84" y="102">Modem-</text><text class="nm" x="84" y="116">routeur</text></g>' +
      '<g class="bx-mod m-switch"><rect x="136" y="84" width="88" height="42" rx="9"/><text class="q" x="180" y="113">?</text>' +
      '<text class="nm" x="180" y="109.500">Switch</text></g>' +
      '<g class="bx-mod m-ap"><rect x="232" y="84" width="88" height="42" rx="9"/><text class="q" x="276" y="113">?</text>' +
      '<text class="nm" x="276" y="102">Point d’accès</text><text class="nm" x="276" y="116">Wi-Fi</text></g>' +
      '<path class="bx-link l-switch" d="M168 126C168 152 148 144 148 164"/>' +
      '<path class="bx-link l-switch" d="M192 126C192 152 214 144 214 164"/>' +
      '<use class="bx-dev d-switch" href="#i-laptop" x="126" y="162" width="44" height="44"/>' +
      '<use class="bx-dev d-switch" href="#i-printer" x="192" y="162" width="44" height="44"/>' +
      '<g class="bx-waves"><path d="M267 141a9 9 0 0 0 18 0"/><path d="M259 143a17 17 0 0 0 34 0"/></g>' +
      '<use class="bx-dev d-ap" href="#i-phone" x="256" y="166" width="40" height="40"/>' +
      '<use class="bx-dev d-ap" href="#i-laptop" x="302" y="164" width="44" height="44"/>' +
      '</svg>';
    return figure('box', svg, 'Une box Internet et ses trois appareils internes');
  };

  /* ---------- Mission 3 : Wi-Fi ou 4G/5G, deux chemins ---------- */
  B.acces = function () {
    var svg = '<svg viewBox="0 0 360 190">' +
      '<g class="ac-lan"><rect x="6" y="86" width="166" height="86" rx="18"/>' +
      '<rect class="tab" x="62" y="162" width="54" height="20" rx="10"/><text x="89" y="176">LAN</text></g>' +
      '<g class="ac-p p-wifi"><path class="dot" d="M62 120H104"/><path d="M160 124H200"/></g>' +
      '<g class="ac-p p-g4"><path class="dot" d="M44 94Q56 44 106 38"/><path d="M158 40Q214 44 232 88"/></g>' +
      '<path class="ac-p p-out" d="M278 114H300"/>' +
      '<rect class="ac-pk k-wifi" x="-5" y="-5" width="10" height="10" rx="3"><animateMotion dur="2.800s" repeatCount="indefinite" path="M60 120L132 124L238 112L324 116"/></rect>' +
      '<rect class="ac-pk k-g4" x="-5" y="-5" width="10" height="10" rx="3"><animateMotion dur="2.800s" repeatCount="indefinite" path="M44 94Q56 44 132 36Q214 44 238 112L324 116"/></rect>' +
      '<use class="ac-d d-me" href="#i-phone" x="14" y="96" width="48" height="48"/><text class="ac-t" x="38" y="158">Toi</text>' +
      '<g class="ac-d d-box"><use href="#i-box" x="106" y="96" width="52" height="52"/><text class="ac-t" x="132" y="158">Box</text></g>' +
      '<g class="ac-d d-ant"><use href="#i-antenna" x="106" y="10" width="52" height="52"/><text class="ac-t" x="132" y="76">Antenne</text></g>' +
      '<g class="ac-d d-fai"><use href="#i-cloud" x="196" y="78" width="84" height="56"/><text class="ac-t in" x="238" y="117">FAI</text></g>' +
      '<g class="ac-d d-net"><use href="#i-globe" x="300" y="92" width="48" height="48"/><text class="ac-t" x="324" y="158">Internet</text></g>' +
      '</svg>';
    return figure('acces', svg, 'Deux chemins vers Internet : par la box en Wi-Fi, ou par l’antenne en 4G/5G');
  };

  /* ---------- Mission 4 : Internet, un câble qui transporte plusieurs services ---------- */
  B.tube = function () {
    var lanes = [
      ['mail', 'mail', 'Courrier électronique'],
      ['ftp', 'folder', 'Échange de fichiers (FTP)'],
      ['stream', 'play', 'Streaming'],
      ['web', 'web', 'Web']
    ];
    var svg = '<svg viewBox="0 0 360 196">' +
      '<rect class="tb-tab" x="30" y="6" width="118" height="40" rx="12"/><text class="tb-title" x="89" y="27">INTERNET</text>' +
      '<rect class="tb-body" x="14" y="32" width="332" height="156" rx="26"/>' +
      lanes.map(function (l, i) {
        var y = 44 + i * 34;
        return '<g class="tb-lane l-' + l[0] + '"><rect x="26" y="' + y + '" width="308" height="28" rx="14"/>' +
          '<text class="q" x="180" y="' + (y + 19.500) + '">?</text>' +
          '<use href="#i-' + l[1] + '" x="34" y="' + (y + 2) + '" width="24" height="24"/>' +
          '<text class="nm" x="66" y="' + (y + 18.500) + '">' + l[2] + '</text>' +
          '<path class="flow" d="M246 ' + (y + 14) + 'H320"/></g>';
      }).join('') +
      '</svg>';
    return figure('tube', svg, 'Internet représenté comme un câble transportant plusieurs services');
  };

  /* ---------- Mission 5 : le client, le serveur et leurs échanges ---------- */
  B.cs = function () {
    function slot(id, x, y) {
      return '<g class="cs-slot"><rect x="' + x + '" y="' + y + '" width="96" height="24" rx="12"/><text data-l="' + id + '" x="' + (x + 48) + '" y="' + (y + 16.500) + '">?</text></g>';
    }
    var svg = '<svg viewBox="0 0 360 200">' +
      '<g class="cs-t" data-t="client">' +
        '<rect class="main" x="14" y="36" width="128" height="104" rx="10"/>' +
        '<path class="ln" d="M14 56h128"/><circle class="d" cx="25" cy="46" r="2.600"/><circle class="d" cx="34" cy="46" r="2.600"/>' +
        '<rect class="addr" x="24" y="64" width="108" height="14" rx="7"/>' +
        '<g class="pg"><rect class="pg-h" x="24" y="86" width="64" height="9" rx="2"/><path class="ln" d="M24 105h108M24 115h96M24 125h58"/></g>' +
        slot('client', 30, 152) +
      '</g>' +
      '<g class="cs-t" data-t="serveur">' +
        [0, 1, 2].map(function (i) {
          var y = 36 + i * 36;
          return '<rect class="main" x="244" y="' + y + '" width="100" height="30" rx="8"/><circle class="led" cx="259" cy="' + (y + 15) + '" r="4.500"/><path class="ln" d="M296 ' + (y + 15) + 'h34"/>';
        }).join('') +
        slot('serveur', 246, 152) +
      '</g>' +
      '<g class="cs-t" data-t="requete"><g class="cs-req"><path class="main" d="M152 60h56V50l26 18-26 18V76h-56z"/></g>' + slot('requete', 145, 14) + '</g>' +
      '<g class="cs-t" data-t="reponse"><g class="cs-res"><path class="main" d="M234 104h-56V94l-26 18 26 18v-10h56z"/></g>' + slot('reponse', 145, 152) + '</g>' +
      '<g class="cs-pk k1"><use href="#i-mail" x="150" y="56" width="24" height="24"/></g>' +
      '<g class="cs-pk k2"><use href="#i-doc" x="212" y="100" width="24" height="24"/></g>' +
      '</svg>';
    return figure('cs', svg, 'Schéma : un navigateur et un serveur reliés par deux flèches');
  };

  /* ---------- Mission 6 : une page qui s'améliore en direct ---------- */
  B.lab = function () {
    var pigeon = '<svg viewBox="0 0 84 60" aria-hidden="true"><g stroke="#14132B" stroke-width="2.500" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="M18 34L4 27l3 14z" fill="#8E97B8"/><ellipse cx="40" cy="34" rx="23" ry="14" fill="#C3C9DE"/>' +
      '<circle cx="62" cy="19" r="10" fill="#C3C9DE"/><path d="M71 17l10 4-10 3z" fill="#FFA940"/>' +
      '<path d="M26 33q13-14 26 0q-13 9-26 0z" fill="#8E97B8"/><path d="M35 48v8M44 48v8" fill="none"/></g>' +
      '<circle cx="64" cy="17" r="2" fill="#14132B"/></svg>';
    var html = '<div class="mb">' +
      '<div class="mb-bar"><i></i><i></i><i></i><span class="mb-url">pigeon-voyageur.ch</span></div>' +
      '<div class="mb-page lab-page">' +
        '<h3 class="lab-h">Le pigeon voyageur</h3>' +
        '<div class="lab-x lab-img">' + pigeon + '</div>' +
        '<p class="lab-p1">Bien avant Internet, il transportait déjà des messages.</p>' +
        '<p class="lab-x lab-p2">Il retrouve son chemin sur des centaines de kilomètres.</p>' +
        '<p class="lab-x lab-a"><span>Voir d’autres oiseaux</span></p>' +
      '</div></div>' +
      '<div class="lab-switch" hidden><span>HTML seul</span>' +
      '<button type="button" class="switch" role="switch" aria-checked="true" aria-label="Activer ou désactiver le CSS"><i></i></button>' +
      '<span>HTML + CSS</span></div>';
    var el = figure('lab', html, 'Aperçu d’une page Web qui change à chaque modification');
    var sw = el.querySelector('.switch');
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      el.classList.toggle('nocss', !on);
    });
    return el;
  };

  RX.scenes = {
    make: function (cfg) {
      var el = B[cfg.name]();
      var s = controller(el);
      if (cfg.from && !RX.reduced) {
        s.state(cfg.from);
        setTimeout(function () { s.state(cfg.state); }, 450);
      } else if (cfg.state) {
        s.state(cfg.state);
      }
      return s;
    }
  };
})();
