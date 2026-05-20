/* 
   help-content.js
   Contenu pédagogique affiché dans la modale d'aide
   Chaque clé correspond à un attribut data-help
    */

const HELP_CONTENT = {
  capital: {
    title: 'Capital social',
    body: `
      <p><strong>Pour les sociétés uniquement</strong> (SARL, SAS, SA, EURL, SASU, SCI, SNC...).</p>
      <p>C'est le montant que les associés ont apporté lors de la création de l'entreprise. Vous le trouvez sur votre extrait Kbis ou dans vos statuts.</p>
      <p><strong>Vous êtes en EI, micro-entreprise ou association ?</strong> Laissez ce champ vide, il ne vous concerne pas.</p>
    `,
  },

  siret: {
    title: 'Numéro SIRET',
    body: `
      <p>Le SIRET est un numéro à <strong>14 chiffres</strong> qui identifie chaque établissement de votre entreprise.</p>
      <p>Il est composé du SIREN (9 chiffres, identifie l'entreprise) + NIC (5 chiffres, identifie l'établissement).</p>
      <p><strong>Où le trouver ?</strong></p>
      <ul>
        <li>Sur votre extrait Kbis (sociétés)</li>
        <li>Sur votre avis de situation INSEE</li>
        <li>Sur <em>annuaire-entreprises.data.gouv.fr</em> en cherchant votre nom</li>
      </ul>
    `,
  },

  rcs: {
    title: 'Numéro RCS / RM',
    body: `
      <p><strong>RCS</strong> (Registre du Commerce et des Sociétés) : obligatoire pour les commerçants et la plupart des sociétés.</p>
      <p>Format : <em>RCS [Ville d'immatriculation] [numéro SIREN]</em></p>
      <p>Exemple : <em>RCS Paris 123 456 789</em></p>
      <p><strong>RM</strong> (Répertoire des Métiers) : pour les artisans inscrits à la Chambre de Métiers.</p>
      <p><strong>Vous êtes en profession libérale ?</strong> Vous n'êtes pas concerné, laissez vide.</p>
    `,
  },

  'vat-num': {
    title: 'Numéro de TVA intracommunautaire',
    body: `
      <p>Obligatoire si vous êtes <strong>assujetti à la TVA</strong>.</p>
      <p>Format français : <strong>FR</strong> + clé à 2 chiffres + votre SIREN à 9 chiffres.</p>
      <p>Exemple : <em>FR12 345678901</em></p>
      <p><strong>Si vous êtes en franchise de base de TVA</strong> (auto-entrepreneur en dessous des seuils), laissez vide. Vous cocherez la case "non assujetti" dans la section TVA.</p>
      <p>Vous pouvez retrouver votre numéro sur le site des impôts (espace professionnel) ou le calculer : <em>(12 + 3 × (SIREN modulo 97)) modulo 97</em>.</p>
    `,
  },

  'invoice-number': {
    title: 'Numéro de facture',
    body: `
      <p>Le numéro de facture doit respecter une <strong>séquence chronologique continue</strong> : il ne doit jamais y avoir de saut ni de remise à zéro en cours d'année.</p>
      <p><strong>Formats recommandés :</strong></p>
      <ul>
        <li><em>FAC-2026-0001</em>, <em>FAC-2026-0002</em>, ...</li>
        <li><em>2026-001</em>, <em>2026-002</em>, ...</li>
        <li><em>F2026010001</em> (année + mois + numéro)</li>
      </ul>
      <p>⚠️ <strong>Évitez :</strong> repartir à 001 chaque mois. L'administration fiscale pourrait considérer cela comme une dissimulation de factures.</p>
      <p>Le logiciel vous suggère un numéro qui suit la dernière facture émise.</p>
    `,
  },

  'issue-date': {
    title: "Date d'émission",
    body: `
      <p>C'est la date à laquelle vous <strong>créez la facture</strong>.</p>
      <p>Règle générale : la facture doit être émise dès la réalisation de la vente ou de la prestation, et <strong>au plus tard le 15 du mois suivant</strong>.</p>
      <p><strong>Exemple :</strong> Vous terminez une prestation le 22 mars. Vous pouvez émettre la facture entre le 22 mars et le 15 avril.</p>
      <p>La date d'émission ne peut pas être antérieure à la date de la prestation ou de la livraison.</p>
    `,
  },

  'due-date': {
    title: "Date d'échéance",
    body: `
      <p>C'est la date <strong>limite</strong> à laquelle votre client doit avoir payé la facture.</p>
      <p><strong>Délais légaux maximums entre professionnels :</strong></p>
      <ul>
        <li><strong>30 jours</strong> par défaut, à compter de la livraison ou de la prestation, si rien n'est convenu</li>
        <li><strong>60 jours</strong> à compter de l'émission de la facture (maximum légal)</li>
        <li><strong>45 jours fin de mois</strong> est aussi accepté</li>
      </ul>
      <p><strong>Avec un particulier :</strong> en principe, paiement à réception. Vous pouvez accorder un délai si vous le souhaitez.</p>
      <p>Le logiciel ajuste automatiquement la date selon les conditions de règlement choisies.</p>
    `,
  },

  'sale-type': {
    title: 'Type de vente',
    body: `
      <p>Depuis 2026, cette mention est <strong>obligatoire</strong> sur chaque facture.</p>
      <p><strong>Livraison de biens :</strong> vous vendez des produits physiques (marchandises, fournitures, objets...).</p>
      <p><strong>Prestation de services :</strong> vous vendez du temps, du conseil, un savoir-faire (consulting, coiffure, formation, développement...).</p>
      <p><strong>Opération mixte :</strong> vous vendez à la fois des biens ET des services sur la même facture (exemple : vente d'un équipement + installation).</p>
    `,
  },

  'recipient-siren': {
    title: 'SIREN du client',
    body: `
      <p>Depuis le 1<sup>er</sup> septembre 2026, le <strong>numéro SIREN du client</strong> est obligatoire dès lors que la facture est adressée à une entreprise française.</p>
      <p>Le SIREN comporte <strong>9 chiffres</strong> (les 9 premiers chiffres de son SIRET).</p>
      <p><strong>Où le trouver ?</strong></p>
      <ul>
        <li>Demandez-le directement à votre client</li>
        <li>Recherchez-le sur <em>annuaire-entreprises.data.gouv.fr</em></li>
        <li>Cherchez sur le site Pappers ou Societe.com</li>
        <li><strong>!! ATTENTION !! Pour la facturation B2B (entre professionnels)</strong> :</li>
        <li>A partir du <strong>1er Septembre 2027</strong> vos factures B2B pour les TPE/PME/micro-entreprises</li>
        <li>devront obligatoirement transiter par une <strong>Plateforme Agréée (PA)</strong> immatriculée par l'état.</li>
        <li>Ce logiciel génère un PDF conforme, mais ne peut pas transmettre vos factures à la <strong>PA</strong>.</li>
        <li>Cela nécessite une inscription chez un opérateur agréé.</li>
      </ul>
      <p><strong>La démarche</strong> :</p>
      <ul>
        <li>1. Inscrivez-vous (gratuitement pour les petits volumes) chez une PA telle que <strong>Tiime, Abby, Indy, Dougs Facturation</strong> ou <strong>Qonto</strong>. Toutes proposent un plan gratuit pour les indépendants et TPE.</li>
        <li>2. Signez le mandat désignant cette PA dans l'annuaire officiel (rattachée à votre SIREN)</li>
        <li>3. Téléversez le <strong>PDF généré</strong> par ce logiciel dans votre PA. Elle se charge de la conversion en Factur-X et de la transmission.</li>
      </ul>
            4. La <strong>liste officielle complète</strong> des PA est sur impots.gouv.fr (112 plateformes immatriculées au moment de la création de ce Readme)

            Pour la facturation aux <strong>particuliers (B2C)</strong>, ou aux <strong>clients étrangers</strong> : Ce logiciel suffit, aucune PA n'est recquise.
      </ul>
    `,
  },

  'delivery-address': {
    title: 'Adresse de livraison',
    body: `
      <p>Depuis 2026, lorsque l'adresse de livraison <strong>diffère de l'adresse de facturation</strong>, elle doit obligatoirement figurer sur la facture.</p>
      <p><strong>Exemple :</strong> votre client a son siège social à Paris, mais la marchandise est livrée à son entrepôt de Lyon. Cochez cette case et indiquez l'adresse de Lyon.</p>
      <p>Si l'adresse de livraison est identique à l'adresse de facturation, laissez la case décochée.</p>
    `,
  },

  'vat-status': {
    title: 'Êtes-vous assujetti à la TVA ?',
    body: `
      <p><strong>Vous N'ÊTES PAS assujetti à la TVA (franchise en base) si :</strong></p>
      <ul>
        <li>Vous êtes en <strong>micro-entreprise</strong> et n'avez pas dépassé les seuils de franchise (voir ci-dessous)</li>
        <li>Vous avez opté pour la franchise en base de TVA</li>
        <li>Certaines associations ou activités spécifiques</li>
      </ul>
      <p><strong>Seuils de franchise de TVA (2025) :</strong></p>
      <ul>
        <li><strong>Vente de marchandises :</strong> 85 000 € de CA annuel (seuil majoré : 93 500 €)</li>
        <li><strong>Prestations de services :</strong> 37 500 € de CA annuel (seuil majoré : 41 250 €)</li>
      </ul>
      <p>Si vous êtes en franchise, cochez la case. Le logiciel ajoute automatiquement la mention <em>« TVA non applicable, art. 293 B du CGI »</em> requise par la loi.</p>
      <p>!! ATTENTION !! Si vous dépassez les seuils en cours d'année, vous devez commencer à facturer la TVA dès le 1<sup>er</sup> jour du mois de dépassement.</p>
    `,
  },

  'vat-debits': {
    title: "Option TVA d'après les débits",
    body: `
      <p>Il existe deux régimes pour la TVA sur les prestations de services :</p>
      <p><strong>TVA sur les encaissements (par défaut) :</strong> vous reversez la TVA à l'État au moment où votre client vous paie.</p>
      <p><strong>TVA sur les débits (sur option) :</strong> vous reversez la TVA dès l'émission de la facture, même si le client n'a pas encore payé.</p>
      <p>Si vous avez choisi cette option auprès des impôts, cochez cette case. La mention <em>« TVA acquittée d'après les débits »</em> sera ajoutée à la facture (obligatoire depuis 2026).</p>
      <p>!! ATTENTION !! Cette option ne concerne pas les ventes de biens, qui sont toujours soumises à la TVA dès la livraison.</p>
    `,
  },
};
