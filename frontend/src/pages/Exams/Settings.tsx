import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { examAPI } from '../../services/api';

const Settings: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [pass, setPass] = useState(40);

  const fetchSettings = async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await examAPI.getSettings({ page: 1 });
      setItems(data.results || []);
    } catch (e) { setError('Failed to load settings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const create = async () => {
    await examAPI.createSetting({ default_exam_duration: duration, default_passing_percentage: pass, allow_exam_retakes: true, max_retake_attempts: 1, auto_grade_objective_questions: true, require_teacher_approval: false, send_result_notifications: true });
    fetchSettings();
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Exam Settings" subtitle="Configure grading policies and exam preferences" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value || '0'))} placeholder="Default duration (min)" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm" />
          <input type="number" value={pass} onChange={(e) => setPass(parseInt(e.target.value || '0'))} placeholder="Passing %" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm" />
          <div className="sm:col-span-2"><Button onClick={create} className="w-full">Create Setting</Button></div>
        </div>
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Pass %</th>
                <th className="py-2 pr-4">Auto Grade</th>
                <th className="py-2 pr-4">Retakes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={4}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={4}>No settings found.</td></tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.default_exam_duration} min</td>
                    <td className="py-3 pr-4">{row.default_passing_percentage}%</td>
                    <td className="py-3 pr-4">{row.auto_grade_objective_questions ? 'Yes' : 'No'}</td>
                    <td className="py-3 pr-4">{row.allow_exam_retakes ? `Yes (${row.max_retake_attempts})` : 'No'}</td>
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


