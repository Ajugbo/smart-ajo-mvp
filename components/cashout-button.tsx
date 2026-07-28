'use client';

import { useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';

interface CashoutButtonProps {
  groupId: string;
  userId: string;
  unitsAccumulated: number;
  targetMultiplier: number;
  baseAmount: number;
  currentStatus: string;
}

export function CashoutButton({ groupId, userId, unitsAccumulated, targetMultiplier, baseAmount, currentStatus }: CashoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const targetPayout = baseAmount * targetMultiplier;
  const anchor = Math.floor(targetPayout * 0.10);
  const actualPayout = targetPayout - anchor;
  const isReady = unitsAccumulated >= targetMultiplier && currentStatus !== 'collected';

  const handleCashout = async () => {
    if (!confirm(`Confirm cashout? You will receive ${actualPayout.toLocaleString()} and ₦${anchor.toLocaleString()} will be locked as your Anchor Deposit.`)) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/payments/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, user_id: userId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setMessage(`✅ Success! ${actualPayout.toLocaleString()} dispatched. ₦${anchor.toLocaleString()} locked.`);
      window.location.reload(); // Refresh to update UI
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Cashout failed');
      setLoading(false);
    }
  };

  if (currentStatus === 'collected') {
    return <div className="text-sm font-medium text-blue-400 flex items-center gap-2"><Crown className="h-4 w-4" /> Payout Collected</div>;
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleCashout}
        disabled={!isReady || loading}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
          isReady 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90' 
            : 'bg-white/5 text-muted-foreground cursor-not-allowed'
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
        {isReady ? `Cash Out ₦${actualPayout.toLocaleString()}` : `${unitsAccumulated}/${targetMultiplier} Units`}
      </button>
      {message && <p className={`text-xs text-center ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
    </div>
  );
}
