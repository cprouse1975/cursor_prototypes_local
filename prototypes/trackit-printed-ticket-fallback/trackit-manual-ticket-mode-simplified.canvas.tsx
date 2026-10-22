
import {
  useState,
  Stack, Row, Grid, Card, CardHeader, CardBody,
  H1, H2, H3, Text, Divider, Spacer,
  Button, Pill, Toggle, Checkbox, Select, TextInput,
  Stat, Callout,
  useHostTheme,
} from "cursor/canvas";

// ── Types ──────────────────────────────────────────────────────────────────

interface SystemField {
  id: string; defaultLabel: string; enabled: boolean; required: boolean;
}
interface AdditionalField {
  id: string; label: string; enabled: boolean; custom: boolean; tall?: boolean;
}
interface TicketTemplate {
  companyName: string; showContact: boolean; contactNumber: string;
  paperSize: "A4" | "A5"; copies: number;
  systemFields: SystemField[]; additionalFields: AdditionalField[];
}

// ── Initial data ───────────────────────────────────────────────────────────

const makeSystemFields = (): SystemField[] => [
  { id: "ticket_no", defaultLabel: "Ticket Number",       enabled: true, required: true  },
  { id: "order_no",  defaultLabel: "Order Number",        enabled: true, required: false },
  { id: "plant",     defaultLabel: "Plant",               enabled: true, required: false },
  { id: "date",      defaultLabel: "Date",                enabled: true, required: false },
  { id: "batch_tm",  defaultLabel: "Batch Time",          enabled: true, required: false },
  { id: "sched_del", defaultLabel: "Scheduled Delivery",  enabled: true, required: false },
  { id: "customer",  defaultLabel: "Customer",            enabled: true, required: false },
  { id: "deliv_adr", defaultLabel: "Delivery Address",    enabled: true, required: false },
  { id: "job_ref",   defaultLabel: "Job Reference",       enabled: true, required: false },
  { id: "product",   defaultLabel: "Product / Mix",       enabled: true, required: false },
  { id: "volume",    defaultLabel: "Volume Ordered (m³)", enabled: true, required: false },
  { id: "vehicle",   defaultLabel: "Vehicle",             enabled: true, required: false },
];
const makeAdditionalFields = (): AdditionalField[] => [
  { id: "arr_time",  label: "Actual Arrival Time",          enabled: true,  custom: false },
  { id: "dep_time",  label: "Actual Departure Time",        enabled: true,  custom: false },
  { id: "slump",     label: "Slump at Delivery (mm)",       enabled: true,  custom: false },
  { id: "water",     label: "Site Additions — Water (L)",   enabled: true,  custom: false },
  { id: "additions", label: "Site Additions — Other",       enabled: true,  custom: false },
  { id: "act_vol",   label: "Actual Volume Delivered (m³)", enabled: true,  custom: false },
  { id: "site_rep",  label: "Site Contact / Rep",           enabled: true,  custom: false },
  { id: "cust_sig",  label: "Customer Signature",           enabled: true,  custom: false, tall: true },
  { id: "drv_sig",   label: "Driver Signature",             enabled: true,  custom: false, tall: true },
];
const INIT_TEMPLATE: TicketTemplate = {
  companyName: "Acme Concrete Group", showContact: true, contactNumber: "1300 000 000",
  paperSize: "A4", copies: 2,
  systemFields: makeSystemFields(), additionalFields: makeAdditionalFields(),
};

// ── Constants ──────────────────────────────────────────────────────────────

const PAPER_OPTIONS = [{ value: "A4", label: "A4" }, { value: "A5", label: "A5" }];
const COPY_OPTIONS  = [{ value: "1", label: "1 copy" }, { value: "2", label: "2 copies" }, { value: "3", label: "3 copies" }];
const TAB_OPTIONS   = [
  { value: "about",    label: "Overview"        },
  { value: "setting",  label: "Company Setting" },
  { value: "template", label: "Ticket Template" },
];

const FLOW_STEPS = [
  { title: "Admin enables Manual Ticket Mode",
    desc: "A single toggle in Company Settings turns on printed tickets for every plant. No per-plant configuration required." },
  { title: "All plants switch to printed ticket mode immediately",
    desc: "Every plant across the company now issues physical tickets. Plant staff print from any locally connected printer — the system doesn't need to know about the printer." },
  { title: "Plant staff select the order and print",
    desc: "All order details (ticket number, customer, product, volume, etc.) are drawn from the platform and pre-printed on the ticket automatically." },
  { title: "Driver receives the ticket and completes additionals by hand",
    desc: "The template defines what prints (system data) and what the driver fills in at site — slump, actual volume, site additions, signatures." },
];

const COMPARE_SIMPLE = [
  "One company-level switch — on or off",
  "All plants in or out together",
  "No printer setup inside the system",
  "One shared ticket template company-wide",
  "Admin makes a conscious decision to enable",
  "Simplest to set up, explain, and support",
  "Works whether the outage is internet, platform, or both",
];

const COMPARE_FULL = [
  "Per-plant enable / disable granularity",
  "Auto-detect connectivity loss and switch automatically",
  "Printer configured and tested per plant in the system",
  "Multiple templates, assigned per plant",
  "Automated failover with configurable thresholds",
  "More control, more configuration overhead",
  "Assumes the platform is always available to detect outages",
];

// ── Ticket Mockup ──────────────────────────────────────────────────────────

function TicketMockup({ template }: { template: TicketTemplate }) {
  const theme = useHostTheme();
  const today = new Date().toLocaleDateString("en-AU");
  const sample: Record<string, string> = {
    ticket_no: "002094", order_no: "ORD-18234", plant: "Southpark Ready Mix",
    date: today, batch_tm: "14:32", sched_del: "15:00",
    customer: "Acme Construction Pty Ltd", deliv_adr: "47 Builder St, Southpark",
    job_ref: "JOB-2026-0891", product: "32 MPa Normal Portland",
    volume: "6.0 m³", vehicle: "TRK-047",
  };
  const sysF = template.systemFields.filter(f => f.enabled && f.id !== "ticket_no" && f.id !== "order_no");
  const addF = template.additionalFields.filter(f => f.enabled);
  return (
    <div style={{ border: `1px solid ${theme.stroke.secondary}`, borderRadius: 8, overflow: "hidden", fontSize: 13 }}>
      <div style={{ padding: "10px 14px", background: theme.fill.secondary, borderBottom: `2px solid ${theme.stroke.primary}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack gap={1}>
          <Text weight="bold" size="small">{template.companyName || "Company Name"}</Text>
          {template.showContact && <Text size="small" tone="tertiary">{template.contactNumber}</Text>}
          <Text size="small" tone="tertiary">DELIVERY TICKET</Text>
        </Stack>
        <Stack gap={1} style={{ alignItems: "flex-end" }}>
          <Text weight="bold">#002094</Text>
          <Text size="small" tone="secondary">ORD-18234</Text>
        </Stack>
      </div>
      <div style={{ padding: "10px 14px", background: theme.bg.elevated }}>
        <Text size="small" weight="semibold" tone="tertiary" style={{ display: "block", marginBottom: 8, fontSize: 10, letterSpacing: "0.06em" }}>SYSTEM DATA — PRE-PRINTED FROM PLATFORM</Text>
        <Stack gap={4}>
          {sysF.map(f => (
            <Row key={f.id} justify="space-between" align="center">
              <Text size="small" tone="secondary" style={{ minWidth: 140 }}>{f.defaultLabel}</Text>
              <Text size="small" weight="semibold">{sample[f.id] ?? ""}</Text>
            </Row>
          ))}
        </Stack>
      </div>
      {addF.length > 0 && (
        <div style={{ padding: "10px 14px", borderTop: `2px dashed ${theme.stroke.secondary}`, background: theme.fill.tertiary }}>
          <Text size="small" weight="semibold" tone="tertiary" style={{ display: "block", marginBottom: 8, fontSize: 10, letterSpacing: "0.06em" }}>DRIVER ADDITIONALS — COMPLETE BY HAND AT SITE</Text>
          <Stack gap={6}>
            {addF.map(f => (
              <Row key={f.id} justify="space-between" align="center">
                <Text size="small" tone="secondary" style={{ minWidth: 150, flexShrink: 0 }}>{f.label}</Text>
                <div style={{ flex: 1, marginLeft: 10, borderBottom: `1px solid ${theme.stroke.secondary}`, height: f.tall ? 26 : 14 }} />
              </Row>
            ))}
          </Stack>
        </div>
      )}
      <div style={{ padding: "5px 14px", borderTop: `1px solid ${theme.stroke.tertiary}`, background: theme.fill.secondary }}>
        <Text size="small" tone="tertiary" style={{ textAlign: "center", fontSize: 9, letterSpacing: "0.05em" }}>
          MANUAL TICKET MODE · {template.paperSize} · {template.copies} {template.copies > 1 ? "COPIES" : "COPY"}
        </Text>
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
  const addField  = () => { if (!newLabel.trim()) return; up({ additionalFields: [...template.additionalFields, { id: `c_${Date.now()}`, label: newLabel.trim(), enabled: true, custom: true }] }); setNewLabel(""); };
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
        <CardHeader>System Fields</CardHeader>
        <CardBody>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Printed automatically from platform order data.</Text>
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
        <CardHeader>Driver Additionals</CardHeader>
        <CardBody>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Blank lines the driver fills in by hand at site.</Text>
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
              <TextInput value={newLabel} onChange={setNewLabel} placeholder="Add custom field…" style={{ flex: 1 }} />
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
  const [tab, setTab]           = useState("about");
  const [enabled, setEnabled]   = useState(false);
  const [template, setTemplate] = useState<TicketTemplate>(INIT_TEMPLATE);
  const [saved, setSaved]       = useState(false);

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <Stack gap={20} style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>

      <Stack gap={6}>
        <Row align="center" gap={10}>
          <H1>Manual Ticket Mode</H1>
          <Spacer />
          <Pill size="sm" active={enabled}>{enabled ? "Enabled — all plants" : "Disabled"}</Pill>
        </Row>
        <Text tone="secondary">Trackit / Deliveries — Simplified company-wide fallback. One switch, all plants, one shared template.</Text>
      </Stack>

      <Row gap={20} wrap>
        <Stat value={enabled ? "On" : "Off"} label="Manual ticket mode"   tone={enabled ? "success" : undefined} />
        <Stat value={4}                       label="Plants affected"       tone={enabled ? "warning" : undefined} />
        <Stat value={template.copies}         label="Copies per ticket" />
        <Stat value={template.paperSize}      label="Paper size" />
      </Row>

      <Row gap={6} wrap>
        {TAB_OPTIONS.map(t => <Pill key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>{t.label}</Pill>)}
      </Row>
      <Divider />

      {/* ── OVERVIEW ── */}
      {tab === "about" && (
        <Stack gap={20}>

          <Callout tone="info" title="Simpler approach — one switch, all plants">
            Instead of configuring each plant individually with printer connections, auto-detect thresholds, and separate templates, this approach uses a single company-level toggle. When enabled, every plant immediately switches to printed delivery tickets using one shared template. Printer setup stays local to each plant and outside the system.
          </Callout>

          <Stack gap={8}>
            <H2>How it works</H2>
            <div style={{ border: `1px solid ${theme.stroke.tertiary}`, borderRadius: 8, overflow: "hidden" }}>
              {FLOW_STEPS.map((step, i) => (
                <Row key={i} align="start" gap={14} style={{ padding: "13px 16px", borderBottom: i < FLOW_STEPS.length - 1 ? `1px solid ${theme.stroke.tertiary}` : "none", background: i % 2 === 0 ? theme.bg.elevated : theme.fill.tertiary }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: theme.accent.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Text size="small" weight="bold" style={{ color: theme.text.onAccent, fontSize: 12 }}>{i + 1}</Text>
                  </div>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text weight="semibold" size="small">{step.title}</Text>
                    <Text size="small" tone="secondary">{step.desc}</Text>
                  </Stack>
                </Row>
              ))}
            </div>
          </Stack>

          <Stack gap={8}>
            <Stack gap={3}>
              <H2>Simple vs full configuration</H2>
              <Text size="small" tone="secondary">Both approaches produce the same end result — a printed ticket with system data pre-filled and driver additionals left blank. The difference is how much is configured in the system.</Text>
            </Stack>
            <Grid columns={2} gap={12}>
              <Card>
                <CardHeader trailing={<Pill size="sm" active>This approach</Pill>}>Simple — company switch</CardHeader>
                <CardBody>
                  <Stack gap={6}>
                    {COMPARE_SIMPLE.map((item, i) => (
                      <Row key={i} align="start" gap={8}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.accent.primary, flexShrink: 0, marginTop: 5 }} />
                        <Text size="small" tone="secondary">{item}</Text>
                      </Row>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
              <Card>
                <CardHeader trailing={<Pill size="sm">Full config</Pill>}>Complex — per-plant control</CardHeader>
                <CardBody>
                  <Stack gap={6}>
                    {COMPARE_FULL.map((item, i) => (
                      <Row key={i} align="start" gap={8}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.stroke.secondary, flexShrink: 0, marginTop: 5 }} />
                        <Text size="small" tone="secondary">{item}</Text>
                      </Row>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
            </Grid>
          </Stack>

          <Stack gap={8}>
            <H2>When to use which approach</H2>
            <Grid columns={2} gap={12}>
              <Callout tone="success" title="Use the simple approach when…">
                The customer wants a quick, low-maintenance solution. All plants are similarly equipped. The priority is ease of setup and support over operational granularity.
              </Callout>
              <Callout tone="neutral" title="Use the full approach when…">
                Plants have different readiness levels. Automated failover is important. Some plants need different ticket formats. IT wants the printer connection managed in the system.
              </Callout>
            </Grid>
          </Stack>

        </Stack>
      )}

      {/* ── COMPANY SETTING ── */}
      {tab === "setting" && (
        <Stack gap={16}>

          <Card>
            <CardHeader>Manual Ticket Mode</CardHeader>
            <CardBody>
              <Stack gap={0}>
                <Row align="center" style={{ padding: "16px 0" }}>
                  <Stack gap={4} style={{ flex: 1, paddingRight: 24 }}>
                    <Text weight="semibold">Enable printed tickets company-wide</Text>
                    <Text size="small" tone="secondary">
                      When on, all plants switch to printed delivery tickets immediately. The system generates each ticket from your company template — plant staff print it on any locally connected printer and hand it to the driver. Site-specific fields are completed by hand.
                    </Text>
                  </Stack>
                  <Toggle checked={enabled} onChange={setEnabled} />
                </Row>

                {enabled && (
                  <>
                    <Divider />
                    <div style={{ padding: "14px 0" }}>
                      <Callout tone="warning" title="Manual ticket mode is active — all plants">
                        Every delivery ticket across all plants is now issued as a printed document. Drivers complete site-specific fields by hand at the point of delivery. Disable this setting when connectivity is restored to return to digital tickets.
                      </Callout>
                    </div>
                  </>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>How plant staff print tickets</CardHeader>
            <CardBody>
              <Stack gap={10}>
                <Callout tone="info" title="Printer setup stays outside the system">
                  Each plant connects their own local printer (USB or local network). Because it's a local connection it's unaffected by any internet or WAN outage. The system doesn't need to know which printer a plant uses — it just generates the ticket document.
                </Callout>
                <Stack gap={6}>
                  {[
                    "Plant operator opens the order in Trackit as normal",
                    "Selects 'Print ticket' — system populates all order data from the platform",
                    "Ticket prints on the plant's locally connected printer",
                    "Driver receives the printed ticket and completes additionals at the delivery site",
                  ].map((step, i) => (
                    <Row key={i} align="start" gap={10}>
                      <Text size="small" weight="semibold" style={{ width: 18, flexShrink: 0, color: theme.accent.primary }}>{i + 1}.</Text>
                      <Text size="small" tone="secondary">{step}</Text>
                    </Row>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Row gap={8} justify="end">
            <Button variant="primary" onClick={handleSave}>{saved ? "Saved" : "Save Setting"}</Button>
          </Row>

        </Stack>
      )}

      {/* ── TICKET TEMPLATE ── */}
      {tab === "template" && (
        <Stack gap={14}>
          <Stack gap={4}>
            <H2>Ticket Template</H2>
            <Text size="small" tone="secondary">
              One template applies to all plants. Configure your company branding, which system fields to include, and the driver additionals section. The live preview updates as you edit.
            </Text>
          </Stack>
          <Divider />
          <Grid columns={2} gap={20} align="start">
            <TemplateEditor template={template} onUpdate={setTemplate} />
            <Stack gap={10}>
              <Stack gap={3}>
                <H3>Live Preview</H3>
                <Text size="small" tone="secondary">Sample order data shown. System fields print from the platform automatically.</Text>
              </Stack>
              <TicketMockup template={template} />
              <Callout tone="neutral">
                The top section prints automatically from platform data. The dashed section is blank ruled lines — the driver fills these in at the delivery site.
              </Callout>
              <Row gap={8} justify="end">
                <Button variant="primary" onClick={handleSave}>{saved ? "Saved" : "Save Template"}</Button>
              </Row>
            </Stack>
          </Grid>
        </Stack>
      )}

    </Stack>
  );
}
