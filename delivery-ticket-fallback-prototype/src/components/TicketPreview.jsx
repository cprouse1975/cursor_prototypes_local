import { SAMPLE_TICKET } from '../data/demoData';

export default function TicketPreview({ medium = 'digital' }) {
  const t = SAMPLE_TICKET;
  return (
    <div className={`ticket-preview ${medium}`}>
      <header>
        <strong>Delivery ticket</strong>
        <span>{t.number}</span>
      </header>
      <dl>
        <div><dt>Customer</dt><dd>{t.customer}</dd></div>
        <div><dt>Job</dt><dd>{t.job}</dd></div>
        <div><dt>Product</dt><dd>{t.mix}</dd></div>
        <div><dt>Quantity</dt><dd>{t.qty}</dd></div>
        <div><dt>Destination</dt><dd>{t.dest}</dd></div>
        <div><dt>Truck / Driver</dt><dd>{t.truck} · {t.driver}</dd></div>
        <div><dt>Plant</dt><dd>{t.plant}</dd></div>
      </dl>
      {medium === 'printed' && <p className="ticket-foot">Printed at batch · hand to driver</p>}
      {medium === 'digital' && <p className="ticket-foot">Delivered to TrackIt tablet · EPOD enabled</p>}
    </div>
  );
}
