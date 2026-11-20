# Requête Express · révision « Internet et Web »

Site de révision interactif pour les élèves d'Informatique 1C. Il reprend les
notions des deux fiches du cours (« Questionnaire Internet » et « Internet et
Web ») sous la forme de **7 missions** qui suivent le trajet d'une requête :
de l'appareil de l'élève jusqu'au serveur Web, et retour.

| Mission | Notions révisées |
|---|---|
| 1 · Le réseau | terminaux, connexion physique (filaire / sans fil), protocoles |
| 2 · LAN, WAN & Internet | LAN, WAN, Internet « réseau de réseaux » |
| 3 · La box & l'accès | FAI / ISP, modem-routeur, switch, point d'accès Wi-Fi, Wi-Fi ou 4G/5G |
| 4 · Internet ≠ Web | différence Internet / Web, services d'Internet, hypertexte, site Web |
| 5 · Client, serveur & HTTP | serveur Web, client Web, requête et réponse, HTTP, navigateurs |
| 6 · URL, HTML & CSS | URL, rôle du HTML et du CSS, interprétation par le navigateur |
| 7 · Le moteur de recherche | pertinence, popularité, confiance |

Environ 75 réponses à donner, 20 minutes de jeu. À la fin, le bouton
**« Imprimer ma synthèse »** produit une feuille A4 recto verso : résultats de
l'élève, notions à revoir, schéma récapitulatif, mémo complet, QR code et lien
pour rejouer.

## Mettre le site en ligne (GitHub Pages)

1. Fusionner cette branche dans `main`.
2. Sur GitHub : **Settings → Pages → Build and deployment**, choisir
   **Source : Deploy from a branch**, puis **Branch : `main`**, dossier
   **`/ (root)`**, et **Save**.
3. Après une à deux minutes, le site est disponible à l'adresse
   <https://makkura9.github.io/revision-internet-web/>.

Le lien et le QR code affichés dans le site reprennent automatiquement
l'adresse à laquelle il est consulté. L'adresse écrite dans `js/data.js`
(`RX.SITE.url`) ne sert que lorsque le site est ouvert en local.

## En classe

- **Faire venir les élèves sur le site** : sur l'écran d'accueil, « Afficher le
  QR code du site » ouvre un grand QR code à projeter.
- **Prénom** : facultatif, il apparaît seulement sur la synthèse. Il peut aussi
  être saisi ou corrigé sur l'écran de bilan.
- **Score** : seule la première réponse compte. 3 étoiles à partir de 90 % de
  bonnes réponses, 2 à partir de 65 %, 1 sinon. Une mission peut être rejouée ;
  le meilleur score est conservé.
- **Synthèse** : elle peut être imprimée à tout moment depuis « Bilan &
  synthèse », même si toutes les missions ne sont pas terminées. Sur téléphone,
  la fenêtre d'impression permet d'« enregistrer au format PDF ».
- **Données** : aucune inscription, aucun traceur, aucune requête vers un
  service externe. La progression est enregistrée dans le navigateur de l'élève
  (`localStorage`) et ne quitte pas son appareil.

## Carte mentale à compléter (fiche papier)

Pour les élèves qui terminent les missions avant la fin de la période : une
feuille **A4 paysage** à remplir **de mémoire**, avec la même charte graphique
que le site. Chaque mission est une branche (même couleur, même icône), avec
54 cases à compléter. Les cases en pointillés sont dimensionnées pour une
écriture à la main.

| Fichier | Usage |
|---|---|
| `fiches/carte-mentale.pdf` | fiche élève, en couleur |
| `fiches/carte-mentale-nb.pdf` | fiche élève, noir et blanc : peu d'encre, pour la photocopieuse (les élèves peuvent colorier les branches) |
| `fiches/carte-mentale-corrige.pdf` | corrigé, à projeter ou à afficher |
| `fiches/carte-mentale.html` | la source des PDF, imprimable depuis le navigateur |

**Imprimer** : le PDF en orientation paysage, à 100 % (« taille réelle »).
La fiche garde 7 mm de marge, ce qui suffit à la plupart des imprimantes ; si
la vôtre rogne les bords, choisir « Ajuster à la page ».

**En classe**, la fiche propose trois étapes, inspirées de la pratique du
rappel (*retrieval practice*) :

1. **De mémoire** : l'élève complète les cases sans regarder le cours.
2. **Vérifie** : sur le site, dans « Bilan & synthèse », puis « Relire tout le
   mémo ». Toutes les réponses figurent dans ce mémo.
3. **Corrige en vert** : ce qui est ajouté en vert montre ce qu'il reste à
   réviser. L'élève colorie ensuite les 3 étoiles de chaque mission et note
   dans « Mon bilan » les notions à revoir en priorité.

Aucune réponse n'est imprimée ailleurs sur la fiche élève (les titres et les
consignes ne trahissent pas les cases). Le corrigé donne une réponse par case.
Réponses également acceptées :

- *Mission 2* : tout exemple de réseau local (maison, appartement, bureau,
  bâtiment, salle d'informatique).
- *Mission 3* : « switch » ou « commutateur » ; « réseau local » ou « LAN » ;
  « l'opérateur » ou « ses antennes ».
- *Mission 4* : les 4 services dans n'importe quel ordre (« courrier
  électronique » pour e-mail, « échange de fichiers » pour FTP).
- *Mission 5* : « navigateur » ou « client Web » sous l'ordinateur ;
  « requête » avec ou sans « HTTP » ; tout navigateur réel (Edge, Opera…),
  mais pas Google, qui est un moteur de recherche.

**Modifier la fiche** : le texte se trouve dans `fiches/carte-mentale.html`.
Une case s'écrit `<span class="b" style="--w:24mm"><i>réponse</i></span>` :
`--w` est la largeur de la case, `<i>` la réponse affichée dans le corrigé.
Les branches se redessinent seules. Pour refaire les PDF, ouvrir la page dans
Chrome ou Edge, choisir la version dans la barre du haut, puis « Imprimer » →
« Enregistrer au format PDF », avec **Marges : aucune** et **Graphiques
d'arrière-plan** cochés.

## Modifier le contenu

Tout le texte pédagogique se trouve dans **`js/data.js`** :

- `RX.SITE` : nom de la classe et de l'établissement (en-tête de la synthèse) ;
- `RX.NOTIONS` : les définitions du mémo (`t` = titre, `d` = définition) ;
- `RX.MISSIONS` : les missions et leurs étapes.

Chaque étape a un `type`, une consigne `q` et une `notion` (la clé de
`RX.NOTIONS` signalée « à revoir » en cas d'erreur) :

| Type | Jeu | Champs principaux |
|---|---|---|
| `qcm` | une seule bonne réponse | `options: [{ t, ok, fb }]`, `fb` |
| `pick` | trouver toutes les bonnes réponses | `options: [{ t, ok, fb }]` |
| `sort` | classer des cartes (boutons ou glisser) | `cats: [{ id, label }]`, `cards: [{ t, cat }]` |
| `acronym` | retrouver les mots d'un sigle | `slots: [{ l, ok, choices }]`, `reveal` |
| `match` | relier des paires | `pairs: [{ a, b }]` |
| `order` | remettre dans l'ordre | `steps: [...]` (dans le bon ordre) |
| `label` | légender le schéma client / serveur | `targets: [{ id, t }]` |
| `hyper` | mini-Web à explorer, puis une question | `pages`, `start`, `goal`, `then` |
| `rank` | choisir le meilleur résultat de recherche | `query`, `results` |

`fb` est l'explication affichée après la réponse. Les réponses sont mélangées à
chaque partie. Pour ajouter une question, le plus simple est de copier une
étape `qcm` existante.

## Tester en local

Ouvrir `index.html` dans un navigateur suffit. Pour un test plus proche de la
mise en ligne :

```bash
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

## Organisation des fichiers

```
index.html          page unique + bibliothèque d'icônes SVG
css/style.css       mise en forme et animations
css/print.css       synthèse imprimable (A4)
js/data.js          CONTENU : notions, missions, questions
js/core.js          outils, sauvegarde locale, QR code
js/fx.js            fond animé, étincelles, confettis
js/scenes.js        illustrations animées des missions
js/activities.js    les mini-jeux
js/app.js           écrans : accueil, carte, mission, bilan, synthèse
fiches/             carte mentale à compléter (HTML source + 3 PDF)
assets/fonts/       polices (hébergées avec le site)
vendor/qrcode.js    générateur de QR code
```

Le site est en HTML, CSS et JavaScript simples : pas d'installation, pas
d'étape de compilation.

## Crédits

- Polices : Bricolage Grotesque, Lexend et DM Mono, sous licence SIL Open Font
  License 1.1 (textes dans `assets/fonts/`).
- QR code : [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
  de Kazuhiko Arase, licence MIT.
