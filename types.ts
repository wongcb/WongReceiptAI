export enum ExpenseCategory {
  Transport = 'Transport',
  Flight = 'Flight',
  Accommodation = 'Accommodation',
  Meal = 'Meal',
  Incidental = 'Incidental',
  Unknown = 'Unknown'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
  CNY = 'CNY',
  SGD = 'SGD',
  HKD = 'HKD'
}

export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.USD]: 1,
  [Currency.EUR]: 0.92,
  [Currency.GBP]: 0.79,
  [Currency.JPY]: 150.25,
  [Currency.CAD]: 1.35,
  [Currency.AUD]: 1.52,
  [Currency.CNY]: 7.20,
  [Currency.SGD]: 1.34,
  [Currency.HKD]: 7.82
};

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  merchant: string;
  imageUrl?: string;
  fileName?: string;
}

export interface ExtractionResult {
  date: string;
  amount: number;
  currency: string;
  category: string;
  merchant: string;
}