import Snoowrap from 'snoowrap';

export const StatusToTemplateClass = {
  C: /\bverified-citizen\b/,
  P: /\bverified-pr\b/,
  A: /\bverified-foreigner\b/,
};

export type FlairV2 = {
  text: string;
  text_color: 'light' | 'dark';
  background_color: string;
  mod_only: boolean;
  css_class: string;
  type: 'text' | 'image';
};

export async function getStatusToFlairTemplates(reddit: Snoowrap, subreddit: Snoowrap.Subreddit) {
  // Identify matching flairs by css-class
  // The first flair with -verified-citizen- will be matched to citizens
  // The first flair with -verified-pr- will be matched to PRs
  // The first flair with -verified-foreigner- will be matched to aliens
  const flairs: FlairV2[] = await reddit.oauthRequest({
    uri: `/r/${subreddit.display_name}/api/user_flair_v2`,
    method: 'GET',
  });

  if (flairs.length === 0) {
    throw new Error('No flairs found');
  }

  return Object.fromEntries(
    Object.entries(StatusToTemplateClass)
      .map(([status, regex]): [string, FlairV2] | null => {
        const foundTemplate = flairs.find((f) => regex.test(f.css_class));

        if (foundTemplate) {
          return [status, foundTemplate];
        }

        return null;
      })
      .filter((s): s is [string, FlairV2] => s !== null)
  );
}
