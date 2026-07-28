'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase-client';
import { Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { userId, name, ready } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_contribution: 2000,
    target_multiplier: 10,
    max_participants: 10
  });

  useEffect(() => {
    if (ready && !userId) router.push('/signin');
  }, [ready, userId, router]);

  useEffect(() => {
    async function checkForExistingGroup() {
      if (!userId) return;
      const { data } = await supabase.from('groups').select('id').eq('admin_id', userId).order('created_at', { ascending: false }).limit(1).single();
      if (data?.id) router.push(`/groups/${data.id}`);
    }
    if (ready && userId) checkForExistingGroup();
  }, [ready, userId, router]);

  if (!ready || !userId) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, admin_id: userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/groups/${data.group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create circle');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Welcome, {name}</h1>
        <p className="text-muted-foreground mt-1">Create a new isolated circle and set your rules.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-card/80 backdrop-blur-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Create New Circle
        </h2>
        
        {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Circle Name</label>
            <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Office Savings 2024" className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description (Optional)</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="What is this circle for?" rows={2} className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Base Contribution (₦)</label>
              <input type="number" value={formData.base_contribution} onChange={(e) => setFormData({...formData, base_contribution: Number(e.target.value)})} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Target Multiplier</label>
              <input type="number" value={formData.target_multiplier} onChange={(e) => setFormData({...formData, target_multiplier: Number(e.target.value)})} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50" required />
              <p className="text-xs text-muted-foreground">Payout = Base x Multiplier</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Max Participants</label>
              <input type="number" min="10" value={formData.max_participants} onChange={(e) => setFormData({...formData, max_participants: Number(e.target.value)})} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50" required />
              <p className="text-xs text-muted-foreground">Minimum 10 required</p>
            </div>
          </div>

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" disabled={loading}>
            {loading ? 'Creating...' : 'Create Circle & Generate Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
