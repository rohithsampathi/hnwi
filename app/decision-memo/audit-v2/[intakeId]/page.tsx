import { redirect } from 'next/navigation';

interface DecisionMemoAuditV2RedirectPageProps {
  params: Promise<{ intakeId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildQuery(searchParams: Record<string, string | string[] | undefined> | undefined): string {
  const params = new URLSearchParams();
  params.set('view', 'route');

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (key === 'view' || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }
    params.set(key, value);
  });

  return params.toString();
}

export default async function DecisionMemoAuditV2RedirectPage({
  params,
  searchParams,
}: DecisionMemoAuditV2RedirectPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const query = buildQuery(resolvedSearchParams);

  redirect(`/decision-memo/audit/${encodeURIComponent(resolvedParams.intakeId)}?${query}`);
}
