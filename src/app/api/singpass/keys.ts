import * as crypto from 'crypto';

// import * as jose from 'jose';

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
