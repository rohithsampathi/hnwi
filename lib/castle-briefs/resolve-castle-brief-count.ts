type RecordLike = Record<string, unknown>;

function asRecord(value: unknown): RecordLike | null {
  return typeof value === 'object' && value !== null
    ? (value as RecordLike)
    : null;
}

function numericOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function resolveCastleBriefCount(payload: unknown): number | null {
  const record = asRecord(payload);
  if (!record) {
    return null;
  }

  const castleBriefs = asRecord(record.castle_briefs);
  const developments = asRecord(record.developments);

  return (
    numericOrNull(castleBriefs?.total_count) ??
    numericOrNull(developments?.total_count) ??
    numericOrNull(record.count) ??
    numericOrNull(record.total_count) ??
    numericOrNull(record.total)
  );
}
