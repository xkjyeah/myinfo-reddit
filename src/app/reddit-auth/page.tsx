'use client';

import * as cookie from 'cookie';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

const ResidentialStatus = ({ code }: { code: string | null }) => {
  switch (code) {
    case 'P':
      return 'Permanent Resident';
    case 'C':
      return 'Singapore Citizen';
    case 'A':
      return 'Foreign Talent';
    default:
      return 'Unknown :(';
  }
};

const normalizedResidentialStatus = (code: string) => {
  if (['P', 'C', 'A'].includes(code)) {
    return code;
  }
  return null;
};

function Home() {
  const [info, setInfo] = useState<{
    residentialStatus: string | null;
    targetSubreddit: string | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/info').then(async (r) => {
      const json = await r.json();
      setInfo(json);
    });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reddit Singpass Verification</h1>
          <p className="mt-2 text-gray-600">
            Your residential status:{' '}
            <b>
              <ResidentialStatus code={info?.residentialStatus || 'U'} />
            </b>
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {info?.residentialStatus ? (
            <Link
              href="/api/auth/reddit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Add your flair to reddit
            </Link>
          ) : (
            <p>
              We were not able to retrieve your residential status from Myinfo. Do you want to try
              again?
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
export default function SuspendedHome() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
