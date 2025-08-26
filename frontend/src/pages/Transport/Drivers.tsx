import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { useTranslation } from '../../utils/i18n';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface Driver {
  id: number;
  name: string;
  license_number: string;
  phone: string;
  email: string;
  experience_years: number;
  status: 'active' | 'inactive' | 'on_leave';
  assigned_vehicle?: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    on_leave: 'bg-yellow-100 text-yellow-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{t(`transport.driver_status_${status}`)}</span>;
};

const Drivers: React.FC = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    phone: '',
    email: '',
    experience_years: '',
    status: 'active'
  });

  // Mock data - in real app, this would be API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockDrivers: Driver[] = [
        {
          id: 1,
          name: 'Ahmed Khan',
          license_number: 'DL-123456',
          phone: '+880 1712345678',
          email: 'ahmed.khan@example.com',
          experience_years: 8,
          status: 'active',
          assigned_vehicle: 'Bus-001'
        },
        {
          id: 2,
          name: 'Rahim Ali',
          license_number: 'DL-789012',
          phone: '+880 1812345678',
          email: 'rahim.ali@example.com',
          experience_years: 5,
          status: 'active',
          assigned_vehicle: 'Bus-002'
        },
        {
          id: 3,
          name: 'Fatima Begum',
          license_number: 'DL-345678',
          phone: '+880 1912345678',
          email: 'fatima.begum@example.com',
          experience_years: 3,
          status: 'on_leave'
        }
      ];
      setDrivers(mockDrivers);
      setLoading(false);
    }, 1000);
  }, []);

  const onOpen = (driver?: Driver) => {
    setEditing(driver || null);
    if (driver) {
      setFormData({
        name: driver.name,
        license_number: driver.license_number,
        phone: driver.phone,
        email: driver.email,
        experience_years: driver.experience_years.toString(),
        status: driver.status
      });
    } else {
      setFormData({
        name: '',
        license_number: '',
        phone: '',
        email: '',
        experience_years: '',
        status: 'active'
      });
    }
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save - in real app, this would be API call
    if (editing) {
      setDrivers(prev => prev.map(d => d.id === editing.id ? { ...d, ...formData, experience_years: parseInt(formData.experience_years) } : d));
    } else {
      const newDriver: Driver = {
        id: Date.now(),
        ...formData,
        experience_years: parseInt(formData.experience_years)
      };
      setDrivers(prev => [...prev, newDriver]);
    }
    setOpen(false);
  };

  const onDelete = async (id: number) => {
    if (!confirm(t('confirm.delete_driver'))) return;
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(search.toLowerCase()) ||
    driver.license_number.toLowerCase().includes(search.toLowerCase()) ||
    driver.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <PageHeader 
            title={t('transport.drivers')} 
            subtitle={t('transport.drivers_subtitle')} 
          />
          <Button onClick={() => onOpen()} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            {t('transport.add_driver')}
          </Button>
        </div>
        <FilterBar 
          searchPlaceholder={t('placeholder.search_drivers')} 
          searchValue={search} 
          onSearchChange={setSearch} 
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">{t('transport.driver_name')}</th>
                <th className="py-2 pr-4">{t('transport.license_number')}</th>
                <th className="py-2 pr-4">{t('transport.contact')}</th>
                <th className="py-2 pr-4">{t('transport.experience')}</th>
                <th className="py-2 pr-4">{t('transport.assigned_vehicle')}</th>
                <th className="py-2 pr-4">{t('transport.status')}</th>
                <th className="py-2 pr-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={7}>{t('common.loading')}</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td className="py-6 text-center text-gray-500" colSpan={7}>{t('messages.no_drivers_found')}</td></tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      {driver.name}
                    </td>
                    <td className="py-3 pr-4 flex items-center gap-2">
                      <IdentificationIcon className="w-4 h-4 text-gray-400" />
                      {driver.license_number}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <PhoneIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{driver.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{driver.email}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{driver.experience_years} {t('transport.years')}</td>
                    <td className="py-3 pr-4 flex items-center gap-2">
                      <TruckIcon className="w-4 h-4 text-gray-400" />
                      {driver.assigned_vehicle || '-'}
                    </td>
                    <td className="py-3 pr-4"><StatusBadge status={driver.status} /></td>
                    <td className="py-3 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="px-3 py-1 flex items-center gap-1" onClick={() => onOpen(driver)}>
                          <PencilIcon className="w-3 h-3" />
                          {t('common.edit')}
                        </Button>
                        <Button variant="outline" size="sm" className="px-3 py-1 flex items-center gap-1" onClick={() => onDelete(driver.id)}>
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
      </Card>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-soft w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              {editing ? t('transport.edit_driver') : t('transport.add_driver')}
            </h3>
            <form onSubmit={onSave} className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.driver_name')}</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder={t('placeholder.enter_driver_name')} 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.license_number')}</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder={t('placeholder.enter_license_number')} 
                  value={formData.license_number} 
                  onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.phone')}</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder={t('placeholder.enter_phone')} 
                    value={formData.phone} 
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.email')}</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder={t('placeholder.enter_email')} 
                    value={formData.email} 
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                    type="email"
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.experience_years')}</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="0" 
                    value={formData.experience_years} 
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))} 
                    type="number"
                    min="0"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.status')}</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={formData.status} 
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))} 
                  >
                    <option value="active">{t('transport.driver_status_active')}</option>
                    <option value="inactive">{t('transport.driver_status_inactive')}</option>
                    <option value="on_leave">{t('transport.driver_status_on_leave')}</option>
                  </select>
                </div>
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

export default Drivers;


