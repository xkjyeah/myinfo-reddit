import Link from 'next/link';

import { StatusCodeToDescription, useFlairInfo } from './FlairInfoContext';
import RenderFlair from './RenderFlair';

export default function StatusFlairTable({ subreddit }: { subreddit: string }) {
  const flairInfo = useFlairInfo();

  if (!flairInfo) {
    throw new Error('Must be wrapped in FlairInfoProvider');
  }

  if (flairInfo.loading) {
    return <>Loading flair information...</>;
  }

  return (
    <table style={{ width: '100%' }}>
      <tbody>
        <tr>
          <th>Status</th>
          <th>Flair</th>
        </tr>
        {Object.entries(StatusCodeToDescription || {}).map(([status, description]) => {
          const flair = flairInfo.flairInfo?.[status];
          const isNotModOnly = flair && !flair.mod_only;

          return (
            <tr key={status}>
              <td style={{ textAlign: 'left' }}>{description}</td>
              <td style={{ textAlign: 'left' }}>
                <RenderFlair code={status} />
                {isNotModOnly && (
                  <div
                    style={{
                      color: '#d97706',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    ⚠️ Users can assign themselves this flair manually. It should be marked as "For
                    mods only" in{' '}
                    <Link href={`https://www.reddit.com/mod/${subreddit}/userflair`}>
                      the user flair settings
                    </Link>
                    .
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
