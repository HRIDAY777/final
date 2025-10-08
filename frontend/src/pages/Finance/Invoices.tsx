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
  PaperAirplaneIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{t(`finance.status_${status}`)}</span>;
};

const Invoices: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const { invoices, invoicesLoading, invoicesError, fetchInvoices, deleteInvoice, sendInvoice } = useBillingStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadInvoices = useCallback(() => {
    fetchInvoices({ page, search });
  }, [fetchInvoices, page, search]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const onDelete = async (id: number) => {
    if (!confirm(t('confirm.delete_invoice'))) return;
    await deleteInvoice(id);
    fetchInvoices({ page, search });
  };

  const onSend = async (id: number) => {
    await sendInvoice(id);
    fetchInvoices({ page, search });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <PageHeader 
            title={t('finance.invoices')} 
            subtitle={t('finance.invoices_subtitle')} 
          />
          <Button onClick={() => {}} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            {t('finance.create_invoice')}
          </Button>
        </div>
        <FilterBar 
          searchPlaceholder={t('placeholder.search_invoices')} 
          searchValue={search} 
          onSearchChange={(v) => { setSearch(v); setPage(1); }} 
        />
      </Card>

      {invoicesError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{invoicesError}</div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">{t('finance.invoice_number')}</th>
                <th className="py-2 pr-4">{t('finance.amount')}</th>
                <th className="py-2 pr-4">{t('finance.due_date')}</th>
                <th className="py-2 pr-4">{t('finance.status')}</th>
                <th className="py-2 pr-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {invoicesLoading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>{t('common.loading')}</td></tr>
              ) : !invoices || invoices.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>{t('messages.no_invoices_found')}</td></tr>
              ) : (
                invoices.results.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.invoice_number}</td>
                    <td className="py-3 pr-4">{formatCurrency(row.total_amount, 'BDT')}</td>
                    <td className="py-3 pr-4">{row.due_date}</td>
                    <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="px-3 py-1 flex items-center gap-1" onClick={() => {}}>
                          <EyeIcon className="w-3 h-3" />
                          {t('common.view')}
                        </Button>
                        <Button variant="outline" size="sm" className="px-3 py-1 flex items-center gap-1" onClick={() => onSend(row.id)}>
                          <PaperAirplaneIcon className="w-3 h-3" />
                          {t('finance.send')}
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
        {invoices && invoices.count > 10 && (
          <Pagination page={page} pageSize={10} total={invoices.count} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
};

export default Invoices;


