'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Crown,
  Users,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { UserRole } from '@/lib/types';

type Entry = 'master_admin' | 'admin' | 'member';

const ENTRY_META: Record<
  Entry,
  { icon: typeof Crown; title: string; subtitle: string; role: UserRole; redirect: string }
> = {
  master_admin: {
    icon: Crown,
    title: 'Master Admin',
    subtitle: 'Platform oversight — Master Anchor Pool, revenue ledger, and global movements.',
    role: 'master_admin',
    redirect: '/ledger',
  },
  admin: {
    icon: Users,
    title: 'Circle Admin',
    subtitle: 'Create and run ajo, esusu, or savings circles. Invite members with a code.',
    role: 'admin',
    redirect: '/',
  },
  member: {
    icon: User,
    title: 'Circle Member',
    subtitle: 'Join a circle with an invite code and contribute to your group.',
    role: 'member',
    redirect: '/groups/join',
  },
};

export default function SignInPage() {
  const router = useRouter();
  const { setSession } = useSession();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry) return;
    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      const meta = ENTRY_META[entry];
      const res = await fetch('/api/users/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          role: meta.role,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to sign in');
      }
      
      const data = await res.json();
      
      // ✅ USE SMART REDIRECT FROM API, FALLBACK TO DEFAULT
      const redirectPath = data.redirect || meta.redirect;
      
      setSession(data.user.id, data.user.name, data.user.role || meta.role);
      toast.success(`Welcome to Smart Ajo — signed in as ${meta.title}`);
      router.push(redirectPath);
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[480px] bg-hero-glow" aria-hidden />
      <div className="container relative flex min-h-[70vh] max-w-md items-center py-16">
        <Card className="w-full border-border/60 shadow-lg animate-in-up">
          <CardHeader className="space-y-2">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              MVP — no email required
            </div>
            <CardTitle className="font-display text-2xl">Enter your ajo</CardTitle>
            <CardDescription>
              Choose how you want to sign in. You can always sign out and pick a different role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!entry ? (
              <div className="space-y-3">
                {(Object.keys(ENTRY_META) as Entry[]).map((key) => {
                  const meta = ENTRY_META[key];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEntry(key)}
                      className="group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-secondary/40"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold">{meta.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {meta.subtitle}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}

                <div className="relative my-2">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    or
                  </span>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Ask your circle admin for an invite code, or create a new circle after signing in.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Signing in as <span className="font-semibold text-foreground">{ENTRY_META[entry].title}</span>
                  </span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ada Okafor"
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 ..."
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? 'Signing in…' : `Continue as ${ENTRY_META[entry].title}`}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
                <button
                  type="button"
                  onClick={() => setEntry(null)}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  Choose a different role
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}