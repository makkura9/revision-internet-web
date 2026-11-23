/* Paquet Express — CONTENU PÉDAGOGIQUE
   ----------------------------------------------------------------------
   Tout ce que les élèves lisent se trouve dans ce fichier : cartes
   d'explication (« point prof »), exercices, réponses, explications,
   mémo, carte du réseau et scénario de la mission finale.
   Voir le README pour le détail des types d'étapes.

   Le scénario est FICTIF mais réaliste :
   - le site www.pigeon-voyageur.example utilise le domaine de premier
     niveau .example, réservé aux exemples (RFC 2606) : il n'existe pas ;
   - les adresses publiques viennent des plages réservées à la
     documentation (RFC 5737) : 198.51.100.0/24 et 203.0.113.0/24 ;
   - les adresses du LAN sont des adresses privées (RFC 1918) ;
   - les adresses MAC sont « administrées localement » (02:…), donc
     n'appartiennent à aucun fabricant.
   ---------------------------------------------------------------------- */
(function () {
  'use strict';
  var RX = (window.RX = window.RX || {});

  RX.SITE = {
    // Adresse utilisée pour le lien et le QR code quand le site est ouvert en local.
    url: 'https://makkura9.github.io/cours-tcp-ip/',
    titre: 'Paquet Express',
    cours: 'TCP/IP',
    sousTitre: 'Le voyage d’un paquet sur Internet',
    classe: 'Informatique 1C',
    ecole: 'Gymnase de Burier'
  };

  /* ---------- Le scénario : toutes les adresses du cours ---------- */
  RX.NET = {
    domaine: 'www.pigeon-voyageur.example',
    pc: '192.168.10.27',       // ton ordinateur (adresse privée)
    pc2: '192.168.10.31',      // un autre ordinateur de la salle
    rgLan: '192.168.10.1',     // routeur du gymnase, côté LAN
    rgPub: '198.51.100.7',     // routeur du gymnase, côté Internet (fournie par le FAI)
    dns: '198.51.100.53',      // serveur DNS du FAI
    web: '203.0.113.42',       // serveur Web de www. et mail.pigeon-voyageur.example
    photos: '203.0.113.17',    // serveur de photos.pigeon-voyageur.example
    portSrc: '51234',          // port source choisi par ton ordinateur
    macPc: '02:1a:2b:3c:4d:5e',
    macRg: '02:aa:bb:cc:dd:01'
  };

  /* ---------- La carte du réseau ----------
     Deux mises en page : « w » (large, à l'horizontale) et « t » (étroite,
     pour les téléphones, à la verticale). Coordonnées dans le viewBox.  */
  RX.CARTE = {
    viewBox: { w: '0 0 1080 476', t: '0 0 360 724' },
    zones: [
      { id: 'gym', nom: 'LAN du gymnase', court: 'LAN du gymnase', type: 'LAN', proprio: 'le gymnase', w: [10, 34, 360, 432], t: [8, 30, 344, 204] },
      { id: 'fai', nom: 'WAN du FAI', court: 'WAN du FAI', type: 'WAN', proprio: 'le FAI', w: [380, 34, 150, 432], t: [8, 242, 344, 128] },
      { id: 'net', nom: 'Internet', court: 'Internet', type: 'WAN', proprio: 'd’autres opérateurs', w: [540, 34, 290, 432], t: [8, 378, 344, 182] },
      { id: 'dc', nom: 'Centre de données de l’hébergeur', court: 'Centre de données', type: 'LAN', proprio: 'l’hébergeur', w: [840, 34, 230, 432], t: [8, 568, 344, 148] }
    ],
    /* lw / lt : place du texte (b dessous, a dessus, l à gauche, r à droite) */
    nodes: [
      { id: 'pc', ico: 'laptop', nom: 'Ton\nordinateur', ip: '192.168.10.27', zone: 'gym', w: [84, 250], t: [48, 164] },
      { id: 'pc2', ico: 'laptop', nom: 'Autre\nordinateur', zone: 'gym', deco: true, w: [84, 410], t: null, lw: 'r' },
      { id: 'ap', ico: 'ap', nom: 'Point d’accès\nWi-Fi', zone: 'gym', w: [164, 126], t: [124, 90], lt: 'r' },
      { id: 'sw', ico: 'switch', nom: 'Switch', zone: 'gym', w: [196, 316], t: [200, 164] },
      { id: 'rg', ico: 'router', nom: 'Routeur\ndu gymnase', ip: '192.168.10.1', pub: '198.51.100.7', zone: 'gym', router: true, w: [300, 232], t: [298, 164], lt: 'a' },
      { id: 'rf', ico: 'router', nom: 'Routeur\ndu FAI', zone: 'fai', router: true, w: [455, 276], t: [298, 300], lt: 'l' },
      { id: 'dns', ico: 'server', nom: 'Serveur\nDNS', ip: '198.51.100.53', zone: 'fai', w: [455, 128], t: [92, 298], tag: 'DNS' },
      { id: 'A', ico: 'router', nom: 'A', zone: 'net', router: true, letter: true, w: [594, 150], t: [200, 416] },
      { id: 'B', ico: 'router', nom: 'B', zone: 'net', router: true, letter: true, w: [738, 128], t: [70, 462] },
      { id: 'C', ico: 'router', nom: 'C', zone: 'net', router: true, letter: true, w: [610, 318], t: [298, 450] },
      { id: 'D', ico: 'router', nom: 'D', zone: 'net', router: true, letter: true, w: [750, 250], t: [186, 508] },
      { id: 'E', ico: 'router', nom: 'E', zone: 'net', router: true, letter: true, w: [732, 392], t: [304, 530] },
      { id: 'rh', ico: 'router', nom: 'Routeur de\nl’hébergeur', zone: 'dc', router: true, w: [904, 250], t: [186, 610], lt: 'r' },
      { id: 'web', ico: 'server', nom: 'Serveur\nWeb', ip: '203.0.113.42', zone: 'dc', w: [1000, 128], t: [66, 648], tag: 'www' },
      { id: 'photos', ico: 'server', nom: 'Serveur\nphotos', ip: '203.0.113.17', zone: 'dc', w: [1000, 352], t: [304, 648] }
    ],
    edges: [
      ['pc', 'ap', 'wifi'], ['ap', 'sw', 'cable'], ['pc2', 'sw', 'cable'], ['sw', 'rg', 'cable'],
      ['rg', 'rf', 'fibre'], ['rf', 'dns', 'cable'],
      ['rf', 'A', 'fibre'], ['rf', 'C', 'fibre'],
      ['A', 'B', 'fibre'], ['A', 'C', 'fibre'], ['B', 'D', 'fibre'], ['C', 'D', 'fibre'], ['C', 'E', 'fibre'],
      ['B', 'rh', 'fibre'], ['D', 'rh', 'fibre'], ['E', 'rh', 'fibre'],
      ['rh', 'web', 'cable'], ['rh', 'photos', 'cable']
    ],
    // Nom de l'enveloppe « Accès réseau » selon le support du tronçon.
    trames: { wifi: 'Trame Wi-Fi', cable: 'Trame Ethernet', fibre: 'Trame · fibre optique' }
  };

  /* ---------- Les notions : c'est le mémo (fin de partie, bilan, fiche) ---------- */
  RX.NOTIONS = {
    carte: {
      t: 'La carte du voyage',
      d: 'Ton ordinateur est dans le <b>LAN du gymnase</b>. Le <b>routeur du gymnase</b>, à la frontière, le relie au <b>WAN du FAI</b>. Le FAI est relié aux réseaux d’autres opérateurs : tous ces réseaux reliés entre eux forment <b>Internet</b>, le réseau de réseaux. Le site est stocké sur un <b>serveur Web</b>, dans le centre de données d’un hébergeur.'
    },
    hebergeur: {
      t: 'Hébergeur',
      d: 'Entreprise qui loue de la place sur ses serveurs pour y stocker des sites Web. Ses serveurs sont réunis dans un <b>centre de données</b>, reliés entre eux par un <b>LAN</b>.'
    },
    ip: {
      t: 'Adresse IP',
      d: 'Numéro qui identifie un appareil sur un réseau (IP : <i>Internet Protocol</i>). Une adresse <b>IPv4</b> s’écrit avec <b>4 nombres de 0 à 255</b>, séparés par des points : par exemple 203.0.113.42.'
    },
    dns: {
      t: 'DNS',
      d: '<i>Domain Name System</i> : l’<b>annuaire d’Internet</b>. Il traduit un <b>nom de domaine</b> (www.pigeon-voyageur.example) en <b>adresse IP</b> (203.0.113.42). Avant d’envoyer sa requête, ton ordinateur demande l’adresse à un serveur DNS, s’il ne la connaît pas déjà.'
    },
    privee: {
      t: 'Adresse privée, adresse publique',
      d: 'Dans un LAN, les appareils ont des <b>adresses privées</b> (elles commencent souvent par 192.168 ou par 10), valables seulement à l’intérieur. Sur Internet circulent des <b>adresses publiques</b>, uniques au monde. Le routeur du gymnase en possède une, fournie par le FAI.'
    },
    paquets: {
      t: 'Paquets',
      d: 'Les données sont <b>découpées en petits paquets</b> (au plus 1500 octets environ). Ainsi, les câbles sont partagés entre tous les utilisateurs et, si un paquet se perd, on ne renvoie que lui.'
    },
    routage: {
      t: 'Routeur et routage',
      d: 'Un <b>routeur</b> relie des réseaux entre eux. Il lit l’<b>adresse IP de destination</b> de chaque paquet, consulte sa table de routage et transmet le paquet au <b>routeur suivant</b>. Chaque routeur ne choisit que la prochaine étape.'
    },
    chemins: {
      t: 'Plusieurs chemins',
      d: 'Internet est un réseau <b>maillé</b> : en cas de panne, les paquets passent ailleurs. Ils peuvent donc arriver <b>dans le désordre</b>, ou se perdre : <b>IP ne garantit pas la livraison</b>.'
    },
    tcp: {
      t: 'TCP',
      d: '<i>Transmission Control Protocol</i>. Il <b>numérote</b> les données envoyées ; le destinataire les <b>remet dans l’ordre</b> et <b>confirme leur réception</b> (accusé de réception) ; sans confirmation, l’expéditeur <b>renvoie</b> ce qui manque. TCP rend la communication <b>fiable</b>.'
    },
    port: {
      t: 'Port',
      d: 'Numéro qui indique <b>à quel programme</b> livrer les données sur une machine : <b>80</b> pour le Web (HTTP), <b>443</b> pour le Web sécurisé (HTTPS), <b>25</b> pour le courrier électronique (SMTP), <b>53</b> pour le DNS. L’adresse IP désigne l’immeuble ; le port désigne la porte.'
    },
    couches: {
      t: 'Le modèle TCP/IP',
      d: '<b>4 couches</b>, chacune avec son métier : <b>Application</b> (HTTP, DNS…), <b>Transport</b> (TCP), <b>Internet</b> (IP) et <b>Accès réseau</b> (Wi-Fi, Ethernet…).'
    },
    encapsulation: {
      t: 'Encapsulation',
      d: 'Au départ, chaque couche <b>emballe</b> ce que lui donne la couche du dessus et y ajoute son <b>en-tête</b> : message HTTP → segment TCP → paquet IP → trame. À l’arrivée, on déballe dans l’ordre inverse : c’est la <b>désencapsulation</b>.'
    },
    acces: {
      t: 'Accès réseau',
      d: 'Transmet les données sur un <b>support physique</b> (ondes Wi-Fi, câble Ethernet, fibre optique), d’un appareil à l’autre d’un même réseau, grâce aux <b>adresses MAC</b> des cartes réseau. Une trame ne va pas plus loin que le <b>prochain routeur</b> : là, elle est remplacée par une nouvelle.'
    }
  };

  /* ---------- Les 4 couches (schémas, fiche imprimable) ---------- */
  RX.COUCHES = [
    { id: 'app', nom: 'Application', c: '#FF85B0', proto: 'HTTP, DNS…', metier: 'Le message', d: 'Ce que les programmes se disent : « Donne-moi la page d’accueil ».', unite: 'message' },
    { id: 'tra', nom: 'Transport', c: '#FFA940', proto: 'TCP', metier: 'La livraison fiable', d: 'Ports, numéros, accusés de réception.', unite: 'segment' },
    { id: 'int', nom: 'Internet', c: '#2ED3A6', proto: 'IP', metier: 'L’adresse et le chemin', d: 'Adresses IP, routage de réseau en réseau.', unite: 'paquet' },
    { id: 'acc', nom: 'Accès réseau', c: '#6C9BFF', proto: 'Wi-Fi, Ethernet…', metier: 'Le tronçon', d: 'D’un appareil à l’autre, jusqu’au prochain routeur, grâce aux adresses MAC.', unite: 'trame' }
  ];

  /* ---------- Les 5 parties du cours ----------
     slides : cartes d'explication du « point prof »
       { k: surtitre, t: titre, v: illustration, p: [paragraphes], aside: {t, p} }
       { devine: true, t: question }      question à poser à la classe
       extra: true                        « pour aller plus loin »
     steps : exercices (voir le README pour les types)
     bonus : défis pour les élèves en avance                                 */
  RX.PARTIES = [
    /* ================= 1 · LE DÉPART ================= */
    {
      id: 'depart', titre: 'Le départ', sous: 'Rappel : LAN, WAN, FAI… la carte du voyage',
      c: '#FFD23F', ct: '#FFF4CC', icone: 'carte', duree: 5, prof: 1,
      intro: 'Ta requête HTTP va traverser toute une carte. Avant de partir, vérifions ce que tu sais déjà du terrain.',
      slides: [
        {
          k: 'La mission du jour', t: 'Aller chercher une page Web… à l’autre bout de la carte',
          v: { name: 'map', state: 'mission' },
          p: [
            'Tu es en salle d’informatique, au gymnase. Dans ton navigateur, tu tapes <b>http://www.pigeon-voyageur.example</b>.',
            'Ta requête HTTP doit voyager jusqu’au <b>serveur Web</b> qui stocke ce site, chez un <b>hébergeur</b> : une entreprise qui loue de la place sur ses serveurs, dans un centre de données. Puis la réponse doit revenir jusqu’à toi.',
            'Comment trouve-t-elle son chemin ? Grâce à une famille de protocoles : <b>TCP/IP</b>.'
          ],
          aside: { t: 'Un site fictif', p: 'La terminaison <b>.example</b> est réservée aux exemples : ce site n’existe pas sur le vrai Internet. Les adresses IP publiques de ce cours sont fictives, elles aussi.' }
        }
      ],
      steps: [
        {
          type: 'maplabel', notion: 'carte', map: 'zones',
          q: 'Que sais-tu déjà de la carte ? Donne son nom à la zone <em>qui clignote</em>.',
          targets: [
            { id: 'gym', t: 'LAN du gymnase', fb: 'Ton ordinateur, le point d’accès Wi-Fi, le switch et le routeur : le réseau local du gymnase.' },
            { id: 'fai', t: 'WAN du FAI', fb: 'Le réseau étendu du fournisseur d’accès à Internet, qui relie le gymnase au reste du monde.' },
            { id: 'net', t: 'Internet', fb: 'Les réseaux d’autres opérateurs. Avec ceux du FAI, du gymnase et de l’hébergeur, ils forment Internet, le réseau de réseaux.' },
            { id: 'dc', t: 'Centre de données de l’hébergeur', fb: 'C’est là que se trouvent les serveurs, dont le serveur Web du site.' }
          ],
          fb: 'Du LAN du gymnase au centre de données, en passant par le WAN du FAI et Internet : voilà le terrain du voyage.'
        },
        {
          type: 'sort', notion: 'carte',
          q: 'À qui appartient chaque infrastructure ?',
          cats: [{ id: 'gym', label: 'Gymnase' }, { id: 'fai', label: 'FAI' }, { id: 'heb', label: 'Hébergeur' }],
          cards: [
            { t: 'Le point d’accès Wi-Fi de la salle', cat: 'gym', fb: 'Il fait partie du LAN du gymnase.' },
            { t: 'Le switch de la salle d’informatique', cat: 'gym', fb: 'Il relie les appareils du LAN par câble.' },
            { t: 'Le routeur du gymnase', cat: 'gym', fb: 'Il appartient au gymnase et se trouve à la frontière : un côté dans le LAN, l’autre relié au WAN du FAI.' },
            { t: 'La liaison qui relie le gymnase à Internet', cat: 'fai', fb: 'C’est le WAN du FAI : c’est lui qui donne au gymnase l’accès à Internet.' },
            { t: 'Les routeurs du réseau étendu de l’opérateur', cat: 'fai', fb: 'Ils font partie du WAN du FAI.' },
            { t: 'Le serveur Web de www.pigeon-voyageur.example', cat: 'heb', notion: 'hebergeur', fb: 'Le site est stocké chez un hébergeur, dans son centre de données.' }
          ],
          fb: 'Le gymnase possède son LAN, le FAI son WAN, et l’hébergeur ses serveurs.'
        },
        {
          type: 'qcm', notion: 'carte', scene: { name: 'map', state: 'routeur' },
          q: 'Le routeur du gymnase est placé à la frontière entre…',
          options: [
            { t: '…le LAN du gymnase et le WAN du FAI', ok: true },
            { t: '…deux salles d’informatique', ok: false, fb: 'Pour relier des appareils du LAN entre eux, il y a le switch.' },
            { t: '…le navigateur et le serveur Web', ok: false, fb: 'Le serveur Web est bien plus loin, dans le centre de données.' },
            { t: '…le Wi-Fi et le câble', ok: false, fb: 'Ça, c’est le travail du point d’accès Wi-Fi.' }
          ],
          fb: 'C’est la porte de sortie du réseau local : tout ce qui quitte le LAN du gymnase passe par lui.'
        },
        {
          type: 'qcm', notion: 'hebergeur',
          q: 'Dans le centre de données, les serveurs de l’hébergeur sont dans un même bâtiment, reliés entre eux. Ils forment…',
          options: [
            { t: '…un LAN', ok: true },
            { t: '…un WAN', ok: false, fb: 'Un WAN couvre de grandes distances. Ici, tout tient dans un bâtiment.' },
            { t: '…un FAI', ok: false, fb: 'Un FAI est une entreprise qui donne accès à Internet, pas un groupe de serveurs.' },
            { t: '…Internet à eux seuls', ok: false, fb: 'Internet relie une multitude de réseaux : ce centre de données n’en est qu’un.' }
          ],
          fb: 'Un réseau local, comme celui du gymnase. Notre carte contient donc deux LAN, reliés par des WAN.'
        }
      ],
      bonus: [
        {
          type: 'qcm', notion: 'carte',
          q: 'À la pause, tu coupes le Wi-Fi et tu passes en 4G/5G. Quelle zone de la carte ta requête ne traverse-t-elle plus ?',
          options: [
            { t: 'Le LAN du gymnase', ok: true },
            { t: 'Internet', ok: false, fb: 'Il faut toujours traverser Internet pour atteindre le serveur.' },
            { t: 'Le centre de données de l’hébergeur', ok: false, fb: 'Le serveur Web s’y trouve toujours : il faut bien l’atteindre !' },
            { t: 'Aucune : le chemin est exactement le même', ok: false }
          ],
          fb: 'En 4G/5G, ton téléphone se connecte directement au réseau de l’opérateur mobile, par ses antennes : il ne passe plus par le point d’accès, le switch ni le routeur du gymnase.'
        }
      ],
      memo: ['carte', 'hebergeur']
    },

    /* ================= 2 · L'ADRESSE ================= */
    {
      id: 'adresse', titre: 'L’adresse', sous: 'Adresse IP et DNS : trouver le serveur',
      c: '#2ED3A6', ct: '#D9F8EE', icone: 'pin', duree: 8, prof: 3,
      intro: 'Pour livrer un paquet, il faut l’adresse exacte du destinataire. Problème : tu n’as tapé qu’un nom…',
      slides: [
        {
          k: 'Adresse IP', t: 'Chaque appareil a une adresse IP',
          v: { name: 'map', state: 'ips' },
          p: [
            'Pour livrer des données, il faut l’adresse du destinataire. Sur un réseau, chaque appareil reçoit une <b>adresse IP</b> (IP : <i>Internet Protocol</i>).',
            'Une adresse <b>IPv4</b> s’écrit avec <b>4 nombres de 0 à 255</b>, séparés par des points. Par exemple, l’adresse du serveur Web du site : <b>203.0.113.42</b>.'
          ],
          aside: { t: 'Le saviez-vous ?', p: 'Avec 4 nombres de 0 à 255, on obtient environ 4,3 milliards d’adresses : moins que le nombre d’humains ! On passe donc peu à peu à <b>IPv6</b>, des adresses beaucoup plus longues.' }
        },
        { devine: true, t: 'Mais tu n’as tapé qu’un nom : www.pigeon-voyageur.example. Comment ton ordinateur trouve-t-il l’adresse IP du serveur ?' },
        {
          k: 'DNS', t: 'Le DNS, l’annuaire d’Internet',
          v: { name: 'dnschat' },
          p: [
            'Les humains retiennent des noms ; les machines ont besoin d’adresses IP. Le <b>DNS</b> (<i>Domain Name System</i>) traduit un <b>nom de domaine</b> en adresse IP, comme les contacts de ton téléphone retrouvent un numéro à partir d’un nom.',
            'Avant d’envoyer sa requête, ton ordinateur pose la question à un <b>serveur DNS</b>, ici celui du FAI : « Quelle est l’adresse IP de www.pigeon-voyageur.example ? » Réponse : <b>203.0.113.42</b>.'
          ],
          aside: { t: 'Le saviez-vous ?', p: 'Si un serveur DNS ne connaît pas la réponse, il la demande à d’autres serveurs DNS. Les réponses sont ensuite gardées en mémoire un moment : pas besoin de redemander à chaque clic.' }
        },
        {
          k: 'Privée ou publique ?', t: 'Adresses privées, adresse publique',
          v: { name: 'natview' },
          p: [
            'Dans le LAN du gymnase, les appareils ont des <b>adresses privées</b>, qui commencent souvent par <b>192.168</b> ou par <b>10</b>. Elles ne servent qu’à l’intérieur : des millions d’autres réseaux locaux utilisent les mêmes.',
            'Sur Internet circulent des <b>adresses publiques</b>, uniques au monde. Le routeur du gymnase en possède une, fournie par le FAI : <b>198.51.100.7</b>. C’est elle qui représente le gymnase sur Internet.'
          ]
        }
      ],
      steps: [
        {
          type: 'sort', notion: 'ip', mono: true,
          q: 'Adresse IPv4 valide ou non ?',
          cats: [{ id: 'ok', label: 'Valide' }, { id: 'ko', label: 'Invalide' }],
          cards: [
            { t: '203.0.113.42', cat: 'ok', fb: '4 nombres entre 0 et 255 : valide.' },
            { t: '192.168.10.300', cat: 'ko', fb: '300 dépasse 255.' },
            { t: '192.168.10.27', cat: 'ok', fb: 'Valide : c’est même l’adresse de ton ordinateur.' },
            { t: '203.0.113', cat: 'ko', fb: 'Il n’y a que 3 nombres : il en faut 4.' },
            { t: '10.0.0.1', cat: 'ok', fb: '4 nombres entre 0 et 255 : valide. (Et c’est une adresse privée.)' },
            { t: 'www.pigeon-voyageur.example', cat: 'ko', fb: 'C’est un nom de domaine, pas une adresse IP.' }
          ],
          fb: 'Une adresse IPv4 valide : exactement 4 nombres, chacun entre 0 et 255, séparés par des points.'
        },
        {
          type: 'dns', notion: 'dns',
          q: 'Ton ordinateur doit demander l’adresse du serveur au DNS. Quelle partie de l’adresse du site lui envoie-t-il ?',
          url: [
            { t: 'http://', fb: 'C’est le protocole à utiliser (HTTP) : le DNS ne s’en occupe pas.' },
            { t: 'www.pigeon-voyageur.example', ok: true },
            { t: '/oiseaux.html', fb: 'C’est le chemin de la page sur le serveur : le DNS ne connaît que les noms de domaine.' }
          ],
          table: [
            ['www.pigeon-voyageur.example', '203.0.113.42'],
            ['mail.pigeon-voyageur.example', '203.0.113.42'],
            ['photos.pigeon-voyageur.example', '203.0.113.17']
          ],
          then: {
            type: 'qcm', notion: 'dns', code: true,
            q: 'Quelle adresse IP de destination ton ordinateur va-t-il écrire sur ses paquets ?',
            options: [
              { t: '203.0.113.42', ok: true },
              { t: '198.51.100.53', ok: false, fb: 'C’est l’adresse du serveur DNS : tu lui as posé la question, mais le site n’est pas chez lui.' },
              { t: '192.168.10.27', ok: false, fb: 'C’est l’adresse de ton ordinateur : ce sera l’adresse source.' },
              { t: '203.0.113.17', ok: false, fb: 'C’est l’adresse de photos.pigeon-voyageur.example, un autre serveur. Lis bien la bonne ligne.' }
            ],
            fb: 'Le DNS a répondu : www.pigeon-voyageur.example → 203.0.113.42. Tiens, mail.pigeon-voyageur.example a la même adresse… Mystère résolu dans la partie « La livraison » !'
          }
        },
        {
          type: 'qcm', notion: 'privee',
          q: 'Ton ordinateur a l’adresse 192.168.10.27. Que peut-on en dire ?',
          options: [
            { t: 'C’est une adresse privée : elle ne sert qu’à l’intérieur du LAN du gymnase', ok: true },
            { t: 'C’est l’adresse que voient tous les serveurs d’Internet', ok: false, fb: 'Sur Internet, c’est l’adresse publique du routeur du gymnase qui apparaît.' },
            { t: 'Elle est unique au monde', ok: false, fb: 'Des millions de réseaux locaux utilisent les mêmes adresses privées.' },
            { t: 'Elle est invalide', ok: false, fb: '4 nombres entre 0 et 255 : elle est valide.' }
          ],
          fb: 'Les adresses en 192.168… sont privées. Sur Internet, le gymnase est représenté par l’adresse publique de son routeur : 198.51.100.7.'
        },
        {
          type: 'match', notion: 'dns',
          q: 'Relie chaque terme à sa définition.',
          pairs: [
            { a: 'Adresse IP', b: 'Numéro qui identifie un appareil sur un réseau', notion: 'ip' },
            { a: 'Nom de domaine', b: 'Nom facile à retenir, comme www.pigeon-voyageur.example', notion: 'dns' },
            { a: 'DNS', b: 'Annuaire qui traduit un nom de domaine en adresse IP', notion: 'dns' },
            { a: 'Adresse privée', b: 'Adresse valable seulement à l’intérieur d’un LAN', notion: 'privee' }
          ],
          fb: 'Les humains utilisent des noms, les machines des adresses IP, et le DNS fait la traduction.'
        }
      ],
      bonus: [
        {
          type: 'qcm', notion: 'ip',
          q: 'Chaque nombre d’une adresse IPv4 peut prendre 256 valeurs (de 0 à 255). Combien d’adresses IPv4 différentes existe-t-il ?',
          options: [
            { t: '256 × 256 × 256 × 256, soit environ 4,3 milliards', ok: true },
            { t: '4 × 256, soit 1024', ok: false, fb: 'Chaque nombre se combine avec tous les autres : il faut multiplier les possibilités.' },
            { t: '255 + 255 + 255 + 255, soit 1020', ok: false, fb: 'Chaque nombre se combine avec tous les autres : il faut multiplier les possibilités.' },
            { t: 'Une infinité', ok: false, fb: 'Le nombre est grand, mais bien fini.' }
          ],
          fb: 'Exactement 4&#8239;294&#8239;967&#8239;296 adresses : moins que le nombre d’humains (plus de 8 milliards) ! D’où IPv6 et ses 2<sup>128</sup> adresses, un nombre à 39 chiffres.'
        },
        {
          type: 'qcm', notion: 'privee',
          q: 'Le serveur Web reçoit ta requête. Quelle adresse source y lit-il ?',
          options: [
            { t: '198.51.100.7, l’adresse publique du gymnase', ok: true },
            { t: '192.168.10.27, l’adresse de ton ordinateur', ok: false, fb: 'Une adresse privée ne circule pas sur Internet : le routeur du gymnase l’a remplacée.' },
            { t: '198.51.100.53, l’adresse du serveur DNS', ok: false, fb: 'Le serveur DNS n’intervient pas dans l’envoi de ta requête.' },
            { t: 'Aucune : une requête n’a pas d’adresse source', ok: false, fb: 'Sans adresse source, le serveur ne saurait pas où envoyer sa réponse.' }
          ],
          fb: 'Le routeur du gymnase remplace l’adresse privée par son adresse publique, et fait l’inverse pour la réponse. Tu verras ce tour de passe-passe pendant la mission finale.'
        }
      ],
      memo: ['ip', 'dns', 'privee']
    },

    /* ================= 3 · LE VOYAGE ================= */
    {
      id: 'voyage', titre: 'Le voyage', sous: 'Paquets, routeurs et routage',
      c: '#45D4F5', ct: '#DBF6FD', icone: 'router', duree: 7, prof: 3,
      intro: 'L’adresse est trouvée. Mais une page Web ne voyage pas d’un seul bloc… et personne ne lui montre le chemin.',
      slides: [
        { devine: true, t: 'Une page Web de 2 Mo voyage-t-elle d’un seul bloc, du serveur jusqu’à ton ordinateur ?' },
        {
          k: 'Paquets', t: 'Tout est découpé en paquets',
          v: { name: 'split' },
          p: [
            'Une page Web, une photo ou une vidéo sont <b>découpées en petits paquets</b>. Sur la plupart des réseaux, un paquet transporte au plus 1500 octets environ : une page de 2 Mo représente donc plus d’un millier de paquets !',
            'Pourquoi ? Les câbles sont partagés entre des milliers d’utilisateurs : leurs paquets s’intercalent. Et si un paquet se perd, il suffit de renvoyer celui-là.',
            'Le protocole <b>IP</b> colle sur chaque paquet une étiquette, l’<b>en-tête IP</b>, avec l’adresse IP de destination et l’adresse IP source.'
          ]
        },
        {
          k: 'Routage', t: 'Les routeurs, centres de tri d’Internet',
          v: { name: 'table' },
          p: [
            'Un <b>routeur</b> relie plusieurs réseaux. Quand un paquet arrive, il lit l’<b>adresse IP de destination</b>, consulte sa <b>table de routage</b> et transmet le paquet au routeur suivant.',
            'Chaque routeur ne choisit que la prochaine étape : il n’a pas besoin de connaître tout le chemin. De routeur en routeur, le paquet arrive à destination : c’est le <b>routage</b>.'
          ]
        },
        {
          k: 'Plusieurs chemins', t: 'Et si un routeur tombe en panne ?',
          v: { name: 'map', state: 'paths' },
          p: [
            'Internet est un réseau <b>maillé</b> : entre deux points, il existe plusieurs chemins. Si un routeur tombe en panne ou est surchargé, les paquets passent ailleurs.',
            'Conséquence : deux paquets d’une même page peuvent prendre des chemins différents et arriver <b>dans le désordre</b>… ou se perdre. <b>IP ne garantit pas la livraison</b> : il faudra un autre protocole pour vérifier.'
          ]
        }
      ],
      steps: [
        {
          type: 'qcm', notion: 'paquets',
          q: 'Pourquoi découpe-t-on les données en paquets ?',
          options: [
            { t: 'Pour partager les câbles entre tous les utilisateurs, et ne renvoyer que les morceaux perdus', ok: true },
            { t: 'Pour que les données prennent moins de place', ok: false, fb: 'Découper ne rend pas les données plus légères : chaque paquet ajoute même sa propre étiquette.' },
            { t: 'Pour cacher les données aux pirates', ok: false, fb: 'Découper ne chiffre rien : chaque morceau reste lisible.' },
            { t: 'Parce qu’un câble ne transporte qu’un fichier à la fois', ok: false, fb: 'C’est justement l’inverse : grâce aux paquets, un câble transporte les données de milliers d’échanges en même temps.' }
          ],
          fb: 'Grâce aux paquets, des milliers d’échanges partagent les mêmes câbles, et une perte ne coûte qu’un petit renvoi.'
        },
        {
          type: 'route', notion: 'routage', map: 'route',
          q: 'À toi de jouer les routeurs ! Amène le paquet du <em>routeur du FAI</em> jusqu’au <em>routeur de l’hébergeur</em> : touche à chaque fois le routeur suivant.',
          from: 'rf', to: 'rh',
          fb: 'Chaque routeur ne transmet le paquet qu’à un voisin. Et quand un routeur tombe en panne, il reste un autre chemin : Internet est maillé.'
        },
        {
          type: 'sort', notion: 'chemins',
          q: 'Vrai ou faux ?',
          cats: [{ id: 'v', label: 'Vrai' }, { id: 'f', label: 'Faux' }],
          cards: [
            { t: 'Un routeur lit l’adresse IP de destination du paquet', cat: 'v', notion: 'routage', fb: 'C’est elle qui lui indique où envoyer le paquet.' },
            { t: 'Chaque routeur connaît tout le chemin jusqu’au serveur', cat: 'f', notion: 'routage', fb: 'Il choisit seulement la prochaine étape.' },
            { t: 'Tous les paquets d’une page suivent forcément le même chemin', cat: 'f', fb: 'Ils peuvent passer par des chemins différents.' },
            { t: 'Si un routeur tombe en panne, les paquets peuvent passer ailleurs', cat: 'v', fb: 'Internet est maillé : il existe plusieurs chemins.' },
            { t: 'Les paquets arrivent toujours dans l’ordre de départ', cat: 'f', fb: 'Par des chemins différents, certains peuvent en doubler d’autres.' },
            { t: 'Le protocole IP garantit que tous les paquets arrivent', cat: 'f', fb: 'IP fait de son mieux, sans garantie. La vérification, c’est le rôle d’un autre protocole…' }
          ],
          fb: 'IP adresse et achemine les paquets, de routeur en routeur, mais ne garantit ni leur arrivée ni leur ordre.'
        }
      ],
      bonus: [
        {
          type: 'qcm', notion: 'routage',
          q: 'Chaque paquet porte un compteur, le TTL (par exemple 64 au départ). Chaque routeur lui retire 1 ; à 0, le paquet est détruit. À quoi cela sert-il ?',
          options: [
            { t: 'À éviter qu’un paquet égaré tourne en rond sans fin sur le réseau', ok: true },
            { t: 'À mesurer la vitesse de la connexion', ok: false },
            { t: 'À compter les paquets d’une page', ok: false, fb: 'Ça, c’est plutôt le rôle des numéros de TCP.' },
            { t: 'À chiffrer le contenu du paquet', ok: false }
          ],
          fb: 'TTL signifie <i>Time To Live</i>, « durée de vie ». La commande <b>tracert</b> (Windows) ou <b>traceroute</b> (macOS, Linux) s’en sert pour afficher la liste des routeurs traversés.'
        }
      ],
      memo: ['paquets', 'routage', 'chemins']
    },

    /* ================= 4 · LA LIVRAISON ================= */
    {
      id: 'livraison', titre: 'La livraison', sous: 'TCP et ports : tout arrive, au bon programme',
      c: '#FFA940', ct: '#FFEBD1', icone: 'parcel', duree: 7, prof: 3,
      intro: 'Des paquets qui arrivent dans le désordre, d’autres qui se perdent, et un serveur qui fait tourner plusieurs programmes… Qui remet de l’ordre ?',
      slides: [
        { devine: true, t: 'Les paquets arrivent dans le désordre, et l’un d’eux s’est perdu en route. Comment reconstituer la page sans erreur ?' },
        {
          k: 'TCP', t: 'TCP numérote et vérifie',
          v: { name: 'acks' },
          p: [
            '<b>TCP</b> (<i>Transmission Control Protocol</i>) numérote les données qu’il envoie. À l’arrivée, TCP les <b>remet dans l’ordre</b> grâce à ces numéros.',
            'Le destinataire confirme ce qu’il a bien reçu : c’est l’<b>accusé de réception</b>. Si une confirmation manque, l’expéditeur <b>renvoie</b> les données perdues.',
            'Résultat : rien ne manque et tout est dans l’ordre. TCP rend la communication <b>fiable</b>.'
          ]
        },
        {
          k: 'Ports', t: 'Les ports : frapper à la bonne porte',
          v: { name: 'ports' },
          p: [
            'Un même serveur fait tourner plusieurs programmes : le site Web, la messagerie… Le <b>numéro de port</b>, écrit par TCP sur chaque paquet, indique à quel programme livrer les données.',
            'Les plus connus : <b>80</b> pour le Web (HTTP), <b>443</b> pour le Web sécurisé (HTTPS), <b>25</b> pour le courrier électronique (SMTP). L’adresse IP désigne l’immeuble ; le port désigne la porte.',
            'Ton ordinateur indique aussi un <b>port source</b> (par exemple 51234) : quand la réponse revient, il sait qu’elle est pour ton navigateur.'
          ],
          aside: { t: 'HTTP ou HTTPS ?', p: 'Aujourd’hui, presque tous les sites utilisent HTTPS (port 443) : le contenu des paquets est chiffré. Notre site fictif utilise HTTP (port 80) pour qu’on puisse lire ses paquets.' }
        },
        {
          k: 'Pour aller plus loin', t: 'La poignée de main TCP', extra: true,
          v: { name: 'handshake' },
          p: [
            'Avant d’échanger des données, TCP ouvre une <b>connexion</b> en trois messages : <b>SYN</b> (« On peut se parler ? »), <b>SYN-ACK</b> (« Oui, je suis prêt ! ») et <b>ACK</b> (« C’est parti ! »).'
          ]
        }
      ],
      steps: [
        {
          type: 'tcp', notion: 'tcp',
          q: 'Les morceaux d’un texte arrivent dans ton navigateur, dans le désordre. Remets-les dans l’ordre : touche d’abord le <em>n° 1</em>.',
          parts: ['Bien avant Internet,', 'le pigeon voyageur', 'transportait déjà', 'des messages', 'sur des centaines de kilomètres.'],
          arrivee: [2, 4, 1, 5],
          manque: 3,
          then: {
            type: 'qcm', notion: 'tcp',
            q: 'Le morceau n° 3 n’est jamais arrivé. Que se passe-t-il ?',
            options: [
              { t: 'Sa réception n’est pas confirmée, donc l’expéditeur le renvoie', ok: true },
              { t: 'Le navigateur affiche le texte sans ce morceau', ok: false, fb: 'Avec TCP, rien ne manque : le morceau va être renvoyé.' },
              { t: 'Le dernier routeur invente le morceau manquant', ok: false, fb: 'Un routeur ne crée pas de données : il les transmet.' },
              { t: 'Le serveur renvoie toute la page depuis le début', ok: false, fb: 'Inutile : seul le morceau perdu est renvoyé.' }
            ],
            fb: 'Pas d’accusé de réception pour le n° 3 : l’expéditeur le renvoie. Seul le morceau perdu voyage une deuxième fois.'
          },
          fb: 'TCP a remis les morceaux dans l’ordre et fait renvoyer celui qui manquait. (Pour l’exercice, le texte est découpé en tout petits morceaux : en réalité, un paquet transporte jusqu’à 1500 octets environ.)'
        },
        {
          type: 'match', notion: 'port',
          q: 'Relie chaque numéro de port au programme qui l’utilise.',
          pairs: [
            { a: '80', b: 'Site Web (HTTP)' },
            { a: '443', b: 'Site Web sécurisé (HTTPS)' },
            { a: '25', b: 'Courrier électronique (SMTP)' },
            { a: '53', b: 'Annuaire DNS' }
          ],
          fb: '80 et 443 pour le Web, 25 pour le courrier électronique, 53 pour le DNS.'
        },
        {
          type: 'qcm', notion: 'port', scene: { name: 'ports', still: true },
          q: 'www.pigeon-voyageur.example et mail.pigeon-voyageur.example ont la même adresse IP : 203.0.113.42. Comment ce serveur sait-il si un paquet est pour le site Web ou pour la messagerie ?',
          options: [
            { t: 'Grâce au port de destination : 80 pour le site Web, 25 pour la messagerie', ok: true },
            { t: 'Grâce à l’adresse IP source', ok: false, fb: 'L’adresse source indique qui envoie le paquet, pas à quel programme il est destiné.' },
            { t: 'Grâce au DNS, qui accompagne le paquet', ok: false, fb: 'Le DNS ne voyage pas avec le paquet : il a seulement fourni l’adresse IP au départ.' },
            { t: 'Il ne peut pas savoir : il faudrait deux serveurs', ok: false, fb: 'Un seul serveur suffit : il fait tourner plusieurs programmes.' }
          ],
          fb: 'Mystère résolu : une seule machine, une seule adresse IP, mais plusieurs portes. C’est le port qui fait la différence.'
        },
        {
          type: 'qcm', notion: 'tcp',
          q: 'Quel protocole s’assure qu’il ne manque aucun morceau et que tout est dans l’ordre ?',
          options: [
            { t: 'TCP', ok: true },
            { t: 'IP', ok: false, fb: 'IP achemine les paquets, mais ne vérifie pas qu’ils arrivent.' },
            { t: 'HTTP', ok: false, fb: 'HTTP, c’est la langue de la requête et de la réponse.' },
            { t: 'DNS', ok: false, fb: 'Le DNS traduit les noms de domaine en adresses IP.' }
          ],
          fb: 'TCP : numéros, remise en ordre, accusés de réception et renvois.'
        }
      ],
      bonus: [
        {
          type: 'order', notion: 'tcp',
          q: 'Avant tout échange, TCP fait une « poignée de main » en 3 messages. Remets-les dans l’ordre.',
          steps: [
            'SYN : ton ordinateur demande « On peut se parler ? »',
            'SYN-ACK : le serveur répond « Oui, je suis prêt ! »',
            'ACK : ton ordinateur confirme « C’est parti ! »'
          ],
          fb: 'Trois messages, et la connexion TCP est ouverte : les données peuvent circuler dans les deux sens.'
        },
        {
          type: 'qcm', notion: 'tcp',
          q: 'Pour un appel vidéo, on utilise souvent UDP, un autre protocole de transport, qui ne renvoie pas les paquets perdus. Pourquoi ?',
          options: [
            { t: 'Un morceau d’image qui arrive en retard ne sert plus à rien : mieux vaut le sauter', ok: true },
            { t: 'Parce qu’UDP vérifie mieux que TCP', ok: false, fb: 'C’est l’inverse : UDP ne vérifie rien.' },
            { t: 'Parce qu’un appel vidéo n’a pas besoin d’adresse IP', ok: false, fb: 'Sans adresse IP, impossible de joindre ton correspondant.' },
            { t: 'Parce qu’une vidéo n’est jamais découpée en paquets', ok: false, fb: 'Une vidéo est découpée en paquets, comme toutes les données.' }
          ],
          fb: 'En direct, la rapidité compte plus que la perfection : une image un peu abîmée vaut mieux qu’une image qui arrive trop tard.'
        }
      ],
      memo: ['tcp', 'port']
    },

    /* ================= 5 · EMBALLE ET ENVOIE ================= */
    {
      id: 'emballage', titre: 'Emballe et envoie !', sous: 'Les 4 couches, l’encapsulation et la mission finale',
      c: '#B197FF', ct: '#ECE5FF', icone: 'nest', duree: 11, prof: 3, finale: true,
      intro: 'Adresses IP, port, numéros, trame… Comment tout faire tenir sur un seul paquet ? En l’emballant couche par couche. Ensuite, à toi de préparer le paquet et de suivre son voyage !',
      slides: [
        { devine: true, t: 'Adresse IP, port, numéro, message HTTP… Comment faire tenir toutes ces informations dans un seul paquet ?' },
        {
          k: 'Le modèle TCP/IP', t: '4 couches, 4 métiers',
          v: { name: 'layers' },
          p: [
            'Tous ces protocoles travaillent ensemble, chacun à son étage. On les range en <b>4 couches</b> : c’est le <b>modèle TCP/IP</b>, du nom de ses deux protocoles vedettes.',
            'Chaque couche rend service à celle du dessus, sans se soucier du travail des autres.'
          ],
          aside: { t: 'Attention aux noms', p: 'Selon les livres, la couche Internet s’appelle aussi couche <b>Réseau</b>, et la couche Accès réseau, couche <b>Lien</b> ou <b>Liaison</b>.' }
        },
        {
          k: 'Encapsulation', t: 'Des enveloppes dans des enveloppes',
          v: { name: 'encaps' },
          p: [
            'Au départ, les données descendent les couches. Chaque couche <b>emballe</b> ce que lui donne la couche du dessus et y ajoute son étiquette : son <b>en-tête</b>.',
            'Message HTTP → <b>segment</b> TCP → <b>paquet</b> IP → <b>trame</b> Wi-Fi. C’est l’<b>encapsulation</b>.'
          ]
        },
        {
          k: 'Désencapsulation', t: 'En chemin et à l’arrivée, on déballe',
          v: { name: 'decaps' },
          p: [
            'À chaque routeur, la trame est retirée pour lire l’en-tête IP ; puis le paquet repart dans une <b>nouvelle trame</b>, adaptée au tronçon suivant (câble, fibre optique…).',
            'Le serveur, lui, retire les enveloppes une à une, de l’extérieur vers l’intérieur, jusqu’au message HTTP : c’est la <b>désencapsulation</b>.'
          ]
        }
      ],
      steps: [
        {
          type: 'order', notion: 'couches',
          q: 'Empile les 4 couches, de la plus haute (le programme) à la plus basse (le câble).',
          steps: ['Application', 'Transport', 'Internet', 'Accès réseau'],
          fb: 'Application (le message), Transport (la livraison fiable), Internet (l’adresse et le chemin), Accès réseau (le tronçon).'
        },
        {
          type: 'sort', notion: 'couches',
          q: 'À quelle couche appartient chaque protocole ?',
          cats: [{ id: 'app', label: 'Application' }, { id: 'tra', label: 'Transport' }, { id: 'int', label: 'Internet' }, { id: 'acc', label: 'Accès réseau' }],
          cards: [
            { t: 'HTTP', cat: 'app', fb: 'La requête et la réponse du Web.' },
            { t: 'TCP', cat: 'tra', fb: 'Ports, numéros, accusés de réception.' },
            { t: 'IP', cat: 'int', fb: 'Adresses IP et routage.' },
            { t: 'Wi-Fi', cat: 'acc', notion: 'acces', fb: 'Les ondes jusqu’au point d’accès.' },
            { t: 'DNS', cat: 'app', notion: 'dns', fb: 'Un service pour les programmes : il traduit les noms en adresses IP.' },
            { t: 'Ethernet', cat: 'acc', notion: 'acces', fb: 'Les câbles du réseau local.' }
          ],
          fb: 'HTTP et DNS : Application. TCP : Transport. IP : Internet. Wi-Fi et Ethernet : Accès réseau.'
        },
        {
          type: 'encaps', notion: 'encapsulation',
          q: 'Mission finale : prépare le paquet qui va demander la page d’accueil de www.pigeon-voyageur.example.'
        },
        {
          type: 'journey', notion: 'acces', map: 'journey',
          q: 'Ton paquet est prêt. Suis son voyage sur la carte !'
        },
        {
          type: 'order', notion: 'encapsulation',
          q: 'Arrivé au serveur, dans quel ordre le paquet est-il déballé ?',
          steps: ['La trame Ethernet (Accès réseau)', 'L’en-tête IP (Internet)', 'L’en-tête TCP (Transport)', 'Le message HTTP (Application)'],
          fb: 'De l’extérieur vers l’intérieur : la désencapsulation remonte les couches.'
        }
      ],
      bonus: [
        {
          type: 'pick', notion: 'encapsulation',
          q: 'Pour faire son travail, quelles enveloppes un routeur d’Internet doit-il ouvrir ? Trouve <em>les 2</em>.',
          options: [
            { t: 'La trame (Accès réseau)', ok: true, fb: 'Il faut bien l’ouvrir pour atteindre le paquet IP.' },
            { t: 'L’en-tête IP (Internet)', ok: true, fb: 'Il y lit l’adresse IP de destination.' },
            { t: 'L’en-tête TCP (Transport)', ok: false, fb: 'Inutile : le port ne compte que pour la machine d’arrivée.' },
            { t: 'Le message HTTP (Application)', ok: false, fb: 'Le routeur n’a pas besoin de savoir quelle page tu demandes.' }
          ],
          fb: 'Un routeur d’Internet travaille jusqu’à la couche Internet : il lit l’adresse IP de destination, puis remballe le paquet dans une nouvelle trame.'
        },
        {
          type: 'match', notion: 'encapsulation',
          q: 'Chaque emballage a un nom. Relie-les.',
          pairs: [
            { a: 'Segment', b: 'Message HTTP + en-tête TCP' },
            { a: 'Paquet', b: 'Segment + en-tête IP' },
            { a: 'Trame', b: 'Paquet + en-tête Wi-Fi ou Ethernet' }
          ],
          fb: 'Segment TCP, paquet IP, trame : un nom par couche.'
        }
      ],
      memo: ['couches', 'encapsulation', 'acces']
    }
  ];

  /* ---------- Mission finale : préparer le paquet (étape « encaps ») ---------- */
  RX.MISSION = {
    messages: [
      { t: 'GET / HTTP/1.1<br>Host: www.pigeon-voyageur.example', g: '« Donne-moi la page d’accueil »', ok: true, fb: 'Une requête HTTP : GET demande une page, ici la page d’accueil « / ».' },
      { t: 'HTTP/1.1 200 OK', g: '« Voici la page »', ok: false, fb: 'Ça, c’est la réponse du serveur. Toi, tu fais une demande.' },
      { t: '&lt;h1&gt;Le pigeon voyageur&lt;/h1&gt;', g: 'Du code HTML', ok: false, fb: 'C’est le contenu de la page, que le serveur t’enverra. Il faut d’abord le demander.' }
    ],
    // Ordre dans lequel les en-têtes sont ajoutés (on descend les couches).
    ordre: ['tra', 'int', 'acc'],
    entetes: {
      tra: {
        nom: 'En-tête TCP', couche: 'Transport',
        q: 'Quel port de destination ?',
        fixes: [['Port source', '51234']],
        champ: 'Port de destination',
        options: [
          { t: '80', ok: true, fb: 'Le site est en HTTP (http://) : port 80.' },
          { t: '443', ok: false, fb: 'Le port 443 attend du HTTPS, chiffré. L’adresse du site commence par http:// : c’est le port 80.' },
          { t: '25', ok: false, fb: 'Le port 25 mène à la messagerie : elle ne comprendrait pas une requête HTTP.' }
        ],
        apres: [['N°', '1']]
      },
      int: {
        nom: 'En-tête IP', couche: 'Internet',
        q: 'Quelle adresse IP de destination ?',
        fixes: [['IP source', '192.168.10.27']],
        champ: 'IP de destination',
        options: [
          { t: '203.0.113.42', ok: true, fb: 'L’adresse que le DNS a donnée pour www.pigeon-voyageur.example.' },
          { t: '198.51.100.53', ok: false, fb: 'C’est le serveur DNS du FAI : il t’a donné l’adresse, mais le site n’est pas chez lui.' },
          { t: '203.0.113.17', ok: false, fb: 'C’est le serveur de photos.pigeon-voyageur.example : ton paquet arriverait chez un autre serveur.' },
          { t: '192.168.10.1', ok: false, fb: 'C’est le routeur du gymnase, côté LAN : le paquet n’irait pas plus loin.' }
        ]
      },
      acc: {
        nom: 'En-tête Wi-Fi', couche: 'Accès réseau',
        q: 'Jusqu’où va cette trame Wi-Fi ?',
        champ: 'Destination de la trame',
        options: [
          { t: 'Jusqu’au routeur du gymnase', ok: true, fb: 'La trame ne fait qu’un tronçon : jusqu’au prochain routeur. Le point d’accès et le switch la font passer sans ouvrir le paquet IP.' },
          { t: 'Jusqu’au serveur Web', ok: false, fb: 'La couche Accès réseau ne fait qu’un tronçon, jusqu’au prochain routeur. Le voyage jusqu’au serveur, c’est l’affaire d’IP.' },
          { t: 'Jusqu’au serveur DNS', ok: false, fb: 'Le DNS a déjà répondu : il ne fait pas partie du voyage.' }
        ],
        apres: [['MAC source', '02:1a:2b:3c:4d:5e'], ['MAC destination', '02:aa:bb:cc:dd:01']]
      }
    }
  };

  /* ---------- Mission finale : le voyage sur la carte (étape « journey ») ----------
     to : nœud(s) à atteindre   med : support du tronçon (change l'enveloppe)
     src/dst : adresses affichées sur l'étiquette   q : question à résoudre   */
  RX.VOYAGE = [
    { at: 'pc', t: 'Départ', d: 'Ton ordinateur envoie la trame sur les ondes Wi-Fi.', med: 'wifi', src: '192.168.10.27', dst: '203.0.113.42' },
    { to: ['ap'], t: 'Point d’accès Wi-Fi', d: 'Il capte les ondes et transmet la trame sur le câble du réseau local, sans ouvrir le paquet IP.', med: 'cable' },
    { to: ['sw'], t: 'Switch', d: 'Il envoie la trame sur le câble qui mène au routeur. Lui non plus n’ouvre pas le paquet IP.' },
    {
      to: ['rg'], t: 'Routeur du gymnase',
      d: 'Il retire la trame et lit l’adresse IP de destination : 203.0.113.42 n’est pas dans le LAN, direction le FAI. Mais ton adresse privée ne peut pas circuler sur Internet…',
      q: {
        q: 'Par quelle adresse source le routeur remplace-t-il ton adresse privée 192.168.10.27 ?', notion: 'privee', code: true,
        options: [
          { t: '198.51.100.7 : l’adresse publique du gymnase', ok: true },
          { t: '203.0.113.42 : l’adresse du serveur', ok: false, fb: 'C’est l’adresse de destination : elle ne change pas.' },
          { t: '198.51.100.53 : l’adresse du serveur DNS', ok: false, fb: 'Le serveur DNS n’a rien à voir avec ton paquet.' }
        ]
      },
      apres: 'Il écrit l’adresse publique du gymnase comme adresse source, puis remballe le paquet dans une nouvelle trame pour la fibre optique.',
      src: '198.51.100.7', med: 'fibre'
    },
    { to: ['rf'], t: 'Routeur du FAI', d: 'Le paquet entre dans le WAN du FAI. Le routeur lit l’adresse IP de destination et l’envoie vers Internet, dans une nouvelle trame.' },
    { to: ['A', 'B'], t: 'Routeurs d’Internet', d: 'De routeur en routeur, à travers les réseaux d’autres opérateurs. Chacun lit l’adresse IP de destination, choisit la prochaine étape et refait la trame.' },
    { to: ['rh'], t: 'Routeur de l’hébergeur', d: 'Arrivée au centre de données. Le routeur reconnaît l’adresse 203.0.113.42 : ce serveur est dans son réseau local. Il lui envoie le paquet dans une trame Ethernet.' },
    {
      to: ['web'], t: 'Serveur Web 203.0.113.42', med: 'cable',
      d: 'Le serveur déballe : il retire la trame, vérifie l’en-tête IP (la destination est bien la sienne), puis lit l’en-tête TCP…',
      q: {
        q: 'Le port de destination est 80. À quel programme le serveur remet-il le message ?', notion: 'port',
        options: [
          { t: 'Au programme du site Web', ok: true },
          { t: 'À la messagerie', ok: false, fb: 'La messagerie, c’est le port 25.' },
          { t: 'Au DNS', ok: false, fb: 'Le DNS, c’est le port 53, et ce serveur n’en fait pas tourner.' }
        ]
      },
      apres: 'Le programme du site Web lit enfin le message HTTP, « GET / », et prépare la page d’accueil.'
    },
    {
      back: ['rh', 'D', 'C', 'rf', 'rg'], t: 'La réponse',
      d: 'Le serveur répond « 200 OK » avec la page HTML. Elle est découpée en plusieurs paquets que TCP numérote, adressés à l’adresse publique du gymnase : 198.51.100.7. (Pas forcément par le même chemin !)',
      src: '203.0.113.42', dst: '198.51.100.7', med: 'fibre', reponse: true
    },
    { to: ['sw', 'ap', 'pc'], avant: true, t: 'Retour au gymnase', d: 'Le routeur du gymnase reconnaît la réponse attendue par ton ordinateur : il remet ton adresse privée, 192.168.10.27, comme destination. TCP remet les paquets dans l’ordre…', dst: '192.168.10.27', med: 'wifi', reponse: true },
    { at: 'pc', t: 'Arrivée !', d: 'Le navigateur lit le HTML reçu… et la page s’affiche. Toute l’aventure n’a duré qu’une fraction de seconde.', page: true, reponse: true }
  ];

  /* Titres obtenus selon le nombre d'étoiles (sur 15). */
  RX.RANGS = [
    { min: 0, t: 'Paquet en partance' },
    { min: 6, t: 'Routeur en formation' },
    { min: 10, t: 'Expert·e TCP/IP' },
    { min: 14, t: 'Maître·sse de l’encapsulation' }
  ];
})();
