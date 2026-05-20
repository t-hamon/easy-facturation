/* 
   app.js
   Logique principale de l'application de facturation
    */

// ÉTAT
const state = {
  recipientType: 'company',
  logoData: null,
  lines: [],
  currentInvoiceId: null,
};

// Unités de quantité proposées
const UNITS = [
  { value: 'unité', label: 'Unité(s)' },
  { value: 'heure', label: 'Heure(s)' },
  { value: 'jour', label: 'Jour(s)' },
  { value: 'demi-journée', label: 'Demi-journée(s)' },
  { value: 'forfait', label: 'Forfait' },
  { value: 'kg', label: 'Kilogramme(s)' },
  { value: 'g', label: 'Gramme(s)' },
  { value: 'tonne', label: 'Tonne(s)' },
  { value: 'litre', label: 'Litre(s)' },
  { value: 'ml', label: 'Millilitre(s)' },
  { value: 'm', label: 'Mètre(s)' },
  { value: 'm²', label: 'Mètre carré(s)' },
  { value: 'm³', label: 'Mètre cube(s)' },
  { value: 'km', label: 'Kilomètre(s)' },
  { value: 'lot', label: 'Lot(s)' },
  { value: 'autre', label: 'Autre' },
];

// Taux de TVA proposés
const VAT_RATES = [20, 10, 5.5, 2.1, 0];

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHelpModal();
  initLogoUpload();
  initRecipientToggle();
  initLineManagement();
  initVATToggle();
  initDateLogic();
  initActions();
  initIssuerSave();
  initDeliveryToggle();

  // Chargement des infos émetteur si elles existent
  loadIssuerData();

  // Suggestion d'un numéro de facture
  suggestInvoiceNumber();

  // Initialisation des dates
  setDefaultDates();

  // Ajout d'une première ligne vide
  addLine();

  // Mise à jour des totaux
  recalculate();

  // Refresh historique
  refreshHistory();
});

// NAVIGATION
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.nav-item')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      document
        .querySelectorAll('.view')
        .forEach((v) => v.classList.remove('active'));
      document.getElementById(`view-${view}`).classList.add('active');

      if (view === 'history') refreshHistory();
      if (view === 'settings') refreshSettings();
    });
  });
}

// MODALE D'AIDE
function initHelpModal() {
  const modal = document.getElementById('help-modal');
  const titleEl = document.getElementById('help-title');
  const contentEl = document.getElementById('help-content');

  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('help')) {
      const key = e.target.dataset.help;
      const content = HELP_CONTENT[key];
      if (content) {
        titleEl.textContent = content.title;
        contentEl.innerHTML = content.body;
        modal.hidden = false;
      }
    }
  });

  document.getElementById('help-close').addEventListener('click', () => {
    modal.hidden = true;
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.hidden = true;
  });
}

// LOGO
function initLogoUpload() {
  const input = document.getElementById('logo-input');
  const preview = document.getElementById('logo-preview');
  const removeBtn = document.getElementById('logo-remove');

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      state.logoData = ev.target.result;
      preview.innerHTML = `<img src="${state.logoData}" alt="Logo" />`;
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener('click', () => {
    state.logoData = null;
    preview.innerHTML = '<span>Aucun logo</span>';
    input.value = '';
  });
}

// TOGGLE DESTINATAIRE
function initRecipientToggle() {
  document.querySelectorAll('.toggle-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.toggle-opt')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.recipient;
      state.recipientType = type;

      document
        .getElementById('recipient-company')
        .classList.toggle('hidden', type !== 'company');
      document
        .getElementById('recipient-individual')
        .classList.toggle('hidden', type !== 'individual');
    });
  });
}

function initDeliveryToggle() {
  const checkbox = document.getElementById('different-delivery');
  const field = document.getElementById('delivery-field');
  checkbox.addEventListener('change', () => {
    field.classList.toggle('hidden', !checkbox.checked);
  });
}

// LIGNES DE FACTURE
function initLineManagement() {
  document.getElementById('btn-add-line').addEventListener('click', addLine);
}

function addLine() {
  const id = `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const line = {
    id,
    name: '',
    date: '',
    quantity: 1,
    unit: 'unité',
    unitPrice: 0,
    vatRate: 20,
    totalHT: 0,
  };
  state.lines.push(line);
  renderLines();
}

function removeLine(id) {
  state.lines = state.lines.filter((l) => l.id !== id);
  renderLines();
  recalculate();
}

function renderLines() {
  const tbody = document.getElementById('lines-body');
  tbody.innerHTML = '';

  state.lines.forEach((line) => {
    const tr = document.createElement('tr');
    tr.dataset.id = line.id;

    const unitOptions = UNITS.map(
      (u) =>
        `<option value="${u.value}" ${u.value === line.unit ? 'selected' : ''}>${u.label}</option>`
    ).join('');

    const vatOptions = VAT_RATES.map(
      (r) =>
        `<option value="${r}" ${r == line.vatRate ? 'selected' : ''}>${r}%</option>`
    ).join('');

    tr.innerHTML = `
      <td class="col-name"><input type="text" data-field="name" value="${escapeHtml(line.name)}" placeholder="Désignation" /></td>
      <td class="col-date"><input type="date" data-field="date" value="${line.date}" /></td>
      <td class="col-qty"><input type="number" data-field="quantity" value="${line.quantity}" step="0.01" min="0" /></td>
      <td class="col-unit"><select data-field="unit">${unitOptions}</select></td>
      <td class="col-price"><input type="number" data-field="unitPrice" value="${line.unitPrice}" step="0.01" min="0" /></td>
      <td class="col-vat"><select data-field="vatRate">${vatOptions}</select></td>
      <td class="col-total">${formatMoneyDisplay(line.totalHT)}</td>
      <td class="col-actions">
        <button type="button" class="btn-icon" title="Supprimer la ligne">✕</button>
      </td>
    `;

    // Inputs : mise à jour
    tr.querySelectorAll('[data-field]').forEach((input) => {
      input.addEventListener('input', () => {
        const f = input.dataset.field;
        line[f] = input.type === 'number' ? parseFloat(input.value) || 0 : input.value;
        recalculate();
      });
    });

    // Bouton suppression
    tr.querySelector('.btn-icon').addEventListener('click', () => removeLine(line.id));

    tbody.appendChild(tr);
  });
}

// CALCULS
function recalculate() {
  const noVAT = document.getElementById('no-vat').checked;

  let totalHT = 0;
  let totalVAT = 0;
  const vatGroups = {};

  state.lines.forEach((line) => {
    const lineHT = (parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0);
    line.totalHT = lineHT;
    totalHT += lineHT;

    if (!noVAT) {
      const rate = parseFloat(line.vatRate) || 0;
      const vatAmount = lineHT * (rate / 100);
      totalVAT += vatAmount;
      if (!vatGroups[rate]) vatGroups[rate] = { base: 0, amount: 0 };
      vatGroups[rate].base += lineHT;
      vatGroups[rate].amount += vatAmount;
    }
  });

  const totalTTC = totalHT + totalVAT;

  // Affichage des totaux
  document.getElementById('total-ht').textContent = formatMoneyDisplay(totalHT);
  document.getElementById('total-vat').textContent = formatMoneyDisplay(totalVAT);
  document.getElementById('total-ttc').textContent = formatMoneyDisplay(totalTTC);

  // Mise à jour ligne par ligne (col-total)
  document.querySelectorAll('#lines-body tr').forEach((tr) => {
    const id = tr.dataset.id;
    const line = state.lines.find((l) => l.id === id);
    if (line) {
      tr.querySelector('.col-total').textContent = formatMoneyDisplay(line.totalHT);
    }
  });

  // Détail TVA
  renderVATTable(vatGroups, noVAT);

  return { totalHT, totalVAT, totalTTC, vatGroups };
}

function renderVATTable(vatGroups, noVAT) {
  const tbody = document.getElementById('vat-body');
  const note = document.getElementById('vat-exemption-note');
  tbody.innerHTML = '';

  if (noVAT) {
    tbody.innerHTML = `
      <tr>
        <td>Aucun</td>
        <td>${formatMoneyDisplay(0)}</td>
        <td>0,00 €</td>
      </tr>
    `;
    note.classList.remove('hidden');
  } else {
    note.classList.add('hidden');
    const rates = Object.keys(vatGroups).sort((a, b) => b - a);
    if (rates.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--muted);">Aucune ligne</td></tr>`;
    } else {
      rates.forEach((rate) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatNumDisplay(rate)} %</td>
          <td>${formatMoneyDisplay(vatGroups[rate].base)}</td>
          <td>${formatMoneyDisplay(vatGroups[rate].amount)}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
}

// TVA TOGGLE (franchise)
function initVATToggle() {
  document.getElementById('no-vat').addEventListener('change', recalculate);
}

// DATES
function setDefaultDates() {
  const today = new Date();
  const issue = document.getElementById('issue-date');
  if (!issue.value) {
    issue.value = today.toISOString().slice(0, 10);
  }
  updateDueDate();
}

function initDateLogic() {
  document.getElementById('issue-date').addEventListener('change', updateDueDate);
  document.getElementById('payment-terms').addEventListener('change', updateDueDate);
}

function updateDueDate() {
  const issueDate = document.getElementById('issue-date').value;
  const terms = document.getElementById('payment-terms').value;
  if (!issueDate) return;

  const d = new Date(issueDate);
  let dueDate = new Date(d);

  switch (terms) {
    case 'Paiement à réception':
      // Pas d'ajout
      break;
    case '30 jours nets':
      dueDate.setDate(d.getDate() + 30);
      break;
    case '45 jours nets':
      dueDate.setDate(d.getDate() + 45);
      break;
    case '60 jours nets':
      dueDate.setDate(d.getDate() + 60);
      break;
    case '45 jours fin de mois':
      dueDate.setDate(d.getDate() + 45);
      dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0);
      break;
  }

  document.getElementById('due-date').value = dueDate.toISOString().slice(0, 10);
}

// NUMÉRO DE FACTURE
function suggestInvoiceNumber() {
  const input = document.getElementById('invoice-number');
  const hint = document.getElementById('invoice-number-hint');
  if (!input.value) {
    const suggested = DataManager.suggestNextNumber();
    input.value = suggested;
    hint.textContent = `Suggestion automatique. Numérotation continue obligatoire.`;
  }
}

// ACTIONS PRINCIPALES (reset, save, export)
function initActions() {
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Effacer toutes les données saisies ?')) {
      resetForm();
    }
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    const invoice = collectInvoiceData();
    if (!validateInvoice(invoice)) return;
    DataManager.saveInvoice(invoice);
    showToast('Facture enregistrée', 'success');
    refreshHistory();
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    const invoice = collectInvoiceData();
    if (!validateInvoice(invoice)) return;
    // On enregistre automatiquement avant export
    DataManager.saveInvoice(invoice);
    refreshHistory();
    try {
      PDFExport.export(invoice);
      showToast('PDF généré', 'success');
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la génération du PDF', 'error');
    }
  });
}

function resetForm() {
  document.getElementById('invoice-form').reset();
  state.lines = [];
  state.logoData = null;
  state.currentInvoiceId = null;
  document.getElementById('logo-preview').innerHTML = '<span>Aucun logo</span>';
  document.getElementById('vat-exemption-note').classList.add('hidden');
  document.getElementById('delivery-field').classList.add('hidden');
  addLine();
  loadIssuerData();
  suggestInvoiceNumber();
  setDefaultDates();
  recalculate();
}

// COLLECTE DES DONNÉES
function collectInvoiceData() {
  const totals = recalculate();
  const noVAT = document.getElementById('no-vat').checked;

  // Recipient
  const recipientType = state.recipientType;
  let recipient = { type: recipientType };
  if (recipientType === 'company') {
    recipient = {
      type: 'company',
      name: val('recipient-co-name'),
      legalForm: val('recipient-co-legal'),
      siren: val('recipient-co-siren'),
      vatNum: val('recipient-co-vat'),
      address: val('recipient-co-address'),
      differentDelivery: document.getElementById('different-delivery').checked,
      deliveryAddress: val('recipient-co-delivery'),
    };
  } else {
    recipient = {
      type: 'individual',
      civility: val('recipient-ind-civility'),
      firstname: val('recipient-ind-firstname'),
      lastname: val('recipient-ind-lastname'),
      address: val('recipient-ind-address'),
      email: val('recipient-ind-email'),
      phone: val('recipient-ind-phone'),
    };
  }

  return {
    id: state.currentInvoiceId,
    invoiceNumber: val('invoice-number'),
    issueDate: val('issue-date'),
    dueDate: val('due-date'),
    saleType: val('sale-type'),
    paymentTerms: val('payment-terms'),
    issuer: {
      logo: state.logoData,
      name: val('issuer-name'),
      legalForm: val('issuer-legal-form'),
      capital: val('issuer-capital'),
      siret: val('issuer-siret'),
      rcs: val('issuer-rcs'),
      vatNum: val('issuer-vat-num'),
      ape: val('issuer-ape'),
      address: val('issuer-address'),
      phone: val('issuer-phone'),
      email: val('issuer-email'),
    },
    recipient,
    lines: state.lines.map((l) => ({ ...l })),
    noVAT,
    vatOnDebits: document.getElementById('vat-on-debits').checked,
    totalHT: totals.totalHT,
    totalVAT: totals.totalVAT,
    totalTTC: totals.totalTTC,
    vatDetails: Object.keys(totals.vatGroups)
      .sort((a, b) => b - a)
      .map((rate) => ({
        rate: parseFloat(rate),
        base: totals.vatGroups[rate].base,
        amount: totals.vatGroups[rate].amount,
      })),
    payment: {
      method: val('payment-method'),
      bank: val('payment-bank'),
      iban: val('payment-iban'),
      bic: val('payment-bic'),
      reference: val('payment-reference'),
    },
    extraNotes: val('extra-notes'),
  };
}

function validateInvoice(invoice) {
  const errors = [];
  if (!invoice.issuer.name) errors.push('le nom de la société émettrice');
  if (!invoice.issuer.siret) errors.push('le SIRET');
  if (!invoice.issuer.address) errors.push("l'adresse de la société");
  if (!invoice.invoiceNumber) errors.push('le numéro de facture');
  if (!invoice.issueDate) errors.push("la date d'émission");
  if (!invoice.dueDate) errors.push("la date d'échéance");
  if (!invoice.saleType) errors.push('le type de vente');

  if (invoice.recipient.type === 'company') {
    if (!invoice.recipient.name) errors.push('le nom du client');
    if (!invoice.recipient.siren) errors.push('le SIREN du client');
    if (!invoice.recipient.address) errors.push("l'adresse du client");
  } else {
    if (!invoice.recipient.lastname) errors.push('le nom du client particulier');
    if (!invoice.recipient.address) errors.push("l'adresse du client");
  }

  if (invoice.lines.length === 0 || invoice.lines.every((l) => !l.name)) {
    errors.push('au moins une ligne de facture');
  }

  if (errors.length > 0) {
    showToast(`Champs manquants : ${errors.join(', ')}`, 'error');
    return false;
  }
  return true;
}

// MÉMORISATION SOCIÉTÉ ÉMETTRICE
function initIssuerSave() {
  document.getElementById('btn-save-issuer').addEventListener('click', () => {
    const data = {
      logo: state.logoData,
      name: val('issuer-name'),
      legalForm: val('issuer-legal-form'),
      capital: val('issuer-capital'),
      siret: val('issuer-siret'),
      rcs: val('issuer-rcs'),
      vatNum: val('issuer-vat-num'),
      ape: val('issuer-ape'),
      address: val('issuer-address'),
      phone: val('issuer-phone'),
      email: val('issuer-email'),
    };
    DataManager.saveIssuer(data);
    showToast('Informations société mémorisées', 'success');
    refreshSettings();
  });
}

function loadIssuerData() {
  const data = DataManager.loadIssuer();
  if (!data) return;
  if (data.logo) {
    state.logoData = data.logo;
    document.getElementById('logo-preview').innerHTML = `<img src="${data.logo}" alt="Logo" />`;
  }
  setVal('issuer-name', data.name);
  setVal('issuer-legal-form', data.legalForm);
  setVal('issuer-capital', data.capital);
  setVal('issuer-siret', data.siret);
  setVal('issuer-rcs', data.rcs);
  setVal('issuer-vat-num', data.vatNum);
  setVal('issuer-ape', data.ape);
  setVal('issuer-address', data.address);
  setVal('issuer-phone', data.phone);
  setVal('issuer-email', data.email);
}

function refreshSettings() {
  const data = DataManager.loadIssuer();
  const container = document.getElementById('saved-issuer-info');
  if (!data) {
    container.innerHTML = '<p class="empty">Aucune information mémorisée.</p>';
    return;
  }
  container.innerHTML = `
    <pre>${escapeHtml(JSON.stringify({
      Nom: data.name,
      'Forme juridique': data.legalForm,
      'Capital social': data.capital,
      SIRET: data.siret,
      RCS: data.rcs,
      'N° TVA': data.vatNum,
      APE: data.ape,
      Adresse: data.address,
      Téléphone: data.phone,
      Email: data.email,
    }, null, 2))}</pre>
  `;

  document.getElementById('btn-clear-issuer').addEventListener('click', () => {
    if (confirm('Effacer les informations société mémorisées ?')) {
      DataManager.clearIssuer();
      refreshSettings();
      showToast('Informations effacées', 'success');
    }
  }, { once: true });
}

// HISTORIQUE
function refreshHistory() {
  const list = document.getElementById('history-list');
  const invoices = DataManager.loadInvoices().sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
  );
  if (invoices.length === 0) {
    list.innerHTML = '<p class="empty">Aucune facture enregistrée pour le moment.</p>';
    return;
  }
  list.innerHTML = '';
  invoices.forEach((inv) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    const recipientName =
      inv.recipient.type === 'company'
        ? inv.recipient.name
        : [inv.recipient.civility, inv.recipient.firstname, inv.recipient.lastname]
            .filter(Boolean)
            .join(' ');
    item.innerHTML = `
      <div>
        <h4>${escapeHtml(inv.invoiceNumber || 'Sans numéro')}</h4>
        <p class="meta">
          ${escapeHtml(recipientName || '—')} · 
          Émise le ${formatDateDisplay(inv.issueDate)} · 
          Échéance ${formatDateDisplay(inv.dueDate)}
        </p>
      </div>
      <div class="amount">${formatMoneyDisplay(inv.totalTTC)}</div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" data-action="edit">Modifier</button>
        <button class="btn btn-ghost btn-sm" data-action="pdf">PDF</button>
        <button class="btn btn-ghost btn-sm" data-action="delete">Supprimer</button>
      </div>
    `;
    item.querySelector('[data-action="edit"]').addEventListener('click', () => {
      loadInvoiceIntoForm(inv);
    });
    item.querySelector('[data-action="pdf"]').addEventListener('click', () => {
      try {
        PDFExport.export(inv);
        showToast('PDF généré', 'success');
      } catch (e) {
        showToast('Erreur génération PDF', 'error');
      }
    });
    item.querySelector('[data-action="delete"]').addEventListener('click', () => {
      if (confirm(`Supprimer la facture ${inv.invoiceNumber} ?`)) {
        DataManager.deleteInvoice(inv.id);
        refreshHistory();
        showToast('Facture supprimée', 'success');
      }
    });
    list.appendChild(item);
  });
}

function loadInvoiceIntoForm(inv) {
  state.currentInvoiceId = inv.id;

  // Bascule sur la vue facture
  document.querySelector('.nav-item[data-view="invoice"]').click();

  // Émetteur
  if (inv.issuer.logo) {
    state.logoData = inv.issuer.logo;
    document.getElementById('logo-preview').innerHTML = `<img src="${inv.issuer.logo}" alt="Logo" />`;
  }
  setVal('issuer-name', inv.issuer.name);
  setVal('issuer-legal-form', inv.issuer.legalForm);
  setVal('issuer-capital', inv.issuer.capital);
  setVal('issuer-siret', inv.issuer.siret);
  setVal('issuer-rcs', inv.issuer.rcs);
  setVal('issuer-vat-num', inv.issuer.vatNum);
  setVal('issuer-ape', inv.issuer.ape);
  setVal('issuer-address', inv.issuer.address);
  setVal('issuer-phone', inv.issuer.phone);
  setVal('issuer-email', inv.issuer.email);

  // Identification facture
  setVal('invoice-number', inv.invoiceNumber);
  setVal('issue-date', inv.issueDate);
  setVal('due-date', inv.dueDate);
  setVal('sale-type', inv.saleType);
  setVal('payment-terms', inv.paymentTerms);

  // Destinataire
  const recBtn = document.querySelector(`.toggle-opt[data-recipient="${inv.recipient.type}"]`);
  if (recBtn) recBtn.click();
  if (inv.recipient.type === 'company') {
    setVal('recipient-co-name', inv.recipient.name);
    setVal('recipient-co-legal', inv.recipient.legalForm);
    setVal('recipient-co-siren', inv.recipient.siren);
    setVal('recipient-co-vat', inv.recipient.vatNum);
    setVal('recipient-co-address', inv.recipient.address);
    document.getElementById('different-delivery').checked = !!inv.recipient.differentDelivery;
    document.getElementById('delivery-field').classList.toggle('hidden', !inv.recipient.differentDelivery);
    setVal('recipient-co-delivery', inv.recipient.deliveryAddress);
  } else {
    setVal('recipient-ind-civility', inv.recipient.civility);
    setVal('recipient-ind-firstname', inv.recipient.firstname);
    setVal('recipient-ind-lastname', inv.recipient.lastname);
    setVal('recipient-ind-address', inv.recipient.address);
    setVal('recipient-ind-email', inv.recipient.email);
    setVal('recipient-ind-phone', inv.recipient.phone);
  }

  // Lignes
  state.lines = inv.lines.map((l) => ({ ...l }));
  renderLines();

  // TVA
  document.getElementById('no-vat').checked = !!inv.noVAT;
  document.getElementById('vat-on-debits').checked = !!inv.vatOnDebits;

  // Paiement
  setVal('payment-method', inv.payment.method);
  setVal('payment-bank', inv.payment.bank);
  setVal('payment-iban', inv.payment.iban);
  setVal('payment-bic', inv.payment.bic);
  setVal('payment-reference', inv.payment.reference);

  // Notes
  setVal('extra-notes', inv.extraNotes);

  recalculate();
  showToast(`Facture ${inv.invoiceNumber} chargée`, 'success');
}

// TOAST
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

// UTILITAIRES
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMoneyDisplay(n) {
  const num = parseFloat(n) || 0;
  return (
    num
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'
  );
}

function formatNumDisplay(n) {
  const num = parseFloat(n);
  if (isNaN(num)) return '';
  return num.toString().replace('.', ',');
}

function formatDateDisplay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR');
}
