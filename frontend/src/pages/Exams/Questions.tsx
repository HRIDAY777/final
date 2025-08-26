import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  question_type_display: string;
  marks: number;
  difficulty_level: string;
  subject: {
    id: string;
    name: string;
  };
  topic: string;
  is_active: boolean;
  created_by: {
    id: string;
    name: string;
  };
  created_at: string;
  usage_count: number;
  answers: Answer[];
}

interface Answer {
  id: string;
  answer_text: string;
  is_correct: boolean;
  explanation?: string;
}

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    question_type: '',
    difficulty_level: '',
    subject: '',
    is_active: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockQuestions: Question[] = [
      {
        id: '1',
        question_text: 'What is the derivative of x²?',
        question_type: 'multiple_choice',
        question_type_display: 'Multiple Choice',
        marks: 2,
        difficulty_level: 'medium',
        subject: { id: '1', name: 'Mathematics' },
        topic: 'Calculus',
        is_active: true,
        created_by: { id: '1', name: 'Dr. Sarah Johnson' },
        created_at: '2024-01-15T10:00:00Z',
        usage_count: 15,
        answers: [
          { id: '1', answer_text: '2x', is_correct: true, explanation: 'The derivative of x² is 2x using the power rule.' },
          { id: '2', answer_text: 'x', is_correct: false },
          { id: '3', answer_text: '2x²', is_correct: false },
          { id: '4', answer_text: 'x²', is_correct: false }
        ]
      },
      {
        id: '2',
        question_text: 'Explain the process of photosynthesis in plants.',
        question_type: 'essay',
        question_type_display: 'Essay',
        marks: 10,
        difficulty_level: 'hard',
        subject: { id: '2', name: 'Science' },
        topic: 'Biology',
        is_active: true,
        created_by: { id: '2', name: 'Prof. Michael Brown' },
        created_at: '2024-01-20T14:30:00Z',
        usage_count: 8,
        answers: []
      },
      {
        id: '3',
        question_text: 'Which of the following is a prime number?',
        question_type: 'multiple_choice',
        question_type_display: 'Multiple Choice',
        marks: 1,
        difficulty_level: 'easy',
        subject: { id: '1', name: 'Mathematics' },
        topic: 'Number Theory',
        is_active: true,
        created_by: { id: '1', name: 'Dr. Sarah Johnson' },
        created_at: '2024-01-25T09:15:00Z',
        usage_count: 25,
        answers: [
          { id: '5', answer_text: '4', is_correct: false },
          { id: '6', answer_text: '7', is_correct: true, explanation: '7 is a prime number as it has no divisors other than 1 and itself.' },
          { id: '7', answer_text: '9', is_correct: false },
          { id: '8', answer_text: '12', is_correct: false }
        ]
      },
      {
        id: '4',
        question_text: 'True or False: The Earth revolves around the Sun.',
        question_type: 'true_false',
        question_type_display: 'True/False',
        marks: 1,
        difficulty_level: 'easy',
        subject: { id: '2', name: 'Science' },
        topic: 'Astronomy',
        is_active: true,
        created_by: { id: '2', name: 'Prof. Michael Brown' },
        created_at: '2024-02-01T11:45:00Z',
        usage_count: 30,
        answers: [
          { id: '9', answer_text: 'True', is_correct: true, explanation: 'The Earth orbits around the Sun in an elliptical path.' },
          { id: '10', answer_text: 'False', is_correct: false }
        ]
      },
      {
        id: '5',
        question_text: 'Match the following authors with their famous works.',
        question_type: 'matching',
        question_type_display: 'Matching',
        marks: 5,
        difficulty_level: 'medium',
        subject: { id: '3', name: 'English' },
        topic: 'Literature',
        is_active: false,
        created_by: { id: '3', name: 'Ms. Emily Davis' },
        created_at: '2024-02-05T16:20:00Z',
        usage_count: 5,
        answers: []
      }
    ];

    setTimeout(() => {
      setQuestions(mockQuestions);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  }, []);

  const getQuestionTypeBadge = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Multiple Choice</span>;
      case 'essay':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Essay</span>;
      case 'true_false':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">True/False</span>;
      case 'matching':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Matching</span>;
      case 'fill_blank':
        return <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">Fill in Blank</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
  };

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case 'easy':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Easy</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Medium</span>;
      case 'hard':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Hard</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{level}</span>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span> :
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Inactive</span>;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDelete = (question: Question) => {
    setSelectedQuestion(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedQuestion) {
      setQuestions(questions.filter(q => q.id !== selectedQuestion.id));
      setShowDeleteModal(false);
      setSelectedQuestion(null);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(search.toLowerCase()) ||
                         question.topic.toLowerCase().includes(search.toLowerCase()) ||
                         question.subject.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !filters.question_type || question.question_type === filters.question_type;
    const matchesDifficulty = !filters.difficulty_level || question.difficulty_level === filters.difficulty_level;
    const matchesSubject = !filters.subject || question.subject.id === filters.subject;
    const matchesActive = filters.is_active === '' || 
                         (filters.is_active === 'true' ? question.is_active : !question.is_active);
    
    return matchesSearch && matchesType && matchesDifficulty && matchesSubject && matchesActive;
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
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600">Build and organize exam questions</p>
        </div>
        <Link to="/exams/questions/create">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        right={
          <div className="flex gap-2">
            <select
              value={filters.question_type}
              onChange={(e) => setFilters({...filters, question_type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="essay">Essay</option>
              <option value="true_false">True/False</option>
              <option value="matching">Matching</option>
              <option value="fill_blank">Fill in Blank</option>
            </select>
            <select
              value={filters.difficulty_level}
              onChange={(e) => setFilters({...filters, difficulty_level: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Subjects</option>
              <option value="1">Mathematics</option>
              <option value="2">Science</option>
              <option value="3">English</option>
              <option value="4">Computer Science</option>
              <option value="5">History</option>
            </select>
          </div>
        }
      />

      {/* Questions List */}
      <Card>
        <CardHeader title={`Questions (${filteredQuestions.length})`} />
        <div className="p-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Link to="/exams/questions/create">
                <Button>Add Your First Question</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <DocumentTextIcon className="w-8 h-8 text-blue-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {truncateText(question.question_text, 80)}
                          </h3>
                          {getQuestionTypeBadge(question.question_type)}
                          {getDifficultyBadge(question.difficulty_level)}
                          {getStatusBadge(question.is_active)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{question.subject.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TagIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{question.topic}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              {question.marks} mark{question.marks !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              Used {question.usage_count} time{question.usage_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Answer Preview for Multiple Choice */}
                        {question.question_type === 'multiple_choice' && question.answers.length > 0 && (
                          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Answer Options:</p>
                            <div className="space-y-1">
                              {question.answers.slice(0, 3).map((answer, index) => (
                                <div key={answer.id} className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">{String.fromCharCode(65 + index)}.</span>
                                  <span className="text-sm text-gray-600">
                                    {truncateText(answer.answer_text, 60)}
                                  </span>
                                  {answer.is_correct && (
                                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              ))}
                              {question.answers.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{question.answers.length - 3} more options
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Created by {question.created_by.name} • {new Date(question.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/exams/questions/${question.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/exams/questions/${question.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(question)}
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
          total={questions.length}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Question</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
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

export default Questions;


