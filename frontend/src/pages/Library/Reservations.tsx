import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { useLibraryStore } from '../../stores/libraryStore';
import { useTranslation } from '../../utils/i18n';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    fulfilled: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{t(`library.reservation_status_${status}`)}</span>;
};

const Reservations: React.FC = () => {
  const { t } = useTranslation();
  const { reservations, reservationsLoading, reservationsError, fetchReservations, deleteReservation } = useLibraryStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchReservations({ page, search }); }, [page, search, fetchReservations]);

  const onDelete = async (id: number) => {
    if (!confirm(t('confirm.delete_reservation'))) return;
    await deleteReservation(id);
    fetchReservations({ page, search });
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader title={t('library.reservations')} subtitle={t('library.reservations_subtitle')} />
        <FilterBar searchPlaceholder={t('placeholder.search_reservations')} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {reservationsError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{reservationsError}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">{t('library.book')}</th>
                <th className="py-2 pr-4">{t('library.user')}</th>
                <th className="py-2 pr-4">{t('library.dates')}</th>
                <th className="py-2 pr-4">{t('library.status')}</th>
                <th className="py-2 pr-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reservationsLoading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>{t('common.loading')}</td></tr>
              ) : !reservations || reservations.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={5}>{t('messages.no_reservations_found')}</td></tr>
              ) : (
                reservations.results.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4">{row.book?.title}</td>
                    <td className="py-3 pr-4">{row.user?.full_name || row.user?.email}</td>
                    <td className="py-3 pr-4">{row.reservation_date} {t('common.to')} {row.expiry_date}</td>
                    <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1" onClick={() => onDelete(row.id)}>{t('common.delete')}</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {reservations && reservations.count > 10 && (
          <Pagination page={page} pageSize={10} total={reservations.count} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
};

export default Reservations;


