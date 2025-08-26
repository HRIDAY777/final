import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { useBillingStore, Fee } from '../../stores/billingStore';

const Fees: React.FC = () => {
  const { fees, feesLoading, feesError, fetchFees, createFee, updateFee, deleteFee, clearErrors } = useBillingStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Fee | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', amount: '0', currency: 'USD', fee_type: 'tuition', is_recurring: false as boolean, recurring_frequency: 'monthly' as any, due_date: ''
  });

  useEffect(() => { fetchFees({ page, search }); }, [page, search]);
  useEffect(() => { if (feesError) setTimeout(() => clearErrors(), 3000); }, [feesError]);

  const onOpen = (fee?: Fee) => {
    if (fee) {
      setEditing(fee);
      setForm({
        name: fee.name,
        description: fee.description || '',
        amount: String(fee.amount),
        currency: fee.currency || 'USD',
        fee_type: fee.fee_type as any,
        is_recurring: fee.is_recurring,
        recurring_frequency: (fee.recurring_frequency as any) || 'monthly',
        due_date: fee.due_date || ''
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', amount: '0', currency: 'USD', fee_type: 'tuition', is_recurring: false, recurring_frequency: 'monthly', due_date: '' });
    }
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Fee> = {
      name: form.name,
      description: form.description,
      amount: parseFloat(form.amount || '0'),
      currency: form.currency,
      fee_type: form.fee_type as any,
      is_recurring: form.is_recurring,
      recurring_frequency: form.is_recurring ? (form.recurring_frequency as any) : undefined,
      due_date: form.due_date || undefined,
      is_active: true,
    } as any;
    if (editing) await updateFee(editing.id, payload); else await createFee(payload);
    setOpen(false);
    setEditing(null);
    fetchFees({ page, search });
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this fee?')) return;
    await deleteFee(id);
    fetchFees({ page, search });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <PageHeader title="Fees" subtitle="Create and manage student fees" />
          <Button onClick={() => onOpen()} className="px-3 py-2">Add Fee</Button>
        </div>
        <FilterBar searchPlaceholder="Search fees..." searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {feesError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{feesError}</div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Recurring</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feesLoading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>Loading...</td></tr>
              ) : !fees || fees.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>No fees found.</td></tr>
              ) : (
                fees.results.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 pr-4 capitalize">{row.fee_type}</td>
                    <td className="py-3 pr-4">{row.currency || 'USD'} {row.amount}</td>
                    <td className="py-3 pr-4">{row.is_recurring ? `${row.recurring_frequency}` : 'No'}</td>
                    <td className="py-3 pr-4">{row.due_date || '-'}</td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1" onClick={() => onOpen(row)}>Edit</Button>
                        <Button variant="outline" className="px-3 py-1" onClick={() => onDelete(row.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {fees && fees.count > 10 && (
          <Pagination page={page} pageSize={10} total={fees.count} onPageChange={setPage} />
        )}
      </Card>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-soft w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{editing ? 'Edit Fee' : 'Add Fee'}</h3>
            <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <select className="px-3 py-2 border border-gray-300 rounded-md" value={form.fee_type} onChange={(e) => setForm({ ...form, fee_type: e.target.value })}>
                {['tuition','library','transport','meal','other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 col-span-2"><input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} /> Recurring</label>
              {form.is_recurring && (
                <select className="px-3 py-2 border border-gray-300 rounded-md" value={form.recurring_frequency} onChange={(e) => setForm({ ...form, recurring_frequency: e.target.value as any })}>
                  {['monthly','quarterly','yearly'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              )}
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder="Due date (YYYY-MM-DD)" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <textarea className="px-3 py-2 border border-gray-300 rounded-md sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;


