import Snoowrap from 'snoowrap';

export const StatusToTemplateClass = {
  C: /\bverified-citizen\b/,
  P: /\bverified-pr\b/,
  A: /\bverified-foreigner\b/,
};
type ElementType<T> = T extends Array<infer U> ? U : never;
export type FlairTemplate = ElementType<
  Awaited<ReturnType<Snoowrap.Subreddit['getUserFlairTemplates']>>
>;

export async function getStatusToFlairTemplates(subreddit: Snoowrap.Subreddit) {
  // Identify matching flairs by css-class
  // The first flair with -verified-citizen- will be matched to citizens
  // The first flair with -verified-pr- will be matched to PRs
  // The first flair with -verified-foreigner- will be matched to aliens
  const flairs = await subreddit.getUserFlairTemplates();
  if (flairs.length === 0) {
    throw new Error('No flairs found');
  }

  return Object.fromEntries(
    Object.entries(StatusToTemplateClass)
      .map(([status, regex]): [string, FlairTemplate] | null => {
        const foundTemplate = flairs.find((f) => regex.test(f.flair_css_class));

        if (foundTemplate) {
          return [status, foundTemplate];
        }

        return null;
      })
      .filter((s): s is [string, FlairTemplate] => s !== null)
  );
}
