import { parseAuthHeader } from "../lib/authParser";

export type ContentType =
  | "text"
  | "json"
  | "javascript"
  | "html"
  | "xml"
  | "form-data"
  | "urlencoded"
  | "binary"
  | "graphql"
  | "unknown";

export interface ApiData {
  status: number;
  method: string;
  fullUrl: string;
  route: string;
  queryParams: Record<string, string>;
  duration: number;
  timestamp: number;
  size: {
    request: number;
    response: number;
    total: number;
  };
  request: {
    headers: Record<string, string>;
    rawBodyBase64?: string;
    body: any;
    contentType: ContentType;
    charset: string | null;
  };
  response: {
    headers: Record<string, string>;
    body: any;
    contentType: ContentType;
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
    raw?: string;
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

function extractCharset(contentType: string): string | null {
  const match = contentType.match(/charset=([^;]+)/i);
  return match ? match[1].trim() : null;
}

export function parseToApiData(rawData: any): ApiData {
  const reqHeaders = rawData.req.headers || {};
  const resHeaders = rawData.res.headers || {};

  const protocol =
    (reqHeaders["x-forwarded-proto"] || "").split(",")[0].trim() ||
    (rawData.req.socket?.encrypted ? "https" : "http");

  const url = new URL(
    rawData.url,
    `${protocol}://${reqHeaders.host || "localhost"}`
  );
  const reqContentType = reqHeaders["content-type"] || "";
  const resContentType = resHeaders["content-type"] || "";

  const parsedAuth = parseAuthHeader(reqHeaders || "");
  const userAgent = reqHeaders["user-agent"] || "";

  return {
    method: rawData.method,
    fullUrl: url.href,
    route: url.pathname,
    queryParams: Object.fromEntries(url.searchParams.entries()),
    duration: rawData.duration || 0,
    timestamp: rawData.timestamp,
    size: {
      request: parseInt(reqHeaders["content-length"] || "0", 10),
      response: parseInt(resHeaders["content-length"] || "0", 10),
      total:
        parseInt(reqHeaders["content-length"] || "0", 10) +
        parseInt(resHeaders["content-length"] || "0", 10),
    },
    status: rawData.status,
    request: {
      headers: reqHeaders,
      body: rawData.req.body,
      rawBodyBase64: rawData.req.raw,
      contentType: determineBodyType(reqContentType),
      charset: extractCharset(reqContentType),
    },
    response: {
      headers: resHeaders,
      body: rawData.res.body,
      contentType: determineBodyType(resContentType),
      charset: extractCharset(resContentType),
      cookies: Array.isArray(resHeaders["set-cookie"])
        ? resHeaders["set-cookie"]
        : resHeaders["set-cookie"]
        ? [resHeaders["set-cookie"]]
        : [],
    },
    authorization: {
      hasAuthHeader: parsedAuth?.hasAuthHeader || false,
      authType: parsedAuth?.authType || null,
      parsed: parsedAuth?.parsed || null,
      raw: parsedAuth?.raw,
    },

    meta: {
      ip: rawData.ip,
      clientPort: rawData.clientPort || 0,
      userAgent,
      host: reqHeaders.host || "localhost",
      protocol,
      httpVersion: rawData.req.httpVersion || "1.1",
      deviceType: detectDeviceType(userAgent),
    },
  };
}

function detectDeviceType(
  userAgent: string
): "mobile" | "desktop" | "tablet" | "bot" {
  const ua = userAgent.toLowerCase();
  if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider"))
    return "bot";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua))
    return "mobile";
  if (/ipad|tablet/.test(ua)) return "tablet";
  return "desktop";
}

function determineBodyType(contentType: string): ContentType {
  const type = contentType.toLowerCase();
  if (type.includes("application/json")) return "json";
  if (
    type.includes("application/javascript") ||
    type.includes("text/javascript")
  )
    return "javascript";
  if (type.includes("text/html")) return "html";
  if (type.includes("application/xml") || type.includes("text/xml"))
    return "xml";
  if (type.startsWith("text/")) return "text";
  if (type.includes("multipart/form-data")) return "form-data";
  if (type.includes("application/x-www-form-urlencoded")) return "urlencoded";
  if (type.includes("application/graphql")) return "graphql";
  if (
    type.includes("application/octet-stream") ||
    type.startsWith("image/") ||
    type.startsWith("audio/") ||
    type.startsWith("video/")
  )
    return "binary";

  return "unknown";
}
