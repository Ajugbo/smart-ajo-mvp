import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { user_id, invite_code } = await req.json();

    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('invite_code', invite_code.toUpperCase())
      .single();

    if (groupError || !group) {
      return NextResponse.json({ error: 'Invalid invite code.' }, { status: 404 });
    }

    const { count } = await supabaseAdmin
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id);

    if (count !== null && count >= group.max_participants) {
      return NextResponse.json({ error: 'This circle is full.' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('memberships')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You are already in this circle.' }, { status: 400 });
    }

    await supabaseAdmin
      .from('memberships')
      .insert({ group_id: group.id, user_id, role: 'member' });

    await supabaseAdmin
      .from('queue_positions')
      .insert({ 
        group_id: group.id, 
        user_id, 
        position: (count || 0) + 1, 
        status: 'pending' 
      });

    return NextResponse.json({ group: group }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to join group' }, { status: 500 });
  }
}
