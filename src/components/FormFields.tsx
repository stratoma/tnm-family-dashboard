import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="input" {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="input min-h-28 resize-none" {...props} />;
}

export function FormActions({ onCancel, submitLabel = 'Save' }: { onCancel: () => void; submitLabel?: string }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" className="button-soft" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" className="button-primary">
        {submitLabel}
      </button>
    </div>
  );
}
