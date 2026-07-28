'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import { Crown, Users, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

type Entry = 'master_admin' | 'admin' | 'member';

const ENTRY_META: Record<Entry, { icon: typeof Crown; title: string; subtitle: string; role: Entry }> = {
  master_admin: { icon: Crown, title: 'Master Admin', subtitle: 'Platform oversight & global ledger.', role: 'master_admin' },
  admin: { icon: Users, title: 'Circle Admin', subtitle: 'Create and manage circles.', role: 'admin' },
  member: { icon: User, title: 'Circle Member', subtitle: 'Join a circle with an invite code.', role: 'member' },
};

export default function SignInPage() {
  const router = useRouter();
  const { setSession } = useSession();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry || !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const meta = ENTRY_META[entry];
      const res = await fetch('/api/users/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null, role: meta.role }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to sign in');
      }
      
      const data = await res.json();
      setSession(data.user.id, data.user.name, data.user.role);
      router.push(data.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl p-6 space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Ajo MVP
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Enter your Ajo
          </h1>
          <p className="text-sm text-muted-foreground">Choose how you want to sign in.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {!entry ? (
          <div className="space-y-3">
            {(Object.keys(ENTRY_META) as Entry[]).map((key) => {
              const meta = ENTRY_META[key];
              const Icon = meta.icon;
              return (
                <div key={key} className="space-y-1">
                  <button 
                    type="button" 
                    onClick={() => setEntry(key)} 
                    className="group flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-primary/50 hover:bg-white/10"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{meta.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{meta.subtitle}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </button>
                  {/*  NEW: Quick "Enter Group" link for Circle Admins */}
                  {key === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setEntry('admin')}
                      className="w-full text-center text-xs text-primary hover:text-primary/80 transition-colors px-4"
                    >
                      Already have a circle? Enter Group &rarr;
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Signing in as <span className="font-semibold">{ENTRY_META[entry].title}</span></span>
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Display name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ada Okafor"
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone (optional)</label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 ..."
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <button 
              type="submit" 
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing in…' : `Continue as ${ENTRY_META[entry].title}`}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setEntry(null)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Choose a different role
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
