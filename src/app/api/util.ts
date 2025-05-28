import { NextRequest } from 'next/server';

export function constructForwardedForUrl(nextRequest: NextRequest, url: URL) {
  const forwardedHost = nextRequest.headers.get('x-forwarded-host');
  const forwardedProto = nextRequest.headers.get('x-forwarded-proto');
  return updateUrlWith(url, {
    host: forwardedHost ?? url.host,
    protocol: forwardedProto ?? url.protocol,
  });
}

export function updateUrlWith(
  url: URL,
  updates: { pathname?: string; search?: string; host?: string; protocol?: string }
) {
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
  return newUrl;
}
