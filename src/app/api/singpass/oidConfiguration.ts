import * as oidClient from 'openid-client';

import { ourPrivateEncKey, ourPrivateSigKey } from './keys';

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
