import type { NextRequest } from 'next/server';
import { renderDecisionMemoPdf } from '@/lib/decision-memo/render-decision-memo-pdf';

interface RouteParams {
  params: {
    intakeId: string;
  };
}

export async function GET(request: NextRequest, context: RouteParams) {
  const { intakeId } = await Promise.resolve(context.params);
  return renderDecisionMemoPdf(request, intakeId);
}

export const maxDuration = 60;
