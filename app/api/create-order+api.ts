export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    // Get Razorpay credentials from environment variables
    const keyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    // Validate environment variables
    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials:', {
        keyId: keyId ? 'Present' : 'Missing',
        keySecret: keySecret ? 'Present' : 'Missing'
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Razorpay credentials not configured. Please check your environment variables.' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid amount provided' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create order with Razorpay
    const orderData = {
      amount: Math.round(amount), // Ensure amount is an integer (paise)
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    console.log('Creating Razorpay order:', orderData);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify(orderData),
    });

    const responseText = await response.text();
    console.log('Razorpay API response status:', response.status);
    console.log('Razorpay API response:', responseText);

    if (!response.ok) {
      let errorMessage = 'Failed to create Razorpay order';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.description || errorMessage;
      } catch (e) {
        // If response is not JSON, use the text as error message
        errorMessage = responseText || errorMessage;
      }
      
      console.error('Razorpay API error:', errorMessage);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage 
        }), 
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const order = JSON.parse(responseText);
    console.log('Order created successfully:', order.id);

    return Response.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error while creating order' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}