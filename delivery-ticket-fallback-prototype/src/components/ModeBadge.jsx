import { TICKET_MODES } from '../data/demoData';

export default function ModeBadge({ mode, size = 'md' }) {
  const meta = TICKET_MODES[mode] ?? { short: mode, label: mode };
  return (
    <span className={`mode-badge mode-${mode} size-${size}`} title={meta.label}>
      {meta.short}
    </span>
  );
}
