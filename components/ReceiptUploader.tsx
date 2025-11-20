import React, { useState } from 'react';
import { Upload, Camera, Loader2, ScanLine } from 'lucide-react';
import { extractReceiptData } from '../services/geminiService';
import { Invoice, ExpenseCategory, Currency } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ReceiptUploaderProps {
  onInvoiceAdded: (invoice: Invoice) => void;
  nextInvoiceNumber: string;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onInvoiceAdded, nextInvoiceNumber }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create a local URL for preview
      const imageUrl = URL.createObjectURL(file);

      const data = await extractReceiptData(file);

      const newInvoice: Invoice = {
        id: uuidv4(),
        invoiceNumber: nextInvoiceNumber,
        date: data.date || new Date().toISOString().split('T')[0],
        amount: data.amount || 0,
        currency: (data.currency as Currency) || Currency.AUD,
        category: (data.category as ExpenseCategory) || ExpenseCategory.Unknown,
        merchant: data.merchant || 'UNKNOWN_ENTITY',
        imageUrl: imageUrl,
        fileName: file.name
      };

      onInvoiceAdded(newInvoice);
    } catch (err) {
      console.error(err);
      setError("SYSTEM ERROR: FAILED_TO_DECODE_DATA");
    } finally {
      setIsProcessing(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="w-full mb-8 relative group">
      {/* Glowing border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-green-900 rounded-lg opacity-30 group-hover:opacity-70 transition duration-500 blur"></div>
      
      <div className="relative bg-black p-6 rounded-lg border border-green-800 text-center shadow-2xl">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-500"></div>

        <h2 className="text-lg font-bold text-green-500 mb-6 tracking-widest uppercase flex justify-center items-center gap-2">
          <ScanLine className="w-5 h-5 animate-pulse" />
          Input New Data
        </h2>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <label className={`
            flex items-center justify-center gap-2 px-6 py-4 rounded border-2 cursor-pointer transition-all uppercase font-bold tracking-wider
            ${isProcessing 
              ? 'border-green-900 text-green-900 bg-black cursor-wait' 
              : 'border-green-600 text-green-500 hover:bg-green-900/20 hover:border-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]'}
          `}>
            {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
            <span>{isProcessing ? 'ANALYZING...' : 'UPLOAD FILE'}</span>
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </label>

          <label className={`
             flex items-center justify-center gap-2 px-6 py-4 rounded border-2 cursor-pointer transition-all uppercase font-bold tracking-wider
             ${isProcessing 
               ? 'border-gray-800 text-gray-800 bg-black' 
               : 'border-green-900 text-green-700 hover:text-green-400 hover:border-green-500 hover:bg-green-900/10'}
          `}>
             <Camera className="h-5 w-5" />
             <span>CAPTURE</span>
             <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </label>
        </div>

        {error && (
          <div className="mt-6 text-red-500 text-sm font-mono border border-red-900/50 bg-red-950/20 p-2 rounded">
            [ERROR] :: {error}
          </div>
        )}
        
        <p className="mt-6 text-[10px] text-green-800 font-mono uppercase tracking-widest">
          System accepts JPG/PNG/PDF. Neural Net will extract date, cost, and classification.
        </p>
      </div>
    </div>
  );
};