from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet, EventCategoryViewSet, EventRegistrationViewSet,
    EventScheduleViewSet, EventVenueViewSet, EventOrganizerViewSet,
    EventSponsorViewSet, EventSettingsViewSet
)

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'categories', EventCategoryViewSet)
router.register(r'registrations', EventRegistrationViewSet)
router.register(r'schedules', EventScheduleViewSet)
router.register(r'venues', EventVenueViewSet)
router.register(r'organizers', EventOrganizerViewSet)
router.register(r'sponsors', EventSponsorViewSet)
router.register(r'settings', EventSettingsViewSet)

app_name = 'events'

urlpatterns = [
    path('', include(router.urls)),
]
