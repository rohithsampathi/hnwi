// components/ask-rohith-jarvis/visualizations/DataExplainerViz.tsx
// Sober source-backed explainers for Audelle conversation answers.

'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DataRow {
  label: string;
  value: number;
  display?: string;
  unit?: string;
  source?: string;
}

interface DataSection {
  kind: 'bar' | 'deviation' | 'table';
  title: string;
  unit?: string;
  insight?: string;
  rows?: Array<DataRow | string[]>;
  columns?: string[];
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

  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={gridColor} strokeOpacity={0.45} horizontal={false} />
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="label"
              type="category"
              width={112}
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.28)' }}
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: any, _name: any, item: any) => [
                formatValue(Number(value), item?.payload?.unit || section.unit),
                'Value',
              ]}
            />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} fill={barColor} barSize={18}>
              {rows.map((_, index) => (
                <Cell key={index} fill={index === 0 ? barColor : mutedBarColor} fillOpacity={index === 0 ? 0.92 : 0.48} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DeviationSection({ section }: { section: DataSection }) {
  const rows = sectionRows(section);
  if (!rows.length) return null;
  if (rows.length <= 3) return <DivergenceSection section={section} />;
  const values = rows.map((row) => Number(row.value || 0));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const padding = Math.max(4, (max - min) * 0.15);

  return (
    <section className="border-t border-border/25 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-foreground">{section.title}</h4>
        {section.insight && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.insight}</p>
        )}
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 12, right: 28, left: 22, bottom: 34 }}>
            <CartesianGrid stroke={gridColor} strokeOpacity={0.45} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              height={42}
              interval={0}
              angle={-8}
              textAnchor="end"
              tickMargin={10}
            />
            <YAxis
              width={38}
              domain={[min - padding, max + padding]}
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickMargin={4}
            />
            <ReferenceLine y={0} stroke={axisColor} strokeOpacity={0.55} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: any, _name: any, item: any) => [
                formatValue(Number(value), item?.payload?.unit || section.unit),
                'Change',
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={barColor}
              strokeWidth={2}
              dot={{ r: 4, fill: 'hsl(var(--background))', stroke: barColor, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
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
          if (section.kind === 'table') return <TableSection key={index} section={section} />;
          return null;
        })}
      </div>
    </figure>
  );
}
