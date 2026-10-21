import {
  useState, useCanvasState,
  Stack, Row, Grid, Card, CardHeader, CardBody,
  H1, H2, H3, Text, Divider, Spacer,
  Button, Pill, Toggle, Checkbox, Select, Table, TextInput,
  Stat, Callout,
  useHostTheme,
} from "cursor/canvas";

// ── Types ──────────────────────────────────────────────────────────────────

type NetworkStatus = "online" | "offline" | "degraded";
type ConnectionType = "network" | "usb" | "print_server";
type PrintProtocol  = "raw" | "ipp" | "lpr";
type TestStatus     = "success" | "failed" | null;

interface PrinterConfig {
  printerName: string; connectionType: ConnectionType;
  networkHost: string; networkPort: string; protocol: PrintProtocol;
  usbPort: string; serverName: string; shareName: string;
  lastTestStatus: TestStatus; lastTestTime: string | null;
}
interface Order {
  id: string; orderNo: string; ticketNo: string;
  customer: string; deliveryAddress: string; jobRef: string;
  product: string; volume: number; vehicle: string;
  scheduledTime: string; batchTime: string;
}
interface Plant {
  id: string; name: string; location: string; status: NetworkStatus;
  printFallbackEnabled: boolean; templateId: string;
  pendingOrders: Order[]; printerConfig: PrinterConfig;
}
interface CompanyConfig {
  globalFallbackEnabled: boolean; autoSwitchOnOffline: boolean;
  offlineThresholdSeconds: number; autoReconcile: boolean;
  manualReview: boolean; alertDispatch: boolean;
}
interface SystemField {
  id: string; defaultLabel: string; customLabel: string; enabled: boolean; required: boolean;
}
interface AdditionalField {
  id: string; label: string; enabled: boolean; custom: boolean; tall?: boolean;
}
interface TicketTemplate {
  id: string; name: string; isDefault: boolean;
  companyName: string; showContact: boolean; contactNumber: string;
  paperSize: "A4" | "A5"; copies: number;
  systemFields: SystemField[]; additionalFields: AdditionalField[];
}

// ── Static content ─────────────────────────────────────────────────────────

const FLOW_STEPS = [
  { title: "Plant loses WAN / internet connectivity",
    desc:  "The plant's external connection drops — telephony, internet, or both. The core Trackit platform is unaffected (switchover resilience)." },
  { title: "Trackit detects the outage",
    desc:  "A configurable timeout (10 s – 2 min) determines how quickly the system confirms the connection is genuinely down, not a momentary blip." },
  { title: "System auto-switches to Print Fallback mode",
    desc:  "If enabled, Trackit switches automatically — no manual intervention needed at the plant. Dispatch can be alerted. Manual activation is also an option." },
  { title: "Platform and all order data remain intact",
    desc:  "Ticket numbering and every order detail (customer, product, volume, job ref, vehicle, scheduled time) stay correct and available." },
  { title: "Plant operator prints the ticket",
    desc:  "The operator selects the queued order in Trackit. All system data pre-populates. The ticket is sent to the locally connected printer — unaffected by the internet outage." },
  { title: "Driver receives the printed ticket",
    desc:  "The ticket contains all order details from the platform. Blank ruled lines are provided for the site-specific driver additionals section." },
  { title: "Driver completes additionals by hand at site",
    desc:  "Slump test result, actual volume, site additions (water, fibres, admixtures), site contact, and customer / driver signatures are written on the ticket." },
  { title: "Connectivity restores — tickets auto-reconcile",
    desc:  "Trackit detects the reconnection and reconciles printed tickets back into the system. System order data is already correct; only driver additionals may need manual capture." },
];

const DESIGN_DECISIONS = [
  { id: "dd1", title: "Two-tier switch: company-wide master + per-plant override",
    decision: "A master company-level toggle controls whether the feature is available at all. Individual plants can then be enabled or disabled independently.",
    rationale: "Not all plants will have printers configured or a business need for fallback. The master switch gives IT/operations a safety control, while per-plant granularity supports mixed deployments." },
  { id: "dd2", title: "Auto-switch on outage detection with configurable threshold",
    decision: "The system detects connectivity loss and switches to print mode automatically after a configurable threshold (10 s – 2 min). Manual activation is also supported.",
    rationale: "During an outage, plant staff are focused on keeping loads moving. A manual activation step adds delay and depends on staff recognising the system is down. Auto-switch removes that friction while the threshold prevents false triggers from momentary blips." },
  { id: "dd3", title: "Platform resilience assumption: system data is always correct",
    decision: "The feature is built on the assumption that the core Trackit platform (and its order data) remains available during plant connectivity outages, due to platform-level switchover resilience.",
    rationale: "This means ticket numbers are always sequential, all order data prints automatically with no blanks, and reconciliation on restore is straightforward — the system data is already right." },
  { id: "dd4", title: "Configurable ticket templates — per company and per plant",
    decision: "Companies create named ticket templates specifying which system fields to include, company branding, paper size (A4/A5), and number of copies. Templates can be assigned company-wide or overridden per plant.",
    rationale: "Different plants, customers, or product types may need different docket formats. A concise A5 template for standard loads, a full A4 for complex deliveries, or a customer-specific format are all achievable within the same system." },
  { id: "dd5", title: "Local printer connection — independent of the internet",
    decision: "Printers are connected locally at each plant (USB or local LAN). The connection is configured per-plant and must be tested and verified before any fallback event.",
    rationale: "If the printer required internet connectivity it would fail at the same moment as the digital ticket system, defeating the purpose. A locally connected printer remains available regardless of external network state." },
  { id: "dd6", title: "Clear split: pre-printed system data vs handwritten driver additionals",
    decision: "The ticket is structured in two zones: system data (all order details from the platform, printed automatically) and driver additionals (blank ruled lines completed by hand at site).",
    rationale: "This keeps ticket issuance fast — the operator selects the order and prints. It clearly signals to the driver what is already confirmed versus what they need to record, and simplifies reconciliation since system order data is already correct." },
];

const CONSIDERATIONS = [
  { id: "c1",  title: "Further fallback if the printer also fails",
    desc: "If both the internet AND the plant's local printer fail simultaneously, what happens? Should pre-numbered paper ticket books be available as a last resort, and how would those be reconciled?" },
  { id: "c2",  title: "Who reconciles driver additionals after reconnect?",
    desc: "System order data auto-reconciles correctly. But driver additionals (slump, actual volume, site additions, signatures) may need manual data entry back into Trackit. Who owns this — plant operator, dispatch, or a back-office role?" },
  { id: "c3",  title: "QR code or barcode on the printed ticket",
    desc: "Including a scannable QR code or barcode could speed up reconciliation — scan to open the matching order in Trackit rather than manually locating it. Worth considering for high-volume plants." },
  { id: "c4",  title: "Thermal / label printer support",
    desc: "Batch plants often use thermal slip printers (e.g. Zebra, Epson TM series) rather than standard laser/inkjet. Does the template and paper size config need to support thermal roll formats and page dimensions?" },
  { id: "c5",  title: "Multi-copy labelling — who gets which copy?",
    desc: "If multiple copies print (e.g. 3), should each be labelled by destination: Copy 1 – Customer, Copy 2 – Plant, Copy 3 – Office/Finance? Prevents ambiguity on busy sites." },
  { id: "c6",  title: "Manual override to force print mode when online",
    desc: "Should plant staff be able to activate printed ticket mode manually, even when connectivity is healthy? Useful for printer testing, staff training, or specific customer preferences." },
  { id: "c7",  title: "Reconciliation time window and escalation alerts",
    desc: "How long should a printed ticket remain unreconciled before triggering an alert? E.g. alert dispatch if a ticket is unreconciled after 4 hours. Prevents tickets being lost or forgotten after connectivity restores." },
  { id: "c8",  title: "Separate audit trail for offline-issued tickets",
    desc: "Should printed fallback tickets be flagged distinctly in Trackit reports and audit logs so operations teams can track frequency of fallback use and identify which plants it occurs at most often?" },
  { id: "c9",  title: "Regulatory / compliance requirements for delivery dockets",
    desc: "Are there jurisdiction-specific requirements for the format or content of concrete delivery dockets (e.g. Australian Standards, state road authority regulations)? These may mandate specific fields on every ticket regardless of template config." },
  { id: "c10", title: "Platform-also-down edge case — fully offline mode",
    desc: "This prototype assumes the Trackit platform stays up. What if both the platform AND the plant connectivity go down? Is a fully offline mode needed — with pre-allocated ticket number ranges stored locally at the plant workstation?" },
];

// ── Constants ──────────────────────────────────────────────────────────────

const CONN_OPTIONS = [
  { value: "network",      label: "Network / IP Address"       },
  { value: "usb",          label: "USB (direct to plant PC)"   },
  { value: "print_server", label: "Windows Print Server (UNC)" },
];
const PROTOCOL_OPTIONS = [
  { value: "raw", label: "RAW — port 9100 (recommended)" },
  { value: "ipp", label: "IPP — port 631"                },
  { value: "lpr", label: "LPR — port 515"                },
];
const USB_PORT_OPTIONS = [
  { value: "USB001", label: "USB001" }, { value: "USB002", label: "USB002" },
  { value: "USB003", label: "USB003" }, { value: "COM1",   label: "COM1"   },
  { value: "COM2",   label: "COM2"   },
];
const THRESHOLD_OPTIONS = [
  { value: "10", label: "10 seconds" }, { value: "20", label: "20 seconds" },
  { value: "30", label: "30 seconds" }, { value: "60", label: "60 seconds" },
  { value: "120", label: "2 minutes" },
];
const PAPER_OPTIONS = [{ value: "A4", label: "A4" }, { value: "A5", label: "A5" }];
const COPY_OPTIONS  = [{ value: "1", label: "1 copy" }, { value: "2", label: "2 copies" }, { value: "3", label: "3 copies" }];
const TAB_OPTIONS   = [
  { value: "about",     label: "Overview & Feedback"   },
  { value: "config",    label: "Company Config"         },
  { value: "templates", label: "Ticket Templates"       },
  { value: "printers",  label: "Printer Setup"          },
  { value: "plants",    label: "Plant Management"       },
  { value: "log",       label: "Offline Activity Log"   },
];

// ── Initial data ───────────────────────────────────────────────────────────

const makeSystemFields = (): SystemField[] => [
  { id: "ticket_no", defaultLabel: "Ticket Number",        customLabel: "", enabled: true,  required: true  },
  { id: "order_no",  defaultLabel: "Order Number",         customLabel: "", enabled: true,  required: false },
  { id: "plant",     defaultLabel: "Plant",                customLabel: "", enabled: true,  required: false },
  { id: "date",      defaultLabel: "Date",                 customLabel: "", enabled: true,  required: false },
  { id: "batch_tm",  defaultLabel: "Batch Time",           customLabel: "", enabled: true,  required: false },
  { id: "sched_del", defaultLabel: "Scheduled Delivery",   customLabel: "", enabled: true,  required: false },
  { id: "customer",  defaultLabel: "Customer",             customLabel: "", enabled: true,  required: false },
  { id: "deliv_adr", defaultLabel: "Delivery Address",     customLabel: "", enabled: true,  required: false },
  { id: "job_ref",   defaultLabel: "Job Reference",        customLabel: "", enabled: true,  required: false },
  { id: "product",   defaultLabel: "Product / Mix",        customLabel: "", enabled: true,  required: false },
  { id: "volume",    defaultLabel: "Volume Ordered (m³)",  customLabel: "", enabled: true,  required: false },
  { id: "vehicle",   defaultLabel: "Vehicle",              customLabel: "", enabled: true,  required: false },
];
const makeAdditionalFields = (): AdditionalField[] => [
  { id: "arr_time",  label: "Actual Arrival Time",           enabled: true,  custom: false },
  { id: "dep_time",  label: "Actual Departure Time",         enabled: true,  custom: false },
  { id: "slump",     label: "Slump at Delivery (mm)",        enabled: true,  custom: false },
  { id: "water",     label: "Site Additions — Water (L)",    enabled: true,  custom: false },
  { id: "additions", label: "Site Additions — Other",        enabled: true,  custom: false },
  { id: "act_vol",   label: "Actual Volume Delivered (m³)",  enabled: true,  custom: false },
  { id: "site_rep",  label: "Site Contact / Rep",            enabled: true,  custom: false },
  { id: "cust_sig",  label: "Customer Signature",            enabled: true,  custom: false, tall: true },
  { id: "drv_sig",   label: "Driver Signature",              enabled: true,  custom: false, tall: true },
];
const makePrinterConfig = (o: Partial<PrinterConfig> = {}): PrinterConfig => ({
  printerName: "", connectionType: "network",
  networkHost: "", networkPort: "9100", protocol: "raw",
  usbPort: "USB001", serverName: "", shareName: "",
  lastTestStatus: null, lastTestTime: null, ...o,
});
const INIT_TEMPLATES: TicketTemplate[] = [
  { id: "t1", name: "Standard Delivery Ticket", isDefault: true, companyName: "Acme Concrete Group", showContact: true, contactNumber: "1300 000 000", paperSize: "A4", copies: 2, systemFields: makeSystemFields(), additionalFields: makeAdditionalFields() },
  { id: "t2", name: "Concise — Site Copy Only", isDefault: false, companyName: "Acme Concrete Group", showContact: false, contactNumber: "", paperSize: "A5", copies: 1,
    systemFields: makeSystemFields().map(f => ["batch_tm","sched_del","vehicle"].includes(f.id) ? { ...f, enabled: false } : f),
    additionalFields: makeAdditionalFields().map(f => ["water","additions"].includes(f.id) ? { ...f, enabled: false } : f) },
];
const INIT_PLANTS: Plant[] = [
  { id: "p1", name: "Northside Batch Plant",  location: "14 Industrial Ave, Northside", status: "online",   printFallbackEnabled: false, templateId: "default", pendingOrders: [], printerConfig: makePrinterConfig({ printerName: "NORTH-PRN-01", connectionType: "network", networkHost: "192.168.10.105", networkPort: "9100", protocol: "raw", lastTestStatus: "success", lastTestTime: "08:14" }) },
  { id: "p2", name: "Southpark Ready Mix",    location: "7 Commerce Rd, Southpark",     status: "offline",  printFallbackEnabled: true,  templateId: "t1",
    pendingOrders: [
      { id: "o1", orderNo: "ORD-18234", ticketNo: "002094", customer: "Acme Construction Pty Ltd", deliveryAddress: "47 Builder St, Southpark", jobRef: "JOB-2026-0891", product: "32 MPa Normal Portland", volume: 6.0, vehicle: "TRK-047", scheduledTime: "15:00", batchTime: "14:32" },
      { id: "o2", orderNo: "ORD-18241", ticketNo: "002095", customer: "Metro Civil Group",          deliveryAddress: "12 Highway Rd, Southpark", jobRef: "JOB-2026-0904", product: "20 MPa General Purpose", volume: 4.5, vehicle: "TRK-031", scheduledTime: "15:45", batchTime: "15:10" },
    ],
    printerConfig: makePrinterConfig({ printerName: "SOUTH-PRN-01", connectionType: "network", networkHost: "192.168.20.55", networkPort: "9100", protocol: "raw", lastTestStatus: "success", lastTestTime: "13:58" }) },
  { id: "p3", name: "Eastgate Concrete",      location: "3 Factory Ln, Eastgate",       status: "degraded", printFallbackEnabled: false, templateId: "default",
    pendingOrders: [{ id: "o3", orderNo: "ORD-18251", ticketNo: "001147", customer: "Eastside Developers", deliveryAddress: "88 Commerce Ave, Eastgate", jobRef: "JOB-2026-0912", product: "40 MPa High Strength", volume: 8.0, vehicle: "TRK-012", scheduledTime: "16:30", batchTime: "16:05" }],
    printerConfig: makePrinterConfig({ printerName: "", connectionType: "usb", usbPort: "USB001", lastTestStatus: "failed", lastTestTime: "09:32" }) },
  { id: "p4", name: "Westfield Quarry Plant", location: "55 Quarry Rd, Westfield",      status: "online",   printFallbackEnabled: false, templateId: "t2", pendingOrders: [], printerConfig: makePrinterConfig({ printerName: "WF-BATCH-PRN", connectionType: "print_server", serverName: "\\\\WF-PRINT-01", shareName: "BATCH-PRN-01", lastTestStatus: "success", lastTestTime: "07:45" }) },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: NetworkStatus }) {
  const theme = useHostTheme();
  const color = status === "online" ? theme.accent.primary : status === "offline" ? "#e05252" : "#c8963a";
  const label = status === "online" ? "Online" : status === "offline" ? "Offline" : "Degraded";
  return (
    <Row gap={5} align="center">
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <Text size="small" tone="secondary">{label}</Text>
    </Row>
  );
}
const printerConnected = (cfg: PrinterConfig) => cfg.lastTestStatus === "success";

// ── Ticket Mockup ──────────────────────────────────────────────────────────

function TicketMockup({ template, order, plantName }: { template: TicketTemplate; order?: Order; plantName?: string }) {
  const theme = useHostTheme();
  const today = new Date().toLocaleDateString("en-AU");
  const d: Record<string, string> = {
    ticket_no: order?.ticketNo ?? "002094",       order_no:  order?.orderNo ?? "ORD-18234",
    plant:     plantName ?? "Southpark Ready Mix", date:      today,
    batch_tm:  order?.batchTime ?? "14:32",        sched_del: order?.scheduledTime ?? "15:00",
    customer:  order?.customer ?? "Acme Construction Pty Ltd",
    deliv_adr: order?.deliveryAddress ?? "47 Builder St, Southpark",
    job_ref:   order?.jobRef ?? "JOB-2026-0891",  product:   order?.product ?? "32 MPa Normal Portland",
    volume:    order ? `${order.volume} m³` : "6.0 m³", vehicle: order?.vehicle ?? "TRK-047",
  };
  const sysF = template.systemFields.filter(f => f.enabled && f.id !== "ticket_no" && f.id !== "order_no");
  const addF = template.additionalFields.filter(f => f.enabled);
  return (
    <div style={{ border: `1px solid ${theme.stroke.secondary}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", background: theme.fill.secondary, borderBottom: `2px solid ${theme.stroke.primary}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack gap={1}><Text weight="bold" size="small">{template.companyName || "Company Name"}</Text>{template.showContact && <Text size="small" tone="tertiary">{template.contactNumber}</Text>}<Text size="small" tone="tertiary">DELIVERY TICKET</Text></Stack>
        <Stack gap={1} style={{ alignItems: "flex-end" }}><Text weight="bold">#{d.ticket_no}</Text><Text size="small" tone="secondary">{d.order_no}</Text></Stack>
      </div>
      <div style={{ padding: "8px 12px", background: theme.bg.elevated }}>
        <Text size="small" weight="semibold" tone="tertiary" style={{ display: "block", marginBottom: 6, fontSize: 10, letterSpacing: "0.05em" }}>SYSTEM DATA — PRINTED FROM PLATFORM</Text>
        <Stack gap={3}>{sysF.map(f => (<Row key={f.id} justify="space-between" align="center"><Text size="small" tone="secondary" style={{ minWidth: 130 }}>{f.customLabel || f.defaultLabel}</Text><Text size="small" weight={order ? "semibold" : "normal"}>{d[f.id] ?? ""}</Text></Row>))}</Stack>
      </div>
      {addF.length > 0 && (
        <div style={{ padding: "8px 12px", borderTop: `2px dashed ${theme.stroke.secondary}`, background: theme.fill.tertiary }}>
          <Text size="small" weight="semibold" tone="tertiary" style={{ display: "block", marginBottom: 6, fontSize: 10, letterSpacing: "0.05em" }}>DRIVER ADDITIONALS — COMPLETE BY HAND AT SITE</Text>
          <Stack gap={5}>{addF.map(f => (<Row key={f.id} justify="space-between" align="center"><Text size="small" tone="secondary" style={{ minWidth: 140, flexShrink: 0 }}>{f.label}</Text><div style={{ flex: 1, marginLeft: 8, borderBottom: `1px solid ${theme.stroke.secondary}`, height: f.tall ? 24 : 14 }} /></Row>))}</Stack>
        </div>
      )}
      <div style={{ padding: "4px 12px", borderTop: `1px solid ${theme.stroke.tertiary}`, background: theme.fill.secondary }}>
        <Text size="small" tone="tertiary" style={{ textAlign: "center", fontSize: 9, letterSpacing: "0.05em" }}>{order ? "OFFLINE FALLBACK · " : "TEMPLATE PREVIEW · "}{template.name.toUpperCase()} · {template.paperSize} · {template.copies} {template.copies > 1 ? "COPIES" : "COPY"}</Text>
      </div>
    </div>
  );
}

// ── Template Editor ────────────────────────────────────────────────────────

function TemplateEditor({ template, onUpdate }: { template: TicketTemplate; onUpdate: (t: TicketTemplate) => void }) {
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const up = (p: Partial<TicketTemplate>) => onUpdate({ ...template, ...p });
  const toggleSys = (id: string) => up({ systemFields: template.systemFields.map(f => f.id === id && !f.required ? { ...f, enabled: !f.enabled } : f) });
  const toggleAdd = (id: string) => up({ additionalFields: template.additionalFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f) });
  const addCustom = () => { if (!newFieldLabel.trim()) return; up({ additionalFields: [...template.additionalFields, { id: `c_${Date.now()}`, label: newFieldLabel.trim(), enabled: true, custom: true }] }); setNewFieldLabel(""); };
  return (
    <Stack gap={10}>
      <Card collapsible defaultOpen><CardHeader>Template Details</CardHeader><CardBody><Stack gap={12}><Stack gap={4}><Text size="small" weight="semibold">Template Name</Text><TextInput value={template.name} onChange={v => up({ name: v })} placeholder="e.g. Standard Delivery Ticket" /></Stack><Row align="center"><Stack gap={2} style={{ flex: 1, paddingRight: 16 }}><Text size="small" weight="semibold">Set as Company Default</Text><Text size="small" tone="secondary">Applied to all plants unless overridden</Text></Stack><Toggle checked={template.isDefault} onChange={v => up({ isDefault: v })} /></Row></Stack></CardBody></Card>
      <Card collapsible defaultOpen><CardHeader>Branding &amp; Layout</CardHeader><CardBody><Stack gap={10}><Stack gap={4}><Text size="small" weight="semibold">Company Name on Ticket</Text><TextInput value={template.companyName} onChange={v => up({ companyName: v })} placeholder="As it appears on the printed ticket" /></Stack><Row gap={8} align="center"><Toggle size="sm" checked={template.showContact} onChange={v => up({ showContact: v })} /><Text size="small">Show contact number on ticket</Text></Row>{template.showContact && <TextInput value={template.contactNumber} onChange={v => up({ contactNumber: v })} placeholder="e.g. 1300 000 000" />}<Row gap={12}><Stack gap={4} style={{ flex: 1 }}><Text size="small" weight="semibold">Paper Size</Text><Select value={template.paperSize} onChange={v => up({ paperSize: v as "A4" | "A5" })} options={PAPER_OPTIONS} /></Stack><Stack gap={4} style={{ flex: 1 }}><Text size="small" weight="semibold">Copies per Print</Text><Select value={String(template.copies)} onChange={v => up({ copies: Number(v) })} options={COPY_OPTIONS} /></Stack></Row></Stack></CardBody></Card>
      <Card collapsible defaultOpen={false}><CardHeader>System Fields</CardHeader><CardBody><Stack gap={4}><Text size="small" tone="secondary">Platform order fields printed automatically — no manual entry at the plant.</Text><Divider style={{ margin: "4px 0" }} />{template.systemFields.map(f => (<Row key={f.id} align="center" gap={10}><Checkbox checked={f.enabled} onChange={_ => toggleSys(f.id)} disabled={f.required} /><Text size="small" style={{ flex: 1 }}>{f.defaultLabel}</Text>{f.required && <Pill size="sm">Always shown</Pill>}</Row>))}</Stack></CardBody></Card>
      <Card collapsible defaultOpen={false}><CardHeader>Driver Additionals</CardHeader><CardBody><Stack gap={4}><Text size="small" tone="secondary">Blank lines for the driver to complete by hand at site. Add custom fields for your operational needs.</Text><Divider style={{ margin: "4px 0" }} />{template.additionalFields.map(f => (<Row key={f.id} align="center" gap={10}><Checkbox checked={f.enabled} onChange={_ => toggleAdd(f.id)} /><Text size="small" style={{ flex: 1 }}>{f.label}</Text>{f.custom && <Button variant="ghost" onClick={() => up({ additionalFields: template.additionalFields.filter(a => a.id !== f.id) })}>Remove</Button>}</Row>))}<Divider style={{ margin: "4px 0" }} /><Row gap={8} align="center"><TextInput value={newFieldLabel} onChange={setNewFieldLabel} placeholder="Add custom field label…" style={{ flex: 1 }} /><Button variant="secondary" onClick={addCustom} disabled={!newFieldLabel.trim()}>Add</Button></Row></Stack></CardBody></Card>
    </Stack>
  );
}

// ── Printer Setup Card ─────────────────────────────────────────────────────

function PrinterSetupCard({ plant, onUpdate }: { plant: Plant; onUpdate: (p: Plant) => void }) {
  const theme = useHostTheme();
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const cfg = plant.printerConfig;
  const upCfg = (partial: Partial<PrinterConfig>) => onUpdate({ ...plant, printerConfig: { ...cfg, ...partial } });
  function testConnection() {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      const ok = cfg.connectionType === "network" ? cfg.networkHost.trim() !== "" : cfg.connectionType === "print_server" ? cfg.serverName.trim() !== "" && cfg.shareName.trim() !== "" : true;
      upCfg({ lastTestStatus: ok ? "success" : "failed", lastTestTime: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }) });
    }, 1800);
  }
  const connected = printerConnected(cfg);
  const statusPill = connected ? <Pill size="sm" active>Connected</Pill> : cfg.lastTestStatus === "failed" ? <Pill size="sm">Test Failed</Pill> : <Pill size="sm">Not Tested</Pill>;
  return (
    <Card collapsible defaultOpen={!connected || plant.status !== "online"}>
      <CardHeader trailing={statusPill}>{plant.name}</CardHeader>
      <CardBody>
        <Stack gap={14}>
          <Callout tone="info" title="Local printer connection">The printer connects locally at the plant (USB or local LAN) and is independent of the internet or WAN link — it remains available even when the plant's external connectivity is down.</Callout>
          <Row gap={12} wrap>
            <Stack gap={2} style={{ flex: 1 }}><Text size="small" tone="secondary">Location</Text><Text size="small">{plant.location}</Text></Stack>
            <Stack gap={2}><Text size="small" tone="secondary">Plant status</Text><StatusDot status={plant.status} /></Stack>
            {cfg.lastTestTime && <Stack gap={2}><Text size="small" tone="secondary">Last test</Text><Text size="small">{cfg.lastTestTime} — {connected ? "OK" : "Failed"}</Text></Stack>}
          </Row>
          <Divider />
          <Stack gap={4}><Text size="small" weight="semibold">Printer Display Name</Text><TextInput value={cfg.printerName} onChange={v => upCfg({ printerName: v })} placeholder="e.g. SOUTH-PRN-01" /></Stack>
          <Stack gap={4}><Text size="small" weight="semibold">Connection Type</Text><Select value={cfg.connectionType} onChange={v => upCfg({ connectionType: v as ConnectionType, lastTestStatus: null, lastTestTime: null })} options={CONN_OPTIONS} /></Stack>
          {cfg.connectionType === "network" && (
            <Stack gap={10}>
              <Row gap={12}><Stack gap={4} style={{ flex: 2 }}><Text size="small" weight="semibold">IP Address / Hostname</Text><TextInput value={cfg.networkHost} onChange={v => upCfg({ networkHost: v })} placeholder="e.g. 192.168.10.105" /></Stack><Stack gap={4} style={{ flex: 1 }}><Text size="small" weight="semibold">Port</Text><TextInput value={cfg.networkPort} onChange={v => upCfg({ networkPort: v })} placeholder="9100" /></Stack></Row>
              <Stack gap={4}><Text size="small" weight="semibold">Print Protocol</Text><Select value={cfg.protocol} onChange={v => upCfg({ protocol: v as PrintProtocol })} options={PROTOCOL_OPTIONS} /></Stack>
            </Stack>
          )}
          {cfg.connectionType === "usb" && <Stack gap={4}><Text size="small" weight="semibold">USB / COM Port</Text><Select value={cfg.usbPort} onChange={v => upCfg({ usbPort: v })} options={USB_PORT_OPTIONS} /></Stack>}
          {cfg.connectionType === "print_server" && (
            <Stack gap={10}>
              <Stack gap={4}><Text size="small" weight="semibold">Server Name (UNC)</Text><TextInput value={cfg.serverName} onChange={v => upCfg({ serverName: v })} placeholder={`\\\\PRINT-SRV-01`} /></Stack>
              <Stack gap={4}><Text size="small" weight="semibold">Printer Share Name</Text><TextInput value={cfg.shareName} onChange={v => upCfg({ shareName: v })} placeholder="BATCH-PRN-01" /></Stack>
            </Stack>
          )}
          <Divider />
          <Row gap={10} align="center">
            <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: connected ? theme.accent.primary : cfg.lastTestStatus === "failed" ? "#e05252" : theme.stroke.secondary }} />
            <Text size="small" tone="secondary" style={{ flex: 1 }}>{testing ? "Sending test page…" : connected ? `Verified at ${cfg.lastTestTime} — ready for fallback` : cfg.lastTestStatus === "failed" ? `Failed at ${cfg.lastTestTime} — check connection details` : "Not yet tested. Run a test to confirm printer is ready."}</Text>
            <Button variant="secondary" onClick={testConnection} disabled={testing}>{testing ? "Testing…" : "Test Connection"}</Button>
            <Button variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? "Saved" : "Save"}</Button>
          </Row>
        </Stack>
      </CardBody>
    </Card>
  );
}

// ── Print Modal ────────────────────────────────────────────────────────────

function PrintModal({ plant, template, onClose }: { plant: Plant; template: TicketTemplate; onClose: () => void }) {
  const theme = useHostTheme();
  const [selId, setSelId] = useState(plant.pendingOrders[0]?.id ?? "");
  const [sent, setSent] = useState(false);
  const order = plant.pendingOrders.find(o => o.id === selId) ?? plant.pendingOrders[0];
  const cfg = plant.printerConfig;
  const ready = printerConnected(cfg);
  const orderOptions = plant.pendingOrders.map(o => ({ value: o.id, label: `${o.orderNo} — ${o.customer} (${o.volume} m³)` }));
  const overlay = { position: "fixed" as const, inset: 0, zIndex: 100, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" as const };
  const box = { background: theme.bg.elevated, border: `1px solid ${theme.stroke.secondary}`, borderRadius: 12, maxWidth: 500, width: "100%", margin: "auto" };
  if (sent && order) {
    return (
      <div style={overlay}><div style={{ ...box, padding: 32, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16, textAlign: "center" as const }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: theme.fill.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={theme.accent.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        <Text weight="semibold">Ticket #{order.ticketNo} sent to printer</Text>
        <Text size="small" tone="secondary">Sent to {cfg.printerName || "printer"} using "{template.name}" template ({template.paperSize}, {template.copies} {template.copies > 1 ? "copies" : "copy"}). Driver completes additionals at site. Ticket reconciles in Trackit on reconnect.</Text>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div></div>
    );
  }
  return (
    <div style={overlay}><div style={box}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${theme.stroke.tertiary}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stack gap={1}><Text weight="semibold">Print Delivery Ticket</Text><Text size="small" tone="secondary">{plant.name} — Offline Fallback — {template.name}</Text></Stack>
        <Button variant="ghost" onClick={onClose}><svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg></Button>
      </div>
      <Stack gap={12} style={{ padding: "14px 18px 18px" }}>
        <Callout tone="warning" title="Network unavailable — printing from system data">Platform and order data are intact. The locally connected printer is unaffected by the internet outage.</Callout>
        {!ready && <Callout tone="danger" title="Printer not verified">Configure and test the printer connection in the Printer Setup tab before printing.</Callout>}
        {plant.pendingOrders.length > 1 && <Stack gap={4}><Text size="small" weight="semibold">Select order to print</Text><Select value={selId} onChange={setSelId} options={orderOptions} /></Stack>}
        {order && <TicketMockup template={template} order={order} plantName={plant.name} />}
        <Row gap={8} justify="end"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!ready || !order} onClick={() => setSent(true)}>{ready ? "Send to Printer" : "Printer Not Ready"}</Button></Row>
      </Stack>
    </div></div>
  );
}

// ── Plant Card ─────────────────────────────────────────────────────────────

function PlantCard({ plant, globalEnabled, templates, onToggle, onTemplateChange, onPrint }: {
  plant: Plant; globalEnabled: boolean; templates: TicketTemplate[];
  onToggle: (id: string, v: boolean) => void;
  onTemplateChange: (id: string, tId: string) => void;
  onPrint: (plant: Plant) => void;
}) {
  const theme = useHostTheme();
  const isDown = plant.status !== "online";
  const ready  = printerConnected(plant.printerConfig);
  const canPrint = isDown && plant.printFallbackEnabled && ready && globalEnabled && plant.pendingOrders.length > 0;
  const templateOptions = [{ value: "default", label: "Company default" }, ...templates.map(t => ({ value: t.id, label: t.name }))];
  return (
    <div style={{ border: `1px solid ${isDown ? theme.stroke.primary : theme.stroke.tertiary}`, borderRadius: 8, padding: "14px 16px", background: theme.bg.elevated }}>
      <Row align="start" gap={12}>
        <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
          <Row gap={10} align="center" wrap><Text weight="semibold" truncate>{plant.name}</Text><StatusDot status={plant.status} />{plant.status === "offline" && plant.printFallbackEnabled && <Pill size="sm" active>Fallback Active</Pill>}</Row>
          <Text size="small" tone="tertiary">{plant.location}</Text>
          <Row gap={14} style={{ marginTop: 2 }}><Text size="small" tone={ready ? "secondary" : "tertiary"}>{ready ? `${plant.printerConfig.printerName || "Printer"} — connected` : plant.printerConfig.lastTestStatus === "failed" ? "Printer test failed — configure in Printer Setup" : "Printer not tested — configure in Printer Setup"}</Text>{isDown && plant.pendingOrders.length > 0 && <Text size="small" tone="secondary">{plant.pendingOrders.length} order{plant.pendingOrders.length > 1 ? "s" : ""} awaiting dispatch</Text>}</Row>
          <Row gap={8} align="center" style={{ marginTop: 4 }}><Text size="small" tone="secondary" style={{ flexShrink: 0 }}>Template:</Text><Select value={plant.templateId} onChange={v => onTemplateChange(plant.id, v)} options={templateOptions} style={{ flex: 1, maxWidth: 260 }} /></Row>
        </Stack>
        <Row gap={12} align="center" style={{ flexShrink: 0 }}>
          <Stack gap={5} style={{ alignItems: "flex-end" }}><Text size="small" tone="secondary">Print Fallback</Text><Toggle checked={plant.printFallbackEnabled} onChange={v => onToggle(plant.id, v)} disabled={!globalEnabled} /></Stack>
          {isDown && <Button variant={canPrint ? "primary" : "secondary"} disabled={!canPrint} onClick={() => onPrint(plant)}>Print Ticket</Button>}
        </Row>
      </Row>
      {plant.status === "offline" && !plant.printFallbackEnabled && <Callout tone="danger" style={{ marginTop: 10 }}>This plant is offline but printed ticket fallback is not enabled.</Callout>}
      {isDown && plant.printFallbackEnabled && !ready && <Callout tone="warning" style={{ marginTop: 10 }}>Fallback is enabled but the printer has not been configured or verified. Set it up in the Printer Setup tab.</Callout>}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const theme = useHostTheme();
  const [tab, setTab] = useState("about");
  const [plants, setPlants] = useState<Plant[]>(INIT_PLANTS);
  const [templates, setTemplates] = useState<TicketTemplate[]>(INIT_TEMPLATES);
  const [selTemplateId, setSelTemplateId] = useState("t1");
  const [config, setConfig] = useState<CompanyConfig>({
    globalFallbackEnabled: true, autoSwitchOnOffline: true, offlineThresholdSeconds: 30,
    autoReconcile: true, manualReview: false, alertDispatch: false,
  });
  const [printTarget, setPrintTarget] = useState<Plant | null>(null);
  const [saved, setSaved] = useState(false);
  const [flags, setFlags] = useCanvasState<Record<string, boolean>>("consideration_flags", {});

  const defaultTemplate  = templates.find(t => t.isDefault) ?? templates[0];
  const selTemplate      = templates.find(t => t.id === selTemplateId) ?? templates[0];
  const offlineCount     = plants.filter(p => p.status === "offline").length;
  const fallbackActive   = plants.filter(p => p.printFallbackEnabled).length;
  const printersReady    = plants.filter(p => printerConnected(p.printerConfig)).length;
  const ordersAwaiting   = plants.filter(p => p.status !== "online").reduce((n, p) => n + p.pendingOrders.length, 0);
  const flaggedCount     = CONSIDERATIONS.filter(c => flags[c.id]).length;

  const resolveTemplate = (plant: Plant) =>
    plant.templateId === "default" ? defaultTemplate : (templates.find(t => t.id === plant.templateId) ?? defaultTemplate);
  function updateTemplate(t: TicketTemplate) { setTemplates(ts => ts.map(x => x.id === t.id ? t : x)); }
  function updatePlant(p: Plant)             { setPlants(ps => ps.map(x => x.id === p.id ? p : x)); }
  function addTemplate() {
    const id = `t_${Date.now()}`;
    setTemplates(ts => [...ts, { id, name: "New Template", isDefault: false, companyName: defaultTemplate.companyName, showContact: false, contactNumber: "", paperSize: "A4", copies: 1, systemFields: makeSystemFields(), additionalFields: makeAdditionalFields() }]);
    setSelTemplateId(id);
  }
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2200); }

  const logRows = [
    ["#002094", "ORD-18234", "Southpark Ready Mix",   "Today 11:42", "J. Morrison", <Pill size="sm">Pending</Pill>],
    ["#002093", "ORD-18227", "Southpark Ready Mix",   "Today 10:18", "A. Chen",     <Pill size="sm">Pending</Pill>],
    ["#002092", "ORD-18219", "Southpark Ready Mix",   "Today 09:55", "B. Taylor",   <Pill size="sm">Pending</Pill>],
    ["#001146", "ORD-18201", "Eastgate Concrete",     "Yesterday",   "R. Smith",    <Pill size="sm" active>Reconciled</Pill>],
    ["#001145", "ORD-18198", "Eastgate Concrete",     "Yesterday",   "L. Jones",    <Pill size="sm" active>Reconciled</Pill>],
    ["#004820", "ORD-18180", "Northside Batch Plant", "Oct 19",      "P. Davis",    <Pill size="sm" active>Reconciled</Pill>],
  ];

  return (
    <Stack gap={20} style={{ padding: "24px 28px", maxWidth: 980, margin: "0 auto" }}>

      <Stack gap={8}>
        <Row align="center" gap={10}>
          <H1>Printed Ticket Fallback</H1>
          <Spacer />
          {offlineCount > 0 && <Pill size="sm">{offlineCount} plant{offlineCount > 1 ? "s" : ""} offline</Pill>}
        </Row>
        <Text tone="secondary">Trackit / Deliveries — Offline fallback mechanism for Batch Plant printed delivery tickets. Review the Overview &amp; Feedback tab first for full context.</Text>
      </Stack>

      <Row gap={20} wrap>
        <Stat value={plants.length}    label="Total plants" />
        <Stat value={offlineCount}     label="Currently offline"        tone={offlineCount   > 0 ? "danger"  : undefined} />
        <Stat value={ordersAwaiting}   label="Orders awaiting dispatch" tone={ordersAwaiting > 0 ? "warning" : undefined} />
        <Stat value={printersReady}    label="Printers verified"        tone={printersReady < plants.length ? "warning" : "success"} />
        <Stat value={flaggedCount}     label="Considerations flagged"   tone={flaggedCount   > 0 ? "info"    : undefined} />
      </Row>

      <Row gap={6} wrap>
        {TAB_OPTIONS.map(t => <Pill key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>{t.label}</Pill>)}
      </Row>
      <Divider />

      {/* ── OVERVIEW & FEEDBACK ── */}
      {tab === "about" && (
        <Stack gap={20}>

          <Callout tone="info" title="Customer scenario">
            A customer using Trackit and Deliveries for their delivery tickets has asked whether there is a fallback mechanism if the telephone or internet network goes down and tickets cannot be digitally processed. They want to enable printing of physical tickets at the Batch Plant, handed to the driver for the load — with the ability to select which plants switch to this mode and a configuration switch to enable it.
          </Callout>

          <Stack gap={8}>
            <Stack gap={3}>
              <H2>How the Fallback Works</H2>
              <Text size="small" tone="secondary">The core Trackit platform has switchover resilience and is unaffected by plant connectivity outages. All order data and ticket numbering remain correct throughout.</Text>
            </Stack>
            <div style={{ border: `1px solid ${theme.stroke.tertiary}`, borderRadius: 8, overflow: "hidden" }}>
              {FLOW_STEPS.map((step, i) => (
                <Row key={i} align="start" gap={14} style={{ padding: "12px 16px", borderBottom: i < FLOW_STEPS.length - 1 ? `1px solid ${theme.stroke.tertiary}` : "none", background: i % 2 === 0 ? theme.bg.elevated : theme.fill.tertiary }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: theme.accent.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Text size="small" weight="bold" style={{ color: theme.text.onAccent, fontSize: 11 }}>{i + 1}</Text>
                  </div>
                  <Stack gap={1} style={{ flex: 1 }}>
                    <Text weight="semibold" size="small">{step.title}</Text>
                    <Text size="small" tone="secondary">{step.desc}</Text>
                  </Stack>
                </Row>
              ))}
            </div>
          </Stack>

          <Stack gap={8}>
            <Stack gap={3}>
              <H2>Design Decisions &amp; Rationale</H2>
              <Text size="small" tone="secondary">Key decisions made in scoping this feature and the reasoning behind each. Expand to read.</Text>
            </Stack>
            <Stack gap={6}>
              {DESIGN_DECISIONS.map(d => (
                <Card key={d.id} collapsible defaultOpen={false}>
                  <CardHeader>{d.title}</CardHeader>
                  <CardBody>
                    <Stack gap={10}>
                      <Stack gap={3}><Text size="small" weight="semibold">Decision</Text><Text size="small" tone="secondary">{d.decision}</Text></Stack>
                      <Stack gap={3}><Text size="small" weight="semibold">Rationale</Text><Text size="small" tone="secondary">{d.rationale}</Text></Stack>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Stack gap={8}>
            <Row align="center">
              <Stack gap={3} style={{ flex: 1 }}>
                <H2>Open Considerations</H2>
                <Text size="small" tone="secondary">
                  Questions and decisions still to be confirmed. Toggle the items you want to raise, question, or discuss — your selections are saved and will persist when you return to this page.
                </Text>
              </Stack>
              {flaggedCount > 0 && <Stat value={flaggedCount} label="flagged" tone="info" />}
            </Row>

            <div style={{ border: `1px solid ${theme.stroke.tertiary}`, borderRadius: 8, overflow: "hidden" }}>
              {CONSIDERATIONS.map((c, i) => (
                <Row key={c.id} align="center" gap={14} style={{ padding: "13px 16px", borderBottom: i < CONSIDERATIONS.length - 1 ? `1px solid ${theme.stroke.tertiary}` : "none", background: flags[c.id] ? theme.fill.secondary : i % 2 === 0 ? theme.bg.elevated : theme.fill.tertiary }}>
                  <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                    <Row gap={8} align="center">
                      <Text size="small" weight="semibold">{c.title}</Text>
                      {flags[c.id] && <Pill size="sm" active>Flagged</Pill>}
                    </Row>
                    <Text size="small" tone="secondary">{c.desc}</Text>
                  </Stack>
                  <Stack gap={3} style={{ alignItems: "center", flexShrink: 0 }}>
                    <Text size="small" tone="tertiary" style={{ fontSize: 10 }}>Flag</Text>
                    <Toggle size="sm" checked={flags[c.id] ?? false} onChange={v => setFlags(f => ({ ...f, [c.id]: v }))} />
                  </Stack>
                </Row>
              ))}
            </div>

            {flaggedCount > 0 && (
              <Callout tone="info" title={`${flaggedCount} consideration${flaggedCount > 1 ? "s" : ""} flagged for discussion`}>
                {CONSIDERATIONS.filter(c => flags[c.id]).map(c => c.title).join(" · ")}
              </Callout>
            )}
          </Stack>

        </Stack>
      )}

      {/* ── COMPANY CONFIG ── */}
      {tab === "config" && (
        <Stack gap={16}>
          <Callout tone="info" title="Platform resilience — what stays up">The core Trackit platform and all order data are unaffected by a plant connectivity outage. Ticket numbering remains correct and sequential. Only digital delivery to the driver's device is blocked — so the system prints from the configured template instead.</Callout>
          <Card>
            <CardHeader>Company-Wide Fallback Settings</CardHeader>
            <CardBody>
              <Stack gap={0}>
                <Row align="center" style={{ padding: "14px 0" }}><Stack gap={4} style={{ flex: 1, paddingRight: 24 }}><Text weight="semibold">Enable Printed Ticket Fallback</Text><Text size="small" tone="secondary">Master switch. When off, printed ticket fallback is unavailable company-wide.</Text></Stack><Toggle checked={config.globalFallbackEnabled} onChange={v => setConfig(c => ({ ...c, globalFallbackEnabled: v }))} /></Row>
                <Divider />
                <Row align="center" style={{ padding: "14px 0" }}><Stack gap={4} style={{ flex: 1, paddingRight: 24 }}><Text weight="semibold" tone={config.globalFallbackEnabled ? "primary" : "tertiary"}>Auto-Switch on Offline Detection</Text><Text size="small" tone={config.globalFallbackEnabled ? "secondary" : "tertiary"}>Activates print mode automatically when a plant's connection drops — no manual intervention needed.</Text></Stack><Toggle checked={config.autoSwitchOnOffline} onChange={v => setConfig(c => ({ ...c, autoSwitchOnOffline: v }))} disabled={!config.globalFallbackEnabled} /></Row>
                <Divider />
                <Row align="center" style={{ padding: "14px 0" }}><Stack gap={4} style={{ flex: 1, paddingRight: 24 }}><Text weight="semibold" tone={(config.globalFallbackEnabled && config.autoSwitchOnOffline) ? "primary" : "tertiary"}>Offline Detection Threshold</Text><Text size="small" tone={(config.globalFallbackEnabled && config.autoSwitchOnOffline) ? "secondary" : "tertiary"}>How long connectivity must be absent before auto-switching to print mode.</Text></Stack><Select value={String(config.offlineThresholdSeconds)} onChange={v => setConfig(c => ({ ...c, offlineThresholdSeconds: Number(v) }))} options={THRESHOLD_OPTIONS} disabled={!config.globalFallbackEnabled || !config.autoSwitchOnOffline} style={{ width: 140 }} /></Row>
                <Divider />
                <Stack gap={10} style={{ padding: "14px 0" }}>
                  <Text weight="semibold">Reconciliation Options</Text>
                  <Text size="small" tone="secondary">Actions when connectivity is restored and offline tickets need to sync back into Trackit.</Text>
                  <Stack gap={8} style={{ paddingTop: 4 }}>
                    <Checkbox checked={config.autoReconcile}  onChange={v => setConfig(c => ({ ...c, autoReconcile: v }))}  label="Auto-reconcile printed tickets on reconnect (system data already correct)" />
                    <Checkbox checked={config.manualReview}   onChange={v => setConfig(c => ({ ...c, manualReview: v }))}   label="Flag for manual entry of driver additionals before closing" />
                    <Checkbox checked={config.alertDispatch}  onChange={v => setConfig(c => ({ ...c, alertDispatch: v }))}  label="Alert dispatch team when a plant switches to fallback mode" />
                  </Stack>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
          <Row gap={8} justify="end"><Button variant="ghost">Reset to defaults</Button><Button variant="primary" onClick={handleSave}>{saved ? "Saved" : "Save Changes"}</Button></Row>
        </Stack>
      )}

      {/* ── TICKET TEMPLATES ── */}
      {tab === "templates" && (
        <Stack gap={14}>
          <Stack gap={4}><H2>Ticket Templates</H2><Text size="small" tone="secondary">Configure layout, branding, and fields for printed fallback tickets. System fields print from live order data automatically. Driver additionals are blank lines for handwriting at site.</Text></Stack>
          <Row gap={6} wrap align="center">
            {templates.map(t => <Pill key={t.id} active={selTemplateId === t.id} onClick={() => setSelTemplateId(t.id)}>{t.name}{t.isDefault ? " — Default" : ""}</Pill>)}
            <Button variant="secondary" onClick={addTemplate}>New Template</Button>
          </Row>
          <Divider />
          <Grid columns={2} gap={20} align="start">
            <TemplateEditor template={selTemplate} onUpdate={updateTemplate} />
            <Stack gap={10}>
              <Stack gap={3}><H3>Live Preview</H3><Text size="small" tone="secondary">Updates as you edit. Sample order data shown.</Text></Stack>
              <TicketMockup template={selTemplate} />
              <Callout tone="neutral">This template controls what appears on every ticket printed at any plant assigned to it during a fallback event.</Callout>
              <Row gap={8} justify="end">
                {templates.length > 1 && !selTemplate.isDefault && <Button variant="ghost" onClick={() => { const r = templates.filter(t => t.id !== selTemplate.id); setTemplates(r); setSelTemplateId(r[0].id); }}>Delete Template</Button>}
                <Button variant="primary" onClick={handleSave}>{saved ? "Saved" : "Save Template"}</Button>
              </Row>
            </Stack>
          </Grid>
        </Stack>
      )}

      {/* ── PRINTER SETUP ── */}
      {tab === "printers" && (
        <Stack gap={14}>
          <Stack gap={4}><H2>Printer Setup</H2><Text size="small" tone="secondary">Configure the local printer connection for each plant. Each printer connects locally (USB or local network) and operates independently of the internet. Run a test on each plant to confirm the printer is ready before a fallback event occurs.</Text></Stack>
          {plants.filter(p => !printerConnected(p.printerConfig)).length > 0 && (
            <Callout tone="warning" title="Some plants have unverified printers">
              {plants.filter(p => !printerConnected(p.printerConfig)).map(p => p.name).join(", ")} {plants.filter(p => !printerConnected(p.printerConfig)).length === 1 ? "has" : "have"} no verified printer. Expand below to configure and test.
            </Callout>
          )}
          <Stack gap={8}>{plants.map(p => <PrinterSetupCard key={p.id} plant={p} onUpdate={updatePlant} />)}</Stack>
        </Stack>
      )}

      {/* ── PLANT MANAGEMENT ── */}
      {tab === "plants" && (
        <Stack gap={14}>
          <Row align="center"><Stack gap={4} style={{ flex: 1 }}><H2>Plant Fallback Configuration</H2><Text size="small" tone="secondary">Enable fallback per plant and assign a ticket template. Printer must be configured and verified in Printer Setup before fallback can print.</Text></Stack><Text size="small" tone="secondary">{fallbackActive} of {plants.length} enabled</Text></Row>
          {!config.globalFallbackEnabled && <Callout tone="warning" title="Global fallback is disabled">Per-plant toggles are saved but inactive. Enable in Company Config first.</Callout>}
          <Stack gap={8}>{plants.map(p => (<PlantCard key={p.id} plant={p} globalEnabled={config.globalFallbackEnabled} templates={templates} onToggle={(id, v) => setPlants(ps => ps.map(x => x.id === id ? { ...x, printFallbackEnabled: v } : x))} onTemplateChange={(id, tId) => setPlants(ps => ps.map(x => x.id === id ? { ...x, templateId: tId } : x))} onPrint={setPrintTarget} />))}</Stack>
        </Stack>
      )}

      {/* ── OFFLINE ACTIVITY LOG ── */}
      {tab === "log" && (
        <Stack gap={16}>
          <Stack gap={4}><H2>Offline Activity Log</H2><Text size="small" tone="secondary">Tickets issued in printed fallback mode. System order data is already correct — only driver additionals may need manual capture on reconnect.</Text></Stack>
          <Row gap={24} wrap><Stat value={14} label="Tickets printed (7 days)" /><Stat value={3} label="Pending reconciliation" tone="warning" /><Stat value={11} label="Reconciled" tone="success" /></Row>
          <Table headers={["Ticket #", "Order #", "Plant", "Issued", "Driver", "Status"]} rows={logRows} striped rowTone={["warning","warning","warning","success","success","success"]} />
          <Callout tone="info">Pending tickets reconcile automatically on reconnect. If driver additionals need capturing, the manual review option holds them for entry before closing.</Callout>
        </Stack>
      )}

      {printTarget && <PrintModal plant={printTarget} template={resolveTemplate(printTarget)} onClose={() => setPrintTarget(null)} />}
    </Stack>
  );
}
