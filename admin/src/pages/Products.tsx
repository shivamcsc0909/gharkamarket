import React, { useEffect, useState } from 'react';
import { Boxes, Plus, Search, Edit2, Trash2, UploadCloud, X, Zap } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminProduct } from '../types';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [mrp, setMrp] = useState<number>(199);
  const [sellingPrice, setSellingPrice] = useState<number>(159);
  const [weight, setWeight] = useState('150g');
  const [protein, setProtein] = useState('9g Protein / 100g');
  const [calories, setCalories] = useState('110 kcal / serving');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);

  // CSV Import State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvResult, setCsvResult] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts({ search: search.trim() }),
        adminApi.getCategories()
      ]);

      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (catRes.success && catRes.data) setCategories(catRes.data);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const openCreateModal = () => {
    setEditingId(null);
    setSku(`OF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    setName('');
    setCategoryId(categories[0]?.id || 1);
    setMrp(199);
    setSellingPrice(159);
    setWeight('150g');
    setProtein('9g Protein / 100g');
    setCalories('120 kcal / serving');
    setShortDesc('');
    setDesc('');
    setIngredients('');
    setImageUrl('https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80');
    setStockQuantity(50);
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: AdminProduct) => {
    setEditingId(p.id);
    setSku(p.sku);
    setName(p.name);
    setCategoryId(p.category_id);
    setMrp(p.mrp);
    setSellingPrice(p.selling_price);
    setWeight(p.weight);
    setProtein(p.protein || '');
    setCalories(p.calories || '');
    setShortDesc(p.short_description || '');
    setDesc(p.description || '');
    setIngredients(p.ingredients || '');
    setImageUrl(p.primary_image || p.images?.[0] || '');
    setStockQuantity(p.stock_quantity || 50);
    setIsFeatured(p.is_featured === 1);
    setIsBestSeller(p.is_best_seller === 1);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      sku,
      name,
      category_id: categoryId,
      mrp,
      selling_price: sellingPrice,
      weight,
      protein,
      calories,
      short_description: shortDesc,
      description: desc,
      ingredients,
      images: [imageUrl],
      stock_quantity: stockQuantity,
      is_featured: isFeatured ? 1 : 0,
      is_best_seller: isBestSeller ? 1 : 0,
      nutrition: {
        serving_size: '30g',
        protein_grams: parseFloat(protein) || 8,
        total_calories: parseFloat(calories) || 120,
        total_fat: 3,
        saturated_fat: 0.4,
        carbohydrates: 18,
        dietary_fiber: 3,
        sodium: 120
      }
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error('Failed to save product:', e);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      fetchData();
    } catch (e) {
      console.error('Failed to delete product:', e);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    const formData = new FormData();
    formData.append('csv_file', csvFile);
    formData.append('mode', 'import');

    try {
      const res = await adminApi.importCsv(formData);
      setCsvResult(res);
      fetchData();
    } catch (e) {
      console.error('CSV import error:', e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-stone-500">Manage smart snack items, nutrition tables, and stock levels.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-4 h-4" /> CSV Import
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Snack
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or SKU..."
          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
        />
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price / MRP</th>
                <th className="p-4">Protein</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">Loading catalog...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">No products found.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.primary_image || p.images?.[0] || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-stone-900 line-clamp-1">{p.name}</div>
                        <span className="text-[10px] text-stone-400 font-mono">SKU: {p.sku} • {p.weight}</span>
                      </div>
                    </td>
                    <td className="p-4">{p.category_name}</td>
                    <td className="p-4">
                      <span className="font-bold text-stone-900">₹{p.selling_price}</span>{' '}
                      <span className="text-[10px] text-stone-400 line-through">₹{p.mrp}</span>
                    </td>
                    <td className="p-4 font-semibold text-emerald-700">
                      {p.protein || '-'}
                    </td>
                    <td className="p-4 font-bold">
                      <span className={`${(p.stock_quantity || 0) <= (p.low_stock_threshold || 10) ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded' : 'text-stone-800'}`}>
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-stone-100 hover:bg-brand-50 hover:text-brand-600 rounded-lg text-stone-600"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-stone-600"
                        title="Archive Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-black text-xl text-stone-900">
                {editingId ? 'Edit Product' : 'Add New Smart Snack'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Weight *</label>
                  <input
                    type="text"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Verified Protein Tag</label>
                  <input
                    type="text"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="e.g. 18g Protein / 100g"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Short Description</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Clean Ingredients List</label>
                <textarea
                  rows={2}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded"
                  />
                  <span>Bestseller</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Batch Product CSV Import</h3>
              <button onClick={() => setIsCsvModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Upload a .csv file containing columns: SKU, Name, Category, MRP, Selling Price, Weight, Description, Stock.
            </p>

            <form onSubmit={handleCsvImport} className="space-y-4 text-xs">
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full p-2 border border-stone-300 rounded-xl bg-stone-50"
              />

              {csvResult && (
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs">
                  Imported: {csvResult.data?.imported || 0}, Updated: {csvResult.data?.updated || 0}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800"
              >
                Upload & Process CSV
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
