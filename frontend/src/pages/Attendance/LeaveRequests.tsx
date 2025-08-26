import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { useLeaveRequests } from '../../stores/attendanceStore';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{status}</span>;
};

const LeaveRequests: React.FC = () => {
  const { leaveRequests, loading, error, fetchLeaveRequests, approveLeaveRequest, rejectLeaveRequest } = useLeaveRequests() as any;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const filters = useMemo(() => ({ search, status }), [search, status]);

  useEffect(() => {
    fetchLeaveRequests({ page, search: filters.search, status: filters.status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.search, filters.status]);

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Leave Requests" subtitle="Approve or reject student leave requests" />
        <FilterBar
          searchPlaceholder="Search by student or reason..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          right={(
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
              <option value="">All Status</option>
              {['pending','approved','rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        />
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Dates</th>
                <th className="py-2 pr-4">Reason</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!leaveRequests || !leaveRequests.results || leaveRequests.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No leave requests found.</td></tr>
              ) : (
                leaveRequests.results.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.student?.user?.first_name} {row.student?.user?.last_name}</td>
                    <td className="py-3 pr-4">{row.start_date} → {row.end_date}</td>
                    <td className="py-3 pr-4">{row.reason}</td>
                    <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button disabled={row.status !== 'pending'} onClick={() => approveLeaveRequest(row.id, { remarks: '' })}>Approve</Button>
                        <Button variant="outline" disabled={row.status !== 'pending'} onClick={() => rejectLeaveRequest(row.id, { remarks: '' })}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {leaveRequests && leaveRequests.count > 10 && (
          <Pagination page={page} pageSize={10} total={leaveRequests.count} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
};

export default LeaveRequests;


