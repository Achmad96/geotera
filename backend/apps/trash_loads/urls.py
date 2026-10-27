from rest_framework.routers import DefaultRouter
from .views import TrashLoadViewSet

router = DefaultRouter()
router.register(r'', TrashLoadViewSet, basename='trash-load')

urlpatterns = router.urls

