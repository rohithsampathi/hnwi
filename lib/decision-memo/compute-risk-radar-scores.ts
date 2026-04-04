import { PdfMemoData } from '@/lib/pdf/pdf-types';

interface DoctrineScore {
  label: string;
  shortLabel: string;
  score: number;
  maxScore: number;
}

export function computeRiskRadarScores(memoData: PdfMemoData, isViaNegativa: boolean = false) {
  const doctrineMetadata =
    memoData.preview_data.scenario_tree_data?.doctrine_metadata ||
    memoData.preview_data.doctrine_metadata ||
    {};
  const failureModes = doctrineMetadata.failure_modes || [];
  const assessment = doctrineMetadata.antifragility_assessment || '';

  const isRuinExposed = assessment === 'RUIN_EXPOSED' || failureModes.some((f: any) =>
    ((f.mode || '') + ' ' + (f.description || '')).toUpperCase().includes('RUIN')
  );
  const isFrag = assessment === 'FRAGILE' || failureModes.some((f: any) =>
    ((f.mode || '') + ' ' + (f.description || '')).toUpperCase().includes('FRAGIL')
  );

  const baseline = isViaNegativa ? (isRuinExposed ? 3 : isFrag ? 4 : 5) : 7;

  function calcScore(keywords: string[]): number {
    let score = baseline;
    let matched = false;
    failureModes.forEach((f: any) => {
      const mode = (f.mode || '').toUpperCase();
      const desc = (f.description || '').toUpperCase();
      const book = (f.doctrine_book || '').toUpperCase();
      const sev = (f.severity || '').toUpperCase();
      const allText = `${mode} ${desc} ${book}`;
      if (keywords.some(k => allText.includes(k))) {
        matched = true;
        score -= sev === 'CRITICAL' ? 4 : sev === 'HIGH' ? 3 : sev === 'MEDIUM' ? 2 : 1;
      }
    });
    if (!matched && isViaNegativa) score += 1;
    return Math.max(0, Math.min(10, score));
  }

  const antifragilityScore = doctrineMetadata.antifragility_score != null
    ? Math.round(doctrineMetadata.antifragility_score / 10)
    : calcScore(['ANTIFRAGIL', 'FRAGIL', 'RUIN', 'STRESS', 'CRISIS', 'RESILIEN', 'SHOCK']);

  const liquidityScore = calcScore(['LIQUID', 'PRISON', 'TRAP', 'LOCK', 'EXIT', 'ABSD', 'STAMP', 'BARRIER', 'FROZEN', 'ILLIQUID', 'FOREIGN_OWNER', 'ACQUISITION']);

  const regulatoryScore = calcScore(['REGULAT', 'COMPLIANCE', 'FBAR', 'FATCA', 'PFIC', 'TAX_DRAG', 'PENALTY', 'REPORT', 'FILING', 'SANCTION', 'WORLDWIDE', 'DRAGNET']);

  const assetKeywords = ['ASSET_QUALITY', 'OVERVAL', 'BUBBLE', 'DEPRECIAT', 'DEFECT', 'TITLE'];
  const assetRaw = calcScore(assetKeywords);
  const hasAssetFailures = failureModes.some((f: any) =>
    assetKeywords.some(k => ((f.mode || '') + ' ' + (f.description || '')).toUpperCase().includes(k))
  );
  const finalAssetScore = hasAssetFailures ? assetRaw : Math.min(10, Math.max(8, baseline + 3));

  const operatorScore = calcScore(['OPERATOR', 'BEHAVIO', 'DECISION', 'BIAS', 'KAHNEMAN', 'HALLUCIN', 'DELUSION', 'EXPECT', 'PROJEC', 'OVERCONFID']);

  const valuationScore = calcScore(['VALUATION', 'PRICE', 'COST', 'NPV', 'NEGATIVE', 'OVERVAL', 'DAY_ONE', 'CAPITAL_DESTROY', 'LOSS', 'PREMIUM', 'SURCHARGE', 'OVERPAY']);

  const scores: DoctrineScore[] = [
    { label: 'Antifragility', shortLabel: 'Antifragile', score: antifragilityScore, maxScore: 10 },
    { label: 'Liquidity', shortLabel: 'Liquidity', score: liquidityScore, maxScore: 10 },
    { label: 'Regulatory', shortLabel: 'Regulatory', score: regulatoryScore, maxScore: 10 },
    { label: 'Asset Quality', shortLabel: 'Asset', score: finalAssetScore, maxScore: 10 },
    { label: 'Operator', shortLabel: 'Operator', score: operatorScore, maxScore: 10 },
    { label: 'Valuation', shortLabel: 'Valuation', score: valuationScore, maxScore: 10 },
  ];

  return {
    scores,
    antifragilityAssessment: assessment,
    failureModeCount: doctrineMetadata.failure_mode_count,
    totalRiskFlags: doctrineMetadata.risk_flags_total,
  };
}
