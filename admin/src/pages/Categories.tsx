import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit2, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res.success && res.data) setCategories(res.data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, { name, description, image_url: imageUrl });
      } else {
        await adminApi.createCategory({ name, description, image_url: imageUrl });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (e) {
      console.error('Failed to save category:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Product Categories</h1>
          <p className="text-xs text-stone-500">Manage Indian snacking taxonomy and collections.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <img src={cat.image_url || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80'} alt={cat.name} className="w-full h-32 rounded-2xl object-cover" />
              <div className="flex items-center justify-between pt-1">
                <h3 className="font-extrabold text-sm text-stone-900">{cat.name}</h3>
                <span className="text-[10px] font-bold text-stone-400 font-mono">/{cat.slug}</span>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2">{cat.description}</p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400 font-semibold">{cat.products_count || 0} products</span>
              <button
                onClick={() => openEditModal(cat)}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">{editingId ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button type="submit" className="flex-1 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600">Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-stone-200 text-stone-700 font-bold rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
