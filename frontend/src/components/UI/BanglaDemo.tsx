import React from 'react';
import { useTranslation } from '../../utils/i18n';
import LanguageSelector from './LanguageSelector';

const BanglaDemo: React.FC = () => {
  const { t, language, formatNumber, formatDate, formatCurrency } = useTranslation();

  const demoData = {
    number: 1234567.89,
    date: new Date(),
    currency: 50000,
    studentCount: 1250,
    teacherCount: 85,
    attendanceRate: 0.95
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('nav.dashboard')} - {t('common.details')}
        </h1>
        <LanguageSelector variant="buttons" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {t('dashboard.total_students')}
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(demoData.studentCount)}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            {t('dashboard.total_teachers')}
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {formatNumber(demoData.teacherCount)}
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            {t('dashboard.attendance_rate')}
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {(demoData.attendanceRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t('common.details')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('common.number')}:</span>
              <span className="font-medium">{formatNumber(demoData.number)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('common.date')}:</span>
              <span className="font-medium">{formatDate(demoData.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('finance.amount')}:</span>
              <span className="font-medium">{formatCurrency(demoData.currency, 'BDT')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t('nav.actions')}
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              {t('actions.add_student')}
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              {t('actions.add_teacher')}
            </button>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              {t('actions.mark_attendance')}
            </button>
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
              {t('actions.create_exam')}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
          {t('messages.success_saved')}
        </h3>
        <p className="text-yellow-800">
          {t('messages.success_saved')} - {t('messages.loading')} - {t('messages.no_data')}
        </p>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          {t('common.current_language')}: <strong>{language}</strong>
        </p>
        <p className="mt-2">
          {t('common.switch_language')} {t('common.using')} {t('common.language_selector')} {t('common.above')}
        </p>
      </div>
    </div>
  );
};

export default BanglaDemo;
