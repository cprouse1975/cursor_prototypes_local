# Trackit – Batch Queue & Offline Print Mode

**Live canvas:** https://cursor.com/canvas/store-a5061daa-b21e-403a-aabb-4ce6ab1db1a3/4981d0e7-cf71-4652-bd79-e5f88f4ea0ab

**Raised by:** Caroline Prouse | **Product area:** Trackit / Deliveries

---

## Concept

The batch queue operates in two modes controlled by a single **Offline mode toggle**, always visible at the top of the page.

**Toggle OFF (normal operation)**
The batch team clicks **Batch Ticket** on each order. The ticket is sent digitally to Trackit and to the driver in Deliveries — the standard workflow, unchanged.

**Toggle ON (network outage)**
The button changes to **Batch & Print**. Clicking it generates a print-formatted ticket pre-populated with all dispatch order data, opens the OS print dialog, and the ticket prints at the plant's locally connected printer. The batch confirmation and ticket data are queued in the system and sync automatically to Trackit and Deliveries once the network is restored. The driver leaves with a physical ticket — no dispatch delay.

## Tabs

| Tab | What it shows |
|-----|--------------|
| **Batch Queue** | Live interactive queue — button label and behaviour change based on the Offline mode toggle. Click Batch Ticket or Batch & Print on any order to walk through the flow. |
| **Pending Sync** | All tickets printed during offline mode, queued for reconciliation. Sync Now triggers bulk sync to Trackit and Deliveries. |
| **Ticket Template** | Configure branding, paper size, copies, which system fields to include, and which driver additionals (blank lines) appear. Live preview updates immediately. |

## How the ticket prints

Trackit generates a print-formatted document and calls `window.print()`, which opens the OS print dialog. The plant's printer (installed on the plant PC by IT once, via USB or LAN) is selected there. No printer configuration is needed inside Trackit. For thermal/receipt printers (Zebra, Epson TM), QZ Tray middleware can bypass the OS dialog for single-click printing.

## Ticket structure

| Section | How it's filled |
|---------|----------------|
| **System data** (top) | Auto-populated from the dispatch order at batch time — ticket number, order number, plant, date/time, customer, address, product, vehicle, driver |
| **Driver additionals** (dashed section) | Blank ruled lines the driver completes by hand at site — arrival/departure times, slump, water additions, actual volume, signatures |

## Mode comparison

| | Toggle OFF (online) | Toggle ON (offline) |
|---|---|---|
| Button label | Batch Ticket | Batch & Print |
| Ticket delivery | Digital — Trackit + Deliveries | Physical print at plant printer |
| Trackit sync | Immediate | Queued, syncs on reconnect |
| Driver receives ticket | Via Deliveries app | Physical paper copy |
| System record | Live | Queued in Pending Sync tab |

## Source file

`trackit-batch-plant-ticket-printing.canvas.tsx` — Cursor Canvas (React, `cursor/canvas` SDK).
