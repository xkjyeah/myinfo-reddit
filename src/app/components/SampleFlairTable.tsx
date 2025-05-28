import { StatusCodeToDescription } from './FlairInfoContext';

const sampleFlairs = {
  C: {
    text: 'Citizen',
    backgroundColor: '#DE21B8',
    textColor: 'Light-on-Dark',
    cssClass: 'sg-verified-citizen',
  },
  P: {
    text: 'PR',
    backgroundColor: '#3989C6',
    textColor: 'Light-on-Dark',
    cssClass: 'sg-verified-pr',
  },
  A: {
    text: 'Foreigner',
    backgroundColor: '#59A68C',
    textColor: 'Light-on-Dark',
    cssClass: 'sg-verified-foreigner',
  },
};

export default function SampleFlairTable() {
  return (
    <div className="space-y-4">
      <table style={{ width: '100%' }} className="border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 border-b">Status</th>
            <th className="text-left p-2 border-b">Sample Flair</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(StatusCodeToDescription || {}).map(([status]) => {
            const flair = sampleFlairs[status as keyof typeof sampleFlairs];
            return (
              <tr key={status}>
                <td className="p-2 border-b">
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      color: flair.textColor,
                      backgroundColor: flair.backgroundColor,
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {flair.text}
                  </span>
                </td>
                <td className="p-2 border-b">
                  <div>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      <li>
                        <b>Text:</b> {flair.text}
                      </li>
                      <li>
                        <b>Background:</b> <code>{flair.backgroundColor}</code>
                      </li>
                      <li>
                        <b>Text Color:</b> {flair.textColor}
                      </li>
                      <li>
                        <b>CSS class:</b> <code>{flair.cssClass}</code>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
        <p className="font-semibold mb-1">Note:</p>
        <p>
          These are sample flairs. You can customize the text, colors, and styling to match your
          subreddit's theme. Just ensure the CSS class contains the required keywords
          (verified-citizen, verified-pr, verified-foreigner). Also ensure that users are not
          allowed to change their flair, or else it would defeat the purpose of verification.
        </p>
      </div>
    </div>
  );
}
