export function LoadingState({ label = 'Loading family details...' }: { label?: string }) {
  return <div className="card animate-pulse text-stone-500">{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="card border-clay/40 bg-clay/10 text-clay">{message}</div>;
}
