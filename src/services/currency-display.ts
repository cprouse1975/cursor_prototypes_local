/**
 * Locale-aware currency display (MVP)
 */

export interface FormatCurrencyOptions {
  locale: string;
  showCode?: boolean;
}

export function formatCurrency(
  value: number,
  currency: string,
  options: FormatCurrencyOptions
): string {
  const formatted = new Intl.NumberFormat(options.locale, {
    style: "currency",
    currency,
  }).format(value);
  return options.showCode ? `${formatted} (${currency})` : formatted;
}

export function formatCrossCurrencyQuote(
  primary: { value: number; currency: string },
  presentation: { value: number; currency: string } | null,
  locale: string,
  rateFootnote?: string
): string {
  const primaryStr = formatCurrency(primary.value, primary.currency, {
    locale,
    showCode: true,
  });
  if (!presentation) return primaryStr;
  const presStr = formatCurrency(presentation.value, presentation.currency, {
    locale,
    showCode: true,
  });
  const footnote = rateFootnote ? ` · ${rateFootnote}` : "";
  return `${primaryStr} · approx. ${presStr}${footnote}`;
}

export function taxTreatmentBadge(vatTreatment: string): string {
  const labels: Record<string, string> = {
    INTRA_EU_B2B_ZERO_RATED: "Intra-EU supply — zero rated",
    INTRA_EU_B2B_REVERSE_CHARGE: "Reverse charge",
    WINDSOR_INTRA_EU_GOODS: "Windsor Framework — intra-EU supply",
    EXPORT_ZERO_RATED: "Export — zero rated",
    DOMESTIC_STANDARD: "Domestic VAT",
    UK_DOMESTIC: "UK VAT",
  };
  return labels[vatTreatment] ?? vatTreatment;
}
