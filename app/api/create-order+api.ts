export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    // Replace with your actual Razorpay key secret
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'your_key_secret_here';
    
    if (!keySecret) {
      return new Response('Razorpay key secret not configured', { status: 500 });
    }

    // Create order with Razorpay
    const orderData = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    const order = await response.json();

    return Response.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response('Internal server error', { status: 500 });
  }
}