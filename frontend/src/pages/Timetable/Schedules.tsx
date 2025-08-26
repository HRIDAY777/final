import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { getPaginatedData, apiService } from '../../services/api';
import { 
  CalendarIcon, 
  FunnelIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ScheduleListItem {
  id: number;
  name: string;
  schedule_type: string;
  academic_year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description: string;
  created_by_name: string;
  created_at: string;
}

interface Paginated<T> { count: number; results: T[]; }

const ScheduleTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, string> = {
    regular: 'bg-blue-100 text-blue-700',
    exam: 'bg-red-100 text-red-700',
    special: 'bg-purple-100 text-purple-700',
    holiday: 'bg-yellow-100 text-yellow-700',
  };
  const klass = map[type] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{type}</span>;
};

const Schedules: React.FC = () => {
  const [search, setSearch] = useState('');
  const [scheduleType, setScheduleType] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<ScheduleListItem[]>([]);
  const [selected, setSelected] = useState<ScheduleListItem | null>(null);
  const [schedule, setSchedule] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => ({ search, scheduleType, academicYear, isActive }), [search, scheduleType, academicYear, isActive]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.scheduleType) params.schedule_type = filters.scheduleType;
      if (filters.academicYear) params.academic_year = filters.academicYear;
      if (filters.isActive) params.is_active = filters.isActive;
      
      const data = await getPaginatedData<ScheduleListItem>('/timetable/schedules/', page, pageSize, params) as unknown as Paginated<ScheduleListItem>;
      setItems(data.results || []);
      setTotal(data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.search, filters.scheduleType, filters.academicYear, filters.isActive]);

  const openSchedule = async (row: ScheduleListItem) => {
    setSelected(row);
    try {
      const data = await apiService.get(`/timetable/schedules/${row.id}/`);
      setSchedule(data);
    } catch (e) {
      setSchedule(null);
    }
  };

  const toggleActive = async (row: ScheduleListItem) => {
    const action = row.is_active ? 'deactivate' : 'activate';
    await apiService.post(`/timetable/schedules/${row.id}/${action}/`);
    fetchSchedules();
  };

  const remove = async (row: ScheduleListItem) => {
    if (!confirm('Delete this schedule? This cannot be undone.')) return;
    await apiService.delete(`/timetable/schedules/${row.id}/`);
    fetchSchedules();
  };

  const exportSchedules = async () => {
    try {
      const response = await apiService.get('/timetable/schedules/export/', { 
        params: { format: 'csv' },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'schedules.csv');
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
          title="Schedules" 
          subtitle="Manage all schedules and timetables"
          right={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={exportSchedules}>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => window.location.href = '/timetable/create'}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          }
        />
        
        <FilterBar
          searchPlaceholder="Search by name, description..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
        />

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                <select 
                  value={scheduleType} 
                  onChange={(e) => { setScheduleType(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">All Types</option>
                  <option value="regular">Regular</option>
                  <option value="exam">Exam</option>
                  <option value="special">Special</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => { setAcademicYear(e.target.value); setPage(1); }}
                  placeholder="Filter by academic year"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={isActive} 
                  onChange={(e) => { setIsActive(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => { setScheduleType(''); setAcademicYear(''); setIsActive(''); setPage(1); }}
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
                <th className="py-3 pr-4 font-medium">Schedule</th>
                <th className="py-3 pr-4 font-medium">Type</th>
                <th className="py-3 pr-4 font-medium">Academic Year</th>
                <th className="py-3 pr-4 font-medium">Duration</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Created By</th>
                <th className="py-3 pr-4 font-medium">Created</th>
                <th className="py-3 pr-0 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-8 text-center text-gray-500" colSpan={8}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-8 text-center text-gray-500" colSpan={8}>No schedules found.</td></tr>
              ) : (
                items.map(row => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 pr-4">
                      <div>
                        <p className="font-medium text-gray-900">{row.name}</p>
                        <p className="text-xs text-gray-500">{row.description}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <ScheduleTypeBadge type={row.schedule_type} />
                    </td>
                    <td className="py-4 pr-4">{row.academic_year_name}</td>
                    <td className="py-4 pr-4">
                      <div className="text-xs">
                        <p>{new Date(row.start_date).toLocaleDateString()}</p>
                        <p className="text-gray-500">to {new Date(row.end_date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-0.5 text-xs rounded-md ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm">{row.created_by_name}</td>
                    <td className="py-4 pr-4 text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="py-4 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openSchedule(row)}
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/timetable/schedules/${row.id}/edit`}
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/timetable/schedules/${row.id}/timetable`}
                          title="View Timetable"
                        >
                          <ClockIcon className="w-4 h-4" />
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

      {/* Schedule Detail Modal */}
      {selected && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selected.name}</h3>
              <p className="text-sm text-gray-600">
                {selected.schedule_type} • {selected.academic_year_name}
              </p>
            </div>
            <Button variant="outline" onClick={() => { setSelected(null); setSchedule(null); }}>
              Close
            </Button>
          </div>
          {schedule ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Schedule Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{schedule.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2"><ScheduleTypeBadge type={schedule.schedule_type} /></span>
                  </div>
                  <div>
                    <span className="text-gray-500">Academic Year:</span>
                    <span className="ml-2 font-medium">{schedule.academic_year_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-md ${schedule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Duration</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(schedule.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">End Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(schedule.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(schedule.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created By:</span>
                    <span className="ml-2 font-medium">{schedule.created_by_name}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Class Schedules:</span>
                    <span className="ml-2 font-medium">{schedule.class_schedules?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Conflicts:</span>
                    <span className="ml-2 font-medium">{schedule.conflicts?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Changes:</span>
                    <span className="ml-2 font-medium">{schedule.changes?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-600">Loading schedule details...</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default Schedules;
