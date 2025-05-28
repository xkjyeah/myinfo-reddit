'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { FlairInfoProvider } from './components/FlairInfoContext';
import StatusFlairTable from './components/StatusFlairTable';

function HomeImpl({ subreddit }: { subreddit: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reddit Singpass Verification</h1>
          <p className="mt-2 text-gray-600">
            {subreddit
              ? `Verify your Singapore residential status to get your flair on r/${subreddit}`
              : 'Verify your Singapore residential status to get your subreddit flair'}
          </p>
          <p>
            <StatusFlairTable />
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link href="/api/singpass/login">
            <Image
              src="images/myinfo.svg"
              alt="Retrieve my info with Singpass"
              width="600"
              height="90"
            />
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            This service verifies Singapore citizenship status through Singpass MyInfo, and assigns
            you a flair in your subreddit.
          </p>
        </div>

        {/* Moderator Authorization Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Moderator of a subreddit? Authorize this app to add flairs
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              If you're a moderator of r/{subreddit}, you can authorize this app to automatically
              add verified flairs to your users.
            </p>
          </div>

          <div className="mt-4">
            <Link
              href={`/api/auth/subreddit-owner?subreddit=${encodeURIComponent(subreddit)}`}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Authorize app
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
function Home() {
  // Get the target subreddit from the URL
  const targetSubreddit = useSearchParams().get('subreddit');

  useEffect(() => {
    if (targetSubreddit) {
      const formData = new FormData();
      formData.append('targetSubreddit', targetSubreddit);
      // save the target onto the cookie so we don't lose it
      fetch(
        new Request(`/api/reddit/set-target`, {
          method: 'POST',
          body: formData,
        })
      );
    }
  }, [targetSubreddit]);

  return (
    <FlairInfoProvider subreddit={targetSubreddit || 'verifiedsingapore'}>
      <HomeImpl subreddit={targetSubreddit || 'verifiedsingapore'} />
    </FlairInfoProvider>
  );
}

export default function SuspendedHome() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
