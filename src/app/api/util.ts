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
  // DigitalOcean doesn't always provide the port ID -- so we forcibly
  let forwardedPort: string | null = null;
  switch (forwardedProto) {
    case 'https':
      forwardedPort = '443';
      break;
    case 'http':
      forwardedPort = '80';
      break;
  }

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
