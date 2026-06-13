// components/ask-rohith-jarvis/visualizations/DataExplainerViz.tsx
// Sober source-backed explainers for Audelle conversation answers.

'use client';

interface DataRow {
  label: string;
  value: number;
  display?: string;
  unit?: string;
  source?: string;
  min?: number;
  max?: number;
  range_min?: number;
  range_max?: number;
  segment?: string;
  segments?: Array<{ label?: string; value?: number }>;
}

interface DataSection {
  kind:
    | 'bar'
    | 'deviation'
    | 'line'
    | 'pie'
    | 'range'
    | 'stacked_bar'
    | 'table';
  title: string;
  unit?: string;
  insight?: string;
  rows?: Array<DataRow | string[]>;
  columns?: string[];
  subtitle?: string;
}

interface DataExplainerVizProps {
  data: {
    title?: string;
    subtitle?: string;
    sections?: DataSection[];
  };
}

const axisColor = 'hsl(var(--muted-foreground))';
const gridColor = 'hsl(var(--border))';
const barColor = 'hsl(var(--primary))';
const mutedBarColor = 'hsl(var(--muted-foreground))';
const chartPalette = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--secondary))',
  'hsl(var(--destructive))',
];

function formatValue(value: number, unit?: string) {
  const numeric = Number(value || 0);
  const shown = Math.abs(numeric) >= 1000
    ? numeric.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : numeric.toLocaleString(undefined, { maximumFractionDigits: 2 }).replace(/\.00$/, '');
  if (unit && (unit === '%' || unit.toLowerCase().includes('percent'))) return `${shown}%`;
  return `${shown}${unit ? ` ${unit}` : ''}`;
}

function sectionRows(section: DataSection): DataRow[] {
  return Array.isArray(section.rows)
    ? section.rows.filter((row): row is DataRow => !Array.isArray(row) && Number.isFinite(Number(row.value))).slice(0, 8)
    : [];
}

function sectionValueRows(section: DataSection): DataRow[] {
  return Array.isArray(section.rows)
    ? section.rows.filter((row): row is DataRow => !Array.isArray(row) && Number.isFinite(Number(row.value))).slice(0, 8)
    : [];
}

function sectionRangeRows(section: DataSection): Array<{ label: string; min: number; max: number }> {
  return Array.isArray(section.rows)
    ? section.rows
        .filter((row): row is DataRow => {
          if (Array.isArray(row)) return false
          const min = Number(row.min ?? row.range_min)
          const max = Number(row.max ?? row.range_max)
          return Number.isFinite(min) && Number.isFinite(max) && !Number.isNaN(min) && !Number.isNaN(max)
        })
        .map((row) => ({
          label: String(row.label || '').trim() || 'Range',
          min: Number(row.min ?? row.range_min),
          max: Number(row.max ?? row.range_max),
        }))
        .slice(0, 8)
    : [];
}

function sectionPieRows(section: DataSection): DataRow[] {
  return Array.isArray(section.rows)
    ? section.rows.filter((row): row is DataRow => !Array.isArray(row) && Number.isFinite(Number(row.value))).slice(0, 8)
    : [];
}

function normalizePieTitle(section: DataSection): string {
  return section.title || 'Distribution'
}

function isLabeledPercentRow(row: DataRow) {
  const label = String(row.label || '').toLowerCase();
  const value = Math.abs(Number(row.value || 0));
  const looksLikePercent = ['growth', 'change', 'decline', 'drop'].some((word) => label.includes(word));
  return looksLikePercent && value <= 100;
}

function isInferredPercentRow(row: DataRow, section: DataSection) {
  const unit = String(row.unit || section.unit || '').toLowerCase();
  return isLabeledPercentRow(row) && (!unit || unit === 'value' || unit === 'number');
}

function unitKey(row: DataRow, section: DataSection) {
  if (isLabeledPercentRow(row) || isInferredPercentRow(row, section)) return 'percent';
  return String(row.unit || section.unit || 'value').toLowerCase();
}

function isPercentSignal(row: DataRow, section: DataSection) {
  const unit = unitKey(row, section);
  return unit === '%' || unit.includes('percent');
}

function hasMixedUnits(rows: DataRow[], section: DataSection) {
  const units = new Set(rows.map((row) => unitKey(row, section)));
  return units.size > 1;
}

function normalizedSignalWidth(row: DataRow, rows: DataRow[], section: DataSection) {
  const unit = unitKey(row, section);
  const label = String(row.label || '').toLowerCase();
  const value = Math.abs(Number(row.value || 0));
  if (unit.includes('percent') || (label.includes('growth') && value <= 100)) {
    return Math.max(8, Math.min(100, value));
  }

  const sameUnitValues = rows
    .filter((item) => unitKey(item, section) === unit)
    .map((item) => Math.abs(Number(item.value || 0)))
    .filter((item) => Number.isFinite(item));
  const max = Math.max(...sameUnitValues, value, 1);
  return Math.max(8, Math.min(100, (value / max) * 100));
}

function displaySignalValue(row: DataRow, section: DataSection) {
  const unit = row.unit || section.unit;
  const unitText = String(unit || '').toLowerCase();
  if (isLabeledPercentRow(row) || isInferredPercentRow(row, section) || unitText.includes('percent') || unitText === '%') {
    if (row.display && /%|percent/i.test(row.display)) return row.display;
    return `${formatValue(row.value)}%`;
  }
  if (row.display) return row.display;
  return formatValue(row.value, unit);
}

function chartExtent(rows: DataRow[]) {
  const values = rows
    .map((row) => Number(row.value || 0))
    .filter((value) => Number.isFinite(value));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  return { min, max };
}

function compactAxisLabel(label: string, maxLength = 14) {
  const text = String(label || '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function SignalSection({ section }: { section: DataSection }) {
  const rows = sectionRows(section);
  if (!rows.length) return null;

  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <div className="mb-3">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => {
          const showComparableBar = isPercentSignal(row, section);
          const width = showComparableBar ? normalizedSignalWidth(row, rows, section) : 0;
          return (
            <div key={`${row.label}-${index}`} className="grid gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-xs font-medium text-foreground/85">{row.label}</span>
                <span className="shrink-0 text-xs font-semibold text-foreground">
                  {displaySignalValue(row, section)}
                </span>
              </div>
              {showComparableBar ? (
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/75"
                    style={{ width: `${width}%` }}
                  />
                </div>
              ) : (
                <div className="h-px rounded-full bg-border/45" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DivergenceSection({ section }: { section: DataSection }) {
  const rows = sectionRows(section);
  if (!rows.length) return null;
  const maxAbs = Math.max(...rows.map((row) => Math.abs(Number(row.value || 0))), 1);

  return (
    <section className="border-t border-border/25 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-3">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => {
          const value = Number(row.value || 0);
          const width = Math.max(8, Math.min(50, (Math.abs(value) / maxAbs) * 50));
          const positive = value >= 0;
          return (
            <div key={`${row.label}-${index}`} className="grid gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-xs font-medium text-foreground/85">{row.label}</span>
                <span className="shrink-0 text-xs font-semibold text-foreground">
                  {displaySignalValue(row, section)}
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-muted">
                <div className="absolute left-1/2 top-[-3px] h-4 w-px bg-border" />
                <div
                  className="absolute top-0 h-full rounded-full bg-primary/75"
                  style={positive
                    ? { left: '50%', width: `${width}%` }
                    : { right: '50%', width: `${width}%` }
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BarSection({ section }: { section: DataSection }) {
  const rows = sectionRows(section);
  if (!rows.length) return null;
  if (hasMixedUnits(rows, section)) return <SignalSection section={section} />;

  const width = 560;
  const height = 236;
  const margin = { top: 24, right: 18, bottom: 62, left: 48 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const { max } = chartExtent(rows);
  const yScale = (value: number) => chartHeight - (Math.max(0, value) / max) * chartHeight;
  const slot = chartWidth / rows.length;
  const barWidth = Math.max(26, Math.min(52, slot * 0.56));
  const ticks = [0, max / 2, max];

  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full overflow-visible" role="img" aria-label={section.title}>
        {ticks.map((tick, index) => {
          const y = margin.top + yScale(tick);
          return (
            <g key={index}>
              <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke={gridColor} strokeOpacity={0.42} />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" fill={axisColor} fontSize="10">
                {formatValue(tick, section.unit)}
              </text>
            </g>
          );
        })}
        {rows.map((row, index) => {
          const value = Math.max(0, Number(row.value || 0));
          const x = margin.left + slot * index + (slot - barWidth) / 2;
          const y = margin.top + yScale(value);
          const barHeight = chartHeight - yScale(value);
          return (
            <g key={`${row.label}-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barHeight)}
                rx="4"
                fill={index === 0 ? barColor : mutedBarColor}
                fillOpacity={index === 0 ? 0.92 : 0.5}
              />
              <text x={x + barWidth / 2} y={Math.max(12, y - 7)} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="600">
                {displaySignalValue(row, section)}
              </text>
              <text x={x + barWidth / 2} y={height - 38} textAnchor="middle" fill={axisColor} fontSize="10">
                {compactAxisLabel(row.label)}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

function LineSection({ section }: { section: DataSection }) {
  const rows = sectionValueRows(section);
  if (!rows.length) return null;
  if (rows.length < 3) return <SignalSection section={section} />;

  const width = 560;
  const height = 224;
  const margin = { top: 22, right: 24, bottom: 50, left: 44 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const { min, max } = chartExtent(rows);
  const span = Math.max(1, max - min);
  const xFor = (index: number) => margin.left + (rows.length === 1 ? chartWidth / 2 : (chartWidth / (rows.length - 1)) * index);
  const yFor = (value: number) => margin.top + chartHeight - ((value - min) / span) * chartHeight;
  const points = rows.map((row, index) => `${xFor(index)},${yFor(Number(row.value || 0))}`).join(' ');
  const ticks = [min, min + span / 2, max];

  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full overflow-visible" role="img" aria-label={section.title}>
        {ticks.map((tick, index) => {
          const y = yFor(tick);
          return (
            <g key={index}>
              <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke={gridColor} strokeOpacity={0.42} />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" fill={axisColor} fontSize="10">
                {formatValue(tick, section.unit)}
              </text>
            </g>
          );
        })}
        <polyline points={points} fill="none" stroke={barColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {rows.map((row, index) => {
          const x = xFor(index);
          const y = yFor(Number(row.value || 0));
          return (
            <g key={`${row.label}-${index}`}>
              <circle cx={x} cy={y} r="4.5" fill="hsl(var(--background))" stroke={barColor} strokeWidth="2" />
              <text x={x} y={Math.max(12, y - 10)} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="600">
                {displaySignalValue(row, section)}
              </text>
              <text x={x} y={height - 30} textAnchor="middle" fill={axisColor} fontSize="10">
                {compactAxisLabel(row.label, 12)}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

function RangeSection({ section }: { section: DataSection }) {
  const rows = sectionRangeRows(section);
  if (!rows.length) return null;
  const minValue = Math.min(...rows.map((row) => row.min), 0);
  const maxValue = Math.max(...rows.map((row) => row.max), 1);
  const span = Math.max(1, maxValue - minValue);

  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => {
          const left = ((row.min - minValue) / span) * 100;
          const width = ((row.max - row.min) / span) * 100;
          return (
            <div key={`${row.label}-${index}`} className="grid gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-xs text-foreground/85">{row.label}</span>
                <span className="shrink-0 text-xs font-semibold text-foreground">{formatValue(row.min)} - {formatValue(row.max)}</span>
              </div>
              <div className="relative h-3 rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 rounded-full bg-primary/70"
                  style={{ left: `${Math.max(0, Math.min(100, left))}%`, width: `${Math.max(4, Math.min(100 - left, width))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StackedSection({ section }: { section: DataSection }) {
  const rows = sectionValueRows(section);
  if (!rows.length) return null;
  const palette = [barColor, 'hsl(var(--destructive))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <div className="divide-y divide-border/20">
        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} className="py-2 last:pb-0">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium text-foreground/85">{row.label}</span>
              <span className="text-xs font-semibold text-foreground">{displaySignalValue(row, section)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(8, Math.min(100, normalizedSignalWidth(row, rows, section)))}%`,
                  backgroundColor: palette[index % palette.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PieSection({ section }: { section: DataSection }) {
  const rows = sectionPieRows(section);
  if (!rows.length) return null;

  const data = rows.map((row) => ({ ...row, value: Number(row.value || 0) }));
  const total = data.reduce((acc, item) => acc + (Number.isFinite(item.value) ? Math.max(0, item.value) : 0), 0);
  if (total <= 0) return <SignalSection section={section} />;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-foreground">{normalizePieTitle(section)}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <svg viewBox="0 0 560 220" className="h-56 w-full overflow-visible" role="img" aria-label={section.title}>
        <circle cx="122" cy="110" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="28" />
        {data.map((row, index) => {
          const value = Math.max(0, row.value);
          const dash = (value / total) * circumference;
          const segment = (
            <circle
              key={`${row.label}-${index}`}
              cx="122"
              cy="110"
              r={radius}
              fill="none"
              stroke={chartPalette[index % chartPalette.length]}
              strokeWidth="28"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform="rotate(-90 122 110)"
            />
          );
          offset += dash;
          return segment;
        })}
        <text x="122" y="106" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="20" fontWeight="700">
          {formatValue(total, section.unit)}
        </text>
        <text x="122" y="126" textAnchor="middle" fill={axisColor} fontSize="10">
          total
        </text>
        {data.map((row, index) => {
          const y = 54 + index * 31;
          return (
            <g key={`${row.label}-legend-${index}`}>
              <rect x="240" y={y - 9} width="10" height="10" rx="2" fill={chartPalette[index % chartPalette.length]} />
              <text x="258" y={y} fill="hsl(var(--foreground))" fontSize="12" fontWeight="600">
                {row.label}
              </text>
              <text x="500" y={y} textAnchor="end" fill={axisColor} fontSize="12">
                {formatValue(row.value, row.unit || section.unit)}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

function DeviationSection({ section }: { section: DataSection }) {
  const rows = sectionRows(section);
  if (!rows.length) return null;
  if (rows.length <= 3) return <DivergenceSection section={section} />;
  return <LineSection section={section} />;
}

function TableSection({ section }: { section: DataSection }) {
  const rows = Array.isArray(section.rows) ? section.rows.slice(0, 8) : [];
  const columns = Array.isArray(section.columns) && section.columns.length ? section.columns : ['Signal', 'Value'];
  if (!rows.length) return null;

  return (
    <section className="border-t border-border/25 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
      </div>
      <div className="divide-y divide-border/20 sm:hidden">
        {rows.map((row: any, rowIndex) => {
          const cells = Array.isArray(row) ? row : [row.label, formatValue(row.value, row.unit)];
          return (
            <dl key={rowIndex} className="py-2 first:pt-0 last:pb-0">
              {cells.slice(0, columns.length).map((cell: any, cellIndex: number) => (
                <div key={cellIndex} className="grid grid-cols-[72px_minmax(0,1fr)] gap-2 py-0.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {columns[cellIndex]}
                  </dt>
                  <dd className="text-xs leading-relaxed text-foreground/85">
                    {String(cell || '')}
                  </dd>
                </div>
              ))}
            </dl>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-full text-left text-xs">
          <thead className="border-y border-border/30 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column} className="py-2 pr-4 font-semibold uppercase tracking-wide">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, rowIndex) => {
              const cells = Array.isArray(row) ? row : [row.label, formatValue(row.value, row.unit)];
              return (
                <tr key={rowIndex} className="border-b border-border/20 last:border-b-0">
                  {cells.slice(0, columns.length).map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="max-w-[260px] py-2 pr-4 align-top text-foreground/85">
                      {String(cell || '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DataExplainerViz({ data }: DataExplainerVizProps) {
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  if (!sections.length) return null;

  return (
    <figure className="my-4 w-full border-y border-border/30 py-3">
      <figcaption className="mb-2">
        <h3 className="text-sm font-semibold text-foreground">{data?.title || 'Source Read'}</h3>
        {data?.subtitle && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{data.subtitle}</p>}
      </figcaption>
      <div className="divide-y divide-border/25">
        {sections.map((section, index) => {
          if (section.kind === 'bar') return <BarSection key={index} section={section} />;
          if (section.kind === 'deviation') return <DeviationSection key={index} section={section} />;
          if (section.kind === 'line') return <LineSection key={index} section={section} />;
          if (section.kind === 'pie') return <PieSection key={index} section={section} />;
          if (section.kind === 'range') return <RangeSection key={index} section={section} />;
          if (section.kind === 'stacked_bar') return <StackedSection key={index} section={section} />;
          if (section.kind === 'table') return <TableSection key={index} section={section} />;
          return null;
        })}
      </div>
    </figure>
  );
}
