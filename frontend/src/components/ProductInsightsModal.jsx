import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, RefreshCw } from 'lucide-react';
import Modal from './Modal';
import * as aiInsightApi from '../api/aiInsight.api';

const sections = [
  { key: 'reorderSuggestion', label: 'Reorder suggestion' },
  { key: 'storageRecommendation', label: 'Storage recommendation' },
  { key: 'expiryObservation', label: 'Expiry observation' },
  { key: 'inventoryAdvice', label: 'Inventory advice' },
  { key: 'marginObservation', label: 'Margin observation' },
];

export default function ProductInsightsModal({ open, onClose, product }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await aiInsightApi.generateProductInsights(product.id);
      setInsights(data.data.insights);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate AI insights.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInsights(null);
    onClose();
  };

  if (!product) return null;

  return (
    <Modal open={open} onClose={handleClose} title={`AI Insights — ${product.name}`} maxWidth="max-w-lg">
      {!insights && !loading && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="rounded-full bg-brand-50 p-3 text-brand-600">
            <Sparkles size={20} />
          </div>
          <p className="text-sm text-slate-500">
            Get AI-generated reorder, storage, expiry, and margin insights for this product.
          </p>
          <button
            onClick={handleGenerate}
            className="mt-2 flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Sparkles size={16} /> Generate AI Insights
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-slate-500">
          <RefreshCw size={20} className="animate-spin text-brand-600" />
          Analyzing product data...
        </div>
      )}

      {insights && !loading && (
        <div className="flex flex-col gap-4">
          {sections.map(({ key, label }) => (
            <div key={key} className="rounded-xl border border-slate-200 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{label}</p>
              <p className="mt-1 text-sm text-slate-700">
                {insights[key] || 'No observation available.'}
              </p>
            </div>
          ))}
          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw size={14} /> Regenerate
          </button>
        </div>
      )}
    </Modal>
  );
}
