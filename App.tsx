import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReceiptUploader } from './components/ReceiptUploader';
import { InvoiceList } from './components/InvoiceList';
import { ExpenseSummary } from './components/ExpenseSummary';
import { ExchangeRateSettings } from './components/ExchangeRateSettings';
import { exportToExcel } from './services/excelService';
import { Invoice, ExpenseCategory, Currency, DEFAULT_EXCHANGE_RATES } from './types';
import { FileSpreadsheet, Receipt, Globe, Settings, Terminal, Download } from 'lucide-react';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reportingCurrency, setReportingCurrency] = useState<Currency>(Currency.AUD);
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(DEFAULT_EXCHANGE_RATES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for PWA install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Determine the next invoice number based on existing list
  const nextInvoiceNumber = useMemo(() => {
     const nextNum = invoices.length + 1;
     return `INV-${String(nextNum).padStart(4, '0')}`;
  }, [invoices.length]);

  const handleInvoiceAdded = useCallback((invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  }, []);

  const handleDeleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  }, []);

  const handleUpdateCategory = useCallback((id: string, category: ExpenseCategory) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, category } : inv
    ));
  }, []);

  const handleUpdateCurrency = useCallback((id: string, currency: Currency) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, currency } : inv
    ));
  }, []);

  const handleExport = () => {
    if (invoices.length === 0) return;
    exportToExcel(invoices, reportingCurrency, exchangeRates);
  };

  const handleResetRates = useCallback(() => {
    setExchangeRates(DEFAULT_EXCHANGE_RATES);
  }, []);

  return (
    <div className="min-h-screen pb-20 selection:bg-green-500 selection:text-black">
      {/* Header - Matrix Style */}
      <header className="bg-black/90 backdrop-blur-md border-b border-green-900 sticky top-0 z-10 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-green-500">
            <div className="border border-green-500 p-1.5 rounded shadow-[0_0_10px_rgba(34,197,94,0.4)] bg-black">
              <Terminal className="w-6 h-6" />
            </div>
            {/* Mobile Horizontal / Desktop View */}
            <h1 className="hidden sm:block text-2xl font-bold tracking-widest text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">
              WongReceipt<span className="text-white">AI</span>
            </h1>
            {/* Mobile Vertical View */}
            <h1 className="block sm:hidden text-xl font-bold text-green-500">
              Receipt<span className="text-white">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded border text-sm font-bold tracking-wide transition-all uppercase bg-green-900/20 border-green-500 text-green-400 hover:bg-green-500 hover:text-black hover:shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"
              >
                <Download className="w-4 h-4" />
                <span>INSTALL APP</span>
              </button>
            )}

            <button 
               onClick={() => setIsSettingsOpen(true)}
               className="p-2 text-green-700 hover:text-green-400 hover:bg-green-900/30 rounded transition-colors border border-transparent hover:border-green-800"
               title="System Config"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Reporting Currency Selector */}
            <div className="flex items-center gap-2 bg-black border border-green-800 px-3 py-1.5 rounded hover:border-green-500 transition-colors group">
               <Globe className="w-4 h-4 text-green-700 group-hover:text-green-500" />
               <select 
                  value={reportingCurrency}
                  onChange={(e) => setReportingCurrency(e.target.value as Currency)}
                  className="bg-transparent border-none text-sm font-medium text-green-500 focus:ring-0 cursor-pointer outline-none [&>option]:bg-black [&>option]:text-green-500"
               >
                 {Object.values(Currency).map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
            </div>

            <button
              onClick={handleExport}
              disabled={invoices.length === 0}
              className={`
                flex items-center gap-2 px-4 py-2 rounded border text-sm font-bold tracking-wide transition-all uppercase
                ${invoices.length > 0 
                  ? 'bg-green-900/20 border-green-500 text-green-400 hover:bg-green-500 hover:text-black hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]' 
                  : 'bg-black border-gray-800 text-gray-600 cursor-not-allowed'}
              `}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          
          {/* Mobile Install Prompt (visible only on small screens if prompt available) */}
          {installPrompt && (
            <div className="md:hidden">
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded border text-sm font-bold tracking-wide transition-all uppercase bg-green-900/20 border-green-500 text-green-400 hover:bg-green-500 hover:text-black hover:shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"
              >
                <Download className="w-4 h-4" />
                <span>INSTALL APP</span>
              </button>
            </div>
          )}

          {/* Dashboard Stats */}
          <ExpenseSummary 
            invoices={invoices} 
            reportingCurrency={reportingCurrency} 
            exchangeRates={exchangeRates} 
          />

          {/* Action Area */}
          <ReceiptUploader 
            onInvoiceAdded={handleInvoiceAdded} 
            nextInvoiceNumber={nextInvoiceNumber}
          />

          {/* List */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-green-900 pb-2">
              <h2 className="text-lg font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                <span className="animate-pulse">_</span> Extracted Data
              </h2>
              <span className="text-xs font-mono font-bold bg-green-900/40 text-green-400 border border-green-700 px-2 py-1 rounded">
                COUNT: {invoices.length}
              </span>
            </div>
            <InvoiceList 
              invoices={invoices} 
              onDelete={handleDeleteInvoice}
              onUpdateCategory={handleUpdateCategory}
              onUpdateCurrency={handleUpdateCurrency}
            />
          </div>
        </div>
      </main>

      <ExchangeRateSettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        rates={exchangeRates}
        onUpdateRates={setExchangeRates}
        onResetRates={handleResetRates}
      />
    </div>
  );
};

export default App;