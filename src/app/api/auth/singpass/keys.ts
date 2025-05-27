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
  // return crypto.subtle.importKey(
  //   'pkcs8',
  //   Buffer.from(privateKey, 'utf-8'),
  //   {
  //     name: 'ECDSA',
  //     namedCurve: 'P-256',
  //   },
  //   true,
  //   ['sign']
  // );
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
      // userinfo_encrypted_response_enc: 'A256GCM',
      // userinfo_encrypted_response_alg: 'ECDH-ES+A256KW',
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

// let client: oidClient.Client | null = null;

// export async function getClient() {
//   const issuer = await oidClient.Issuer.discover(OID_URL);

//   client ||= new issuer.Client(
//     {
//       client_id: process.env.MYINFO_APP_ID!,
//       response_types: ['code'],
//       token_endpoint_auth_method: 'private_key_jwt',
//       id_token_signed_response_alg: 'ES256',
//       userinfo_encrypted_response_enc: 'A256GCM',
//       userinfo_encrypted_response_alg: 'ECDH-ES+A256KW',
//       userinfo_signed_response_alg: 'ES256',
//     },
//     {
//       keys: [
//         {
//           ...(await jose.exportJWK(await ourPrivateSigKey())),
//           kid: 'my-sig-key',
//           use: 'sig',
//           alg: 'ES256',
//         },
//         {
//           ...(await jose.exportJWK(await ourPrivateEncKey())),
//           kid: 'my-enc-key',
//           use: 'enc',
//           alg: 'ECDH-ES+A256KW',
//         },
//       ] as any, // different versions of jose :(
//     }
//   );
//   return client;
// }
