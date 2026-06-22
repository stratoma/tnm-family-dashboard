import type { ReactNode } from 'react';

export default function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-oat bg-linen/50 p-6 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-stone-600">{children}</p>
    </div>
  );
}
