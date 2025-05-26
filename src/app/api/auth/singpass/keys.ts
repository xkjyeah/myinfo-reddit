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

// OIDC configuration for Singpass staging environment
const OID_URL = process.env.MYINFO_HOST + '/.well-known/openid-configuration';

// let configuration: oidClient.Configuration | null = null;

// export async function getConfiguration() {
//   configuration ||= await oidClient.discovery(new URL(OID_URL), process.env.MYINFO_APP_ID!);
//   return configuration;
// }

let client: oidClient.Client | null = null;

export async function getClient() {
  const issuer = await oidClient.Issuer.discover(OID_URL);

  client ||= new issuer.Client(
    {
      client_id: process.env.MYINFO_APP_ID!,
      response_types: ['code'],
      token_endpoint_auth_method: 'private_key_jwt',
      id_token_signed_response_alg: 'ES256',
      userinfo_encrypted_response_enc: 'A256GCM',
      userinfo_encrypted_response_alg: 'ECDH-ES+A256KW',
      userinfo_signed_response_alg: 'ES256',
    },
    {
      keys: [
        {
          ...(await jose.exportJWK(await ourPrivateSigKey())),
          kid: 'my-sig-key',
          use: 'sig',
          alg: 'ES256',
        },
        {
          ...(await jose.exportJWK(await ourPrivateEncKey())),
          kid: 'my-enc-key',
          use: 'enc',
          alg: 'ECDH-ES+A256KW',
        },
      ] as any, // different versions of jose :(
    }
  );
  return client;
}
