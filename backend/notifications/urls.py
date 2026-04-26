from rest_framework.routers import DefaultRouter
from .views import SMSLogViewSet

router = DefaultRouter()
router.register('sms-logs', SMSLogViewSet, basename='sms-log')

urlpatterns = router.urls
