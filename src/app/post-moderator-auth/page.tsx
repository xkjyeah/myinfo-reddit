'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { FlairInfoProvider } from '../components/FlairInfoContext';
import StatusFlairTable from '../components/StatusFlairTable';

function PostModeratorAuthImpl({ subreddit }: { subreddit: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Setup Complete!</h1>
          <p className="mt-2 text-gray-600">
            The Reddit Singpass Verification app has been successfully authorized for r/{subreddit}.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Next Steps: Configure Flairs</h2>
          <p className="text-blue-800 mb-4">
            To complete the setup, you need to create flair templates in your subreddit with
            specific CSS classes. The CSS classes must contain these exact words (you can add
            prefixes or suffixes):
          </p>

          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center">
              <span className="font-mono bg-blue-100 px-2 py-1 rounded mr-3">verified-citizen</span>
              <span>For Singapore Citizens</span>
            </div>
            <div className="flex items-center">
              <span className="font-mono bg-blue-100 px-2 py-1 rounded mr-3">verified-pr</span>
              <span>For Permanent Residents</span>
            </div>
            <div className="flex items-center">
              <span className="font-mono bg-blue-100 px-2 py-1 rounded mr-3">
                verified-foreigner
              </span>
              <span>For Foreign Talent</span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-100 rounded text-xs text-blue-700">
            <p className="font-semibold mb-1">Examples of valid CSS classes:</p>
            <ul className="space-y-1">
              <li>
                <span className="font-mono">sg-verified-citizen-flair</span>
              </li>
              <li>
                <span className="font-mono">user-verified-pr</span>
              </li>
              <li>
                <span className="font-mono">verified-foreigner-status</span>
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <Link
              href={`https://www.reddit.com/mod/${encodeURIComponent(subreddit)}/userflair`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Configure Flairs on Reddit
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Expected Flairs</h3>
          <p className="text-sm text-gray-600 mb-4">
            Here's what the flairs will look like once configured:
          </p>
          <StatusFlairTable />
        </div>

        <div className="text-center">
          <Link
            href={`/?subreddit=${encodeURIComponent(subreddit)}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Main Page
          </Link>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Users can now visit this app to verify their Singapore residential status and receive
            their flair on r/{subreddit}.
          </p>
        </div>
      </div>
    </main>
  );
}

function PostModeratorAuth() {
  const searchParams = useSearchParams();
  const subreddit = searchParams.get('subreddit') || 'verifiedsingapore';

  return (
    <FlairInfoProvider subreddit={subreddit}>
      <PostModeratorAuthImpl subreddit={subreddit} />
    </FlairInfoProvider>
  );
}

export default function SuspendedPostModeratorAuth() {
  return (
    <Suspense>
      <PostModeratorAuth />
    </Suspense>
  );
}
