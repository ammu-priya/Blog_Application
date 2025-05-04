from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
      path('api/v1/register/', UserRegistrationView.as_view(), name='register'),
      path('api/v1/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
      path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
      path('api/v1/posts/', PostListCreateView.as_view(), name='post-list-create'),
      path('api/v1/posts/<int:pk>/', PostRetrieveUpdateDestroyView.as_view(), name='post-detail'),
      path('api/v1/public-posts/', PublicPostListView.as_view(), name='public-post-list'),
      path('api/v1/<int:post_id>/comments/', CommentCRUDView.as_view(), name='comment-list-create'),
      path('api/v1/comments/<int:pk>/', CommentCRUDView.as_view(), name='comment-detail'),
      path('api/v1/like/', LikeView.as_view(), name='like'),
  ]