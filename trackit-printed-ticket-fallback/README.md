# Trackit & Deliveries — Printed Ticket Fallback (Prototype)

Standalone HTML prototype exploring a fallback mechanism for the **Trackit / Deliveries** workflow: when the telephone or internet network goes down, authorised plants can switch to **printing** delivery tickets at the batch plant and hand them to the driver, with reconciliation back into Deliveries once connectivity returns.

## How to view

Open [`prototype.html`](./prototype.html) directly in any modern browser (double-click, or drag it into a tab). No build step, no dependencies.

## What the prototype demonstrates

1. **Company Config → Ticketing → Printed Ticket Fallback**
   - Primary company-wide switch (feature on/off).
   - Scope selector: *All plants (company-wide)*, *Selected plants only*, or *Allow plant supervisor to toggle on-site*.
   - Manual ticket number series (default prefix `M-`) so printed tickets can be reconciled without clashing with digital numbers.
   - Signature capture, default printer, "require re-entry when network returns", "auto-exit fallback when network restored", and audit-log options.
   - Role gating: who can toggle fallback (dispatcher, plant supervisor, batchman).

2. **Plants** page
   - Pick which plants are *allowed* to enter fallback.
   - Shows which plants are *currently* in fallback.

3. **Batch Plant operator console**
   - Live network / ticket-mode / printer / sync-queue status tiles.
   - **Outage banner** appears automatically if Deliveries is unreachable and this plant is eligible — one-click "Enter Fallback Mode".
   - **Fallback banner** stays visible while active, with a "Return to Digital" exit.
   - Ticket preview changes from a *DIGITAL* ticket (uploaded to Deliveries) to a *MANUAL TICKET* with a watermark and `PENDING UPLOAD` footer. Clicking **Print & Hand to Driver** opens the browser print dialog with only the ticket.
   - The dispatch button changes from "Dispatch (Digital)" to "Print & Hand to Driver" in fallback mode.

4. **Sync Queue**
   - Every manual ticket is listed with its `M-…` number, plant, order, customer, mix, qty and print time.
   - Reconcile one ticket (opens a modal to confirm order match, signatures, variance notes) or **Reconcile All** at once — only possible when the network is back online.

5. **Simulate Outage** button (top-right)
   - Toggles the pretend network state so the whole flow can be demoed end-to-end: online → outage → enter fallback → print → restore network → reconcile.

## Suggested demo script

1. Open `prototype.html`. You start on **Batch Plant** at North Plant, network online, digital mode.
2. Click **Simulate Outage** — a red banner offers *Enter Fallback Mode*.
3. Click **Enter Fallback Mode**. The ticket preview flips to a watermarked **MANUAL TICKET** with number `M-NO-YYYYMM-0001`.
4. Click **Print & Hand to Driver**. The browser print dialog opens with just the ticket; cancel it to continue the demo.
5. Open the **Sync Queue** (left nav) — the printed ticket is listed as *Pending*.
6. Click **Simulate Outage** again to restore the network. Plants auto-exit fallback (per default config).
7. Back in **Sync Queue**, click **Reconcile** on a row, confirm, and watch it move to *Reconciled*.
8. Open **Company Config → Ticketing** to show stakeholders where the master switch lives, and **Plants** to show per-plant selection.

## Scope / caveats

- Pure front-end prototype. No real printer, no real Deliveries API, no persistence between page reloads.
- The data (plants, order, driver, truck) is hard-coded demo data.
- The Dispatch Board left-nav entry is a stub.
- Default demo state: feature is pre-enabled so reviewers immediately see the switch; in production the default would be *off*.
