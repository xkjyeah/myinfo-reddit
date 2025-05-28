import { NextRequest } from 'next/server';

type UrlUpdates = {
  pathname?: string;
  search?: string;
  host?: string;
  protocol?: string;
  port?: string;
};

export function constructForwardedForUrl(nextRequest: NextRequest, urlUpdates: UrlUpdates) {
  console.log('DEBUG constructForwardedForUrl', nextRequest.url, urlUpdates, {
    'x-forwarded-headers': [
      nextRequest.headers.get('x-forwarded-host'),
      nextRequest.headers.get('x-forwarded-proto'),
      nextRequest.headers.get('x-forwarded-port'),
      nextRequest.headers.get('forwarded'),
    ],
  });
  const forwardedHost = nextRequest.headers.get('x-forwarded-host');
  const forwardedProto = nextRequest.headers.get('x-forwarded-proto');
  const forwardedPort = nextRequest.headers.get('x-forwarded-port');

  const url = new URL(nextRequest.url);

  return updateUrlWith(url, {
    host: forwardedHost ?? url.host,
    protocol: forwardedProto ?? url.protocol,
    port: forwardedPort ?? url.port,
    ...urlUpdates,
  });
}

export function updateUrlWith(url: URL, updates: UrlUpdates): URL {
  const newUrl = new URL(url);
  if ('pathname' in updates) {
    newUrl.pathname = updates.pathname!;
  }
  if ('search' in updates) {
    newUrl.search = updates.search!;
  }
  if ('host' in updates) {
    newUrl.host = updates.host!;
  }
  if ('protocol' in updates) {
    newUrl.protocol = updates.protocol!;
  }
  if ('port' in updates) {
    newUrl.port = updates.port!;
  }
  return newUrl;
}
