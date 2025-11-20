import React, { useState } from 'react';
import { Currency } from '../types';
import { X, Save, RotateCcw } from 'lucide-react';

interface ExchangeRateSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  rates: Record<Currency, number>;
  onUpdateRates: (newRates: Record<Currency, number>) => void;
  onResetRates: () => void;
}

export const ExchangeRateSettings: React.FC<ExchangeRateSettingsProps> = ({
  isOpen,
  onClose,
  rates,
  onUpdateRates,
  onResetRates
}) => {
  const [tempRates, setTempRates] = useState<Record<Currency, number>>(rates);

  if (!isOpen) return null;

  const handleRateChange = (currency: Currency, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setTempRates(prev => ({ ...prev, [currency]: numValue }));
    }
  };

  const handleSave = () => {
    onUpdateRates(tempRates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-black border border-green-500 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.2)] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-green-900 bg-green-900/10">
          <h3 className="text-lg font-bold text-green-500 font-mono uppercase tracking-wider">System Configuration</h3>
          <button onClick={onClose} className="p-1 text-green-700 hover:text-green-400 rounded hover:bg-green-900/20">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-black scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black">
          <p className="text-xs text-green-800 mb-4 font-mono border-l-2 border-green-800 pl-2">
            // DEFINE CONVERSION RATES <br/>
            // BASE: 1.0 USD
          </p>
          
          <div className="space-y-3">
            {Object.keys(rates).map((key) => {
              const currency = key as Currency;
              if (currency === Currency.USD) return null; // Base currency

              return (
                <div key={currency} className="flex items-center justify-between bg-black/50 p-3 rounded border border-green-900 hover:border-green-600 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-400 w-10 font-mono">{currency}</span>
                    <span className="text-xs text-green-800">= 1 USD</span>
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={tempRates[currency]} 
                    onChange={(e) => handleRateChange(currency, e.target.value)}
                    className="w-24 px-2 py-1 text-right font-mono text-sm bg-black border border-green-800 text-green-400 rounded focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none placeholder-green-900"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-green-900 bg-black flex justify-between items-center">
          <button 
            onClick={() => {
               onResetRates();
               onClose();
            }}
            className="text-xs text-green-700 hover:text-red-400 flex items-center gap-1 font-mono uppercase"
          >
            <RotateCcw className="w-3 h-3" /> Reset Default
          </button>
          
          <button 
            onClick={handleSave}
            className="bg-green-600 text-black px-6 py-2 rounded text-sm font-bold hover:bg-green-500 flex items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] uppercase tracking-wider"
          >
            <Save className="w-4 h-4" /> Save Config
          </button>
        </div>
      </div>
    </div>
  );
};