import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reddit Singpass Verification</h1>
          <p className="mt-2 text-gray-600">
            Verify your Singapore citizenship status to get your subreddit flair
          </p>
        </div>
{/*         
        <div className="mt-8 space-y-4">
          <Link 
            href="/api/auth/reddit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Continue with Reddit
          </Link>
        </div> */}

        <div className="mt-8 space-y-4">
          <Link 
            href="/api/auth/singpass/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Continue with Singpass
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            This service verifies Singapore citizenship status through Singpass MyInfo
            for subreddit flair assignment.
          </p>
        </div>
      </div>
    </main>
  )
}
