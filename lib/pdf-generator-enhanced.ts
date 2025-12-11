// lib/pdf-generator-enhanced.ts
// Enhanced Assessment Report PDF generator with visual analytics

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { EnhancedReportData } from '@/types/assessment-report';

// HNWI Chronicles Brand Colors
const BRAND_COLORS = {
  gold: [218, 165, 32],
  silver: [192, 192, 192],
  bronze: [205, 127, 50],
  blue: [59, 130, 246],
  black: [0, 0, 0],
  white: [255, 255, 255],
  darkGray: [30, 30, 30],
  lightGray: [240, 240, 240],
  textDark: [25, 25, 25],
  textLight: [250, 250, 250],
};

const TIER_CONFIG = {
  architect: { icon: 'A', label: 'ARCHITECT', color: BRAND_COLORS.gold },
  operator: { icon: 'O', label: 'OPERATOR', color: BRAND_COLORS.silver },
  observer: { icon: 'OB', label: 'OBSERVER', color: BRAND_COLORS.bronze },
  premium: { icon: 'P', label: 'PREMIUM', color: BRAND_COLORS.blue },
};

export const generateEnhancedPDF = (reportData: EnhancedReportData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper: Add watermark
  const addWatermark = () => {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.setTextColor(218, 165, 32);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('HNWI CHRONICLES', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();
  };

  // Helper: Add page footer
  const addPageFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `HNWI Chronicles © ${new Date().getFullYear()} • Enhanced Report • Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // Helper: Check page break
  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      addWatermark();
      yPos = 20;
    }
  };

  // Helper: Render formatted text with page breaks
  const renderText = (text: string, x: number, startY: number, maxWidth: number): number => {
    let currentY = startY;
    const lineHeight = 6;

    const paragraphs = text.split('\n\n');

    paragraphs.forEach((paragraph) => {
      if (!paragraph.trim()) return;

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);

      lines.forEach((line: string) => {
        if (currentY + lineHeight > pageHeight - 20) {
          doc.addPage();
          addWatermark();
          currentY = 20;
        }

        doc.text(line, x, currentY);
        currentY += lineHeight;
      });

      currentY += 4; // Paragraph spacing
    });

    return currentY;
  };

  // === COVER PAGE ===
  doc.setFillColor(...BRAND_COLORS.darkGray);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(0, 0, pageWidth, 3, 'F');

  doc.setTextColor(...BRAND_COLORS.gold);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('HNWI CHRONICLES', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('ENHANCED ASSESSMENT REPORT', pageWidth / 2, 75, { align: 'center' });

  doc.setDrawColor(...BRAND_COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, 82, pageWidth / 2 + 40, 82);

  // Tier Icon
  const tierKey = reportData.executive_summary.tier as keyof typeof TIER_CONFIG;
  const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.observer;

  doc.setFontSize(48);
  doc.text(tierConfig.icon, pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...tierConfig.color);
  doc.text(tierConfig.label, pageWidth / 2, 145, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('TIER CLASSIFICATION', pageWidth / 2, 155, { align: 'center' });

  // Metrics
  yPos = 175;
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text(`Percentile: ${reportData.executive_summary.percentile}th`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  doc.text(`Peer Group: ${reportData.executive_summary.peer_group_size.toLocaleString()} HNWIs`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  doc.text(`Opportunities Accessible: ${reportData.executive_summary.opportunities_accessible}`, pageWidth / 2, yPos, { align: 'center' });

  // Date
  doc.setFontSize(11);
  doc.setTextColor(150, 150, 150);
  const reportDate = new Date(reportData.generated_at);
  doc.text(
    reportDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pageWidth / 2,
    pageHeight - 30,
    { align: 'center' }
  );

  // === PAGE 2: EXECUTIVE SUMMARY ===
  doc.addPage();
  addWatermark();
  yPos = 20;

  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(15, yPos - 5, 3, 12, 'F');
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', 22, yPos + 5);
  yPos += 20;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  const summaryMetrics = [
    `Tier Classification: ${reportData.executive_summary.tier.toUpperCase()}`,
    `Performance Percentile: ${reportData.executive_summary.percentile}th`,
    `Net Worth Estimate: ${reportData.executive_summary.net_worth_estimate}`,
    `Peer Group Size: ${reportData.executive_summary.peer_group_size.toLocaleString()} developments`,
    `Opportunities Accessible: ${reportData.executive_summary.opportunities_accessible}`,
    `Opportunities Missed: ${reportData.executive_summary.opportunities_missed}`,
    `Optimization Potential: ${(reportData.executive_summary.optimization_potential * 100).toFixed(1)}%`,
    `Confidence Score: ${(reportData.executive_summary.confidence_score * 100).toFixed(1)}%`,
  ];

  if (reportData.executive_summary.mental_models_applied) {
    summaryMetrics.push(`Mental Models Applied: ${reportData.executive_summary.mental_models_applied}`);
  }

  if (reportData.executive_summary.sophistication_score) {
    summaryMetrics.push(`Sophistication Score: ${reportData.executive_summary.sophistication_score}/10`);
  }

  summaryMetrics.forEach((metric) => {
    checkPageBreak(10);
    doc.text(`• ${metric}`, 20, yPos);
    yPos += 7;
  });

  yPos += 10;

  // === SPIDER GRAPH DATA ===
  if (reportData.spider_graphs?.peer_comparison) {
    checkPageBreak(50);

    doc.setFillColor(...BRAND_COLORS.gold);
    doc.rect(15, yPos - 5, 3, 12, 'F');
    doc.setTextColor(...BRAND_COLORS.gold);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('STRATEGIC DIMENSIONS', 22, yPos + 5);
    yPos += 20;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');

    const spider = reportData.spider_graphs.peer_comparison;

    spider.dimensions.forEach((dim, idx) => {
      checkPageBreak(15);

      const userScore = (spider.user_scores[idx] * 100).toFixed(0);
      const peerAvg = (spider.peer_average[idx] * 100).toFixed(0);
      const topPerf = (spider.top_performers[idx] * 100).toFixed(0);

      doc.setFont('helvetica', 'bold');
      doc.text(`${dim}:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`Your Score: ${userScore}% | Peer Avg: ${peerAvg}% | Top: ${topPerf}%`, 80, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Improvement Areas
    if (spider.improvement_areas && spider.improvement_areas.length > 0) {
      checkPageBreak(30);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND_COLORS.gold);
      doc.text('Top Improvement Areas', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');

      spider.improvement_areas.slice(0, 3).forEach((area) => {
        checkPageBreak(20);

        doc.setFont('helvetica', 'bold');
        doc.text(`${area.dimension}:`, 20, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.text(`Gap: ${(area.gap * 100).toFixed(1)}%  |  Potential: ${area.improvement_potential.toFixed(1)}%`, 25, yPos);
        yPos += 10;
      });
    }
  }

  // === MISSED OPPORTUNITIES ===
  if (reportData.missed_opportunities?.top_missed && reportData.missed_opportunities.top_missed.length > 0) {
    doc.addPage();
    addWatermark();
    yPos = 20;

    doc.setFillColor(...BRAND_COLORS.gold);
    doc.rect(15, yPos - 5, 3, 12, 'F');
    doc.setTextColor(...BRAND_COLORS.gold);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MISSED OPPORTUNITIES', 22, yPos + 5);
    yPos += 20;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');

    doc.text(`Total Missed Value: $${reportData.missed_opportunities.total_missed_value.toLocaleString()}`, 20, yPos);
    yPos += 7;
    doc.text(`Total Opportunities Analyzed: ${reportData.missed_opportunities.total_opportunities_analyzed}`, 20, yPos);
    yPos += 15;

    reportData.missed_opportunities.top_missed.slice(0, 5).forEach((missed, idx) => {
      checkPageBreak(40);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${idx + 1}. ${missed.opportunity.title}`, 20, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Location: ${missed.opportunity.location} | Value: ${missed.opportunity.value}`, 25, yPos);
      yPos += 7;
      doc.text(`Missed Value: $${missed.financial_impact.missed_value.toLocaleString()} | ROI: ${missed.financial_impact.potential_roi}%`, 25, yPos);
      yPos += 7;
      doc.text(`Peer Adoption: ${missed.peer_performance.adoption_rate}% | Success Rate: ${missed.peer_performance.success_rate}%`, 25, yPos);
      yPos += 10;
    });
  }

  // === CELEBRITY OPPORTUNITIES ===
  if (reportData.celebrity_opportunities && reportData.celebrity_opportunities.length > 0) {
    doc.addPage();
    addWatermark();
    yPos = 20;

    doc.setFillColor(...BRAND_COLORS.gold);
    doc.rect(15, yPos - 5, 3, 12, 'F');
    doc.setTextColor(...BRAND_COLORS.gold);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('HIGH-ADOPTION OPPORTUNITIES', 22, yPos + 5);
    yPos += 20;

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('Opportunities that top performers in your peer group are pursuing', 20, yPos);
    yPos += 15;

    reportData.celebrity_opportunities.slice(0, 5).forEach((celeb, idx) => {
      checkPageBreak(35);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${idx + 1}. ${celeb.opportunity.title}`, 20, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Location: ${celeb.opportunity.location} | Value: ${celeb.opportunity.value}`, 25, yPos);
      yPos += 7;
      doc.text(`Alignment Score: ${(celeb.alignment_score * 100).toFixed(0)}% | Avg ROI: ${celeb.financial_metrics.avg_roi}%`, 25, yPos);
      yPos += 7;
      doc.text(`Top Performers: ${celeb.top_performer_stats.adopter_count} | Avg Percentile: ${celeb.top_performer_stats.avg_performance_percentile}th`, 25, yPos);
      yPos += 10;
    });
  }

  // === FINAL PAGE ===
  doc.addPage();
  addWatermark();
  doc.setFillColor(...BRAND_COLORS.darkGray);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(0, 0, pageWidth, 3, 'F');

  yPos = 60;

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.text('HNWI CHRONICLES', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('Alternative Asset Intelligence & HNWI Pattern Recognition', pageWidth / 2, yPos, { align: 'center' });
  yPos += 30;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 200, 200);
  doc.text(`© ${new Date().getFullYear()} HNWI Chronicles. All Rights Reserved.`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  const legalText = [
    'CONFIDENTIALITY NOTICE',
    '',
    'This enhanced assessment report is confidential and proprietary to HNWI Chronicles.',
    'Unauthorized distribution, reproduction, or disclosure is strictly prohibited.',
    '',
    'ABOUT THIS REPORT',
    '',
    'This report provides peer benchmarking, missed opportunity analysis,',
    `and strategic insights based on ${reportData.executive_summary.peer_group_size.toLocaleString()} HNWI developments.`,
    '',
    'DISCLAIMER',
    '',
    'This report is provided for informational purposes only.',
    'It does not constitute financial, legal, or tax advice.',
  ];

  doc.setFontSize(9);
  legalText.forEach(line => {
    if (line === 'CONFIDENTIALITY NOTICE' || line === 'DISCLAIMER' || line === 'ABOUT THIS REPORT') {
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

  doc.setFontSize(11);
  doc.setTextColor(...BRAND_COLORS.gold);
  doc.setFont('helvetica', 'bold');
  doc.text('app.hnwichronicles.com', pageWidth / 2, yPos, { align: 'center' });

  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');

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

// Download enhanced PDF
export const downloadEnhancedPDF = (reportData: EnhancedReportData, sessionId: string) => {
  const doc = generateEnhancedPDF(reportData);
  const reportDate = new Date(reportData.generated_at);
  const dateStr = reportDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  const tierLabel = reportData.executive_summary.tier.charAt(0).toUpperCase() + reportData.executive_summary.tier.slice(1);
  doc.save(`HNWI_Chronicles_Enhanced_Report_${tierLabel}_${dateStr}.pdf`);
};

// Preview enhanced PDF in new tab
export const previewEnhancedPDF = (reportData: EnhancedReportData) => {
  const doc = generateEnhancedPDF(reportData);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};
