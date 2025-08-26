import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { examAPI } from '../../services/api';

const Quizzes: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchQuizzes = async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await examAPI.getQuizzes({ search, page });
      setItems(data.results || []);
      setTotal(data.count || 0);
    } catch (e) {
      setError('Failed to load quizzes');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, [page, search]);

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Quizzes" subtitle="Create and manage quizzes" />
        <FilterBar searchPlaceholder="Search quizzes..." searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Questions</th>
                <th className="py-2 pr-4">Time Limit</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No quizzes found.</td></tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.title}</td>
                    <td className="py-3 pr-4">{row.subject?.name || '-'}</td>
                    <td className="py-3 pr-4">{row.total_questions}</td>
                    <td className="py-3 pr-4">{row.time_limit_minutes} min</td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1">Edit</Button>
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
    </div>
  );
};

export default Quizzes;


