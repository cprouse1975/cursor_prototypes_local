# Trackit – Batch Plant Ticket Printing

**Live canvas:** https://cursor.com/canvas/store-a5061daa-b21e-403a-aabb-4ce6ab1db1a3/4981d0e7-cf71-4652-bd79-e5f88f4ea0ab

**Raised by:** Caroline Prouse | **Product area:** Trackit / Deliveries

---

## Concept

For any dispatched order that is batched and ticketed, the batch team prints the ticket at batch time — before the truck leaves the gate. This is not a fallback mode; it is the standard workflow.

Trackit receives the ticket data in parallel. If the plant is temporarily offline, the sync queues and completes when connectivity is restored — but the driver already has their physical ticket.

## Tabs

| Tab | What it shows |
|-----|--------------|
| **Overview** | Concept explanation, 6-step flow, comparison vs fallback approach, what needs to be in place |
| **Batch Queue** | Live interactive queue — click Batch & Print on any order to walk through the flow |
| **Ticket Template** | Template config with live preview |

## Why this is simpler than the fallback approach

| | Always print at batch time | Fallback mode |
|---|---|---|
| Toggle to manage | None | Yes (manual or auto) |
| Connectivity threshold | Not needed | Required |
| Printing in the workflow | Yes — standard step | No — exception path |
| Driver always has ticket | Yes | Only when fallback active |
| Risk of mode confusion | None | Forgetting to re-enable digital |

## Source file

`trackit-batch-plant-ticket-printing.canvas.tsx` — Cursor Canvas (React, `cursor/canvas` SDK).
