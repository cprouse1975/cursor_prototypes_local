import { PLANTS } from '../data/demoData';
import { useConfig } from '../context/ConfigContext.jsx';
import ModeBadge from '../components/ModeBadge.jsx';

const OVERRIDE_OPTIONS = [
  { value: 'inherit', label: 'Use company default' },
  { value: 'digital', label: 'Force digital' },
  { value: 'printed', label: 'Force printed at plant' },
];

export default function PlantsPage() {
  const { plantOverrides, setPlantOverride, effectiveModeForPlant, companyMode } = useConfig();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Plant overrides</h1>
        <p className="lede">
          Allow selected plants to stay on paper during a regional outage while others remain digital.
        </p>
      </header>

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Plant</th>
              <th>Region</th>
              <th>Override</th>
              <th>Effective mode</th>
            </tr>
          </thead>
          <tbody>
            {PLANTS.map((plant) => {
              const effective = effectiveModeForPlant(plant.id);
              return (
                <tr key={plant.id}>
                  <td>
                    <strong>{plant.name}</strong>
                    <span className="cell-sub">#{plant.code}</span>
                  </td>
                  <td>{plant.region}</td>
                  <td>
                    <select
                      value={plantOverrides[plant.id] ?? 'inherit'}
                      onChange={(e) => setPlantOverride(plant.id, e.target.value)}
                      aria-label={`Override for ${plant.name}`}
                    >
                      {OVERRIDE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <ModeBadge mode={effective} />
                    {plantOverrides[plant.id] === 'inherit' && companyMode === 'hybrid' && (
                      <span className="cell-sub">from company + health</span>
                    )}
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
