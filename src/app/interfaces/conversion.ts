export interface Conversion {
  conversionId: number;
  usuarioId: number;
  fromCurrency: string;
  toCurrency: string;
  fromCurrencySymbol?: string;
  toCurrencySymbol?: string;
  amount: number;
  result: number;
  date?: string;
}