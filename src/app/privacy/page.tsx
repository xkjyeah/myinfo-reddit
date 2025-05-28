'use client';

import Link from 'next/link';

export default function Privacy() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-2 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 mb-4">
                The Reddit Singpass Verification app is a public service provided by Thos.ai
                Software, UEN 53473433B ("we", "our", or "us"). We are committed to protecting your
                privacy. This Privacy Policy explains how we collect, use, and safeguard your
                information when you use our service to verify your Singapore residential status and
                receive Reddit flair.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-2">From Singpass MyInfo</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>
                  <strong>Residential Status:</strong> Your Singapore residential status (Citizen,
                  Permanent Resident, or Foreign Talent)
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">From Reddit</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>
                  <strong>Username:</strong> Your Reddit username for flair assignment
                </li>
                <li>
                  <strong>Subreddit Information:</strong> Which subreddit you're requesting flair
                  for
                </li>
                <li>
                  <strong>Moderator Tokens:</strong> For subreddit moderators, we store refresh
                  tokens to manage flairs
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  To verify your Singapore residential status through official government channels
                </li>
                <li>To assign appropriate verified flairs to your Reddit account</li>
                <li>To enable subreddit moderators to manage verified user flairs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Data Storage and Security
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Minimal storage:</strong> We only collect your residential status code and
                  Reddit username temporarily. After setting your flair, we discard the data.
                </li>
                <li>
                  <strong>No personally identifiable Details:</strong> We do not at any point
                  collect your full name, NRIC, address, or other personal information from MyInfo
                </li>
                <li>
                  <strong>Secure Transmission:</strong> All data is transmitted using
                  industry-standard encryption (HTTPS/TLS)
                </li>
                <li>
                  <strong>Moderator Tokens:</strong> Subreddit moderator refresh tokens are stored
                  in a database and only used for flair management. The refresh tokens are scoped
                  only to manage flair templates and assign flairs.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third
                parties, except:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Reddit:</strong> We share only your username and flair information to
                  assign verified status
                </li>
                <li>
                  <strong>Singpass MyInfo:</strong> We interact with official Singapore government
                  services for verification
                </li>
                <li>
                  <strong>Legal Requirements:</strong> If required by law or to protect our rights
                  and safety
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Access:</strong> You can request information about what data we have about
                  you
                </li>
                <li>
                  <strong>Deletion:</strong> You can request deletion of your data at any time. If
                  you are a moderator, you can revoke the authorization to manage flairs at any time
                  at{' '}
                  <Link href="https://www.reddit.com/prefs/apps">
                    https://www.reddit.com/prefs/apps
                  </Link>
                </li>
                <li>
                  <strong>Correction:</strong> You can request correction of inaccurate information
                </li>
                <li>
                  <strong>Withdrawal:</strong> You can withdraw consent and stop using the service
                  at any time
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-4">Our service integrates with:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Singpass MyInfo:</strong> Singapore government's digital identity platform
                  (governed by Singapore's data protection laws)
                </li>
                <li>
                  <strong>Reddit API:</strong> For flair management (governed by Reddit's Privacy
                  Policy)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or our data practices, please
                contact us through the appropriate channels on the subreddit where this service is
                being used.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify users of any
                material changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Main Page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
