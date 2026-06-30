import { MonetaryResolver } from "../monetary-resolver.js";
import { formatCrossCurrencyQuote, taxTreatmentBadge } from "../currency-display.js";

describe("MonetaryResolver", () => {
  const resolver = new MonetaryResolver();

  it("resolves EUR-only FR-DE quote with null FX", async () => {
    const ctx = await resolver.resolveQuoteContext({
      legalEntityId: "fr-001",
      dispatchLocationId: "fr-plant-801",
      functionalCurrency: "EUR",
      legalEntityCountry: "FR",
      buyerCountry: "DE",
      deliveryCountry: "DE",
      supplyType: "GOODS",
      corridorPacks: ["EU_CONTINENTAL"],
      netAmount: 7950,
      enabledCurrencies: ["EUR"],
    });
    expect(ctx.transactionCurrency).toBe("EUR");
    expect(ctx.exchangeRate).toBeNull();
    expect(ctx.taxJurisdiction.vatTreatment).toBe("INTRA_EU_B2B_ZERO_RATED");
  });

  it("resolves NI-ROI quote with GBP transaction and EUR presentation", async () => {
    const ctx = await resolver.resolveQuoteContext({
      legalEntityId: "ni-004",
      dispatchLocationId: "ni-derry-012",
      functionalCurrency: "GBP",
      legalEntityCountry: "GB-NI",
      preferredInvoiceCurrency: "GBP",
      presentationCurrency: "EUR",
      buyerCountry: "IE",
      deliveryCountry: "IE",
      supplyType: "GOODS",
      corridorPacks: ["UK_IRELAND_WINDSOR"],
      netAmount: 10000,
      enabledCurrencies: ["GBP", "EUR"],
    });
    expect(ctx.transactionCurrency).toBe("GBP");
    expect(ctx.presentationCurrency).toBe("EUR");
    expect(ctx.exchangeRate).toBeGreaterThan(0);
    expect(ctx.presentationAmount?.currency).toBe("EUR");
  });
});

describe("currency-display", () => {
  it("formats cross-currency quote string", () => {
    const s = formatCrossCurrencyQuote(
      { value: 10000, currency: "GBP" },
      { value: 11682, currency: "EUR" },
      "en-IE",
      "@ ECB 30 Jun 2026"
    );
    expect(s).toContain("GBP");
    expect(s).toContain("EUR");
  });

  it("returns tax treatment badge label", () => {
    expect(taxTreatmentBadge("WINDSOR_INTRA_EU_GOODS")).toContain("Windsor");
  });
});
