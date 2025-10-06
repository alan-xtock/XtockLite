import { z } from "zod";

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

  async makeApiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.authenticate();

    if (this.config.mockMode) {
      return this.mockApiCall(endpoint, options);
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
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

    return { message: `Mock response for ${endpoint}`, timestamp: new Date().toISOString() };
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