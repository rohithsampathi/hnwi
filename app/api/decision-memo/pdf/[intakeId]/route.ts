import type { NextRequest } from 'next/server';
import { renderDecisionMemoPdf } from '@/lib/decision-memo/render-decision-memo-pdf';

interface RouteParams {
  params: Promise<{
    intakeId: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const { intakeId } = await context.params;
  return renderDecisionMemoPdf(request, intakeId);
}

export const maxDuration = 60;
