from rest_framework.routers import DefaultRouter
from .views import RewardViewSet

router = DefaultRouter()
router.register(r'', RewardViewSet, basename='reward')

urlpatterns = router.urls

