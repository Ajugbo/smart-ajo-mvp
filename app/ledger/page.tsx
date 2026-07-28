import { supabaseAdmin } from '@/lib/supabase-server';
import { Wallet, Users, Circle, TrendingUp } from 'lucide-react';

export default async function LedgerPage() {
  // 1. Fetch Platform Stats
  const { count: totalUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: totalGroups } = await supabaseAdmin
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: wallets } = await supabaseAdmin
    .from('group_wallets')
    .select('balance');

  // Calculate total platform balance
  const totalBalance = wallets?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0;

  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Global Ledger
          </h1>
          <p className="text-muted-foreground mt-1">Platform-wide contribution activity and settlement health.</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
            Live Overview
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Balance Card */}
        <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            ₦{totalBalance.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Tracked across active group wallets</p>
        </div>

        {/* Active Circles Card */}
        <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Active Circles</span>
            <div className="p-2 rounded-lg bg-primary/10">
              <Circle className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {totalGroups || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Circles currently tracked</p>
        </div>

        {/* Total Members Card */}
        <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Total Members</span>
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {totalUsers || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Registered platform users</p>
        </div>
      </div>

      {/* Next Steps Placeholder */}
      <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Next Steps</h3>
        <p className="text-sm text-muted-foreground">
          This overview reflects the current group and wallet data available in Supabase. As members contribute via Paystack, the Total Balance will update in real-time.
        </p>
      </div>
    </div>
  );
}
