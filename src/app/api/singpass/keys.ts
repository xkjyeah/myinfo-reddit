import * as crypto from 'crypto';
// import * as jose from 'jose';
import * as oidClient from 'openid-client';

export async function ourPrivateEncKey() {
  const privateKey = process.env.MYINFO_PRIVATE_ENC_KEY!.replace(/\|/g, '\n');
  return ((await crypto.createPrivateKey(privateKey)) as any).toCryptoKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

export async function ourPrivateSigKey() {
  const privateKey = process.env.MYINFO_PRIVATE_SIG_KEY!.replace(/\|/g, '\n');
  return ((await crypto.createPrivateKey(privateKey)) as any).toCryptoKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign']
  );
}

let configuration: oidClient.Configuration | null = null;

export async function getConfiguration() {
  if (configuration) return configuration;

  configuration ||= await oidClient.discovery(
    new URL(process.env.MYINFO_HOST!),
    process.env.MYINFO_APP_ID!,
    {
      id_token_signed_response_alg: 'ES256',
      authorization_signed_response_alg: 'ES256',
      userinfo_signed_response_alg: 'ES256',
    },
    oidClient.PrivateKeyJwt(await ourPrivateSigKey())
  );
  oidClient.enableDecryptingResponses(configuration, ['A128GCM', 'A192GCM', 'A256GCM'], {
    key: await ourPrivateEncKey(),
    kid: 'my-enc-key',
  });
  return configuration;
}
