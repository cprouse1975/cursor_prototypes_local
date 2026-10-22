# Trackit – Printed Ticket Fallback Prototype

**Live interactive canvas:**
https://cursor.com/canvas/store-a5061daa-b21e-403a-aabb-4ce6ab1db1a3/38d9dea7-8521-41d2-ba90-765459424510

**Raised by:** Caroline Prouse  
**Product area:** Trackit / Deliveries

---

## What this prototype covers

A customer enquired whether Trackit has a fallback mechanism for when the telephone or internet network goes down and delivery tickets cannot be digitally processed. This prototype explores a configuration-driven solution that allows plant operators to print physical delivery tickets locally when connectivity is lost.

The core Trackit platform has switchover resilience and is unaffected by plant connectivity outages — ticket numbering and all order data remain correct. Only the delivery of ticket data to the driver's device is blocked, so the system switches to locally connected printer output instead.

## Prototype tabs

| Tab | What it covers |
|-----|---------------|
| **Overview & Feedback** | Customer scenario, 8-step fallback flow, design decisions with rationale, and 10 open considerations with interactive flagging |
| **Company Config** | Global master switch, auto-switch threshold, reconciliation options |
| **Ticket Templates** | Template builder with live preview — system fields, driver additionals, branding, paper size, copies |
| **Printer Setup** | Per-plant printer configuration (Network/IP, USB, Windows Print Server) with test connection |
| **Plant Management** | Per-plant fallback enable/disable, template assignment, print action when offline |
| **Offline Activity Log** | Audit of printed tickets with reconciliation status |

## Open considerations (requiring feedback)

Open the **Overview & Feedback** tab in the live canvas and use the flag toggles to mark items for discussion. Key questions include:

1. Further fallback if the printer also fails (paper ticket books?)
2. Who reconciles driver additionals after reconnect?
3. QR code / barcode on the ticket for faster reconciliation?
4. Thermal / label printer support (Zebra, Epson TM series)?
5. Multi-copy labelling — who gets which copy?
6. Manual override to force print mode when online?
7. Reconciliation time window and escalation alerts?
8. Separate audit trail for offline-issued tickets?
9. Regulatory / compliance requirements for delivery dockets?
10. Platform-also-down edge case — fully offline mode?

## Simplified approach (v2)

A second, simpler prototype explores a single company-level toggle with no per-plant configuration:

**Live canvas:** https://cursor.com/canvas/store-a5061daa-b21e-403a-aabb-4ce6ab1db1a3/326db5a1-a468-4e24-b70d-b0397b1fe5bd

| | Simple (v2) | Full config (v1) |
|---|---|---|
| Switch | One company toggle | Global + per-plant |
| Printer setup | Outside the system | Configured per plant in system |
| Templates | One shared | Multiple, per-plant assignment |
| Failover | Manual (admin decision) | Auto-detect + threshold |
| Best for | Quick setup, all plants similar | Mixed readiness, automation needed |

## Source files

- `trackit-printed-ticket-fallback.canvas.tsx` — Full configuration prototype (v1)
- `trackit-manual-ticket-mode-simplified.canvas.tsx` — Simplified company-level prototype (v2)
