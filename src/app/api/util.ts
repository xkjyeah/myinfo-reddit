import { NextRequest } from 'next/server';

type UrlUpdates = {
  pathname?: string;
  search?: string;
  host?: string;
  protocol?: string;
  port?: string;
};

export function constructForwardedForUrl(nextRequest: NextRequest, urlUpdates: UrlUpdates) {
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
  if (updates.pathname) {
    newUrl.pathname = updates.pathname;
  }
  if (updates.search) {
    newUrl.search = updates.search;
  }
  if (updates.host) {
    newUrl.host = updates.host;
  }
  if (updates.protocol) {
    newUrl.protocol = updates.protocol;
  }
  if (updates.port) {
    newUrl.port = updates.port;
  }
  return newUrl;
}
