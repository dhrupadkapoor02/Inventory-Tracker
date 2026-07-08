import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import * as productApi from '../api/product.api';
import * as categoryApi from '../api/category.api';
import * as supplierApi from '../api/supplier.api';

const emptyForm = {
  name: '',
  sku: '',
  categoryId: '',
  supplierId: '',
  unit: 'pcs',
  costPrice: '',
  sellingPrice: '',
  quantity: '',
  reorderLevel: '',
  expiryDate: '',
  description: '',
};

function StatusBadge({ product }) {
  const isLowStock = product.quantity <= product.reorderLevel;
  const isExpiringSoon =
    product.expiryDate &&
    new Date(product.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (!isLowStock && !isExpiringSoon) return null;

  return (
    <div className="mt-1 flex gap-1">
      {isLowStock && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
          Low stock
        </span>
      )}
      {isExpiringSoon && (
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
          Expiring soon
        </span>
      )}
    </div>
  );
}

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        productApi.getProducts(),
        categoryApi.getCategories(),
        supplierApi.getSuppliers(),
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
      setSuppliers(suppliersRes.data.data);
    } catch (err) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      categoryId: product.category.id,
      supplierId: product.supplier?.id || '',
      unit: product.unit,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
      expiryDate: product.expiryDate ? product.expiryDate.slice(0, 10) : '',
      description: product.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.supplierId) delete payload.supplierId;
      if (!payload.expiryDate) delete payload.expiryDate;

      if (editing) {
        await productApi.updateProduct(editing.id, payload);
        toast.success('Product updated.');
      } else {
        await productApi.createProduct(payload);
        toast.success('Product created.');
      }
      setModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;
    try {
      await productApi.deleteProduct(product.id);
      toast.success('Product deleted.');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete product.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Your full product catalog and stock levels</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> New product
          </button>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Supplier</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Cost / Sell</th>
              <th className="px-5 py-3">Expiry</th>
              {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.sku}</p>
                    <StatusBadge product={product} />
                  </td>
                  <td className="px-5 py-3 text-slate-500">{product.category.name}</td>
                  <td className="px-5 py-3 text-slate-500">{product.supplier?.name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {product.quantity} {product.unit}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    ₹{product.costPrice} / ₹{product.sellingPrice}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : '—'}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit product' : 'New product'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormInput
              label="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <FormInput
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
          />
          <FormInput
            label="Unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="pcs, kg, box..."
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Supplier (optional)</label>
            <select
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            >
              <option value="">None</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="Cost price"
            type="number"
            step="0.01"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            required
          />
          <FormInput
            label="Selling price"
            type="number"
            step="0.01"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
            required
          />
          <FormInput
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <FormInput
            label="Reorder level"
            type="number"
            value={form.reorderLevel}
            onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
          />
          <div className="col-span-2">
            <FormInput
              label="Expiry date (optional)"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <FormInput
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
