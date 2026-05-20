/* 
   pdf-export.js
   Génère le PDF conforme de la facture avec jsPDF + autoTable
    */

const PDFExport = {
  /**
   * Exporte la facture en PDF
   * @param {Object} invoice - les données complètes de la facture
   */
  export(invoice) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const M = 18; // marge
    let y = M;

    // Couleurs
    const inkColor = [26, 26, 26];
    const softColor = [74, 74, 74];
    const mutedColor = [138, 138, 138];
    const accentColor = [184, 149, 106]; // doré
    const lineColor = [230, 225, 216];

    // EN-TÊTE : LOGO + ÉMETTEUR + TITRE
    // Logo (à gauche)
    if (invoice.issuer.logo) {
      try {
        doc.addImage(invoice.issuer.logo, 'PNG', M, y, 35, 25, undefined, 'FAST');
      } catch (e) {
        console.warn("Impossible d'ajouter le logo :", e);
      }
    }

    // Émetteur (à droite du logo)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...inkColor);
    doc.text(invoice.issuer.name || '', M + 40, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...softColor);

    const issuerLines = [];
    if (invoice.issuer.legalForm) issuerLines.push(invoice.issuer.legalForm);
    if (invoice.issuer.capital)
      issuerLines.push(`Capital social : ${invoice.issuer.capital}`);
    if (invoice.issuer.address)
      issuerLines.push(...invoice.issuer.address.split('\n'));
    if (invoice.issuer.siret) issuerLines.push(`SIRET : ${invoice.issuer.siret}`);
    if (invoice.issuer.rcs) issuerLines.push(invoice.issuer.rcs);
    if (invoice.issuer.vatNum) issuerLines.push(`TVA : ${invoice.issuer.vatNum}`);
    if (invoice.issuer.ape) issuerLines.push(`APE : ${invoice.issuer.ape}`);
    if (invoice.issuer.phone) issuerLines.push(`Tél : ${invoice.issuer.phone}`);
    if (invoice.issuer.email) issuerLines.push(invoice.issuer.email);

    let yIssuer = y + 11;
    issuerLines.forEach((line) => {
      doc.text(line, M + 40, yIssuer);
      yIssuer += 4.2;
    });

    // Titre FACTURE (en haut à droite)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...inkColor);
    doc.text('FACTURE', pageW - M, y + 8, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...softColor);
    doc.text(`N° ${invoice.invoiceNumber || ''}`, pageW - M, y + 16, {
      align: 'right',
    });
    doc.text(`Émise le : ${formatDate(invoice.issueDate)}`, pageW - M, y + 22, {
      align: 'right',
    });
    doc.text(`Échéance : ${formatDate(invoice.dueDate)}`, pageW - M, y + 28, {
      align: 'right',
    });
    if (invoice.saleType) {
      doc.setFontSize(9);
      doc.setTextColor(...accentColor);
      doc.text(invoice.saleType, pageW - M, y + 34, { align: 'right' });
    }

    y = Math.max(yIssuer, y + 40) + 6;

    // Ligne séparatrice
    doc.setDrawColor(...lineColor);
    doc.setLineWidth(0.3);
    doc.line(M, y, pageW - M, y);
    y += 8;

    // DESTINATAIRE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.text('FACTURÉ À', M, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...inkColor);
    const r = invoice.recipient;
    let recipientHeaderY = y;
    let recipientName = '';
    if (r.type === 'company') {
      recipientName = r.name || '';
    } else {
      recipientName = [r.civility, r.firstname, r.lastname]
        .filter(Boolean)
        .join(' ');
    }
    doc.text(recipientName, M, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...softColor);

    const recipientLines = [];
    if (r.type === 'company') {
      if (r.legalForm) recipientLines.push(r.legalForm);
      if (r.address) recipientLines.push(...r.address.split('\n'));
      if (r.siren) recipientLines.push(`SIREN : ${r.siren}`);
      if (r.vatNum) recipientLines.push(`TVA : ${r.vatNum}`);
      if (r.deliveryAddress && r.differentDelivery) {
        recipientLines.push('');
        recipientLines.push('Adresse de livraison :');
        recipientLines.push(...r.deliveryAddress.split('\n'));
      }
    } else {
      if (r.address) recipientLines.push(...r.address.split('\n'));
      if (r.email) recipientLines.push(r.email);
      if (r.phone) recipientLines.push(`Tél : ${r.phone}`);
    }

    recipientLines.forEach((line) => {
      doc.text(line, M, y);
      y += 4.2;
    });

    y += 6;

    // TABLEAU DES LIGNES
    const tableHead = [
      ['Désignation', 'Date', 'Qté', 'Unité', 'P.U. HT', 'TVA', 'Total HT'],
    ];
    const tableBody = invoice.lines.map((line) => [
      line.name || '',
      line.date ? formatDate(line.date) : '',
      formatNum(line.quantity),
      line.unit || '',
      formatMoney(line.unitPrice),
      invoice.noVAT ? '—' : `${formatNum(line.vatRate)} %`,
      formatMoney(line.totalHT),
    ]);

    doc.autoTable({
      startY: y,
      head: tableHead,
      body: tableBody,
      margin: { left: M, right: M },
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        textColor: inkColor,
        lineColor: lineColor,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [26, 26, 26],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 14, halign: 'right' },
        3: { cellWidth: 20 },
        4: { cellWidth: 24, halign: 'right' },
        5: { cellWidth: 16, halign: 'right' },
        6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      },
      alternateRowStyles: {
        fillColor: [250, 248, 244],
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // TOTAUX (à droite)
    const totalsX = pageW - M - 70;
    const totalsW = 70;

    doc.setFontSize(10);
    doc.setTextColor(...softColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Total HT', totalsX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatMoney(invoice.totalHT), pageW - M, y, { align: 'right' });
    y += 6;

    doc.text('Total TVA', totalsX, y);
    doc.text(formatMoney(invoice.totalVAT), pageW - M, y, { align: 'right' });
    y += 4;

    doc.setDrawColor(...inkColor);
    doc.setLineWidth(0.5);
    doc.line(totalsX, y, pageW - M, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...inkColor);
    doc.text('Total TTC', totalsX, y);
    doc.text(formatMoney(invoice.totalTTC), pageW - M, y, { align: 'right' });
    y += 10;

    // DÉTAIL TVA
    if (invoice.noVAT) {
      // Bloc franchise
      doc.setFillColor(245, 242, 237);
      doc.rect(M, y, pageW - 2 * M, 12, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(...softColor);
      doc.text(
        'TVA non applicable, art. 293 B du CGI',
        pageW / 2,
        y + 7,
        { align: 'center' }
      );
      y += 18;
    } else if (invoice.vatDetails && invoice.vatDetails.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...inkColor);
      doc.text('Détail de la TVA', M, y);
      y += 4;

      doc.autoTable({
        startY: y,
        head: [['Taux', 'Base HT', 'Montant TVA']],
        body: invoice.vatDetails.map((v) => [
          `${formatNum(v.rate)} %`,
          formatMoney(v.base),
          formatMoney(v.amount),
        ]),
        margin: { left: M },
        tableWidth: 90,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: lineColor,
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [245, 242, 237],
          textColor: softColor,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30, halign: 'right' },
          2: { cellWidth: 35, halign: 'right' },
        },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // MODALITÉS DE PAIEMENT
    // On vérifie qu'on a la place sinon nouvelle page
    if (y > pageH - 70) {
      doc.addPage();
      y = M;
    }

    if (invoice.payment && (invoice.payment.method || invoice.payment.iban)) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...inkColor);
      doc.text('Modalités de paiement', M, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...softColor);

      const payInfo = [];
      if (invoice.payment.method) payInfo.push(['Moyen de paiement', invoice.payment.method]);
      if (invoice.payment.bank) payInfo.push(['Établissement', invoice.payment.bank]);
      if (invoice.payment.iban) payInfo.push(['IBAN', invoice.payment.iban]);
      if (invoice.payment.bic) payInfo.push(['BIC', invoice.payment.bic]);
      const ref = invoice.payment.reference || invoice.invoiceNumber;
      if (ref) payInfo.push(['Référence', ref]);

      doc.autoTable({
        startY: y,
        body: payInfo,
        margin: { left: M },
        tableWidth: 120,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          lineWidth: 0,
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold', textColor: softColor },
          1: { cellWidth: 80, textColor: inkColor },
        },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // MENTIONS LÉGALES (en bas)
    if (y > pageH - 40) {
      doc.addPage();
      y = M;
    }

    // Ligne séparatrice
    doc.setDrawColor(...lineColor);
    doc.line(M, y, pageW - M, y);
    y += 5;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);

    const legalLines = [];
    legalLines.push(
      "Pénalités de retard : trois fois le taux d'intérêt légal en vigueur calculé depuis la date d'échéance"
    );
    legalLines.push("jusqu'à complet paiement du prix.");
    legalLines.push(
      'Indemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €.'
    );
    if (invoice.vatOnDebits) {
      legalLines.push("Option pour le paiement de la TVA d'après les débits.");
    }
    if (invoice.extraNotes) {
      legalLines.push('');
      invoice.extraNotes.split('\n').forEach((l) => legalLines.push(l));
    }

    legalLines.forEach((line) => {
      doc.text(line, M, y);
      y += 3.8;
    });

    // PIED DE PAGE
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.text(
      `Facture générée le ${formatDate(new Date().toISOString())}`,
      pageW / 2,
      pageH - 8,
      { align: 'center' }
    );

    // TÉLÉCHARGEMENT
    const filename = `Facture_${(invoice.invoiceNumber || 'sans_numero').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    doc.save(filename);
  },
};

// Utilitaires
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMoney(n) {
  const num = parseFloat(n) || 0;
  return (
    num
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'
  );
}

function formatNum(n) {
  const num = parseFloat(n);
  if (isNaN(num)) return '';
  return num.toString().replace('.', ',');
}
