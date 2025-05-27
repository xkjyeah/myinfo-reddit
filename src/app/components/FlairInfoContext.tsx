import { createContext, useContext, useEffect, useState } from 'react';

import { FlairV2 } from '../api/reddit/flairs';

const FlairInfoContext = createContext<{
  flairInfo: Record<string, FlairV2> | null;
  loading: boolean;
} | null>(null);

export const StatusCodeToDescription = {
  C: 'Citizen',
  P: 'PR',
  A: 'Foreigner',
};

export const FlairInfoProvider = ({
  subreddit,
  children,
}: {
  subreddit: string;
  children: React.ReactNode;
}) => {
  const [subredditFlairInfo, setSubredditFlairInfo] = useState<Record<string, FlairV2> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subreddit) {
      const formData = new FormData();
      formData.append('targetSubreddit', subreddit);

      fetch(
        new Request(`/api/reddit/flair-info?subreddit=${encodeURIComponent(subreddit)}`, {
          method: 'GET',
        })
      ).then(async (ff) => {
        setLoading(false);
        if (ff.ok) {
          setSubredditFlairInfo(await ff.json());
        } else {
          throw new Error('Error from API -- ' + (await ff.text()));
        }
      });
    }
  }, [subreddit]);

  return (
    <FlairInfoContext.Provider value={{ flairInfo: subredditFlairInfo, loading }}>
      {children}
    </FlairInfoContext.Provider>
  );
};

export const useFlairInfo = () => {
  return useContext(FlairInfoContext);
};
