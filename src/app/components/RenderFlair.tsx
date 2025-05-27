import { useFlairInfo } from './FlairInfoContext';

export default function renderFlair(props: { code: string }) {
  const flairInfo = useFlairInfo();

  if (!flairInfo) {
    throw new Error('Must be wrapped in FlairInfoProvider');
  }

  if (flairInfo.loading) {
    return <span>Loading...</span>;
  }

  const flair = flairInfo.flairInfo?.[props.code];

  if (!flair) {
    return (
      <span>
        No flair available. Please ask the mods to configure a flair with the CSS tags,
        *-verified-citizen, *-verified-pr, and *-verified-foreigner
      </span>
    );
  }

  return (
    <span
      style={{
        padding: '0.2em',
        color: flair.text_color == 'light' ? 'white' : 'black',
        backgroundColor: flair.background_color,
      }}
    >
      {flair.text}
    </span>
  );
}
