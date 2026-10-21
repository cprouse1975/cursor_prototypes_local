import { PLANTS } from '../data/demoData';
import { useConfig } from '../context/ConfigContext.jsx';
import ModeBadge from '../components/ModeBadge.jsx';

export default function DispatchPage() {
  const { effectiveModeForPlant } = useConfig();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dispatch — ticket queue</h1>
        <p className="lede">Surface effective delivery medium per plant so dispatchers know what drivers should receive.</p>
      </header>

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Plant</th>
              <th>Driver</th>
              <th>Delivery medium</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {PLANTS.slice(0, 3).map((plant, i) => {
              const mode = effectiveModeForPlant(plant.id);
              return (
                <tr key={plant.id}>
                  <td>T-48290{i + 1}</td>
                  <td>{plant.name}</td>
                  <td>{['J. Martinez', 'A. Chen', 'R. Brooks'][i]}</td>
                  <td>
                    <ModeBadge mode={mode} />
                  </td>
                  <td className="notes">
                    {mode === 'printed'
                      ? 'Confirm paper ticket at scale house'
                      : 'Tablet sync OK · Deliveries EPOD'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
