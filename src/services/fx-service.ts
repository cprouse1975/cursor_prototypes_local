/**
 * Platform FX Service (MVP v1)
 * ECB daily rates for enabled currency pairs; snapshot at quote acceptance.
 */

export type FxSource = "ECB_DAILY" | "BOE_DAILY" | "CONTRACT_FIXED" | "MANUAL_OVERRIDE" | "ERP_FEED";

export interface FxRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: FxSource;
  effectiveDate: string; // YYYY-MM-DD
}

export interface FxSnapshot extends FxRate {
  lockedAt: string; // ISO datetime
}

/** MVP: static ECB-style rates for reference; production calls ECB SDW API. */
const MVP_RATES: Record<string, number> = {
  "GBP/EUR": 1.1682,
  "EUR/GBP": 0.856,
  "EUR/USD": 1.09,
};

export class FxService {
  constructor(private readonly defaultSource: FxSource = "ECB_DAILY") {}

  async getRate(baseCurrency: string, quoteCurrency: string, asOfDate?: string): Promise<FxRate> {
    if (baseCurrency === quoteCurrency) {
      return {
        baseCurrency,
        quoteCurrency,
        rate: 1,
        source: this.defaultSource,
        effectiveDate: asOfDate ?? new Date().toISOString().slice(0, 10),
      };
    }

    const key = `${baseCurrency}/${quoteCurrency}`;
    const rate = MVP_RATES[key];
    if (rate === undefined) {
      throw new Error(`FX rate not available for ${key}`);
    }

    return {
      baseCurrency,
      quoteCurrency,
      rate,
      source: this.defaultSource,
      effectiveDate: asOfDate ?? new Date().toISOString().slice(0, 10),
    };
  }

  async snapshotAtQuoteAcceptance(
    baseCurrency: string,
    quoteCurrency: string
  ): Promise<FxSnapshot> {
    const rate = await this.getRate(baseCurrency, quoteCurrency);
    return {
      ...rate,
      lockedAt: new Date().toISOString(),
    };
  }

  convert(amount: number, rate: number): number {
    return Math.round(amount * rate * 100) / 100;
  }
}
