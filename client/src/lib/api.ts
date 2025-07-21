import { apiRequest } from "./queryClient";

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async get(url: string) {
    const response = await fetch(url, {
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async post(url: string, data?: any) {
    return apiRequest('POST', url, data);
  }

  async put(url: string, data?: any) {
    return apiRequest('PUT', url, data);
  }

  async delete(url: string) {
    return apiRequest('DELETE', url);
  }
}

export const api = new ApiClient();
