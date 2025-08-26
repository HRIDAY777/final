from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, DepartmentViewSet, PositionViewSet, LeaveRequestViewSet,
    AttendanceViewSet, PayrollViewSet, PerformanceReviewViewSet,
    TrainingViewSet, RecruitmentViewSet, HRDashboardViewSet
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'payroll', PayrollViewSet)
router.register(r'performance-reviews', PerformanceReviewViewSet)
router.register(r'training', TrainingViewSet)
router.register(r'recruitment', RecruitmentViewSet)
router.register(r'dashboard', HRDashboardViewSet, basename='hr-dashboard')

app_name = 'hr'

urlpatterns = [
    path('', include(router.urls)),
]
