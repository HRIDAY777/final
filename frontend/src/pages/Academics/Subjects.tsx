import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { academicAPI } from '../../services/api';

const Subjects: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', credits: 1, is_core: true });

  const fetchSubjects = async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await academicAPI.getSubjects({ search, page });
      setItems(data.results || []);
      setTotal(data.count || 0);
    } catch (e: any) { setError('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, [page, search]);

  const onOpen = (s?: any) => {
    if (s) {
      setEditing(s);
      setForm({ name: s.name || '', code: s.code || '', description: s.description || '', credits: s.credits ?? 1, is_core: !!s.is_core });
    } else {
      setEditing(null);
      setForm({ name: '', code: '', description: '', credits: 1, is_core: true });
    }
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form } as any;
    if (editing) await academicAPI.updateSubject(editing.id, payload);
    else await academicAPI.createSubject(payload);
    setOpen(false);
    fetchSubjects();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    await academicAPI.deleteSubject(id);
    fetchSubjects();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <PageHeader title="Subjects" subtitle="Manage school subjects and courses" />
          <Button onClick={() => onOpen()}>Add Subject</Button>
        </div>
        <FilterBar searchPlaceholder="Search by name or code..." searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Credits</th>
                <th className="py-2 pr-4">Core</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No subjects found.</td></tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 pr-4">{row.code}</td>
                    <td className="py-3 pr-4">{row.credits ?? '-'}</td>
                    <td className="py-3 pr-4">{row.is_core ? 'Yes' : 'No'}</td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1" onClick={() => onOpen(row)}>Edit</Button>
                        <Button variant="outline" className="px-3 py-1" onClick={() => onDelete(row.id)}>Delete</Button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{editing ? 'Edit Subject' : 'Add Subject'}</h3>
            <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Credits" type="number" min={1} value={form.credits} onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value || '1') })} />
              <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.is_core} onChange={(e) => setForm({ ...form, is_core: e.target.checked })} /> Core subject</label>
              <textarea className="px-3 py-2 border border-gray-300 rounded-md sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;



