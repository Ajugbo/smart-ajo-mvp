'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session';
import { CreditCard, Loader2, Zap, Crown } from 'lucide-react';

interface ContributeButtonProps {
  groupId: string;
  baseAmount: number;
}

export function ContributeButton({ groupId, baseAmount }: ContributeButtonProps) {
  const { userId } = useSession();
  const [loading, setLoading] = useState<number | null>(null);

  const handlePay = async (units: number) => {
    if (!userId) {
      alert('Please sign in to contribute.');
      return;
    }
    
    setLoading(units);
    try {
      const email = `member_${userId.slice(0, 8)}@smartajo.com`; 
      const reference = `txn_${Date.now()}_${units}`;

      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          units,
          email,
          reference,
          metadata: { 
            group_id: groupId, 
            user_id: userId,
            base_amount: baseAmount 
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      window.location.href = data.authorization_url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Payment initialization failed');
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Option 1: Standard */}
      <button
        onClick={() => handlePay(1)}
        disabled={loading !== null}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors disabled:opacity-50"
      >
        {loading === 1 ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <CreditCard className="h-5 w-5 text-primary" />}
        <span className="font-bold text-foreground">₦{baseAmount.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">1 Unit (Standard)</span>
      </button>

      {/* Option 2: Accelerator */}
      <button
        onClick={() => handlePay(2)}
        disabled={loading !== null}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-4 hover:bg-primary/20 transition-colors disabled:opacity-50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 bg-primary text-[10px] font-bold px-2 py-0.5 text-primary-foreground rounded-bl-lg">SKIP 1</div>
        {loading === 2 ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Zap className="h-5 w-5 text-primary" />}
        <span className="font-bold text-foreground">₦{(baseAmount * 2).toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">2 Units (Fast Track)</span>
      </button>

      {/* Option 3: Max */}
      <button
        onClick={() => handlePay(5)}
        disabled={loading !== null}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 hover:bg-yellow-500/20 transition-colors disabled:opacity-50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 bg-yellow-500 text-[10px] font-bold px-2 py-0.5 text-black rounded-bl-lg">SKIP 4</div>
        {loading === 5 ? <Loader2 className="h-5 w-5 animate-spin text-yellow-500" /> : <Crown className="h-5 w-5 text-yellow-500" />}
        <span className="font-bold text-foreground">₦{(baseAmount * 5).toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">5 Units (Max Speed)</span>
      </button>
    </div>
  );
}
