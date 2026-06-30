/**
 * Monetary resolver — auto-resolution at quote creation (MVP)
 */

import { FxService } from "./fx-service.js";
import { TaxJurisdictionService, type CorridorPack, type SupplyType } from "./tax-jurisdiction-service.js";

export interface MonetaryAmount {
  value: number;
  currency: string;
}

export interface ResolveQuoteMonetaryInput {
  legalEntityId: string;
  dispatchLocationId: string;
  functionalCurrency: string;
  legalEntityCountry: string;
  preferredInvoiceCurrency?: string | null;
  presentationCurrency?: string | null;
  buyerCountry: string;
  deliveryCountry: string;
  supplyType: SupplyType;
  corridorPacks: CorridorPack[];
  netAmount: number;
  enabledCurrencies: string[];
}

export interface MonetaryContext {
  transactionCurrency: string;
  functionalCurrency: string;
  presentationCurrency: string | null;
  amount: MonetaryAmount;
  functionalAmount: MonetaryAmount;
  presentationAmount: MonetaryAmount | null;
  exchangeRate: number | null;
  exchangeRateSource: string | null;
  exchangeRateDate: string | null;
  exchangeRateLockedAt: string | null;
  legalEntityId: string;
  dispatchLocationId: string;
  taxJurisdiction: ReturnType<TaxJurisdictionService["resolve"]>;
}

export class MonetaryResolver {
  constructor(
    private readonly fx = new FxService(),
    private readonly tax = new TaxJurisdictionService()
  ) {}

  async resolveQuoteContext(input: ResolveQuoteMonetaryInput): Promise<MonetaryContext> {
    const transactionCurrency =
      input.preferredInvoiceCurrency && input.enabledCurrencies.includes(input.preferredInvoiceCurrency)
        ? input.preferredInvoiceCurrency
        : input.functionalCurrency;

    const presentationCurrency =
      input.presentationCurrency &&
      input.presentationCurrency !== transactionCurrency &&
      input.enabledCurrencies.includes(input.presentationCurrency)
        ? input.presentationCurrency
        : transactionCurrency !== input.functionalCurrency
          ? input.functionalCurrency
          : null;

    let exchangeRate: number | null = null;
    let exchangeRateSource: string | null = null;
    let exchangeRateDate: string | null = null;
    let presentationAmount: MonetaryAmount | null = null;

    if (presentationCurrency && presentationCurrency !== transactionCurrency) {
      const rateInfo = await this.fx.getRate(transactionCurrency, presentationCurrency);
      exchangeRate = rateInfo.rate;
      exchangeRateSource = rateInfo.source;
      exchangeRateDate = rateInfo.effectiveDate;
      presentationAmount = {
        value: this.fx.convert(input.netAmount, rateInfo.rate),
        currency: presentationCurrency,
      };
    }

    const taxJurisdiction = this.tax.resolve({
      sellerCountry: input.legalEntityCountry,
      buyerCountry: input.buyerCountry,
      deliveryCountry: input.deliveryCountry,
      supplyType: input.supplyType,
      corridorPacks: input.corridorPacks,
    });

    return {
      transactionCurrency,
      functionalCurrency: input.functionalCurrency,
      presentationCurrency,
      amount: { value: input.netAmount, currency: transactionCurrency },
      functionalAmount: {
        value:
          transactionCurrency === input.functionalCurrency
            ? input.netAmount
            : presentationCurrency === input.functionalCurrency && presentationAmount
              ? presentationAmount.value
              : input.netAmount,
        currency: input.functionalCurrency,
      },
      presentationAmount,
      exchangeRate,
      exchangeRateSource,
      exchangeRateDate,
      exchangeRateLockedAt: null,
      legalEntityId: input.legalEntityId,
      dispatchLocationId: input.dispatchLocationId,
      taxJurisdiction,
    };
  }

  async lockAtQuoteAcceptance(context: MonetaryContext): Promise<MonetaryContext> {
    if (!context.presentationCurrency || context.transactionCurrency === context.presentationCurrency) {
      return context;
    }
    const snapshot = await this.fx.snapshotAtQuoteAcceptance(
      context.transactionCurrency,
      context.presentationCurrency
    );
    return {
      ...context,
      exchangeRate: snapshot.rate,
      exchangeRateSource: snapshot.source,
      exchangeRateDate: snapshot.effectiveDate,
      exchangeRateLockedAt: snapshot.lockedAt,
      presentationAmount: context.amount
        ? {
            value: this.fx.convert(context.amount.value, snapshot.rate),
            currency: context.presentationCurrency,
          }
        : null,
    };
  }
}
