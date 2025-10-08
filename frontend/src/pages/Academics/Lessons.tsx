import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { academicAPI } from '../../services/api';

const Lessons: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ course: '', title: '', content: '', duration_minutes: 45, order: 1, is_active: true });

  const fetchLessons = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await academicAPI.getLessons({ search, page });
      setItems(data.results || []);
      setTotal(data.count || 0);
    } catch (e) { setError('Failed to load lessons'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const onOpen = (l?: any) => {
    if (l) {
      setEditing(l);
      setForm({ course: l.course?.id || '', title: l.title || '', content: l.content || '', duration_minutes: l.duration_minutes ?? 45, order: l.order ?? 1, is_active: !!l.is_active });
    } else {
      setEditing(null);
      setForm({ course: '', title: '', content: '', duration_minutes: 45, order: 1, is_active: true });
    }
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (editing) await academicAPI.updateLesson(editing.id, payload);
    else await academicAPI.createLesson(payload);
    setOpen(false);
    fetchLessons();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    await academicAPI.deleteLesson(id);
    fetchLessons();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <PageHeader title="Lessons" subtitle="Manage course lessons" />
          <Button onClick={() => onOpen()}>Add Lesson</Button>
        </div>
        <FilterBar searchPlaceholder="Search lessons..." searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No lessons found.</td></tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.course?.subject?.name || '-'}</td>
                    <td className="py-3 pr-4">{row.title}</td>
                    <td className="py-3 pr-4">{row.duration_minutes} min</td>
                    <td className="py-3 pr-4">{row.order}</td>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{editing ? 'Edit Lesson' : 'Add Lesson'}</h3>
            <form onSubmit={onSave} className="grid grid-cols-1 gap-3">
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Course ID" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <textarea className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Duration (min)" type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value || '45') })} />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value || '1') })} />
              <div className="flex justify-end gap-2 mt-2">
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

export default Lessons;



