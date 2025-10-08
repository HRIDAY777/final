import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { useBillingStore } from '../../stores/billingStore';
import { useTranslation } from '../../utils/i18n';
import { 
  PlusIcon, 
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-blue-100 text-blue-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{t(`finance.payment_status_${status}`)}</span>;
};

const Payments: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const { payments, paymentsLoading, paymentsError, fetchPayments, deletePayment } = useBillingStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadPayments = useCallback(() => {
    fetchPayments({ page, search });
  }, [fetchPayments, page, search]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const onDelete = async (id: number) => {
    if (!confirm(t('confirm.delete_payment'))) return;
    await deletePayment(id);
    fetchPayments({ page, search });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <PageHeader 
            title={t('finance.payments')} 
            subtitle={t('finance.payments_subtitle')} 
          />
          <Button onClick={() => {}} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            {t('finance.record_payment')}
          </Button>
        </div>
        <FilterBar 
          searchPlaceholder={t('placeholder.search_payments')} 
          searchValue={search} 
          onSearchChange={(v) => { setSearch(v); setPage(1); }} 
        />
      </Card>

      {paymentsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{paymentsError}</div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">{t('finance.invoice')}</th>
                <th className="py-2 pr-4">{t('finance.amount')}</th>
                <th className="py-2 pr-4">{t('finance.payment_method')}</th>
                <th className="py-2 pr-4">{t('finance.payment_date')}</th>
                <th className="py-2 pr-4">{t('finance.status')}</th>
                <th className="py-2 pr-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>{t('common.loading')}</td></tr>
              ) : !payments || payments.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={6}>{t('messages.no_payments_found')}</td></tr>
              ) : (
                payments.results.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.invoice?.invoice_number}</td>
                    <td className="py-3 pr-4">{formatCurrency(row.amount, 'BDT')}</td>
                    <td className="py-3 pr-4 capitalize">{row.payment_method?.replace('_',' ')}</td>
                    <td className="py-3 pr-4">{row.payment_date}</td>
                    <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="px-3 py-1 flex items-center gap-1" onClick={() => {}}>
                          <EyeIcon className="w-3 h-3" />
                          {t('common.view')}
                        </Button>
                        <Button variant="outline" size="sm" className="px-3 py-1 flex items-center gap-1" onClick={() => onDelete(row.id)}>
                          <TrashIcon className="w-3 h-3" />
                          {t('common.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {payments && payments.count > 10 && (
          <Pagination page={page} pageSize={10} total={payments.count} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
};

export default Payments;


