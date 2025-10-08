import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { useLibraryStore } from '../../stores/libraryStore';
import { useTranslation } from '../../utils/i18n';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  GlobeAltIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Authors: React.FC = () => {
  const { t } = useTranslation();
  const { authors, authorsLoading, authorsError, fetchAuthors, createAuthor, updateAuthor, deleteAuthor, clearErrors } = useLibraryStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [nationality, setNationality] = useState('');
  const [birth, setBirth] = useState('');

  const fetchAuthorsCallback = useCallback(() => {
    fetchAuthors({ page, search });
  }, [fetchAuthors, page, search]);

  const clearErrorsCallback = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  useEffect(() => { fetchAuthorsCallback(); }, [fetchAuthorsCallback]);
  useEffect(() => { if (authorsError) setTimeout(() => clearErrorsCallback(), 3000); }, [authorsError, clearErrorsCallback]);

  const onOpen = (a?: any) => {
    setEditing(a || null);
    setName(a?.name || '');
    setBiography(a?.biography || '');
    setNationality(a?.nationality || '');
    setBirth(a?.birth_date || '');
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { name, biography, nationality, birth_date: birth || undefined };
    if (editing) await updateAuthor(editing.id, payload); else await createAuthor(payload);
    setOpen(false);
    fetchAuthors({ page, search });
  };

  const onDelete = async (id: number) => {
    if (!confirm(t('confirm.delete_author'))) return;
    await deleteAuthor(id);
    fetchAuthors({ page, search });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <PageHeader 
            title={t('library.authors')} 
            subtitle={t('library.authors_subtitle')} 
          />
          <Button onClick={() => onOpen()} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            {t('library.add_author')}
          </Button>
        </div>
        <FilterBar 
          searchPlaceholder={t('placeholder.search_authors')} 
          searchValue={search} 
          onSearchChange={(v) => { setSearch(v); setPage(1); }} 
        />
      </Card>

      {authorsError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{authorsError}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">{t('library.author_name')}</th>
                <th className="py-2 pr-4">{t('library.nationality')}</th>
                <th className="py-2 pr-4">{t('library.birth_date')}</th>
                <th className="py-2 pr-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {authorsLoading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={4}>{t('common.loading')}</td></tr>
              ) : !authors || authors.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={4}>{t('messages.no_authors_found')}</td></tr>
              ) : (
                authors.results.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      {row.name}
                    </td>
                    <td className="py-3 pr-4 flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                      {row.nationality || '-'}
                    </td>
                    <td className="py-3 pr-4 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      {row.birth_date || '-'}
                    </td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="px-3 py-1 flex items-center gap-1" onClick={() => onOpen(row)}>
                          <PencilIcon className="w-3 h-3" />
                          {t('common.edit')}
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
        {authors && authors.count > 10 && (
          <Pagination page={page} pageSize={10} total={authors.count} onPageChange={setPage} />
        )}
      </Card>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-soft w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              {editing ? t('library.edit_author') : t('library.add_author')}
            </h3>
            <form onSubmit={onSave} className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('library.author_name')}</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder={t('placeholder.enter_author_name')} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('library.nationality')}</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder={t('placeholder.enter_nationality')} 
                  value={nationality} 
                  onChange={(e) => setNationality(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('library.birth_date')}</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder={t('placeholder.enter_birth_date')} 
                  value={birth} 
                  onChange={(e) => setBirth(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('library.biography')}</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder={t('placeholder.enter_biography')} 
                  value={biography} 
                  onChange={(e) => setBiography(e.target.value)} 
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;


