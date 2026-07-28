'use client';

import { useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { useSession } from '@/lib/session';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaystackPaymentProps {
  groupId: string;
  amount: number;
  onSuccess: () => void;
}

export function PaystackPayment({ groupId, amount, onSuccess }: PaystackPaymentProps) {
  const { userId } = useSession();
  const [loading, setLoading] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  
  // Generate a unique reference
  const generateReference = () => {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const componentProps = {
    email: userId ? `member_${userId.slice(0, 8)}@smartajo.com` : 'test@example.com',
    amount: amount * 100, // Convert to kobo
    publicKey: publicKey,
    reference: generateReference(),
    metadata: {
      group_id: groupId,
      user_id: userId,
    },
    onSuccess: async (response: any) => {
      setLoading(true);
      console.log('Payment successful, reference:', response.reference);
      
      // Call our backend to verify and update database
      try {
        const res = await fetch('/api/payments/verify-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: response.reference,
            group_id: groupId,
            user_id: userId,
          }),
        });
        
        const data = await res.json();
        
        if (res.ok) {
          console.log('✅ Payment verified and database updated');
          onSuccess();
        } else {
          alert('Payment verification failed: ' + data.error);
        }
      } catch (err) {
        console.error('Verification error:', err);
        alert('Error verifying payment');
      } finally {
        setLoading(false);
      }
    },
    onClose: () => {
      console.log('Payment modal closed');
    },
  };

  return (
    <PaystackButton 
      {...componentProps}
      className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Pay ₦{amount.toLocaleString()}
        </>
      )}
    </PaystackButton>
  );
}
