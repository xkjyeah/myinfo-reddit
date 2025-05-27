'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FlairTemplate } from './api/reddit/flairs';

export default function Home() {
  // Get the target subreddit from the URL
  const targetSubreddit = useSearchParams().get('subreddit');

  const [subredditFlairInfo, setSubredditFlairInfo] = useState<Record<
    string,
    FlairTemplate
  > | null>(null);

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
            Verify your Singapore citizenship status to get your subreddit flair
          </p>
          {subredditFlairInfo && (
            <p>
              <table>
                <tr>
                  <th>Status</th>
                  <th>Flair</th>
                </tr>
                {Object.entries(subredditFlairInfo || {}).map(([status, flair]) => (
                  <tr key={status}>
                    <td>{status}</td>
                    <td>
                      {JSON.stringify(flair)}

                      {flair.flair_text}
                    </td>
                  </tr>
                ))}
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
