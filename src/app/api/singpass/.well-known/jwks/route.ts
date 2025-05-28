import * as crypto from 'crypto';
import * as jose from 'jose';
import { NextResponse } from 'next/server';

import { ourPrivateEncKey, ourPrivateSigKey } from '../../keys';

async function toPublicKeyOnly(key: crypto.KeyObject) {
  return crypto.createPublicKey(key);
}

export async function GET() {
  try {
    const jwks = {
      keys: [
        {
          ...(await jose.exportJWK(await toPublicKeyOnly(await ourPrivateSigKey()))),
          kid: 'my-sig-key',
          use: 'sig',
          alg: 'ES256',
        },
        {
          ...(await jose.exportJWK(await toPublicKeyOnly(await ourPrivateEncKey()))),
          kid: 'my-enc-key',
          use: 'enc',
          alg: 'ECDH-ES+A256KW',
        },
      ],
    };

    return NextResponse.json(jwks);
  } catch (error) {
    console.error('JWKS error:', error);
    return NextResponse.json({ error: 'Failed to generate JWKS' }, { status: 500 });
  }
}
