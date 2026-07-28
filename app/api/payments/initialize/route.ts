import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // We now expect 'units' instead of just 'amount'
    const { units, email, reference, metadata } = await req.json();

    if (!units || !email || !reference) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack secret key is missing.' }, { status: 500 });
    }

    // Get the base contribution from metadata to calculate total amount
    const baseAmount = metadata.base_amount || 2000;
    const totalAmount = baseAmount * units;
    const amountInKobo = totalAmount * 100;
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/payments/verify`;

    console.log('📤 Initializing Payment:', { units, totalAmount, callbackUrl });

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        metadata: { ...metadata, units_to_add: units }, // Pass units to the callback
        callback_url: callbackUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json({ error: data.message || 'Failed to initialize payment' }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
