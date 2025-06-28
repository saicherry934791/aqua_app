// Mock API service for static responses
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Mock data
const MOCK_USERS = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    phone: '9876543210',
    address: '123 Main St, City, State',
    isFirstTime: false,
  }
];

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'AquaPure Pro',
    description: 'Advanced water purification system with 7-stage filtration',
    price: 2999,
    image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'purifiers',
    inStock: true,
  },
  {
    id: '2',
    name: 'AquaStream 2000',
    description: 'Compact water purifier perfect for small families',
    price: 1999,
    image: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'purifiers',
    inStock: true,
  },
  {
    id: '3',
    name: 'AquaClear 1500',
    description: 'Budget-friendly water purification solution',
    price: 1499,
    image: 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'purifiers',
    inStock: true,
  },
  {
    id: '4',
    name: 'AquaMax Elite',
    description: 'Premium water purifier with smart monitoring',
    price: 3999,
    image: 'https://images.pexels.com/photos/1001897/pexels-photo-1001897.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'purifiers',
    inStock: true,
  },
  {
    id: '5',
    name: 'AquaFlow Basic',
    description: 'Entry-level water purification for small homes',
    price: 999,
    image: 'https://images.pexels.com/photos/3964736/pexels-photo-3964736.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'purifiers',
    inStock: true,
  },
  {
    id: '6',
    name: 'AquaTech Smart',
    description: 'IoT-enabled water purifier with app control',
    price: 4999,
    image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'purifiers',
    inStock: true,
  },
];

const MOCK_ORDERS = [
  {
    id: '1',
    userId: '1',
    items: [
      {
        productId: '1',
        name: 'AquaPure Pro',
        price: 2999,
        quantity: 1,
        image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=800',
      }
    ],
    total: 2999,
    status: 'delivered',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-20',
  },
  {
    id: '2',
    userId: '1',
    items: [
      {
        productId: '2',
        name: 'AquaStream 2000',
        price: 1999,
        quantity: 1,
        image: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=800',
      }
    ],
    total: 1999,
    status: 'shipped',
    orderDate: '2024-01-20',
    deliveryDate: '2024-01-25',
  }
];

const MOCK_SERVICES = [
  {
    id: '1',
    userId: '1',
    type: 'maintenance',
    description: 'Regular maintenance check for AquaPure Pro',
    status: 'completed',
    requestDate: '2024-01-10',
    completionDate: '2024-01-12',
  },
  {
    id: '2',
    userId: '1',
    type: 'filter_replacement',
    description: 'Filter replacement for AquaStream 2000',
    status: 'in_progress',
    requestDate: '2024-01-18',
    completionDate: null,
  }
];

const MOCK_SUBSCRIPTIONS = [
  {
    id: '1',
    userId: '1',
    productId: '1',
    productName: 'AquaPure Pro',
    plan: 'monthly',
    price: 299,
    status: 'active',
    startDate: '2024-01-01',
    nextRenewal: '2024-02-01',
  }
];

class MockApiService {
  private delay(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth endpoints
  async sendOTP(phone: string): Promise<ApiResponse> {
    await this.delay(1500);
    
    // Simulate OTP sending
    console.log(`Mock OTP sent to ${phone}: 123456`);
    
    return {
      success: true,
      data: { message: 'OTP sent successfully' },
      message: 'OTP sent to your phone number',
    };
  }

  async verifyOTP(phone: string, otp: string): Promise<ApiResponse> {
    await this.delay(2000);
    
    // Mock OTP verification (accept 123456 as valid OTP)
    if (otp === '123456') {
      const isFirstTime = Math.random() > 0.3; // 70% chance of being first time user
      
      const user = {
        id: '1',
        email: '',
        name: '',
        phone,
        isFirstTime,
      };

      const tokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      };

      return {
        success: true,
        data: {
          user,
          ...tokens,
        },
        message: 'Login successful',
      };
    }

    return {
      success: false,
      error: 'Invalid OTP. Please try again.',
    };
  }

  async completeProfile(details: any): Promise<ApiResponse> {
    await this.delay(1500);
    
    // Mock profile completion
    const updatedUser = {
      id: '1',
      ...details,
      isFirstTime: false,
    };

    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    };
  }

  async logout(): Promise<ApiResponse> {
    await this.delay(1000);
    
    // Mock logout API call
    console.log('Mock logout API called');
    
    return {
      success: true,
      data: { message: 'Logged out successfully' },
      message: 'You have been logged out successfully',
    };
  }

  async updateProfile(userId: string, profileData: any): Promise<ApiResponse> {
    await this.delay(1500);
    
    // Mock profile update
    console.log('Mock profile update:', profileData);
    
    return {
      success: true,
      data: { ...profileData, id: userId },
      message: 'Profile updated successfully',
    };
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    await this.delay(500);
    
    return {
      success: true,
      data: {
        accessToken: 'new_mock_access_token_' + Date.now(),
        refreshToken: 'new_mock_refresh_token_' + Date.now(),
      },
    };
  }

  // Product endpoints
  async getProducts(): Promise<ApiResponse> {
    await this.delay(1000);
    
    return {
      success: true,
      data: MOCK_PRODUCTS,
      message: 'Products fetched successfully',
    };
  }

  async getProduct(id: string): Promise<ApiResponse> {
    await this.delay(800);
    
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    
    if (product) {
      return {
        success: true,
        data: product,
        message: 'Product fetched successfully',
      };
    }

    return {
      success: false,
      error: 'Product not found',
    };
  }

  // Order endpoints
  async getOrders(userId: string): Promise<ApiResponse> {
    await this.delay(1200);
    
    const userOrders = MOCK_ORDERS.filter(order => order.userId === userId);
    
    return {
      success: true,
      data: userOrders,
      message: 'Orders fetched successfully',
    };
  }

  async createOrder(orderData: any): Promise<ApiResponse> {
    await this.delay(2000);
    
    const newOrder = {
      id: Date.now().toString(),
      ...orderData,
      status: 'confirmed',
      orderDate: new Date().toISOString().split('T')[0],
    };

    return {
      success: true,
      data: newOrder,
      message: 'Order created successfully',
    };
  }

  // Service endpoints
  async getServices(userId: string): Promise<ApiResponse> {
    await this.delay(1000);
    
    const userServices = MOCK_SERVICES.filter(service => service.userId === userId);
    
    return {
      success: true,
      data: userServices,
      message: 'Services fetched successfully',
    };
  }

  async createServiceRequest(serviceData: any): Promise<ApiResponse> {
    await this.delay(1500);
    
    const newService = {
      id: Date.now().toString(),
      ...serviceData,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    };

    return {
      success: true,
      data: newService,
      message: 'Service request created successfully',
    };
  }

  // Subscription endpoints
  async getSubscriptions(userId: string): Promise<ApiResponse> {
    await this.delay(1000);
    
    const userSubscriptions = MOCK_SUBSCRIPTIONS.filter(sub => sub.userId === userId);
    
    return {
      success: true,
      data: userSubscriptions,
      message: 'Subscriptions fetched successfully',
    };
  }

  // Generic request method for compatibility
  async request<T = any>(config: any): Promise<ApiResponse<T>> {
    const { method, url, data } = config;
    
    // Route to appropriate mock endpoint based on URL
    if (url.includes('/auth/send-otp')) {
      return this.sendOTP(data.phone);
    } else if (url.includes('/auth/verify-otp')) {
      return this.verifyOTP(data.phone, data.otp);
    } else if (url.includes('/auth/complete-profile')) {
      return this.completeProfile(data);
    } else if (url.includes('/auth/logout')) {
      return this.logout();
    } else if (url.includes('/auth/refresh')) {
      return this.refreshToken(data.refreshToken);
    } else if (url.includes('/profile/update')) {
      return this.updateProfile(data.userId, data);
    } else if (url.includes('/products') && method === 'GET') {
      if (url.includes('/products/')) {
        const id = url.split('/').pop();
        return this.getProduct(id);
      }
      return this.getProducts();
    } else if (url.includes('/orders') && method === 'GET') {
      return this.getOrders('1'); // Mock user ID
    } else if (url.includes('/orders') && method === 'POST') {
      return this.createOrder(data);
    } else if (url.includes('/services') && method === 'GET') {
      return this.getServices('1'); // Mock user ID
    } else if (url.includes('/services') && method === 'POST') {
      return this.createServiceRequest(data);
    } else if (url.includes('/subscriptions') && method === 'GET') {
      return this.getSubscriptions('1'); // Mock user ID
    }

    // Default response for unhandled endpoints
    await this.delay(1000);
    return {
      success: false,
      error: 'Endpoint not implemented in mock API',
    };
  }

  // Convenience methods
  async get<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }
}

export const mockApiService = new MockApiService();