import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  RotateCw,
  Search,
  CheckCircle2,
  X,
  History,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'transactions'>('stock');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Custom Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [adjustType, setAdjustType] = useState<'RESTOCK' | 'DAMAGE' | 'CORRECTION' | 'RETURN'>('RESTOCK');
  const [adjustAmount, setAdjustAmount] = useState<number>(5);
  const [adjustNote, setAdjustNote] = useState('');

  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading, refetch } = useQuery({
    queryKey: ['admin-inventory-list', search, lowStockOnly],
    queryFn: () =>
      adminApi.getInventory({
        search: search.trim() || undefined,
        lowStockOnly: lowStockOnly ? 'true' : undefined,
      }),
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['admin-inventory-transactions'],
    queryFn: () => adminApi.getInventoryTransactions({ limit: 40 }),
    enabled: activeTab === 'transactions',
  });

  const stockMutation = useMutation({
    mutationFn: (data: { variantId: string; changeAmount: number; type: string; note?: string }) =>
      adminApi.adjustStock(data),
    onSuccess: () => {
      showToast('Inventory adjusted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-transactions'] });
      setAdjustModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to adjust stock', 'error');
    },
  });

  const handleQuickAdjust = (variant: any, amount: number, type: string) => {
    stockMutation.mutate({
      variantId: variant.id,
      changeAmount: amount,
      type,
      note: `Quick ${type} from admin console`,
    });
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    const actualAmount = adjustType === 'DAMAGE' ? -Math.abs(adjustAmount) : Math.abs(adjustAmount);

    stockMutation.mutate({
      variantId: selectedVariant.id,
      changeAmount: actualAmount,
      type: adjustType,
      note: adjustNote || undefined,
    });
  };

  const openAdjustModal = (variant: any) => {
    setSelectedVariant(variant);
    setAdjustAmount(5);
    setAdjustType('RESTOCK');
    setAdjustNote('');
    setAdjustModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="text-forest-700" size={28} />
            <span>Live Botanical Inventory & Nursery Intake</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track available stock vs reserved checkout units, threshold alerts, and greenhouse restocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'stock' ? 'bg-white text-forest-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Stock Items
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'transactions' ? 'bg-white text-forest-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Audit Trail
            </button>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search plants, pot names, SKUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none self-start sm:self-auto px-2">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="font-bold text-rose-700">Low Stock Only</span>
            </label>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!inventoryData || inventoryData.length === 0) && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Boxes size={40} className="mx-auto text-slate-300" />
              <h3 className="font-serif font-bold text-lg text-slate-800">No Inventory Items Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All plants match your filters or no low-stock warnings exist.
              </p>
            </div>
          )}

          {/* DESKTOP TABLE VIEW */}
          {!isLoading && inventoryData && inventoryData.length > 0 && (
            <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Plant & Pot Option</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4 text-center">Live Stock</th>
                    <th className="py-3.5 px-4 text-center">Reserved</th>
                    <th className="py-3.5 px-4 text-center">Available</th>
                    <th className="py-3.5 px-4 text-center">Threshold</th>
                    <th className="py-3.5 px-4 text-right">Quick Restock / Intake</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {inventoryData.map((item: any) => {
                    const isLow = item.stockQuantity <= (item.lowStockThreshold || 5);

                    return (
                      <tr key={item.id} className="hover:bg-sand-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{item.product?.title || item.productTitle}</div>
                          <span className="text-[11px] text-forest-700 font-semibold">{item.name}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {item.sku}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`font-mono font-bold px-2.5 py-1 rounded-xl ${
                              isLow ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            {item.stockQuantity}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                          {item.reservedQuantity || 0}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-forest-900">
                          {Math.max(0, item.stockQuantity - (item.reservedQuantity || 0))}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                          {item.lowStockThreshold || 5}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleQuickAdjust(item, 5, 'RESTOCK')}
                            className="px-2.5 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-[11px] transition-colors shadow-xs"
                            title="Add 5 units"
                          >
                            +5 Restock
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item, 20, 'RESTOCK')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                            title="Add 20 intake"
                          >
                            +20
                          </button>
                          <button
                            onClick={() => openAdjustModal(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-slate-700 font-bold text-[11px] transition-colors"
                          >
                            Custom...
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* MOBILE CARD VIEW */}
          {!isLoading && inventoryData && inventoryData.length > 0 && (
            <div className="md:hidden space-y-3">
              {inventoryData.map((item: any) => {
                const isLow = item.stockQuantity <= (item.lowStockThreshold || 5);

                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          {item.product?.title || item.productTitle}
                        </h3>
                        <p className="text-forest-700 font-semibold">{item.name}</p>
                        <span className="font-mono text-[10px] text-slate-400">SKU: {item.sku}</span>
                      </div>

                      <span
                        className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                          isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.stockQuantity} in stock
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-sand-50/80 rounded-2xl border border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Reserved</span>
                        <span className="font-bold text-slate-700 font-mono">
                          {item.reservedQuantity || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Available</span>
                        <span className="font-bold text-forest-900 font-mono">
                          {Math.max(0, item.stockQuantity - (item.reservedQuantity || 0))}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Threshold</span>
                        <span className="font-bold text-slate-500 font-mono">
                          {item.lowStockThreshold || 5}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => openAdjustModal(item)}
                        className="px-3 py-2 rounded-xl bg-sand-100 text-slate-700 font-bold text-xs"
                      >
                        Adjust...
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickAdjust(item, 5, 'RESTOCK')}
                          className="px-3 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-xs"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(item, 20, 'RESTOCK')}
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                        >
                          +20 Intake
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Audit Trail / Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
          <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <History size={18} className="text-forest-700" />
            <span>Nursery Stock Ledger History</span>
          </h2>

          {txLoading && <p className="text-xs text-slate-400">Loading ledger logs...</p>}

          {!txLoading && (!transactions || transactions.length === 0) && (
            <p className="text-xs text-slate-400 py-6 text-center">No transactions recorded yet.</p>
          )}

          {!txLoading && transactions && transactions.length > 0 && (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="p-3 bg-sand-50/70 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-1.5 rounded-lg ${
                        tx.changeAmount > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tx.changeAmount > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">
                        {tx.type} ({tx.changeAmount > 0 ? `+${tx.changeAmount}` : tx.changeAmount} units)
                      </span>
                      <span className="text-slate-500 ml-2">SKU: {tx.variant?.sku || 'N/A'}</span>
                      {tx.note && <p className="text-[11px] text-slate-500 italic mt-0.5">{tx.note}</p>}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CUSTOM STOCK ADJUSTMENT MODAL */}
      {adjustModalOpen && selectedVariant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900">Adjust Plant Inventory</h3>
                <p className="text-[11px] text-slate-500">{selectedVariant.name} (SKU: {selectedVariant.sku})</p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Reason / Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none focus:border-forest-700"
                >
                  <option value="RESTOCK">RESTOCK (New Greenhouse Intake)</option>
                  <option value="DAMAGE">DAMAGE (Broken Pot / Dead Plant)</option>
                  <option value="CORRECTION">CORRECTION (Physical Count Audit)</option>
                  <option value="RETURN">CUSTOMER RETURN</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Note (Optional)</label>
                <textarea
                  rows={2}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Received shipment from Godawari nursery nursery lot #12"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stockMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-forest-800 text-white font-bold hover:bg-forest-900 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {stockMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Commit Adjustment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
