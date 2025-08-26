from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NoticeViewSet, NoticeCategoryViewSet, NoticeAttachmentViewSet,
    NoticeRecipientViewSet, NoticeTemplateViewSet, NoticeSettingsViewSet
)

router = DefaultRouter()
router.register(r'notices', NoticeViewSet)
router.register(r'categories', NoticeCategoryViewSet)
router.register(r'attachments', NoticeAttachmentViewSet)
router.register(r'recipients', NoticeRecipientViewSet)
router.register(r'templates', NoticeTemplateViewSet)
router.register(r'settings', NoticeSettingsViewSet)

app_name = 'notices'

urlpatterns = [
    path('', include(router.urls)),
]
