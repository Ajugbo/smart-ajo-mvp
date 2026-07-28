import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: Request) {
  console.log('🔔 VERIFICATION ENDPOINT HIT');
  console.log('Full URL:', req.url);
  
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    console.log('Reference:', reference);

    if (!reference) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head><title>Payment Verification</title></head>
          <body style="font-family: sans-serif; padding: 2rem; background: #000; color: #fff;">
            <h1>✅ Payment Verification Endpoint is Working!</h1>
            <p>This endpoint is alive and ready to process Paystack callbacks.</p>
            <a href="/" style="color: #3b82f6; text-decoration: underline;">Go Home</a>
          </body>
        </html>
      `, { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('Missing Paystack key');
      return new NextResponse('Configuration Error', { status: 500 });
    }

    console.log('Verifying with Paystack...');
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    
    const data = await response.json();
    console.log('Paystack Data:', data);

    if (data.status && data.data && data.data.status === 'success') {
      const metadata = data.data.metadata;
      const group_id = metadata?.group_id;
      const user_id = metadata?.user_id;
      const unitsToAdd = metadata?.units_to_add || 1;
      const amount = data.data.amount / 100;

      console.log('✅ Payment Success!', { group_id, user_id, unitsToAdd, amount });

      if (group_id && user_id) {
        const { data: wallet } = await supabaseAdmin
          .from('group_wallets')
          .select('balance')
          .eq('group_id', group_id)
          .single();
        
        const newBalance = (wallet?.balance || 0) + amount;
        await supabaseAdmin
          .from('group_wallets')
          .update({ balance: newBalance })
          .eq('group_id', group_id);

        const { data: currentQueue } = await supabaseAdmin
          .from('queue_positions')
          .select('units_accumulated')
          .eq('group_id', group_id)
          .eq('user_id', user_id)
          .single();

        const newUnits = (currentQueue?.units_accumulated || 0) + unitsToAdd;
        await supabaseAdmin
          .from('queue_positions')
          .update({ units_accumulated: newUnits, status: 'paid' })
          .eq('group_id', group_id)
          .eq('user_id', user_id);
          
        console.log(`✅ Updated: ${newUnits} units, status: paid`);
      }
    }

    // FIX: Use the base URL from env vars to construct clean redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
    const redirectGroupId = data.data?.metadata?.group_id;
    
    let redirectUrl: string;
    if (redirectGroupId) {
      redirectUrl = `${baseUrl}/groups/${redirectGroupId}`;
    } else {
      redirectUrl = `${baseUrl}/`;
    }
    
    console.log(`Redirecting to: ${redirectUrl}`);
    return NextResponse.redirect(redirectUrl);
    
  } catch (err) {
    console.error('❌ Verification error:', err);
    return new NextResponse(`Verification Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 500 });
  }
}
