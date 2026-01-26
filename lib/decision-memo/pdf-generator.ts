// lib/decision-memo/pdf-generator.ts
// Premium Decision Memo PDF Generator - Matches Web Output Theme
// Goldman/McKinsey Tier with institutional-grade design

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DecisionMemoData, Mistake, Opportunity } from './memo-types';

// Helper function to load logo as base64
const loadLogoAsBase64 = async (): Promise<string> => {
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return '';
  }
};

// Premium Color Palette - Matching web dark theme
const COLORS = {
  // Brand Gold
  gold: [218, 165, 32] as [number, number, number],
  goldMuted: [180, 140, 40] as [number, number, number],

  // Dark Theme Backgrounds
  bgDark: [12, 12, 14] as [number, number, number],
  bgCard: [24, 24, 28] as [number, number, number],
  bgCardHover: [32, 32, 38] as [number, number, number],
  bgMuted: [38, 38, 45] as [number, number, number],

  // Text Colors
  textPrimary: [250, 250, 250] as [number, number, number],
  textSecondary: [160, 160, 170] as [number, number, number],
  textMuted: [100, 100, 110] as [number, number, number],

  // Status Colors
  emerald: [16, 185, 129] as [number, number, number],
  emeraldDark: [6, 95, 70] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  redMuted: [185, 28, 28] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
  purple: [139, 92, 246] as [number, number, number],

  // Borders
  border: [45, 45, 55] as [number, number, number],
  borderLight: [60, 60, 70] as [number, number, number],
};

export async function generateDecisionMemoPDF(
  data: DecisionMemoData,
  intakeId: string
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  const logo = await loadLogoAsBase64();
  const { preview_data, generated_at } = data;

  // Helper: Dark page background
  const addDarkBackground = () => {
    doc.setFillColor(...COLORS.bgDark);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // Helper: Card background
  const addCard = (x: number, y: number, w: number, h: number, hasGoldBorder = false) => {
    doc.setFillColor(...COLORS.bgCard);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    if (hasGoldBorder) {
      doc.setDrawColor(...COLORS.gold);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, w, h, 3, 3, 'S');
    } else {
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, w, h, 3, 3, 'S');
    }
  };

  // Helper: Page footer
  const addPageFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(20, pageHeight - 12, pageWidth - 20, pageHeight - 12);

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `CONFIDENTIAL | HNWI CHRONICLES | Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
  };

  // Helper: Check page break
  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      addDarkBackground();
      yPos = 20;
    }
  };

  // Helper: Section header matching web design
  const addSectionHeader = (title: string, subtitle?: string) => {
    checkPageBreak(35);

    doc.setFontSize(12);
    doc.setTextColor(...COLORS.textPrimary);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 20, yPos);

    // Gold underline
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    doc.setFillColor(...COLORS.gold);
    doc.rect(20, yPos + 3, Math.min(titleWidth, 60), 1.5, 'F');

    if (subtitle) {
      yPos += 10;
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textSecondary);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 20, yPos);
    }

    yPos += 15;
  };

  // ==========================================
  // COVER PAGE - Dark Premium Theme
  // ==========================================
  addDarkBackground();

  // Gold accent lines
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 0, pageWidth, 2, 'F');
  doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');

  // Elegant frame
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');

  // Logo
  yPos = 45;
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', pageWidth / 2 - 22, yPos, 44, 44);
      yPos += 55;
    } catch (e) {
      yPos = 60;
    }
  }

  // Company name
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('HNWI CHRONICLES', pageWidth / 2, yPos, { align: 'center' });

  yPos += 6;
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 45, yPos, pageWidth / 2 + 45, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.text('PATTERN INTELLIGENCE DIVISION', pageWidth / 2, yPos, { align: 'center' });

  // Document title card
  yPos += 25;
  addCard(pageWidth / 2 - 75, yPos, 150, 55, true);

  yPos += 18;
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('PATTERN INTELLIGENCE', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(20);
  doc.text('ANALYSIS', pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.text('Tax Jurisdiction & Risk Intelligence Report', pageWidth / 2, yPos, { align: 'center' });

  // Key metrics row
  yPos += 35;
  const metrics = [
    { label: 'TOTAL SAVINGS', value: preview_data.total_savings, isGold: true },
    { label: 'OPPORTUNITIES', value: String(preview_data.opportunities_count), isGold: false },
    { label: 'RISK CLASS', value: preview_data.exposure_class, isGold: false },
    { label: 'CONFIDENCE', value: '73%', isGold: false },
  ];

  const metricWidth = 40;
  const startX = pageWidth / 2 - (metricWidth * 4) / 2;

  metrics.forEach((metric, i) => {
    const x = startX + i * metricWidth;

    doc.setFontSize(14);
    doc.setTextColor(...(metric.isGold ? COLORS.gold : COLORS.textPrimary));
    doc.setFont('helvetica', 'bold');
    doc.text(metric.value, x + metricWidth / 2, yPos, { align: 'center' });

    doc.setFontSize(6);
    doc.setTextColor(...COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.text(metric.label, x + metricWidth / 2, yPos + 6, { align: 'center' });
  });

  // Confidential badge
  yPos += 30;
  doc.setFillColor(...COLORS.bgCard);
  doc.roundedRect(pageWidth / 2 - 35, yPos, 70, 12, 6, 6, 'F');
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth / 2 - 35, yPos, 70, 12, 6, 6, 'S');

  doc.setFillColor(...COLORS.gold);
  doc.circle(pageWidth / 2 - 25, yPos + 6, 2, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIDENTIAL', pageWidth / 2 + 5, yPos + 7.5, { align: 'center' });

  // Date and reference
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  const reportDate = new Date(generated_at);
  doc.text(
    reportDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pageWidth / 2,
    pageHeight - 30,
    { align: 'center' }
  );

  doc.setFontSize(7);
  doc.text(`Reference: ${intakeId.slice(7, 19).toUpperCase()}`, pageWidth / 2, pageHeight - 24, { align: 'center' });

  // ==========================================
  // PAGE 2: TAX TRANSFORMATION
  // ==========================================
  doc.addPage();
  addDarkBackground();
  yPos = 20;

  addSectionHeader('TAX JURISDICTION ANALYSIS', 'Strategic jurisdiction restructuring for wealth preservation');

  // Tax Transformation Hero Card
  const heroHeight = 70;
  addCard(20, yPos, pageWidth - 40, heroHeight, true);

  // Header label
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('EFFECTIVE TAX RATE TRANSFORMATION', pageWidth / 2, yPos + 12, { align: 'center' });

  // Gold line separator
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.2);
  doc.line(pageWidth / 2 - 30, yPos + 16, pageWidth / 2 + 30, yPos + 16);

  // Before rate with strikethrough
  doc.setFontSize(32);
  doc.setTextColor(...COLORS.redMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('62.6%', 55, yPos + 40);

  // Strikethrough line
  doc.setDrawColor(...COLORS.red);
  doc.setLineWidth(1);
  doc.line(40, yPos + 37, 80, yPos + 37);

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('India', 55, yPos + 50);

  // Arrow
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.gold);
  doc.text('→', pageWidth / 2, yPos + 40, { align: 'center' });

  // After rate
  doc.setFontSize(42);
  doc.setTextColor(...COLORS.emerald);
  doc.setFont('helvetica', 'bold');
  doc.text('0%', pageWidth - 55, yPos + 43, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('UAE', pageWidth - 55, yPos + 53, { align: 'center' });

  // Annual savings badge
  doc.setFillColor(...COLORS.emeraldDark);
  doc.roundedRect(pageWidth / 2 - 25, yPos + 55, 50, 12, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.emerald);
  doc.setFont('helvetica', 'bold');
  doc.text(`${preview_data.total_savings}/year`, pageWidth / 2, yPos + 63, { align: 'center' });

  yPos += heroHeight + 15;

  // Tax Comparison Table
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont('helvetica', 'bold');
  doc.text('Jurisdiction Comparison', 20, yPos);
  yPos += 8;

  const taxTableData = [
    ['Income Tax', '42.6%', '0%', '-42.6%'],
    ['Capital Gains', '20.0%', '0%', '-20.0%'],
    ['Wealth Tax', '0%', '0%', '0%'],
    ['Estate Tax', '0%', '0%', '0%'],
    ['Total Effective', '62.6%', '0%', '-62.6%'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Tax Category', 'Current (India)', 'Proposed (UAE)', 'Savings']],
    body: taxTableData,
    theme: 'plain',
    styles: {
      fillColor: COLORS.bgCard,
      textColor: COLORS.textPrimary,
      lineColor: COLORS.border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.bgMuted,
      textColor: COLORS.textSecondary,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORS.textPrimary },
      1: { halign: 'center', textColor: COLORS.redMuted },
      2: { halign: 'center', textColor: COLORS.emerald },
      3: { halign: 'center', textColor: COLORS.emerald, fontStyle: 'bold' },
    },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Implementation Timeline
  addSectionHeader('IMPLEMENTATION ROADMAP', 'Phased execution with parallel workstreams');

  const phases = [
    { id: 1, name: 'Foundation', duration: '0-45 days', desc: 'Banking, documentation, regulatory filings', color: COLORS.gold },
    { id: 2, name: 'Residency', duration: '30-213 days', desc: 'Physical presence, visa, residence permits', color: COLORS.blue },
    { id: 3, name: 'Entity Formation', duration: '100-160 days', desc: 'DIFC company, substance requirements', color: COLORS.emerald },
    { id: 4, name: 'Asset Migration', duration: '150-365 days', desc: 'Portfolio transfer, treaty optimization', color: COLORS.amber },
  ];

  phases.forEach((phase, i) => {
    checkPageBreak(18);

    // Phase card
    doc.setFillColor(...COLORS.bgCard);
    doc.roundedRect(20, yPos, pageWidth - 40, 16, 2, 2, 'F');

    // Colored left accent
    doc.setFillColor(...phase.color);
    doc.rect(20, yPos, 3, 16, 'F');

    // Phase number
    doc.setFillColor(...phase.color);
    doc.circle(32, yPos + 8, 5, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(String(phase.id), 32, yPos + 9.5, { align: 'center' });

    // Phase name
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textPrimary);
    doc.text(phase.name, 42, yPos + 7);

    // Duration
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.text(phase.duration, 42, yPos + 13);

    // Description
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(phase.desc, 100, yPos + 10);

    yPos += 20;
  });

  // ==========================================
  // PAGE 3: RISK ASSESSMENT
  // ==========================================
  doc.addPage();
  addDarkBackground();
  yPos = 20;

  addSectionHeader('AUDIT RISK ASSESSMENT', 'Executive risk analysis and mitigation strategies');

  // Confidence Gauge Card
  const gaugeHeight = 50;
  addCard(20, yPos, pageWidth - 40, gaugeHeight, true);

  // Big confidence number
  doc.setFontSize(48);
  doc.setTextColor(...COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('73%', 55, yPos + 33);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont('helvetica', 'bold');
  doc.text('SUCCESS CONFIDENCE', 55, yPos + 43);

  // Risk indicator badges
  const indicators = [
    { label: 'Audit Risk', value: 'LOW', color: COLORS.emerald },
    { label: 'Complexity', value: 'MEDIUM', color: COLORS.amber },
    { label: 'Timeline', value: 'LOW', color: COLORS.emerald },
  ];

  const indicatorStartX = 115;
  indicators.forEach((ind, i) => {
    const x = indicatorStartX + i * 30;

    doc.setFillColor(...ind.color);
    doc.roundedRect(x, yPos + 15, 26, 14, 2, 2, 'F');

    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(ind.value, x + 13, yPos + 24, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.text(ind.label, x + 13, yPos + 38, { align: 'center' });
  });

  yPos += gaugeHeight + 15;

  // Risk Factors Table
  if (preview_data.all_mistakes && preview_data.all_mistakes.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textPrimary);
    doc.setFont('helvetica', 'bold');
    doc.text('Identified Risk Factors', 20, yPos);
    yPos += 8;

    const riskData = preview_data.all_mistakes.slice(0, 5).map((m: Mistake, i: number) => [
      String(i + 1),
      m.title.length > 35 ? m.title.substring(0, 35) + '...' : m.title,
      m.severity || 'MEDIUM',
      m.cost || 'N/A',
      m.urgency || 'Standard',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Risk Factor', 'Severity', 'Cost', 'Urgency']],
      body: riskData,
      theme: 'plain',
      styles: {
        fillColor: COLORS.bgCard,
        textColor: COLORS.textPrimary,
        lineColor: COLORS.border,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.bgMuted,
        textColor: COLORS.textSecondary,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'center' },
      },
      margin: { left: 20, right: 20 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 2) {
          const sev = String(data.cell.raw);
          if (sev === 'CRITICAL' || sev === 'HIGH') {
            data.cell.styles.textColor = COLORS.red;
            data.cell.styles.fontStyle = 'bold';
          } else if (sev === 'MEDIUM') {
            data.cell.styles.textColor = COLORS.amber;
          } else {
            data.cell.styles.textColor = COLORS.emerald;
          }
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Due Diligence Checklist
  checkPageBreak(70);
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont('helvetica', 'bold');
  doc.text('Due Diligence Requirements', 20, yPos);
  yPos += 10;

  const ddItems = [
    { task: 'Engage qualified tax counsel in both jurisdictions', timeline: 'Week 1' },
    { task: 'Complete substance requirements analysis', timeline: 'Week 2-3' },
    { task: 'Review exit tax implications and treaty benefits', timeline: 'Week 3-4' },
    { task: 'Establish banking relationships in UAE', timeline: 'Week 4-6' },
    { task: 'Document economic substance continuously', timeline: 'Ongoing' },
  ];

  ddItems.forEach((item) => {
    checkPageBreak(12);

    // Checkbox
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.4);
    doc.rect(24, yPos - 3, 4, 4, 'S');

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textPrimary);
    doc.setFont('helvetica', 'normal');
    doc.text(item.task, 32, yPos);

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gold);
    doc.text(item.timeline, pageWidth - 25, yPos, { align: 'right' });

    yPos += 11;
  });

  // ==========================================
  // PAGE 4: PEER INTELLIGENCE
  // ==========================================
  doc.addPage();
  addDarkBackground();
  yPos = 20;

  addSectionHeader('PEER INTELLIGENCE', `${preview_data.opportunities_count} opportunities matched from 3,427+ HNWI patterns`);

  // Opportunities list
  if (preview_data.all_opportunities && preview_data.all_opportunities.length > 0) {
    const opps = preview_data.all_opportunities.slice(0, 10);

    opps.forEach((opp: Opportunity, i: number) => {
      checkPageBreak(18);

      // Card
      doc.setFillColor(...COLORS.bgCard);
      doc.roundedRect(20, yPos, pageWidth - 40, 16, 2, 2, 'F');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(20, yPos, pageWidth - 40, 16, 2, 2, 'S');

      // Number badge
      doc.setFillColor(...COLORS.bgMuted);
      doc.circle(30, yPos + 8, 5, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textPrimary);
      doc.setFont('helvetica', 'bold');
      doc.text(String(i + 1), 30, yPos + 9.5, { align: 'center' });

      // Title
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textPrimary);
      const title = opp.title.length > 40 ? opp.title.substring(0, 40) + '...' : opp.title;
      doc.text(title, 40, yPos + 7);

      // Location
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.textMuted);
      doc.setFont('helvetica', 'normal');
      doc.text(opp.location?.split(',')[0] || 'Global', 40, yPos + 13);

      // Return badge
      if (opp.expected_return) {
        doc.setFillColor(...COLORS.emeraldDark);
        doc.roundedRect(pageWidth - 55, yPos + 4, 22, 8, 1, 1, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.emerald);
        doc.setFont('helvetica', 'bold');
        doc.text(opp.expected_return, pageWidth - 44, yPos + 9.5, { align: 'center' });
      }

      // DNA match
      const score = opp.alignment_score || opp.dna_match_score || 0;
      if (score > 0) {
        doc.setFillColor(50, 40, 70);
        doc.roundedRect(pageWidth - 30, yPos + 4, 16, 8, 1, 1, 'F');
        doc.setFontSize(6);
        doc.setTextColor(...COLORS.purple);
        doc.text(`${(score * 10).toFixed(0)}%`, pageWidth - 22, yPos + 9.5, { align: 'center' });
      }

      yPos += 19;
    });
  }

  // Summary card
  yPos += 5;
  checkPageBreak(40);
  addCard(20, yPos, pageWidth - 40, 35, true);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('Market Intelligence Summary', 28, yPos + 12);

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');
  const summary = `Analysis of ${preview_data.intelligence_count || 0} intelligence signals identified ${preview_data.opportunities_count} strategic opportunities. Estimated annual value creation: ${preview_data.total_savings}.`;
  const lines = doc.splitTextToSize(summary, pageWidth - 56);
  doc.text(lines, 28, yPos + 22);

  // ==========================================
  // FINAL PAGE: DISCLAIMER
  // ==========================================
  doc.addPage();
  addDarkBackground();

  // Gold accents
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 0, pageWidth, 1.5, 'F');
  doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, 'F');

  yPos = 50;

  // Logo
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', pageWidth / 2 - 20, yPos, 40, 40);
      yPos += 50;
    } catch (e) {}
  }

  // Company
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('HNWI CHRONICLES', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.text('Alternative Asset Intelligence & Pattern Recognition', pageWidth / 2, yPos, { align: 'center' });

  yPos += 30;

  // Disclaimers
  const disclaimers = [
    {
      title: 'CONFIDENTIALITY NOTICE',
      text: 'This decision memorandum is confidential and proprietary to HNWI Chronicles. Unauthorized distribution, reproduction, or disclosure is strictly prohibited.',
    },
    {
      title: 'IMPORTANT NOTICE',
      text: 'Pattern & Market Intelligence Report based on 1,562+ analyzed precedents. This report provides strategic intelligence and pattern analysis for informed decision-making. For execution and implementation, consult your legal, tax, and financial advisory teams.',
    },
  ];

  disclaimers.forEach((d) => {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.text(d.title, pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    const dLines = doc.splitTextToSize(d.text, pageWidth - 50);
    doc.text(dLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += dLines.length * 4 + 15;
  });

  // Website
  yPos = pageHeight - 40;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('app.hnwichronicles.com', pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  const finalDate = new Date(generated_at);
  doc.text(
    `Report Generated: ${finalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageWidth / 2,
    pageHeight - 30,
    { align: 'center' }
  );

  // ==========================================
  // ADD PAGE NUMBERS
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i !== 1 && i !== totalPages) {
      addPageFooter(i, totalPages);
    }
  }

  // Save
  const dateStr = new Date(generated_at)
    .toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\//g, '-');

  doc.save(`HNWI_Chronicles_Decision_Memo_${dateStr}.pdf`);
}
