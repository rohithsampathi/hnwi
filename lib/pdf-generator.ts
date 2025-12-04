// lib/pdf-generator.ts
// Client-side PDF generation for C10 Assessment results using jsPDF

import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PDFData {
  report_metadata: {
    session_id: string;
    generated_at: string;
    version: string;
    neural_signature: string;
  };
  tier_classification: {
    tier: 'architect' | 'operator' | 'observer';
    confidence: number;
    reasoning_trace: string;
  };
  simulation_results: {
    outcome: 'SURVIVED' | 'DAMAGED' | 'DESTROYED';
    narrative: string;
    reasoning_trace: string;
  };
  gap_analysis: string;
  forensic_validation: {
    verdict: string;
    confidence: number;
    evidence: {
      avg_response_time: number;
      pattern_consistency: string;
    };
  };
  answers: Array<{
    question_id: string;
    question_text: string;
    choice_id: string;
    choice_text: string;
    response_time: number;
  }>;
  personalized_opportunities?: any[];
  intelligence_briefs?: Array<{
    id: string;
    title?: string;
    date?: string;
  }> | string[];
}

// HNWI Chronicles Brand Colors
const BRAND_COLORS = {
  gold: [218, 165, 32], // #DAA520 - Primary Gold
  black: [0, 0, 0], // Pure Black
  white: [255, 255, 255], // Pure White
  darkGray: [30, 30, 30], // Dark background
  lightGray: [240, 240, 240], // Light background
  textDark: [25, 25, 25], // Text on light
  textLight: [250, 250, 250], // Text on dark
};

const TIER_CONFIG = {
  architect: {
    icon: '👑',
    label: 'ARCHITECT',
    color: BRAND_COLORS.gold,
  },
  operator: {
    icon: '⚙️',
    label: 'OPERATOR',
    color: BRAND_COLORS.gold,
  },
  observer: {
    icon: '👁️',
    label: 'OBSERVER',
    color: [107, 114, 128], // Gray for observer
  },
};

const OUTCOME_CONFIG = {
  SURVIVED: {
    icon: '🎯',
    label: 'SURVIVED',
    color: [34, 197, 94], // Green
  },
  DAMAGED: {
    icon: '⚠️',
    label: 'DAMAGED',
    color: [234, 179, 8], // Yellow
  },
  DESTROYED: {
    icon: '🚨',
    label: 'DESTROYED',
    color: [239, 68, 68], // Red
  },
};

export const generateAssessmentPDF = (pdfData: PDFData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Build citation map: DEVID -> [citation number, title]
  const citationMap = new Map<string, { number: number; title: string; date?: string }>();
  let citationCounter = 1;

  // Process intelligence briefs to build citation map
  if (pdfData.intelligence_briefs && pdfData.intelligence_briefs.length > 0) {
    pdfData.intelligence_briefs.forEach((brief) => {
      if (typeof brief === 'string') {
        // Old format: just IDs
        citationMap.set(brief, {
          number: citationCounter++,
          title: `Development Brief ${brief}`,
        });
      } else {
        // New format: objects with id, title, date
        citationMap.set(brief.id, {
          number: citationCounter++,
          title: brief.title || `Development Brief ${brief.id}`,
          date: brief.date,
        });
      }
    });
  }

  // Helper to replace [DEVID-xxx] with [1], [2], etc.
  const replaceCitations = (text: string): string => {
    if (!text) return text;

    // Match [DEVID-xxx] or [Dev ID: xxx] or [DevID: xxx]
    return text.replace(/\[(?:DEVID|Dev\s*ID|DevID)[\s:-]*([^\]]+)\]/gi, (match, devId) => {
      const cleanId = devId.trim();
      const citation = citationMap.get(cleanId);
      if (citation) {
        return `[${citation.number}]`;
      }
      return match; // Keep original if not found
    });
  };

  // Helper to add page breaks
  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      addWatermark(); // Add watermark to new page
      yPos = 20;
    }
  };

  // Helper to add watermark on every page
  const addWatermark = () => {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.setTextColor(218, 165, 32); // Gold color
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');

    // Rotate and center watermark
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    doc.text('HNWI CHRONICLES', centerX, centerY, {
      align: 'center',
      angle: 45
    });

    doc.restoreGraphicsState();
  };

  // Helper to add page numbers and footer on every page
  const addPageFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `HNWI Chronicles © ${new Date().getFullYear()} • Confidential • Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // === COVER PAGE ===
  doc.setFillColor(...BRAND_COLORS.darkGray);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Gold accent bar at top
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Logo/Header
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('HNWI CHRONICLES', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('STRATEGIC DNA ASSESSMENT', pageWidth / 2, 72, { align: 'center' });

  // Decorative line
  doc.setDrawColor(...BRAND_COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 30, 78, pageWidth / 2 + 30, 78);

  // Tier Icon & Label
  const tierConfig = TIER_CONFIG[pdfData.tier_classification.tier];
  doc.setFontSize(48);
  doc.text(tierConfig.icon, pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...tierConfig.color);
  doc.text(tierConfig.label, pageWidth / 2, 145, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('CLASSIFICATION', pageWidth / 2, 155, { align: 'center' });

  // Report Date (no technical details)
  doc.setFontSize(11);
  doc.setTextColor(150, 150, 150);
  const reportDate = new Date(pdfData.report_metadata.generated_at);
  doc.text(
    reportDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pageWidth / 2,
    pageHeight - 30,
    { align: 'center' }
  );

  // === PAGE 2: DIGITAL TWIN SIMULATION ===
  doc.addPage();
  addWatermark(); // Add watermark to page
  yPos = 20;

  // Section Header
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(15, yPos - 5, 3, 12, 'F');
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITAL TWIN SIMULATION', 22, yPos + 5);
  yPos += 20;

  const outcomeConfig = OUTCOME_CONFIG[pdfData.simulation_results.outcome];
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('SCENARIO OUTCOME', 20, yPos);
  yPos += 10;

  doc.setFontSize(24);
  doc.setTextColor(...outcomeConfig.color);
  doc.text(`${outcomeConfig.icon} ${outcomeConfig.label}`, 20, yPos);
  yPos += 18;

  // Simulation Narrative (with citations replaced)
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  const cleanNarrative = replaceCitations(pdfData.simulation_results.narrative);
  const narrativeLines = doc.splitTextToSize(cleanNarrative, pageWidth - 40);
  doc.text(narrativeLines, 20, yPos);
  yPos += narrativeLines.length * 6 + 10;

  // === GAP ANALYSIS SECTION ===
  checkPageBreak(60);

  // Section Header
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(15, yPos - 5, 3, 12, 'F');
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('GAP ANALYSIS', 22, yPos + 5);
  yPos += 20;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  const cleanGapAnalysis = replaceCitations(pdfData.gap_analysis);
  const gapLines = doc.splitTextToSize(cleanGapAnalysis, pageWidth - 40);
  doc.text(gapLines, 20, yPos);
  yPos += gapLines.length * 6 + 10;

  // === REFERENCES SECTION ===
  if (citationMap.size > 0) {
    checkPageBreak(60);

    // Section Header
    doc.setFillColor(...BRAND_COLORS.gold);
    doc.rect(15, yPos - 5, 3, 12, 'F');
    doc.setTextColor(...BRAND_COLORS.gold);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCES', 22, yPos + 5);
    yPos += 20;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `This assessment analysis referenced ${citationMap.size} intelligence developments from HNWI World.`,
      20,
      yPos
    );
    yPos += 15;

    // Sort citations by number
    const sortedCitations = Array.from(citationMap.entries())
      .sort((a, b) => a[1].number - b[1].number);

    // Display each citation
    sortedCitations.forEach(([devId, citation]) => {
      checkPageBreak(12);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`[${citation.number}]`, 20, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      // Format: [1] Brief Title - Date (if available)
      let refText = citation.title;
      if (citation.date) {
        const date = new Date(citation.date);
        const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        refText += ` - ${dateStr}`;
      }

      const refLines = doc.splitTextToSize(refText, pageWidth - 50);
      doc.text(refLines, 35, yPos);
      yPos += refLines.length * 5 + 3;
    });

    yPos += 10;
  }

  // === YOUR RESPONSES SECTION ===
  if (pdfData.answers && pdfData.answers.length > 0) {
    doc.addPage();
    addWatermark(); // Add watermark
    yPos = 20;

    // Section Header
    doc.setFillColor(...BRAND_COLORS.gold);
    doc.rect(15, yPos - 5, 3, 12, 'F');
    doc.setTextColor(...BRAND_COLORS.gold);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('YOUR RESPONSES', 22, yPos + 5);
    yPos += 20;

    pdfData.answers.forEach((answer, index) => {
      checkPageBreak(30);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Q${index + 1}: ${answer.question_text}`, 20, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Answer: ${answer.choice_text}`, 20, yPos);
      yPos += 7;

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Response time: ${answer.response_time.toFixed(1)}s`, 20, yPos);
      yPos += 10;
    });
  }

  // === FINAL PAGE ===
  doc.addPage();
  addWatermark(); // Add watermark
  doc.setFillColor(...BRAND_COLORS.darkGray);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Gold accent bar at top
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(0, 0, pageWidth, 3, 'F');

  yPos = 80;

  // Company Logo/Name
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.text('HNWI CHRONICLES', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Tagline
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('Private Wealth Intelligence Platform', pageWidth / 2, yPos, { align: 'center' });
  yPos += 40;

  // Copyright Notice
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 200, 200);
  doc.text(`© ${new Date().getFullYear()} HNWI Chronicles. All Rights Reserved.`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 25;

  // Legal text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);

  const legalText = [
    'CONFIDENTIALITY NOTICE',
    '',
    'This assessment report is confidential and proprietary to HNWI Chronicles.',
    'Unauthorized distribution, reproduction, or disclosure is strictly prohibited.',
    '',
    'DISCLAIMER',
    '',
    'The analysis contained herein is based on your responses and is provided for',
    'informational purposes only. It does not constitute financial, legal, or tax advice.',
    'Consult with qualified professionals before making any investment decisions.',
  ];

  legalText.forEach(line => {
    if (line === 'CONFIDENTIALITY NOTICE' || line === 'DISCLAIMER') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND_COLORS.gold);
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(160, 160, 160);
    } else {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    }
    yPos += 6;
  });

  yPos += 30;

  // Report Date
  doc.setFontSize(10);
  doc.setTextColor(140, 140, 140);
  const finalPageDate = new Date(pdfData.report_metadata.generated_at);
  doc.text(
    `Report Generated: ${finalPageDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 20;

  // Contact & Website
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('app.hnwichronicles.com', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(160, 160, 160);
  doc.text('Bloomberg meets private banking for the ultra-wealthy', pageWidth / 2, yPos, { align: 'center' });

  // Gold accent bar at bottom
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');

  // Add page numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) { // Skip cover page
      addPageFooter(i - 1, totalPages - 1); // Subtract 1 to not count cover
    }
  }

  return doc;
};

// Download PDF function
export const downloadPDF = (pdfData: PDFData, sessionId: string) => {
  const doc = generateAssessmentPDF(pdfData);
  const reportDate = new Date(pdfData.report_metadata.generated_at);
  const dateStr = reportDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  const tierLabel = pdfData.tier_classification.tier.charAt(0).toUpperCase() + pdfData.tier_classification.tier.slice(1);
  doc.save(`HNWI_Chronicles_${tierLabel}_Assessment_${dateStr}.pdf`);
};

// Preview PDF in new tab
export const previewPDF = (pdfData: PDFData) => {
  const doc = generateAssessmentPDF(pdfData);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};
