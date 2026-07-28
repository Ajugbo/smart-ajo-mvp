'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import { ArrowRight, Users } from 'lucide-react';

export default function JoinGroupPage() {
  const router = useRouter();
  const { userId, name, ready } = useSession();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect route: redirect to signin if not logged in
  useEffect(() => {
    if (ready && !userId) {
      router.push('/signin');
    }
  }, [ready, userId, router]);

  if (!ready || !userId) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter an invite code.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: code, user_id: userId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join group');
      }
      
      // Success! Redirect to the new group dashboard
      router.push(`/groups/${data.group.id}`);
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
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mx-auto">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Join a Circle
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {name}. Enter the invite code shared by your Circle Admin.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-foreground">Invite Code</label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AJO-8X92"
              className="flex h-12 w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-center text-lg font-mono font-bold text-primary tracking-widest placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              autoFocus
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Circle'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
