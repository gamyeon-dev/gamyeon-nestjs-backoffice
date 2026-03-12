interface ConsulKvItem {
  Key: string;
  Value: string | null;
}

export interface ConsulKvLoadResult {
  loadedCount: number;
  skippedCount: number;
  appliedKeys: string[];
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

function toEnvKey(relativeKey: string): string {
  if (/^[A-Z0-9_]+$/.test(relativeKey)) {
    return relativeKey;
  }

  return relativeKey
    .replace(/^\//, '')
    .replace(/\//g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .toUpperCase();
}

function buildKvUrl(consulHost: string, consulPort: string, prefix: string): string {
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  const encodedPrefix = normalizedPrefix
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `http://${consulHost}:${consulPort}/v1/kv/${encodedPrefix}?recurse=true`;
}

export async function loadConsulKvToEnv(): Promise<ConsulKvLoadResult> {
  const enabled = parseBoolean(process.env.CONSUL_KV_ENABLED, true);
  if (!enabled) {
    return { loadedCount: 0, skippedCount: 0, appliedKeys: [] };
  }

  const consulHost = process.env.CONSUL_HOST ?? 'localhost';
  const consulPort = process.env.CONSUL_PORT ?? '8500';
  const prefix = process.env.CONSUL_KV_PREFIX ?? 'gamyeon/backoffice/';
  const override = parseBoolean(process.env.CONSUL_KV_OVERRIDE, true);
  const required = parseBoolean(process.env.CONSUL_KV_REQUIRED, false);
  const timeoutMs = parseInt(process.env.CONSUL_KV_TIMEOUT_MS ?? '3000', 10);
  const consulToken = process.env.CONSUL_HTTP_TOKEN ?? process.env.CONSUL_TOKEN;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildKvUrl(consulHost, consulPort, prefix), {
      method: 'GET',
      headers: consulToken ? { 'X-Consul-Token': consulToken } : undefined,
      signal: controller.signal,
    });

    if (response.status === 404) {
      console.warn(`[ConsulKV] No key found for prefix "${prefix}"`);
      return { loadedCount: 0, skippedCount: 0, appliedKeys: [] };
    }

    if (!response.ok) {
      throw new Error(`Consul KV request failed with status ${response.status}`);
    }

    const items = (await response.json()) as ConsulKvItem[];
    const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;

    let loadedCount = 0;
    let skippedCount = 0;
    const appliedKeys: string[] = [];

    for (const item of items) {
      if (!item.Value) {
        continue;
      }

      const relativeKey = item.Key.startsWith(normalizedPrefix)
        ? item.Key.slice(normalizedPrefix.length)
        : item.Key;

      if (!relativeKey) {
        continue;
      }

      const envKey = toEnvKey(relativeKey);
      if (!override && process.env[envKey] !== undefined) {
        skippedCount += 1;
        continue;
      }

      process.env[envKey] = Buffer.from(item.Value, 'base64').toString('utf8');
      loadedCount += 1;
      appliedKeys.push(envKey);
    }

    console.log(
      `[ConsulKV] Loaded ${loadedCount} keys from "${prefix}" (${skippedCount} skipped)`,
    );

    return { loadedCount, skippedCount, appliedKeys };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (required) {
      throw new Error(`[ConsulKV] Failed to load KV (required=true): ${message}`);
    }

    console.warn(`[ConsulKV] Failed to load KV, fallback to existing env: ${message}`);
    return { loadedCount: 0, skippedCount: 0, appliedKeys: [] };
  } finally {
    clearTimeout(timeout);
  }
}
