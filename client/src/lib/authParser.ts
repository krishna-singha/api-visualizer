export function parseAuthHeader(
  headers: Record<string, string | string[] | undefined>
): {
  hasAuthHeader: boolean;
  authType: string | null;
  parsed: Record<string, any> | null;
  raw?: string;
} {
  const rawAuthValue = headers["authorization"];
  const rawAuth =
    typeof rawAuthValue === "string"
      ? rawAuthValue
      : Array.isArray(rawAuthValue)
      ? rawAuthValue[0]
      : undefined;

  const result: {
    hasAuthHeader: boolean;
    authType: string | null;
    parsed: Record<string, any> | null;
    raw?: string;
  } = {
    hasAuthHeader: !!rawAuth,
    authType: null,
    parsed: null,
    raw: rawAuth,
  };

  if (!rawAuth) {
    return tryCustomAuthHeaders(headers, result);
  }

  const [typeRaw, ...rest] = rawAuth.split(" ");
  const type = typeRaw?.toLowerCase?.() || null;
  const token = rest.join(" ").trim();

  if (!type || !token) {
    return tryCustomAuthHeaders(headers, result);
  }

  result.authType = type;

  try {
    switch (type) {
      case "basic": {
        const decoded = atob(token); // <- Use atob instead of Buffer
        const [username, password] = decoded.split(":");
        result.parsed = { username, password };
        break;
      }

      case "bearer": {
        result.parsed = parseJwt(token) || { token };
        break;
      }

      case "digest":
      case "oauth":
      case "hawk": {
        const parsed: Record<string, string> = {};
        const regex = /(\w+)=["]?([^",]+)["]?/g;
        let match;
        while ((match = regex.exec(token))) {
          parsed[match[1]] = match[2];
        }
        result.parsed = parsed;
        break;
      }

      default: {
        result.parsed = { token };
        break;
      }
    }
  } catch (err) {
    console.error("Failed to parse auth header:", err);
    result.parsed = null;
  }

  return result;
}


function tryCustomAuthHeaders(
  headers: Record<string, string | string[] | undefined>,
  result: { hasAuthHeader: boolean; authType: string | null; parsed: any }
) {
  const custom: Record<string, string> = {};

  for (const key of Object.keys(headers)) {
    const lower = key.toLowerCase();
    if (
      lower === "x-api-key" ||
      lower === "x-access-token" ||
      lower === "x-client-id" ||
      lower === "x-client-secret"
    ) {
      const value = headers[key];
      if (typeof value === "string") custom[lower] = value;
      else if (Array.isArray(value)) custom[lower] = value[0];
    }
  }

  if (Object.keys(custom).length > 0) {
    result.hasAuthHeader = true;
    result.authType = "custom";
    result.parsed = custom;
  }

  return result;
}

function parseJwt(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
