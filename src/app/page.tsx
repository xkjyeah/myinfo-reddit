'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { FlairV2 } from './api/reddit/flairs';

const StatusCodeToDescription = {
  C: 'Citizen',
  P: 'PR',
  A: 'Foreigner',
};

function Home() {
  // Get the target subreddit from the URL
  const targetSubreddit = useSearchParams().get('subreddit');

  const [subredditFlairInfo, setSubredditFlairInfo] = useState<Record<string, FlairV2> | null>(
    null
  );

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

      // also, fetch the flair info
      fetch(
        new Request(`/api/reddit/flair-info?subreddit=${targetSubreddit}`, {
          method: 'GET',
        })
      ).then(async (ff) => {
        if (ff.ok) {
          setSubredditFlairInfo(await ff.json());
        } else {
          throw new Error('Error from API -- ' + (await ff.text()));
        }
      });
    }
  }, [targetSubreddit]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reddit Singpass Verification</h1>
          <p className="mt-2 text-gray-600">
            {targetSubreddit
              ? `Verify your Singapore citizenship status to get your flair on r/${targetSubreddit}`
              : 'Verify your Singapore citizenship status to get your subreddit flair'}
          </p>
          {subredditFlairInfo && (
            <p>
              <table style={{ width: '100%' }}>
                <tr>
                  <th>Status</th>
                  <th>Flair</th>
                </tr>
                {Object.entries(subredditFlairInfo || {}).map(([status, flair]) => {
                  return (
                    <tr key={status}>
                      <td style={{ textAlign: 'left' }}>{StatusCodeToDescription[status]}</td>
                      <td style={{ textAlign: 'left' }}>
                        <span
                          style={{
                            padding: '0.2em',
                            color: flair.text_color == 'light' ? 'white' : 'black',
                            backgroundColor: flair.background_color,
                          }}
                        >
                          {flair.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </table>
            </p>
          )}
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

export default function SuspendedHome() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
