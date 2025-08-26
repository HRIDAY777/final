from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Register all viewsets
router.register(r'assignments', views.AssignmentViewSet)
router.register(r'submissions', views.AssignmentSubmissionViewSet)
router.register(r'comments', views.AssignmentCommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
