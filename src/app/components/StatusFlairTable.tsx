import { StatusCodeToDescription } from './FlairInfoContext';
import RenderFlair from './RenderFlair';

export default function StatusFlairTable() {
  return (
    <table style={{ width: '100%' }}>
      <tr>
        <th>Status</th>
        <th>Flair</th>
      </tr>
      {Object.entries(StatusCodeToDescription || {}).map(([status, description]) => {
        return (
          <tr key={status}>
            <td style={{ textAlign: 'left' }}>{description}</td>
            <td style={{ textAlign: 'left' }}>
              <RenderFlair code={status} />
            </td>
          </tr>
        );
      })}
    </table>
  );
}
