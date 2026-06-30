/**
 * Tax Jurisdiction Service (MVP v1 + corridor packs)
 * Address-driven VAT treatment resolution — replaces CS V3 manual tax codes.
 */

export type SupplyType = "GOODS" | "SERVICES" | "MIXED";

export type VatTreatment =
  | "DOMESTIC_STANDARD"
  | "INTRA_EU_B2B_ZERO_RATED"
  | "INTRA_EU_B2B_REVERSE_CHARGE"
  | "EXPORT_ZERO_RATED"
  | "UK_DOMESTIC"
  | "WINDSOR_INTRA_EU_GOODS"
  | "NOT_APPLICABLE";

export type CorridorPack = "EU_CONTINENTAL" | "UK_IRELAND_WINDSOR" | "UK_EXPORT";

export interface TaxJurisdictionInput {
  sellerCountry: string;
  buyerCountry: string;
  deliveryCountry: string;
  dispatchOriginCountry?: string;
  supplyType: SupplyType;
  corridorPacks: CorridorPack[];
}

export interface TaxJurisdiction {
  sellerCountry: string;
  buyerCountry: string;
  deliveryCountry: string;
  dispatchOriginCountry?: string;
  supplyType: SupplyType;
  vatTreatment: VatTreatment;
  sellerVatPrefix?: string | null;
  windsorFramework: boolean;
  corridorPack: CorridorPack | null;
  resolvedBy: "TAX_JURISDICTION_SERVICE";
  resolvedAt: string;
  legacyTaxCode?: string | null;
}

const EU_COUNTRIES = new Set(["FR", "DE", "IE", "AT", "BE", "NL", "ES", "IT", "PL"]);

function isIntraEu(a: string, b: string): boolean {
  const norm = (c: string) => (c === "GB-NI" ? "GB-NI" : c);
  const ca = norm(a);
  const cb = norm(b);
  if (ca === cb) return false;
  if (ca === "GB-NI" && cb === "IE") return true;
  if (ca === "IE" && cb === "GB-NI") return true;
  return EU_COUNTRIES.has(ca) && EU_COUNTRIES.has(cb);
}

export class TaxJurisdictionService {
  resolve(input: TaxJurisdictionInput): TaxJurisdiction {
    const resolvedAt = new Date().toISOString();
    const base = {
      sellerCountry: input.sellerCountry,
      buyerCountry: input.buyerCountry,
      deliveryCountry: input.deliveryCountry,
      dispatchOriginCountry: input.dispatchOriginCountry,
      supplyType: input.supplyType,
      resolvedBy: "TAX_JURISDICTION_SERVICE" as const,
      resolvedAt,
      legacyTaxCode: null,
    };

    // UK–Ireland Windsor pack: NI ↔ ROI goods
    if (
      input.corridorPacks.includes("UK_IRELAND_WINDSOR") &&
      input.supplyType === "GOODS" &&
      ((input.sellerCountry === "GB-NI" && input.deliveryCountry === "IE") ||
        (input.sellerCountry === "IE" && input.deliveryCountry === "GB-NI"))
    ) {
      return {
        ...base,
        vatTreatment: "WINDSOR_INTRA_EU_GOODS",
        sellerVatPrefix: input.sellerCountry === "GB-NI" ? "XI" : null,
        windsorFramework: true,
        corridorPack: "UK_IRELAND_WINDSOR",
      };
    }

    // GB mainland → ROI export (not Windsor intra-EU)
    if (
      input.corridorPacks.includes("UK_EXPORT") &&
      input.sellerCountry === "GB" &&
      input.deliveryCountry === "IE"
    ) {
      return {
        ...base,
        vatTreatment: "EXPORT_ZERO_RATED",
        sellerVatPrefix: null,
        windsorFramework: false,
        corridorPack: "UK_EXPORT",
      };
    }

    // EU Continental: FR ↔ DE etc.
    if (
      input.corridorPacks.includes("EU_CONTINENTAL") &&
      isIntraEu(input.sellerCountry, input.deliveryCountry) &&
      input.supplyType === "GOODS"
    ) {
      return {
        ...base,
        vatTreatment: "INTRA_EU_B2B_ZERO_RATED",
        sellerVatPrefix: null,
        windsorFramework: false,
        corridorPack: "EU_CONTINENTAL",
      };
    }

    if (
      input.corridorPacks.includes("EU_CONTINENTAL") &&
      isIntraEu(input.sellerCountry, input.deliveryCountry) &&
      input.supplyType === "SERVICES"
    ) {
      return {
        ...base,
        vatTreatment: "INTRA_EU_B2B_REVERSE_CHARGE",
        sellerVatPrefix: null,
        windsorFramework: false,
        corridorPack: "EU_CONTINENTAL",
      };
    }

    // Domestic fallback
    if (input.sellerCountry === input.deliveryCountry) {
      return {
        ...base,
        vatTreatment:
          input.sellerCountry.startsWith("GB") ? "UK_DOMESTIC" : "DOMESTIC_STANDARD",
        sellerVatPrefix: input.sellerCountry === "GB-NI" ? "XI" : null,
        windsorFramework: false,
        corridorPack: null,
      };
    }

    return {
      ...base,
      vatTreatment: "NOT_APPLICABLE",
      sellerVatPrefix: null,
      windsorFramework: false,
      corridorPack: null,
    };
  }
}
