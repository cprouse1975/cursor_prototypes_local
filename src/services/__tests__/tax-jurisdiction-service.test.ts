import { TaxJurisdictionService } from "../tax-jurisdiction-service.js";

describe("TaxJurisdictionService", () => {
  const service = new TaxJurisdictionService();

  it("resolves FR to DE intra-EU goods as zero rated", () => {
    const result = service.resolve({
      sellerCountry: "FR",
      buyerCountry: "DE",
      deliveryCountry: "DE",
      supplyType: "GOODS",
      corridorPacks: ["EU_CONTINENTAL"],
    });
    expect(result.vatTreatment).toBe("INTRA_EU_B2B_ZERO_RATED");
    expect(result.corridorPack).toBe("EU_CONTINENTAL");
  });

  it("resolves NI to IE Windsor goods", () => {
    const result = service.resolve({
      sellerCountry: "GB-NI",
      buyerCountry: "IE",
      deliveryCountry: "IE",
      supplyType: "GOODS",
      corridorPacks: ["UK_IRELAND_WINDSOR"],
    });
    expect(result.vatTreatment).toBe("WINDSOR_INTRA_EU_GOODS");
    expect(result.sellerVatPrefix).toBe("XI");
    expect(result.windsorFramework).toBe(true);
  });

  it("resolves GB to IE as export not Windsor", () => {
    const result = service.resolve({
      sellerCountry: "GB",
      buyerCountry: "IE",
      deliveryCountry: "IE",
      supplyType: "GOODS",
      corridorPacks: ["UK_EXPORT"],
    });
    expect(result.vatTreatment).toBe("EXPORT_ZERO_RATED");
    expect(result.corridorPack).toBe("UK_EXPORT");
  });
});
