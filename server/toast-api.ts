
interface ToastTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ToastApiConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  mockMode?: boolean;
}

const defaultConfig = {
  baseUrl: "https://ws.toasttab.com",
  mockMode: process.env.NODE_ENV === "development" || process.env.TOAST_MOCK_MODE === "true"
};

export class ToastApiService {
  private config: ToastApiConfig & typeof defaultConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: ToastApiConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  private async authenticate(): Promise<string> {
    if (this.config.mockMode) {
      return this.mockAuthenticate();
    }

    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`${this.config.baseUrl}/usermgmt/v1/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Toast API authentication failed: ${response.status} ${response.statusText}`);
    }

    const data: ToastTokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

    return this.accessToken;
  }

  private async mockAuthenticate(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));

    this.accessToken = `mock_token_${Date.now()}`;
    this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour from now

    console.log("🧪 Mock Toast API authentication successful");
    return this.accessToken;
  }

  async testConnection(): Promise<{ success: boolean; message: string; mockMode: boolean }> {
    try {
      const token = await this.authenticate();

      if (this.config.mockMode) {
        return {
          success: true,
          message: "Mock connection to Toast POS API successful",
          mockMode: true
        };
      }

      return {
        success: true,
        message: "Successfully connected to Toast POS API",
        mockMode: false
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        mockMode: this.config.mockMode
      };
    }
  }

  async makeApiCall(endpoint: string, options: RequestInit = {}, additionalHeaders: Record<string, string> = {}): Promise<any> {
    await this.authenticate();

    if (this.config.mockMode) {
      return this.mockApiCall(endpoint, options);
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        ...additionalHeaders,
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Toast API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async mockApiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log(`🧪 Mock API call: ${options.method || 'GET'} ${endpoint}`);

    if (endpoint.includes('/restaurants')) {
      return {
        guid: "mock-restaurant-guid",
        name: "Mock Restaurant",
        timeZone: "America/New_York",
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };
    }

    if (endpoint.includes('/menus')) {
      return {
        guid: "mock-menu-guid",
        name: "Mock Menu",
        entities: [
          {
            guid: "mock-item-1",
            name: "Mock Burger",
            price: 1299,
            type: "ITEM"
          },
          {
            guid: "mock-item-2",
            name: "Mock Fries",
            price: 599,
            type: "ITEM"
          }
        ]
      };
    }

    if (endpoint.includes('/orders/v2/ordersBulk')) {
      return this.generateMockOrders();
    }

    return { message: `Mock response for ${endpoint}`, timestamp: new Date().toISOString() };
  }

  async getOrdersBulk(restaurantId: string, options: {
    startDate?: string;
    endDate?: string;
    businessDate?: string;
    pageSize?: number;
    page?: number;
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();

    if (options.startDate) queryParams.append('startDate', options.startDate);
    if (options.endDate) queryParams.append('endDate', options.endDate);
    if (options.businessDate) queryParams.append('businessDate', options.businessDate);
    if (options.pageSize) queryParams.append('pageSize', options.pageSize.toString());
    if (options.page) queryParams.append('page', options.page.toString());

    const endpoint = `/orders/v2/ordersBulk${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.makeApiCall(endpoint, { method: 'GET' }, {
      'Toast-Restaurant-External-Id': restaurantId
    });
  }

  private generateMockOrders(): any[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return [
      {
        guid: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        diningOption: { name: "Take Out" },
        createdDate: yesterday.toISOString(),
        paidDate: new Date(yesterday.getTime() + 5 * 60 * 1000).toISOString(),
        checks: [
          {
            guid: "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
            selections: [
              {
                item: { name: "Classic Burger" },
                quantity: 1,
                unitPrice: 1450,
                modifiers: []
              },
              {
                item: { name: "Fries" },
                quantity: 1,
                unitPrice: 400,
                modifiers: []
              }
            ],
            payments: [
              {
                type: "CREDIT",
                amount: 1850
              }
            ]
          }
        ]
      },
      {
        guid: "b2c3d4e5-f6a7-8901-2345-67890abcdef",
        diningOption: { name: "Dine In" },
        createdDate: yesterday.toISOString(),
        paidDate: new Date(yesterday.getTime() + 45 * 60 * 1000).toISOString(),
        checks: [
          {
            guid: "c3d4e5f6-a7b8-9012-3456-7890abcdef12",
            selections: [
              {
                item: { name: "Caesar Salad" },
                quantity: 1,
                unitPrice: 1200,
                modifiers: [
                  { name: "Add Chicken" }
                ]
              },
              {
                item: { name: "Iced Tea" },
                quantity: 1,
                unitPrice: 350,
                modifiers: []
              }
            ],
            payments: [
              {
                type: "CASH",
                amount: 1550
              }
            ]
          }
        ]
      },
      {
        guid: "c3d4e5f6-a7b8-9012-3456-7890abcdef",
        diningOption: { name: "Delivery" },
        createdDate: now.toISOString(),
        paidDate: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
        checks: [
          {
            guid: "d4e5f6a7-b8c9-0123-4567-890abcdef123",
            selections: [
              {
                item: { name: "Margherita Pizza" },
                quantity: 2,
                unitPrice: 1600,
                modifiers: []
              },
              {
                item: { name: "Garlic Bread" },
                quantity: 1,
                unitPrice: 650,
                modifiers: []
              }
            ],
            payments: [
              {
                type: "CREDIT",
                amount: 3850
              }
            ]
          }
        ]
      }
    ];
  }
}

export function createToastApiService(): ToastApiService | null {
  const clientId = process.env.TOAST_CLIENT_ID;
  const clientSecret = process.env.TOAST_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("Toast API credentials not found in environment variables");
    return null;
  }

  return new ToastApiService({
    clientId,
    clientSecret,
    mockMode: process.env.TOAST_MOCK_MODE === "true" || process.env.NODE_ENV === "development"
  });
}