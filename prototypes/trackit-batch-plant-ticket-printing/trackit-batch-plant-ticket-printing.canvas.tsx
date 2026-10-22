import {
  useState,
  Stack, Row, Grid, Card, CardHeader, CardBody,
  H1, H2, H3, Text, Divider, Spacer,
  Button, Pill, Toggle, Checkbox, Select, TextInput,
  Stat, Callout,
  useHostTheme,
} from "cursor/canvas";

// ── Types ──────────────────────────────────────────────────────────────────

type OrderStatus = "ready" | "batched" | "printed" | "synced";
interface BatchOrder {
  id: string; orderNo: string; ticketNo: string;
  customer: string; deliveryAddress: string; jobRef: string;
  product: string; volume: number; vehicle: string; driver: string;
  scheduledTime: string; status: OrderStatus; actionTime?: string;
}
interface SystemField     { id: string; defaultLabel: string; enabled: boolean; required: boolean; }
interface AdditionalField { id: string; label: string; enabled: boolean; custom: boolean; tall?: boolean; }
interface TicketTemplate  {
  companyName: string; showContact: boolean; contactNumber: string;
  paperSize: "A4" | "A5"; copies: number;
  systemFields: SystemField[]; additionalFields: AdditionalField[];
}

// ── Initial data ───────────────────────────────────────────────────────────

const makeSystemFields = (): SystemField[] => [
  { id: "ticket_no", defaultLabel: "Ticket Number",       enabled: true, required: true  },
  { id: "order_no",  defaultLabel: "Order Number",        enabled: true, required: false },
  { id: "plant",     defaultLabel: "Batch Plant",         enabled: true, required: false },
  { id: "date",      defaultLabel: "Date",                enabled: true, required: false },
  { id: "batch_tm",  defaultLabel: "Batch Time",          enabled: true, required: false },
  { id: "sched_del", defaultLabel: "Scheduled Delivery",  enabled: true, required: false },
  { id: "customer",  defaultLabel: "Customer",            enabled: true, required: false },
  { id: "deliv_adr", defaultLabel: "Delivery Address",    enabled: true, required: false },
  { id: "job_ref",   defaultLabel: "Job Reference",       enabled: true, required: false },
  { id: "product",   defaultLabel: "Product / Mix",       enabled: true, required: false },
  { id: "volume",    defaultLabel: "Volume Ordered (m3)", enabled: true, required: false },
  { id: "vehicle",   defaultLabel: "Vehicle",             enabled: true, required: false },
  { id: "driver",    defaultLabel: "Driver",              enabled: true, required: false },
];
const makeAdditionalFields = (): AdditionalField[] => [
  { id: "arr_time",  label: "Actual Arrival Time",          enabled: true,  custom: false },
  { id: "dep_time",  label: "Actual Departure Time",        enabled: true,  custom: false },
  { id: "slump",     label: "Slump at Delivery (mm)",       enabled: true,  custom: false },
  { id: "water",     label: "Site Additions - Water (L)",   enabled: true,  custom: false },
  { id: "additions", label: "Site Additions - Other",       enabled: true,  custom: false },
  { id: "act_vol",   label: "Actual Volume Delivered (m3)", enabled: true,  custom: false },
  { id: "site_rep",  label: "Site Contact / Rep",           enabled: true,  custom: false },
  { id: "cust_sig",  label: "Customer Signature",           enabled: true,  custom: false, tall: true },
  { id: "drv_sig",   label: "Driver Signature",             enabled: true,  custom: false, tall: true },
];
const INIT_TEMPLATE: TicketTemplate = {
  companyName: "Acme Concrete Group", showContact: true, contactNumber: "1300 000 000",
  paperSize: "A4", copies: 2,
  systemFields: makeSystemFields(), additionalFields: makeAdditionalFields(),
};
const INIT_ORDERS: BatchOrder[] = [
  { id: "o1", orderNo: "ORD-18261", ticketNo: "002101", customer: "Acme Construction Pty Ltd", deliveryAddress: "47 Builder St, Southpark",   jobRef: "JOB-2026-0891", product: "32 MPa Normal Portland",  volume: 6.0, vehicle: "TRK-047", driver: "J. Morrison", scheduledTime: "11:00", status: "ready"   },
  { id: "o2", orderNo: "ORD-18262", ticketNo: "002102", customer: "Metro Civil Group",          deliveryAddress: "12 Highway Rd, Southpark",  jobRef: "JOB-2026-0904", product: "20 MPa General Purpose", volume: 4.5, vehicle: "TRK-031", driver: "A. Chen",    scheduledTime: "11:30", status: "ready"   },
  { id: "o3", orderNo: "ORD-18263", ticketNo: "002103", customer: "Eastside Developers",        deliveryAddress: "88 Commerce Ave, Eastgate", jobRef: "JOB-2026-0912", product: "40 MPa High Strength",   volume: 8.0, vehicle: "TRK-012", driver: "B. Taylor",  scheduledTime: "12:00", status: "ready"   },
  { id: "o4", orderNo: "ORD-18258", ticketNo: "002098", customer: "Westfield Builders",         deliveryAddress: "3 Trade Rd, Westfield",     jobRef: "JOB-2026-0880", product: "25 MPa General Purpose", volume: 5.5, vehicle: "TRK-019", driver: "R. Smith",   scheduledTime: "09:45", status: "batched", actionTime: "09:41" },
  { id: "o5", orderNo: "ORD-18255", ticketNo: "002097", customer: "Northside Civil",            deliveryAddress: "21 North Ave, Northside",   jobRef: "JOB-2026-0875", product: "32 MPa Normal Portland",  volume: 7.0, vehicle: "TRK-003", driver: "L. Jones",  scheduledTime: "09:00", status: "batched", actionTime: "08:57" },
];

// ── Constants ──────────────────────────────────────────────────────────────

const PAPER_OPTIONS = [{ value: "A4", label: "A4" }, { value: "A5", label: "A5" }];
const COPY_OPTIONS  = [{ value: "1", label: "1 copy" }, { value: "2", label: "2 copies" }, { value: "3", label: "3 copies" }];
const TAB_OPTIONS   = [
  { value: "queue",    label: "Batch Queue"     },
  { value: "sync",     label: "Pending Sync"    },
  { value: "template", label: "Ticket Template" },
];

// ── Ticket Mockup ──────────────────────────────────────────────────────────

function TicketMockup({ template, order }: { template: TicketTemplate; order?: BatchOrder }) {
  const theme = useHostTheme();
  const now = new Date();
  const s: Record<string, string> = {
    ticket_no: order?.ticketNo ?? "002101",       order_no:  order?.orderNo ?? "ORD-18261",
    plant:     "Southpark Ready Mix",             date:      now.toLocaleDateString("en-AU"),
    batch_tm:  now.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
    sched_del: order?.scheduledTime ?? "11:00",   customer:  order?.customer  ?? "Acme Construction Pty Ltd",
    deliv_adr: order?.deliveryAddress ?? "47 Builder St, Southpark",
    job_ref:   order?.jobRef ?? "JOB-2026-0891", product:   order?.product   ?? "32 MPa Normal Portland",
    volume:    order ? `${order.volume} m3` : "6.0 m3",
    vehicle:   order?.vehicle ?? "TRK-047",       driver:    order?.driver    ?? "J. Morrison",
  };
  const sysF = template.systemFields.filter(f => f.enabled && f.id !== "ticket_no" && f.id !== "order_no");
  const addF = template.additionalFields.filter(f => f.enabled);
  return (
    <div style={{ border: `1px solid ${theme.stroke.secondary}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: theme.fill.secondary, borderBottom: `2px solid ${theme.stroke.primary}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack gap={1}>
          <Text weight="bold" size="small">{template.companyName || "Company Name"}</Text>
          {template.showContact && <Text size="small" tone="tertiary">{template.contactNumber}</Text>}
          <Text size="small" tone="tertiary">DELIVERY TICKET</Text>
        </Stack>
        <Stack gap={1} style={{ alignItems: "flex-end" }}>
          <Text weight="bold">#{s.ticket_no}</Text>
          <Text size="small" tone="secondary">{s.order_no}</Text>
        </Stack>
      </div>
      <div style={{ padding: "10px 14px", background: theme.bg.elevated }}>
        <Text size="small" weight="semibold" tone="tertiary" style={{ display: "block", marginBottom: 8, fontSize: 10, letterSpacing: "0.06em" }}>SYSTEM DATA - PRINTED FROM PLATFORM</Text>
        <Stack gap={4}>{sysF.map(f => (<Row key={f.id} justify="space-between" align="center"><Text size="small" tone="secondary" style={{ minWidth: 140 }}>{f.defaultLabel}</Text><Text size="small" weight="semibold">{s[f.id] ?? ""}</Text></Row>))}</Stack>
      </div>
      {addF.length > 0 && (
        <div style={{ padding: "10px 14px", borderTop: `2px dashed ${theme.stroke.secondary}`, background: theme.fill.tertiary }}>
          <Text size="small" weight="semibold" tone="tertiary" style={{ display: "block", marginBottom: 8, fontSize: 10, letterSpacing: "0.06em" }}>DRIVER ADDITIONALS - COMPLETE BY HAND AT SITE</Text>
          <Stack gap={6}>{addF.map(f => (<Row key={f.id} justify="space-between" align="center"><Text size="small" tone="secondary" style={{ minWidth: 150, flexShrink: 0 }}>{f.label}</Text><div style={{ flex: 1, marginLeft: 10, borderBottom: `1px solid ${theme.stroke.secondary}`, height: f.tall ? 26 : 14 }} /></Row>))}</Stack>
        </div>
      )}
      <div style={{ padding: "5px 14px", borderTop: `1px solid ${theme.stroke.tertiary}`, background: theme.fill.secondary }}>
        <Text size="small" tone="tertiary" style={{ textAlign: "center", fontSize: 9, letterSpacing: "0.05em" }}>
          OFFLINE PRINT · {template.paperSize} · {template.copies} {template.copies > 1 ? "COPIES" : "COPY"} · QUEUED FOR TRACKIT SYNC
        </Text>
      </div>
    </div>
  );
}

// ── Print Modal (offline) ──────────────────────────────────────────────────

function PrintModal({ order, template, onDone, onClose }: { order: BatchOrder; template: TicketTemplate; onDone: () => void; onClose: () => void }) {
  const theme = useHostTheme();
  const [step, setStep] = useState<"preview" | "done">("preview");
  const overlay = { position: "fixed" as const, inset: 0 as const, zIndex: 100, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" as const };
  const box     = { background: theme.bg.elevated, border: `1px solid ${theme.stroke.secondary}`, borderRadius: 12, maxWidth: 520, width: "100%", margin: "auto" };

  if (step === "done") {
    return (
      <div style={overlay}>
        <div style={{ ...box, padding: 32, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16, textAlign: "center" as const }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: theme.fill.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={theme.accent.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <Stack gap={3} style={{ alignItems: "center" }}>
            <Text weight="semibold">Ticket #{order.ticketNo} printed</Text>
            <Text size="small" tone="secondary">{template.copies} {template.copies > 1 ? "copies" : "copy"} · {template.paperSize}</Text>
          </Stack>
          <Stack gap={7} style={{ width: "100%", maxWidth: 340 }}>
            {[
              { label: "Ticket printed at plant printer", note: "",                                               done: true  },
              { label: "Batch confirmed in system",       note: "",                                               done: true  },
              { label: "Queued for Trackit sync",         note: "Will send when network is restored",            done: false },
              { label: "Queued for Deliveries sync",      note: "Driver record will reconcile on reconnect",     done: false },
            ].map(({ label, note, done }, i) => (
              <Row key={i} align="start" gap={10}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: done ? theme.accent.primary : theme.fill.tertiary, border: done ? "none" : `1px solid ${theme.stroke.secondary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  {done ? <svg width={10} height={10} viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke={theme.text.onAccent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.stroke.secondary }} />}
                </div>
                <Stack gap={1}>
                  <Text size="small" tone={done ? "primary" : "tertiary"}>{label}</Text>
                  {note ? <Text size="small" tone="tertiary" style={{ fontSize: 11 }}>{note}</Text> : null}
                </Stack>
              </Row>
            ))}
          </Stack>
          <Text size="small" tone="secondary">Driver has their ticket. Go to Pending Sync when the network is restored.</Text>
          <Button variant="secondary" onClick={() => { onDone(); onClose(); }}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={box}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${theme.stroke.tertiary}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack gap={1}>
            <Text weight="semibold">Batch &amp; Print - {order.orderNo}</Text>
            <Text size="small" tone="secondary">{order.customer} · {order.volume} m3 · {order.product}</Text>
          </Stack>
          <Button variant="ghost" onClick={onClose}>
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
          </Button>
        </div>
        <Stack gap={14} style={{ padding: "14px 18px 18px" }}>
          <Callout tone="warning" title="Offline mode - ticket will print and queue for Trackit sync">
            All order data is pre-populated from the platform. The ticket prints at the plant printer now. Batch confirmation and ticket data queue for Trackit and Deliveries and will sync automatically when the network is restored.
          </Callout>
          <TicketMockup template={template} order={order} />
          <Row gap={8} justify="end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => setStep("done")}>Confirm Batch &amp; Print</Button>
          </Row>
        </Stack>
      </div>
    </div>
  );
}

// ── Batch Confirm Modal (online) ───────────────────────────────────────────

function BatchConfirmModal({ order, onDone, onClose }: { order: BatchOrder; onDone: () => void; onClose: () => void }) {
  const theme = useHostTheme();
  const [done, setDone] = useState(false);
  const overlay = { position: "fixed" as const, inset: 0 as const, zIndex: 100, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
  const box = { background: theme.bg.elevated, border: `1px solid ${theme.stroke.secondary}`, borderRadius: 12, maxWidth: 400, width: "100%", margin: "auto", padding: 28 as const };

  if (done) {
    return (
      <div style={overlay}>
        <div style={{ ...box, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 14, textAlign: "center" as const }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: theme.fill.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={theme.accent.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <Text weight="semibold">Ticket #{order.ticketNo} batched</Text>
          <Stack gap={5} style={{ width: "100%", maxWidth: 300 }}>
            {["Batch confirmed", "Sent to Trackit", "Sent to driver in Deliveries"].map((label, i) => (
              <Row key={i} align="center" gap={10}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: theme.accent.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width={8} height={8} viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke={theme.text.onAccent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <Text size="small" tone="secondary">{label}</Text>
              </Row>
            ))}
          </Stack>
          <Button variant="secondary" onClick={() => { onDone(); onClose(); }}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={box}>
        <Stack gap={14}>
          <Stack gap={3}>
            <Text weight="semibold">Batch Ticket - {order.orderNo}</Text>
            <Text size="small" tone="secondary">{order.customer} · {order.volume} m3 · {order.product} · {order.vehicle}</Text>
          </Stack>
          <Text size="small" tone="secondary">Confirming batch will send ticket #{order.ticketNo} to Trackit and to the driver in Deliveries.</Text>
          <Row gap={8} justify="end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => setDone(true)}>Confirm Batch</Button>
          </Row>
        </Stack>
      </div>
    </div>
  );
}

// ── Template Editor ────────────────────────────────────────────────────────

function TemplateEditor({ template, onUpdate }: { template: TicketTemplate; onUpdate: (t: TicketTemplate) => void }) {
  const [newLabel, setNewLabel] = useState("");
  const up = (p: Partial<TicketTemplate>) => onUpdate({ ...template, ...p });
  const toggleSys = (id: string) => up({ systemFields: template.systemFields.map(f => f.id === id && !f.required ? { ...f, enabled: !f.enabled } : f) });
  const toggleAdd = (id: string) => up({ additionalFields: template.additionalFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f) });
  const addField  = () => {
    if (!newLabel.trim()) return;
    up({ additionalFields: [...template.additionalFields, { id: `c_${Date.now()}`, label: newLabel.trim(), enabled: true, custom: true }] });
    setNewLabel("");
  };
  return (
    <Stack gap={10}>
      <Card collapsible defaultOpen>
        <CardHeader>Branding &amp; Layout</CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Stack gap={4}><Text size="small" weight="semibold">Company Name on Ticket</Text><TextInput value={template.companyName} onChange={v => up({ companyName: v })} placeholder="As printed on the ticket" /></Stack>
            <Row gap={8} align="center"><Toggle size="sm" checked={template.showContact} onChange={v => up({ showContact: v })} /><Text size="small">Show contact number</Text></Row>
            {template.showContact && <TextInput value={template.contactNumber} onChange={v => up({ contactNumber: v })} placeholder="e.g. 1300 000 000" />}
            <Row gap={12}>
              <Stack gap={4} style={{ flex: 1 }}><Text size="small" weight="semibold">Paper Size</Text><Select value={template.paperSize} onChange={v => up({ paperSize: v as "A4" | "A5" })} options={PAPER_OPTIONS} /></Stack>
              <Stack gap={4} style={{ flex: 1 }}><Text size="small" weight="semibold">Copies</Text><Select value={String(template.copies)} onChange={v => up({ copies: Number(v) })} options={COPY_OPTIONS} /></Stack>
            </Row>
          </Stack>
        </CardBody>
      </Card>
      <Card collapsible defaultOpen={false}>
        <CardHeader>System Fields (auto-populated at batch time)</CardHeader>
        <CardBody>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Filled automatically from the dispatch order. No manual entry at the plant.</Text>
            <Divider style={{ margin: "4px 0" }} />
            {template.systemFields.map(f => (
              <Row key={f.id} align="center" gap={10}>
                <Checkbox checked={f.enabled} onChange={_ => toggleSys(f.id)} disabled={f.required} />
                <Text size="small" style={{ flex: 1 }}>{f.defaultLabel}</Text>
                {f.required && <Pill size="sm">Always shown</Pill>}
              </Row>
            ))}
          </Stack>
        </CardBody>
      </Card>
      <Card collapsible defaultOpen={false}>
        <CardHeader>Driver Additionals (completed by hand at site)</CardHeader>
        <CardBody>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Blank ruled lines for the driver to complete at the delivery site.</Text>
            <Divider style={{ margin: "4px 0" }} />
            {template.additionalFields.map(f => (
              <Row key={f.id} align="center" gap={10}>
                <Checkbox checked={f.enabled} onChange={_ => toggleAdd(f.id)} />
                <Text size="small" style={{ flex: 1 }}>{f.label}</Text>
                {f.custom && <Button variant="ghost" onClick={() => up({ additionalFields: template.additionalFields.filter(a => a.id !== f.id) })}>Remove</Button>}
              </Row>
            ))}
            <Divider style={{ margin: "4px 0" }} />
            <Row gap={8} align="center">
              <TextInput value={newLabel} onChange={setNewLabel} placeholder="Add custom field..." style={{ flex: 1 }} />
              <Button variant="secondary" onClick={addField} disabled={!newLabel.trim()}>Add</Button>
            </Row>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const theme = useHostTheme();
  const [tab, setTab]                 = useState("queue");
  const [offlineMode, setOfflineMode] = useState(false);
  const [orders, setOrders]           = useState<BatchOrder[]>(INIT_ORDERS);
  const [template, setTemplate]       = useState<TicketTemplate>(INIT_TEMPLATE);
  const [printTarget, setPrintTarget] = useState<BatchOrder | null>(null);
  const [batchTarget, setBatchTarget] = useState<BatchOrder | null>(null);
  const [batchingId, setBatchingId]   = useState<string | null>(null);
  const [saved, setSaved]             = useState(false);
  const [syncing, setSyncing]         = useState(false);

  const readyOrders    = orders.filter(o => o.status === "ready");
  const completedToday = orders.filter(o => o.status === "batched" || o.status === "printed" || o.status === "synced");
  const pendingSync    = orders.filter(o => o.status === "printed");
  const syncedOffline  = orders.filter(o => o.status === "synced");

  const nowStr = () => new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });

  function handleAction(order: BatchOrder) {
    setBatchingId(order.id);
    setTimeout(() => {
      setBatchingId(null);
      if (offlineMode) setPrintTarget(order);
      else             setBatchTarget(order);
    }, 900);
  }
  function handlePrinted() {
    if (!printTarget) return;
    setOrders(os => os.map(o => o.id === printTarget.id ? { ...o, status: "printed", actionTime: nowStr() } : o));
  }
  function handleBatched() {
    if (!batchTarget) return;
    setOrders(os => os.map(o => o.id === batchTarget.id ? { ...o, status: "batched", actionTime: nowStr() } : o));
  }
  function handleSyncAll() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setOrders(os => os.map(o => o.status === "printed" ? { ...o, status: "synced" } : o));
    }, 1800);
  }

  return (
    <Stack gap={0} style={{ maxWidth: 920, margin: "0 auto" }}>

      {/* ── Mode bar ── */}
      <div style={{ padding: "14px 28px", background: offlineMode ? "#7a2b2b18" : theme.bg.editor, borderBottom: `1px solid ${offlineMode ? "#c0393922" : theme.stroke.tertiary}`, display: "flex", alignItems: "center", gap: 14 }}>
        <Stack gap={1} style={{ flex: 1 }}>
          <Row gap={10} align="center">
            <Text weight="semibold">Southpark Ready Mix — Batch Queue</Text>
            {offlineMode
              ? <Pill size="sm">Offline mode — Batch &amp; Print active</Pill>
              : <Pill size="sm" active>Online — digital tickets</Pill>}
          </Row>
          <Text size="small" tone="secondary">
            {offlineMode
              ? "Network outage. Batch & Print is active — tickets print at the plant and queue for Trackit and Deliveries sync on reconnect."
              : "Normal operation. Batch Ticket sends the ticket digitally to Trackit and the driver in Deliveries."}
          </Text>
        </Stack>
        <Stack gap={3} style={{ alignItems: "flex-end", flexShrink: 0 }}>
          <Text size="small" tone="secondary">Offline mode</Text>
          <Toggle checked={offlineMode} onChange={v => { setOfflineMode(v); }} />
        </Stack>
      </div>

      <Stack gap={20} style={{ padding: "24px 28px" }}>

        <Row gap={20} wrap>
          <Stat value={readyOrders.length}  label="Ready to batch"          tone={readyOrders.length > 0 ? "warning" : undefined} />
          <Stat value={orders.filter(o => o.status === "batched").length}  label="Batched digitally today" tone="success" />
          <Stat value={pendingSync.length}  label="Printed — pending sync"   tone={pendingSync.length > 0 ? "danger" : undefined} />
          <Stat value={syncedOffline.length} label="Offline tickets synced" />
        </Row>

        <Row gap={6} wrap>
          {TAB_OPTIONS.map(t => (
            <Pill key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
              {t.value === "sync" && pendingSync.length > 0 ? `Pending Sync (${pendingSync.length})` : t.label}
            </Pill>
          ))}
        </Row>
        <Divider />

        {/* ── BATCH QUEUE ── */}
        {tab === "queue" && (
          <Stack gap={14}>
            {offlineMode && (
              <Callout tone="warning" title="Offline mode is on — Batch & Print is active">
                The button on each order is now Batch &amp; Print. Clicking it prints the ticket at the plant printer and queues the batch confirmation for Trackit and Deliveries. Switch this toggle off when the network is restored to return to digital tickets.
              </Callout>
            )}
            {!offlineMode && (
              <Callout tone="neutral" title="Normal mode — digital tickets">
                Batch Ticket sends the ticket digitally to Trackit and the driver in Deliveries as normal. If the network goes down, flip the Offline mode toggle above — the button changes to Batch &amp; Print.
              </Callout>
            )}

            {readyOrders.length > 0 && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform: "uppercase" as const, letterSpacing: "0.05em", fontSize: 11 }}>Ready to batch</Text>
                <Stack gap={4}>
                  {readyOrders.map(order => {
                    const isBatching = batchingId === order.id;
                    return (
                      <div key={order.id} style={{ border: `1px solid ${theme.stroke.primary}`, borderRadius: 8, padding: "14px 16px", background: theme.bg.elevated }}>
                        <Row align="center" gap={12}>
                          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                            <Row gap={10} align="center" wrap>
                              <Text weight="semibold">{order.orderNo}</Text>
                              <Text size="small" tone="secondary">Ticket #{order.ticketNo}</Text>
                              <Pill size="sm">Delivery {order.scheduledTime}</Pill>
                            </Row>
                            <Text size="small" tone="secondary">{order.customer} · {order.deliveryAddress}</Text>
                            <Row gap={16} wrap>
                              <Text size="small" tone="tertiary">{order.product}</Text>
                              <Text size="small" tone="tertiary">{order.volume} m3</Text>
                              <Text size="small" tone="tertiary">{order.vehicle}</Text>
                              <Text size="small" tone="tertiary">{order.driver}</Text>
                            </Row>
                          </Stack>
                          <Button
                            variant="primary"
                            disabled={isBatching || batchingId !== null}
                            onClick={() => handleAction(order)}
                          >
                            {isBatching ? "Processing..." : offlineMode ? "Batch & Print" : "Batch Ticket"}
                          </Button>
                        </Row>
                      </div>
                    );
                  })}
                </Stack>
              </Stack>
            )}

            {readyOrders.length === 0 && (
              <Callout tone="success" title="All orders batched">No orders are currently waiting to be batched.</Callout>
            )}

            {completedToday.length > 0 && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform: "uppercase" as const, letterSpacing: "0.05em", fontSize: 11 }}>Completed today</Text>
                <Stack gap={3}>
                  {completedToday.map(order => (
                    <div key={order.id} style={{ border: `1px solid ${theme.stroke.tertiary}`, borderRadius: 8, padding: "12px 16px", background: theme.fill.tertiary }}>
                      <Row align="center" gap={12}>
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Row gap={10} align="center" wrap>
                            <Text size="small" weight="semibold" tone="secondary">{order.orderNo}</Text>
                            <Text size="small" tone="tertiary">Ticket #{order.ticketNo}</Text>
                            {order.status === "batched"  && <Pill size="sm" active>Batched digitally {order.actionTime}</Pill>}
                            {order.status === "printed"  && <Pill size="sm">Printed {order.actionTime} — pending sync</Pill>}
                            {order.status === "synced"   && <Pill size="sm" active>Printed &amp; synced to Trackit</Pill>}
                          </Row>
                          <Text size="small" tone="tertiary">{order.customer} · {order.product} · {order.volume} m3 · {order.vehicle}</Text>
                        </Stack>
                        {order.status === "printed" && (
                          <Button variant="ghost" onClick={() => setPrintTarget(order)}>Reprint</Button>
                        )}
                      </Row>
                    </div>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        )}

        {/* ── PENDING SYNC ── */}
        {tab === "sync" && (
          <Stack gap={14}>
            <Stack gap={4}>
              <H2>Pending Sync</H2>
              <Text size="small" tone="secondary">
                Tickets printed in offline mode, queued for Trackit and Deliveries. When the network is restored, click Sync Now — all queued tickets will reconcile automatically.
              </Text>
            </Stack>

            {pendingSync.length === 0 && syncedOffline.length === 0 && (
              <Callout tone="success" title="Nothing pending">No offline tickets are waiting to sync. All tickets are up to date in Trackit and Deliveries.</Callout>
            )}

            {pendingSync.length > 0 && (
              <Stack gap={8}>
                <Callout tone="warning" title={`${pendingSync.length} ticket${pendingSync.length > 1 ? "s" : ""} queued — waiting for network`}>
                  These tickets were printed at the plant during the network outage. The driver has their physical copy. Sync when the network is restored.
                </Callout>
                <Stack gap={4}>
                  {pendingSync.map(order => (
                    <div key={order.id} style={{ border: `1px solid ${theme.stroke.secondary}`, borderRadius: 8, padding: "14px 16px", background: theme.bg.elevated }}>
                      <Row align="center" gap={12}>
                        <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
                          <Row gap={10} align="center" wrap>
                            <Text weight="semibold">{order.orderNo}</Text>
                            <Text size="small" tone="secondary">Ticket #{order.ticketNo}</Text>
                            <Pill size="sm">Printed {order.actionTime}</Pill>
                          </Row>
                          <Text size="small" tone="secondary">{order.customer} · {order.deliveryAddress}</Text>
                          <Text size="small" tone="tertiary">{order.product} · {order.volume} m3 · {order.vehicle} · {order.driver}</Text>
                        </Stack>
                        <Button variant="ghost" onClick={() => setPrintTarget(order)}>Reprint</Button>
                      </Row>
                    </div>
                  ))}
                </Stack>
                <Row justify="end">
                  <Button variant="primary" disabled={syncing} onClick={handleSyncAll}>
                    {syncing ? "Syncing..." : `Sync ${pendingSync.length} ticket${pendingSync.length > 1 ? "s" : ""} to Trackit & Deliveries`}
                  </Button>
                </Row>
              </Stack>
            )}

            {syncedOffline.length > 0 && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform: "uppercase" as const, letterSpacing: "0.05em", fontSize: 11 }}>Synced this session</Text>
                <Stack gap={3}>
                  {syncedOffline.map(order => (
                    <div key={order.id} style={{ border: `1px solid ${theme.stroke.tertiary}`, borderRadius: 8, padding: "12px 16px", background: theme.fill.tertiary }}>
                      <Row align="center" gap={12}>
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Row gap={10} align="center" wrap>
                            <Text size="small" weight="semibold" tone="secondary">{order.orderNo}</Text>
                            <Text size="small" tone="tertiary">Ticket #{order.ticketNo}</Text>
                            <Pill size="sm" active>Synced to Trackit &amp; Deliveries</Pill>
                          </Row>
                          <Text size="small" tone="tertiary">{order.customer} · {order.product} · {order.volume} m3 · {order.driver}</Text>
                        </Stack>
                      </Row>
                    </div>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        )}

        {/* ── TICKET TEMPLATE ── */}
        {tab === "template" && (
          <Stack gap={14}>
            <Stack gap={4}>
              <H2>Ticket Template</H2>
              <Text size="small" tone="secondary">Used for all offline Batch &amp; Print tickets. System fields are populated automatically from the dispatch order. Driver additionals are blank ruled lines completed by hand at site.</Text>
            </Stack>
            <Divider />
            <Grid columns={2} gap={20} align="start">
              <TemplateEditor template={template} onUpdate={setTemplate} />
              <Stack gap={10}>
                <Stack gap={3}><H3>Live Preview</H3><Text size="small" tone="secondary">Sample order data shown. System fields auto-populate at batch time.</Text></Stack>
                <TicketMockup template={template} />
                <Callout tone="neutral">Top section prints from the dispatch order automatically. Dashed section is blank — driver completes at site.</Callout>
                <Row gap={8} justify="end"><Button variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? "Saved" : "Save Template"}</Button></Row>
              </Stack>
            </Grid>
          </Stack>
        )}

      </Stack>

      {printTarget && <PrintModal    order={printTarget} template={template} onDone={handlePrinted} onClose={() => setPrintTarget(null)} />}
      {batchTarget  && <BatchConfirmModal order={batchTarget} onDone={handleBatched} onClose={() => setBatchTarget(null)} />}
    </Stack>
  );
}
