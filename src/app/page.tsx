'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { FlairInfoProvider } from './components/FlairInfoContext';
import StatusFlairTable from './components/StatusFlairTable';

function HomeImpl({ subreddit }: { subreddit: string | null }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reddit Singpass Verification</h1>
        </div>
        {subreddit ? (
          <>
            <div className="text-center">
              <p className="mt-2 text-gray-600">
                Verify your Singapore residential status to get your flair on r/{subreddit}.
              </p>
              <p>
                <StatusFlairTable />
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <Link href={`/api/singpass/login?subreddit=${encodeURIComponent(subreddit)}`}>
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
                This service verifies Singapore citizenship status through Singpass MyInfo, and
                assigns you a flair in r/{subreddit}.
              </p>
              <p>
                We do not collect your name or NRIC/FIN, or store transaction data. For details, see
                our{' '}
                <Link href="/privacy" className="font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center ">
            You can use this app to verify your subreddit's users Singapore residential status. To
            see an example, you can try{' '}
            <Link href="/?subreddit=verifiedsingapore">
              verifying yourself for r/verifiedsingapore
            </Link>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col space-y-2 text-center">
            <Link href="/moderator" className="text-sm font-medium">
              Moderator of a subreddit? Set up the app →
            </Link>

            <Link href="/privacy" className="text-sm font-medium">
              Privacy Policy
            </Link>
            <Link href="https://github.com/xkjyeah/myinfo-reddit" className="text-sm font-medium">
              Source code
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Home() {
  // Get the target subreddit from the URL
  const targetSubreddit = useSearchParams().get('subreddit') || null;

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

  return targetSubreddit ? (
    <FlairInfoProvider subreddit={targetSubreddit}>
      <HomeImpl subreddit={targetSubreddit} />
    </FlairInfoProvider>
  ) : (
    <HomeImpl subreddit={targetSubreddit} />
  );
}

export default function SuspendedHome() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
