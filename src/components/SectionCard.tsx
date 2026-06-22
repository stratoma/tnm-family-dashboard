import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function SectionCard({ title, subtitle, icon, action, children, className = '' }: SectionCardProps) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon ? <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-linen text-ink">{icon}</div> : null}
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
