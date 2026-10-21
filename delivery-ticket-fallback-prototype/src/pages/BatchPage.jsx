import { PLANTS } from '../data/demoData';
import { useConfig } from '../context/ConfigContext.jsx';
import ModeBadge from '../components/ModeBadge.jsx';
import TicketPreview from '../components/TicketPreview.jsx';

export default function BatchPage() {
  const { effectiveModeForPlant } = useConfig();
  const plant = PLANTS[0];
  const mode = effectiveModeForPlant(plant.id);
  const isPrint = mode === 'printed';

  return (
    <div className="page">
      <header className="page-header">
        <h1>Batch plant — load complete</h1>
        <p className="lede">
          COMMANDbatch view when effective mode is <ModeBadge mode={mode} /> for {plant.name}.
        </p>
      </header>

      <div className="card-grid two">
        <section className="card">
          <h2>Batch setup</h2>
          <dl className="kv">
            <div><dt>Ticket</dt><dd>T-482901</dd></div>
            <div><dt>Mix</dt><dd>4000 PSI</dd></div>
            <div><dt>Load</dt><dd>10.0 CY</dd></div>
            <div><dt>Status</dt><dd className="ok-text">Batch complete</dd></div>
          </dl>
          {isPrint ? (
            <div className="callout ok">
              <strong>Print ticket</strong> — sent to plant printer &quot;Batch Office — Ticket 1&quot; (2 copies).
              Driver handoff required.
            </div>
          ) : (
            <div className="callout">
              Ticket queued to TrackIt tablet. EPOD workflow active on driver app.
            </div>
          )}
          <button type="button" className="btn primary">
            {isPrint ? 'Reprint ticket' : 'Resend to tablet'}
          </button>
        </section>

        <TicketPreview medium={isPrint ? 'printed' : 'digital'} />
      </div>
    </div>
  );
}
