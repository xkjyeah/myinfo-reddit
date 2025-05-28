'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

import { FlairInfoProvider } from '../components/FlairInfoContext';
import RenderFlair from '../components/RenderFlair';

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

function Home() {
  const [info, setInfo] = useState<{
    residentialStatus: string | null;
    targetSubreddit: string | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/info').then(async (r) => {
      const json = await r.json();
      setInfo(json);
    });
  }, []);

  return (
    <FlairInfoProvider subreddit={info?.targetSubreddit || 'verifiedsingapore'}>
      <HomeImpl
        subreddit={info?.targetSubreddit || 'verifiedsingapore'}
        residentialStatus={info?.residentialStatus || null}
      />
    </FlairInfoProvider>
  );
}
function HomeImpl({
  subreddit,
  residentialStatus,
}: {
  subreddit: string;
  residentialStatus: string | null;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reddit Singpass Verification</h1>
          <p className="mt-2 text-gray-600">
            Your residential status:{' '}
            <b>
              <ResidentialStatus code={residentialStatus} />
            </b>
          </p>
          <p className="mt-2 text-gray-600">
            Your flair: <RenderFlair code={residentialStatus || 'U'} />
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {residentialStatus ? (
            <Link
              href={`/api/reddit/login?subreddit=${encodeURIComponent(subreddit)}`}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Add your flair to r/{subreddit}
            </Link>
          ) : (
            <p>
              We were not able to retrieve your residential status from Myinfo. Do you want to{' '}
              <Link href="/api/singpass/login">try again</Link>?
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
