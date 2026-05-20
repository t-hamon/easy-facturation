# Facturation — Logiciel de facturation conforme 2026

Un logiciel de facturation **100 % local**, **gratuit** et **conforme à la réglementation française 2026**. Il fonctionne directement dans votre navigateur, sans serveur, sans envoi de données sur Internet.

**[Essayer en ligne](https://t-hamon.github.io/easy-facturation/)** · **[Télécharger](https://github.com/t-hamon/easy-facturation/archive/refs/heads/main.zip)**

## Caractéristiques

- **20 mentions obligatoires** de la facturation française intégrées (Code de commerce, CGI)
- **Nouvelles obligations 2026** : SIREN du client, adresse de livraison, nature de la transaction, option TVA d'après les débits
- **Aide contextuelle** : un point d'interrogation à côté de chaque champ complexe pour expliquer comment le remplir
- **Mise à jour automatique** des totaux, calcul TVA multi-taux
- **Mode franchise de TVA** automatique (auto-entrepreneurs) avec mention « Art. 293 B du CGI »
- **Numérotation automatique** des factures (séquence continue, respect des règles fiscales)
- **Export PDF** professionnel
- **Sauvegarde locale** dans le navigateur (aucune donnée envoyée à l'extérieur)
- **Historique** des factures émises
- **Mémorisation** des données de la société émettrice
- **Multi-unités** de quantité (heures, kg, m², forfait, etc.)

## Installation

**Aucune installation requise.** Il vous suffit d'ouvrir le fichier `index.html` dans n'importe quel navigateur web moderne (Chrome, Firefox, Edge, Safari).

### Démarrage rapide

1. Téléchargez ou copiez le dossier complet
2. Double-cliquez sur le fichier `index.html`
3. C'est tout ! Le logiciel s'ouvre dans votre navigateur

### Connexion Internet

Le logiciel charge deux librairies depuis un CDN au premier lancement (jsPDF pour la génération PDF et une police Google Fonts). Si vous êtes hors ligne au premier lancement, ces librairies seront indisponibles. Une fois chargées, le cache du navigateur permet d'utiliser le logiciel hors ligne.

Pour un **fonctionnement 100 % hors ligne**, téléchargez et placez localement :
- `jsPDF` : <https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js>
- `jsPDF AutoTable` : <https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js>

Puis modifiez les chemins dans `index.html` (balises `<script>` en bas du fichier).

## Structure des fichiers

```
facturation/
├── index.html          # Page principale (interface utilisateur)
├── styles.css          # Mise en forme (design)
├── app.js              # Logique de l'application
├── data-manager.js     # Gestion de la sauvegarde locale
├── pdf-export.js       # Génération du PDF
├── help-content.js     # Contenu des bulles d'aide
└── README.md           # Ce fichier
```

## Utilisation

### 1. Première facture

Au premier lancement, remplissez les informations de votre **société émettrice** (étape 1). Cliquez ensuite sur « Mémoriser ces informations » pour que ces données soient automatiquement réutilisées pour vos prochaines factures.

### 2. Cycle de facturation

1. **Émetteur** : vos coordonnées (déjà pré-remplies après mémorisation)
2. **Identification** : le numéro est suggéré automatiquement, les dates également selon vos conditions de règlement
3. **Destinataire** : entreprise (avec SIREN obligatoire) ou particulier
4. **Lignes de facture** : ajoutez autant de lignes que nécessaire avec l'unité adaptée (heure, kg, forfait...)
5. **Totaux** : calculés automatiquement
6. **TVA** : cochez « non assujetti » si vous êtes en franchise, sinon le détail multi-taux est généré automatiquement
7. **Paiement** : RIB et référence
8. **Mentions légales** : automatiquement intégrées

### 3. Export et archivage

- **Enregistrer** : la facture est mémorisée localement dans votre navigateur
- **Exporter en PDF** : génère un PDF prêt à envoyer (et enregistre automatiquement)
- **Historique** : retrouvez toutes vos factures, modifiez-les ou re-générez le PDF

## Important — Mentions légales 2026

Le logiciel intègre les 20 mentions obligatoires en 2026, mais **vous restez responsable** du contenu de vos factures. Il est recommandé de :

- Conserver vos factures au format PDF pendant **10 ans** (durée légale)
- Respecter la **numérotation chronologique continue** (le logiciel vous y aide automatiquement)
- Demander le **SIREN à vos clients professionnels** (obligatoire 2026)
- Vous renseigner sur la **réforme de la facturation électronique** (entrée en vigueur progressive à partir du 1<sup>er</sup> septembre 2026 — voir [impots.gouv.fr](https://www.impots.gouv.fr))

## Vie privée

Aucune donnée n'est envoyée sur Internet. Tout est stocké dans le `localStorage` de votre navigateur. Pour effacer toutes les données, videz le cache de votre navigateur ou utilisez les options « Réinitialiser » et « Effacer les informations mémorisées » du logiciel.

**Faites des sauvegardes** : si vous changez d'ordinateur ou videz le cache du navigateur, vos données seront perdues. Pensez à exporter régulièrement vos factures en PDF.

## Personnalisation

Le code est entièrement libre et personnalisable :
- **Couleurs** : modifiez les variables CSS au début de `styles.css`
- **Mentions par défaut** : éditez les textes dans `index.html`
- **Aides contextuelles** : modifiez `help-content.js`
- **Format du numéro de facture** : ajustez la fonction `suggestNextNumber()` dans `data-manager.js`

## Limitations

Ce logiciel est conçu pour les **petites structures** (auto-entrepreneurs, freelances, TPE, PME) qui souhaitent émettre des factures conformes en toute simplicité. Il **ne gère pas** :

- L'envoi automatique par email
- La synchronisation entre plusieurs appareils
- La facturation électronique au format Factur-X (obligatoire en B2B à partir du 1<sup>er</sup> septembre 2026 pour les grandes entreprises, 2027 pour TPE/PME)
- L'intégration comptable

Pour la facturation électronique B2B obligatoire, vous devrez utiliser une **Plateforme de Dématérialisation Partenaire (PDP)** agréée par l'administration fiscale ([liste sur impots.gouv.fr](https://www.impots.gouv.fr)).

**!! ATTENTION !! Pour la facturation B2B (entre professionnels)** :
A partir du **1er Septembre 2027** vos factures B2B pour les TPE/PME/micro-entreprises devront obligatoirement transiter par une **Plateforme Agréée (PA)** immatriculée par l'état. Ce logiciel génère un PDF conforme, mais ne peut pas transmettre vos factures à la **PA**. Cela nécessite une inscription chez un opérateur agréé.

**La démarche** :
1. Inscrivez-vous (gratuitement pour les petits volumes) chez une PA telle que **Tiime, Abby, Indy, Dougs Facturation** ou **Qonto**. Toutes proposent un plan gratuit pour les indépendants et TPE.
2. Signez le mandat désignant cette PA dans l'annuaire officiel (rattachée à votre SIREN)
3. Téléversez le **PDF généré** par ce logiciel dans votre PA. Elle se charge de la conversion en Factur-X et de la transmission.
4. La **liste officielle complète** des PA est sur impots.gouv.fr (112 plateformes immatriculées au moment de la création de ce Readme)

Pour la facturation aux **particuliers (B2C)**, ou aux **clients étrangers** : Ce logiciel suffit, aucune PA n'est recquise.

## Licence

Ce projet est distribué sous licence MIT: voir le fichier [LICENSE](LICENSE) pour les détails.
