from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AcademicYearViewSet

# Create router for academic years
router = DefaultRouter()
router.register(
    r'academic-years', AcademicYearViewSet, basename='academic-year'
)

app_name = 'academic_years'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]
