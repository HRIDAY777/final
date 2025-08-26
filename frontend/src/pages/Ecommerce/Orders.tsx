import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{status}</span>;
};

const Orders: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true); setError(null);
    try {
      const data: any = await apiService.get('/shop/orders/', { params: { search, page } });
      setItems(data.results || []);
      setTotal(data.count || 0);
    } catch (e: any) { setError('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, search]);

  const updateStatus = async (id: string, status: string) => {
    await apiService.patch(`/shop/orders/${id}/`, { status });
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title="Orders" subtitle="Manage customer orders and statuses" />
        <FilterBar searchPlaceholder="Search orders..." searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Order #</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>No orders found.</td></tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.order_number || row.id}</td>
                    <td className="py-3 pr-4">{row.customer?.full_name || row.customer_email}</td>
                    <td className="py-3 pr-4">{row.currency || 'USD'} {row.total_amount}</td>
                    <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1" onClick={() => updateStatus(row.id, 'shipped')}>Mark Shipped</Button>
                        <Button variant="outline" className="px-3 py-1" onClick={() => updateStatus(row.id, 'delivered')}>Mark Delivered</Button>
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

export default Orders;


