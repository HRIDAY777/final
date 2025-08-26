import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { getPaginatedData, apiService } from '../../services/api';

interface StudentListItem {
  id: string | number;
  student_id: string;
  admission_number: string;
  full_name: string;
  age: number;
  gender: 'M' | 'F' | 'O' | string;
  current_class: string | number | null;
  current_class_name?: string | null;
  academic_year: string | number | null;
  academic_year_name?: string | null;
  status: string;
  is_active: boolean;
  admission_date: string;
}

interface Paginated<T> { count: number; results: T[]; }

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    graduated: 'bg-blue-100 text-blue-700',
    transferred: 'bg-amber-100 text-amber-700',
    suspended: 'bg-red-100 text-red-700',
    expelled: 'bg-red-200 text-red-800',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{status}</span>;
};

const Students: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<StudentListItem[]>([]);
  const [selected, setSelected] = useState<StudentListItem | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  const filters = useMemo(() => ({ search, status, gender }), [search, status, gender]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.gender) params.gender = filters.gender;
      const data = await getPaginatedData<StudentListItem>('/academics/students/', page, pageSize, params) as unknown as Paginated<StudentListItem>;
      setItems(data.results || []);
      setTotal(data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.search, filters.status, filters.gender]);

  const openProfile = async (row: StudentListItem) => {
    setSelected(row);
    try {
      const data = await apiService.get(`/academics/students/${row.id}/profile/`);
      setProfile(data);
    } catch (e) {
      setProfile(null);
    }
  };

  const toggleActive = async (row: StudentListItem) => {
    const action = row.is_active ? 'deactivate' : 'activate';
    await apiService.post(`/academics/students/${row.id}/${action}/`);
    fetchStudents();
  };

  const remove = async (row: StudentListItem) => {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    await apiService.delete(`/academics/students/${row.id}/`);
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Students" subtitle="Manage school students" />
        <FilterBar
          searchPlaceholder="Search by name, ID, admission no..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          right={(
            <div className="flex flex-wrap gap-2 items-center">
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
                <option value="">All Status</option>
                {['active','inactive','graduated','transferred','suspended','expelled'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
                <option value="">All Genders</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          )}
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Admission</th>
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Gender</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={7}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={7}>No students found.</td></tr>
              ) : (
                items.map(row => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.full_name}</td>
                    <td className="py-3 pr-4">{row.student_id}</td>
                    <td className="py-3 pr-4">{row.admission_number}</td>
                    <td className="py-3 pr-4">{row.current_class_name || '-'}</td>
                    <td className="py-3 pr-4">{row.gender}</td>
                    <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1" onClick={() => openProfile(row)}>View</Button>
                        <Button className="px-3 py-1" onClick={() => toggleActive(row)}>{row.is_active ? 'Deactivate' : 'Activate'}</Button>
                        <Button variant="outline" className="px-3 py-1" onClick={() => remove(row)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>

      {selected && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selected.full_name}</h3>
              <p className="text-sm text-gray-600">Student ID: {selected.student_id} • Admission: {selected.admission_number}</p>
            </div>
            <Button variant="outline" onClick={() => { setSelected(null); setProfile(null); }}>Close</Button>
          </div>
          {profile ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{profile.email || profile.user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium">{profile.phone || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Address</p>
                <p className="font-medium">{profile.address}, {profile.city}, {profile.state} {profile.postal_code}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <div className="font-medium"><StatusBadge status={profile.status} /></div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-600">Loading profile...</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default Students;



