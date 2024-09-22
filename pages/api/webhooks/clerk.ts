import { Webhook } from 'svix';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Webhook received');
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local' });
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occurred -- missing svix headers' });
  }

  const body = JSON.stringify(req.body);
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    console.log('Verifying webhook');
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    });
    console.log('Webhook verified');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Error occurred during webhook verification' });
  }

  return res.status(200).json({ message: 'Webhook processed successfully' });
}