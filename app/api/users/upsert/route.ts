import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import type { UserRole } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, role } = body || {};
    
    // 1. Basic Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required (min 2 chars).' }, { status: 400 });
    }

    const allowedRoles: UserRole[] = ['master_admin', 'admin', 'member'];
    const safeRole: UserRole = allowedRoles.includes(role) ? role : 'member';

    let user;

    // 2. Find existing user strictly by Phone (if provided)
    if (phone) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
      
      if (existingUser) {
        user = existingUser;
        // Update name/role just in case they changed
        await supabaseAdmin.from('users').update({ name: name.trim(), role: safeRole }).eq('id', user.id);
      }
    } 
    
    // 3. Create new user if no phone match found
    if (!user) {
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          name: name.trim(),
          phone: phone ?? null,
          role: safeRole,
        })
        .select()
        .single();
        
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      user = newUser;
    }

    // 4. 🔥 Determine Redirect Path based on Blueprint
    let redirectPath = '/';
    
    if (safeRole === 'member') {
      // Check if this member already belongs to a group
      const { data: memberships } = await supabaseAdmin
        .from('memberships')
        .select('group_id')
        .eq('user_id', user.id)
        .limit(1);
        
      if (memberships && memberships.length > 0) {
        redirectPath = `/groups/${memberships[0].group_id}`; // Returning member
      } else {
        redirectPath = '/groups/join'; // New member needs a code
      }
    } else if (safeRole === 'master_admin') {
      redirectPath = '/ledger'; // Master Admin goes to Global Ledger
    } else if (safeRole === 'admin') {
      redirectPath = '/dashboard'; // Circle Admin goes to Dashboard to create groups
    }

    // 5. Send success response
    return NextResponse.json({ 
      user: { id: user.id, name: user.name, role: user.role }, 
      redirect: redirectPath 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
