'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { FlairV2 } from './api/reddit/flairs';
import {
  FlairInfoProvider,
  StatusCodeToDescription,
  useFlairInfo,
} from './components/FlairInfoContext';
import RenderFlair from './components/RenderFlair';

function HomeImpl({ subreddit }: { subreddit: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reddit Singpass Verification</h1>
          <p className="mt-2 text-gray-600">
            {subreddit
              ? `Verify your Singapore citizenship status to get your flair on r/${subreddit}`
              : 'Verify your Singapore citizenship status to get your subreddit flair'}
          </p>
          <p>
            <table style={{ width: '100%' }}>
              <tr>
                <th>Status</th>
                <th>Flair</th>
              </tr>
              {Object.entries(StatusCodeToDescription || {}).map(([status, description]) => {
                return (
                  <tr key={status}>
                    <td style={{ textAlign: 'left' }}>{description}</td>
                    <td style={{ textAlign: 'left' }}>
                      <RenderFlair code={status} />
                    </td>
                  </tr>
                );
              })}
            </table>
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link href="/api/auth/singpass/login">
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
