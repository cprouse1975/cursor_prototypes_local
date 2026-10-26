import {
  useState,
  Stack, Row, Card, CardHeader, CardBody,
  H2, Text, Divider,
  Button, Pill, Toggle, Select,
  Stat, Callout,
  useHostTheme,
} from "cursor/canvas";

// ── Types ──────────────────────────────────────────────────────────────────

type Ver = "A" | "B";
type OrderStatus = "ready" | "dispatched" | "printed" | "synced";

interface DispatchOrder {
  id: string; orderNo: string; ticketNo: string;
  customer: string; deliveryAddress: string; jobRef: string;
  product: string; volume: number; vehicle: string; driver: string;
  scheduledTime: string; status: OrderStatus; actionTime?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────

const ORDERS: DispatchOrder[] = [
  { id:"o1", orderNo:"ORD-18261", ticketNo:"002101", customer:"Acme Construction Pty Ltd", deliveryAddress:"47 Builder St, Southpark",   jobRef:"JOB-2026-0891", product:"32 MPa Normal Portland",  volume:6.0, vehicle:"TRK-047", driver:"J. Morrison", scheduledTime:"11:00", status:"ready"              },
  { id:"o2", orderNo:"ORD-18262", ticketNo:"002102", customer:"Metro Civil Group",          deliveryAddress:"12 Highway Rd, Southpark",  jobRef:"JOB-2026-0904", product:"20 MPa General Purpose", volume:4.5, vehicle:"TRK-031", driver:"A. Chen",    scheduledTime:"11:30", status:"ready"              },
  { id:"o3", orderNo:"ORD-18263", ticketNo:"002103", customer:"Eastside Developers",        deliveryAddress:"88 Commerce Ave, Eastgate", jobRef:"JOB-2026-0912", product:"40 MPa High Strength",   volume:8.0, vehicle:"TRK-012", driver:"B. Taylor",  scheduledTime:"12:00", status:"ready"              },
  { id:"o4", orderNo:"ORD-18258", ticketNo:"002098", customer:"Westfield Builders",         deliveryAddress:"3 Trade Rd, Westfield",     jobRef:"JOB-2026-0880", product:"25 MPa General Purpose", volume:5.5, vehicle:"TRK-019", driver:"R. Smith",   scheduledTime:"09:45", status:"dispatched", actionTime:"09:41" },
  { id:"o5", orderNo:"ORD-18255", ticketNo:"002097", customer:"Northside Civil",            deliveryAddress:"21 North Ave, Northside",   jobRef:"JOB-2026-0875", product:"32 MPa Normal Portland",  volume:7.0, vehicle:"TRK-003", driver:"L. Jones",  scheduledTime:"09:00", status:"dispatched", actionTime:"08:57" },
];

const PRINTER_OPTS = [
  { value:"hp_lj",  label:"HP LaserJet Pro M404n — Main Office"  },
  { value:"hp_mfp", label:"HP LaserJet MFP M428 — Dispatch Desk" },
  { value:"bro_hl", label:"Brother HL-L2350DW — Plant Floor"     },
  { value:"none",   label:"Not configured"                        },
];

// ── Ticket data ─────────────────────────────────────────────────────────────

function sysVals(order?: DispatchOrder): [string, string][] {
  const now = new Date();
  return [
    ["Batch Plant",        "Southpark Ready Mix"],
    ["Date",               now.toLocaleDateString("en-AU")],
    ["Batch Time",         now.toLocaleTimeString("en-AU", { hour:"2-digit", minute:"2-digit" })],
    ["Scheduled Delivery", order?.scheduledTime ?? "11:00"],
    ["Customer",           order?.customer ?? "Acme Construction Pty Ltd"],
    ["Delivery Address",   order?.deliveryAddress ?? "47 Builder St, Southpark"],
    ["Job Reference",      order?.jobRef ?? "JOB-2026-0891"],
    ["Product / Mix",      order?.product ?? "32 MPa Normal Portland"],
    ["Volume (m3)",        order ? `${order.volume} m3` : "6.0 m3"],
    ["Vehicle",            order?.vehicle ?? "TRK-047"],
    ["Driver",             order?.driver ?? "J. Morrison"],
  ];
}

// Blank lines already on the existing standard delivery ticket
const STD_BLANKS = [
  { label:"Actual Arrival Time",    tall:false },
  { label:"Actual Departure Time",  tall:false },
  { label:"Slump at Delivery (mm)", tall:false },
  { label:"Site Additions",         tall:false },
  { label:"Customer Signature",     tall:true  },
  { label:"Driver Signature",       tall:true  },
];

// ── Standard delivery ticket (existing format, no new template) ────────────

function StdTicket({ order }: { order?: DispatchOrder }) {
  const theme = useHostTheme();
  return (
    <div style={{ border:`1px solid ${theme.stroke.secondary}`, borderRadius:8, overflow:"hidden" }}>
      <div style={{ padding:"10px 14px", background:theme.fill.secondary, borderBottom:`2px solid ${theme.stroke.primary}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <Stack gap={1}>
          <Text weight="bold" size="small">Acme Concrete Group</Text>
          <Text size="small" tone="tertiary">1300 000 000</Text>
          <Text size="small" tone="tertiary">DELIVERY TICKET</Text>
        </Stack>
        <Stack gap={1} style={{ alignItems:"flex-end" }}>
          <Text weight="bold">#{order?.ticketNo ?? "002101"}</Text>
          <Text size="small" tone="secondary">{order?.orderNo ?? "ORD-18261"}</Text>
        </Stack>
      </div>
      <div style={{ padding:"10px 14px", background:theme.bg.elevated }}>
        <Stack gap={4}>
          {sysVals(order).map(([label, value]) => (
            <Row key={label} justify="space-between" align="center">
              <Text size="small" tone="secondary" style={{ minWidth:160 }}>{label}</Text>
              <Text size="small" weight="semibold">{value}</Text>
            </Row>
          ))}
        </Stack>
      </div>
      <div style={{ padding:"10px 14px", borderTop:`1px solid ${theme.stroke.tertiary}`, background:theme.bg.elevated }}>
        <Stack gap={6}>
          {STD_BLANKS.map(f => (
            <Row key={f.label} justify="space-between" align="center">
              <Text size="small" tone="secondary" style={{ minWidth:160, flexShrink:0 }}>{f.label}</Text>
              <div style={{ flex:1, marginLeft:10, borderBottom:`1px solid ${theme.stroke.secondary}`, height:f.tall ? 26 : 14 }} />
            </Row>
          ))}
        </Stack>
      </div>
      <div style={{ padding:"5px 14px", borderTop:`1px solid ${theme.stroke.tertiary}`, background:theme.fill.secondary }}>
        <Text size="small" tone="tertiary" style={{ textAlign:"center", fontSize:9, letterSpacing:"0.05em" }}>
          PRINTED COPY · EXISTING TEMPLATE · QUEUED FOR TRACKIT SYNC
        </Text>
      </div>
    </div>
  );
}

// ── Print Modal (offline: Ticket & Print) ─────────────────────────────────

function PrintModal({ order, onDone, onClose }: { order:DispatchOrder; onDone:()=>void; onClose:()=>void }) {
  const theme = useHostTheme();
  const [done, setDone] = useState(false);
  const overlayStyle = { position:"fixed" as const, inset:0 as const, zIndex:100, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, overflowY:"auto" as const };
  const boxStyle = { background:theme.bg.elevated, border:`1px solid ${theme.stroke.secondary}`, borderRadius:12, maxWidth:520, width:"100%", margin:"auto" };

  if (done) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...boxStyle, padding:32, display:"flex", flexDirection:"column" as const, alignItems:"center", gap:16, textAlign:"center" as const }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:theme.fill.secondary, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={theme.accent.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <Stack gap={3} style={{ alignItems:"center" }}>
            <Text weight="semibold">Ticket #{order.ticketNo} printed — truck ticketed</Text>
            <Text size="small" tone="secondary">Existing delivery ticket · Southpark Ready Mix printer</Text>
          </Stack>
          <Stack gap={7} style={{ width:"100%", maxWidth:340 }}>
            {([
              { label:"Ticket printed at Southpark Ready Mix", note:"",                                           d:true  },
              { label:"Order ticketed in Dispatch",            note:"",                                           d:true  },
              { label:"Queued for Trackit sync",               note:"Will send when network is restored",        d:false },
              { label:"Queued for Deliveries sync",            note:"Driver record will reconcile on reconnect", d:false },
            ] as const).map(({ label, note, d }, i) => (
              <Row key={i} align="start" gap={10}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:d ? theme.accent.primary : theme.fill.tertiary, border:d ? "none" : `1px solid ${theme.stroke.secondary}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                  {d
                    ? <svg width={10} height={10} viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke={theme.text.onAccent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <div style={{ width:6, height:6, borderRadius:"50%", background:theme.stroke.secondary }} />}
                </div>
                <Stack gap={1}>
                  <Text size="small" tone={d ? "primary" : "tertiary"}>{label}</Text>
                  {note ? <Text size="small" tone="tertiary" style={{ fontSize:11 }}>{note}</Text> : null}
                </Stack>
              </Row>
            ))}
          </Stack>
          <Text size="small" tone="secondary">
            Driver fills in arrival time, departure, slump etc. — blank fields are already on the standard ticket.
          </Text>
          <Button variant="secondary" onClick={() => { onDone(); onClose(); }}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${theme.stroke.tertiary}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Stack gap={1}>
            <Text weight="semibold">Ticket &amp; Print — {order.orderNo}</Text>
            <Text size="small" tone="secondary">{order.customer} · {order.volume} m3 · {order.product} · {order.vehicle}</Text>
          </Stack>
          <Button variant="ghost" onClick={onClose}>
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
          </Button>
        </div>
        <Stack gap={14} style={{ padding:"14px 18px 18px" }}>
          <Callout tone="warning" title="Print ticket mode — existing delivery ticket">
            System data pre-fills from the dispatch order. Driver writes arrival time, departure, slump etc. in the blank fields already on the standard ticket. Data queues for Trackit and Deliveries sync on reconnect.
          </Callout>
          <StdTicket order={order} />
          <Row gap={8} justify="end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => setDone(true)}>Confirm Ticket &amp; Print</Button>
          </Row>
        </Stack>
      </div>
    </div>
  );
}

// ── Digital Dispatch Modal (online mode) ───────────────────────────────────

function DigitalModal({ order, onDone, onClose }: { order:DispatchOrder; onDone:()=>void; onClose:()=>void }) {
  const theme = useHostTheme();
  const [done, setDone] = useState(false);
  const overlayStyle = { position:"fixed" as const, inset:0 as const, zIndex:100, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 };
  const boxStyle = { background:theme.bg.elevated, border:`1px solid ${theme.stroke.secondary}`, borderRadius:12, maxWidth:400, width:"100%", margin:"auto", padding:28 as const };

  if (done) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...boxStyle, display:"flex", flexDirection:"column" as const, alignItems:"center", gap:14, textAlign:"center" as const }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:theme.fill.secondary, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={theme.accent.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <Text weight="semibold">Ticket #{order.ticketNo} dispatched</Text>
          <Stack gap={5} style={{ width:"100%", maxWidth:300 }}>
            {["Order ticketed in Dispatch", "Ticket sent to Trackit", "Ticket sent to driver in Deliveries"].map((label, i) => (
              <Row key={i} align="center" gap={10}>
                <div style={{ width:16, height:16, borderRadius:"50%", background:theme.accent.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
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
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <Stack gap={14}>
          <Stack gap={3}>
            <Text weight="semibold">Ticket Truck — {order.orderNo}</Text>
            <Text size="small" tone="secondary">{order.customer} · {order.volume} m3 · {order.product} · {order.vehicle}</Text>
          </Stack>
          <Text size="small" tone="secondary">This will send ticket #{order.ticketNo} to Trackit and to {order.driver} in Deliveries.</Text>
          <Row gap={8} justify="end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => setDone(true)}>Confirm Ticket</Button>
          </Row>
        </Stack>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const theme = useHostTheme();
  const [ver, setVer] = useState<Ver>("A");

  // Per-version state — switching versions preserves each demo's progress
  const [compA, setCompA] = useState(false);
  const [ordA,  setOrdA]  = useState<DispatchOrder[]>(ORDERS);
  const [tabA,  setTabA]  = useState("config");
  const [prnA,  setPrnA]  = useState("hp_lj");

  const [compB, setCompB] = useState(false);
  const [ordB,  setOrdB]  = useState<DispatchOrder[]>(ORDERS);
  const [tabB,  setTabB]  = useState("config");
  const [prnB,  setPrnB]  = useState("hp_lj");

  const [printTarget,   setPrintTarget]   = useState<DispatchOrder | null>(null);
  const [digitalTarget, setDigitalTarget] = useState<DispatchOrder | null>(null);
  const [actioningId,   setActioningId]   = useState<string | null>(null);
  const [syncing,       setSyncing]       = useState(false);

  const companyOn  = ver === "A" ? compA    : compB;
  const orders     = ver === "A" ? ordA     : ordB;
  const setOrders  = ver === "A" ? setOrdA  : setOrdB;
  const tab        = ver === "A" ? tabA     : tabB;
  const setTab     = ver === "A" ? setTabA  : setTabB;
  const printer    = ver === "A" ? prnA     : prnB;
  const setPrinter = ver === "A" ? setPrnA  : setPrnB;

  function handleCompany(v: boolean) {
    if (ver === "A") setCompA(v); else setCompB(v);
  }

  const nowStr = () => new Date().toLocaleTimeString("en-AU", { hour:"2-digit", minute:"2-digit" });

  function handleAction(order: DispatchOrder) {
    setActioningId(order.id);
    setTimeout(() => {
      setActioningId(null);
      if (companyOn) setPrintTarget(order);
      else           setDigitalTarget(order);
    }, 800);
  }
  function handlePrinted() {
    if (!printTarget) return;
    setOrders(os => os.map(o => o.id === printTarget.id ? { ...o, status:"printed" as const, actionTime:nowStr() } : o));
  }
  function handleDispatched() {
    if (!digitalTarget) return;
    setOrders(os => os.map(o => o.id === digitalTarget.id ? { ...o, status:"dispatched" as const, actionTime:nowStr() } : o));
  }
  function handleSyncAll() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setOrders(os => os.map(o => o.status === "printed" ? { ...o, status:"synced" as const } : o));
    }, 1800);
  }

  const readyOrders      = orders.filter(o => o.status === "ready");
  const completedToday   = orders.filter(o => o.status !== "ready");
  const pendingSync      = orders.filter(o => o.status === "printed");
  const syncedOffline    = orders.filter(o => o.status === "synced");
  const activeDeliveries = orders.filter(o => o.status !== "ready");

  const TAB_A = [
    { value:"dispatch", label:"Dispatch"       },
    { value:"sync",     label:"Pending Sync"   },
    { value:"config",   label:"Company Config" },
  ];
  const TAB_B = [
    { value:"dispatch",  label:"Dispatch"             },
    { value:"tracking",  label:"Tracking Dashboard"   },
    { value:"config",    label:"Company Config"       },
  ];
  const tabOpts = ver === "A" ? TAB_A : TAB_B;

  function tabLabel(t: { value: string; label: string }) {
    if (t.value === "sync"     && pendingSync.length > 0) return `Pending Sync (${pendingSync.length})`;
    if (t.value === "tracking" && pendingSync.length > 0) return `Tracking Dashboard (${pendingSync.length})`;
    return t.label;
  }

  const modeBarBg     = companyOn ? "#7a2b2b18"  : theme.bg.editor;
  const modeBarBorder = companyOn ? "#c0393922"   : theme.stroke.tertiary;

  return (
    <Stack gap={0} style={{ maxWidth:960, margin:"0 auto" }}>

      {/* ── Version selector ── */}
      <div style={{ padding:"12px 28px", background:theme.fill.secondary, borderBottom:`1px solid ${theme.stroke.secondary}`, display:"flex", alignItems:"center", gap:14 }}>
        <Text size="small" weight="semibold" tone="secondary">Compare approach:</Text>
        <Row gap={6}>
          <Pill active={ver === "A"} onClick={() => { setVer("A"); setPrintTarget(null); setDigitalTarget(null); }}>
            A — Dispatch Screen (MVP)
          </Pill>
          <Pill active={ver === "B"} onClick={() => { setVer("B"); setPrintTarget(null); setDigitalTarget(null); }}>
            B — Dispatch + Tracking Dashboard
          </Pill>
        </Row>
      </div>

      {/* ── Version description ── */}
      <div style={{ padding:"14px 28px", background:ver === "A" ? theme.bg.elevated : theme.fill.tertiary, borderBottom:`1px solid ${theme.stroke.tertiary}` }}>
        {ver === "A" ? (
          <Stack gap={3}>
            <Row gap={8} align="center">
              <Pill size="sm" active>Version A</Pill>
              <Text weight="semibold">Dispatch screen — print at point of ticketing the truck</Text>
            </Row>
            <Text size="small" tone="secondary">
              Admin switches all plants to print mode via one Company Config toggle. In Dispatch, the Ticket Truck button becomes Ticket &amp; Print. The existing delivery ticket prints at the plant printer — no new template needed. Dispatcher works exactly as today. Printed tickets queue for Trackit and Deliveries sync.
            </Text>
          </Stack>
        ) : (
          <Stack gap={3}>
            <Row gap={8} align="center">
              <Pill size="sm">Version B</Pill>
              <Text weight="semibold">Dispatch + Tracking Dashboard — print, monitor, and sync</Text>
            </Row>
            <Text size="small" tone="secondary">
              Same Dispatch workflow as Version A. Adds a Tracking Dashboard to manage sync when the network is restored — showing which trucks have printed tickets pending reconciliation. Note: during the outage, the dashboard shows dispatch records only. Live GPS, truck locations and automatic delivery status updates depend on the same network and will not be available.
            </Text>
          </Stack>
        )}
      </div>

      {/* ── Mode bar ── */}
      <div style={{ padding:"14px 28px", background:modeBarBg, borderBottom:`1px solid ${modeBarBorder}`, display:"flex", alignItems:"center", gap:14 }}>
        <Stack gap={1} style={{ flex:1 }}>
          <Row gap={10} align="center">
            <Text weight="semibold">Southpark Ready Mix</Text>
            {companyOn
              ? <Pill size="sm">Print ticket mode — all plants</Pill>
              : <Pill size="sm" active>Digital ticket mode</Pill>}
          </Row>
          <Text size="small" tone="secondary">
            {companyOn
              ? "Print ticket mode is on. Ticket & Print replaces Ticket Truck — existing delivery ticket prints at the plant printer and queues for sync."
              : "Digital mode. Ticket Truck sends the ticket to Trackit and the driver in Deliveries."}
          </Text>
        </Stack>
        {companyOn ? (
          <Button variant="ghost" onClick={() => setTab("config")}>Change in Company Config</Button>
        ) : (
          <Button variant="secondary" onClick={() => setTab("config")}>Company Config</Button>
        )}
      </div>

      <Stack gap={20} style={{ padding:"24px 28px" }}>

        {/* ── Stats ── */}
        <Row gap={20} wrap>
          <Stat value={readyOrders.length}   label="Ready to dispatch"        tone={readyOrders.length > 0 ? "warning" : undefined} />
          <Stat value={orders.filter(o => o.status === "dispatched").length} label="Dispatched digitally"    tone="success" />
          <Stat value={pendingSync.length}   label="Printed — pending sync"   tone={pendingSync.length > 0 ? "danger" : undefined} />
          <Stat value={syncedOffline.length} label="Offline tickets synced" />
        </Row>

        {/* ── Tabs ── */}
        <Row gap={6} wrap>
          {tabOpts.map(t => (
            <Pill key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
              {tabLabel(t)}
            </Pill>
          ))}
        </Row>
        <Divider />

        {/* ── DISPATCH ── */}
        {tab === "dispatch" && (
          <Stack gap={14}>
            {!companyOn && (
              <Callout tone="neutral" title="Digital ticket mode — normal operation">
                Ticket Truck sends tickets to Trackit and the driver in Deliveries. Enable print ticket mode in Company Config to switch all plants to printed tickets.
              </Callout>
            )}
            {companyOn && (
              <Callout tone="warning" title="Print ticket mode active — Ticket & Print is live">
                The Ticket Truck button has changed to Ticket &amp; Print. Clicking it prints the existing delivery ticket at the plant and queues data for Trackit and Deliveries sync.
              </Callout>
            )}

            {readyOrders.length > 0 && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform:"uppercase" as const, letterSpacing:"0.05em", fontSize:11 }}>
                  Ready to dispatch
                </Text>
                <Stack gap={4}>
                  {readyOrders.map(order => {
                    const busy     = actioningId === order.id;
                    const btnLabel = busy ? "Processing..." : companyOn ? "Ticket & Print" : "Ticket Truck";
                    return (
                      <div key={order.id} style={{ border:`1px solid ${theme.stroke.primary}`, borderRadius:8, padding:"14px 16px", background:theme.bg.elevated }}>
                        <Row align="center" gap={12}>
                          <Stack gap={4} style={{ flex:1, minWidth:0 }}>
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
                          <Button variant="primary" disabled={busy || actioningId !== null} onClick={() => handleAction(order)}>
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
              <Callout tone="success" title="All orders dispatched">No orders are currently waiting to be dispatched.</Callout>
            )}

            {completedToday.length > 0 && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform:"uppercase" as const, letterSpacing:"0.05em", fontSize:11 }}>
                  Dispatched today
                </Text>
                <Stack gap={3}>
                  {completedToday.map(order => (
                    <div key={order.id} style={{ border:`1px solid ${theme.stroke.tertiary}`, borderRadius:8, padding:"12px 16px", background:theme.fill.tertiary }}>
                      <Row align="center" gap={12}>
                        <Stack gap={2} style={{ flex:1, minWidth:0 }}>
                          <Row gap={10} align="center" wrap>
                            <Text size="small" weight="semibold" tone="secondary">{order.orderNo}</Text>
                            <Text size="small" tone="tertiary">Ticket #{order.ticketNo}</Text>
                            {order.status === "dispatched" && <Pill size="sm" active>Ticketed digitally · {order.actionTime}</Pill>}
                            {order.status === "printed"    && <Pill size="sm">Printed · {order.actionTime} — pending sync</Pill>}
                            {order.status === "synced"     && <Pill size="sm" active>Printed &amp; synced</Pill>}
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

        {/* ── TRACKING DASHBOARD (Version B only) ── */}
        {tab === "tracking" && ver === "B" && (
          <Stack gap={14}>
            <Stack gap={4}>
              <H2>Tracking Dashboard</H2>
              <Text size="small" tone="secondary">
                Dispatched orders for Southpark Ready Mix.
              </Text>
            </Stack>

            {/* Key design consideration: live data is unavailable during the outage */}
            {companyOn && (
              <Callout tone="danger" title="Network outage — live truck data not available">
                GPS location, automatic status updates (arrival, departure, delivery confirmation) and driver app data all depend on the same network connection. This screen is showing dispatch records only — scheduled deliveries based on what was entered in Dispatch. Truck positions and on-site status will not update until the network is restored.
              </Callout>
            )}

            {pendingSync.length > 0 && (
              <Callout tone="warning" title={`${pendingSync.length} printed ticket${pendingSync.length > 1 ? "s" : ""} queued — ready to sync when network restores`}>
                Tickets were printed at the plant. Drivers have their physical copies. Use Sync Now as soon as the network is restored.
              </Callout>
            )}
            {syncedOffline.length > 0 && pendingSync.length === 0 && (
              <Callout tone="success" title="All printed tickets synced">
                Trackit and Deliveries have been updated. Turn off print ticket mode in Company Config to return to digital tickets.
              </Callout>
            )}
            {activeDeliveries.length === 0 && (
              <Callout tone="neutral" title="No dispatched orders">No trucks have been dispatched yet today. Go to Dispatch to ticket trucks.</Callout>
            )}

            {activeDeliveries.length > 0 && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform:"uppercase" as const, letterSpacing:"0.05em", fontSize:11 }}>
                  {companyOn
                    ? "Dispatched orders — scheduled delivery (dispatch record only, no live tracking)"
                    : "Dispatched orders — live tracking active"}
                </Text>
                <Stack gap={4}>
                  {activeDeliveries.map(order => {
                    const isPrinted = order.status === "printed";
                    const isSynced  = order.status === "synced";
                    const isDigital = order.status === "dispatched";
                    return (
                      <div key={order.id} style={{ border:`1px solid ${isPrinted ? theme.stroke.secondary : theme.stroke.tertiary}`, borderRadius:8, padding:"14px 16px", background:isPrinted ? theme.bg.elevated : theme.fill.tertiary }}>
                        <Row align="center" gap={12}>
                          <div style={{ width:38, height:38, borderRadius:8, background:theme.fill.secondary, border:`1px solid ${theme.stroke.tertiary}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                          </div>
                          <Stack gap={3} style={{ flex:1, minWidth:0 }}>
                            <Row gap={8} align="center" wrap>
                              <Text weight="semibold">{order.vehicle}</Text>
                              <Text size="small" tone="secondary">{order.driver}</Text>
                              {isDigital && !companyOn && <Pill size="sm" active>Digital ticket · {order.actionTime}</Pill>}
                              {isDigital && companyOn  && <Pill size="sm">Digital ticket · {order.actionTime} · no live status</Pill>}
                              {isPrinted && <Pill size="sm">Printed ticket · pending sync · {order.actionTime}</Pill>}
                              {isSynced  && <Pill size="sm" active>Printed &amp; synced · {order.actionTime}</Pill>}
                            </Row>
                            <Text size="small" tone="secondary">{order.orderNo} · {order.customer}</Text>
                            {/* "En route" replaced with "Scheduled delivery" during outage — live position is unknown */}
                            <Text size="small" tone="tertiary">
                              {order.product} · {order.volume} m3 ·{" "}
                              {companyOn
                                ? `Scheduled delivery: ${order.deliveryAddress}`
                                : `En route to ${order.deliveryAddress}`}
                            </Text>
                          </Stack>
                          {isPrinted && (
                            <Button variant="ghost" onClick={() => setPrintTarget(order)}>Reprint</Button>
                          )}
                        </Row>
                      </div>
                    );
                  })}
                </Stack>
              </Stack>
            )}

            {pendingSync.length > 0 && (
              <Row justify="end">
                <Button variant="primary" disabled={syncing} onClick={handleSyncAll}>
                  {syncing ? "Syncing..." : `Sync ${pendingSync.length} ticket${pendingSync.length > 1 ? "s" : ""} to Trackit & Deliveries`}
                </Button>
              </Row>
            )}
          </Stack>
        )}

        {/* ── PENDING SYNC (Version A only) ── */}
        {tab === "sync" && ver === "A" && (
          <Stack gap={14}>
            <Stack gap={4}>
              <H2>Pending Sync</H2>
              <Text size="small" tone="secondary">Printed tickets queued for Trackit and Deliveries. Click Sync Now when the network is restored.</Text>
            </Stack>

            {pendingSync.length === 0 && syncedOffline.length === 0 && (
              <Callout tone="success" title="Nothing pending">No printed tickets are waiting to sync.</Callout>
            )}

            {pendingSync.length > 0 && (
              <Stack gap={8}>
                <Callout tone="warning" title={`${pendingSync.length} ticket${pendingSync.length > 1 ? "s" : ""} queued — waiting for network`}>
                  Tickets were printed at the plant during the outage. Drivers have their physical copies.
                </Callout>
                <Stack gap={4}>
                  {pendingSync.map(order => (
                    <div key={order.id} style={{ border:`1px solid ${theme.stroke.secondary}`, borderRadius:8, padding:"14px 16px", background:theme.bg.elevated }}>
                      <Row align="center" gap={12}>
                        <Stack gap={3} style={{ flex:1, minWidth:0 }}>
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
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform:"uppercase" as const, letterSpacing:"0.05em", fontSize:11 }}>
                  Synced this session
                </Text>
                <Stack gap={3}>
                  {syncedOffline.map(order => (
                    <div key={order.id} style={{ border:`1px solid ${theme.stroke.tertiary}`, borderRadius:8, padding:"12px 16px", background:theme.fill.tertiary }}>
                      <Row align="center" gap={12}>
                        <Stack gap={2} style={{ flex:1, minWidth:0 }}>
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

        {/* ── COMPANY CONFIG ── */}
        {tab === "config" && (
          <Stack gap={16}>
            <Stack gap={4}>
              <H2>Company Config</H2>
              <Text size="small" tone="secondary">Admin settings for Acme Concrete Group — applies to all plants company-wide.</Text>
            </Stack>
            <Divider />

            {/* Main toggle */}
            <Card>
              <CardBody>
                <Stack gap={12}>
                  <Row justify="space-between" align="center">
                    <Stack gap={1}>
                      <Text weight="semibold">Print Ticket Mode</Text>
                      <Text size="small" tone="secondary">All plants · Acme Concrete Group</Text>
                    </Stack>
                    <Row gap={8} align="center">
                      <Text size="small" tone={companyOn ? "primary" : "secondary"}>{companyOn ? "On" : "Off"}</Text>
                      <Toggle checked={companyOn} onChange={handleCompany} />
                    </Row>
                  </Row>
                  <Divider />
                  <Text size="small" tone="secondary">
                    Switches all plants from digital to printed tickets in one go — irrespective of individual internet or telephone coverage. In Dispatch, the Ticket Truck button becomes Ticket &amp; Print. The existing delivery ticket prints at the plant printer with all order data pre-filled. Driver writes arrival time, departure, slump etc. in the blank fields already on the standard ticket. All data queues for Trackit and Deliveries sync.
                  </Text>
                  {companyOn ? (
                    <Callout tone="warning" title="Print ticket mode is ON — all plants">
                      Go to Dispatch to use Ticket &amp; Print. When the network is restored, sync printed tickets then turn this off to return to digital.
                    </Callout>
                  ) : (
                    <Callout tone="neutral" title="Digital ticket mode — normal operation">
                      Flip the toggle to switch all plants to printed tickets during a network outage.
                    </Callout>
                  )}
                </Stack>
              </CardBody>
            </Card>

            {/* Printer configuration (Q5 — default printer per plant) */}
            <Card>
              <CardBody>
                <Stack gap={10}>
                  <Stack gap={2}>
                    <Text weight="semibold">Default Printer — Southpark Ready Mix</Text>
                    <Text size="small" tone="secondary">
                      Tickets print to this printer when Ticket &amp; Print is used. Configured per plant — matches how printers are managed in CS today.
                    </Text>
                  </Stack>
                  <Row gap={12} align="center">
                    <div style={{ flex:1 }}>
                      <Select value={printer} onChange={v => setPrinter(v)} options={PRINTER_OPTS} />
                    </div>
                    <Button variant="secondary">Test Print</Button>
                  </Row>
                  {printer === "none" && (
                    <Callout tone="danger" title="No printer configured">
                      Select a printer before enabling print ticket mode. Ticket &amp; Print cannot proceed without a configured printer.
                    </Callout>
                  )}
                  {printer !== "none" && (
                    <Text size="small" tone="secondary">
                      Other plants: Eastgate Plant → HP LaserJet M404 · Northside Plant → Brother HL-L2350DW
                    </Text>
                  )}
                </Stack>
              </CardBody>
            </Card>

            {/* Next steps when enabled */}
            {companyOn && (
              <Stack gap={6}>
                <Text size="small" weight="semibold" tone="secondary" style={{ textTransform:"uppercase" as const, letterSpacing:"0.05em", fontSize:11 }}>
                  Next steps
                </Text>
                <Card>
                  <CardBody>
                    <Row align="center" gap={16}>
                      <Stack gap={2} style={{ flex:1 }}>
                        <Text size="small" weight="semibold">Dispatch</Text>
                        <Text size="small" tone="secondary">Use Ticket &amp; Print to ticket trucks and print delivery tickets at the plant.</Text>
                      </Stack>
                      <Button variant="secondary" onClick={() => setTab("dispatch")}>Go to Dispatch</Button>
                    </Row>
                  </CardBody>
                </Card>
                {ver === "B" && (
                  <Card>
                    <CardBody>
                      <Row align="center" gap={16}>
                        <Stack gap={2} style={{ flex:1 }}>
                          <Text size="small" weight="semibold">Tracking Dashboard</Text>
                          <Text size="small" tone="secondary">Dispatch records only during outage. Use to manage sync when the network is restored.</Text>
                        </Stack>
                        <Button variant="secondary" onClick={() => setTab("tracking")}>Go to Tracking</Button>
                      </Row>
                    </CardBody>
                  </Card>
                )}
              </Stack>
            )}

            {/* How it works */}
            <Card collapsible defaultOpen={false}>
              <CardHeader>How this works — Version {ver}</CardHeader>
              <CardBody>
                <Stack gap={10}>
                  <Stack gap={3}>
                    <Text size="small" weight="semibold">What admin does (one action)</Text>
                    <Text size="small" tone="secondary">
                      Flip Print Ticket Mode on in Company Config. All plants switch immediately — irrespective of individual internet or phone coverage. No per-plant configuration needed.
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap={3}>
                    <Text size="small" weight="semibold">What the dispatcher does</Text>
                    <Text size="small" tone="secondary">
                      Works exactly as today in Dispatch. The only change is the button label: Ticket Truck becomes Ticket &amp; Print. After confirming, the ticket prints at the plant printer. No new template or process to learn.
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap={3}>
                    <Text size="small" weight="semibold">What prints</Text>
                    <Text size="small" tone="secondary">
                      The existing standard delivery ticket. All order data pre-fills automatically (customer, product, volume, vehicle, driver etc.). Blank ruled lines for arrival time, departure, slump, and signatures are already part of the standard form — driver fills them in by hand at site, exactly as with traditional paper dockets.
                    </Text>
                  </Stack>
                  {ver === "B" && (
                    <>
                      <Divider />
                      <Stack gap={3}>
                        <Text size="small" weight="semibold">Tracking Dashboard — important limitation</Text>
                        <Text size="small" tone="secondary">
                          During a network outage, the Tracking Dashboard shows dispatch records only — scheduled deliveries from what was entered in Dispatch. Live GPS, truck locations, and automatic delivery status updates (arrival, departure, confirmation) all depend on the same network connection and will not be available. The dashboard's primary value during an outage is identifying which tickets are printed and pending sync. Its full tracking capability returns when the network is restored.
                        </Text>
                      </Stack>
                    </>
                  )}
                  <Divider />
                  <Stack gap={3}>
                    <Text size="small" weight="semibold">Sync on reconnect</Text>
                    <Text size="small" tone="secondary">
                      {ver === "A"
                        ? "When the network is restored, go to Pending Sync and click Sync Now."
                        : "When the network is restored, go to Tracking Dashboard and click Sync Now."}
                      {" "}All queued tickets reconcile with Trackit and Deliveries. Admin then turns Print Ticket Mode off in Company Config to return to digital.
                    </Text>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        )}

      </Stack>

      {printTarget   && <PrintModal   order={printTarget}   onDone={handlePrinted}    onClose={() => setPrintTarget(null)}   />}
      {digitalTarget && <DigitalModal order={digitalTarget} onDone={handleDispatched} onClose={() => setDigitalTarget(null)} />}
    </Stack>
  );
}
