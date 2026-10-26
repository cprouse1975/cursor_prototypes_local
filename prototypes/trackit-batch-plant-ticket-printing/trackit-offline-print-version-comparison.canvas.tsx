import {
  useState,
  Stack, Row, Grid, Card, CardHeader, CardBody,
  H2, H3, Text, Divider,
  Button, Pill, Toggle, Checkbox, Select, TextInput,
  Stat, Callout,
  useHostTheme,
} from "cursor/canvas";

// ── Types ──────────────────────────────────────────────────────────────────

type Ver = "A" | "B";
type OrderStatus = "ready" | "batched" | "printed" | "synced";
interface BatchOrder {
  id: string; orderNo: string; ticketNo: string;
  customer: string; deliveryAddress: string; jobRef: string;
  product: string; volume: number; vehicle: string; driver: string;
  scheduledTime: string; status: OrderStatus; actionTime?: string;
}
interface SysField { id: string; label: string; enabled: boolean; required: boolean; }
interface AddField { id: string; label: string; enabled: boolean; custom: boolean; tall?: boolean; }
interface Tmpl {
  companyName: string; showContact: boolean; contactNumber: string;
  paperSize: "A4" | "A5"; copies: number;
  sysFields: SysField[]; addFields: AddField[];
}

// ── Data ───────────────────────────────────────────────────────────────────

const ORDERS: BatchOrder[] = [
  { id: "o1", orderNo: "ORD-18261", ticketNo: "002101", customer: "Acme Construction Pty Ltd", deliveryAddress: "47 Builder St, Southpark",   jobRef: "JOB-2026-0891", product: "32 MPa Normal Portland",  volume: 6.0, vehicle: "TRK-047", driver: "J. Morrison", scheduledTime: "11:00", status: "ready"   },
  { id: "o2", orderNo: "ORD-18262", ticketNo: "002102", customer: "Metro Civil Group",          deliveryAddress: "12 Highway Rd, Southpark",  jobRef: "JOB-2026-0904", product: "20 MPa General Purpose", volume: 4.5, vehicle: "TRK-031", driver: "A. Chen",    scheduledTime: "11:30", status: "ready"   },
  { id: "o3", orderNo: "ORD-18263", ticketNo: "002103", customer: "Eastside Developers",        deliveryAddress: "88 Commerce Ave, Eastgate", jobRef: "JOB-2026-0912", product: "40 MPa High Strength",   volume: 8.0, vehicle: "TRK-012", driver: "B. Taylor",  scheduledTime: "12:00", status: "ready"   },
  { id: "o4", orderNo: "ORD-18258", ticketNo: "002098", customer: "Westfield Builders",         deliveryAddress: "3 Trade Rd, Westfield",     jobRef: "JOB-2026-0880", product: "25 MPa General Purpose", volume: 5.5, vehicle: "TRK-019", driver: "R. Smith",   scheduledTime: "09:45", status: "batched", actionTime: "09:41" },
  { id: "o5", orderNo: "ORD-18255", ticketNo: "002097", customer: "Northside Civil",            deliveryAddress: "21 North Ave, Northside",   jobRef: "JOB-2026-0875", product: "32 MPa Normal Portland",  volume: 7.0, vehicle: "TRK-003", driver: "L. Jones",  scheduledTime: "09:00", status: "batched", actionTime: "08:57" },
];
const makeSysFields = (): SysField[] => [
  { id: "plant",     label: "Batch Plant",        enabled: true, required: false },
  { id: "date",      label: "Date",               enabled: true, required: false },
  { id: "batch_tm",  label: "Batch Time",         enabled: true, required: false },
  { id: "sched_del", label: "Scheduled Delivery", enabled: true, required: false },
  { id: "customer",  label: "Customer",           enabled: true, required: false },
  { id: "deliv_adr", label: "Delivery Address",   enabled: true, required: false },
  { id: "job_ref",   label: "Job Reference",      enabled: true, required: false },
  { id: "product",   label: "Product / Mix",      enabled: true, required: false },
  { id: "volume",    label: "Volume (m3)",        enabled: true, required: false },
  { id: "vehicle",   label: "Vehicle",            enabled: true, required: false },
  { id: "driver",    label: "Driver",             enabled: true, required: false },
];
const makeAddFields = (): AddField[] => [
  { id: "arr_time",  label: "Actual Arrival Time",          enabled: true, custom: false },
  { id: "dep_time",  label: "Actual Departure Time",        enabled: true, custom: false },
  { id: "slump",     label: "Slump at Delivery (mm)",       enabled: true, custom: false },
  { id: "water",     label: "Site Additions - Water (L)",   enabled: true, custom: false },
  { id: "additions", label: "Site Additions - Other",       enabled: true, custom: false },
  { id: "act_vol",   label: "Actual Volume Delivered (m3)", enabled: true, custom: false },
  { id: "site_rep",  label: "Site Contact / Rep",           enabled: true, custom: false },
  { id: "cust_sig",  label: "Customer Signature",           enabled: true, custom: false, tall: true },
  { id: "drv_sig",   label: "Driver Signature",             enabled: true, custom: false, tall: true },
];
const INIT_TMPL: Tmpl = {
  companyName: "Acme Concrete Group", showContact: true, contactNumber: "1300 000 000",
  paperSize: "A4", copies: 2, sysFields: makeSysFields(), addFields: makeAddFields(),
};
const PAPER_OPTS = [{ value: "A4", label: "A4" }, { value: "A5", label: "A5" }];
const COPY_OPTS  = [{ value: "1", label: "1 copy" }, { value: "2", label: "2 copies" }, { value: "3", label: "3 copies" }];

// Blank lines already on the existing standard delivery ticket (Version A)
const STD_BLANKS = [
  { label: "Actual Arrival Time",    tall: false },
  { label: "Actual Departure Time",  tall: false },
  { label: "Slump at Delivery (mm)", tall: false },
  { label: "Site Additions",         tall: false },
  { label: "Customer Signature",     tall: true  },
  { label: "Driver Signature",       tall: true  },
];

function vals(order?: BatchOrder): Record<string, string> {
  const now = new Date();
  return {
    plant:     "Southpark Ready Mix",
    date:      now.toLocaleDateString("en-AU"),
    batch_tm:  now.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
    sched_del: order?.scheduledTime ?? "11:00",
    customer:  order?.customer ?? "Acme Construction Pty Ltd",
    deliv_adr: order?.deliveryAddress ?? "47 Builder St, Southpark",
    job_ref:   order?.jobRef ?? "JOB-2026-0891",
    product:   order?.product ?? "32 MPa Normal Portland",
    volume:    order ? `${order.volume} m3` : "6.0 m3",
    vehicle:   order?.vehicle ?? "TRK-047",
    driver:    order?.driver ?? "J. Morrison",
  };
}

// ── Version A ticket: standard existing format ─────────────────────────────
// No separate "Driver Additionals" section — blank lines are already part
// of the standard docket the driver has always completed by hand.

function StdTicket({ order }: { order?: BatchOrder }) {
  const theme = useHostTheme();
  const v = vals(order);
  return (
    <div style={{ border: `1px solid ${theme.stroke.secondary}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: theme.fill.secondary, borderBottom: `2px solid ${theme.stroke.primary}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack gap={1}>
          <Text weight="bold" size="small">Acme Concrete Group</Text>
          <Text size="small" tone="tertiary">1300 000 000</Text>
          <Text size="small" tone="tertiary">DELIVERY TICKET</Text>
        </Stack>
        <Stack gap={1} style={{ alignItems: "flex-end" }}>
          <Text weight="bold">#{order?.ticketNo ?? "002101"}</Text>
          <Text size="small" tone="secondary">{order?.orderNo ?? "ORD-18261"}</Text>
        </Stack>
      </div>
      <div style={{ padding: "10px 14px", background: theme.bg.elevated }}>
        <Stack gap={4}>
          {makeSysFields().map(f => (
            <Row key={f.id} justify="space-between" align="center">
              <Text size="small" tone="secondary" style={{ minWidth: 160 }}>{f.label}</Text>
              <Text size="small" weight="semibold">{v[f.id]}</Text>
            </Row>
          ))}
        </Stack>
      </div>
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${theme.stroke.tertiary}`, background: theme.bg.elevated }}>
        <Stack gap={6}>
          {STD_BLANKS.map(f => (
            <Row key={f.label} justify="space-between" align="center">
              <Text size="small" tone="secondary" style={{ minWidth: 160, flexShrink: 0 }}>{f.label}</Text>
              <div style={{ flex: 1, marginLeft: 10, borderBottom: `1px solid ${theme.stroke.secondary}`, height: f.tall ? 26 : 14 }} />
            </Row>
          ))}
        </Stack>
      </div>
      <div style={{ padding: "5px 14px", borderTop: `1px solid ${theme.stroke.tertiary}`, background: theme.fill.secondary }}>
        <Text size="small" tone="tertiary" style={{ textAlign: "center", fontSize: 9, letterSpacing: "0.05em" }}>
          PRINTED COPY · EXISTING TEMPLATE · QUEUED FOR TRACKIT SYNC
        </Text>
      </div>
    </div>
  );
}

// ── Version B ticket: custom offline template ──────────────────────────────
// Explicit "Driver Additionals" section (dashed separator) configured once
// by the admin. Used automatically whenever offline mode is active.

function CustomTicket({ tmpl, order }: { tmpl: Tmpl; order?: BatchOrder }) {
  const theme = useHostTheme();
  const v = vals(order);
  const sysF = tmpl.sysFields.filter(f => f.enabled);
  const addF = tmpl.addFields.filter(f => f.enabled);
  return (
    <div style={{ border: `1px solid ${theme.stroke.secondary}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: theme.fill.secondary, borderBottom: `2px solid ${theme.stroke.primary}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack gap={1}>
          <Text weight="bold" size="small">{tmpl.companyName || "Company Name"}</Text>
          {tmpl.showContact && <Text size="small" tone="tertiary">{tmpl.contactNumber}</Text>}
          <Text size="small" tone="tertiary">DELIVERY TICKET</Text>
        </Stack>
        <Stack gap={1} style={{ alignItems: "flex-end" }}>
          <Text weight="bold">#{order?.ticketNo ?? "002101"}</Text>
          <Text size="small" tone="secondary">{order?.orderNo ?? "ORD-18261"}</Text>
        </Stack>
      </div>
      <div style={{ padding: "10px 14px", background: theme.bg.elevated }}>
        <Text size="small" weight="semibold" tone="tertiary" style={{ display: "block", marginBottom: 8, fontSize: 10, letterSpacing: "0.06em" }}>SYSTEM DATA — AUTO-POPULATED FROM PLATFORM</Text>
        <Stack gap={4}>{sysF.map(f => (
          <Row key={f.id} justify="space-between" align="center">
            <Text size="small" tone="secondary" style={{ minWidth: 160 }}>{f.label}</Text>
            <Text size="small" weight="semibold">{v[f.id] ?? ""}</Text>
          </Row>
        ))}</Stack>
      </div>
      {addF.length > 0 && (
        <div style={{ padding: "10px 14px", borderTop: `2px dashed ${theme.stroke.secondary}`, background: theme.fill.tertiary }}>
          <Text size="small" weight="semibold" tone="tertiary" style={{ display: "block", marginBottom: 8, fontSize: 10, letterSpacing: "0.06em" }}>DRIVER ADDITIONALS — COMPLETE BY HAND AT SITE</Text>
          <Stack gap={6}>{addF.map(f => (
            <Row key={f.id} justify="space-between" align="center">
              <Text size="small" tone="secondary" style={{ minWidth: 160, flexShrink: 0 }}>{f.label}</Text>
              <div style={{ flex: 1, marginLeft: 10, borderBottom: `1px solid ${theme.stroke.secondary}`, height: f.tall ? 26 : 14 }} />
            </Row>
          ))}</Stack>
        </div>
      )}
      <div style={{ padding: "5px 14px", borderTop: `1px solid ${theme.stroke.tertiary}`, background: theme.fill.secondary }}>
        <Text size="small" tone="tertiary" style={{ textAlign: "center", fontSize: 9, letterSpacing: "0.05em" }}>
          OFFLINE PRINT · {tmpl.paperSize} · {tmpl.copies} {tmpl.copies > 1 ? "COPIES" : "COPY"} · QUEUED FOR TRACKIT SYNC
        </Text>
      </div>
    </div>
  );
}

// ── Print Modal ─────────────────────────────────────────────────────────────

function PrintModal({ ver, order, tmpl, onDone, onClose }: {
  ver: Ver; order: BatchOrder; tmpl: Tmpl; onDone: () => void; onClose: () => void;
}) {
  const theme = useHostTheme();
  const [done, setDone] = useState(false);
  const overlay = { position: "fixed" as const, inset: 0 as const, zIndex: 100, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" as const };
  const box = { background: theme.bg.elevated, border: `1px solid ${theme.stroke.secondary}`, borderRadius: 12, maxWidth: 520, width: "100%", margin: "auto" };

  if (done) {
    return (
      <div style={overlay}>
        <div style={{ ...box, padding: 32, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16, textAlign: "center" as const }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: theme.fill.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={theme.accent.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <Stack gap={3} style={{ alignItems: "center" }}>
            <Text weight="semibold">Ticket #{order.ticketNo} printed</Text>
            <Text size="small" tone="secondary">
              {ver === "A" ? "Existing delivery ticket format" : `Custom offline template · ${tmpl.copies} ${tmpl.copies > 1 ? "copies" : "copy"} · ${tmpl.paperSize}`}
            </Text>
          </Stack>
          <Stack gap={7} style={{ width: "100%", maxWidth: 340 }}>
            {[
              { label: "Ticket printed at plant printer", note: "",                                           done: true  },
              { label: "Batch confirmed in system",       note: "",                                           done: true  },
              { label: "Queued for Trackit sync",         note: "Will send when network is restored",        done: false },
              { label: "Queued for Deliveries sync",      note: "Driver record will reconcile on reconnect", done: false },
            ].map(({ label, note, done: d }, i) => (
              <Row key={i} align="start" gap={10}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: d ? theme.accent.primary : theme.fill.tertiary, border: d ? "none" : `1px solid ${theme.stroke.secondary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  {d ? <svg width={10} height={10} viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke={theme.text.onAccent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                     : <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.stroke.secondary }} />}
                </div>
                <Stack gap={1}>
                  <Text size="small" tone={d ? "primary" : "tertiary"}>{label}</Text>
                  {note ? <Text size="small" tone="tertiary" style={{ fontSize: 11 }}>{note}</Text> : null}
                </Stack>
              </Row>
            ))}
          </Stack>
          <Text size="small" tone="secondary">
            {ver === "A"
              ? "Driver fills in arrival time, departure, slump etc. by hand — fields are already on the standard ticket."
              : "Driver completes the Additionals section at site. Go to Pending Sync when the network is restored."}
          </Text>
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
            <Text weight="semibold">{ver === "A" ? "Print & Batch" : "Batch & Print"} — {order.orderNo}</Text>
            <Text size="small" tone="secondary">{order.customer} · {order.volume} m3 · {order.product}</Text>
          </Stack>
          <Button variant="ghost" onClick={onClose}>
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
          </Button>
        </div>
        <Stack gap={14} style={{ padding: "14px 18px 18px" }}>
          {ver === "A" ? (
            <Callout tone="warning" title="Offline mode — printing existing delivery ticket">
              The standard delivery ticket prints with all order data pre-filled. Driver writes arrival time, departure time, slump etc. in the blank fields already on the ticket — same as paper dockets today. No new template needed.
            </Callout>
          ) : (
            <Callout tone="warning" title="Offline mode — printing custom offline template">
              System data auto-populates from the dispatch order. Driver completes the configured Driver Additionals section at site. Ticket data queues for Trackit and Deliveries sync on reconnect.
            </Callout>
          )}
          {ver === "A" ? <StdTicket order={order} /> : <CustomTicket tmpl={tmpl} order={order} />}
          <Row gap={8} justify="end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => setDone(true)}>
              {ver === "A" ? "Confirm Print & Batch" : "Confirm Batch & Print"}
            </Button>
          </Row>
        </Stack>
      </div>
    </div>
  );
}

// ── Batch Confirm Modal (online mode) ──────────────────────────────────────

function BatchModal({ order, onDone, onClose }: { order: BatchOrder; onDone: () => void; onClose: () => void }) {
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
            <Text weight="semibold">Batch Ticket — {order.orderNo}</Text>
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

// ── Template Editor (Version B only) ──────────────────────────────────────

function TmplEditor({ tmpl, onUpdate }: { tmpl: Tmpl; onUpdate: (t: Tmpl) => void }) {
  const [newLabel, setNewLabel] = useState("");
  const up = (p: Partial<Tmpl>) => onUpdate({ ...tmpl, ...p });
  const toggleSys = (id: string) => up({ sysFields: tmpl.sysFields.map(f => f.id === id && !f.required ? { ...f, enabled: !f.enabled } : f) });
  const toggleAdd = (id: string) => up({ addFields: tmpl.addFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f) });
  const addField  = () => {
    if (!newLabel.trim()) return;
    up({ addFields: [...tmpl.addFields, { id: `c_${Date.now()}`, label: newLabel.trim(), enabled: true, custom: true }] });
    setNewLabel("");
  };
  return (
    <Stack gap={10}>
      <Card collapsible defaultOpen>
        <CardHeader>Branding &amp; Layout</CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Stack gap={4}><Text size="small" weight="semibold">Company Name on Ticket</Text><TextInput value={tmpl.companyName} onChange={v => up({ companyName: v })} placeholder="As printed on the ticket" /></Stack>
            <Row gap={8} align="center"><Toggle size="sm" checked={tmpl.showContact} onChange={v => up({ showContact: v })} /><Text size="small">Show contact number</Text></Row>
            {tmpl.showContact && <TextInput value={tmpl.contactNumber} onChange={v => up({ contactNumber: v })} placeholder="e.g. 1300 000 000" />}
            <Row gap={12}>
              <Stack gap={4} style={{ flex: 1 }}><Text size="small" weight="semibold">Paper Size</Text><Select value={tmpl.paperSize} onChange={v => up({ paperSize: v as "A4" | "A5" })} options={PAPER_OPTS} /></Stack>
              <Stack gap={4} style={{ flex: 1 }}><Text size="small" weight="semibold">Copies</Text><Select value={String(tmpl.copies)} onChange={v => up({ copies: Number(v) })} options={COPY_OPTS} /></Stack>
            </Row>
          </Stack>
        </CardBody>
      </Card>
      <Card collapsible defaultOpen={false}>
        <CardHeader>System Fields (auto-populated)</CardHeader>
        <CardBody>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Filled automatically from the dispatch order at batch time.</Text>
            <Divider style={{ margin: "4px 0" }} />
            {tmpl.sysFields.map(f => (
              <Row key={f.id} align="center" gap={10}>
                <Checkbox checked={f.enabled} onChange={_ => toggleSys(f.id)} disabled={f.required} />
                <Text size="small" style={{ flex: 1 }}>{f.label}</Text>
                {f.required && <Pill size="sm">Always shown</Pill>}
              </Row>
            ))}
          </Stack>
        </CardBody>
      </Card>
      <Card collapsible defaultOpen={false}>
        <CardHeader>Driver Additionals (blank — completed at site)</CardHeader>
        <CardBody>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Blank ruled lines the driver completes by hand at the delivery site. This is the configurable section that makes Version B different from Version A.</Text>
            <Divider style={{ margin: "4px 0" }} />
            {tmpl.addFields.map(f => (
              <Row key={f.id} align="center" gap={10}>
                <Checkbox checked={f.enabled} onChange={_ => toggleAdd(f.id)} />
                <Text size="small" style={{ flex: 1 }}>{f.label}</Text>
                {f.custom && <Button variant="ghost" onClick={() => up({ addFields: tmpl.addFields.filter(a => a.id !== f.id) })}>Remove</Button>}
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
  const [ver, setVer] = useState<Ver>("A");

  // Separate state per version so switching preserves each version's demo state
  const [compA, setCompA] = useState(false);
  const [offA,  setOffA]  = useState(false);
  const [ordA,  setOrdA]  = useState<BatchOrder[]>(ORDERS);
  const [tabA,  setTabA]  = useState("config");

  const [compB, setCompB] = useState(false);
  const [offB,  setOffB]  = useState(false);
  const [ordB,  setOrdB]  = useState<BatchOrder[]>(ORDERS);
  const [tabB,  setTabB]  = useState("config");
  const [tmpl,  setTmpl]  = useState<Tmpl>(INIT_TMPL);
  const [saved, setSaved] = useState(false);

  const [printTarget, setPrintTarget] = useState<BatchOrder | null>(null);
  const [batchTarget, setBatchTarget] = useState<BatchOrder | null>(null);
  const [batchingId,  setBatchingId]  = useState<string | null>(null);
  const [syncing,     setSyncing]     = useState(false);

  const companyOn = ver === "A" ? compA : compB;
  const offlineOn = ver === "A" ? offA  : offB;
  const orders    = ver === "A" ? ordA  : ordB;
  const setOrders = ver === "A" ? setOrdA : setOrdB;
  const tab       = ver === "A" ? tabA  : tabB;
  const setTab    = ver === "A" ? setTabA : setTabB;

  function handleCompany(v: boolean) {
    if (ver === "A") { setCompA(v); setOffA(v); }
    else             { setCompB(v); setOffB(v); }
  }
  function handleOffline(v: boolean) {
    if (ver === "A") setOffA(v); else setOffB(v);
  }

  const nowStr = () => new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });

  function handleAction(order: BatchOrder) {
    setBatchingId(order.id);
    setTimeout(() => {
      setBatchingId(null);
      if (offlineOn) setPrintTarget(order);
      else           setBatchTarget(order);
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

  const readyOrders    = orders.filter(o => o.status === "ready");
  const completedToday = orders.filter(o => o.status === "batched" || o.status === "printed" || o.status === "synced");
  const pendingSync    = orders.filter(o => o.status === "printed");
  const syncedOffline  = orders.filter(o => o.status === "synced");

  const modeBarBg     = offlineOn ? "#7a2b2b18" : theme.bg.editor;
  const modeBarBorder = offlineOn ? "#c0393922"  : theme.stroke.tertiary;

  const TAB_A = [
    { value: "queue",  label: "Batch Queue"    },
    { value: "sync",   label: "Pending Sync"   },
    { value: "config", label: "Company Config" },
  ];
  const TAB_B = [
    { value: "queue",    label: "Batch Queue"     },
    { value: "sync",     label: "Pending Sync"    },
    { value: "template", label: "Ticket Template" },
    { value: "config",   label: "Company Config"  },
  ];
  const tabOpts = ver === "A" ? TAB_A : TAB_B;

  return (
    <Stack gap={0} style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* ── Version selector ── */}
      <div style={{ padding: "12px 28px", background: theme.fill.secondary, borderBottom: `1px solid ${theme.stroke.secondary}`, display: "flex", alignItems: "center", gap: 14 }}>
        <Text size="small" weight="semibold" tone="secondary">Compare approach:</Text>
        <Row gap={6}>
          <Pill active={ver === "A"} onClick={() => { setVer("A"); setPrintTarget(null); setBatchTarget(null); }}>A — Basic MVP</Pill>
          <Pill active={ver === "B"} onClick={() => { setVer("B"); setPrintTarget(null); setBatchTarget(null); }}>B — With Template Setup</Pill>
        </Row>
      </div>

      {/* ── Version description ── */}
      <div style={{ padding: "14px 28px", background: ver === "A" ? theme.bg.elevated : theme.fill.tertiary, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
        {ver === "A" ? (
          <Stack gap={3}>
            <Row gap={8} align="center">
              <Pill size="sm" active>Version A</Pill>
              <Text weight="semibold">Basic MVP — no new template required</Text>
            </Row>
            <Text size="small" tone="secondary">
              Uses the existing delivery ticket format. When offline mode is active, Trackit prints the standard docket with order data pre-filled. The driver writes arrival time, departure time, slump etc. in the blank lines that are already part of the existing ticket — exactly as they do with paper dockets today. Company admin enables the feature with one toggle. No template configuration needed.
            </Text>
          </Stack>
        ) : (
          <Stack gap={3}>
            <Row gap={8} align="center">
              <Pill size="sm">Version B</Pill>
              <Text weight="semibold">With custom offline template — configured once, used automatically</Text>
            </Row>
            <Text size="small" tone="secondary">
              An admin configures a custom offline ticket template in Company Config (set up once). When offline mode is active Trackit uses the configured template automatically — system data pre-populates at the top, and a clearly labelled "Driver Additionals" section (blank ruled lines) is printed below for the driver to complete at site. Fields, layout, paper size and copies are all configurable.
            </Text>
          </Stack>
        )}
      </div>

      {/* ── Mode bar ── */}
      <div style={{ padding: "14px 28px", background: modeBarBg, borderBottom: `1px solid ${modeBarBorder}`, display: "flex", alignItems: "center", gap: 14 }}>
        <Stack gap={1} style={{ flex: 1 }}>
          <Row gap={10} align="center">
            <Text weight="semibold">Southpark Ready Mix — Batch Queue</Text>
            {!companyOn && <Pill size="sm">Digital tickets only</Pill>}
            {companyOn && !offlineOn && <Pill size="sm" active>Online — digital tickets</Pill>}
            {companyOn && offlineOn  && <Pill size="sm">{ver === "A" ? "Offline — printing existing template" : "Offline — Batch & Print active"}</Pill>}
          </Row>
          <Text size="small" tone="secondary">
            {!companyOn
              ? "Offline print fallback is not enabled for this company."
              : offlineOn
                ? ver === "A"
                  ? "Offline mode. Print & Batch is active — existing delivery ticket prints at the plant and queues for sync."
                  : "Offline mode. Batch & Print is active — custom offline template prints at the plant and queues for sync."
                : "Network restored. Batch Ticket sends the ticket digitally to Trackit and the driver in Deliveries."}
          </Text>
        </Stack>
        {companyOn ? (
          <Stack gap={3} style={{ alignItems: "flex-end", flexShrink: 0 }}>
            <Text size="small" tone="secondary">Offline mode</Text>
            <Toggle checked={offlineOn} onChange={handleOffline} />
          </Stack>
        ) : (
          <Button variant="secondary" onClick={() => setTab("config")}>Configure in Company Config</Button>
        )}
      </div>

      <Stack gap={20} style={{ padding: "24px 28px" }}>

        <Row gap={20} wrap>
          <Stat value={readyOrders.length}   label="Ready to batch"           tone={readyOrders.length > 0 ? "warning" : undefined} />
          <Stat value={orders.filter(o => o.status === "batched").length} label="Batched digitally today" tone="success" />
          <Stat value={pendingSync.length}   label="Printed — pending sync"    tone={pendingSync.length > 0 ? "danger" : undefined} />
          <Stat value={syncedOffline.length} label="Offline tickets synced" />
        </Row>

        <Row gap={6} wrap>
          {tabOpts.map(t => (
            <Pill key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
              {t.value === "sync" && pendingSync.length > 0 ? `Pending Sync (${pendingSync.length})` : t.label}
            </Pill>
          ))}
        </Row>
        <Divider />

        {/* ── BATCH QUEUE ── */}
        {tab === "queue" && (
          <Stack gap={14}>
            {!companyOn && (
              <Callout tone="neutral" title="Offline print fallback is not enabled">
                Go to Company Config to turn it on.
              </Callout>
            )}
            {companyOn && offlineOn && (
              <Callout tone="warning" title={ver === "A" ? "Offline mode — Print & Batch active" : "Offline mode — Batch & Print active"}>
                {ver === "A"
                  ? "The button changes to Print & Batch. Clicking it prints the existing delivery ticket at the plant printer and queues the batch for Trackit and Deliveries sync."
                  : "The button changes to Batch & Print. Clicking it prints the custom offline template at the plant printer and queues the batch for Trackit and Deliveries sync."}
              </Callout>
            )}
            {companyOn && !offlineOn && (
              <Callout tone="neutral" title="Network restored — digital tickets active">
                Batch Ticket sends the ticket digitally to Trackit and the driver in Deliveries as normal.
              </Callout>
            )}
            {readyOrders.length > 0 && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform: "uppercase" as const, letterSpacing: "0.05em", fontSize: 11 }}>Ready to batch</Text>
                <Stack gap={4}>
                  {readyOrders.map(order => {
                    const busy = batchingId === order.id;
                    const btnLabel = busy
                      ? "Processing..."
                      : (companyOn && offlineOn)
                        ? (ver === "A" ? "Print & Batch" : "Batch & Print")
                        : "Batch Ticket";
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
                          <Button variant="primary" disabled={busy || batchingId !== null} onClick={() => handleAction(order)}>
                            {btnLabel}
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
                            {order.status === "batched" && <Pill size="sm" active>Batched digitally {order.actionTime}</Pill>}
                            {order.status === "printed" && <Pill size="sm">Printed {order.actionTime} — pending sync</Pill>}
                            {order.status === "synced"  && <Pill size="sm" active>Printed &amp; synced to Trackit</Pill>}
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
              <Text size="small" tone="secondary">Tickets printed in offline mode, queued for Trackit and Deliveries. Click Sync Now when the network is restored.</Text>
            </Stack>
            {pendingSync.length === 0 && syncedOffline.length === 0 && (
              <Callout tone="success" title="Nothing pending">No offline tickets are waiting to sync.</Callout>
            )}
            {pendingSync.length > 0 && (
              <Stack gap={8}>
                <Callout tone="warning" title={`${pendingSync.length} ticket${pendingSync.length > 1 ? "s" : ""} queued — waiting for network`}>
                  These tickets were printed at the plant during the network outage. The driver has their physical copy.
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

        {/* ── TICKET TEMPLATE (Version B only) ── */}
        {tab === "template" && ver === "B" && (
          <Stack gap={14}>
            <Stack gap={4}>
              <H2>Ticket Template</H2>
              <Text size="small" tone="secondary">
                Configure the custom offline print template. Used automatically whenever offline mode is active. System fields auto-populate from the dispatch order — the Driver Additionals section below is what the driver fills in by hand at site.
              </Text>
            </Stack>
            <Divider />
            <Grid columns={2} gap={20} align="start">
              <TmplEditor tmpl={tmpl} onUpdate={setTmpl} />
              <Stack gap={10}>
                <Stack gap={3}><H3>Live Preview</H3><Text size="small" tone="secondary">Sample order data. System fields auto-populate at batch time.</Text></Stack>
                <CustomTicket tmpl={tmpl} />
                <Callout tone="neutral">System data section (top) prints automatically. Dashed section below is blank — driver completes at site.</Callout>
                <Row gap={8} justify="end"><Button variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? "Saved" : "Save Template"}</Button></Row>
              </Stack>
            </Grid>
          </Stack>
        )}

        {/* ── COMPANY CONFIG ── */}
        {tab === "config" && (
          <Stack gap={16}>
            <Stack gap={4}>
              <H2>Company Config</H2>
              <Text size="small" tone="secondary">Admin settings for Acme Concrete Group — applies to all plants company-wide.</Text>
            </Stack>
            <Divider />

            <Card>
              <CardBody>
                <Stack gap={12}>
                  <Row justify="space-between" align="center">
                    <Stack gap={1}>
                      <Text weight="semibold">Offline Print Fallback</Text>
                      <Text size="small" tone="secondary">Applies to all plants · Acme Concrete Group</Text>
                    </Stack>
                    <Row gap={8} align="center">
                      <Text size="small" tone={companyOn ? "primary" : "secondary"}>{companyOn ? "Enabled" : "Disabled"}</Text>
                      <Toggle checked={companyOn} onChange={handleCompany} />
                    </Row>
                  </Row>
                  <Divider />
                  <Text size="small" tone="secondary">
                    {ver === "A"
                      ? "When enabled, an Offline mode toggle appears in the Batch Queue. During a network outage operators flip it to Print & Batch — the existing delivery ticket prints at the plant with all order data pre-filled. The driver writes times and other fields in the blank lines already on the ticket. No new template required."
                      : "When enabled, an Offline mode toggle appears in the Batch Queue. During a network outage operators flip it to Batch & Print — the configured offline template prints at the plant with system data pre-filled. Driver completes the Additionals section at site. All data queues for sync."}
                  </Text>
                  {companyOn ? (
                    <Callout tone="success" title="Enabled — offline mode is available to batch operators">
                      {ver === "A"
                        ? "Go to the Batch Queue to see the Print & Batch button. The existing delivery ticket will print when offline mode is on."
                        : "Go to the Batch Queue to see the Batch & Print button. Configure the offline template in the Ticket Template tab."}
                    </Callout>
                  ) : (
                    <Callout tone="neutral" title="Disabled — digital tickets only">
                      Flip the toggle to enable the offline print fallback for all plants.
                    </Callout>
                  )}
                </Stack>
              </CardBody>
            </Card>

            {companyOn && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform: "uppercase" as const, letterSpacing: "0.05em", fontSize: 11 }}>Next steps</Text>
                <Card>
                  <CardBody>
                    <Row align="center" gap={16}>
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Text size="small" weight="semibold">Batch Queue</Text>
                        <Text size="small" tone="secondary">
                          {ver === "A"
                            ? "See the Print & Batch button — uses the existing delivery ticket format."
                            : "See the Batch & Print button — uses the configured offline template."}
                        </Text>
                      </Stack>
                      <Button variant="secondary" onClick={() => setTab("queue")}>Go to Batch Queue</Button>
                    </Row>
                  </CardBody>
                </Card>
                {ver === "B" && (
                  <Card>
                    <CardBody>
                      <Row align="center" gap={16}>
                        <Stack gap={2} style={{ flex: 1 }}>
                          <Text size="small" weight="semibold">Ticket Template</Text>
                          <Text size="small" tone="secondary">Configure the offline template — fields, branding, paper size, copies, and the Driver Additionals section.</Text>
                        </Stack>
                        <Button variant="secondary" onClick={() => setTab("template")}>Configure Template</Button>
                      </Row>
                    </CardBody>
                  </Card>
                )}
              </Stack>
            )}

            <Card collapsible defaultOpen={false}>
              <CardHeader>How Version {ver} works</CardHeader>
              <CardBody>
                <Stack gap={10}>
                  {ver === "A" ? (
                    <>
                      <Stack gap={3}>
                        <Text size="small" weight="semibold">What prints</Text>
                        <Text size="small" tone="secondary">The existing delivery ticket — same format as the standard digital ticket. All order data (customer, product, volume, vehicle etc.) pre-populates automatically. Blank lines for arrival time, departure time, slump, signatures are already part of the standard form.</Text>
                      </Stack>
                      <Divider />
                      <Stack gap={3}>
                        <Text size="small" weight="semibold">What the driver does</Text>
                        <Text size="small" tone="secondary">Fills in the blank fields by hand at the delivery site — exactly as they would with a traditional paper docket. No new process to learn.</Text>
                      </Stack>
                      <Divider />
                      <Stack gap={3}>
                        <Text size="small" weight="semibold">What admin sets up</Text>
                        <Text size="small" tone="secondary">One toggle in Company Config. Nothing else — no template configuration required. Lowest possible setup effort.</Text>
                      </Stack>
                    </>
                  ) : (
                    <>
                      <Stack gap={3}>
                        <Text size="small" weight="semibold">What prints</Text>
                        <Text size="small" tone="secondary">A configured custom offline template. The top section (system data) auto-populates from the dispatch order. A separate "Driver Additionals" section (dashed border) contains blank ruled lines for the driver to complete at site. Fields, layout, paper size and number of copies are all configurable.</Text>
                      </Stack>
                      <Divider />
                      <Stack gap={3}>
                        <Text size="small" weight="semibold">What the driver does</Text>
                        <Text size="small" tone="secondary">Fills in the Driver Additionals section at the delivery site. The clear separation between auto-populated data and manual entries makes it obvious what needs to be completed.</Text>
                      </Stack>
                      <Divider />
                      <Stack gap={3}>
                        <Text size="small" weight="semibold">What admin sets up</Text>
                        <Text size="small" tone="secondary">Enable the toggle in Company Config, then configure the offline template once in the Ticket Template tab — choose which system fields to include, add or remove Driver Additionals fields, set paper size and copies. The template is used automatically from then on.</Text>
                      </Stack>
                    </>
                  )}
                  <Divider />
                  <Stack gap={3}>
                    <Text size="small" weight="semibold">Sync on reconnect (both versions)</Text>
                    <Text size="small" tone="secondary">When the network is restored, operators go to Pending Sync and click Sync Now. All queued tickets reconcile automatically with Trackit and Deliveries. The offline mode toggle is then flipped off to return to digital tickets.</Text>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        )}

      </Stack>

      {printTarget && <PrintModal ver={ver} order={printTarget} tmpl={tmpl} onDone={handlePrinted} onClose={() => setPrintTarget(null)} />}
      {batchTarget  && <BatchModal order={batchTarget} onDone={handleBatched} onClose={() => setBatchTarget(null)} />}
    </Stack>
  );
}
