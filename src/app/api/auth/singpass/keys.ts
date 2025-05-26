import * as crypto from 'crypto';
import * as jose from 'jose';
import * as oidClient from 'openid-client';

export async function ourPrivateEncKey() {
  const privateKey = process.env.MYINFO_PRIVATE_ENC_KEY!.replace(/\|/g, '\n');
  return await crypto.createPrivateKey(privateKey);
}

export async function ourPrivateSigKey() {
  const privateKey = process.env.MYINFO_PRIVATE_SIG_KEY!.replace(/\|/g, '\n');
  return await crypto.createPrivateKey(privateKey);
}

let configuration: oidClient.Configuration | null = null;

// OIDC configuration for Singpass staging environment
const SINGPASS_AUTH_URL = 'https://stg-id.singpass.gov.sg/auth';
const OID_URL = 'https://stg-id.singpass.gov.sg/.well-known/openid-configuration';

export async function getConfiguration() {
  configuration ||= await oidClient.discovery(new URL(OID_URL), process.env.MYINFO_APP_ID!);
  return configuration;
}
