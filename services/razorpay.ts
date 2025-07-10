import { Platform } from 'react-native';

export interface RazorpayOptions {
  description: string;
  image: string;
  currency: string;
  key: string;
  amount: number;
  name: string;
  order_id?: string;
  prefill: {
    email: string;
    contact: string;
    name: string;
  };
  theme: {
    color: string;
  };
}

export interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

class RazorpayService {
  private razorpayKeyId: string;

  constructor() {
    // Replace with your actual Razorpay key
    this.razorpayKeyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_key_here';
  }

  async createOrder(amount: number, currency: string = 'INR'): Promise<any> {
    try {
      // This should be called from your backend
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.log('Error creating order:', error);
      throw error;
    }
  }

  async openCheckout(options: RazorpayOptions): Promise<PaymentResult> {
    if (Platform.OS === 'web') {
      return this.openWebCheckout(options);
    } else {
      return this.openNativeCheckout(options);
    }
  }

  private async openWebCheckout(options: RazorpayOptions): Promise<PaymentResult> {
    return new Promise((resolve, reject) => {
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new (window as any).Razorpay({
          ...options,
          handler: (response: PaymentResult) => {
            resolve(response);
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            },
          },
        });
        rzp.open();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay script'));
      };
      document.head.appendChild(script);
    });
  }

  private async openNativeCheckout(options: RazorpayOptions): Promise<PaymentResult> {
    try {
      // For React Native, you would use react-native-razorpay
      const RazorpayCheckout = require('react-native-razorpay').default;
      
      return new Promise((resolve, reject) => {
        RazorpayCheckout.open(options)
          .then((data: PaymentResult) => {
            resolve(data);
          })
        .catch((error: any) => {
            reject(error);
          });
      });
    } catch (error) {
      throw new Error('Razorpay not available on this platform');
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      return result.verified;
    } catch (error) {
      console.log('Error verifying payment:', error);
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();