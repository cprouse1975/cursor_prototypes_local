# TrackIt + Deliveries: printed ticket fallback (customer inquiry)

## Question

When telephone/internet connectivity fails and delivery tickets cannot be processed digitally, can the customer switch to **printing tickets at the batch plant** and handing them to the driver? Is there an existing company- or plant-level switch?

## Short answer for the customer

**There is no documented “offline / printed ticket mode” switch in TrackIt or the Deliveries add-on today.** Deliveries is positioned as a digital workflow (tablet + electronic proof of delivery), not a configurable fallback toggle.

**Operational fallback today** is typically **outside** that switch:

1. **COMMANDbatch (or integrated dispatch)** can still **print a paper delivery ticket** from Batch Setup when batching continues locally at the plant, even if TrackIt/tablet sync or wide-area connectivity is impaired.
2. **TrackIt Web Console** can support **manual tickets** and driver **ticket message email** (Site Settings → Ticket Integration), but that still assumes some path to the driver—not a first-class “print at plant only” company flag.
3. When connectivity returns, **batch results and ticket history** are designed to flow back through the **TrackIt ↔ COMMANDbatch/dispatch interface** (see Batch Training / interface polling docs).

Recommend confirming with the customer’s exact stack (COMMANDbatch vs COMMANDseries/Integra, Deliveries licensed plants, and whether batch PC can run independently of WAN).

## What public documentation shows

| Area | Finding |
|------|---------|
| **Deliveries add-on** | Marketed to *replace paper-based* delivery processes with digital EPOD ([TrackIt product page](https://commandalkon.com/products/trackit/)). |
| **TrackIt Site Settings → Ticket Integration** | Controls how integrated ticket data is received, activated, geofenced, and shown on **driver tablets**—not a print/offline mode ([Ticket Integration](https://help-portal.commandalkon.io/Content/trackit/trackit/web/settings/site/ticket-integration.html)). |
| **TrackIt Interface Settings** | Plant-scoped **integration** filters (which plant’s data flows to/from dispatch)—not ticket *medium* ([Interface Settings](https://help-portal.commandalkon.io/Content/trackit/trackit/web/settings/interface.html)). |
| **COMMANDbatch** | Batch Setup is explicitly for running a batch and **printing a ticket** ([COMMANDbatch Basics](https://cdn-cms.f-static.com/uploads/1815512/normal_5c41f0de5682c.pdf)). |
| **Batch → TrackIt** | After batching, results are sent to TrackIt for in-cab display when the integration path is up ([Batch Training](https://help-portal.commandalkon.io/Content/assurance/Content/BatchTraining.htm)). |

## Gap / product opportunity

A **company default + optional per-plant override** for **delivery ticket medium** would give dispatch a controlled contingency:

- **Digital (Deliveries)** — default; driver workflow on tablet.
- **Printed at batch plant** — auto-print (or prompt) on batch complete; driver carries paper; optional “paper receipt” scan when back online.
- **Hybrid (future)** — digital primary with automatic print when plant or WAN health checks fail.

Prototype: `delivery-ticket-fallback-prototype/` in this repo.

## Suggested customer talking points

1. **Today:** Plan for outages using **local batch printing** plus a written runbook (who flips printers, how tickets are numbered, how loads are reconciled when TrackIt sync returns).
2. **Deliveries:** EPOD and status automation expect digital flow; paper loads may need **manual close-out** or back-office reconciliation unless product adds explicit fallback mode.
3. **Future (if prioritized):** Central config avoids ad-hoc disabling Deliveries plant-by-plant and documents audit trail (who enabled fallback, when).
