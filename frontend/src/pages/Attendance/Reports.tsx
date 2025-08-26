import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { useAttendanceReports } from '../../stores/attendanceStore';

const Reports: React.FC = () => {
  const { reports, loading, error, fetchReports, generateMonthlyReport } = useAttendanceReports() as any;
  const [studentId, setStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [month, setMonth] = useState('1');

  useEffect(() => {
    fetchReports({ page: 1 });
  }, []);

  const generate = async () => {
    if (!studentId) return;
    await generateMonthlyReport({ student_id: studentId, academic_year: academicYear, month });
    fetchReports({ page: 1 });
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Attendance Reports" subtitle="Generate and view monthly attendance summaries" />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student ID" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm" />
          <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="Academic Year (e.g., 2024-25)" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm" />
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i+1} value={String(i+1)}>{i+1}</option>
            ))}
          </select>
          <div className="sm:col-span-2">
            <Button onClick={generate} className="w-full">Generate Monthly Report</Button>
          </div>
        </div>
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
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Year</th>
                <th className="py-2 pr-4">Month</th>
                <th className="py-2 pr-4">Present</th>
                <th className="py-2 pr-4">Absent</th>
                <th className="py-2 pr-4">Late</th>
                <th className="py-2 pr-4">% Attendance</th>
              </tr>
            </thead>
            <tbody>
              {!reports || !reports.results || reports.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={8}>No reports found.</td></tr>
              ) : (
                reports.results.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.student?.user?.first_name} {row.student?.user?.last_name}</td>
                    <td className="py-3 pr-4">{row.class_enrolled?.name}</td>
                    <td className="py-3 pr-4">{row.academic_year}</td>
                    <td className="py-3 pr-4">{row.month}</td>
                    <td className="py-3 pr-4">{row.present_days}</td>
                    <td className="py-3 pr-4">{row.absent_days}</td>
                    <td className="py-3 pr-4">{row.late_days}</td>
                    <td className="py-3 pr-4">{row.attendance_percentage}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;


