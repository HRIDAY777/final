import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { useBillingStore } from '../../stores/billingStore';
import { useTranslation } from '../../utils/i18n';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';

import { 
  CreditCardIcon, 
  DocumentTextIcon, 
  BanknotesIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const Billing: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const { fetchPlans, plans, plansLoading, invoices, invoicesLoading, fetchInvoices } = useBillingStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadData = useCallback(() => {
    fetchPlans({ page: 1 }); 
    fetchInvoices({ page, search });
  }, [fetchPlans, fetchInvoices, page, search]);

  useEffect(() => { 
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title={t('finance.billing')} 
          subtitle={t('finance.billing_subtitle')} 
        />
        <FilterBar 
          searchPlaceholder={t('placeholder.search_billing')} 
          searchValue={search} 
          onSearchChange={(v) => { setSearch(v); setPage(1); }} 
        />
      </Card>

      {/* Billing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-100">{t('finance.active_plans')}</p>
              <p className="text-2xl font-bold">{plans?.results?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-100">{t('finance.total_invoices')}</p>
              <p className="text-2xl font-bold">{invoices?.count || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BanknotesIcon className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-100">{t('finance.monthly_revenue')}</p>
              <p className="text-2xl font-bold">{formatCurrency(45000, 'BDT')}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-100">{t('finance.payment_rate')}</p>
              <p className="text-2xl font-bold">94.2%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Plans */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('finance.active_plans')}</h3>
          <Button onClick={() => {}} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            {t('finance.add_plan')}
          </Button>
        </div>
        {plansLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">{t('common.loading')}</p>
          </div>
        ) : !plans || !Array.isArray((plans as any).results) || plans.results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('messages.no_plans_found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.results.slice(0,3).map((p) => (
              <div key={p.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-600">{p.billing_cycle}</p>
                  </div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(p.price, 'BDT')}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <EyeIcon className="w-3 h-3" />
                    {t('common.view')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <PencilIcon className="w-3 h-3" />
                    {t('common.edit')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Invoices */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('finance.recent_invoices')}</h3>
          <Button variant="outline" onClick={() => {}}>
            {t('common.view_all')}
          </Button>
        </div>
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
                invoices.results.slice(0,5).map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.invoice_number}</td>
                    <td className="py-3 pr-4">{formatCurrency(row.total_amount, 'BDT')}</td>
                    <td className="py-3 pr-4">{row.due_date}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 text-xs rounded-md ${
                        row.status === 'paid' ? 'bg-green-100 text-green-700' :
                        row.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t(`finance.status_${row.status}`)}
                      </span>
                    </td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="px-3 py-1">
                          {t('common.view')}
                        </Button>
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

export default Billing;


