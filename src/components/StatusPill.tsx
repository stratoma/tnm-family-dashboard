type StatusPillProps = {
  label: string;
  tone?: 'green' | 'yellow' | 'red' | 'neutral' | 'blue';
};

const toneClass = {
  green: 'bg-sage/15 text-sage',
  yellow: 'bg-butter/30 text-stone-700',
  red: 'bg-clay/15 text-clay',
  neutral: 'bg-linen text-stone-600',
  blue: 'bg-skysoft text-stone-700',
};

export default function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${toneClass[tone]}`}>{label}</span>;
}
