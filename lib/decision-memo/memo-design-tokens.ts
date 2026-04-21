import { cn } from '@/lib/utils';

type MemoNumberSize = 'hero' | 'metric' | 'stat' | 'inline' | 'small';
type MemoNumberTone = 'default' | 'primary' | 'muted' | 'positive' | 'warning' | 'danger';

const SIZE_CLASSES: Record<MemoNumberSize, string> = {
  hero: 'text-[clamp(2.4rem,4.8vw,4.5rem)] leading-[0.96] font-semibold',
  metric: 'text-[clamp(1.85rem,3vw,3rem)] leading-[1.02] font-semibold',
  stat: 'text-[clamp(1.5rem,2.4vw,2.4rem)] leading-[1.05] font-semibold',
  inline: 'text-xl md:text-2xl leading-[1.08] font-semibold',
  small: 'text-base md:text-lg leading-[1.1] font-semibold',
};

const TONE_CLASSES: Record<MemoNumberTone, string> = {
  default: 'text-foreground',
  primary: 'text-foreground',
  muted: 'text-muted-foreground/70',
  positive: 'text-foreground',
  warning: 'text-foreground',
  danger: 'text-foreground',
};

export function memoNumberClass(
  size: MemoNumberSize = 'metric',
  tone: MemoNumberTone = 'default',
  extra?: string,
) {
  return cn('tabular-nums tracking-tight', SIZE_CLASSES[size], TONE_CLASSES[tone], extra);
}
