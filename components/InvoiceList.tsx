import React from 'react';
import { Invoice, ExpenseCategory, Currency } from '../types';
import { Trash2, Calendar, Tag, DollarSign, Store, Coins, FileText } from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: ExpenseCategory) => void;
  onUpdateCurrency: (id: string, currency: Currency) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onDelete, onUpdateCategory, onUpdateCurrency }) => {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-black/40 rounded border border-dashed border-green-900">
        <div className="text-green-900 mb-2 font-mono text-4xl">0000</div>
        <div className="text-sm text-green-800 font-mono uppercase">No Data Found in Buffer</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {invoices.map((invoice) => (
        <div key={invoice.id} className="bg-black/80 rounded border border-green-900 hover:border-green-500/50 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] group relative overflow-hidden">
          
          {/* Scanline effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none h-full animate-pulse"></div>

          {/* Invoice Number Badge */}
          <div className="absolute top-0 left-0 bg-green-900/50 text-green-400 text-[10px] font-mono px-2 py-0.5 border-b border-r border-green-800 rounded-br">
            ID: {invoice.invoiceNumber}
          </div>

          {/* Thumbnail */}
          <div className="h-20 w-20 flex-shrink-0 bg-black border border-green-900 rounded overflow-hidden relative cursor-pointer mt-4 sm:mt-0 flex items-center justify-center">
            {invoice.fileName?.toLowerCase().endsWith('.pdf') ? (
              <div className="flex flex-col items-center justify-center text-green-600">
                 <FileText className="w-8 h-8" />
                 <span className="text-[8px] font-mono mt-1">PDF</span>
              </div>
            ) : invoice.imageUrl ? (
              <img src={invoice.imageUrl} alt="Receipt" className="h-full w-full object-cover opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-green-900 text-xs">NO_IMG</div>
            )}
          </div>

          {/* Details */}
          <div className="flex-grow min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-4 w-full pt-2 sm:pt-0 relative z-10">
            
            <div className="flex flex-col">
              <span className="text-[10px] text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</span>
              <span className="text-sm font-bold text-green-400 font-mono">{invoice.date}</span>
              <span className="text-[10px] text-green-700 truncate mt-1 font-mono" title={invoice.fileName}>
                {invoice.fileName}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1"><Store className="w-3 h-3" /> Entity</span>
              <span className="text-sm font-bold text-green-300 truncate font-mono uppercase" title={invoice.merchant}>{invoice.merchant}</span>
            </div>

            <div className="flex flex-col">
               <span className="text-[10px] text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Class</span>
               <select 
                  className="text-sm border-none bg-black p-0 font-bold text-green-500 focus:ring-0 cursor-pointer -ml-1 font-mono uppercase outline-none hover:text-green-300"
                  value={invoice.category}
                  onChange={(e) => onUpdateCategory(invoice.id, e.target.value as ExpenseCategory)}
               >
                 {Object.values(ExpenseCategory).map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>
            </div>

            <div className="flex flex-col">
               <span className="text-[10px] text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1"><Coins className="w-3 h-3" /> Curr</span>
               <select 
                  className="text-sm border-none bg-black p-0 font-bold text-green-500 focus:ring-0 cursor-pointer -ml-1 font-mono outline-none hover:text-green-300"
                  value={invoice.currency}
                  onChange={(e) => onUpdateCurrency(invoice.id, e.target.value as Currency)}
               >
                 {Object.values(Currency).map(curr => (
                   <option key={curr} value={curr}>{curr}</option>
                 ))}
               </select>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cost</span>
              <span className="text-lg font-bold text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] font-mono">
                {invoice.amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 absolute right-2 bottom-2 sm:static">
            <button 
              onClick={() => onDelete(invoice.id)}
              className="p-2 text-green-900 hover:text-red-500 hover:bg-red-900/10 rounded transition-colors"
              title="Purge Record"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};