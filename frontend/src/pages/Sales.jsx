import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import * as saleApi from '../api/sale.api';
import * as productApi from '../api/product.api';

const emptyItem = { productId: '', quantity: '', unitPrice: '' };

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([emptyItem]);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.all([
        saleApi.getSales(),
        productApi.getProducts({ limit: 1000 }),
      ]);
      setSales(salesRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      toast.error('Failed to load sales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = () => {
    setCustomerName('');
    setCustomerPhone('');
    setItems([emptyItem]);
    setModalOpen(true);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItemRow = () => setItems((prev) => [...prev, emptyItem]);
  const removeItemRow = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const total = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saleApi.createSale({ customerName, customerPhone, items });
      toast.success('Sale recorded. Stock updated.');
      setModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record sale.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Sales</h1>
          <p className="mt-1 text-sm text-slate-500">Stock sold to customers</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> New sale
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Recorded by</th>
              <th className="px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  No sales recorded yet.
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(s.saleDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {s.customerName || 'Walk-in'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{s.items.length} item(s)</td>
                  <td className="px-5 py-3 text-slate-500">{s.user.name}</td>
                  <td className="px-5 py-3 text-slate-900">₹{s.totalAmount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New sale" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <FormInput
              label="Customer phone (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700">Items</label>
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                  >
                    <option value="">Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.quantity} in stock)
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  required
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Unit price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  required
                  className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItemRow}
              className="self-start text-sm font-medium text-brand-600 hover:underline"
            >
              + Add item
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">Total</span>
            <span className="font-display text-lg font-semibold text-slate-900">
              ₹{total.toFixed(2)}
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Recording...' : 'Record sale'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
