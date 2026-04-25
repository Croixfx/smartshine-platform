from rest_framework.routers import DefaultRouter
from .views import BranchViewSet, ServiceTypeViewSet

router = DefaultRouter()
router.register('', BranchViewSet, basename='branch')

urlpatterns = router.urls
