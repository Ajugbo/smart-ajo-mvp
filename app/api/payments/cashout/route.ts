import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { group_id, user_id } = await req.json();

    // 1. Fetch Group Rules
    const { data: group } = await supabaseAdmin
      .from('groups')
      .select('base_contribution, target_multiplier')
      .eq('id', group_id)
      .single();

    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    const target_payout = group.base_contribution * group.target_multiplier;
    const anchor_deposit = Math.floor(target_payout * 0.10); // 10% Anchor
    const actual_payout = target_payout - anchor_deposit;    // 90% to user

    // 2. Fetch Member's Queue Status
    const { data: queue } = await supabaseAdmin
      .from('queue_positions')
      .select('units_accumulated, status')
      .eq('group_id', group_id)
      .eq('user_id', user_id)
      .single();

    if (!queue) return NextResponse.json({ error: 'Member not in queue' }, { status: 404 });
    if (queue.status === 'collected') return NextResponse.json({ error: 'Already collected' }, { status: 400 });
    if (queue.units_accumulated < group.target_multiplier) {
      return NextResponse.json({ error: 'Not enough units to cash out' }, { status: 400 });
    }

    // 3. Check Group Wallet Liquidity (Anti-Ponzi Check)
    const { data: wallet } = await supabaseAdmin
      .from('group_wallets')
      .select('balance')
      .eq('group_id', group_id)
      .single();

    if ((wallet?.balance || 0) < target_payout) {
      return NextResponse.json({ 
        error: 'Pool liquidity is low. Please wait for more contributions to fund your payout.' 
      }, { status: 400 });
    }

    // 4. Execute the Cashout Math
    const new_wallet_balance = wallet.balance - target_payout;
    const new_reserve_balance = (wallet.reserve_balance || 0) + anchor_deposit;

    // Update Wallet
    await supabaseAdmin
      .from('group_wallets')
      .update({ 
        balance: new_wallet_balance, 
        reserve_balance: new_reserve_balance 
      })
      .eq('group_id', group_id);

    // Update Member Status
    await supabaseAdmin
      .from('queue_positions')
      .update({ status: 'collected' })
      .eq('group_id', group_id)
      .eq('user_id', user_id);

    console.log(`✅ CASHOUT SUCCESS: Paid ₦${actual_payout}, Locked ₦${anchor_deposit}`);

    return NextResponse.json({ 
      success: true, 
      payout: actual_payout, 
      anchor_locked: anchor_deposit 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Cashout failed' }, { status: 500 });
  }
}
