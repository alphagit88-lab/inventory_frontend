/**
 * Test connection between frontend and backend
 */
export async function testConnection(): Promise<{
  connected: boolean;
  message: string;
  apiUrl?: string;
}> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const healthUrl = API_BASE_URL.replace('/api', '/health');

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        message: 'Backend is connected and responding',
        apiUrl: API_BASE_URL,
      };
    } else {
      return {
        connected: false,
        message: `Backend responded with status ${response.status}`,
        apiUrl: API_BASE_URL,
      };
    }
  } catch (error: any) {
    return {
      connected: false,
      message: `Connection failed: ${error.message || 'Network error'}. Make sure backend is running on ${API_BASE_URL.replace('/api', '')}`,
      apiUrl: API_BASE_URL,
    };
  }
}

