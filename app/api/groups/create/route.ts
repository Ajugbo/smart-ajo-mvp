import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { admin_id, name, description, base_contribution, target_multiplier, max_participants } = body;

    // 1. VALIDATION: Enforce Minimum 10 Participants
    if (!max_participants || max_participants < 10) {
      return NextResponse.json({ error: 'A circle must have a minimum of 10 participants.' }, { status: 400 });
    }

    if (!base_contribution || base_contribution < 100) {
      return NextResponse.json({ error: 'Base contribution must be at least 100.' }, { status: 400 });
    }

    if (!target_multiplier || target_multiplier < 2) {
      return NextResponse.json({ error: 'Target multiplier must be at least 2.' }, { status: 400 });
    }

    // 2. Generate a unique 6-character invite code
    const invite_code = randomBytes(3).toString('hex').toUpperCase();

    // 3. Create the Group (The "Silo")
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .insert({
        name,
        description,
        admin_id,
        invite_code,
        base_contribution,
        target_multiplier,
        max_participants,
        status: 'active'
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // 4. Create the Isolated Group Wallet
    await supabaseAdmin
      .from('group_wallets')
      .insert({ group_id: group.id, balance: 0 });

    // 5. Add the Admin as the first member
    await supabaseAdmin
      .from('memberships')
      .insert({ group_id: group.id, user_id: admin_id, role: 'admin' });

    // 6. Add Admin to the Queue (Position 1)
    await supabaseAdmin
      .from('queue_positions')
      .insert({ group_id: group.id, user_id: admin_id, position: 1, status: 'pending' });

    return NextResponse.json({ group }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create group' }, { status: 500 });
  }
}
