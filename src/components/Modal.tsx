import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/30 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className="ml-auto flex h-full max-w-xl flex-col rounded-3xl bg-cream shadow-soft">
        <div className="flex items-center justify-between border-b border-oat px-5 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
