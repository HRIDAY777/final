import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Landing from './pages/Landing/Landing';
import BanglaDemo from './components/UI/BanglaDemo';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Students Pages
import Students from './pages/Students/Students';
import StudentsList from './pages/Students/List';
import StudentsCreate from './pages/Students/Create';
import StudentsDetail from './pages/Students/Detail';
import StudentsIndex from './pages/Students/index';

// Teachers Pages
import Teachers from './pages/Teachers/Teachers';
import TeachersList from './pages/Teachers/List';
import TeachersCreate from './pages/Teachers/Create';
import TeachersDetail from './pages/Teachers/Detail';
import TeachersIndex from './pages/Teachers/index';

// Academics Pages
import AcademicsIndex from './pages/Academics/index';
import Classes from './pages/Academics/Classes';
import Assignments from './pages/Academics/Assignments';
import Courses from './pages/Academics/Courses';
import Grades from './pages/Academics/Grades';
import Lessons from './pages/Academics/Lessons';
import Subjects from './pages/Academics/Subjects';
import AcademicsTeachers from './pages/Academics/Teachers';
import AcademicsStudents from './pages/Academics/Students';

// Attendance Pages
import Attendance from './pages/Attendance/Attendance';
import AttendanceIndex from './pages/Attendance/index';
import AIAnalytics from './pages/Attendance/AIAnalytics';
import BiometricIntegration from './pages/Attendance/BiometricIntegration';
import AttendanceReports from './pages/Attendance/Reports';
import AttendanceSettings from './pages/Attendance/Settings';
import GuardianPortal from './pages/Attendance/GuardianPortal';
import Records from './pages/Attendance/Records';
import Sessions from './pages/Attendance/Sessions';
import LeaveRequests from './pages/Attendance/LeaveRequests';

// Finance Pages
import FinanceIndex from './pages/Finance/index';
import FinanceDashboard from './pages/Finance/Dashboard';
import Billing from './pages/Finance/Billing';
import Fees from './pages/Finance/Fees';
import Payments from './pages/Finance/Payments';
import Invoices from './pages/Finance/Invoices';
import Plans from './pages/Finance/Plans';
import FinanceReports from './pages/Finance/Reports';
import FinanceSettings from './pages/Finance/Settings';

// Library Pages
import LibraryIndex from './pages/Library/index';
import LibraryBooks from './pages/Library/Books';
import LibraryBorrowings from './pages/Library/Borrowings';
import LibraryFines from './pages/Library/Fines';
import LibraryAuthors from './pages/Library/Authors';
import LibraryCategories from './pages/Library/Categories';
import LibraryReservations from './pages/Library/Reservations';

// Exams Pages
import ExamsIndex from './pages/Exams/index';
import Exams from './pages/Exams/Exams';
import Questions from './pages/Exams/Questions';
import ExamResults from './pages/Exams/Results';
import ExamSchedules from './pages/Exams/Schedules';
import ExamSettings from './pages/Exams/Settings';
import Quizzes from './pages/Exams/Quizzes';

// Events Pages
import EventsIndex from './pages/Events/index';
import EventsCalendar from './pages/Events/Calendar';
import EventsAnalytics from './pages/Events/Analytics';
import EventsList from './pages/Events/List';

// Transport Pages
import TransportIndex from './pages/Transport/index';
import TransportRoutes from './pages/Transport/Routes';
import TransportVehicles from './pages/Transport/Vehicles';
import TransportDrivers from './pages/Transport/Drivers';

// Hostel Pages
import HostelIndex from './pages/Hostel/index';
import HostelRooms from './pages/Hostel/Rooms';
import HostelBuildings from './pages/Hostel/Buildings';
import HostelMaintenance from './pages/Hostel/Maintenance';
import HostelFees from './pages/Hostel/Fees';
import HostelAllocations from './pages/Hostel/Allocations';
import HostelVisitors from './pages/Hostel/Visitors';
import HostelRules from './pages/Hostel/Rules';

// HR Pages
import HRIndex from './pages/HR/index';

// Timetable Pages
import TimetableIndex from './pages/Timetable/index';
import TimetableSchedules from './pages/Timetable/Schedules';

// Inventory Pages
import InventoryIndex from './pages/Inventory/index';
import InventoryStock from './pages/Inventory/Stock';
import InventoryAssets from './pages/Inventory/Assets';
import InventoryTransactions from './pages/Inventory/Transactions';
import InventoryMaintenance from './pages/Inventory/Maintenance';

// Ecommerce Pages
import EcommerceIndex from './pages/Ecommerce/index';
import EcommerceProducts from './pages/Ecommerce/Products';
import EcommerceOrders from './pages/Ecommerce/Orders';
import EcommerceCustomers from './pages/Ecommerce/Customers';
import EcommerceCart from './pages/Ecommerce/Cart';
import EcommerceAnalytics from './pages/Ecommerce/Analytics';

// Elearning Pages
import ElearningIndex from './pages/Elearning/index';
import ElearningCourses from './pages/Elearning/Courses';
import ElearningCourseDetails from './pages/Elearning/CourseDetails';

// Analytics Pages
import AnalyticsIndex from './pages/Analytics/index';
import AnalyticsDashboard from './pages/Analytics/Dashboard';
import AnalyticsCharts from './pages/Analytics/Charts';
import AnalyticsReports from './pages/Analytics/Reports';

// Reports Pages
import ReportsIndex from './pages/Reports/index';

// Settings Pages
import SettingsIndex from './pages/Settings/index';
import SettingsProfile from './pages/Settings/Profile';
import SettingsPreferences from './pages/Settings/Preferences';
import SettingsAccount from './pages/Settings/Account';
import SettingsSecurity from './pages/Settings/Security';

// Other Pages
import NoticesIndex from './pages/Notices/index';
import { Guardians as GuardiansIndex } from './pages/Guardians/index';
import TenantsIndex from './pages/Tenants/index';
import SearchIndex from './pages/Search/Search';
import AIToolsModels from './pages/AITools/Models';
import APIDocumentation from './pages/API/index';
import AccountsIndex from './pages/Accounts/index';
import AssignmentsIndex from './pages/Assignments/index';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        
        {/* Students Routes */}
        <Route path="/students" element={<Layout><StudentsIndex /></Layout>} />
        <Route path="/students/list" element={<Layout><StudentsList /></Layout>} />
        <Route path="/students/create" element={<Layout><StudentsCreate /></Layout>} />
        <Route path="/students/detail/:id" element={<Layout><StudentsDetail /></Layout>} />
        <Route path="/students/students" element={<Layout><Students /></Layout>} />
        
        {/* Teachers Routes */}
        <Route path="/teachers" element={<Layout><TeachersIndex /></Layout>} />
        <Route path="/teachers/list" element={<Layout><TeachersList /></Layout>} />
        <Route path="/teachers/create" element={<Layout><TeachersCreate /></Layout>} />
        <Route path="/teachers/detail/:id" element={<Layout><TeachersDetail /></Layout>} />
        <Route path="/teachers/teachers" element={<Layout><Teachers /></Layout>} />
        
        {/* Academics Routes */}
        <Route path="/academics" element={<Layout><AcademicsIndex /></Layout>} />
        <Route path="/academics/classes" element={<Layout><Classes /></Layout>} />
        <Route path="/academics/assignments" element={<Layout><Assignments /></Layout>} />
        <Route path="/academics/courses" element={<Layout><Courses /></Layout>} />
        <Route path="/academics/grades" element={<Layout><Grades /></Layout>} />
        <Route path="/academics/lessons" element={<Layout><Lessons /></Layout>} />
        <Route path="/academics/subjects" element={<Layout><Subjects /></Layout>} />
        <Route path="/academics/teachers" element={<Layout><AcademicsTeachers /></Layout>} />
        <Route path="/academics/students" element={<Layout><AcademicsStudents /></Layout>} />
        
        {/* Attendance Routes */}
        <Route path="/attendance" element={<Layout><AttendanceIndex /></Layout>} />
        <Route path="/attendance/attendance" element={<Layout><Attendance /></Layout>} />
        <Route path="/attendance/ai-analytics" element={<Layout><AIAnalytics /></Layout>} />
        <Route path="/attendance/biometric" element={<Layout><BiometricIntegration /></Layout>} />
        <Route path="/attendance/reports" element={<Layout><AttendanceReports /></Layout>} />
        <Route path="/attendance/settings" element={<Layout><AttendanceSettings /></Layout>} />
        <Route path="/attendance/guardian-portal" element={<Layout><GuardianPortal /></Layout>} />
        <Route path="/attendance/records" element={<Layout><Records /></Layout>} />
        <Route path="/attendance/sessions" element={<Layout><Sessions /></Layout>} />
        <Route path="/attendance/leave-requests" element={<Layout><LeaveRequests /></Layout>} />
        
        {/* Finance Routes */}
        <Route path="/finance" element={<Layout><FinanceIndex /></Layout>} />
        <Route path="/finance/dashboard" element={<Layout><FinanceDashboard /></Layout>} />
        <Route path="/finance/billing" element={<Layout><Billing /></Layout>} />
        <Route path="/finance/fees" element={<Layout><Fees /></Layout>} />
        <Route path="/finance/payments" element={<Layout><Payments /></Layout>} />
        <Route path="/finance/invoices" element={<Layout><Invoices /></Layout>} />
        <Route path="/finance/plans" element={<Layout><Plans /></Layout>} />
        <Route path="/finance/reports" element={<Layout><FinanceReports /></Layout>} />
        <Route path="/finance/settings" element={<Layout><FinanceSettings /></Layout>} />
        
        {/* Library Routes */}
        <Route path="/library" element={<Layout><LibraryIndex /></Layout>} />
        <Route path="/library/books" element={<Layout><LibraryBooks /></Layout>} />
        <Route path="/library/borrowings" element={<Layout><LibraryBorrowings /></Layout>} />
        <Route path="/library/fines" element={<Layout><LibraryFines /></Layout>} />
        <Route path="/library/authors" element={<Layout><LibraryAuthors /></Layout>} />
        <Route path="/library/categories" element={<Layout><LibraryCategories /></Layout>} />
        <Route path="/library/reservations" element={<Layout><LibraryReservations /></Layout>} />
        
        {/* Exams Routes */}
        <Route path="/exams" element={<Layout><ExamsIndex /></Layout>} />
        <Route path="/exams/exams" element={<Layout><Exams /></Layout>} />
        <Route path="/exams/questions" element={<Layout><Questions /></Layout>} />
        <Route path="/exams/results" element={<Layout><ExamResults /></Layout>} />
        <Route path="/exams/schedules" element={<Layout><ExamSchedules /></Layout>} />
        <Route path="/exams/settings" element={<Layout><ExamSettings /></Layout>} />
        <Route path="/exams/quizzes" element={<Layout><Quizzes /></Layout>} />
        
        {/* Events Routes */}
        <Route path="/events" element={<Layout><EventsIndex /></Layout>} />
        <Route path="/events/calendar" element={<Layout><EventsCalendar /></Layout>} />
        <Route path="/events/analytics" element={<Layout><EventsAnalytics /></Layout>} />
        <Route path="/events/list" element={<Layout><EventsList /></Layout>} />
        
        {/* Transport Routes */}
        <Route path="/transport" element={<Layout><TransportIndex /></Layout>} />
        <Route path="/transport/routes" element={<Layout><TransportRoutes /></Layout>} />
        <Route path="/transport/vehicles" element={<Layout><TransportVehicles /></Layout>} />
        <Route path="/transport/drivers" element={<Layout><TransportDrivers /></Layout>} />
        
        {/* Hostel Routes */}
        <Route path="/hostel" element={<Layout><HostelIndex /></Layout>} />
        <Route path="/hostel/rooms" element={<Layout><HostelRooms /></Layout>} />
        <Route path="/hostel/buildings" element={<Layout><HostelBuildings /></Layout>} />
        <Route path="/hostel/maintenance" element={<Layout><HostelMaintenance /></Layout>} />
        <Route path="/hostel/fees" element={<Layout><HostelFees /></Layout>} />
        <Route path="/hostel/allocations" element={<Layout><HostelAllocations /></Layout>} />
        <Route path="/hostel/visitors" element={<Layout><HostelVisitors /></Layout>} />
        <Route path="/hostel/rules" element={<Layout><HostelRules /></Layout>} />
        
        {/* HR Routes */}
        <Route path="/hr" element={<Layout><HRIndex /></Layout>} />
        
        {/* Timetable Routes */}
        <Route path="/timetable" element={<Layout><TimetableIndex /></Layout>} />
        <Route path="/timetable/schedules" element={<Layout><TimetableSchedules /></Layout>} />
        
        {/* Inventory Routes */}
        <Route path="/inventory" element={<Layout><InventoryIndex /></Layout>} />
        <Route path="/inventory/stock" element={<Layout><InventoryStock /></Layout>} />
        <Route path="/inventory/assets" element={<Layout><InventoryAssets /></Layout>} />
        <Route path="/inventory/transactions" element={<Layout><InventoryTransactions /></Layout>} />
        <Route path="/inventory/maintenance" element={<Layout><InventoryMaintenance /></Layout>} />
        
        {/* Ecommerce Routes */}
        <Route path="/ecommerce" element={<Layout><EcommerceIndex /></Layout>} />
        <Route path="/ecommerce/products" element={<Layout><EcommerceProducts /></Layout>} />
        <Route path="/ecommerce/orders" element={<Layout><EcommerceOrders /></Layout>} />
        <Route path="/ecommerce/customers" element={<Layout><EcommerceCustomers /></Layout>} />
        <Route path="/ecommerce/cart" element={<Layout><EcommerceCart /></Layout>} />
        <Route path="/ecommerce/analytics" element={<Layout><EcommerceAnalytics /></Layout>} />
        
        {/* Elearning Routes */}
        <Route path="/elearning" element={<Layout><ElearningIndex /></Layout>} />
        <Route path="/elearning/courses" element={<Layout><ElearningCourses /></Layout>} />
        <Route path="/elearning/course/:id" element={<Layout><ElearningCourseDetails /></Layout>} />
        
        {/* Analytics Routes */}
        <Route path="/analytics" element={<Layout><AnalyticsIndex /></Layout>} />
        <Route path="/analytics/dashboard" element={<Layout><AnalyticsDashboard /></Layout>} />
        <Route path="/analytics/charts" element={<Layout><AnalyticsCharts /></Layout>} />
        <Route path="/analytics/reports" element={<Layout><AnalyticsReports /></Layout>} />
        
        {/* Reports Routes */}
        <Route path="/reports" element={<Layout><ReportsIndex /></Layout>} />
        
        {/* Settings Routes */}
        <Route path="/settings" element={<Layout><SettingsIndex /></Layout>} />
        <Route path="/settings/profile" element={<Layout><SettingsProfile /></Layout>} />
        <Route path="/settings/preferences" element={<Layout><SettingsPreferences /></Layout>} />
        <Route path="/settings/account" element={<Layout><SettingsAccount /></Layout>} />
        <Route path="/settings/security" element={<Layout><SettingsSecurity /></Layout>} />
        
        {/* Other Routes */}
        <Route path="/notices" element={<Layout><NoticesIndex /></Layout>} />
        <Route path="/guardians" element={<Layout><GuardiansIndex /></Layout>} />
        <Route path="/tenants" element={<Layout><TenantsIndex /></Layout>} />
        <Route path="/search" element={<Layout><SearchIndex /></Layout>} />
        <Route path="/ai-tools" element={<Layout><AIToolsModels /></Layout>} />
        <Route path="/api" element={<Layout><APIDocumentation /></Layout>} />
        <Route path="/accounts" element={<Layout><AccountsIndex /></Layout>} />
        <Route path="/assignments" element={<Layout><AssignmentsIndex /></Layout>} />
        
        {/* Demo Route */}
        <Route path="/bangla-demo" element={<Layout><BanglaDemo /></Layout>} />
        
        {/* 404 Route */}
        <Route path="*" element={<Layout><div className="p-6 text-center">Page Not Found</div></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;


