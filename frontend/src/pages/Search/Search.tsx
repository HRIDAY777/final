import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { useTranslation } from '../../utils/i18n';
import { MagnifyingGlassIcon, AcademicCapIcon, BookOpenIcon, UserGroupIcon, CalendarIcon, CurrencyDollarIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const useQuery = () => new URLSearchParams(useLocation().search);

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<any>;
  category: string;
}

const Search: React.FC = () => {
  const { t } = useTranslation();
  const q = useQuery().get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock search results - in real app, this would be an API call
  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'student',
          title: 'John Doe',
          description: 'Student in Class 10A',
          url: '/students',
          icon: UserGroupIcon,
          category: 'Students'
        },
        {
          id: '2',
          type: 'teacher',
          title: 'Sarah Smith',
          description: 'Mathematics Teacher',
          url: '/teachers',
          icon: AcademicCapIcon,
          category: 'Teachers'
        },
        {
          id: '3',
          type: 'class',
          title: 'Class 10A',
          description: 'Grade 10 Section A',
          url: '/academics/classes',
          icon: BuildingLibraryIcon,
          category: 'Classes'
        },
        {
          id: '4',
          type: 'book',
          title: 'Advanced Mathematics',
          description: 'Textbook for Grade 10',
          url: '/library/books',
          icon: BookOpenIcon,
          category: 'Library'
        },
        {
          id: '5',
          type: 'exam',
          title: 'Mid-Term Mathematics',
          description: 'Scheduled for next week',
          url: '/exams',
          icon: CalendarIcon,
          category: 'Exams'
        },
        {
          id: '6',
          type: 'fee',
          title: 'Tuition Fee',
          description: 'Monthly tuition payment',
          url: '/finance/fees',
          icon: CurrencyDollarIcon,
          category: 'Finance'
        }
      ].filter(result => 
        result.title.toLowerCase().includes(q.toLowerCase()) ||
        result.description.toLowerCase().includes(q.toLowerCase()) ||
        result.category.toLowerCase().includes(q.toLowerCase())
      );

      setResults(mockResults);
      setLoading(false);
    }, 500);
  }, [q]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Students': 'bg-blue-100 text-blue-800',
      'Teachers': 'bg-green-100 text-green-800',
      'Classes': 'bg-purple-100 text-purple-800',
      'Library': 'bg-orange-100 text-orange-800',
      'Exams': 'bg-red-100 text-red-800',
      'Finance': 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title={t('nav.search')} 
          subtitle={q ? `${t('common.search')} "${q}" - ${results.length} ${t('common.results')}` : t('placeholder.search')} 
        />
      </Card>

      {loading && (
        <Card>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">{t('common.loading')}...</span>
          </div>
        </Card>
      )}

      {!loading && q && results.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('messages.search_no_results')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('messages.try_different_keywords')}</p>
          </div>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <Link to={result.url} className="block">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <result.icon className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {result.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(result.category)}`}>
                        {result.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {result.description}
                    </p>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {!q && (
        <Card>
          <div className="text-center py-8">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('search.enter_query')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('search.search_across_modules')}</p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link to="/students" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
                <span className="mt-2 text-sm font-medium text-gray-900">{t('nav.students')}</span>
              </Link>
              <Link to="/teachers" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <AcademicCapIcon className="w-8 h-8 text-green-600" />
                <span className="mt-2 text-sm font-medium text-gray-900">{t('nav.teachers')}</span>
              </Link>
              <Link to="/academics/classes" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <BuildingLibraryIcon className="w-8 h-8 text-purple-600" />
                <span className="mt-2 text-sm font-medium text-gray-900">{t('nav.classes')}</span>
              </Link>
              <Link to="/library/books" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <BookOpenIcon className="w-8 h-8 text-orange-600" />
                <span className="mt-2 text-sm font-medium text-gray-900">{t('nav.library')}</span>
              </Link>
              <Link to="/exams" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <CalendarIcon className="w-8 h-8 text-red-600" />
                <span className="mt-2 text-sm font-medium text-gray-900">{t('nav.exams')}</span>
              </Link>
              <Link to="/finance" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <CurrencyDollarIcon className="w-8 h-8 text-emerald-600" />
                <span className="mt-2 text-sm font-medium text-gray-900">{t('nav.finance')}</span>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Search;


