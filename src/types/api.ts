export interface ApiRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  url: string;
  status: number;
  timestamp: number;
  duration: number;
  size: number;
  headers: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  userAgent?: string;
  ip?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  latency: number;
  lastPing: number;
}

export interface FilterOptions {
  method?: string;
  status?: string;
  search?: string;
  timeRange?: 'all' | '1h' | '24h' | '7d';
}