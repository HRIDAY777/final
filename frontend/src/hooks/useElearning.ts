import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

// E-learning Data Interfaces
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  thumbnail?: string;
  video_intro?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  price: number;
  is_free: boolean;
  discount_price?: number;
  total_lessons: number;
  total_duration: number;
  total_quizzes: number;
  is_published: boolean;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  instructor: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  learning_objectives: string[];
  requirements: string[];
  target_audience: string;
  curriculum: any[];
  enrolled_students: number;
  average_rating: number;
  total_reviews: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

interface Lesson {
  id: string;
  course: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  video_duration: number;
  attachments: string[];
  order: number;
  is_free: boolean;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'discussion';
  completion_criteria: 'watch' | 'read' | 'quiz' | 'assignment';
  created_at: string;
  updated_at: string;
}

interface Enrollment {
  id: string;
  student: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  course: Course;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  time_spent: number;
  last_accessed?: string;
  started_at: string;
  completed_at?: string;
  amount_paid: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
}

interface LessonProgress {
  id: string;
  enrollment: string;
  lesson: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  video_watched: number;
  video_completed: boolean;
  quiz_score?: number;
  quiz_attempts: number;
  quiz_passed: boolean;
  assignment_submitted: boolean;
  assignment_score?: number;
  started_at?: string;
  completed_at?: string;
  last_accessed: string;
}

interface Quiz {
  id: string;
  lesson: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit: number;
  max_attempts: number;
  shuffle_questions: boolean;
  questions: any[];
  total_attempts: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

interface QuizAttempt {
  id: string;
  enrollment: string;
  quiz: string;
  attempt_number: number;
  score?: number;
  passed: boolean;
  answers: Record<string, any>;
  correct_answers: number;
  total_questions: number;
  started_at: string;
  completed_at?: string;
  time_taken: number;
}

interface CourseReview {
  id: string;
  student: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  course: string;
  rating: number;
  title?: string;
  comment: string;
  is_approved: boolean;
  is_helpful: number;
  created_at: string;
  updated_at: string;
}

interface Certificate {
  id: string;
  student: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  course: string;
  certificate_number: string;
  issued_date: string;
  completion_date: string;
  certificate_file?: string;
  is_verified: boolean;
  verification_code: string;
}

interface Discussion {
  id: string;
  course: string;
  author: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  parent?: string;
  title?: string;
  content: string;
  is_pinned: boolean;
  is_resolved: boolean;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

interface LearningStats {
  total_courses: number;
  enrolled_courses: number;
  completed_courses: number;
  total_time_spent: number;
  average_score: number;
  certificates_earned: number;
  current_streak: number;
  weekly_goal: number;
  weekly_progress: number;
}

// E-learning Hooks
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCourses = async (params?: {
    category?: string;
    level?: string;
    search?: string;
    featured?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Advanced JavaScript Programming',
          slug: 'advanced-javascript-programming',
          description: 'Master advanced JavaScript concepts including ES6+, async programming, and modern frameworks.',
          short_description: 'Learn advanced JavaScript programming techniques',
          category: 'Programming',
          level: 'advanced',
          language: 'English',
          price: 99.99,
          is_free: false,
          total_lessons: 24,
          total_duration: 480,
          total_quizzes: 8,
          is_published: true,
          is_featured: true,
          status: 'published',
          instructor: {
            id: '1',
            username: 'sarah_johnson',
            email: 'sarah@example.com',
            first_name: 'Sarah',
            last_name: 'Johnson',
            full_name: 'Sarah Johnson'
          },
          learning_objectives: ['Master ES6+ features', 'Understand async programming', 'Build modern applications'],
          requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
          target_audience: 'Intermediate to advanced developers',
          curriculum: [],
          enrolled_students: 1250,
          average_rating: 4.8,
          total_reviews: 89,
          completion_rate: 78.5,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          published_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Data Science Fundamentals',
          slug: 'data-science-fundamentals',
          description: 'Introduction to data science concepts, tools, and methodologies for beginners.',
          short_description: 'Learn the basics of data science',
          category: 'Data Science',
          level: 'beginner',
          language: 'English',
          price: 0,
          is_free: true,
          total_lessons: 18,
          total_duration: 360,
          total_quizzes: 6,
          is_published: true,
          is_featured: false,
          status: 'published',
          instructor: {
            id: '2',
            username: 'michael_chen',
            email: 'michael@example.com',
            first_name: 'Michael',
            last_name: 'Chen',
            full_name: 'Michael Chen'
          },
          learning_objectives: ['Understand data science basics', 'Learn Python for data analysis', 'Master statistical concepts'],
          requirements: ['Basic math knowledge', 'No programming experience required'],
          target_audience: 'Beginners interested in data science',
          curriculum: [],
          enrolled_students: 2100,
          average_rating: 4.6,
          total_reviews: 156,
          completion_rate: 65.2,
          created_at: '2024-01-05T00:00:00Z',
          updated_at: '2024-01-18T00:00:00Z',
          published_at: '2024-01-05T00:00:00Z'
        }
      ];
      
      setCourses(mockCourses);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/elearning/courses/', { params });
      // setCourses(response.data.results);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: getCourses,
  };
};

export const useCourseDetails = (courseId: string) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockCourse: Course = {
        id: courseId,
        title: 'Advanced JavaScript Programming',
        slug: 'advanced-javascript-programming',
        description: 'Master advanced JavaScript concepts including ES6+, async programming, and modern frameworks.',
        short_description: 'Learn advanced JavaScript programming techniques',
        category: 'Programming',
        level: 'advanced',
        language: 'English',
        price: 99.99,
        is_free: false,
        total_lessons: 24,
        total_duration: 480,
        total_quizzes: 8,
        is_published: true,
        is_featured: true,
        status: 'published',
        instructor: {
          id: '1',
          username: 'sarah_johnson',
          email: 'sarah@example.com',
          first_name: 'Sarah',
          last_name: 'Johnson',
          full_name: 'Sarah Johnson'
        },
        learning_objectives: ['Master ES6+ features', 'Understand async programming', 'Build modern applications'],
        requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
        target_audience: 'Intermediate to advanced developers',
        curriculum: [],
        enrolled_students: 1250,
        average_rating: 4.8,
        total_reviews: 89,
        completion_rate: 78.5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        published_at: '2024-01-01T00:00:00Z'
      };
      
      const mockLessons: Lesson[] = [
        {
          id: '1',
          course: courseId,
          title: 'Introduction to ES6+',
          description: 'Learn about modern JavaScript features',
          content: 'ES6+ introduces many new features to JavaScript...',
          video_url: 'https://example.com/video1.mp4',
          video_duration: 1800,
          attachments: [],
          order: 1,
          is_free: true,
          lesson_type: 'video',
          completion_criteria: 'watch',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          course: courseId,
          title: 'Async/Await Patterns',
          description: 'Master asynchronous programming',
          content: 'Async/await is a modern way to handle asynchronous operations...',
          video_url: 'https://example.com/video2.mp4',
          video_duration: 2400,
          attachments: [],
          order: 2,
          is_free: false,
          lesson_type: 'video',
          completion_criteria: 'watch',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];
      
      setCourse(mockCourse);
      setLessons(mockLessons);
      
      // TODO: Replace with actual API call
      // const [courseResponse, lessonsResponse] = await Promise.all([
      //   apiClient.get(`/api/elearning/courses/${courseId}/`),
      //   apiClient.get(`/api/elearning/courses/${courseId}/lessons/`)
      // ]);
      // setCourse(courseResponse.data);
      // setLessons(lessonsResponse.data.results);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course details');
      console.error('Error fetching course details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      getCourseDetails();
    }
  }, [courseId]);

  return {
    course,
    lessons,
    loading,
    error,
    refetch: getCourseDetails,
  };
};

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockEnrollments: Enrollment[] = [
        {
          id: '1',
          student: {
            id: '1',
            username: 'john_doe',
            email: 'john@example.com',
            first_name: 'John',
            last_name: 'Doe',
            full_name: 'John Doe'
          },
          course: {
            id: '1',
            title: 'Advanced JavaScript Programming',
            slug: 'advanced-javascript-programming',
            description: 'Master advanced JavaScript concepts',
            short_description: 'Learn advanced JavaScript',
            category: 'Programming',
            level: 'advanced',
            language: 'English',
            price: 99.99,
            is_free: false,
            total_lessons: 24,
            total_duration: 480,
            total_quizzes: 8,
            is_published: true,
            is_featured: true,
            status: 'published',
            instructor: {
              id: '1',
              username: 'sarah_johnson',
              email: 'sarah@example.com',
              first_name: 'Sarah',
              last_name: 'Johnson',
              full_name: 'Sarah Johnson'
            },
            learning_objectives: [],
            requirements: [],
            target_audience: '',
            curriculum: [],
            enrolled_students: 1250,
            average_rating: 4.8,
            total_reviews: 89,
            completion_rate: 78.5,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          },
          status: 'active',
          progress: 75.0,
          completed_lessons: 18,
          total_lessons: 24,
          time_spent: 360,
          last_accessed: '2024-01-22T10:30:00Z',
          started_at: '2024-01-10T00:00:00Z',
          amount_paid: 99.99,
          payment_status: 'paid'
        }
      ];
      
      setEnrollments(mockEnrollments);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/elearning/enrollments/');
      // setEnrollments(response.data.results);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock enrollment - replace with actual API call
      // const response = await apiClient.post('/api/elearning/enrollments/', {
      //   course: courseId
      // });
      
      // Refresh enrollments
      await getEnrollments();
      
      return { success: true };
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in course');
      console.error('Error enrolling in course:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEnrollments();
  }, []);

  return {
    enrollments,
    loading,
    error,
    refetch: getEnrollments,
    enrollInCourse,
  };
};

export const useLearningStats = () => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLearningStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockStats: LearningStats = {
        total_courses: 45,
        enrolled_courses: 8,
        completed_courses: 3,
        total_time_spent: 1240,
        average_score: 87.5,
        certificates_earned: 3,
        current_streak: 7,
        weekly_goal: 5,
        weekly_progress: 3
      };
      
      setStats(mockStats);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/elearning/dashboard/overview/');
      // setStats(response.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch learning stats');
      console.error('Error fetching learning stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLearningStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: getLearningStats,
  };
};

export const useLessonProgress = (enrollmentId: string) => {
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLessonProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockProgress: LessonProgress[] = [
        {
          id: '1',
          enrollment: enrollmentId,
          lesson: '1',
          status: 'completed',
          video_watched: 1800,
          video_completed: true,
          quiz_attempts: 1,
          quiz_passed: true,
          assignment_submitted: false,
          started_at: '2024-01-10T00:00:00Z',
          completed_at: '2024-01-10T01:30:00Z',
          last_accessed: '2024-01-10T01:30:00Z'
        },
        {
          id: '2',
          enrollment: enrollmentId,
          lesson: '2',
          status: 'in_progress',
          video_watched: 1200,
          video_completed: false,
          quiz_attempts: 0,
          quiz_passed: false,
          assignment_submitted: false,
          started_at: '2024-01-15T00:00:00Z',
          last_accessed: '2024-01-22T10:30:00Z'
        }
      ];
      
      setProgress(mockProgress);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/api/elearning/enrollments/${enrollmentId}/progress/`);
      // setProgress(response.data.results);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lesson progress');
      console.error('Error fetching lesson progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLessonProgress = async (lessonId: string, data: Partial<LessonProgress>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock update - replace with actual API call
      // const response = await apiClient.patch(`/api/elearning/progress/${lessonId}/`, data);
      
      // Refresh progress
      await getLessonProgress();
      
      return { success: true };
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lesson progress');
      console.error('Error updating lesson progress:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enrollmentId) {
      getLessonProgress();
    }
  }, [enrollmentId]);

  return {
    progress,
    loading,
    error,
    refetch: getLessonProgress,
    updateLessonProgress,
  };
};
