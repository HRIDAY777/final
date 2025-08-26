import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { academicAPI, apiService } from '../../services/api';

const Courses: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ subject: '', class_enrolled: '', teacher: '', academic_year: '', semester: '', is_active: true });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const fetchCourses = async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await academicAPI.getCourses({ search, page });
      setItems(data.results || []);
      setTotal(data.count || 0);
    } catch (e) { setError('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, [page, search]);

  const onOpen = (c?: any) => {
    if (c) {
      setEditing(c);
      setForm({ subject: c.subject?.id || '', class_enrolled: c.class_enrolled?.id || '', teacher: c.teacher?.id || '', academic_year: c.academic_year || '', semester: c.semester || '', is_active: !!c.is_active });
    } else {
      setEditing(null);
      setForm({ subject: '', class_enrolled: '', teacher: '', academic_year: '', semester: '', is_active: true });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    // Load dropdown options (first page)
    (async () => {
      try {
        const [subs, cls, tchs] = await Promise.all([
          academicAPI.getSubjects({ page_size: 100 }) as any,
          academicAPI.getClasses?.({ page_size: 100 }) as any ?? apiService.get('/academics/classes/?page_size=100') as any,
          academicAPI.getTeachers({ page_size: 100 }) as any,
        ]);
        setSubjects(subs?.results || []);
        // getClasses may not exist in academicAPI helper; fallback handled above
        setClasses((cls as any)?.results || (cls as any)?.results || []);
        setTeachers(tchs?.results || []);
      } catch {}
    })();
  }, [open]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (editing) await academicAPI.updateCourse(editing.id, payload);
    else await academicAPI.createCourse(payload);
    setOpen(false);
    fetchCourses();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    await academicAPI.deleteCourse(id);
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <PageHeader title="Courses" subtitle="Manage academic courses" />
          <Button onClick={() => onOpen()}>Add Course</Button>
        </div>
        <FilterBar searchPlaceholder="Search courses..." searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Teacher</th>
                <th className="py-2 pr-4">Year</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>No courses found.</td></tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.subject?.name || '-'}</td>
                    <td className="py-3 pr-4">{row.class_enrolled?.name || '-'}</td>
                    <td className="py-3 pr-4">{row.teacher?.full_name || '-'}</td>
                    <td className="py-3 pr-4">{row.academic_year}</td>
                    <td className="py-3 pr-4">{row.is_active ? 'Yes' : 'No'}</td>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{editing ? 'Edit Course' : 'Add Course'}</h3>
            <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className="px-3 py-2 border border-gray-300 rounded-md" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                <option value="">Select Subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md" value={form.class_enrolled} onChange={(e) => setForm({ ...form, class_enrolled: e.target.value })} required>
                <option value="">Select Class</option>
                {classes.map((cl: any) => <option key={cl.id} value={cl.id}>{cl.name}{cl.section ? ` - ${cl.section}` : ''}</option>)}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} required>
                <option value="">Select Teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name || t.user?.first_name + ' ' + t.user?.last_name}</option>)}
              </select>
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Academic Year" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} required />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
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

export default Courses;



