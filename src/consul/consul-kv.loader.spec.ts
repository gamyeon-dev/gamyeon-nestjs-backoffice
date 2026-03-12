import { loadConsulKvToEnv } from './consul-kv.loader';

type FetchMock = jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]>;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('loadConsulKvToEnv', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.CONSUL_KV_ENABLED = 'true';
    process.env.CONSUL_HOST = 'consul';
    process.env.CONSUL_PORT = '8500';
    process.env.CONSUL_KV_PREFIX = 'gamyeon/backoffice/';
    process.env.CONSUL_KV_OVERRIDE = 'true';
    delete process.env.PORT;
    delete process.env.DB_HOST;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('loads key-values from consul prefix and maps to environment variables', async () => {
    const fetchMock: FetchMock = jest.fn().mockResolvedValue(
      mockResponse(200, [
        {
          Key: 'gamyeon/backoffice/PORT',
          Value: Buffer.from('8500').toString('base64'),
        },
        {
          Key: 'gamyeon/backoffice/db/host',
          Value: Buffer.from('db-prod').toString('base64'),
        },
      ]),
    );
    global.fetch = fetchMock as typeof fetch;

    const result = await loadConsulKvToEnv();

    expect(result.loadedCount).toBe(2);
    expect(result.appliedKeys).toEqual(['PORT', 'DB_HOST']);
    expect(process.env.PORT).toBe('8500');
    expect(process.env.DB_HOST).toBe('db-prod');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://consul:8500/v1/kv/gamyeon/backoffice/?recurse=true',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('does not override existing environment variables when override is disabled', async () => {
    process.env.CONSUL_KV_OVERRIDE = 'false';
    process.env.PORT = '3002';

    const fetchMock: FetchMock = jest.fn().mockResolvedValue(
      mockResponse(200, [
        {
          Key: 'gamyeon/backoffice/PORT',
          Value: Buffer.from('8500').toString('base64'),
        },
      ]),
    );
    global.fetch = fetchMock as typeof fetch;

    const result = await loadConsulKvToEnv();

    expect(result.loadedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(process.env.PORT).toBe('3002');
  });

  it('skips consul loading when disabled', async () => {
    process.env.CONSUL_KV_ENABLED = 'false';
    const fetchMock: FetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const result = await loadConsulKvToEnv();

    expect(result.loadedCount).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
