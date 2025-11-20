import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Invoice, ExpenseCategory, Currency } from '../types';

interface ExpenseSummaryProps {
  invoices: Invoice[];
  reportingCurrency: Currency;
  exchangeRates: Record<Currency, number>;
}

// Updated Matrix Palette: Shades of Green, White, Grey, Black
const COLORS = [
  '#ffffff', // White
  '#4ade80', // Bright Green
  '#15803d', // Dark Green
  '#d4d4d8', // Light Grey
  '#52525b', // Medium Grey
  '#18181b'  // Black (Dark Grey)
];

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ invoices, reportingCurrency, exchangeRates }) => {
  
  const convert = (amount: number, fromCurrency: Currency): number => {
    if (fromCurrency === reportingCurrency) return amount;
    // Convert to USD (base) then to reporting
    const amountInUSD = amount / exchangeRates[fromCurrency];
    return amountInUSD * exchangeRates[reportingCurrency];
  };

  const total = invoices.reduce((acc, curr) => acc + convert(curr.amount, curr.currency), 0);

  const data = Object.values(ExpenseCategory)
    .filter(cat => cat !== ExpenseCategory.Unknown)
    .map(cat => {
      const value = invoices
        .filter(inv => inv.category === cat)
        .reduce((acc, curr) => acc + convert(curr.amount, curr.currency), 0);
      return { name: cat, value };
    })
    .filter(item => item.value > 0);

  if (total === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border border-green-500 p-2 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
          <p className="text-green-400 font-mono text-sm">{`${payload[0].name} : ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Total Card */}
      <div className="bg-black rounded-lg border border-green-800 p-6 text-green-500 shadow-[0_0_15px_rgba(0,255,0,0.05)] flex flex-col justify-center items-center relative overflow-hidden group hover:border-green-500 transition-colors">
        {/* Background decorative elements */}
        <div className="absolute top-2 left-2 text-[10px] text-green-900 font-mono">SYS.MONITOR_V2</div>
        <div className="absolute -right-4 -bottom-4 text-9xl text-green-900/10 select-none rotate-12 font-bold">{reportingCurrency}</div>
        
        <h3 className="text-green-700 text-sm font-bold uppercase tracking-widest mb-2">Total Expenditure</h3>
        <div className="text-5xl font-bold tracking-tight font-mono text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] z-10">
          {/* Display symbol based on currency if needed, or just the code */}
          <span className="text-2xl text-green-500 mr-1 align-top">
            {reportingCurrency === 'USD' ? '$' : ''}
            {reportingCurrency === 'EUR' ? '€' : ''}
            {reportingCurrency === 'GBP' ? '£' : ''}
            {reportingCurrency === 'JPY' ? '¥' : ''}
          </span>
          {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-4 text-green-800 text-xs font-mono uppercase border-t border-green-900/50 pt-2 w-full text-center">
           Records Processed: {invoices.length}
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-black rounded-lg border border-green-800 p-4 h-64 relative hover:border-green-500 transition-colors">
         <div className="absolute top-2 left-2 text-[10px] text-green-900 font-mono">DATA.VISUALIZATION</div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              stroke="#000"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconSize={8} 
              verticalAlign="middle" 
              align="right" 
              layout="vertical"
              wrapperStyle={{ color: '#4ade80', fontFamily: 'monospace', fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};