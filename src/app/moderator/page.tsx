'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';

import { FlairInfoProvider } from '../components/FlairInfoContext';
import SampleFlairTable from '../components/SampleFlairTable';

function ModeratorImpl() {
  const [subredditInput, setSubredditInput] = useState('');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Moderator Setup</h1>
          <p className="mt-2 text-gray-600">
            Authorize the Reddit Singpass Verification app to add verified flairs to your subreddit
            users.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>You authorize this app to manage user flairs in your subreddit</li>
            <li>You create flair templates with specific CSS classes (see below)</li>
            <li>Users verify their Singapore residential status through Singpass MyInfo</li>
            <li>The app automatically assigns the appropriate verified flair to users</li>
          </ol>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
            Sample Flair Templates
          </h3>
          <p className="text-sm text-gray-600 mb-4 text-center">
            After authorization, you'll need to create flair templates like these examples:
          </p>
          <SampleFlairTable />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Ready to authorize the app?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your subreddit name to begin the authorization process.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="subreddit-input"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subreddit Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">r/</span>
                </div>
                <input
                  type="text"
                  id="subreddit-input"
                  value={subredditInput}
                  onChange={(e) => setSubredditInput(e.target.value)}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="verifiedsingapore"
                />
              </div>
            </div>

            <Link
              href={
                subredditInput.trim()
                  ? `/api/auth/subreddit-owner?subreddit=${encodeURIComponent(subredditInput.trim())}`
                  : '#'
              }
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                subredditInput.trim()
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!subredditInput.trim()) {
                  e.preventDefault();
                }
              }}
            >
              Authorize App
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Main Page
          </Link>
        </div>
      </div>
    </main>
  );
}

function Moderator() {
  return (
    <FlairInfoProvider subreddit="verifiedsingapore">
      <ModeratorImpl />
    </FlairInfoProvider>
  );
}

export default function SuspendedModerator() {
  return (
    <Suspense>
      <Moderator />
    </Suspense>
  );
}
