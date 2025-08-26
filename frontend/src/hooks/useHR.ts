import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface HRStats {
  total_employees: number;
  active_employees: number;
  departments_count: number;
  positions_count: number;
  pending_leaves: number;
  this_month_payroll: number;
  attendance_rate: number;
  recent_activities: Array<{
    type: string;
    message: string;
    date: string;
  }>;
}

interface Employee {
  id: string;
  employee_id: string;
  employee_number: string;
  full_name: string;
  email: string;
  phone: string;
  department_name: string;
  position_title: string;
  employment_type: string;
  status: string;
  joining_date: string;
  is_active: boolean;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  employee_count: number;
  is_active: boolean;
  created_at: string;
}

interface Position {
  id: string;
  title: string;
  code: string;
  department_name: string;
  description: string;
  base_salary: number;
  employee_count: number;
  is_active: boolean;
  created_at: string;
}

interface Payroll {
  id: string;
  employee_name: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  gross_salary: number;
  net_salary: number;
  payment_status: string;
  payment_date?: string;
  created_at: string;
}

interface Leave {
  id: string;
  employee_name: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
  approved_by_name?: string;
  created_at: string;
}

interface Attendance {
  id: string;
  employee_name: string;
  employee_id: string;
  date: string;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
  working_hours?: number;
  created_at: string;
}

interface Performance {
  id: string;
  employee_name: string;
  employee_id: string;
  evaluation_period: string;
  evaluation_date: string;
  overall_rating: number;
  evaluated_by_name: string;
  created_at: string;
}

interface Document {
  id: string;
  employee_name: string;
  employee_id: string;
  document_type: string;
  title: string;
  file: string;
  is_verified: boolean;
  verified_by_name?: string;
  created_at: string;
}

export const useHR = () => {
  const [stats, setStats] = useState<HRStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, return mock data since the backend might not have these endpoints yet
      const mockStats: HRStats = {
        total_employees: 156,
        active_employees: 142,
        departments_count: 8,
        positions_count: 24,
        pending_leaves: 12,
        this_month_payroll: 4500000,
        attendance_rate: 94.5,
        recent_activities: [
          {
            type: 'new_employee',
            message: 'John Doe joined as Senior Teacher',
            date: '2024-01-22'
          },
          {
            type: 'leave_request',
            message: 'Jane Smith requested annual leave',
            date: '2024-01-21'
          },
          {
            type: 'payroll_paid',
            message: 'Payroll paid to 142 employees',
            date: '2024-01-20'
          }
        ]
      };
      
      setStats(mockStats);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get('/api/hr/dashboard/stats/');
      // setStats(response.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch HR stats');
      console.error('Error fetching HR stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: getStats,
  };
};

// Employee management hooks
export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEmployees = async (): Promise<Employee[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data
      const mockEmployees: Employee[] = [
        {
          id: '1',
          employee_id: 'EMP001',
          employee_number: 'EN001',
          full_name: 'John Doe',
          email: 'john.doe@school.com',
          phone: '+880 1712345678',
          department_name: 'Academics',
          position_title: 'Senior Teacher',
          employment_type: 'full_time',
          status: 'active',
          joining_date: '2023-01-15',
          is_active: true,
          created_at: '2023-01-15T10:30:00Z'
        },
        {
          id: '2',
          employee_id: 'EMP002',
          employee_number: 'EN002',
          full_name: 'Jane Smith',
          email: 'jane.smith@school.com',
          phone: '+880 1812345678',
          department_name: 'Administration',
          position_title: 'Administrative Officer',
          employment_type: 'full_time',
          status: 'active',
          joining_date: '2023-02-01',
          is_active: true,
          created_at: '2023-02-01T09:15:00Z'
        }
      ];
      
      setEmployees(mockEmployees);
      return mockEmployees;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (data: any): Promise<Employee> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock response
      const mockEmployee: Employee = {
        id: Date.now().toString(),
        employee_id: data.employee_id,
        employee_number: data.employee_number,
        full_name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone,
        department_name: 'New Department',
        position_title: 'New Position',
        employment_type: data.employment_type,
        status: 'active',
        joining_date: data.joining_date,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      return mockEmployee;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
      console.error('Error creating employee:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    getEmployees,
    createEmployee,
    loading,
    error,
  };
};

// Department management hooks
export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDepartments = async (): Promise<Department[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data
      const mockDepartments: Department[] = [
        {
          id: '1',
          name: 'Academics',
          code: 'ACAD',
          description: 'Academic department for teachers and curriculum',
          employee_count: 45,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Administration',
          code: 'ADMIN',
          description: 'Administrative and management staff',
          employee_count: 12,
          is_active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      setDepartments(mockDepartments);
      return mockDepartments;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
      console.error('Error fetching departments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    departments,
    getDepartments,
    loading,
    error,
  };
};

// Payroll management hooks
export const usePayroll = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPayrolls = async (): Promise<Payroll[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data
      const mockPayrolls: Payroll[] = [
        {
          id: '1',
          employee_name: 'John Doe',
          employee_id: 'EMP001',
          month: 1,
          year: 2024,
          basic_salary: 50000,
          gross_salary: 65000,
          net_salary: 58000,
          payment_status: 'paid',
          payment_date: '2024-01-25',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];
      
      setPayrolls(mockPayrolls);
      return mockPayrolls;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payrolls');
      console.error('Error fetching payrolls:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    payrolls,
    getPayrolls,
    loading,
    error,
  };
};

// Leave management hooks
export const useLeaves = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLeaves = async (): Promise<Leave[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data
      const mockLeaves: Leave[] = [
        {
          id: '1',
          employee_name: 'Jane Smith',
          employee_id: 'EMP002',
          leave_type: 'annual',
          start_date: '2024-02-01',
          end_date: '2024-02-05',
          total_days: 5,
          reason: 'Annual vacation',
          status: 'pending',
          created_at: '2024-01-20T10:30:00Z'
        }
      ];
      
      setLeaves(mockLeaves);
      return mockLeaves;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaves');
      console.error('Error fetching leaves:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    leaves,
    getLeaves,
    loading,
    error,
  };
};
