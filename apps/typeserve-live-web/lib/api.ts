const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7005';

export interface CreateServerRequest {
  name: string;
  expiresAt: string; // ISO string
  routes: CreateRouteRequest[];
  types: string;
}

export interface CreateRouteRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  responseType: string;
}

export interface ServerResponse {
  name: string;
  subdomain: string;
  expiresAt: string;
  createdAt: string;
}

export interface CapacityErrorResponse {
  error: 'capacity_reached';
  nextAvailableInSeconds: number;
}

export interface ValidationErrorResponse {
  error: string;
  message: string;
}

export interface DuplicateSubdomainErrorResponse {
  error: 'duplicate_subdomain';
  message: string;
  subdomain: string;
}

export type CreateServerError =
  | CapacityErrorResponse
  | ValidationErrorResponse
  | DuplicateSubdomainErrorResponse;

export async function createServer(
  data: CreateServerRequest
): Promise<ServerResponse> {
  const response = await fetch(`${API_BASE_URL}/servers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const error: CreateServerError = responseData;
    console.log('API Error:', error);
    throw error;
  }

  return responseData as ServerResponse;
}
