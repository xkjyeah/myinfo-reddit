import * as jose from 'jose';
import { NextResponse } from 'next/server';

import { ourPrivateEncKey, ourPrivateSigKey } from '../../keys';

export async function GET() {
  try {
    const jwks = {
      keys: [
        {
          ...(await jose.exportJWK(await ourPrivateSigKey())),
          kid: 'my-sig-key',
          use: 'sig',
          alg: 'RS256',
        },
        {
          ...(await jose.exportJWK(await ourPrivateEncKey())),
          kid: 'my-enc-key',
          use: 'enc',
          alg: 'RSA256',
        },
      ],
    };

    return NextResponse.json(jwks);
  } catch (error) {
    console.error('JWKS error:', error);
    return NextResponse.json({ error: 'Failed to generate JWKS' }, { status: 500 });
  }
}
