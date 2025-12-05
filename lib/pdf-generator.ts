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
    tier: 'architect' | 'operator' | 'observer' | 'premium';
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
  silver: [192, 192, 192], // #C0C0C0 - Silver
  bronze: [205, 127, 50], // #CD7F32 - Bronze
  blue: [59, 130, 246], // #3B82F6 - Premium Blue
  black: [0, 0, 0], // Pure Black
  white: [255, 255, 255], // Pure White
  darkGray: [30, 30, 30], // Dark background
  lightGray: [240, 240, 240], // Light background
  textDark: [25, 25, 25], // Text on light
  textLight: [250, 250, 250], // Text on dark
};

const TIER_CONFIG = {
  architect: {
    icon: 'A',
    label: 'ARCHITECT',
    color: BRAND_COLORS.gold, // Gold (top tier metal)
  },
  operator: {
    icon: 'O',
    label: 'OPERATOR',
    color: BRAND_COLORS.silver, // Silver (middle tier metal)
  },
  observer: {
    icon: 'OB',
    label: 'OBSERVER',
    color: BRAND_COLORS.bronze, // Bronze (entry tier metal)
  },
  premium: {
    icon: 'P',
    label: 'PREMIUM',
    color: BRAND_COLORS.blue, // Blue (special P tier)
  },
};

const OUTCOME_CONFIG = {
  SURVIVED: {
    icon: '+',
    label: 'SURVIVED',
    color: BRAND_COLORS.gold, // Gold (positive outcome)
  },
  DAMAGED: {
    icon: '~',
    label: 'DAMAGED',
    color: BRAND_COLORS.silver, // Silver (neutral outcome)
  },
  DESTROYED: {
    icon: 'X',
    label: 'DESTROYED',
    color: BRAND_COLORS.bronze, // Bronze (challenging outcome)
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

  // Helper to render text with markdown formatting support
  interface TextSegment {
    text: string;
    bold: boolean;
    italic: boolean;
  }

  const parseMarkdown = (text: string): TextSegment[] => {
    const segments: TextSegment[] = [];
    let currentPos = 0;

    // Parse **bold** and *italic* or _italic_
    const markdownRegex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let match;

    while ((match = markdownRegex.exec(text)) !== null) {
      // Add text before match as normal
      if (match.index > currentPos) {
        segments.push({
          text: text.substring(currentPos, match.index),
          bold: false,
          italic: false
        });
      }

      // Add matched text with formatting
      if (match[1] === '**' || match[1] === '__') {
        // Bold
        segments.push({
          text: match[2],
          bold: true,
          italic: false
        });
      } else if (match[3] === '*' || match[3] === '_') {
        // Italic
        segments.push({
          text: match[4],
          bold: false,
          italic: true
        });
      }

      currentPos = match.index + match[0].length;
    }

    // Add remaining text
    if (currentPos < text.length) {
      segments.push({
        text: text.substring(currentPos),
        bold: false,
        italic: false
      });
    }

    return segments.length > 0 ? segments : [{ text, bold: false, italic: false }];
  };

  const renderFormattedText = (text: string, x: number, startY: number, maxWidth: number): number => {
    let currentY = startY;
    const lineHeight = 6;

    // Ensure consistent font size
    const currentFontSize = doc.getFontSize();

    // Split text into paragraphs
    const paragraphs = text.split('\n\n');

    paragraphs.forEach((paragraph, pIdx) => {
      if (!paragraph.trim()) return;

      // Parse markdown for this paragraph
      const segments = parseMarkdown(paragraph.trim());

      // Build complete text with proper spacing for word wrapping
      let fullText = '';
      segments.forEach(seg => {
        fullText += seg.text;
      });

      // Split into lines respecting max width
      doc.setFont('helvetica', 'normal');
      const wrappedLines = doc.splitTextToSize(fullText, maxWidth);

      // Now render each line, applying formatting where needed
      wrappedLines.forEach((line: string) => {
        // Check if we need a page break
        if (currentY + lineHeight > pageHeight - 20) {
          doc.addPage();
          addWatermark();
          currentY = 20;
        }

        // Find which segments this line contains and render with formatting
        let linePos = 0;
        const lineText = line.trim();
        let searchPos = 0;

        // Check if this line is a sub-heading (ends with colon or is all caps with colon)
        const isSubHeading = /^[A-Z][^:]*:/.test(lineText) || /^[A-Z\s]+:/.test(lineText);

        // Simple approach: render the whole line, checking for bold patterns
        let renderedLine = lineText;

        // Check if line contains bold markers
        const boldMatches = lineText.match(/\*\*(.*?)\*\*/g);

        if (boldMatches && boldMatches.length > 0) {
          // Has formatting - render character by character with proper styling
          let xPos = x;
          let inBold = false;
          let buffer = '';

          for (let i = 0; i < lineText.length; i++) {
            const char = lineText[i];
            const next = lineText[i + 1];

            // Check for ** marker
            if (char === '*' && next === '*') {
              // Render buffer first
              if (buffer) {
                doc.setFont('helvetica', inBold ? 'bold' : 'normal');
                // Make bold text darker for side headings
                if (inBold) {
                  doc.setTextColor(0, 0, 0); // Pure black for bold
                } else {
                  doc.setTextColor(60, 60, 60); // Regular text color
                }
                doc.text(buffer, xPos, currentY);
                xPos += doc.getTextWidth(buffer);
                buffer = '';
              }
              // Toggle bold
              inBold = !inBold;
              i++; // Skip next *
              continue;
            }

            buffer += char;
          }

          // Render remaining buffer
          if (buffer) {
            doc.setFont('helvetica', inBold ? 'bold' : 'normal');
            // Make bold text darker for side headings
            if (inBold) {
              doc.setTextColor(0, 0, 0); // Pure black for bold
            } else {
              doc.setTextColor(60, 60, 60); // Regular text color
            }
            doc.text(buffer, xPos, currentY);
          }

          // Reset color
          doc.setTextColor(60, 60, 60);
        } else if (isSubHeading) {
          // This is a sub-heading - render it bold
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0); // Pure black for sub-headings
          doc.text(lineText, x, currentY);
          // Reset
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
        } else {
          // No formatting - render normally
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          doc.text(lineText, x, currentY);
        }

        currentY += lineHeight;
      });

      // Add paragraph spacing
      if (pIdx < paragraphs.length - 1) {
        currentY += 4;
      }
    });

    // Reset font and color
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(currentFontSize);

    return currentY;
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
  doc.text('STRATEGIC DNA ASSESSMENT REPORT', pageWidth / 2, 72, { align: 'center' });

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

  // Simulation Narrative (with citations replaced and markdown formatted)
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const cleanNarrative = replaceCitations(pdfData.simulation_results.narrative);

  // Render with formatting and proper page breaks
  yPos = renderFormattedText(cleanNarrative, 20, yPos, pageWidth - 40);
  yPos += 10;

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
  const cleanGapAnalysis = replaceCitations(pdfData.gap_analysis);

  // Render with formatting and proper page breaks
  yPos = renderFormattedText(cleanGapAnalysis, 20, yPos, pageWidth - 40);
  yPos += 10;

  // === HNWI WORLD INTELLIGENCE REFERENCE ===
  checkPageBreak(30);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'italic');

  const briefCount = citationMap.size > 0 ? citationMap.size : 1900;
  const briefText = briefCount >= 1900
    ? `Analysis powered by 1,900+ intelligence developments from HNWI World.`
    : `Analysis powered by ${briefCount} intelligence developments from HNWI World.`;

  doc.text(briefText, 20, yPos);
  yPos += 15;

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

  yPos = 60;

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
  doc.text('Alternative Asset Intelligence & HNWI Pattern Recognition', pageWidth / 2, yPos, { align: 'center' });
  yPos += 30;

  // Copyright Notice
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 200, 200);
  doc.text(`© ${new Date().getFullYear()} HNWI Chronicles. All Rights Reserved.`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Legal text - more compact
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);

  const legalText = [
    'CONFIDENTIALITY NOTICE',
    '',
    'This assessment report is confidential and proprietary to HNWI Chronicles.',
    'Unauthorized distribution, reproduction, or disclosure is strictly prohibited.',
    '',
    'ABOUT THIS ASSESSMENT',
    '',
    'This report analyzes your strategic decision-making patterns using real-world',
    'scenarios from our intelligence database of 1,562+ HNWI developments.',
    'The assessment identifies opportunities aligned with your strategic DNA.',
    '',
    'DISCLAIMER',
    '',
    'This intelligence analysis is provided for informational purposes only.',
    'It does not constitute financial, legal, or tax advice.',
    'Consult with qualified professionals before making any investment decisions.',
  ];

  legalText.forEach(line => {
    if (line === 'CONFIDENTIALITY NOTICE' || line === 'DISCLAIMER' || line === 'ABOUT THIS ASSESSMENT') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND_COLORS.gold);
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(160, 160, 160);
    } else {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    }
    yPos += 5;
  });

  yPos += 20;

  // Contact & Website
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('app.hnwichronicles.com', pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 160);
  doc.text('Real-time intelligence on alternative assets and wealth preservation strategies', pageWidth / 2, yPos, { align: 'center' });

  // Report Generation Date & Time - positioned above footer with better spacing
  yPos = pageHeight - 30;
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.setFont('helvetica', 'normal');
  const finalPageDate = new Date(pdfData.report_metadata.generated_at);
  const dateString = finalPageDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeString = finalPageDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  doc.text(`Report Generated: ${dateString} at ${timeString}`, pageWidth / 2, yPos, { align: 'center' });

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
