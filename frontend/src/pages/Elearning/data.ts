export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  lessons: number;
  students: number;
  progress?: number;
}

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'React Fundamentals',
    description: 'Components, state, props, and hooks to build modern UIs.',
    category: 'Web Development',
    level: 'Beginner',
    durationHours: 8,
    lessons: 32,
    students: 1240,
    progress: 45,
  },
  {
    id: 'c2',
    title: 'TypeScript Deep Dive',
    description: 'Types, generics, utility types, and patterns for scalable apps.',
    category: 'Programming Languages',
    level: 'Intermediate',
    durationHours: 10,
    lessons: 40,
    students: 980,
  },
  {
    id: 'c3',
    title: 'Data Structures & Algorithms',
    description: 'Master the fundamentals needed for technical interviews.',
    category: 'Computer Science',
    level: 'Advanced',
    durationHours: 14,
    lessons: 56,
    students: 2104,
  },
  {
    id: 'c4',
    title: 'UI/UX Design Basics',
    description: 'Design systems, color, typography, and accessibility.',
    category: 'Design',
    level: 'Beginner',
    durationHours: 6,
    lessons: 24,
    students: 740,
    progress: 12,
  },
  {
    id: 'c5',
    title: 'Node.js APIs with Express',
    description: 'REST design, authentication, testing, and deployment.',
    category: 'Backend',
    level: 'Intermediate',
    durationHours: 9,
    lessons: 36,
    students: 1290,
  },
  {
    id: 'c6',
    title: 'Python for Data Analysis',
    description: 'NumPy, Pandas, visualization, and exploratory analysis.',
    category: 'Data',
    level: 'Beginner',
    durationHours: 11,
    lessons: 44,
    students: 1750,
  },
];


