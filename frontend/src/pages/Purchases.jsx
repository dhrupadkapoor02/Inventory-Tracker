import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import * as purchaseApi from "../api/purchase.api";
import * as productApi from "../api/product.api";
import * as supplierApi from "../api/supplier.api";

const emptyItem = { productId: "", quantity: "", unitCost: "" };

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([emptyItem]);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [purchasesRes, productsRes, suppliersRes] = await Promise.all([
        purchaseApi.getPurchases(),
        productApi.getProducts({ limit: 1000 }),
        supplierApi.getSuppliers(),
      ]);
      setPurchases(purchasesRes.data.data);
      setProducts(productsRes.data.data);
      setSuppliers(suppliersRes.data.data);
    } catch (err) {
      toast.error("Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = () => {
    setSupplierId("");
    setItems([emptyItem]);
    setModalOpen(true);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItemRow = () => setItems((prev) => [...prev, emptyItem]);
  const removeItemRow = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const total = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await purchaseApi.createPurchase({ supplierId, items });
      toast.success("Purchase recorded. Stock updated.");
      setModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not record purchase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            Purchases
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Stock received from suppliers
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> New purchase
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Supplier</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Recorded by</th>
              <th className="px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-6 text-center text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-6 text-center text-slate-400"
                >
                  No purchases recorded yet.
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(p.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {p.supplier.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {p.items.length} item(s)
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.user.name}</td>
                  <td className="px-5 py-3 text-slate-900">₹{p.totalAmount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New purchase"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Supplier
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700">Items</label>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 p-2 sm:flex-row sm:items-end sm:border-0 sm:p-0"
              >
                <div className="flex-1">
                  <select
                    value={item.productId}
                    onChange={(e) =>
                      updateItem(index, "productId", e.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                  >
                    <option value="">Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 sm:w-24"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit cost"
                    value={item.unitCost}
                    onChange={(e) =>
                      updateItem(index, "unitCost", e.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 sm:w-28"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
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
            {saving ? "Recording..." : "Record purchase"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
