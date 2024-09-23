import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const CheckoutSuccess = () => {
  const router = useRouter();
  const { session_id } = router.query;
  const [message, setMessage] = useState('Processing your purchase...');

  useEffect(() => {
    if (typeof session_id === 'string') {
      fetch(`/api/fetch-checkout-session?session_id=${session_id}`)
        .then(response => response.json())
        .then((data) => {
          setMessage(`Purchase successful! Your account has been updated with ${data.planName}. You now have ${data.credits} credits and ${data.tokens} tokens.`);
          setTimeout(() => router.push({
            pathname: '/userPage',
            query: { updated: 'true' }
          }), 5000);
        })
        .catch((error) => {
          console.error('Error processing checkout:', error);
          setMessage('Failed to process your purchase. Please contact support.');
        });
    }
  }, [session_id, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Checkout Success</h1>
      <p className="text-xl text-gray-700">{message}</p>
    </div>
  );
};

export default CheckoutSuccess;
