// lib/pdf-generator.ts
// Ultra-Premium HNWI PDF - Matte, Dim, Sophisticated Design

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EnhancedReportData } from '@/types/assessment-report';

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

// Premium Matte Color Palette - Sophisticated & Dim
const PREMIUM_COLORS = {
  // Primary Gold - Brand Color (#DAA520)
  gold: [218, 165, 32], // Brand gold #DAA520
  goldAccent: [255, 215, 0], // Brighter gold accent

  // Neutral Premium Grays
  charcoal: [45, 45, 48], // Deep charcoal
  slate: [71, 85, 105], // Muted slate
  platinum: [156, 163, 175], // Soft platinum
  pearl: [229, 231, 235], // Soft pearl

  // Background Tones
  deepBlack: [18, 18, 20], // Almost black
  softWhite: [250, 250, 251], // Soft white
  cream: [249, 248, 246], // Warm cream

  // Muted Accent Colors
  forestGreen: [52, 78, 65], // Muted green
  navyBlue: [51, 65, 85], // Deep navy
  burntOrange: [120, 85, 60], // Muted orange
  deepPurple: [88, 68, 102], // Muted purple

  // Status Colors - Subdued
  criticalRed: [139, 69, 69], // Dark muted red
};

const TIER_CONFIG = {
  architect: {
    label: 'ARCHITECT',
    subtitle: 'Systems Builder · Strategic intelligence for long-term wealth architecture',
    color: PREMIUM_COLORS.gold,
  },
  operator: {
    label: 'OPERATOR',
    subtitle: 'Tactical Executor · Intelligence optimized for rapid deployment',
    color: PREMIUM_COLORS.platinum,
  },
  observer: {
    label: 'OBSERVER',
    subtitle: 'Defensive Posture · Intelligence focused on wealth preservation',
    color: PREMIUM_COLORS.slate,
  },
  premium: {
    label: 'PREMIUM',
    subtitle: 'Premium Tier',
    color: PREMIUM_COLORS.navyBlue,
  },
};

export const generateSimulationPDF = async (reportData: EnhancedReportData, logoBase64?: string): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Use provided logo or empty string if not available
  const logo = logoBase64 || '';

  // Helper: Subtle gradient (minimal contrast)
  const addSubtleGradient = (x: number, y: number, width: number, height: number, colorStart: number[], colorEnd: number[]) => {
    const steps = 30;
    const stepHeight = height / steps;

    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = Math.round(colorStart[0] + (colorEnd[0] - colorStart[0]) * ratio);
      const g = Math.round(colorStart[1] + (colorEnd[1] - colorStart[1]) * ratio);
      const b = Math.round(colorStart[2] + (colorEnd[2] - colorStart[2]) * ratio);

      doc.setFillColor(r, g, b);
      doc.rect(x, y + (i * stepHeight), width, stepHeight, 'F');
    }
  };

  // Helper: Subtle shadow (very soft)
  const addSoftShadow = (x: number, y: number, width: number, height: number, radius: number = 2) => {
    doc.setFillColor(0, 0, 0);
    doc.setGState(new doc.GState({ opacity: 0.015 }));
    doc.roundedRect(x + 0.5, y + 0.5, width, height, radius, radius, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));
  };

  // Helper: Page breaks
  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      addPageBackground();
      yPos = 20;
    }
  };

  // Helper: Watermark (very subtle) with logo
  const addWatermark = () => {
    doc.saveGraphicsState();

    // Add logo watermark if available
    if (logo) {
      doc.setGState(new doc.GState({ opacity: 0.03 }));
      const logoSize = 40;
      const logoX = pageWidth / 2 - logoSize / 2;
      const logoY = pageHeight / 2 - logoSize / 2;
      try {
        doc.addImage(logo, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch (error) {
      }
    }

    // Text watermark
    doc.setGState(new doc.GState({ opacity: 0.008 }));
    doc.setTextColor(...PREMIUM_COLORS.gold);
    doc.setFontSize(50);
    doc.setFont('helvetica', 'bold');
    doc.text('HNWI CHRONICLES', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();
  };

  // Helper: Premium page background
  const addPageBackground = () => {
    addSubtleGradient(0, 0, pageWidth, pageHeight, PREMIUM_COLORS.softWhite, PREMIUM_COLORS.cream);
    addWatermark();
  };

  // Helper: Page footer
  const addPageFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(...PREMIUM_COLORS.pearl);
    doc.setLineWidth(0.2);
    doc.line(30, pageHeight - 15, pageWidth - 30, pageHeight - 15);

    doc.setFontSize(7.5);
    doc.setTextColor(...PREMIUM_COLORS.slate);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `HNWI Chronicles · Confidential · Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // Helper: Section header (minimal design)
  const addSectionHeader = (title: string, subtitle?: string) => {
    checkPageBreak(25);

    // Minimal accent
    doc.setFillColor(...PREMIUM_COLORS.gold);
    doc.rect(20, yPos - 3, 2, 8, 'F');

    doc.setTextColor(...PREMIUM_COLORS.charcoal);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 26, yPos + 3);

    if (subtitle) {
      yPos += 8;
      doc.setFontSize(8.5);
      doc.setTextColor(...PREMIUM_COLORS.slate);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 20, yPos);
    }

    yPos += 12;
  };

  // === COVER PAGE - Ultra Clean Premium ===
  doc.setFillColor(...PREMIUM_COLORS.deepBlack);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Minimal texture
  doc.setDrawColor(28, 28, 30);
  doc.setLineWidth(0.03);
  for (let i = 0; i < pageHeight; i += 4) {
    doc.line(0, i, pageWidth, i);
  }

  // Single elegant frame
  doc.setDrawColor(...PREMIUM_COLORS.gold);
  doc.setLineWidth(0.5);
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40, 'S');

  // Minimal top accent
  doc.setFillColor(...PREMIUM_COLORS.gold);
  doc.rect(0, 0, pageWidth, 1.5, 'F');

  // Add logo to cover page
  if (logo) {
    const coverLogoSize = 35;
    const coverLogoX = pageWidth / 2 - coverLogoSize / 2;
    const coverLogoY = 35;
    try {
      doc.addImage(logo, 'PNG', coverLogoX, coverLogoY, coverLogoSize, coverLogoSize);
    } catch (error) {
    }
  }

  // Company name - clean
  doc.setTextColor(...PREMIUM_COLORS.gold);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('HNWI CHRONICLES', pageWidth / 2, logo ? 80 : 55, { align: 'center' });

  // Single subtle line
  const lineY = logo ? 86 : 61;
  doc.setDrawColor(...PREMIUM_COLORS.gold);
  doc.setLineWidth(0.2);
  doc.line(pageWidth / 2 - 50, lineY, pageWidth / 2 + 50, lineY);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.setFont('helvetica', 'normal');
  doc.text('Strategic Simulation Report', pageWidth / 2, lineY + 9, { align: 'center' });

  // Clean tier card
  const tierConfig = TIER_CONFIG[reportData.executive_summary.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.observer;
  yPos = logo ? 120 : 105;

  // Minimal card
  doc.setFillColor(25, 25, 27);
  doc.roundedRect(pageWidth / 2 - 60, yPos, 120, 55, 2, 2, 'F');

  // Subtle border
  doc.setDrawColor(...PREMIUM_COLORS.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth / 2 - 60, yPos, 120, 55, 2, 2, 'S');

  // Tier label
  yPos += 20;
  doc.setFontSize(22);
  doc.setTextColor(...PREMIUM_COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text(tierConfig.label, pageWidth / 2, yPos, { align: 'center' });

  // Subtitle
  yPos += 10;
  doc.setFontSize(8);
  doc.setTextColor(170, 170, 170);
  doc.setFont('helvetica', 'normal');
  const subtitleLines = doc.splitTextToSize(tierConfig.subtitle, 110);
  doc.text(subtitleLines, pageWidth / 2, yPos, { align: 'center' });

  // Score card
  yPos = 185;
  doc.setFillColor(25, 25, 27);
  doc.roundedRect(pageWidth / 2 - 45, yPos, 90, 32, 2, 2, 'F');
  doc.setDrawColor(...PREMIUM_COLORS.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth / 2 - 45, yPos, 90, 32, 2, 2, 'S');

  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(170, 170, 170);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPREHENSIVE SCORE', pageWidth / 2, yPos, { align: 'center' });

  yPos += 11;
  doc.setFontSize(24);
  doc.setTextColor(...PREMIUM_COLORS.gold);
  const score = reportData.executive_summary.confidence_score || 0.8;
  const displayScore = score > 1 ? score : score * 10;
  doc.text(`${displayScore.toFixed(1)}/10`, pageWidth / 2, yPos, { align: 'center' });

  // Date
  doc.setFontSize(8.5);
  doc.setTextColor(140, 140, 140);
  doc.setFont('helvetica', 'normal');
  const reportDate = new Date(reportData.generated_at);
  doc.text(
    reportDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pageWidth / 2,
    pageHeight - 28,
    { align: 'center' }
  );

  // Confidential
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text('CONFIDENTIAL & PROPRIETARY', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // Bottom accent
  doc.setFillColor(...PREMIUM_COLORS.gold);
  doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, 'F');

  // === PAGE 2: TIER STATS - Minimal Cards ===
  doc.addPage();
  addPageBackground();
  yPos = 20;

  addSectionHeader(`${tierConfig.label} Tier Analytics`);

  // Clean stat cards
  const stats = [
    {
      label: 'Opportunity Access',
      value: `${reportData.executive_summary.percentile}th`,
      subtitle: `Qualified for top ${100 - reportData.executive_summary.percentile}% most sophisticated opportunities`
    },
    {
      label: 'Validated Signals',
      value: reportData.executive_summary.opportunities_accessible.toString(),
      subtitle: `${reportData.executive_summary.opportunities_missed} peer-executed opportunities missed`
    },
    {
      label: 'Intelligence Sources',
      value: reportData.executive_summary.peer_group_size.toLocaleString(),
      subtitle: 'HNWI World developments analyzed'
    },
    {
      label: 'Gap Analysis',
      value: `+${Math.round(reportData.executive_summary.optimization_potential * 100)}%`,
      subtitle: 'Performance gap vs peer benchmark'
    }
  ];

  stats.forEach((stat, idx) => {
    if (idx > 0 && idx % 2 === 0) {
      yPos += 30;
    }

    const xPos = idx % 2 === 0 ? 20 : pageWidth / 2 + 5;
    const boxWidth = (pageWidth - 50) / 2;

    // Soft shadow
    addSoftShadow(xPos, yPos, boxWidth, 26, 2);

    // Card
    doc.setFillColor(...PREMIUM_COLORS.softWhite);
    doc.roundedRect(xPos, yPos, boxWidth, 26, 2, 2, 'F');

    // Minimal border
    doc.setDrawColor(...PREMIUM_COLORS.pearl);
    doc.setLineWidth(0.2);
    doc.roundedRect(xPos, yPos, boxWidth, 26, 2, 2, 'S');

    // Subtle top accent
    doc.setFillColor(...PREMIUM_COLORS.gold);
    doc.setGState(new doc.GState({ opacity: 0.3 }));
    doc.rect(xPos, yPos, boxWidth, 2, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Label
    doc.setFontSize(8.5);
    doc.setTextColor(...PREMIUM_COLORS.slate);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.label, xPos + 4, yPos + 7);

    // Value
    doc.setFontSize(14);
    doc.setTextColor(...PREMIUM_COLORS.charcoal);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, xPos + 4, yPos + 15);

    // Subtitle
    doc.setFontSize(7);
    doc.setTextColor(...PREMIUM_COLORS.slate);
    doc.setFont('helvetica', 'normal');
    const subLines = doc.splitTextToSize(stat.subtitle, boxWidth - 8);
    doc.text(subLines, xPos + 4, yPos + 21);
  });

  yPos += 40;

  // === PERFORMANCE ANALYSIS ===
  addSectionHeader(
    'Multi-Dimensional Performance Analysis',
    `Benchmarked against ${reportData.executive_summary.peer_group_size.toLocaleString()} HNWI World developments`
  );

  const spiderData = reportData.spider_graphs.peer_comparison;
  const tableData = spiderData.dimensions.map((dim, idx) => {
    const userScore = Math.round(spiderData.user_scores[idx] * 100);
    const topScore = Math.round(spiderData.top_performers[idx] * 100);
    const gap = topScore - userScore;

    return [
      dim,
      `${userScore}%`,
      `${topScore}%`,
      gap > 0 ? `+${gap}%` : 'On Target'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Dimension', 'Your Profile', 'Peer Benchmark', 'Gap']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: PREMIUM_COLORS.charcoal,
      textColor: PREMIUM_COLORS.softWhite,
      fontSize: 9.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: PREMIUM_COLORS.charcoal,
      cellPadding: { top: 3, right: 6, bottom: 3, left: 6 }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 251]
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold', textColor: PREMIUM_COLORS.charcoal },
      1: { halign: 'center', textColor: PREMIUM_COLORS.gold, fontStyle: 'bold' },
      2: { halign: 'center', textColor: PREMIUM_COLORS.slate },
      3: { halign: 'center', textColor: PREMIUM_COLORS.criticalRed, fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 18;

  // === SPIDER GRAPH VISUALIZATION ===
  checkPageBreak(130);

  addSectionHeader(
    'Peer Comparison Spider Graph',
    'Visual representation of your positioning across key dimensions'
  );

  // Legend - centered at top with better visibility
  const legendY = yPos;
  const legendSpacing = 40;
  const legendStartX = pageWidth / 2 - legendSpacing;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  // Your Profile (black box) - more prominent
  doc.setFillColor(...PREMIUM_COLORS.charcoal);
  doc.roundedRect(legendStartX, legendY, 8, 4, 0.5, 0.5, 'F');
  doc.setTextColor(...PREMIUM_COLORS.charcoal);
  doc.text('Your Profile', legendStartX + 10, legendY + 3);

  // Peer Benchmark (grey box with dashed border) - more prominent
  doc.setFillColor(...PREMIUM_COLORS.platinum);
  doc.roundedRect(legendStartX + legendSpacing, legendY, 8, 4, 0.5, 0.5, 'F');
  doc.setDrawColor(...PREMIUM_COLORS.platinum);
  doc.setLineWidth(1.5);
  doc.setLineDash([2, 1]);
  doc.roundedRect(legendStartX + legendSpacing, legendY, 8, 4, 0.5, 0.5, 'S');
  doc.setLineDash([]);
  doc.setTextColor(...PREMIUM_COLORS.slate);
  doc.text('Peer Benchmark', legendStartX + legendSpacing + 10, legendY + 3);

  yPos += 16;

  // Circular Spider Chart Configuration
  const chartCenterX = pageWidth / 2;
  const chartCenterY = yPos + 45;
  const chartRadius = 38;
  const numDimensions = spiderData.dimensions.length;
  const levels = 5;

  // Draw circular grid (concentric circles)
  for (let i = 1; i <= levels; i++) {
    const r = (chartRadius / levels) * i;
    doc.setDrawColor(...PREMIUM_COLORS.pearl);
    doc.setLineWidth(i === levels ? 0.8 : 0.4);
    if (i === levels) {
      doc.setDrawColor(...PREMIUM_COLORS.slate);
      doc.setGState(new doc.GState({ opacity: 0.6 }));
    }
    if (i < levels) {
      doc.setLineDash([2, 2]);
    } else {
      doc.setLineDash([]);
    }
    doc.circle(chartCenterX, chartCenterY, r, 'S');
    doc.setLineDash([]);
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Add percentage labels (20%, 40%, 60%, 80%) - more prominent
    if (i < levels) {
      doc.setFontSize(7.5);
      doc.setTextColor(...PREMIUM_COLORS.charcoal);
      doc.setFont('helvetica', 'bold');
      doc.setGState(new doc.GState({ opacity: 0.7 }));
      doc.text(
        `${(i / levels * 100).toFixed(0)}%`,
        chartCenterX + 3,
        chartCenterY - r + 1.5
      );
      doc.setGState(new doc.GState({ opacity: 1 }));
    }
  }

  // Draw radial axes from center
  spiderData.dimensions.forEach((dim, i) => {
    const angle = (i * 2 * Math.PI / numDimensions) - Math.PI / 2;
    const x2 = chartCenterX + Math.cos(angle) * chartRadius;
    const y2 = chartCenterY + Math.sin(angle) * chartRadius;

    doc.setDrawColor(...PREMIUM_COLORS.pearl);
    doc.setLineWidth(0.3);
    doc.line(chartCenterX, chartCenterY, x2, y2);
  });

  // Draw Peer Benchmark area (grey, dashed, subtle fill)
  const drawPolygon = (scores: number[], fillColor: number[], strokeColor: number[], opacity: number, dashed: boolean = false) => {
    const points: { x: number; y: number }[] = [];

    scores.forEach((score, i) => {
      const angle = (i * 2 * Math.PI / numDimensions) - Math.PI / 2;
      const r = score * chartRadius;
      const x = chartCenterX + Math.cos(angle) * r;
      const y = chartCenterY + Math.sin(angle) * r;
      points.push({ x, y });
    });

    // Draw filled polygon
    if (opacity > 0) {
      doc.setFillColor(...fillColor);
      doc.setGState(new doc.GState({ opacity }));
      doc.setDrawColor(...strokeColor);
      doc.setLineWidth(dashed ? 1.5 : 2.5); // Thicker line for user profile
      if (dashed) {
        doc.setLineDash([4, 3]);
      }

      // Build path
      if (points.length > 0) {
        let pathString = '';
        points.forEach((point, idx) => {
          if (idx === 0) {
            pathString = `M ${point.x} ${point.y}`;
          } else {
            pathString += ` L ${point.x} ${point.y}`;
          }
        });
        pathString += ' Z';

        // Use lines to create polygon
        doc.lines(
          points.slice(1).map((p, idx) => [p.x - points[idx].x, p.y - points[idx].y]),
          points[0].x,
          points[0].y,
          undefined,
          'FD'
        );
      }

      doc.setLineDash([]);
      doc.setGState(new doc.GState({ opacity: 1 }));
    }
  };

  // Draw areas (back to front)
  // 1. Peer benchmark (top performers) - subtle grey with dashed border
  drawPolygon(spiderData.top_performers, PREMIUM_COLORS.platinum, PREMIUM_COLORS.platinum, 0.12, true);

  // 2. User scores - prominent black with stronger fill
  drawPolygon(spiderData.user_scores, PREMIUM_COLORS.charcoal, PREMIUM_COLORS.charcoal, 0.35, false);

  // Draw data points on user scores - larger and more prominent
  spiderData.user_scores.forEach((score, i) => {
    const angle = (i * 2 * Math.PI / numDimensions) - Math.PI / 2;
    const r = score * chartRadius;
    const x = chartCenterX + Math.cos(angle) * r;
    const y = chartCenterY + Math.sin(angle) * r;

    // Outer glow - larger
    doc.setFillColor(...PREMIUM_COLORS.charcoal);
    doc.setGState(new doc.GState({ opacity: 0.25 }));
    doc.circle(x, y, 3, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Main point with white border - larger
    doc.setFillColor(...PREMIUM_COLORS.charcoal);
    doc.circle(x, y, 2, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.circle(x, y, 2, 'S');
  });

  // Add dimension labels around perimeter - more prominent
  const labelRadius = chartRadius + 16;
  spiderData.dimensions.forEach((dim, i) => {
    const angle = (i * 2 * Math.PI / numDimensions) - Math.PI / 2;
    const labelX = chartCenterX + Math.cos(angle) * labelRadius;
    const labelY = chartCenterY + Math.sin(angle) * labelRadius;

    doc.setFontSize(7.5);
    doc.setTextColor(...PREMIUM_COLORS.charcoal);
    doc.setFont('helvetica', 'bold');

    // Word wrap for long labels
    const words = dim.split(' ');
    if (words.length > 2 || dim.length > 18) {
      const midpoint = Math.ceil(words.length / 2);
      const line1 = words.slice(0, midpoint).join(' ');
      const line2 = words.slice(midpoint).join(' ');

      doc.text(line1, labelX, labelY - 2, { align: 'center' });
      doc.text(line2, labelX, labelY + 2, { align: 'center' });
    } else {
      doc.text(dim, labelX, labelY, { align: 'center' });
    }
  });

  yPos = chartCenterY + chartRadius + 28;

  // Summary note
  doc.setFillColor(252, 250, 245);
  doc.roundedRect(30, yPos, pageWidth - 60, 12, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(...PREMIUM_COLORS.slate);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Benchmarked against ${reportData.executive_summary.peer_group_size.toLocaleString()} HNWI World developments`,
    pageWidth / 2,
    yPos + 7.5,
    { align: 'center' }
  );

  yPos += 20;

  // === CRITICAL GAPS - Minimal Design ===
  doc.addPage();
  addPageBackground();
  yPos = 20;

  addSectionHeader(
    'Critical Performance Gaps',
    'Where peer benchmarks exceed your current positioning'
  );

  const topGaps = spiderData.improvement_areas.slice(0, 3);

  topGaps.forEach((gap, idx) => {
    checkPageBreak(64);

    const cardX = 20;
    const cardWidth = pageWidth - 40;
    const cardHeight = 60;

    // Soft shadow
    addSoftShadow(cardX, yPos, cardWidth, cardHeight, 2);

    // Card background
    doc.setFillColor(...PREMIUM_COLORS.softWhite);
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 2, 2, 'F');

    // Minimal border
    doc.setDrawColor(...PREMIUM_COLORS.pearl);
    doc.setLineWidth(0.2);
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 2, 2, 'S');

    // Subtle top accent
    doc.setFillColor(...PREMIUM_COLORS.criticalRed);
    doc.setGState(new doc.GState({ opacity: 0.2 }));
    doc.rect(cardX, yPos, cardWidth, 2, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Priority number
    doc.setFillColor(...PREMIUM_COLORS.charcoal);
    doc.circle(cardX + 10, yPos + 10, 4.5, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text((idx + 1).toString(), cardX + 10, yPos + 11.5, { align: 'center' });

    // Title
    doc.setFontSize(11);
    doc.setTextColor(...PREMIUM_COLORS.charcoal);
    doc.text(gap.dimension, cardX + 20, yPos + 11);

    // Gap badge
    const gapPercent = Math.round(gap.improvement_potential);
    const badgeX = cardX + cardWidth - 50;
    doc.setFillColor(250, 245, 245);
    doc.roundedRect(badgeX, yPos + 6, 42, 8, 1, 1, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...PREMIUM_COLORS.criticalRed);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${gapPercent}% gap`, badgeX + 21, yPos + 11, { align: 'center' });

    // Progress bars
    const barY = yPos + 21;
    const barWidth = cardWidth - 45;
    const barX = cardX + 28;
    const barHeight = 4;

    const userScore = Math.round(gap.current_score * 100);
    const topScore = Math.round(gap.target_score * 100);
    const yourWidth = (gap.current_score / gap.target_score) * barWidth;

    // Labels
    doc.setFontSize(7.5);
    doc.setTextColor(...PREMIUM_COLORS.slate);
    doc.setFont('helvetica', 'normal');
    doc.text('You', cardX + 20, barY + 3);
    doc.text('Top', cardX + 20, barY + 10);

    // Your bar
    doc.setFillColor(...PREMIUM_COLORS.pearl);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
    doc.setFillColor(...PREMIUM_COLORS.slate);
    doc.roundedRect(barX, barY, yourWidth, barHeight, 2, 2, 'F');

    doc.setFontSize(7.5);
    doc.setTextColor(...PREMIUM_COLORS.charcoal);
    doc.setFont('helvetica', 'bold');
    doc.text(`${userScore}%`, barX + yourWidth + 2, barY + 3);

    // Top bar
    doc.setFillColor(250, 248, 240);
    doc.roundedRect(barX, barY + 7, barWidth, barHeight, 2, 2, 'F');
    doc.setFillColor(...PREMIUM_COLORS.gold);
    doc.roundedRect(barX, barY + 7, barWidth, barHeight, 2, 2, 'F');

    doc.setTextColor(...PREMIUM_COLORS.gold);
    doc.text(`${topScore}%`, barX + barWidth + 2, barY + 10);

    // Insight
    doc.setFontSize(7.5);
    doc.setTextColor(...PREMIUM_COLORS.slate);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Closing this gap could unlock ${gapPercent}% additional strategic positioning value`,
      cardX + 20,
      yPos + 42
    );

    yPos += cardHeight + 6;
  });

  // Summary
  checkPageBreak(15);
  doc.setFillColor(252, 250, 245);
  doc.roundedRect(20, yPos, pageWidth - 40, 12, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(...PREMIUM_COLORS.charcoal);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Closing these gaps would align your positioning with peer benchmark performance',
    pageWidth / 2,
    yPos + 7,
    { align: 'center' }
  );

  yPos += 22;

  // === GAP ANALYSIS (if available) - MOVED BEFORE DIGITAL TWIN ===
  const gapAnalysisText = (reportData as any).gap_analysis ||
                          (reportData as any).strategic_analysis?.raw_text ||
                          reportData.spider_graphs?.peer_comparison?.gap_analysis;

  if (gapAnalysisText && typeof gapAnalysisText === 'string' && gapAnalysisText.trim().length > 0) {
    doc.addPage();
    addPageBackground();
    yPos = 20;

    addSectionHeader(
      'Strategic Gap Analysis',
      'Detailed analysis of positioning gaps and improvement opportunities'
    );

    // Clean and parse gap analysis into paragraphs
    const cleanGapText = gapAnalysisText
      .replace(/\*\*/g, '')
      .replace(/\[(?:Dev\s*ID|DEVID)\s*[\-:–—]\s*[^\]]+\]/gi, '') // Remove all DEVID citations (handles "DEVID - id" and "Dev ID: id")
      .replace(/\[DEVID\s*[\-:–—]\s*[^\]]+\]/gi, '') // Extra pass for any remaining
      .trim();

    // Split into paragraphs for better visual separation
    const paragraphs = cleanGapText.split('\n\n').filter(p => p.trim().length > 0);

    paragraphs.forEach((paragraph, idx) => {
      const paragraphLines = doc.splitTextToSize(paragraph.trim(), pageWidth - 48);
      const cardHeight = 10 + (paragraphLines.length * 5) + 6;

      checkPageBreak(cardHeight + 6);

      const cardX = 20;
      const cardWidth = pageWidth - 40;

      // Soft shadow
      addSoftShadow(cardX, yPos, cardWidth, cardHeight, 2);

      // Card background - alternate colors for visual variety
      const bgColor = idx % 2 === 0 ? PREMIUM_COLORS.softWhite : [252, 250, 245] as [number, number, number];
      doc.setFillColor(...bgColor);
      doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 2, 2, 'F');

      // Minimal border
      doc.setDrawColor(...PREMIUM_COLORS.pearl);
      doc.setLineWidth(0.2);
      doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 2, 2, 'S');

      // Subtle left accent
      doc.setFillColor(...PREMIUM_COLORS.gold);
      doc.setGState(new doc.GState({ opacity: 0.4 }));
      doc.rect(cardX, yPos, 2, cardHeight, 'F');
      doc.setGState(new doc.GState({ opacity: 1 }));

      // Content
      let contentY = yPos + 8;
      doc.setFontSize(8.5);
      doc.setTextColor(...PREMIUM_COLORS.slate);
      doc.setFont('helvetica', 'normal');

      paragraphLines.forEach((line: string) => {
        doc.text(line, cardX + 6, contentY);
        contentY += 5;
      });

      yPos += cardHeight + 4;
    });

    yPos += 12;
  }

  // === DIGITAL TWIN SIMULATION - MOVED AFTER GAP ANALYSIS ===
  doc.addPage();
  addPageBackground();
  yPos = 20;

  addSectionHeader(
    'Digital Twin Simulation',
    '16-Month Crisis Projection Through the April 2026 Transparency Cliff'
  );

  // Digital Twin narrative from reportData
  const digitalTwinNarrative = (reportData as any).digital_twin?.narrative ||
                                (reportData as any).simulation?.simulation_narrative ||
                                'Digital Twin simulation provides behavioral projection through crisis scenarios.';

  // Parse narrative into sections
  const parseNarrative = (text: string) => {
    const sections: { title: string; content: string }[] = [];

    // Extract sections by headers
    const psychMatch = text.match(/\*\*Psychological DNA:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    const timelineMatch = text.match(/\*\*(?:Behavioral Timeline|Timeline):?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    const decisionsMatch = text.match(/\*\*(?:Critical Decision Points?|Decisions):?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    const evidenceMatch = text.match(/\*\*(?:HNWI World Evidence|Evidence):?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    const outcomeMatch = text.match(/\*\*(?:Final Outcome|Outcome):?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

    if (psychMatch) sections.push({ title: 'Psychological DNA', content: psychMatch[1].trim() });
    if (timelineMatch) sections.push({ title: 'Behavioral Timeline', content: timelineMatch[1].trim() });
    if (decisionsMatch) sections.push({ title: 'Critical Decision Points', content: decisionsMatch[1].trim() });
    if (evidenceMatch) sections.push({ title: 'HNWI World Evidence', content: evidenceMatch[1].trim() });
    if (outcomeMatch) sections.push({ title: 'Final Outcome', content: outcomeMatch[1].trim() });

    return sections.length > 0 ? sections : [{ title: 'Simulation Analysis', content: text }];
  };

  const narrativeSections = parseNarrative(digitalTwinNarrative);

  // Render each section with styled cards
  narrativeSections.forEach((section, idx) => {
    // Remove markdown bold markers and clean text
    const cleanContent = section.content
      .replace(/\*\*/g, '')
      .replace(/\[(?:Dev\s*ID|DEVID)\s*[\-:–—]\s*[^\]]+\]/gi, '') // Remove all DEVID citations
      .replace(/\[DEVID\s*[\-:–—]\s*[^\]]+\]/gi, '') // Extra pass for any remaining
      .trim();

    const contentLines = doc.splitTextToSize(cleanContent, pageWidth - 48);
    const cardHeight = 10 + (contentLines.length * 5) + 8;

    checkPageBreak(cardHeight + 6);

    const cardX = 20;
    const cardWidth = pageWidth - 40;

    // Soft shadow
    addSoftShadow(cardX, yPos, cardWidth, cardHeight, 2);

    // Card background
    doc.setFillColor(...PREMIUM_COLORS.softWhite);
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 2, 2, 'F');

    // Minimal border
    doc.setDrawColor(...PREMIUM_COLORS.pearl);
    doc.setLineWidth(0.2);
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 2, 2, 'S');

    // Subtle top accent (purple for psychological DNA, gold for others)
    const accentColor = section.title.toLowerCase().includes('psychological')
      ? PREMIUM_COLORS.deepPurple
      : section.title.toLowerCase().includes('evidence')
      ? PREMIUM_COLORS.forestGreen
      : PREMIUM_COLORS.gold;

    doc.setFillColor(...accentColor);
    doc.setGState(new doc.GState({ opacity: 0.3 }));
    doc.rect(cardX, yPos, cardWidth, 2, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Section title
    doc.setFontSize(10);
    doc.setTextColor(...PREMIUM_COLORS.charcoal);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, cardX + 4, yPos + 8);

    // Section content
    let contentY = yPos + 16;
    doc.setFontSize(8.5);
    doc.setTextColor(...PREMIUM_COLORS.slate);
    doc.setFont('helvetica', 'normal');

    contentLines.forEach((line: string) => {
      doc.text(line, cardX + 4, contentY);
      contentY += 5;
    });

    yPos += cardHeight + 6;
  });

  // === PEER OPPORTUNITIES - NEW PAGE ===
  doc.addPage();
  addPageBackground();
  yPos = 20;

  addSectionHeader(
    'High Profile Peer Signals',
    `Validated signals from ${reportData.executive_summary.peer_group_size.toLocaleString()} HNWI World developments`
  );

  // Total advantage
  const totalAdvantage = reportData.celebrity_opportunities?.reduce((sum, opp) => {
    return sum + (opp.financial_metrics?.avg_roi || 0) * (opp.financial_metrics?.median_investment || 0);
  }, 0) || 6800000;

  addSoftShadow(20, yPos, pageWidth - 40, 16, 2);
  doc.setFillColor(...PREMIUM_COLORS.softWhite);
  doc.roundedRect(20, yPos, pageWidth - 40, 16, 2, 2, 'F');
  doc.setDrawColor(...PREMIUM_COLORS.pearl);
  doc.setLineWidth(0.2);
  doc.roundedRect(20, yPos, pageWidth - 40, 16, 2, 2, 'S');

  doc.setFontSize(22);
  doc.setTextColor(...PREMIUM_COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `$${(totalAdvantage / 1000000).toFixed(1)}M`,
    pageWidth / 2,
    yPos + 9,
    { align: 'center' }
  );

  doc.setFontSize(8);
  doc.setTextColor(...PREMIUM_COLORS.slate);
  doc.setFont('helvetica', 'normal');
  doc.text('Total signal opportunity value tracked (24-month window)', pageWidth / 2, yPos + 13, { align: 'center' });

  yPos += 22;

  // Opportunity list
  const topOpportunities = reportData.celebrity_opportunities?.slice(0, 9) || [];

  topOpportunities.forEach((opp, idx) => {
    checkPageBreak(20);

    const cardX = 20;
    const cardHeight = 18;
    const cardWidth = pageWidth - 40;

    addSoftShadow(cardX, yPos, cardWidth, cardHeight, 1.5);
    doc.setFillColor(...PREMIUM_COLORS.softWhite);
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(...PREMIUM_COLORS.pearl);
    doc.setLineWidth(0.15);
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 1.5, 1.5, 'S');

    // Number
    doc.setFillColor(...PREMIUM_COLORS.charcoal);
    doc.circle(cardX + 8, yPos + 9, 3.5, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text((idx + 1).toString(), cardX + 8, yPos + 10, { align: 'center' });

    // Title
    doc.setFontSize(9.5);
    doc.setTextColor(...PREMIUM_COLORS.charcoal);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(opp.opportunity.title, cardWidth - 70);
    doc.text(titleLines[0], cardX + 15, yPos + 7);

    // Location (city only)
    doc.setFontSize(7.5);
    doc.setTextColor(...PREMIUM_COLORS.slate);
    doc.setFont('helvetica', 'normal');
    const cityOnly = opp.opportunity.location.split(',')[0].trim();
    doc.text(cityOnly, cardX + 15, yPos + 13);

    // ROI badge
    const roi = opp.financial_metrics?.avg_roi || 0;
    if (roi > 0) {
      const roiBadgeX = cardX + cardWidth - 65;
      doc.setFillColor(245, 250, 245);
      doc.roundedRect(roiBadgeX, yPos + 5, 28, 7, 1, 1, 'F');
      doc.setFontSize(7.5);
      doc.setTextColor(...PREMIUM_COLORS.forestGreen);
      doc.setFont('helvetica', 'bold');
      doc.text(`+${roi}%`, roiBadgeX + 14, yPos + 9.5, { align: 'center' });
    }

    // DNA match
    const matchBadgeX = cardX + cardWidth - 32;
    doc.setFillColor(248, 248, 252);
    doc.roundedRect(matchBadgeX, yPos + 5, 24, 7, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...PREMIUM_COLORS.deepPurple);
    doc.setFont('helvetica', 'bold');
    doc.text(`${opp.alignment_score.toFixed(1)}`, matchBadgeX + 12, yPos + 9.5, { align: 'center' });

    yPos += cardHeight + 3;
  });

  yPos += 12;

  // === FINAL PAGE ===
  doc.addPage();

  doc.setFillColor(...PREMIUM_COLORS.deepBlack);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Minimal texture
  doc.setDrawColor(28, 28, 30);
  doc.setLineWidth(0.03);
  for (let i = 0; i < pageHeight; i += 4) {
    doc.line(0, i, pageWidth, i);
  }

  doc.setFillColor(...PREMIUM_COLORS.gold);
  doc.rect(0, 0, pageWidth, 1, 'F');

  yPos = 45;

  // Add logo to final page
  if (logo) {
    const finalLogoSize = 30;
    const finalLogoX = pageWidth / 2 - finalLogoSize / 2;
    const finalLogoY = yPos;
    try {
      doc.addImage(logo, 'PNG', finalLogoX, finalLogoY, finalLogoSize, finalLogoSize);
    } catch (error) {
    }
    yPos += finalLogoSize + 8;
  } else {
    yPos = 60;
  }

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PREMIUM_COLORS.gold);
  doc.text('HNWI CHRONICLES', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(170, 170, 170);
  doc.text('Alternative Asset Intelligence & HNWI Pattern Recognition', pageWidth / 2, yPos, { align: 'center' });
  yPos += 24;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(190, 190, 190);
  doc.text(`Copyright ${new Date().getFullYear()} HNWI Chronicles. All Rights Reserved.`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 18;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);

  const legalText = [
    'CONFIDENTIALITY NOTICE',
    '',
    'This simulation report is confidential and proprietary to HNWI Chronicles.',
    'Unauthorized distribution, reproduction, or disclosure is strictly prohibited.',
    '',
    'ABOUT THIS SIMULATION',
    '',
    'This report analyzes your strategic decision-making patterns using real-world',
    `scenarios from our intelligence database of ${reportData.executive_summary.peer_group_size.toLocaleString()}+ HNWI developments.`,
    'The simulation identifies opportunities aligned with your strategic DNA.',
    '',
    'DISCLAIMER',
    '',
    'This intelligence analysis is provided for informational purposes only.',
    'It does not constitute financial, legal, or tax advice.',
    'Consult with qualified professionals before making any investment decisions.',
  ];

  legalText.forEach(line => {
    if (line === 'CONFIDENTIALITY NOTICE' || line === 'DISCLAIMER' || line === 'ABOUT THIS SIMULATION') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PREMIUM_COLORS.gold);
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
    } else {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    }
    yPos += 4.5;
  });

  yPos += 16;

  doc.setFontSize(10);
  doc.setTextColor(...PREMIUM_COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('app.hnwichronicles.com', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Real-time intelligence on alternative assets and wealth preservation strategies', pageWidth / 2, yPos, { align: 'center' });

  const bottomY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  const finalDate = new Date(reportData.generated_at);
  const dateStr = finalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = finalDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  doc.text(`Report Generated: ${dateStr} at ${timeStr}`, pageWidth / 2, bottomY, { align: 'center' });

  doc.setFillColor(...PREMIUM_COLORS.gold);
  doc.rect(0, pageHeight - 1, pageWidth, 1, 'F');

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1 && i < totalPages) {
      addPageFooter(i - 1, totalPages - 2);
    }
  }

  return doc;
};

export const downloadPDF = async (reportData: EnhancedReportData, sessionId: string) => {
  const logo = await loadLogoAsBase64();
  const doc = await generateSimulationPDF(reportData, logo);
  const reportDate = new Date(reportData.generated_at);
  const dateStr = reportDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  const tierLabel = reportData.executive_summary.tier.charAt(0).toUpperCase() + reportData.executive_summary.tier.slice(1);
  doc.save(`HNWI_Chronicles_${tierLabel}_Simulation_${dateStr}.pdf`);
};

export const previewPDF = async (reportData: EnhancedReportData) => {
  const logo = await loadLogoAsBase64();
  const doc = await generateSimulationPDF(reportData, logo);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};
