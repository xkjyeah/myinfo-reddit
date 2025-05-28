import { NextRequest } from 'next/server';

import { constructForwardedForUrl, updateUrlWith } from '../util';

// Mock NextRequest for testing
function createMockRequest(url: string, headers: Record<string, string> = {}): NextRequest {
  const request = new NextRequest(url);

  // Add headers to the request
  Object.entries(headers).forEach(([key, value]) => {
    request.headers.set(key, value);
  });

  return request;
}

describe('constructForwardedForUrl', () => {
  describe('with forwarded headers', () => {
    it('should use forwarded host and protocol when provided', () => {
      const request = createMockRequest('http://localhost:3000/test?param=value', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {});

      expect(result.toString()).toBe('https://example.com/test?param=value');
    });

    it('should use forwarded host only when protocol is not provided', () => {
      const request = createMockRequest('http://localhost:3000/test', {
        'x-forwarded-host': 'example.com',
      });

      const result = constructForwardedForUrl(request, {});

      expect(result.toString()).toBe('http://example.com:3000/test');
    });

    it('should use forwarded protocol and portonly when host is not provided', () => {
      const request = createMockRequest('http://localhost:3000/test', {
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {});

      expect(result.toString()).toBe('https://localhost/test');
    });

    it('should handle forwarded host without port', () => {
      const request = createMockRequest('http://localhost:3000/test', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {});

      expect(result.toString()).toBe('https://example.com/test');
    });
  });

  describe('without forwarded headers', () => {
    it('should use original URL when no forwarded headers are present', () => {
      const request = createMockRequest('http://localhost:3000/test?param=value');

      const result = constructForwardedForUrl(request, {});

      expect(result.toString()).toBe('http://localhost:3000/test?param=value');
    });
  });

  describe('with URL updates', () => {
    it('should apply pathname updates', () => {
      const request = createMockRequest('http://localhost:3000/old-path', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {
        pathname: '/new-path',
      });

      expect(result.toString()).toBe('https://example.com/new-path');
    });

    it('should apply search parameter updates', () => {
      const request = createMockRequest('http://localhost:3000/test?old=param', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {
        search: '?new=param&another=value',
      });

      expect(result.toString()).toBe('https://example.com/test?new=param&another=value');
    });

    it('should apply host updates (overriding forwarded host)', () => {
      const request = createMockRequest('https://localhost:3000/test', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'http',
      });

      const result = constructForwardedForUrl(request, {
        host: 'override.com',
        port: '3000',
      });

      expect(result.toString()).toBe('http://override.com:3000/test');
    });

    it('should apply protocol updates (overriding forwarded protocol and port)', () => {
      const request = createMockRequest('http://localhost:3000/test', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {
        protocol: 'http:',
      });

      expect(result.toString()).toBe('http://example.com:443/test');
    });

    it('should apply multiple URL updates simultaneously', () => {
      const request = createMockRequest('http://localhost:3000/old-path?old=param', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {
        pathname: '/new-path',
        search: '?new=param',
        host: 'override.com',
        port: '3000',
        protocol: 'http:',
      });

      expect(result.toString()).toBe('http://override.com:3000/new-path?new=param');
    });
  });

  describe('edge cases', () => {
    it('should handle empty URL updates object', () => {
      const request = createMockRequest('http://localhost:3000/test');

      const result = constructForwardedForUrl(request, {});

      expect(result.toString()).toBe('http://localhost:3000/test');
    });

    it('should handle complex paths and query strings', () => {
      const request = createMockRequest(
        'http://localhost:3000/api/v1/users/123?include=profile&sort=name&limit=10',
        {
          'x-forwarded-host': 'api.example.com',
          'x-forwarded-proto': 'https',
        }
      );

      const result = constructForwardedForUrl(request, {
        pathname: '/api/v2/users/123',
      });

      expect(result.toString()).toBe(
        'https://api.example.com/api/v2/users/123?include=profile&sort=name&limit=10'
      );
    });

    it('should handle URL with hash fragments', () => {
      const request = createMockRequest('http://localhost/test#section', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {});

      expect(result.toString()).toBe('https://example.com/test#section');
    });

    it('should handle standard ports correctly', () => {
      const request = createMockRequest('http://localhost/test', {
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
      });

      const result = constructForwardedForUrl(request, {});

      expect(result.toString()).toBe('https://example.com/test');
    });
  });
});

describe('updateUrlWith', () => {
  it('should update pathname', () => {
    const url = new URL('http://example.com/old-path');
    const result = updateUrlWith(url, { pathname: '/new-path' });

    expect(result.pathname).toBe('/new-path');
    expect(result.toString()).toBe('http://example.com/new-path');
  });

  it('should update search parameters', () => {
    const url = new URL('http://example.com/test?old=value');
    const result = updateUrlWith(url, { search: '?new=value' });

    expect(result.search).toBe('?new=value');
    expect(result.toString()).toBe('http://example.com/test?new=value');
  });

  it('should update host', () => {
    const url = new URL('http://old.com/test');
    const result = updateUrlWith(url, { host: 'new.com' });

    expect(result.host).toBe('new.com');
    expect(result.toString()).toBe('http://new.com/test');
  });

  it('should update protocol', () => {
    const url = new URL('http://example.com/test');
    const result = updateUrlWith(url, { protocol: 'https:' });

    expect(result.protocol).toBe('https:');
    expect(result.toString()).toBe('https://example.com/test');
  });

  it('should not modify original URL object', () => {
    const url = new URL('http://example.com/test');
    const originalString = url.toString();

    updateUrlWith(url, { pathname: '/new-path' });

    expect(url.toString()).toBe(originalString);
  });

  it('should handle empty updates object', () => {
    const url = new URL('http://example.com/test?param=value');
    const result = updateUrlWith(url, {});

    expect(result.toString()).toBe('http://example.com/test?param=value');
  });
});
