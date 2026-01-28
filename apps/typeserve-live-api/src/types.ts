import { RouteConfig } from '@typeserve/core';

export interface CreateServerRequest {
  name: string;
  expiresAt: string;
  routes: CreateRouteRequest[];
  types: string;
}

export interface CreateRouteRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  responseType: string;
}

export interface ServerData {
  name: string;
  subdomain: string;
  expiresAt: string;
  routes: RouteConfig[];
  types: string;
  createdAt: string;
}

export interface ActiveServer {
  name: string;
  subdomain: string;
  expiresAt: string;
  createdAt: string;
  expiresInSeconds: number;
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
