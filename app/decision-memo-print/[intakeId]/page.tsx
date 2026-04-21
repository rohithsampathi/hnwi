import '@/styles/pdf-print.css';
import { headers } from 'next/headers';
import DecisionMemoLinearReport from '@/components/decision-memo/memo/DecisionMemoLinearReport';
import { fetchDecisionMemoSurfaceData } from '@/lib/decision-memo/fetch-decision-memo-surface-data';

interface PageProps {
  params: Promise<{
    intakeId: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DecisionMemoPrintPage({ params }: PageProps) {
  const { intakeId } = await params;

  try {
    const resolvedSurfaceData = await fetchDecisionMemoSurfaceData(
      intakeId,
      await headers(),
    );

    if (!resolvedSurfaceData) {
      return (
        <div data-loaded="true" data-error="No data">
          <div
            className="print-container"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
          >
            <p style={{ color: '#EF4444', fontSize: 14 }}>Error: No data</p>
          </div>
        </div>
      );
    }

    return (
      <div
        id="decision-memo-print-root"
        data-loaded="true"
        data-decision-memo-ready="pending"
        data-print-pagination-ready="pending"
      >
        <DecisionMemoLinearReport
          memoData={resolvedSurfaceData.memoData as any}
          backendData={resolvedSurfaceData.backendData}
          intakeId={intakeId}
          hnwiWorldCount={resolvedSurfaceData.developmentsCount ?? undefined}
          fullArtifact={resolvedSurfaceData.fullArtifact}
          mode="print"
        />
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load data';

    return (
      <div data-loaded="true" data-error={message}>
        <div
          className="print-container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
        >
          <p style={{ color: '#EF4444', fontSize: 14 }}>Error: {message}</p>
        </div>
      </div>
    );
  }
}
