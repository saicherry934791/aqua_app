import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'your_key_secret_here';
    
    if (!keySecret) {
      return new Response('Razorpay key secret not configured', { status: 500 });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified, you can save to database here
      return Response.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully',
      });
    } else {
      return Response.json({
        success: false,
        verified: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response('Internal server error', { status: 500 });
  }
}