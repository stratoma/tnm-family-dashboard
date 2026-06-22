import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole, Sparkles } from 'lucide-react';

const accessKey = 'family-dashboard-access';

type AccessGateProps = {
  children: React.ReactNode;
};

export default function AccessGate({ children }: AccessGateProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHasAccess(sessionStorage.getItem(accessKey) === 'granted');
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? 'Unable to verify that code.');
        return;
      }

      sessionStorage.setItem(accessKey, 'granted');
      setHasAccess(true);
      setCode('');
    } catch {
      setError('Access check is unavailable. Make sure the API is running and ACCESS_CODE is set.');
    } finally {
      setLoading(false);
    }
  }

  if (hasAccess) {
    return children;
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <div className="card w-full">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage text-white">
              <Sparkles size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Family Dashboard</h1>
              <p className="text-sm text-stone-500">Private family access</p>
            </div>
          </div>
          <div className="mb-5 rounded-3xl bg-linen p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-sage">
                <LockKeyhole size={20} />
              </span>
              <p className="text-sm leading-6 text-stone-600">
                Enter the family access code to open the dashboard on this device.
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="label">Access code</span>
              <input
                className="input"
                type="password"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Enter code"
                autoComplete="current-password"
                required
              />
            </label>
            {error ? <p className="rounded-2xl bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">{error}</p> : null}
            <button className="button-primary" type="submit" disabled={loading}>
              {loading ? 'Checking...' : 'Unlock dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
