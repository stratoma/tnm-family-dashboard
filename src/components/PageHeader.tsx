import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-sage">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-stone-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
