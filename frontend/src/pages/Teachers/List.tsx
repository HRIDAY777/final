import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { getPaginatedData, apiService } from '../../services/api';
import { 
  UserPlusIcon, 
  FunnelIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface TeacherListItem {
  id: string | number;
  teacher_id: string;
  employee_number: string;
  full_name: string;
  age: number;
  gender: 'M' | 'F' | 'O' | string;
  designation: string;
  department: string;
  employment_type: string;
  status: string;
  is_active: boolean;
  joining_date: string;
  email?: string;
  phone?: string;
}

interface Paginated<T> { count: number; results: T[]; }

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    suspended: 'bg-red-100 text-red-700',
    resigned: 'bg-amber-100 text-amber-700',
    retired: 'bg-blue-100 text-blue-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{status}</span>;
};

const GenderBadge: React.FC<{ gender: string }> = ({ gender }) => {
  const map: Record<string, string> = {
    M: 'bg-blue-100 text-blue-700',
    F: 'bg-pink-100 text-pink-700',
    O: 'bg-purple-100 text-purple-700',
  };
  const klass = map[gender] || 'bg-gray-100 text-gray-700';
  const label = gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{label}</span>;
};

const TeachersList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<TeacherListItem[]>([]);
  const [selected, setSelected] = useState<TeacherListItem | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => ({ search, status, gender, department, employmentType }), [search, status, gender, department, employmentType]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.gender) params.gender = filters.gender;
      if (filters.department) params.department = filters.department;
      if (filters.employmentType) params.employment_type = filters.employmentType;
      
      const data = await getPaginatedData<TeacherListItem>('/teachers/', page, pageSize, params) as unknown as Paginated<TeacherListItem>;
      setItems(data.results || []);
      setTotal(data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.search, filters.status, filters.gender, filters.department, filters.employmentType]);

  const openProfile = async (row: TeacherListItem) => {
    setSelected(row);
    try {
      const data = await apiService.get(`/teachers/${row.id}/`);
      setProfile(data);
    } catch (e) {
      setProfile(null);
    }
  };

  const toggleActive = async (row: TeacherListItem) => {
    const action = row.is_active ? 'deactivate' : 'activate';
    await apiService.post(`/teachers/${row.id}/${action}/`);
    fetchTeachers();
  };

  const remove = async (row: TeacherListItem) => {
    if (!confirm('Delete this teacher? This cannot be undone.')) return;
    await apiService.delete(`/teachers/${row.id}/`);
    fetchTeachers();
  };

  const exportTeachers = async () => {
    try {
      const response = await apiService.get('/teachers/export/', { 
        params: { format: 'csv' },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'teachers.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title="Teachers" 
          subtitle="Manage all teachers in the system"
          right={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={exportTeachers}>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => window.location.href = '/teachers/create'}>
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          }
        />
        
        <FilterBar
          searchPlaceholder="Search by name, ID, employee no, email..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
        />

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">All Status</option>
                  {['active','inactive','suspended','resigned','retired'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  value={gender} 
                  onChange={(e) => { setGender(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">All Genders</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                  placeholder="Filter by department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <select 
                  value={employmentType} 
                  onChange={(e) => { setEmploymentType(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">All Types</option>
                  {['full_time','part_time','contract','visiting'].map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => { setStatus(''); setGender(''); setDepartment(''); setEmploymentType(''); setPage(1); }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600 border-b">
              <tr>
                <th className="py-3 pr-4 font-medium">Teacher</th>
                <th className="py-3 pr-4 font-medium">ID</th>
                <th className="py-3 pr-4 font-medium">Employee No</th>
                <th className="py-3 pr-4 font-medium">Department</th>
                <th className="py-3 pr-4 font-medium">Designation</th>
                <th className="py-3 pr-4 font-medium">Gender</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Contact</th>
                <th className="py-3 pr-4 font-medium">Joining Date</th>
                <th className="py-3 pr-0 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-8 text-center text-gray-500" colSpan={10}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-8 text-center text-gray-500" colSpan={10}>No teachers found.</td></tr>
              ) : (
                items.map(row => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 pr-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <UserIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{row.full_name}</p>
                          <p className="text-xs text-gray-500">Age: {row.age}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 font-mono text-sm">{row.teacher_id}</td>
                    <td className="py-4 pr-4 font-mono text-sm">{row.employee_number}</td>
                    <td className="py-4 pr-4">{row.department}</td>
                    <td className="py-4 pr-4">{row.designation}</td>
                    <td className="py-4 pr-4"><GenderBadge gender={row.gender} /></td>
                    <td className="py-4 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-4 pr-4">
                      <div className="text-xs">
                        <p>{row.email || '-'}</p>
                        <p className="text-gray-500">{row.phone || '-'}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm">{new Date(row.joining_date).toLocaleDateString()}</td>
                    <td className="py-4 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openProfile(row)}
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/teachers/${row.id}/edit`}
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleActive(row)}
                          title={row.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {row.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => remove(row)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
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

      {/* Teacher Profile Modal */}
      {selected && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selected.full_name}</h3>
              <p className="text-sm text-gray-600">
                Teacher ID: {selected.teacher_id} • Employee: {selected.employee_number}
              </p>
            </div>
            <Button variant="outline" onClick={() => { setSelected(null); setProfile(null); }}>
              Close
            </Button>
          </div>
          {profile ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Full Name:</span>
                    <span className="ml-2 font-medium">{profile.full_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium">{profile.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-2"><GenderBadge gender={profile.gender} /></span>
                  </div>
                  <div>
                    <span className="text-gray-500">Blood Group:</span>
                    <span className="ml-2 font-medium">{profile.blood_group || '-'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{profile.email || profile.user?.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{profile.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-2 font-medium">
                      {profile.address}, {profile.city}, {profile.state} {profile.postal_code}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Employment Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 font-medium">{profile.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Designation:</span>
                    <span className="ml-2 font-medium">{profile.designation}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Employment Type:</span>
                    <span className="ml-2 font-medium">{profile.employment_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Joining Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(profile.joining_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2"><StatusBadge status={profile.status} /></span>
                  </div>
                </div>
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

export default TeachersList;
