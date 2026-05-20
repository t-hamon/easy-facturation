/* 
   data-manager.js
   Gère la sauvegarde locale des données (localStorage)
    */

const STORAGE_KEYS = {
  ISSUER: 'facturation_issuer',
  INVOICES: 'facturation_invoices',
  LAST_NUMBER: 'facturation_last_number',
};

const DataManager = {
  // Société émettrice
  saveIssuer(data) {
    localStorage.setItem(STORAGE_KEYS.ISSUER, JSON.stringify(data));
  },

  loadIssuer() {
    const raw = localStorage.getItem(STORAGE_KEYS.ISSUER);
    return raw ? JSON.parse(raw) : null;
  },

  clearIssuer() {
    localStorage.removeItem(STORAGE_KEYS.ISSUER);
  },

  // Factures
  saveInvoice(invoice) {
    const invoices = this.loadInvoices();
    // Si l'invoice a un id existant, on remplace
    const idx = invoices.findIndex((inv) => inv.id === invoice.id);
    if (idx >= 0) {
      invoices[idx] = invoice;
    } else {
      invoice.id = Date.now().toString();
      invoice.savedAt = new Date().toISOString();
      invoices.push(invoice);
    }
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    // On retient le dernier numéro de facture utilisé
    if (invoice.invoiceNumber) {
      localStorage.setItem(STORAGE_KEYS.LAST_NUMBER, invoice.invoiceNumber);
    }
    return invoice;
  },

  loadInvoices() {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return raw ? JSON.parse(raw) : [];
  },

  loadInvoice(id) {
    return this.loadInvoices().find((inv) => inv.id === id);
  },

  deleteInvoice(id) {
    const invoices = this.loadInvoices().filter((inv) => inv.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  // Numéro suggéré
  suggestNextNumber() {
    const lastNumber = localStorage.getItem(STORAGE_KEYS.LAST_NUMBER);
    const year = new Date().getFullYear();
    if (!lastNumber) {
      return `FAC-${year}-0001`;
    }
    // On tente d'extraire le dernier nombre à la fin et on incrémente
    const match = lastNumber.match(/^(.*?)(\d+)(\D*)$/);
    if (!match) {
      return `FAC-${year}-0001`;
    }
    const prefix = match[1];
    const number = parseInt(match[2], 10) + 1;
    const suffix = match[3] || '';
    const width = match[2].length;
    const padded = String(number).padStart(width, '0');
    // Si l'année a changé, on recommence à 0001 mais on conserve le préfixe
    const prefixHasYear = /\d{4}/.test(prefix);
    if (prefixHasYear) {
      const lastYearMatch = prefix.match(/(\d{4})/);
      const lastYear = lastYearMatch ? parseInt(lastYearMatch[1], 10) : null;
      if (lastYear && lastYear !== year) {
        const newPrefix = prefix.replace(/\d{4}/, year);
        return `${newPrefix}0001${suffix}`;
      }
    }
    return `${prefix}${padded}${suffix}`;
  },
};
