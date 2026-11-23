# Paquet Express · cours « TCP/IP »

Cours interactif de 40 minutes pour les élèves d’Informatique 1C (École de
culture générale, Gymnase de Burier). Il fait suite au cours « Internet et
Web » et à son site de révision *Requête Express*, dont il reprend l’univers
graphique et la mascotte, Bip.

On suit le voyage d’une requête HTTP, de la salle d’informatique jusqu’au
serveur du site fictif `www.pigeon-voyageur.example`, sur une carte du réseau :
LAN du gymnase, WAN du FAI, Internet et centre de données de l’hébergeur.

| Partie | Durée | Notions |
|---|---|---|
| 1 · Le départ | 5 min | rappel : LAN, WAN, FAI, Internet ; hébergeur et centre de données |
| 2 · L’adresse | 8 min | adresse IP (IPv4), DNS, adresse privée et adresse publique |
| 3 · Le voyage | 7 min | paquets, en-tête IP, routeurs et routage, réseau maillé |
| 4 · La livraison | 7 min | TCP (numéros, accusés de réception, renvois), ports |
| 5 · Emballe et envoie ! | 11 min | les 4 couches du modèle TCP/IP, encapsulation, mission finale |
| Bilan | 2 min | conclusion, fiche imprimable (trace écrite) |

Chaque partie alterne un **point prof** (cartes d’explication à projeter, avec
une question « À ton avis ? » pour lancer la discussion) et des **exercices en
autonomie**, corrigés et expliqués immédiatement. Un **défi bonus** occupe les
élèves en avance. La mission finale fait construire le paquet couche par couche
(message HTTP → segment TCP → paquet IP → trame), puis suivre son voyage animé
sur la carte, aller et retour.

## Les deux livrables

- **`docs/`** : le site des élèves (publié avec GitHub Pages).
- **`prof/guide-prof.pdf`** : le guide du professeur — déroulé minuté, script
  des points prof, toutes les réponses commentées, carte de référence avec
  toutes les adresses, points de vigilance, précisions scientifiques,
  questions fréquentes des élèves, glossaire.

## Mettre le site en ligne (GitHub Pages)

1. Sur GitHub : **Settings → Pages → Build and deployment**.
2. **Source : Deploy from a branch**, puis **Branch : `main`** et dossier
   **`/docs`**, et **Save**.
3. Après une à deux minutes, le site est disponible à l’adresse
   <https://makkura9.github.io/cours-tcp-ip/>.

Seul le dossier `docs/` est publié : le guide du professeur n’apparaît pas sur
le site des élèves. Il reste toutefois visible dans le dépôt si celui-ci est
public.

Le lien et le QR code affichés dans le site reprennent automatiquement
l’adresse à laquelle il est consulté. L’adresse écrite dans `docs/js/data.js`
(`RX.SITE.url`) ne sert que lorsque le site est ouvert en local.

## En classe

- **Faire venir les élèves** : lien « Mode projection » en bas de l’accueil,
  puis « Faire venir les élèves » (grand QR code). Le prénom est facultatif ; il
  n’apparaît que sur la fiche imprimable.
- **Points prof** : en mode projection, chaque partie s’affiche en plein écran.
  `→` ou `Espace` : carte suivante, `←` : précédente, `F` : plein écran,
  `Échap` : retour au menu. Les élèves voient les mêmes cartes sur leur écran
  et peuvent les relire pendant les exercices (bouton *Mémo*).
- **Carte du voyage** (mode projection) : boutons pour afficher les noms des
  zones, les propriétaires, les adresses IP, l’adresse publique du routeur, et
  pour faire voyager Bip.
- **Rythme** : lancez le point prof suivant quand la majorité a fini ; une
  partie inachevée peut être quittée (✕) et rejouée plus tard.
- **Score** : seule la première réponse compte. 3 étoiles dès 90 % de réponses
  justes du premier coup, 2 dès 65 %, 1 sinon. Les erreurs signalent les
  notions « à revoir » dans le bilan.
- **Fiche imprimable** : dans « Bilan & fiche », une feuille A4 recto verso
  (résultats, notions à revoir, carte complète, 4 couches, paquet encapsulé,
  mémo). Sans imprimante : « Enregistrer au format PDF ».
- **Données** : aucune inscription, aucun traceur, aucune requête vers un
  service externe. La progression est enregistrée dans le navigateur de
  l’élève (`localStorage`) et ne quitte pas son appareil.

## Un scénario fictif, mais exact

- `.example` est un domaine de premier niveau réservé aux exemples (RFC 2606) :
  le site `www.pigeon-voyageur.example` n’existe pas.
- Les adresses publiques (`198.51.100.…`, `203.0.113.…`) viennent des blocs
  réservés à la documentation (RFC 5737) ; celles du LAN (`192.168.10.…`) sont
  des adresses privées (RFC 1918).
- Les adresses MAC commençant par `02` sont « administrées localement » et
  n’appartiennent à aucun fabricant.

Les simplifications du cours (numérotation TCP 1, 2, 3, traduction d’adresses,
trames Wi-Fi, noms des couches…) sont détaillées dans la partie « Précisions
scientifiques » du guide.

## Modifier le contenu

Tout le texte pédagogique se trouve dans **`docs/js/data.js`** :

- `RX.NET` : les adresses du scénario ;
- `RX.CARTE` : la carte (zones, appareils, liaisons), en deux mises en page :
  large (`w`) et étroite pour les téléphones (`t`) ;
- `RX.NOTIONS` : le mémo (`t` = titre, `d` = définition) ;
- `RX.PARTIES` : les 5 parties, avec leurs cartes d’explication (`slides`),
  leurs exercices (`steps`) et leurs défis (`bonus`) ;
- `RX.MISSION` et `RX.VOYAGE` : la mission finale (construction du paquet,
  étapes du voyage).

Types d’exercices :

| Type | Activité |
|---|---|
| `qcm` | une seule bonne réponse |
| `pick` | trouver toutes les bonnes réponses |
| `sort` | classer des cartes (2 à 4 catégories) |
| `match` | relier des paires |
| `order` | remettre dans l’ordre |
| `maplabel` | nommer les zones de la carte |
| `dns` | choisir la partie de l’adresse à envoyer au DNS, puis un QCM |
| `route` | jouer les routeurs sur la carte (2 manches, une panne) |
| `tcp` | remettre des morceaux en ordre ; l’un d’eux manque |
| `encaps` | construire le paquet couche par couche |
| `journey` | suivre le voyage du paquet sur la carte |

`fb` est l’explication affichée après la réponse ; `notion` est la clé de
`RX.NOTIONS` signalée « à revoir » en cas d’erreur.

### Régénérer le guide du professeur

Les corrigés du guide sont produits **à partir de `docs/js/data.js`** : après
une modification du contenu, régénérez le PDF pour qu’il reste identique au
site. Il faut Node.js et Playwright :

```bash
npm install playwright
```

```bash
npx playwright install chromium
```

```bash
node outils/generer-guide.js
```

Le texte rédigé du guide (déroulé, script des points prof, précisions
scientifiques…) se trouve dans `prof/guide-prof.html`.

## Tester en local

```bash
python3 -m http.server 8000 --directory docs
```

puis ouvrir <http://localhost:8000>. (Ouvrir directement `docs/index.html`
fonctionne aussi, mais le navigateur peut alors refuser de charger les polices.)

## Organisation des fichiers

```
docs/                    site des élèves (publié)
  index.html             page unique + bibliothèque d'icônes SVG
  css/style.css          mise en forme, carte, animations, mode projection
  css/print.css          fiche imprimable (A4)
  js/data.js             CONTENU : scénario, carte, parties, exercices, mémo
  js/core.js             outils, sauvegarde locale, QR code
  js/fx.js               fond animé, étincelles, confettis
  js/map.js              la carte du réseau (deux mises en page, animation de Bip)
  js/scenes.js           illustrations des cartes d'explication
  js/activities.js       les exercices
  js/app.js              écrans : accueil, parcours, parties, bilan, projection, fiche
  assets/                polices et icône
  vendor/qrcode.js       générateur de QR code
prof/
  guide-prof.pdf         guide du professeur
  guide-prof.html        source du guide (textes rédigés)
  guide.css, guide.js    mise en page et génération des corrigés
outils/
  generer-guide.js       génère prof/guide-prof.pdf
```

Le site est en HTML, CSS et JavaScript simples : pas d’installation, pas
d’étape de compilation.

## Crédits

- Polices : Bricolage Grotesque, Lexend et DM Mono, sous licence SIL Open Font
  License 1.1 (textes dans `docs/assets/fonts/`).
- QR code : [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
  de Kazuhiko Arase, licence MIT.
