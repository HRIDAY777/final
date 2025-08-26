import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';

const Products: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', price: 0, stock: 0, sku: '', category: '', is_active: true });
  const [libOpen, setLibOpen] = useState(false);
  const [libBooks, setLibBooks] = useState<any[]>([]);
  const [libTotal, setLibTotal] = useState(0);
  const [libSearch, setLibSearch] = useState('');
  const [libPage, setLibPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await apiService.get('/shop/products/', { params: { search, page, category } });
      setItems(data.results || []);
      setTotal(data.count || 0);
    } catch (e: any) { setError('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search, category]);

  // Sync category with URL query param
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    if (cat && cat !== category) {
      setCategory(cat);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOpen = (p?: any) => {
    if (p) {
      setEditing(p);
      setForm({ name: p.name || '', price: p.price ?? 0, stock: p.stock ?? 0, sku: p.sku || '', category: p.category || '', is_active: !!p.is_active });
    } else {
      setEditing(null);
      setForm({ name: '', price: 0, stock: 0, sku: '', category: '', is_active: true });
    }
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (editing) await apiService.put(`/shop/products/${editing.id}/`, payload);
    else await apiService.post('/shop/products/', payload);
    setOpen(false);
    fetchProducts();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await apiService.delete(`/shop/products/${id}/`);
    fetchProducts();
  };

  // Library book import helpers
  const fetchLibraryBooks = async () => {
    try {
      const data: any = await apiService.get('/library/books/', { params: { search: libSearch, page: libPage } });
      setLibBooks(data.results || []);
      setLibTotal(data.count || 0);
    } catch {}
  };

  useEffect(() => { if (libOpen) fetchLibraryBooks(); }, [libOpen, libSearch, libPage]);

  const useBook = (book: any) => {
    setForm({
      name: book.title,
      sku: book.isbn || '',
      category: 'Book',
      price: 0,
      stock: book.available_copies ?? 0,
      is_active: true,
    });
    setLibOpen(false);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <PageHeader title="Products" subtitle="Manage store products, pricing, and stock" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLibOpen(true)}>Add From Library</Button>
            <Button onClick={() => onOpen()}>Add Product</Button>
          </div>
        </div>
        <FilterBar
          searchPlaceholder="Search products..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          right={(
            <select value={category} onChange={(e) => { const v = e.target.value; setCategory(v); setPage(1); setSearchParams(prev => { const p = new URLSearchParams(prev); if (v) p.set('category', v); else p.delete('category'); return p; }); }} className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
              <option value="">All Categories</option>
              <option value="Book">Book</option>
              <option value="Stationery">Stationery</option>
              <option value="Accessories">Accessories</option>
            </select>
          )}
        />
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">SKU</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Stock</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>No products found.</td></tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {row.image_url ? (
                          <img src={row.image_url} alt={row.name} className="w-10 h-10 rounded object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-500">IMG</div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{row.name}</div>
                          <div className="text-xs text-gray-500">{row.category || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{row.sku}</td>
                    <td className="py-3 pr-4">{row.price}</td>
                    <td className="py-3 pr-4">{row.stock}</td>
                    <td className="py-3 pr-4">{row.is_active ? 'Yes' : 'No'}</td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1" onClick={() => onOpen(row)}>Edit</Button>
                        <Button variant="outline" className="px-3 py-1" onClick={() => onDelete(row.id)}>Delete</Button>
                        <Button className="px-3 py-1" onClick={async () => { await apiService.post('/shop/cart/add/', { name: row.name, sku: row.sku, price: row.price, quantity: 1 }); }}>Add to Cart</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {total > 10 && (
          <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
        )}
      </Card>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-soft w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{editing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value || '0') })} />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value || '0') })} />
              <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {libOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4" onClick={() => setLibOpen(false)}>
          <div className="bg-white rounded-lg shadow-soft w-full max-w-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Book as Product</h3>
            <FilterBar searchPlaceholder="Search books..." searchValue={libSearch} onSearchChange={(v) => { setLibSearch(v); setLibPage(1); }} />
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-600">
                  <tr>
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">ISBN</th>
                    <th className="py-2 pr-4">Author</th>
                    <th className="py-2 pr-4">Available</th>
                    <th className="py-2 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {libBooks.length === 0 ? (
                    <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No books found.</td></tr>
                  ) : (
                    libBooks.map((b: any) => (
                      <tr key={b.id} className="border-t">
                        <td className="py-3 pr-4">{b.title}</td>
                        <td className="py-3 pr-4">{b.isbn || '-'}</td>
                        <td className="py-3 pr-4">{b.author?.name || '-'}</td>
                        <td className="py-3 pr-4">{b.available_copies ?? '-'}</td>
                        <td className="py-3 pr-0 text-right">
                          <Button variant="outline" className="px-3 py-1" onClick={() => useBook(b)}>Select</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {libTotal > 10 && (
              <Pagination page={libPage} pageSize={10} total={libTotal} onPageChange={setLibPage} />
            )}
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={() => setLibOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;


