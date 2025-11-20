import { Invoice, Currency } from "../types";
import * as XLSX from 'xlsx';

export const exportToExcel = (
  invoices: Invoice[], 
  reportingCurrency: Currency, 
  exchangeRates: Record<Currency, number>
) => {
  // Helper to convert currency
  const convert = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount;
    // Convert to USD first (base), then to target
    // Rate is Units per USD. 
    // USD = Amount / Rate_From
    // Target = USD * Rate_To
    const amountInUSD = amount / exchangeRates[fromCurrency];
    return amountInUSD * exchangeRates[toCurrency];
  };

  // Calculate effective rate used for a specific invoice
  const getRate = (fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return 1;
    return exchangeRates[toCurrency] / exchangeRates[fromCurrency];
  };

  // 1. Calculate Total in Reporting Currency
  const totalSum = invoices.reduce((acc, curr) => {
    return acc + convert(curr.amount, curr.currency, reportingCurrency);
  }, 0);
  
  // 2. Prepare Array of Arrays for the sheet
  const headers = [
    "Invoice Number",
    "File Name",
    "Date", 
    "Expense Category", 
    "Merchant",
    "Original Amount", 
    "Currency", 
    "Exchange Rate",
    `Converted Amount (${reportingCurrency})`
  ];

  const rows = invoices.map(inv => {
    const rate = getRate(inv.currency, reportingCurrency);
    const convertedAmount = convert(inv.amount, inv.currency, reportingCurrency);
    
    return [
      inv.invoiceNumber,
      inv.fileName || "N/A",
      inv.date, 
      inv.category, 
      inv.merchant,
      inv.amount,
      inv.currency,
      Number(rate.toFixed(4)), // Show rate with 4 decimal places
      convertedAmount
    ];
  });
  
  const worksheetData = [
    headers,
    ...rows,
    ["", "", "", "", "", "", "", "", ""], // Spacer
    ["", "", "", "Total Sum", "", "", "", "", totalSum]
  ];

  // 3. Create Worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // 4. Create Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");

  // 5. Write File
  XLSX.writeFile(wb, `expense_report_${reportingCurrency}_${new Date().toISOString().split('T')[0]}.xlsx`);
};