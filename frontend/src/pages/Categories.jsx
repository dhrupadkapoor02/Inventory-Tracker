import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import * as categoryApi from '../api/category.api';

export default function Categories() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoryApi.getCategories();
      setCategories(data.data);
    } catch (err) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({ name: category.name, description: category.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.updateCategory(editing.id, form);
        toast.success('Category updated.');
      } else {
        await categoryApi.createCategory(form);
        toast.success('Category created.');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await categoryApi.deleteCategory(category.id);
      toast.success('Category deleted.');
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete category.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Group your products for easier tracking</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> New category
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Products</th>
              {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{category.name}</td>
                  <td className="px-5 py-3 text-slate-500">{category.description || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{category._count?.products ?? 0}</td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'New category'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <FormInput
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
