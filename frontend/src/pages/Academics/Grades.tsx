import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { academicAPI } from '../../services/api';

const Grades: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ student: '', course: '', assignment: '', marks_obtained: 0, max_marks: 100, remarks: '' });

  const fetchGrades = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await academicAPI.getGrades({ search, page });
      setItems(data.results || []);
      setTotal(data.count || 0);
    } catch (e) { setError('Failed to load grades'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const onOpen = (g?: any) => {
    if (g) {
      setEditing(g);
      setForm({ student: g.student?.id || '', course: g.course?.id || '', assignment: g.assignment?.id || '', marks_obtained: g.marks_obtained ?? 0, max_marks: g.max_marks ?? 100, remarks: g.remarks || '' });
    } else {
      setEditing(null);
      setForm({ student: '', course: '', assignment: '', marks_obtained: 0, max_marks: 100, remarks: '' });
    }
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (editing) await academicAPI.updateGrade(editing.id, payload);
    else await academicAPI.createGrade(payload);
    setOpen(false);
    fetchGrades();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this grade?')) return;
    await academicAPI.deleteGrade(id);
    fetchGrades();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <PageHeader title="Grades" subtitle="Manage student grades" />
          <Button onClick={() => onOpen()}>Add Grade</Button>
        </div>
        <FilterBar searchPlaceholder="Search grades..." searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Marks</th>
                <th className="py-2 pr-4">Grade</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No grades found.</td></tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.student?.full_name || '-'}</td>
                    <td className="py-3 pr-4">{row.course?.subject?.name || '-'}</td>
                    <td className="py-3 pr-4">{row.marks_obtained}/{row.max_marks} ({row.percentage}%)</td>
                    <td className="py-3 pr-4">{row.grade}</td>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{editing ? 'Edit Grade' : 'Add Grade'}</h3>
            <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Student ID" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Course ID" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Assignment ID (optional)" value={form.assignment} onChange={(e) => setForm({ ...form, assignment: e.target.value })} />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Marks Obtained" type="number" value={form.marks_obtained} onChange={(e) => setForm({ ...form, marks_obtained: parseInt(e.target.value || '0') })} />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Max Marks" type="number" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: parseInt(e.target.value || '100') })} />
              <textarea className="px-3 py-2 border border-gray-300 rounded-md sm:col-span-2" placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
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

export default Grades;



