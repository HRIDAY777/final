import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface ExamResult {
  id: string;
  student: {
    id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    student_id: string;
  };
  exam: {
    id: string;
    title: string;
    exam_type: string;
    total_marks: number;
    passing_marks: number;
    subject: {
      name: string;
    };
  };
  marks_obtained: number;
  percentage: number;
  grade: string;
  is_passed: boolean;
  attempt_number: number;
  time_taken_minutes: number;
  submitted_at: string;
  published_at: string;
  is_published: boolean;
  remarks?: string;
  created_by: {
    id: string;
    name: string;
  };
}

const Results: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    exam_type: '',
    is_passed: '',
    is_published: '',
    grade: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockResults: ExamResult[] = [
      {
        id: '1',
        student: {
          id: '1',
          user: {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
          },
          student_id: 'STU001'
        },
        exam: {
          id: '1',
          title: 'Mathematics Midterm Exam',
          exam_type: 'midterm',
          total_marks: 100,
          passing_marks: 40,
          subject: { name: 'Mathematics' }
        },
        marks_obtained: 85,
        percentage: 85,
        grade: 'A',
        is_passed: true,
        attempt_number: 1,
        time_taken_minutes: 95,
        submitted_at: '2024-12-15T11:30:00Z',
        published_at: '2024-12-16T10:00:00Z',
        is_published: true,
        remarks: 'Excellent performance. Strong understanding of calculus concepts.',
        created_by: { id: '1', name: 'Dr. Sarah Johnson' }
      },
      {
        id: '2',
        student: {
          id: '2',
          user: {
            id: '2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com'
          },
          student_id: 'STU002'
        },
        exam: {
          id: '2',
          title: 'Science Quiz - Chapter 5',
          exam_type: 'quiz',
          total_marks: 50,
          passing_marks: 25,
          subject: { name: 'Science' }
        },
        marks_obtained: 42,
        percentage: 84,
        grade: 'A',
        is_passed: true,
        attempt_number: 1,
        time_taken_minutes: 40,
        submitted_at: '2024-12-10T14:30:00Z',
        published_at: '2024-12-11T09:00:00Z',
        is_published: true,
        remarks: 'Good work on chemical reactions.',
        created_by: { id: '2', name: 'Prof. Michael Brown' }
      },
      {
        id: '3',
        student: {
          id: '3',
          user: {
            id: '3',
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@example.com'
          },
          student_id: 'STU003'
        },
        exam: {
          id: '1',
          title: 'Mathematics Midterm Exam',
          exam_type: 'midterm',
          total_marks: 100,
          passing_marks: 40,
          subject: { name: 'Mathematics' }
        },
        marks_obtained: 35,
        percentage: 35,
        grade: 'F',
        is_passed: false,
        attempt_number: 1,
        time_taken_minutes: 120,
        submitted_at: '2024-12-15T11:45:00Z',
        published_at: '2024-12-16T10:00:00Z',
        is_published: true,
        remarks: 'Needs improvement in calculus fundamentals.',
        created_by: { id: '1', name: 'Dr. Sarah Johnson' }
      },
      {
        id: '4',
        student: {
          id: '4',
          user: {
            id: '4',
            first_name: 'Sarah',
            last_name: 'Wilson',
            email: 'sarah.wilson@example.com'
          },
          student_id: 'STU004'
        },
        exam: {
          id: '3',
          title: 'English Literature Final',
          exam_type: 'final',
          total_marks: 150,
          passing_marks: 60,
          subject: { name: 'English' }
        },
        marks_obtained: 120,
        percentage: 80,
        grade: 'A',
        is_passed: true,
        attempt_number: 1,
        time_taken_minutes: 165,
        submitted_at: '2024-12-20T12:45:00Z',
        published_at: '2024-12-21T14:00:00Z',
        is_published: true,
        remarks: 'Outstanding analysis of literary themes.',
        created_by: { id: '3', name: 'Ms. Emily Davis' }
      },
      {
        id: '5',
        student: {
          id: '5',
          user: {
            id: '5',
            first_name: 'David',
            last_name: 'Brown',
            email: 'david.brown@example.com'
          },
          student_id: 'STU005'
        },
        exam: {
          id: '4',
          title: 'Computer Science Project',
          exam_type: 'project',
          total_marks: 100,
          passing_marks: 50,
          subject: { name: 'Computer Science' }
        },
        marks_obtained: 0,
        percentage: 0,
        grade: 'F',
        is_passed: false,
        attempt_number: 0,
        time_taken_minutes: 0,
        submitted_at: '',
        published_at: '',
        is_published: false,
        created_by: { id: '4', name: 'Dr. Robert Wilson' }
      }
    ];

    setTimeout(() => {
      setResults(mockResults);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  }, []);

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">A</span>;
      case 'B':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">B</span>;
      case 'C':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">C</span>;
      case 'D':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">D</span>;
      case 'F':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">F</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{grade}</span>;
    }
  };

  const getPassFailBadge = (isPassed: boolean) => {
    return isPassed ? 
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Passed</span> :
      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Failed</span>;
  };

  const getPublishedBadge = (isPublished: boolean) => {
    return isPublished ? 
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Published</span> :
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Draft</span>;
  };

  const getExamTypeBadge = (type: string) => {
    switch (type) {
      case 'midterm':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Midterm</span>;
      case 'final':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Final</span>;
      case 'quiz':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Quiz</span>;
      case 'project':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Project</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleDelete = (result: ExamResult) => {
    setSelectedResult(result);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedResult) {
      setResults(results.filter(r => r.id !== selectedResult.id));
      setShowDeleteModal(false);
      setSelectedResult(null);
    }
  };

  const filteredResults = results.filter(result => {
    const studentName = `${result.student.user.first_name} ${result.student.user.last_name}`.toLowerCase();
    const examTitle = result.exam.title.toLowerCase();
    const subjectName = result.exam.subject.name.toLowerCase();
    
    const matchesSearch = studentName.includes(search.toLowerCase()) ||
                         examTitle.includes(search.toLowerCase()) ||
                         subjectName.includes(search.toLowerCase()) ||
                         result.student.student_id.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !filters.exam_type || result.exam.exam_type === filters.exam_type;
    const matchesPassed = filters.is_passed === '' || 
                         (filters.is_passed === 'true' ? result.is_passed : !result.is_passed);
    const matchesPublished = filters.is_published === '' || 
                           (filters.is_published === 'true' ? result.is_published : !result.is_published);
    const matchesGrade = !filters.grade || result.grade === filters.grade;
    
    return matchesSearch && matchesType && matchesPassed && matchesPublished && matchesGrade;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600">Publish and analyze exam results</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/exams/results/analytics">
            <Button variant="outline">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link to="/exams/results/bulk-publish">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Bulk Publish
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        right={
          <div className="flex gap-2">
            <select
              value={filters.exam_type}
              onChange={(e) => setFilters({...filters, exam_type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Types</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
              <option value="quiz">Quiz</option>
              <option value="project">Project</option>
            </select>
            <select
              value={filters.is_passed}
              onChange={(e) => setFilters({...filters, is_passed: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Results</option>
              <option value="true">Passed</option>
              <option value="false">Failed</option>
            </select>
            <select
              value={filters.grade}
              onChange={(e) => setFilters({...filters, grade: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Grades</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>
          </div>
        }
      />

      {/* Results List */}
      <Card>
        <CardHeader title={`Results (${filteredResults.length})`} />
        <div className="p-6">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <DocumentTextIcon className="w-8 h-8 text-blue-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.student.user.first_name} {result.student.user.last_name}
                          </h3>
                          <span className="text-sm text-gray-500">({result.student.student_id})</span>
                          {getGradeBadge(result.grade)}
                          {getPassFailBadge(result.is_passed)}
                          {getPublishedBadge(result.is_published)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{result.exam.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              {result.marks_obtained}/{result.exam.total_marks} marks
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${getPercentageColor(result.percentage)}`}>
                              {result.percentage}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {result.time_taken_minutes} min
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              Subject: {result.exam.subject.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getExamTypeBadge(result.exam.exam_type)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              Attempt: {result.attempt_number}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              Submitted: {result.submitted_at ? new Date(result.submitted_at).toLocaleDateString() : 'Not submitted'}
                            </span>
                          </div>
                        </div>

                        {result.remarks && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Remarks:</strong> {result.remarks}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          {result.is_published ? 
                            `Published by ${result.created_by.name} • ${new Date(result.published_at).toLocaleDateString()}` :
                            `Created by ${result.created_by.name} • Not published yet`
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/exams/results/${result.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/exams/results/${result.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      {!result.is_published && (
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                          <TrophyIcon className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(result)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          pageSize={10}
          total={results.length}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Result</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the result for &quot;{selectedResult.student.user.first_name} {selectedResult.student.user.last_name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;


