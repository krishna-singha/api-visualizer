export interface ApiRequest {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
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
}

export interface ApiData {
  status: number;
  method: string;
  fullUrl: string;
  route: string;
  queryParams: Record<string, string>;
  duration: number;
  timestampString: string;
  size: {
    request: number;
    response: number;
    total: number;
  };
  request: {
    headers: Record<string, string>;
    contentType: string;
    charset: string | null;
    body: any;
    bodyType:
      | "json"
      | "form-data"
      | "urlencoded"
      | "text"
      | "binary"
      | "graphql"
      | "unknown";
  };
  response: {
    headers: Record<string, string>;
    body: any;
    contentType: string;
    charset: string | null;
    cookies: string[];
  };
  authorization: {
    hasAuthHeader: boolean;
    authType: string | null;
    parsed?: {
      username?: string;
      password?: string;
      token?: string;
      [key: string]: any;
    } | null;
  };
  meta: {
    ip: string;
    host: string;
    protocol: string;
    httpVersion: string;
    clientPort: number;
    userAgent: string;
    deviceType?: "mobile" | "desktop" | "tablet" | "bot";
  };
}
