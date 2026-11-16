/* Requête Express — CONTENU PÉDAGOGIQUE
   ----------------------------------------------------------------------
   Tout ce que les élèves lisent se trouve dans ce fichier : notions du
   mémo, questions, réponses et explications. Pour corriger une phrase ou
   ajouter une question, c'est ici (voir le README pour le détail).
   Source : fiches « Questionnaire Internet » et « Internet et Web ».
   ---------------------------------------------------------------------- */
(function () {
  'use strict';
  var RX = (window.RX = window.RX || {});

  RX.SITE = {
    // Adresse utilisée pour le lien et le QR code quand le site est ouvert en local.
    url: 'https://makkura9.github.io/revision-internet-web/',
    titre: 'Requête Express',
    cours: 'Internet et Web',
    classe: 'Informatique 1C',
    ecole: 'Gymnase de Burier'
  };

  /* ---------- Les notions : c'est le mémo de la synthèse imprimée ---------- */
  RX.NOTIONS = {
    reseau: {
      t: 'Réseau informatique',
      d: 'Il faut <b>plusieurs terminaux</b> (ordinateurs, smartphones, serveurs, périphériques…), une <b>connexion physique</b> (filaire ou sans fil) et des <b>protocoles de communication</b>.'
    },
    lan: {
      t: 'LAN — Local Area Network',
      d: '<b>Réseau local</b>, à portée géographique limitée : un bâtiment, un bureau, une maison ou un appartement.'
    },
    wan: {
      t: 'WAN — Wide Area Network',
      d: '<b>Réseau étendu</b> : les infrastructures (généralement filaires) des opérateurs de télécommunications, qui relient les LAN entre eux sur de grands espaces.'
    },
    internet: {
      t: 'Internet',
      d: 'Un WAN <b>public</b>, le plus grand de tous : un <b>réseau de réseaux</b>.'
    },
    fai: {
      t: 'FAI (ou ISP)',
      d: '<b>Fournisseur d’accès à Internet</b> (<i>Internet Service Provider</i>) : entreprise de télécommunication qui donne accès à Internet contre un abonnement, à domicile ou en 4G/5G.'
    },
    box: {
      t: 'La box Internet',
      d: 'Trois appareils en un : le <b>modem-routeur</b> (accès à Internet via le WAN de l’opérateur), le <b>switch</b> ou commutateur (relie des appareils par câble) et le <b>point d’accès Wi-Fi</b> (relie les appareils sans fil au réseau local).'
    },
    wifi4g: {
      t: 'Wi-Fi ou 4G/5G ?',
      d: 'Le <b>Wi-Fi</b> donne accès à un réseau local, lui-même relié à Internet par un modem-routeur. La <b>4G/5G</b> connecte directement à l’opérateur, via ses antennes radio.'
    },
    internetweb: {
      t: 'Internet ≠ Web',
      d: '<b>Internet</b> est le réseau informatique qui transporte les données ; il supporte plusieurs services (e-mail, FTP, streaming, Web). Le <b>Web</b> est un réseau d’informations : des milliards de documents reliés les uns aux autres.'
    },
    siteweb: {
      t: 'Site Web',
      d: 'Un ensemble de pages contenant de l’information. « Site Internet » est un <b>abus de langage</b>.'
    },
    hypertexte: {
      t: 'Hypertexte',
      d: 'Du texte qui contient des <b>liens vers d’autres textes</b>. C’est le fondement du Web.'
    },
    serveur: {
      t: 'Serveur Web',
      d: 'Ordinateur qui <b>stocke</b> les documents du Web et <b>fournit</b> les données quand un client les lui demande (requête).'
    },
    client: {
      t: 'Client Web',
      d: 'Application qui se connecte au Web, par exemple un <b>navigateur</b>.'
    },
    http: {
      t: 'HTTP',
      d: '<i>HyperText Transfer Protocol</i> : le <b>protocole</b> utilisé par le client Web et le serveur Web pour communiquer.'
    },
    requete: {
      t: 'Requête et réponse',
      d: 'Le navigateur (client) envoie une <b>requête HTTP</b> au serveur via Internet. Le serveur envoie sa <b>réponse</b>, que le navigateur affiche à l’écran.'
    },
    navigateur: {
      t: 'Navigateur Web',
      d: 'Sert à <b>consulter des informations sur le Web</b>. C’est lui qui interprète le HTML et le CSS. Exemples : Chrome, Safari, Firefox.'
    },
    url: {
      t: 'URL',
      d: 'Une <b>adresse</b> qui mène à une page Web.'
    },
    html: {
      t: 'HTML',
      d: 'Décrit la <b>structure</b> et le <b>contenu</b> d’une page Web.'
    },
    css: {
      t: 'CSS',
      d: 'Sert à <b>mettre en forme</b> le code HTML.'
    },
    moteur: {
      t: 'Moteur de recherche',
      d: 'Il classe ses résultats selon trois critères : la <b>pertinence</b> (le contenu correspond-il à la requête ?), la <b>popularité</b> (nombre de liens menant vers la page) et la <b>confiance</b> (qualité de ces liens).'
    }
  };

  /* ---------- Les 7 missions ----------
     Types d'étapes :
       qcm     une seule bonne réponse
       pick    trouver toutes les bonnes réponses parmi des intrus
       sort    classer des cartes dans 2 ou 3 catégories
       acronym retrouver les mots d'un sigle
       match   relier des paires
       order   remettre des étapes dans l'ordre
       label   légender un schéma
       hyper   mini-navigateur à explorer, suivi d'un qcm
       rank    choisir le meilleur résultat de recherche
  */
  RX.MISSIONS = [
    /* ================= 1 · LE RÉSEAU ================= */
    {
      id: 'reseau', titre: 'Le réseau', sous: 'Terminaux, connexions, protocoles',
      lieu: 'Départ : ton appareil',
      c: '#6C9BFF', ct: '#E3ECFF', icone: 'laptop',
      intro: 'Avant d’envoyer la moindre requête, il faut… un réseau. Voyons de quoi il est fait.',
      memo: ['reseau'],
      steps: [
        {
          type: 'pick', notion: 'reseau', scene: { name: 'net' },
          q: 'Cet ordinateur est tout seul. Quels sont les <em>3 éléments indispensables</em> pour former un réseau informatique ?',
          options: [
            { t: 'Plusieurs terminaux', ok: true, ev: 'terminaux', fb: 'Ordinateurs, smartphones, serveurs, périphériques… il en faut plusieurs pour communiquer.' },
            { t: 'Une connexion physique', ok: true, ev: 'connexion', fb: 'Filaire (un câble) ou sans fil (des ondes) : il faut un chemin entre les terminaux.' },
            { t: 'Des protocoles de communication', ok: true, ev: 'protocoles', fb: 'Des règles communes, pour que les terminaux se comprennent.' },
            { t: 'Un moteur de recherche', ok: false, fb: 'Pratique pour trouver une page Web, mais un réseau fonctionne très bien sans.' },
            { t: 'Un écran tactile', ok: false, fb: 'Un serveur n’a souvent même pas d’écran… et il est pourtant bien en réseau.' },
            { t: 'Un abonnement de streaming', ok: false, fb: 'Le streaming est un service qui utilise le réseau, pas un ingrédient du réseau.' }
          ],
          fb: 'Plusieurs terminaux + une connexion physique + des protocoles de communication : voilà un réseau.'
        },
        {
          type: 'sort', notion: 'reseau',
          q: 'La connexion physique peut être filaire ou sans fil (« ondulaire »). Classe ces exemples.',
          cats: [{ id: 'fil', label: 'Filaire' }, { id: 'onde', label: 'Sans fil' }],
          cards: [
            { t: 'Un câble réseau branché sur la box', cat: 'fil' },
            { t: 'Le Wi-Fi', cat: 'onde', fb: 'Le Wi-Fi utilise des ondes radio.' },
            { t: 'La 4G / 5G', cat: 'onde', fb: 'Des ondes radio, entre le téléphone et les antennes de l’opérateur.' },
            { t: 'La fibre optique', cat: 'fil', fb: 'C’est un câble… en verre.' }
          ]
        },
        {
          type: 'qcm', notion: 'reseau',
          q: 'À quoi servent les protocoles de communication ?',
          options: [
            { t: 'Ce sont des règles communes qui permettent aux terminaux de se comprendre', ok: true },
            { t: 'Ce sont les câbles qui relient les terminaux', ok: false, fb: 'Ça, c’est la connexion physique.' },
            { t: 'Ce sont les mots de passe du Wi-Fi', ok: false },
            { t: 'Ce sont des antivirus qui protègent le réseau', ok: false }
          ],
          fb: 'Sans règles communes, impossible d’échanger. Tu en croiseras un célèbre à la mission 5 : HTTP.'
        }
      ]
    },

    /* ================= 2 · LAN, WAN & INTERNET ================= */
    {
      id: 'lanwan', titre: 'LAN, WAN & Internet', sous: 'Du réseau local au réseau mondial',
      lieu: 'Sortie de la maison',
      c: '#2ED3A6', ct: '#D9F8EE', icone: 'house',
      intro: 'Du réseau de ta maison au réseau mondial, tout est une question d’échelle. On dézoome ?',
      memo: ['lan', 'wan', 'internet'],
      steps: [
        {
          type: 'acronym', notion: 'lan', word: 'LAN', scene: { name: 'zoom', state: 'lan' },
          q: 'Chez toi, tes appareils forment un <em>LAN</em>. Retrouve les trois mots du sigle.',
          slots: [
            { l: 'L', ok: 'Local', choices: ['Local', 'Large', 'Long'] },
            { l: 'A', ok: 'Area', choices: ['Area', 'Access', 'Antenna'] },
            { l: 'N', ok: 'Network', choices: ['Network', 'Node', 'Navigator'] }
          ],
          reveal: 'En français : <b>réseau local</b>',
          fb: 'Local Area Network, le réseau local.'
        },
        {
          type: 'qcm', notion: 'lan', scene: { name: 'zoom', state: 'lan' },
          q: 'Un LAN, c’est un réseau…',
          options: [
            { t: '…à portée géographique limitée : une maison, un bureau, un bâtiment', ok: true },
            { t: '…qui couvre tout un pays', ok: false },
            { t: '…réservé aux téléphones portables', ok: false },
            { t: '…forcément sans fil', ok: false, fb: 'Un LAN peut être filaire, sans fil, ou les deux.' }
          ],
          fb: 'LAN = réseau local : sa portée géographique est limitée.'
        },
        {
          type: 'acronym', notion: 'wan', word: 'WAN', scene: { name: 'zoom', state: 'wan', from: 'lan' },
          q: 'On dézoome : pour relier des LAN éloignés, il faut un <em>WAN</em>. Décode-le.',
          slots: [
            { l: 'W', ok: 'Wide', choices: ['Wide', 'World', 'Wireless'] },
            { l: 'A', ok: 'Area', choices: ['Area', 'Access', 'Antenna'] },
            { l: 'N', ok: 'Network', choices: ['Network', 'Node', 'Navigator'] }
          ],
          reveal: 'En français : <b>réseau étendu</b>',
          fb: 'Wide Area Network, le réseau étendu.'
        },
        {
          type: 'qcm', notion: 'wan', scene: { name: 'zoom', state: 'wan' },
          q: 'Qui gère les WAN, ces infrastructures qui relient les LAN entre eux ?',
          options: [
            { t: 'Les opérateurs de télécommunications', ok: true },
            { t: 'Chaque famille, depuis sa box', ok: false },
            { t: 'Les fabricants de téléphones', ok: false },
            { t: 'Personne : les LAN restent isolés', ok: false }
          ],
          fb: 'Les opérateurs gèrent des infrastructures, généralement filaires, sur de grands espaces.'
        },
        {
          type: 'sort', notion: 'lan',
          q: 'LAN ou WAN ? Classe chaque réseau.',
          cats: [{ id: 'lan', label: 'LAN' }, { id: 'wan', label: 'WAN' }],
          cards: [
            { t: 'Le réseau de ton appartement', cat: 'lan', notion: 'lan' },
            { t: 'Le réseau d’une salle d’informatique', cat: 'lan', notion: 'lan' },
            { t: 'Les ordinateurs d’un petit bureau', cat: 'lan', notion: 'lan' },
            { t: 'Le réseau d’un opérateur, qui couvre tout le pays', cat: 'wan', notion: 'wan' },
            { t: 'Les infrastructures qui relient les villes entre elles', cat: 'wan', notion: 'wan' },
            { t: 'Internet', cat: 'wan', notion: 'internet', fb: 'C’est même le plus grand des WAN.' }
          ]
        },
        {
          type: 'qcm', notion: 'internet', scene: { name: 'zoom', state: 'internet', from: 'wan' },
          q: 'On dézoome encore. Finalement, Internet, c’est…',
          options: [
            { t: 'Un WAN public, le plus grand de tous : un réseau de réseaux', ok: true },
            { t: 'Un LAN géant qui appartient à une seule entreprise', ok: false },
            { t: 'Exactement la même chose que le Web', ok: false, fb: 'Attention, c’est le piège de la mission 4.' },
            { t: 'Un logiciel installé sur chaque ordinateur', ok: false }
          ],
          fb: 'Internet relie entre eux une multitude de réseaux : c’est un réseau de réseaux.'
        }
      ]
    },

    /* ================= 3 · LA BOX & L'ACCÈS ================= */
    {
      id: 'box', titre: 'La box & l’accès', sous: 'FAI, box, Wi-Fi et 4G/5G',
      lieu: 'Passage obligé',
      c: '#FFA940', ct: '#FFEBD1', icone: 'box',
      intro: 'Pour quitter le réseau local, il faut passer par la box… ou par une antenne. Et dans les deux cas, par un FAI.',
      memo: ['fai', 'box', 'wifi4g'],
      steps: [
        {
          type: 'acronym', notion: 'fai', word: 'FAI',
          q: 'Pour accéder à Internet, il te faut un <em>FAI</em>. Que signifie ce sigle ?',
          slots: [
            { l: 'F', ok: 'Fournisseur', choices: ['Fournisseur', 'Fichier', 'Fibre'] },
            { l: 'A', ok: 'd’Accès', choices: ['d’Accès', 'd’Antennes', 'd’Adresses'] },
            { l: 'I', ok: 'à Internet', choices: ['à Internet', 'à l’Intranet', 'à l’Image'] }
          ],
          reveal: 'En anglais : <b>ISP</b>, Internet Service Provider',
          fb: 'Fournisseur d’Accès à Internet.'
        },
        {
          type: 'qcm', notion: 'fai',
          q: 'Concrètement, un FAI, c’est…',
          options: [
            { t: 'Une entreprise de télécommunication qui donne accès à Internet contre un abonnement', ok: true },
            { t: 'Un appareil que l’on branche sur la box', ok: false },
            { t: 'Un site Web pour tester sa connexion', ok: false },
            { t: 'Le propriétaire d’Internet', ok: false, fb: 'Personne ne possède Internet.' }
          ],
          fb: 'Que ce soit pour l’abonnement Internet du domicile ou pour la 4G/5G du téléphone. En Suisse : Swisscom, Sunrise, Salt…'
        },
        {
          type: 'match', notion: 'box', scene: { name: 'box' },
          q: 'La box remise par ton FAI cache en réalité <em>3 appareils</em>. Relie chacun à sa fonction.',
          pairs: [
            { a: 'Modem-routeur', b: 'Donne accès à Internet via le WAN de l’opérateur', ev: 'modem' },
            { a: 'Switch (commutateur)', b: 'Relie plusieurs appareils à la box par câble', ev: 'switch' },
            { a: 'Point d’accès Wi-Fi', b: 'Connecte sans fil les appareils au réseau local', ev: 'ap' }
          ],
          fb: 'Une box = un modem-routeur + un switch + un point d’accès Wi-Fi.'
        },
        {
          type: 'qcm', notion: 'wifi4g', scene: { name: 'acces', state: 'idle' }, ev: 'wifi',
          q: 'À la maison, tu es en <em>Wi-Fi</em>. À quoi ton téléphone est-il connecté en premier ?',
          options: [
            { t: 'Au réseau local de la box, lui-même relié à Internet par le modem-routeur', ok: true },
            { t: 'Directement aux antennes de l’opérateur', ok: false, fb: 'Ça, c’est la 4G/5G.' },
            { t: 'Directement au serveur Web', ok: false }
          ],
          fb: 'Le Wi-Fi donne accès à un réseau local (LAN), qui est lui-même connecté à Internet via le modem-routeur.'
        },
        {
          type: 'qcm', notion: 'wifi4g', scene: { name: 'acces', state: 'idle' }, ev: 'g4',
          q: 'Dans le train, tu passes en <em>4G/5G</em>. Et maintenant ?',
          options: [
            { t: 'Ton téléphone se connecte directement à l’opérateur, via ses antennes radio', ok: true },
            { t: 'Il se connecte au Wi-Fi de la box restée à la maison', ok: false },
            { t: 'Il crée son propre réseau local avec le train', ok: false },
            { t: 'Il n’a plus besoin d’opérateur', ok: false }
          ],
          fb: 'En 4G/5G, pas de box : tu es relié directement au réseau sans fil de l’opérateur.'
        }
      ]
    },

    /* ================= 4 · INTERNET ≠ WEB ================= */
    {
      id: 'web', titre: 'Internet ≠ Web', sous: 'Deux mots, deux réalités',
      lieu: 'Sur le grand réseau',
      c: '#B197FF', ct: '#ECE5FF', icone: 'globe',
      intro: 'Ta requête file sur Internet. Mais attention : Internet et le Web, ce n’est pas la même chose !',
      memo: ['internetweb', 'siteweb', 'hypertexte'],
      steps: [
        {
          type: 'sort', notion: 'internetweb',
          q: 'Internet ou Web ? À toi de trier.',
          cats: [{ id: 'internet', label: 'Internet' }, { id: 'web', label: 'Web' }],
          cards: [
            { t: 'Un gigantesque réseau d’ordinateurs', cat: 'internet' },
            { t: 'Des milliards de documents reliés les uns aux autres', cat: 'web' },
            { t: 'Le réseau informatique qui transporte les données', cat: 'internet' },
            { t: 'Un réseau d’informations', cat: 'web' },
            { t: 'Il supporte plusieurs services : e-mail, streaming…', cat: 'internet' },
            { t: 'Il repose sur l’hypertexte', cat: 'web' }
          ],
          fb: 'Le Web est un réseau d’informations ; Internet est le réseau informatique qui permet de les transporter.'
        },
        {
          type: 'pick', notion: 'internetweb', scene: { name: 'tube' },
          q: 'Internet supporte plusieurs types de services. Trouve <em>les 4</em> qui circulent dans le câble.',
          options: [
            { t: 'Le courrier électronique', ok: true, ev: 'mail', fb: 'L’e-mail voyage sur Internet… sans passer par le Web.' },
            { t: 'L’échange de fichiers (FTP)', ok: true, ev: 'ftp', fb: 'FTP : un service pour transférer des fichiers.' },
            { t: 'Le streaming', ok: true, ev: 'stream', fb: 'Vidéo et musique en continu.' },
            { t: 'Le Web', ok: true, ev: 'web', fb: 'Eh oui : le Web n’est qu’un des services d’Internet.' },
            { t: 'Le traitement de texte', ok: false, fb: 'Un logiciel de ton ordinateur : il fonctionne même hors ligne.' },
            { t: 'Le Bluetooth', ok: false, fb: 'Une connexion sans fil à très courte portée, pas un service d’Internet.' }
          ],
          fb: 'Courrier électronique, échange de fichiers (FTP), streaming, Web : Internet transporte tout cela.'
        },
        {
          type: 'hyper', notion: 'hypertexte',
          q: 'Te voilà sur une page Web. Rejoins la page <em>« Serveur »</em> en suivant les liens.',
          start: 'web', goal: 'serveur',
          pages: {
            web: { titre: 'Le Web', html: 'Le Web est un immense ensemble de <b>documents</b> reliés les uns aux autres. Ils sont regroupés en <a data-go="site">sites Web</a> et se consultent avec un <a data-go="navigateur">navigateur</a>.' },
            site: { titre: 'Site Web', html: 'Un site Web est un ensemble de <b>pages</b> contenant de l’information. Il fait partie du <a data-go="web">Web</a>.' },
            navigateur: { titre: 'Navigateur', html: 'Un navigateur (Chrome, Safari, Firefox…) est un <b>client Web</b>. Il demande les pages à un <a data-go="serveur">serveur</a> et les affiche.' },
            serveur: { titre: 'Serveur Web', html: '<b>Arrivé !</b> Un serveur Web stocke les documents et les fournit quand un client les demande.' }
          },
          then: {
            type: 'qcm', notion: 'hypertexte',
            q: 'Tu viens de passer d’un texte à l’autre grâce à des liens. Comment s’appelle ce principe ?',
            options: [
              { t: 'L’hypertexte', ok: true },
              { t: 'Le streaming', ok: false },
              { t: 'Le protocole', ok: false },
              { t: 'Le Wi-Fi', ok: false }
            ],
            fb: 'L’hypertexte, c’est du texte qui contient des liens vers d’autres textes. C’est le fondement du Web.'
          }
        },
        {
          type: 'qcm', notion: 'siteweb',
          q: 'On entend souvent « site Internet ». Quel est le terme correct ?',
          options: [
            { t: 'Site Web : « site Internet » est un abus de langage', ok: true },
            { t: 'Site Internet : « site Web » est un abus de langage', ok: false },
            { t: 'Les deux sont exactement synonymes', ok: false }
          ],
          fb: 'Un site Web est un ensemble de pages contenant de l’information. Il fait partie du Web, pas de l’infrastructure Internet.'
        }
      ]
    },

    /* ================= 5 · CLIENT, SERVEUR & HTTP ================= */
    {
      id: 'http', titre: 'Client, serveur & HTTP', sous: 'Qui demande quoi à qui ?',
      lieu: 'Destination : le serveur',
      c: '#FF85B0', ct: '#FFE3ED', icone: 'server',
      intro: 'Ta requête arrive chez le serveur Web. Qui demande quoi à qui, et dans quelle langue ?',
      memo: ['serveur', 'client', 'http', 'requete', 'navigateur'],
      steps: [
        {
          type: 'qcm', notion: 'serveur',
          q: 'Où sont stockés les documents du Web ?',
          options: [
            { t: 'Sur des serveurs Web', ok: true },
            { t: 'Dans le navigateur', ok: false, fb: 'Le navigateur les affiche, mais il doit d’abord les demander.' },
            { t: 'Dans la box', ok: false },
            { t: 'Dans les câbles d’Internet', ok: false, fb: 'Les câbles transportent les données, ils ne les stockent pas.' }
          ],
          fb: 'Un serveur Web est un ordinateur qui fournit les données quand on les lui demande.'
        },
        {
          type: 'label', scene: { name: 'cs' },
          q: 'Complète le schéma : que représente l’élément <em>qui clignote</em> ?',
          targets: [
            { id: 'client', t: 'Client', notion: 'client', fb: 'Le client : ici, ton navigateur.' },
            { id: 'serveur', t: 'Serveur', notion: 'serveur', fb: 'Le serveur Web : il stocke et fournit les documents.' },
            { id: 'requete', t: 'Requête HTTP', notion: 'requete', fb: 'La requête part du client vers le serveur.' },
            { id: 'reponse', t: 'Réponse', notion: 'requete', fb: 'La réponse revient du serveur vers le client.' }
          ],
          fb: 'Le client envoie une requête HTTP au serveur, qui lui envoie une réponse.'
        },
        {
          type: 'order', notion: 'requete',
          q: 'Remets les étapes dans l’ordre.',
          steps: [
            'Tu saisis une adresse ou une recherche dans le navigateur',
            'Le navigateur (client) envoie une requête HTTP au serveur, via Internet',
            'Le serveur Web envoie sa réponse',
            'Le navigateur affiche la réponse à l’écran'
          ],
          fb: 'Requête du client, réponse du serveur, affichage par le navigateur : c’est tout le Web en trois temps.'
        },
        {
          type: 'qcm', notion: 'http', code: true,
          q: 'Quel protocole le client et le serveur Web utilisent-ils pour communiquer ?',
          options: [
            { t: 'HTTP', ok: true },
            { t: 'HTML', ok: false, fb: 'HTML sert à écrire les pages.' },
            { t: 'FTP', ok: false, fb: 'FTP sert à l’échange de fichiers.' },
            { t: 'URL', ok: false, fb: 'Une URL est une adresse.' }
          ],
          fb: 'HTTP = HyperText Transfer Protocol.'
        },
        {
          type: 'pick', notion: 'navigateur',
          q: 'Un client Web est une application qui se connecte au Web, comme un navigateur. Trouve <em>les 3 navigateurs</em>.',
          options: [
            { t: 'Chrome', ok: true, fb: 'Chrome est un navigateur.' },
            { t: 'Safari', ok: true, fb: 'Safari est un navigateur.' },
            { t: 'Firefox', ok: true, fb: 'Firefox est un navigateur.' },
            { t: 'Google', ok: false, fb: 'Piège ! Google est un moteur de recherche : un site que l’on consulte avec un navigateur.' },
            { t: 'WhatsApp', ok: false, fb: 'Une messagerie : elle utilise Internet, mais ne sert pas à consulter le Web.' },
            { t: 'Windows', ok: false, fb: 'Un système d’exploitation, pas un navigateur.' },
            { t: 'Wi-Fi', ok: false, fb: 'Une connexion sans fil, pas une application.' }
          ],
          fb: 'Chrome, Safari, Firefox : trois clients Web.'
        },
        {
          type: 'qcm', notion: 'navigateur',
          q: 'Quelle est la fonction principale d’un navigateur Web ?',
          options: [
            { t: 'Permettre de consulter des informations sur le Web', ok: true },
            { t: 'Stocker toutes les pages du Web', ok: false, fb: 'Ça, c’est le rôle des serveurs.' },
            { t: 'Fournir l’accès à Internet', ok: false, fb: 'Ça, c’est le rôle du FAI.' },
            { t: 'Classer les sites par popularité', ok: false, fb: 'Ça, c’est le rôle du moteur de recherche.' }
          ],
          fb: 'Le navigateur permet la consultation d’informations sur le Web.'
        }
      ]
    },

    /* ================= 6 · URL, HTML & CSS ================= */
    {
      id: 'html', titre: 'URL, HTML & CSS', sous: 'L’adresse, la structure, le style',
      lieu: 'Le colis du retour',
      c: '#45D4F5', ct: '#DBF6FD', icone: 'doc',
      intro: 'Le serveur a répondu ! Dans le colis : du HTML et du CSS, à livrer au navigateur.',
      memo: ['url', 'html', 'css'],
      steps: [
        {
          type: 'qcm', notion: 'url',
          q: 'Qu’est-ce qu’une URL ?',
          options: [
            { t: 'Une adresse qui mène à une page Web', ok: true },
            { t: 'Un langage pour mettre en forme les pages', ok: false, fb: 'Ça, c’est le CSS.' },
            { t: 'Un type de câble réseau', ok: false },
            { t: 'Le nom d’un navigateur', ok: false }
          ],
          fb: 'Une URL est une adresse qui mène à une page Web.'
        },
        {
          type: 'qcm', notion: 'url', code: true,
          q: 'Laquelle de ces lignes est une URL ?',
          options: [
            { t: 'https://<wbr>fr.wikipedia.org/<wbr>wiki/<wbr>Internet', ok: true },
            { t: 'prenom.nom@exemple.ch', ok: false, fb: 'Ça, c’est une adresse e-mail.' },
            { t: '&lt;h1&gt;Internet&lt;/h1&gt;', ok: false, fb: 'Ça, c’est du HTML.' },
            { t: 'h1 { color: red; }', ok: false, fb: 'Ça, c’est du CSS.' }
          ],
          fb: 'Une URL se saisit dans la barre d’adresse du navigateur.'
        },
        {
          type: 'sort', notion: 'html', scene: { name: 'lab' },
          q: 'Cette page est bien triste… Quel code modifier pour l’améliorer ?',
          cats: [{ id: 'html', label: 'HTML' }, { id: 'css', label: 'CSS' }],
          fixed: true,
          cards: [
            { t: 'Ajouter un paragraphe de texte', cat: 'html', notion: 'html', ev: 'p2', fb: 'Du contenu en plus : c’est du HTML.' },
            { t: 'Changer la couleur du titre', cat: 'css', notion: 'css', ev: 'color', fb: 'La couleur, c’est de la mise en forme : du CSS.' },
            { t: 'Insérer une image', cat: 'html', notion: 'html', ev: 'img', fb: 'Une image fait partie du contenu : HTML.' },
            { t: 'Changer la police et centrer le titre', cat: 'css', notion: 'css', ev: 'type', fb: 'Police et alignement : mise en forme, donc CSS.' },
            { t: 'Ajouter un lien vers une autre page', cat: 'html', notion: 'html', ev: 'link', fb: 'Un lien hypertexte fait partie de la structure : HTML.' },
            { t: 'Mettre un fond coloré', cat: 'css', notion: 'css', ev: 'bg', fb: 'Le fond, c’est encore de la mise en forme : CSS.' }
          ],
          fb: 'Le HTML décrit la structure et le contenu ; le CSS met en forme. Compare avec l’interrupteur sous la page !',
          end: 'compare'
        },
        {
          type: 'qcm', notion: 'navigateur',
          q: 'Quelle application interprète le HTML et le CSS pour afficher la page ?',
          options: [
            { t: 'Le navigateur', ok: true },
            { t: 'Le serveur Web', ok: false, fb: 'Le serveur fournit les fichiers, il ne les affiche pas.' },
            { t: 'Le moteur de recherche', ok: false },
            { t: 'La box', ok: false }
          ],
          fb: 'Les codes HTML et CSS sont interprétés par le navigateur.'
        },
        {
          type: 'match', notion: 'html',
          q: 'Quatre sigles à ne plus jamais confondre. Relie chacun à son rôle.',
          pairs: [
            { a: 'HTML', b: 'Décrit la structure et le contenu de la page', notion: 'html' },
            { a: 'CSS', b: 'Met en forme le code HTML', notion: 'css' },
            { a: 'URL', b: 'Adresse qui mène à une page Web', notion: 'url' },
            { a: 'HTTP', b: 'Protocole entre le client et le serveur', notion: 'http' }
          ],
          fb: 'HTML pour le contenu, CSS pour la forme, URL pour l’adresse, HTTP pour la communication.'
        }
      ]
    },

    /* ================= 7 · LE MOTEUR DE RECHERCHE ================= */
    {
      id: 'moteur', titre: 'Le moteur de recherche', sous: 'Pertinence, popularité, confiance',
      lieu: 'Dernier arrêt',
      c: '#FFD23F', ct: '#FFF4CC', icone: 'search',
      intro: 'Parmi des milliards de pages, comment un moteur de recherche choisit-il lesquelles afficher en premier ?',
      memo: ['moteur'],
      steps: [
        {
          type: 'pick', notion: 'moteur',
          q: 'Sur quels <em>3 critères</em> un moteur de recherche classe-t-il ses résultats ?',
          options: [
            { t: 'La pertinence', ok: true, fb: 'Le contenu de la page correspond-il à la requête ?' },
            { t: 'La popularité', ok: true, fb: 'Le nombre de liens menant vers la page.' },
            { t: 'La confiance', ok: true, fb: 'La qualité des liens qui mènent vers la page.' },
            { t: 'L’ordre alphabétique', ok: false, fb: 'Les résultats ne sont pas rangés de A à Z.' },
            { t: 'La longueur de l’URL', ok: false, fb: 'Une adresse courte ne rend pas une page meilleure.' },
            { t: 'Les couleurs du site', ok: false, fb: 'Le moteur ne juge pas la décoration.' }
          ],
          fb: 'Pertinence, popularité, confiance.'
        },
        {
          type: 'sort', notion: 'moteur',
          q: 'De quel critère parle-t-on ?',
          cats: [{ id: 'pert', label: 'Pertinence' }, { id: 'pop', label: 'Popularité' }, { id: 'conf', label: 'Confiance' }],
          cards: [
            { t: 'Le contenu de la page est-il similaire à la requête ?', cat: 'pert' },
            { t: 'Combien de liens mènent vers cette page ?', cat: 'pop' },
            { t: 'Les liens qui mènent vers cette page sont-ils de qualité ?', cat: 'conf' },
            { t: 'Tu cherches « pigeon » et la page parle bien de pigeons', cat: 'pert' },
            { t: 'Des centaines de sites font un lien vers cette page', cat: 'pop' },
            { t: 'Les sites qui pointent vers elle sont eux-mêmes reconnus et sérieux', cat: 'conf' }
          ],
          fb: 'Pertinence : le contenu. Popularité : le nombre de liens. Confiance : la qualité de ces liens.'
        },
        {
          type: 'rank', notion: 'moteur',
          q: 'À toi de jouer le moteur de recherche ! Quelle page mérite la <em>première place</em> ?',
          query: 'que mange un pigeon',
          results: [
            { titre: 'Recette du gâteau au chocolat', url: 'miam-gateaux.ch/chocolat', pert: 0, liens: 950, conf: 2, ok: false, fb: 'Très populaire, mais hors sujet : la pertinence est nulle.' },
            { titre: 'L’alimentation du pigeon : le guide', url: 'oiseaux-des-villes.ch/pigeon', pert: 3, liens: 320, conf: 3, ok: true },
            { titre: 'mon pigeon il mange quoi ???', url: 'forum-blabla.ch/sujet-8841', pert: 3, liens: 2, conf: 1, ok: false, fb: 'Pertinente, mais presque aucun lien ne mène vers elle.' }
          ],
          fb: 'Le guide est pertinent, populaire (320 liens) et ces liens sont de qualité : il coche les trois critères.'
        }
      ]
    }
  ];

  /* Titres obtenus selon le nombre d'étoiles (sur 21). */
  RX.RANGS = [
    { min: 0, t: 'Stagiaire du réseau' },
    { min: 8, t: 'Technicien·ne du réseau' },
    { min: 14, t: 'Spécialiste du Web' },
    { min: 19, t: 'Légende d’Internet' }
  ];
})();
