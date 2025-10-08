import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { useLibraryStore } from '../../stores/libraryStore';
import { useTranslation } from '../../utils/i18n';

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const { categories, categoriesLoading, categoriesError, fetchCategories, createCategory, updateCategory, deleteCategory, clearErrors } = useLibraryStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategoriesCallback = useCallback(() => {
    fetchCategories({ page, search });
  }, [fetchCategories, page, search]);

  const clearErrorsCallback = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  useEffect(() => { fetchCategoriesCallback(); }, [fetchCategoriesCallback]);
  useEffect(() => { if (categoriesError) setTimeout(() => clearErrorsCallback(), 3000); }, [categoriesError, clearErrorsCallback]);

  const onOpen = (c?: any) => {
    setEditing(c || null);
    setName(c?.name || '');
    setDescription(c?.description || '');
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await updateCategory(editing.id, { name, description, is_active: true });
    else await createCategory({ name, description, is_active: true });
    setOpen(false);
    fetchCategories({ page, search });
  };

  const onDelete = async (id: number) => {
    if (!confirm(t('confirm.delete_category'))) return;
    await deleteCategory(id);
    fetchCategories({ page, search });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <PageHeader title={t('library.categories')} subtitle={t('library.categories_subtitle')} />
          <Button onClick={() => onOpen()}>{t('library.add_category')}</Button>
        </div>
        <FilterBar searchPlaceholder={t('placeholder.search_categories')} searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />
      </Card>

      {categoriesError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{categoriesError}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">{t('library.category_name')}</th>
                <th className="py-2 pr-4">{t('library.description')}</th>
                <th className="py-2 pr-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categoriesLoading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={3}>{t('common.loading')}</td></tr>
              ) : !categories || categories.results.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={3}>{t('messages.no_categories_found')}</td></tr>
              ) : (
                categories.results.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 pr-4">{row.description || '-'}</td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="px-3 py-1" onClick={() => onOpen(row)}>{t('common.edit')}</Button>
                        <Button variant="outline" className="px-3 py-1" onClick={() => onDelete(row.id)}>{t('common.delete')}</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {categories && categories.count > 10 && (
          <Pagination page={page} pageSize={10} total={categories.count} onPageChange={setPage} />
        )}
      </Card>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-soft w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{editing ? t('library.edit_category') : t('library.add_category')}</h3>
            <form onSubmit={onSave} className="grid grid-cols-1 gap-3">
              <input className="px-3 py-2 border border-gray-300 rounded-md" placeholder={t('placeholder.enter_category_name')} value={name} onChange={(e) => setName(e.target.value)} required />
              <textarea className="px-3 py-2 border border-gray-300 rounded-md" placeholder={t('placeholder.enter_description')} value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit">{t('common.save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;


