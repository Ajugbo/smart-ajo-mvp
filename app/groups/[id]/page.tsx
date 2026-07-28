import { supabaseAdmin } from '@/lib/supabase-server';
import { ContributeButton } from '@/components/contribute-button';
import { CashoutButton } from '@/components/cashout-button';
import { CopyCodeButton } from '@/components/copy-code-button';
import { Users, Wallet, Target, CheckCircle2, Clock, Crown, Share2, Lock } from 'lucide-react';

export default async function GroupDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const groupId = resolvedParams.id;

  const { data: group } = await supabaseAdmin.from('groups').select('*').eq('id', groupId).single();
  if (!group) return <div className="container mx-auto max-w-4xl py-10 text-center text-red-500">Group not found</div>;

  const { data: memberships } = await supabaseAdmin
    .from('memberships')
    .select(`id, user_id, role, users (id, name, phone)`)
    .eq('group_id', groupId);

  const { data: queueData } = await supabaseAdmin
    .from('queue_positions')
    .select('user_id, position, status, units_accumulated')
    .eq('group_id', groupId);

  const { data: wallet } = await supabaseAdmin
    .from('group_wallets')
    .select('balance, reserve_balance')
    .eq('group_id', groupId)
    .maybeSingle();

  const balance = wallet?.balance || 0;
  const reserve = wallet?.reserve_balance || 0;
  const memberCount = memberships?.length || 0;
  const progressPct = Math.min(100, (memberCount / group.max_participants) * 100);
  const targetPayout = group.base_contribution * group.target_multiplier;

  const queueMap = new Map();
  queueData?.forEach((q: any) => queueMap.set(q.user_id, q));

  const membersWithQueue = memberships?.map((member: any) => ({
    ...member,
    queue: queueMap.get(member.user_id) || { position: 0, status: 'pending', units_accumulated: 0 }
  })).sort((a: any, b: any) => a.queue.position - b.queue.position) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle2 className="h-3 w-3" /> Paid</span>;
      case 'collected': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"><Crown className="h-3 w-3" /> Collected</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock className="h-3 w-3" /> Pending</span>;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-10 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{group.name}</h1>
          <p className="text-muted-foreground mt-1">{group.description || 'Contribution Circle'}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 capitalize">{group.status}</span>
      </div>

      <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 backdrop-blur p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><Share2 className="h-6 w-6 text-primary" /></div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Invite Members</h3>
            <p className="text-sm text-muted-foreground mt-1">Share this code to fill your circle.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-black/20 rounded-lg p-2 border border-white/10">
          <span className="font-mono text-xl font-bold text-primary tracking-widest px-3">{group.invite_code}</span>
          <CopyCodeButton code={group.invite_code} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Members</span>
            <div className="p-2 rounded-lg bg-primary/10"><Users className="h-4 w-4 text-primary" /></div>
          </div>
          <div className="text-3xl font-bold text-foreground">{memberCount} <span className="text-base font-normal text-muted-foreground">/ {group.max_participants}</span></div>
          <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Available Wallet</span>
            <div className="p-2 rounded-lg bg-primary/10"><Wallet className="h-4 w-4 text-primary" /></div>
          </div>
          <div className="text-3xl font-bold text-foreground">₦{balance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-4">For payouts</p>
        </div>

        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-yellow-500/80">Anchor Reserve</span>
            <div className="p-2 rounded-lg bg-yellow-500/10"><Lock className="h-4 w-4 text-yellow-500" /></div>
          </div>
          <div className="text-3xl font-bold text-yellow-500">{reserve.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-4">10% locked deposits</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Target Payout</span>
            <div className="p-2 rounded-lg bg-primary/10"><Target className="h-4 w-4 text-primary" /></div>
          </div>
          <div className="text-3xl font-bold text-foreground">₦{targetPayout.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-4">{group.target_multiplier}x Multiplier</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 backdrop-blur p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Make a Contribution</h3>
        <ContributeButton groupId={groupId} baseAmount={group.base_contribution} />
      </div>

      <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Members & Payout Queue</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-6 py-4">Pos</th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Units</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {membersWithQueue.map((member: any) => (
                <tr key={member.user_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-muted-foreground">#{member.queue.position || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{member.users?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{member.users?.phone || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-primary">{member.queue.units_accumulated}</span>
                    <span className="text-xs text-muted-foreground"> / {group.target_multiplier}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(member.queue.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="w-48 ml-auto">
                      <CashoutButton 
                        groupId={groupId} 
                        userId={member.user_id} 
                        unitsAccumulated={member.queue.units_accumulated} 
                        targetMultiplier={group.target_multiplier}
                        baseAmount={group.base_contribution}
                        currentStatus={member.queue.status}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
