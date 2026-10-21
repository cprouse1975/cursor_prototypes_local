import { Link } from 'react-router-dom';

export default function OverviewPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Printed ticket fallback</h1>
        <p className="lede">
          Customer question: when phone/internet is down and Deliveries cannot run digitally, can they
          flip a switch to print tickets at the batch plant for the driver?
        </p>
      </header>

      <div className="card-grid two">
        <section className="card">
          <h2>What exists today</h2>
          <ul className="check-list">
            <li className="no">
              No documented company- or plant-level <strong>“printed ticket mode”</strong> in TrackIt Site
              Settings or Deliveries.
            </li>
            <li className="yes">
              <strong>COMMANDbatch</strong> can print delivery tickets from Batch Setup when batching runs
              locally at the plant.
            </li>
            <li className="yes">
              TrackIt <strong>Ticket Integration</strong> controls tablet display and ticket lifecycle—not
              print fallback.
            </li>
            <li className="yes">
              When connectivity returns, batch/ticket data is designed to sync via the dispatch/batch
              interface.
            </li>
          </ul>
        </section>

        <section className="card accent">
          <h2>Prototype scope</h2>
          <p>
            This concept adds <strong>Settings → Deliveries → Ticket delivery</strong> with a company default
            and optional per-plant overrides, plus operational views for batch and dispatch.
          </p>
          <Link className="btn primary" to="/company">
            Open company config
          </Link>
        </section>
      </div>

      <section className="card">
        <h2>Suggested outage runbook (interim)</h2>
        <ol className="numbered">
          <li>Confirm batch PC and plant printer can operate without WAN.</li>
          <li>Print tickets at load-out; driver retains paper ticket.</li>
          <li>Dispatch marks loads in TrackIt when link returns, or reconcile via batch history.</li>
          <li>Document EPOD exceptions (signatures on paper, photo upload later if supported).</li>
        </ol>
      </section>
    </div>
  );
}
