from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, AuthorViewSet, BookViewSet, BorrowingViewSet,
    ReservationViewSet, FineViewSet, LibrarySettingsViewSet,
    LibraryAnalyticsViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'books', BookViewSet)
router.register(r'borrowings', BorrowingViewSet)
router.register(r'reservations', ReservationViewSet)
router.register(r'fines', FineViewSet)
router.register(r'settings', LibrarySettingsViewSet)
router.register(r'analytics', LibraryAnalyticsViewSet, basename='analytics')

app_name = 'library'

urlpatterns = [
    path('', include(router.urls)),
]
