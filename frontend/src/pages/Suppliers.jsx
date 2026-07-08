import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import * as supplierApi from '../api/supplier.api';

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Suppliers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await supplierApi.getSuppliers();
      setSuppliers(data.data);
    } catch (err) {
      toast.error('Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await supplierApi.updateSupplier(editing.id, form);
        toast.success('Supplier updated.');
      } else {
        await supplierApi.createSupplier(form);
        toast.success('Supplier created.');
      }
      setModalOpen(false);
      loadSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Delete supplier "${supplier.name}"?`)) return;
    try {
      await supplierApi.deleteSupplier(supplier.id);
      toast.success('Supplier deleted.');
      loadSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete supplier.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-500">Vendors you purchase stock from</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> New supplier
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Products</th>
              {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  No suppliers yet.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{supplier.name}</td>
                  <td className="px-5 py-3 text-slate-500">{supplier.email || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{supplier.phone || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{supplier._count?.products ?? 0}</td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(supplier)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit supplier' : 'New supplier'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <FormInput
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <FormInput
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
