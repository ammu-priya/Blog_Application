from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .filters import PostFilter
from rest_framework.filters import SearchFilter          
from django.db.models import Q
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import *
from .serializers import *

class CustomTokenObtainPairView(TokenObtainPairView):
      permission_classes = [AllowAny]

      def post(self, request, *args, **kwargs):
          email = request.data.get('email')
          password = request.data.get('password')

          if not email or not password:
              return Response({
                  'error': 'Email and password are required'
              }, status=status.HTTP_400_BAD_REQUEST)

          user = authenticate(request=request, email=email, password=password)
          if not user:
              return Response({
                  'error': 'Invalid email or password'
              }, status=status.HTTP_401_UNAUTHORIZED)

          refresh = RefreshToken.for_user(user)
          return Response({
              'refresh': str(refresh),
              'access': str(refresh.access_token)
          }, status=status.HTTP_200_OK)


class UserRegistrationView(APIView):
      permission_classes = [AllowAny]

      def post(self, request, *args, **kwargs):
          username = request.data.get('username')
          email = request.data.get('email')

          if User.objects.filter(username=username).exists():
              return Response({
                  "status": "failed",
                  "response_code": status.HTTP_400_BAD_REQUEST,
                  "message": "Username is already taken."
              })

          if User.objects.filter(email=email).exists():
              return Response({
                  "status": "failed",
                  "response_code": status.HTTP_400_BAD_REQUEST,
                  "message": "Email is already taken."
              })

          serializer = UserRegistrationSerializer(data=request.data)
          if serializer.is_valid():
              serializer.save()
              return Response({
                  "status": "success",
                  "response_code": status.HTTP_201_CREATED,
                  "message": "User registered successfully"
              })
          return Response({
              "status": "failed",
              "response_code": status.HTTP_400_BAD_REQUEST,
              "message": "Validation error",
              "errors": serializer.errors
          })


class PostListCreateView(generics.ListCreateAPIView):
      serializer_class = PostSerializer
      permission_classes = [IsAuthenticated]

      def get_queryset(self):
          user = self.request.user
          search = self.request.query_params.get('search', '')
          return Post.objects.filter(author=user, is_deleted=False).filter(
              Q(title__iexact=search) | Q(content__iexact=search))
      def get(self, request, *args, **kwargs):
        try:
            user = request.user
            search = request.query_params.get('search', '')
            
            # Fetch posts created by the user, and filter by search if provided
            posts = Post.objects.filter(author=user, is_deleted=False)
            if search:
                posts = posts.filter(Q(title__iexact=search) | Q(content__iexact=search))

            # Simplified method to retrieve only required fields
            posts_data = posts.values('id', 'title', 'content', 'is_published', 'created_at', 'updated_at')

            # Adding likes count and tags separately
            for post_data in posts_data:
                post = Post.objects.get(id=post_data['id'])
                post_data['likes_count'] = post.likes.count()
                post_data['tags'] = list(post.tags.values('id', 'name'))  # Get tags for the post

            return Response({"status": "success","response_code": status.HTTP_200_OK, "data": list(posts_data)})

        except Exception as e:
            return Response({"status": "error","response_code": status.HTTP_500_INTERNAL_SERVER_ERROR, "message": "Something went wrong", "error": str(e)})


      def create(self, request, *args, **kwargs):
          try:
              author = request.user
              data = request.data

              if Post.objects.filter(author=author, title=data.get('title'), is_deleted=False).exists():
                  return Response({ "status": "failed","response_code": status.HTTP_400_BAD_REQUEST,"message": "You already have a post with this title."})

              serializer = self.get_serializer(data=data, context={'request': request})
              if serializer.is_valid():
                  serializer.save(author=author)
                  return Response({"status": "success","response_code": status.HTTP_201_CREATED,"message": "Post created successfully"})

              return Response({"status": "failed", "response_code": status.HTTP_400_BAD_REQUEST, "message": "Validation error","errors": serializer.errors})

          except Exception as e:
              return Response({ "status": "error", "response_code": status.HTTP_500_INTERNAL_SERVER_ERROR, "message": "Something went wrong", "error": str(e) })
       

class PostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
      serializer_class = PostSerializer
      permission_classes = [IsAuthenticated]
      
      def get_object(self):
        post_id = self.kwargs.get("pk")
        post = Post.objects.filter(id=post_id, author=self.request.user, is_deleted=False).first()
        if post:
            return post
        return Response({"status": "failed","response_code": status.HTTP_404_NOT_FOUND,"message": "Post not found or doesn't belong to you"})

      def get(self, request, *args, **kwargs):
        post = self.get_object()
        if isinstance(post, Response):
            return post
        serializer = PostSerializer(post)
        return Response({"status": "success","response_code": status.HTTP_200_OK,"post": serializer.data })

      def patch(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if isinstance(instance, Response):
                return instance
            serializer = PostSerializer(instance, data=request.data, partial=True)

            if serializer.is_valid():
                # Use the update method for partial updates
                serializer.update(instance, serializer.validated_data)
                return Response({"status": "success","response_code": status.HTTP_200_OK,"message": "Post updated successfully" })

            return Response({ "status": "failed","response_code": status.HTTP_400_BAD_REQUEST, "message": serializer.errors})

        except Exception as e:
            return Response({"status": "error","response_code": status.HTTP_500_INTERNAL_SERVER_ERROR,"message": "Something went wrong","error": str(e)})

      def delete(self, request, *args, **kwargs):
        post = self.get_object()
        if isinstance(post, Response):
            return post

        post.is_deleted = True
        post.save()

        return Response({"status": "success","response_code": status.HTTP_200_OK, "message": "Post deleted successfully" })


class CommentCRUDView(generics.GenericAPIView):
      serializer_class = CommentSerializer
      permission_classes = [IsAuthenticatedOrReadOnly]

      def get_queryset(self):
          return Comment.objects.filter(post_id=self.kwargs['post_id'], is_deleted=False, parent__isnull=True)

      def get(self, request, pk=None, *args, **kwargs):
          if pk:
              try:
                  comment = Comment.objects.get(pk=pk, is_deleted=False)
                  serializer = self.get_serializer(comment)
                  return Response({"status": "success","response_code": status.HTTP_200_OK,"comment": serializer.data})
              except Comment.DoesNotExist:
                  return Response({"status": "failed","response_code": status.HTTP_404_NOT_FOUND,"message": "Comment not found"})
          queryset = self.get_queryset()
          serializer = self.get_serializer(queryset, many=True)
          return Response({"status": "success","response_code": status.HTTP_200_OK,"comments": serializer.data})

      def post(self, request, *args, **kwargs):
          serializer = self.get_serializer(data=request.data)
          if serializer.is_valid():
              serializer.save(user=request.user)
              return Response({"status": "success","response_code": status.HTTP_201_CREATED,"message": "Comment created successfully","comment": serializer.data})
          return Response({"status": "failed","response_code": status.HTTP_400_BAD_REQUEST,"message": "Validation error","errors": serializer.errors})

      def put(self, request, pk=None, *args, **kwargs):
          try:
              comment = Comment.objects.get(pk=pk, user=request.user, is_deleted=False)
              serializer = self.get_serializer(comment, data=request.data, partial=True)
              if serializer.is_valid():
                  serializer.save()
                  return Response({"status": "success","response_code": status.HTTP_200_OK,"message": "Comment updated successfully","comment": serializer.data})
              return Response({"status": "failed","response_code": status.HTTP_400_BAD_REQUEST,"message": "Validation error","errors": serializer.errors})
          except Comment.DoesNotExist:
              return Response({"status": "failed","response_code": status.HTTP_404_NOT_FOUND,"message": "Comment not found or unauthorized"})

      def delete(self, request, pk=None, *args, **kwargs):
          try:
              comment = Comment.objects.get(pk=pk, user=request.user, is_deleted=False)
              comment.is_deleted = True
              comment.save()
              return Response({"status": "success","response_code": status.HTTP_200_OK,"message": "Comment deleted successfully"})
          except Comment.DoesNotExist:
              return Response({ "status": "failed", "response_code": status.HTTP_404_NOT_FOUND, "message": "Comment not found or unauthorized"})

class LikeView(generics.GenericAPIView):
      serializer_class = LikeSerializer
      permission_classes = [IsAuthenticated]

      def post(self, request, *args, **kwargs):
          post_id = request.data.get('post')
          try:
              post = Post.objects.get(id=post_id, is_deleted=False)
              like, created = Like.objects.get_or_create(user=request.user, post=post)
              if not created:
                  like.delete()
                  return Response({"status": "success","response_code": status.HTTP_200_OK,"message": "Post unliked" })
              return Response({ "status": "success","response_code": status.HTTP_201_CREATED,"message": "Post liked"})
          except Post.DoesNotExist:
              return Response({"status": "failed","response_code": status.HTTP_404_NOT_FOUND,"message": "Post not found"})


class PublicPostListView(generics.ListAPIView):
    queryset = Post.objects.filter(is_published=True)
    permission_classes = [IsAuthenticated]
    serializer_class = PublicPostSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PostFilter