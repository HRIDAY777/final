import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { getPaginatedData, apiService } from '../../services/api';

interface TeacherListItem {
  id: string | number;
  teacher_id: string;
  employee_number: string;
  full_name: string;
  age: number;
  gender: string;
  designation: string;
  department: string;
  employment_type: string;
  status: string;
  is_active: boolean;
  joining_date: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{status}</span>;
};

const Teachers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<TeacherListItem[]>([]);
  const [selected, setSelected] = useState<TeacherListItem | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  const filters = useMemo(() => ({ search, status, department, employmentType }), [search, status, department, employmentType]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.department) params.department = filters.department;
      if (filters.employmentType) params.employment_type = filters.employmentType;
      const data: any = await getPaginatedData<TeacherListItem>('/academics/teachers/', page, pageSize, params);
      setItems(data.results || []);
      setTotal(data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.search, filters.status, filters.department, filters.employmentType]);

  const openProfile = async (row: TeacherListItem) => {
    setSelected(row);
    try {
      const data = await apiService.get(`/academics/teachers/${row.id}/profile/`);
      setProfile(data);
    } catch (e) {
      setProfile(null);
    }
  };

  const toggleActive = async (row: TeacherListItem) => {
    const action = row.is_active ? 'deactivate' : 'activate';
    await apiService.post(`/academics/teachers/${row.id}/${action}/`);
    fetchTeachers();
  };

  const remove = async (row: TeacherListItem) => {
    if (!confirm('Delete this teacher? This cannot be undone.')) return;
    await apiService.delete(`/academics/teachers/${row.id}/`);
    fetchTeachers();
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Teachers" subtitle="Manage school teachers and staff" />
        <FilterBar
          searchPlaceholder="Search by name, ID, employee no..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          right={(
            <div className="flex flex-wrap gap-2 items-center">
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
                <option value="">All Status</option>
                {['active','inactive'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} placeholder="Department" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm" />
              <select value={employmentType} onChange={(e) => { setEmploymentType(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
                <option value="">Employment type</option>
                {['full_time','part_time','contract'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
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
                <th className="py-2 pr-4">Teacher</th>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Employee No</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Designation</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={7}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={7}>No teachers found.</td></tr>
              ) : (
                items.map(row => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.full_name}</td>
                    <td className="py-3 pr-4">{row.teacher_id}</td>
                    <td className="py-3 pr-4">{row.employee_number}</td>
                    <td className="py-3 pr-4">{row.department}</td>
                    <td className="py-3 pr-4">{row.designation}</td>
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
              <p className="text-sm text-gray-600">Teacher ID: {selected.teacher_id} • Employee: {selected.employee_number}</p>
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

export default Teachers;



