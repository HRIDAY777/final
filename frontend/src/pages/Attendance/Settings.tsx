import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { useAttendanceSettings } from '../../stores/attendanceStore';

const Settings: React.FC = () => {
  const { settings, loading, error, fetchSettings, createSetting, updateSetting, deleteSetting } = useAttendanceSettings() as any;
  const [late, setLate] = useState(10);
  const [absent, setAbsent] = useState(30);
  const [notify, setNotify] = useState(true);

  useEffect(() => { fetchSettings({ page: 1 }); }, []);

  const onCreate = async () => {
    await createSetting({ late_threshold_minutes: late, absent_threshold_minutes: absent, send_notifications: notify, auto_mark_absent: true });
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Attendance Settings" subtitle="Configure thresholds and notification policies" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input type="number" value={late} onChange={(e) => setLate(parseInt(e.target.value || '0'))} placeholder="Late threshold (min)" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm" />
          <input type="number" value={absent} onChange={(e) => setAbsent(parseInt(e.target.value || '0'))} placeholder="Absent threshold (min)" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm" />
          <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Send notifications</label>
          <div className="sm:col-span-2"><Button onClick={onCreate} className="w-full">Create Setting</Button></div>
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
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Late (min)</th>
                <th className="py-2 pr-4">Absent (min)</th>
                <th className="py-2 pr-4">Notify</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!settings || !settings.results || settings.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No settings found.</td></tr>
              ) : (
                settings.results.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.class_enrolled?.name || '-'}</td>
                    <td className="py-3 pr-4">{row.late_threshold_minutes}</td>
                    <td className="py-3 pr-4">{row.absent_threshold_minutes}</td>
                    <td className="py-3 pr-4">{row.send_notifications ? 'Yes' : 'No'}</td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1" onClick={() => updateSetting(row.id, { late_threshold_minutes: late })}>Update</Button>
                        <Button variant="outline" className="px-3 py-1" onClick={() => deleteSetting(row.id)}>Delete</Button>
                      </div>
                    </td>
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

export default Settings;


